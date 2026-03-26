# TerraLedger Phase 2: Upgraded System Architecture

This document outlines the complete architectural design for the Phase 2 upgradation plan, integrating decentralized file storage, advanced Role-Based Access Control (RBAC), and automated financial escrow mechanisms on a public testnet.

## 1. Upgraded High-Level Architecture Diagram

```mermaid
graph TD
    %% Define System Actors
    subgraph Actors [Network Participants]
        Admin[System Admin / Deployer]
        Notary[Government / Notary]
        Buyer[Property Buyer]
        Seller[Property Owner / Seller]
    end

    %% Define Frontend Client
    subgraph Frontend [React DApp Client]
        UI[TerraLedger UI Web App]
        IPFS_Client[IPFS HTTP Client]
        Ethers[ethers.js Library]
        MetaMask[MetaMask Wallet]
    end

    %% Define Decentralized Storage
    subgraph Storage [Decentralized Web3 Storage]
        Pinata[Pinata IPFS Gateway]
        IPFS_Net[Global IPFS Network]
    end

    %% Define Blockchain Network
    subgraph Blockchain [Public EVM Testnet e.g. Sepolia/Polygon]
        RPC[Public JSON-RPC / Infura / Alchemy]
        Contract[TerraLedger.sol Smart Contract]
        Escrow[Automated Escrow Logic]
        State[Immutable State & Event Logs]
    end

    %% Interactions
    Actors -->|Interacts with| UI
    
    %% IPFS Flow
    UI -->|Uploads PDF Deeds/Images| IPFS_Client
    IPFS_Client -->|Pins File| Pinata
    Pinata -->|Distributes| IPFS_Net
    IPFS_Client -.->|Returns Content ID Hash| UI

    %% Transaction Flow
    UI -->|Crafts Payload with IPFS Hash| Ethers
    UI -->|Requests Signature| MetaMask
    MetaMask -->|Signs Transaction| Ethers
    Ethers <-->|Broadcasts via RPC| RPC
    RPC <--> Contract

    %% Contract Internal Logic
    Contract -->|Verifies Signatures & Roles| Contract
    Contract -->|Requires Approval| Notary
    Contract <-->|Holds ETH for Payment| Escrow
    Escrow -->|Transfers Asset & ETH Atomically| State
    Contract -->|Emits Events| State

    %% Formatting
    classDef primary fill:#2d6bba,stroke:#fff,stroke-width:2px,color:#fff;
    classDef secondary fill:#2d8cba,stroke:#fff,stroke-width:2px,color:#fff;
    classDef storage fill:#144a42,stroke:#fff,stroke-width:2px,color:#fff;
    classDef chain fill:#571b7e,stroke:#fff,stroke-width:2px,color:#fff;
    
    class UI,IPFS_Client,Ethers,MetaMask primary;
    class Admin,Notary,Buyer,Seller secondary;
    class Pinata,IPFS_Net storage;
    class RPC,Contract,Escrow,State chain;
```

## 2. Architectural Components & Data Flow

### 2.1 Decentralized File Storage (IPFS)
To bypass the highly expensive computational network gas costs of soaring large documents (e.g. legal title deeds, KYC documentation) directly on-chain, the frontend will integrate **IPFS via Pinata**.
**Data Flow:**
1. A user uploads a property deed PDF on the frontend.
2. The React app triggers a POST request to Pinata's API, pinning the file to the IPFS network.
3. IPFS returns a unique, cryptographic `CID` (Content Identifier / Hash).
4. The `CID` is passed to the Smart Contract inside `registerProperty(..., string memory documentCID)`.

### 2.2 Advanced State Machine (Notary Approval)
To model absolute real-world authenticity, the smart contract state machine will expand to include a `Notary` Multi-Sig role.
**Data Flow:**
1. User registers a property. The struct status is instantiated as `PENDING_VERIFICATION`.
2. The property cannot be searched or transferred.
3. The `Notary` wallet (controlled by a decentralized oracle or secondary Admin) reviews the IPFS CID document.
4. The `Notary` signs an `approveProperty(propertyId)` transaction, shifting the state to `VERIFIED_ACTIVE`.

### 2.3 Automated Escrow Protocol 
The current property system performs zero-knowledge transfers. Phase 2 introduces financial utility.
**Data Flow:**
1. **Listing:** A verified seller invokes `listProperty(propertyId, ethPrice)`.
2. **Purchasing:** A buyer invokes `buyProperty(propertyId)` simultaneously submitting `msg.value == ethPrice`.
3. **Atomic Swaps (Escrow):** The EVM ensures atomicity: if the ETH is successfully received, the property metadata mathematically updates the `owner` to the buyer, and the `ethPrice` is forwarded to the seller within the exact same computation cycle. If anything fails, the entire transaction reverts seamlessly.

### 2.4 Network Execution (Polygon / Sepolia)
By shifting the target RPC URL in `ethers.js` from `Localhost:8545` to a public Alchemy or Infura endpoint mapping to **Polygon Amoy (L2)** or **Ethereum Sepolia (L1 Testnet)**, the DApp achieves massive scalability and global accessibility. 
