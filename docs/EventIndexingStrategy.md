# Event Indexing Optimization for TerraLedger

## Overview

TerraLedger's `TransactionHistory` page currently retrieves blockchain events by calling `contract.queryFilter()` directly against a local Ethereum node. While this works for development with a handful of records, it has serious scalability limitations that will degrade user experience and system reliability as the property registry grows.

This document explains why the current approach fails at scale, what alternatives exist, and provides a complete blueprint for integrating **The Graph** — the industry-standard decentralized indexing protocol — as TerraLedger's event retrieval backbone.

---

## The Problem: Why `queryFilter` Does Not Scale

### Current Implementation

```javascript
// src/pages/TransactionHistory.jsx (current approach)
const logsReg = await contract.queryFilter(filterReg, 0, 'latest');
const logsTrans = await contract.queryFilter(filterTrans, 0, 'latest');
```

This call instructs the RPC node to scan **every block from genesis to the current head** and filter for matching event topics. This is an `eth_getLogs` call under the hood.

### Performance Degradation at Scale

| Registry Size | Blocks to Scan | Approx. Query Time | RPC Cost |
|---|---|---|---|
| 10 properties | ~100 blocks | < 1s | Negligible |
| 1,000 properties | ~10,000 blocks | 5–15s | Moderate |
| 100,000 properties | ~1,000,000 blocks | 60–300s | **Expensive / Fails** |

### Specific Failure Modes

1. **RPC Rate Limiting**: Public Ethereum nodes (Infura, Alchemy) limit `eth_getLogs` responses to 10,000 blocks per request. A production deployment would require complex pagination logic and multiple API calls.

2. **Node Timeout**: Most JSON-RPC implementations impose a response timeout of 10–30 seconds. A full history scan of a large contract will simply fail with a timeout error.

3. **No Filtering Capability**: We can only filter by event topic and block range. We cannot efficiently query "all properties owned by address X" or "all transfers above a certain block without writing expensive client-side JavaScript loops.

4. **No Aggregations**: Computing `Total Gas Used` currently requires fetching every transaction receipt individually — an O(n) operation with n network round trips. With 10,000 transactions, this is completely infeasible.

5. **No Persistence**: Every page load re-fetches all events from scratch. There is no caching or incremental update mechanism.

---

## Solution Overview: The Graph Protocol

[The Graph](https://thegraph.com) is a decentralized protocol for indexing and querying blockchain data. It works by:

1. **Listening** for smart contract events in real-time.
2. **Indexing** those events into a PostgreSQL database according to a developer-defined schema.
3. **Exposing** a **GraphQL API** that allows the frontend to perform instant, complex, filtered, and paginated queries.

The Graph is used in production by Uniswap, Aave, ENS, Decentraland, and nearly every major dApp that displays on-chain data at scale.

---

## Architecture: How It Would Work in TerraLedger

```
┌─────────────────────────────────────────────────────────────┐
│                    CURRENT ARCHITECTURE                      │
│                                                             │
│   React Frontend  ──── eth_getLogs ────►  Hardhat / RPC Node │
│   (slow, O(n) scan)                       (scans all blocks) │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    TARGET ARCHITECTURE                       │
│                                                             │
│   Ethereum Node  ──► Graph Node (Indexer)  ──► PostgreSQL   │
│       │                    │                       │        │
│       │             (processes events        (indexed data) │
│       │              in real-time)                 │        │
│       │                                            │        │
│   React Frontend  ──── GraphQL Query ─────►  Graph Node API │
│   (instant, O(1), filterable, paginated)                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Blueprint

### Step 1: Install The Graph CLI

```bash
npm install -g @graphprotocol/graph-cli
graph init --studio terradledger-subgraph
```

### Step 2: Define the GraphQL Schema

The schema defines the data entities The Graph will index and expose. This file lives at `subgraph/schema.graphql`.

```graphql
# subgraph/schema.graphql

"""
Represents a registered property on the TerraLedger blockchain
"""
type Property @entity(immutable: false) {
  id: ID!                        # propertyId as string
  propertyId: BigInt!
  owner: Bytes!                  # current owner address
  location: String!
  area: String!
  propertyType: String!
  documentHash: String!
  isRegistered: Boolean!
  registeredAt: BigInt!          # block timestamp
  registrationTx: String!        # transaction hash
  transferCount: Int!            # number of ownership changes
  transferHistory: [OwnershipTransfer!]! @derivedFrom(field: "property")
}

"""
Represents a single ownership transfer event
"""
type OwnershipTransfer @entity(immutable: true) {
  id: ID!                        # txHash-logIndex
  property: Property!
  fromAddress: Bytes!
  toAddress: Bytes!
  blockNumber: BigInt!
  blockTimestamp: BigInt!
  transactionHash: Bytes!
  gasUsed: BigInt!
  gasPrice: BigInt!
}

"""
Aggregate statistics for the entire registry — updated on each event
"""
type RegistryStats @entity {
  id: ID!                        # Always "global"
  totalProperties: Int!
  totalTransfers: Int!
  totalGasUsed: BigInt!
  lastUpdatedBlock: BigInt!
}
```

### Step 3: Write the Subgraph Manifest

The manifest tells The Graph which contract to watch, which events to process, and which handler functions to call.

```yaml
# subgraph/subgraph.yaml
specVersion: 0.0.5
schema:
  file: ./schema.graphql

dataSources:
  - kind: ethereum
    name: TerraLedger
    network: mainnet  # or 'hardhat' for local development
    source:
      address: "0xYOUR_CONTRACT_ADDRESS"
      abi: TerraLedger
      startBlock: 0  # The block your contract was deployed at
    mapping:
      kind: ethereum/events
      apiVersion: 0.0.7
      language: wasm/assemblyscript
      entities:
        - Property
        - OwnershipTransfer
        - RegistryStats
      abis:
        - name: TerraLedger
          file: ../src/contractConfig.json
      eventHandlers:
        - event: PropertyRegistered(indexed uint256,indexed address,string,string,string,string)
          handler: handlePropertyRegistered
        - event: OwnershipTransferred(indexed uint256,indexed address,indexed address)
          handler: handleOwnershipTransferred
      file: ./src/mapping.ts
```

### Step 4: Write the Event Handler Mappings

These handlers are written in **AssemblyScript** (a TypeScript-like language that compiles to WebAssembly) and run inside The Graph's indexing runtime.

```typescript
// subgraph/src/mapping.ts
import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
  PropertyRegistered,
  OwnershipTransferred as OwnershipTransferredEvent,
} from "../generated/TerraLedger/TerraLedger";
import { Property, OwnershipTransfer, RegistryStats } from "../generated/schema";

// Called every time a PropertyRegistered event is emitted
export function handlePropertyRegistered(event: PropertyRegistered): void {
  // Create a new Property entity
  let property = new Property(event.params.propertyId.toString());
  property.propertyId = event.params.propertyId;
  property.owner = event.params.owner;
  property.location = event.params.location;
  property.area = event.params.area;
  property.propertyType = event.params.propertyType;
  property.documentHash = event.params.documentHash;
  property.isRegistered = true;
  property.registeredAt = event.block.timestamp;
  property.registrationTx = event.transaction.hash.toHex();
  property.transferCount = 0;
  property.save();

  // Update aggregate statistics
  let stats = RegistryStats.load("global");
  if (!stats) {
    stats = new RegistryStats("global");
    stats.totalProperties = 0;
    stats.totalTransfers = 0;
    stats.totalGasUsed = BigInt.fromI32(0);
  }
  stats.totalProperties += 1;
  stats.totalGasUsed = stats.totalGasUsed.plus(
    event.transaction.gasPrice.times(event.receipt!.gasUsed)
  );
  stats.lastUpdatedBlock = event.block.number;
  stats.save();
}

// Called every time an OwnershipTransferred event is emitted
export function handleOwnershipTransferred(event: OwnershipTransferredEvent): void {
  // Update the Property's current owner
  let property = Property.load(event.params.propertyId.toString());
  if (!property) return;
  property.owner = event.params.newOwner;
  property.transferCount += 1;
  property.save();

  // Create an immutable transfer record
  let transferId = event.transaction.hash.toHex() + "-" + event.logIndex.toString();
  let transfer = new OwnershipTransfer(transferId);
  transfer.property = property.id;
  transfer.fromAddress = event.params.previousOwner;
  transfer.toAddress = event.params.newOwner;
  transfer.blockNumber = event.block.number;
  transfer.blockTimestamp = event.block.timestamp;
  transfer.transactionHash = event.transaction.hash;
  transfer.gasUsed = event.receipt!.gasUsed;
  transfer.gasPrice = event.transaction.gasPrice;
  transfer.save();

  // Update aggregate statistics
  let stats = RegistryStats.load("global")!;
  stats.totalTransfers += 1;
  stats.totalGasUsed = stats.totalGasUsed.plus(
    event.transaction.gasPrice.times(event.receipt!.gasUsed)
  );
  stats.lastUpdatedBlock = event.block.number;
  stats.save();
}
```

### Step 5: Query the Subgraph from the Frontend

Once the subgraph is deployed, `TransactionHistory.jsx` can replace all the `queryFilter` calls with a single, instant GraphQL query:

```javascript
// src/utils/graphClient.js
const SUBGRAPH_URL = "https://api.studio.thegraph.com/query/YOUR_SUBGRAPH_ID/terradledger/v0.0.1";

export async function fetchTransactionHistory(filter = 'all', page = 0, pageSize = 20) {
  const query = `{
    # Get aggregate stats in one call
    registryStats(id: "global") {
      totalProperties
      totalTransfers
      totalGasUsed
    }
    
    # Get paginated, filtered transactions
    ownershipTransfers(
      first: ${pageSize}
      skip: ${page * pageSize}
      orderBy: blockTimestamp
      orderDirection: desc
      ${filter === 'registration' ? '# No transfers in registration-only mode' : ''}
    ) {
      id
      transactionHash
      blockNumber
      blockTimestamp
      gasUsed
      gasPrice
      fromAddress
      toAddress
      property {
        propertyId
        location
      }
    }
  }`;

  const res = await fetch(SUBGRAPH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  
  return (await res.json()).data;
}
```

This single `fetch` replaces:
- 2x `contract.queryFilter()` calls
- N x `provider.getBlock()` calls
- N x `provider.getTransaction()` calls
- N x `provider.getTransactionReceipt()` calls

Where N is the total number of historical transactions. Query time goes from **O(n) with n network round-trips** to **O(1) with a single HTTP request**.

---

## Advanced Query Capabilities Unlocked

With The Graph, our frontend gains capabilities that are impossible with raw `eth_getLogs`:

### 1. Filter by Owner
```graphql
{
  properties(where: { owner: "0xABC..." }) {
    propertyId
    location
    transferCount
  }
}
```

### 2. Full-Text Property Search
With The Graph's full-text search feature:
```graphql
{
  propertySearch(text: "Downtown Kolkata") {
    propertyId
    location
    area
  }
}
```

### 3. Gas Analytics for the Dashboard
```graphql
{
  registryStats(id: "global") {
    totalGasUsed    # Pre-aggregated — no N round-trips needed!
    totalProperties
    totalTransfers
  }
}
```

### 4. Properties with Most Transfers (Leaderboard)
```graphql
{
  properties(orderBy: transferCount, orderDirection: desc, first: 10) {
    propertyId
    location
    transferCount
    owner
  }
}
```

---

## Local Development: Running a Graph Node

For local development against the Hardhat network:

```bash
# 1. Clone and run a local Graph Node
git clone https://github.com/graphprotocol/graph-node
cd graph-node/docker
docker-compose up

# 2. Create and deploy the subgraph locally
cd ../../terradledger-subgraph
graph create --node http://localhost:8020/ terradledger
graph deploy --node http://localhost:8020/ --ipfs http://localhost:5001 terradledger
```

The local Graph Node will connect to your Hardhat node at `http://127.0.0.1:8545`, start indexing from block 0, and expose a GraphQL playground at `http://localhost:8000/subgraphs/name/terradledger`.

---

## Production Deployment: The Graph Hosted Service vs. Decentralized Network

| Option | Cost | Decentralization | SLA |
|---|---|---|---|
| **Graph Studio (Hosted)** | Free up to 100K queries/month | Centralized (hosted by The Graph team) | Best for early production |
| **Subgraph Studio → Network** | GRT token payment per query | Fully decentralized (multiple indexers) | Production-grade |
| **Self-hosted Graph Node** | Infrastructure cost only | Centralized to you | Full control |

For TerraLedger's current scale, **Graph Studio (Hosted)** is the right starting point with a clear migration path to the Decentralized Network.

---

## Why We Should Implement This

The current `queryFilter` approach is a development shortcut, not a production strategy. The Graph integration:

1. **Eliminates O(n) query complexity** — all historical data is pre-indexed and available in milliseconds regardless of chain size.
2. **Enables powerful filtering** — property search by owner, location, document hash, or date range becomes trivial.
3. **Unblocks the Analytics Dashboard** — the `RegistryStats` entity gives us free, real-time aggregate metrics (total gas, total properties, total transfers) without any additional computation.
4. **Reduces RPC costs** — every `queryFilter`, `getBlock`, and `getTransactionReceipt` call has a cost on services like Infura/Alchemy. A subgraph replaces all of these with a single GraphQL endpoint.
5. **Is the industry standard** — The Graph is the indexing layer for Uniswap, Compound, ENS, and every other production dApp that needs historical on-chain data.
