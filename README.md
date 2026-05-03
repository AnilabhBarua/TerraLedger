# TerraLedger: Decentralized Land Registry System

[![Solidity](https://img.shields.io/badge/Solidity-v0.8.20-363636?logo=solidity)](https://soliditylang.org/)
[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://reactjs.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-Ethereum-yellow?logo=ethereum)](https://hardhat.org/)
[![IPFS](https://img.shields.io/badge/IPFS-Pinata-65C2CB?logo=ipfs)](https://ipfs.tech/)

TerraLedger is a decentralized application (DApp) designed to modernize land record management by replacing centralized, paper-heavy systems with a transparent, secure, and immutable blockchain ledger. Built on the Ethereum network and leveraging IPFS for decentralized storage, it automates property registration, eliminates intermediaries, and prevents data tampering.

## 📖 Project Overview

Traditional land registries suffer from inefficiencies, lack of transparency, and vulnerability to data tampering. TerraLedger solves these issues by creating a single source of truth on the blockchain. 
By utilizing a hybrid storage model (Ethereum + IPFS), TerraLedger ensures absolute data immutability and high availability while remaining economically feasible.

- **Immutable Records**: Once registered, property data cannot be altered or deleted.
- **Decentralized Security**: Distributed ledger technology prevents single points of failure.
- **Smart Contract Automation**: Logic for registration and transfer is enforced by code, not clerks.

## 🛠 Tech Stack

- **Blockchain Layer**: Solidity (v0.8.20), Ethereum Sepolia Testnet, OpenZeppelin AccessControl
- **Decentralized Storage**: InterPlanetary File System (IPFS) via Pinata API
- **Development Framework**: Hardhat, Chai
- **Frontend Interface**: React.js (v18.x) powered by Vite
- **Web3 Interaction**: Ethers.js (v6)
- **Authentication**: MetaMask (Wallet-based identity management)
- **Hosting**: Cloudflare Pages

## ✨ Core Features & Technical Highlights

### 1. Advanced Role-Based Access Control (RBAC)
TerraLedger eschews simple ownership models for OpenZeppelin’s `AccessControl` to accurately mirror real-world legal hierarchies:
- **Chief Authority**: Supreme administrative level. Can manage the network and assign or revoke Registrar roles via the `RoleManager` interface.
- **Land Registrar**: The operational authority. Only personnel with this role can mint new land titles, approve property transfers, and submit document corrections.
- **Property Owner / Citizen**: Everyday users who can view assets, initiate transfers, and mathematically verify public records.

### 2. Hybrid Storage & IPFS Document Handling
To maintain economic feasibility (gas optimization), heavy documents (PDFs/Images of physical land deeds) are kept off-chain, while their cryptographic proofs are stored on-chain. Documents are securely uploaded to the IPFS network, and the resulting Content Identifier (CID) is immutably stored in the smart contract's `documentHash` field.

### 3. Zero-Trust Document Verification
TerraLedger allows anyone to mathematically verify a physical deed without trusting the government or the system itself.
- **Local Hashing**: The user selects a local file which is hashed entirely client-side using SHA-256.
- **Remote Fetching & Comparison**: The official document is fetched from IPFS using the on-chain CID and hashed. If the local hash matches the IPFS hash, the document is proven authentic and untampered.

### 4. Secure Property Transfer Escrow Workflow
A dual-signature "Trustless Escrow" mechanism prevents unilateral fraudulent transfers:
- **Transfer Request**: The current owner securely flags the property as pending and designates a buyer's wallet address.
- **Registrar Approval**: An authorized Land Registrar must validate the request and formally finalize the ledger transition to the new owner.

### 5. Auditable Document Corrections
Registrars can fix data-entry errors using the `updatePropertyDocument` function. This overwrites the IPFS CID and explicitly emits a `PropertyDocumentUpdated` event, creating an immutable on-chain audit trail of the correction.

### 6. Wallet-less High Availability
To support citizens without crypto-wallets who wish to view public records, TerraLedger implements a dynamic fallback RPC mechanism. If MetaMask is unavailable, the application seamlessly routes through an unrestricted Public node, allowing massive historical queries without rate limits.

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [MetaMask](https://metamask.io/) browser extension

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd TerraLedger
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the local Hardhat node:
   ```bash
   npx hardhat node
   ```

4. In a new terminal, deploy the smart contracts to the local network:
   ```bash
   npx hardhat ignition deploy ignition/modules/LandRegistryModule.js --network localhost
   ```

5. Start the frontend application:
   ```bash
   npm run dev
   ```

## 👥 Authors

- **Anilabh Barua**
- **Rishikesh Verma**
- **Guided by**: Dr. Satyajit Sarmah, Gauhati University
