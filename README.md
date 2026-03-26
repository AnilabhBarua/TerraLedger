# TerraLedger: A Blockchain-Based Land Registry System

TerraLedger is a decentralized application (DApp) designed to modernize land record management by replacing centralized, paper-heavy systems with a transparent, secure, and immutable blockchain ledger. Built on the Ethereum network, it leverages smart contracts to automate property registration and ownership transfers, eliminating intermediaries and preventing fraud.

## Project Overview
Traditional land registries suffer from inefficiencies, lack of transparency, and vulnerability to data tampering. TerraLedger solves these issues by creating a single source of truth on the blockchain.

- **Immutable Records**: Once registered, property data cannot be altered or deleted.
- **Decentralized Security**: Distributed ledger technology prevents single points of failure.
- **Smart Contract Automation**: Logic for registration and transfer is enforced by code, not clerks.

## 🛠 Tech Stack
This project utilizes a modern Web3 development stack:
- **Blockchain Layer**: Solidity (v0.8.20), Ethereum Virtual Machine (EVM), OpenZeppelin AccessControl
- **Development Framework**: Hardhat (for compilation, deployment, and local testing)
- **Frontend Interface**: React.js (via Vite)
- **Blockchain Interaction**: Ethers.js
- **Authentication**: MetaMask (Wallet-based identity management)

## Core Features

### 1. Advanced Role-Based Access Control (RBAC)
The system currently utilizes OpenZeppelin's `AccessControl` to distinguish between three distinct tiers of users:
- **Chief Authority**: The highest administrative level. Can manage the network and assign or revoke Registrar roles.
- **Land Registrar**: Authorized personnel capable of minting new land titles and approving property transfers.
- **Property Owner / Citizen**: Everyday users who can view their assets, verify public immutable records, and initiate property transfers to buyers.

### 2. Secure Property Registration
Only authorized Land Registrars can execute the `registerProperty` function. This securely mints a new land title on the blockchain containing:
- Unique Property ID
- Location & Physical Description (Area & Type)
- Initial Owner's Wallet Address
- Registration Epoch Timestamp 

### 3. Multi-Step Ownership Transfer Workflow
To ensure rigorous oversight and prevent unilateral fraudulent transfers, TerraLedger employs a strictly verified request-to-approval transfer workflow:
- **Transfer Request**: Property owners securely initiate a `requestTransfer`, designating a new buyer's wallet address.
- **Registrar Approval**: The property enters a "Pending" validation state. An authorized Land Registrar must review and execute `approveTransfer` to formally finalize the ledger transition.

### 4. Wallet-Based Authentication
TerraLedger entirely eliminates traditional usernames and passwords. Users authenticate via MetaMask, utilizing cryptographic signatures to securely prove their identity and system roles instantly.

## Future Roadmap (Phase 2 & Beyond)
The system successfully transitioned from a mock-data prototype to a live smart contract interface. The current and upcoming roadmap focuses on:
- **IPFS Document Handling**: Linking off-chain PDF or image documents of physical land deeds securely to the blockchain via Pinata API.
- **Document Hash Verification**: Ensuring uploaded physical copies match the on-chain SHA-256 integrity hash footprint.
- **Mobile Integration**: Developing a native Android application (React Native/Kotlin) for on-the-go property auditing.

## Authors
- Anilabh Barua
- Rishikesh Verma
- Guided by: Dr. Satyajit Sarmah, Gauhati University
