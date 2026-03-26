# TerraLedger: Architecture & Phase 2 Proposal

## 1. System Architecture (Phase 1)
The current architecture of TerraLedger operates on a standard Web3 Decentralized Application (DApp) model. It decouples the frontend user interface from the backend state, entirely relying on the Ethereum Virtual Machine (EVM) for logic and data validation.

```mermaid
graph TD
    subgraph Frontend Client
        React[React.js UI]
        Ethers[ethers.js Library]
        MetaMask[MetaMask Wallet Extension]
    end

    subgraph Blockchain Network (Hardhat / Ethereum)
        RPC[JSON-RPC Connection]
        SmartContract[TerraLedger.sol Smart Contract]
        State[Immutable State & Event Logs]
    end

    React -->|Reads Blockchain State| Ethers
    React -->|Prompts Cryptographic Signature| MetaMask
    MetaMask -->|Signs & Broadcasts Tx| Ethers
    Ethers <-->|JSON-RPC via Provider| RPC
    RPC <--> SmartContract
    SmartContract -->|Mutates| State
    SmartContract -->|Emits Audit Events| State
```

### Component Breakdown
- **Presentation Layer (React):** Renders the user-facing interface, manages local component state, and formats raw blockchain data for human consumption.
- **Provider/Signer Layer (MetaMask & ethers.js):** MetaMask acts as the secure vault for the user's private keys and authorizes transactions. `ethers.js` crafts the transaction payload and decodes the ABI bytes returning from the network.
- **Execution Layer (Hardhat Node):** Processes transactions, validates cryptography, deducts network gas, and executes the Solidity bytecode.
- **Persistence Layer (Smart Contract State):** The `properties` mapping array acts as the active database. The `PropertyRegistered` and `OwnershipTransferred` events act as the historical, tamper-proof audit trail.

---

## 2. Proposed Phase 2 Implementations

Since Phase 1 successfully established TerraLedger as a mathematically secure Web3 DApp, Phase 2 should focus on advanced blockchain capabilities that would make this an incredibly impressive 8th-semester major project. 

### Feature 1: IPFS Document Storage (Decentralized File Storage)
- **Concept:** Currently, property metadata (location, area) is stored on-chain, but real estate requires heavy legal documents (Title Deeds, Blueprints, Photos). Storing massive files directly on Ethereum is impossibly expensive.
- **Implementation:** Integrate **IPFS (InterPlanetary File System)** using a provider like Pinata. Users can upload legal PDFs to IPFS, and the resulting cryptographic `CID` (Hash Identifier) is saved inside the `TerraLedger.sol` contract. 
- **Academic Value:** Demonstrates advanced knowledge of combining multiple decentralized protocols (Ethereum + IPFS) to solve the blockchain storage limitation.

### Feature 2: Decentralized Escrow & Purchasing (Smart Contract Marketplace)
- **Concept:** Right now, ownership transfers are arbitrary and free. True real estate platforms involve monetary exchange.
- **Implementation:** Create a `buyProperty(uint256 propertyId)` payable function. Owners can list a property for a certain ETH price. Buyers send ETH directly to the contract. The contract automatically transfers the ETH to the seller and the property ownership to the buyer in *one atomic transaction*.
- **Academic Value:** Introduces financial mechanics, `payable` modifiers, and zero-trust automated escrow environments (the core value proposition of Ethereum).

### Feature 3: Multi-Signature Notary Role (Advanced RBAC)
- **Concept:** Real-world property registration requires government validation, not just a single decentralized admin.
- **Implementation:** Introduce a secondary `Notary` or `Government` role. When a user registers a property, its status is initially set to `Pending Verification`. A Notary wallet must review and invoke an `approveProperty()` function before the property is officially active, searchable, and transferable.
- **Academic Value:** Mimics real-world legal workflows and demonstrates complex multi-actor contract state machines.

### Feature 4: Public Testnet Deployment
- **Concept:** A local Hardhat node is excellent for development, but a true Web3 application is globally accessible.
- **Implementation:** Transition the Hardhat deployment scripts to deploy the smart contract onto the **Sepolia Testnet** or **Polygon Amoy Testnet**.
- **Academic Value:** Moving from a local simulation to an actual globally accessible public testnet is the ultimate proof of a production-ready DApp. Anyone in the world with MetaMask could interact with your project.
