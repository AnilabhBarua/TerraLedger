# TerraLedger: Decentralized Land Registry System

[![Solidity](https://img.shields.io/badge/Solidity-v0.8.20-363636?logo=solidity)](https://soliditylang.org/)
[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://reactjs.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-Ethereum-yellow?logo=ethereum)](https://hardhat.org/)
[![IPFS](https://img.shields.io/badge/IPFS-Pinata-65C2CB?logo=ipfs)](https://ipfs.tech/)

**🌍 Live Application:** [https://terraledger.pages.dev](https://terraledger.pages.dev/)

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
- **State & Theme Management**: React Context API (with localStorage persistence + system theme detection)
- **Web3 Interaction**: Ethers.js (v6)
- **Authentication & Roles**: MetaMask (Wallet-based identity verification via custom live on-chain hooks)
- **Hosting**: Cloudflare Pages

## ✨ Core Features & Technical Highlights

### 1. Advanced Role-Based Access Control (RBAC)
TerraLedger eschews simple ownership models for OpenZeppelin’s `AccessControl` to accurately mirror real-world legal hierarchies:
- **Chief Authority**: Supreme administrative level. Can manage the network and assign or revoke Registrar roles via the upgraded **Admin Dashboard** (`RoleManager` interface).
- **Land Registrar**: The operational authority. Only personnel with this role can mint new land titles, approve property transfers, and submit document corrections.
- **Property Owner / Citizen**: Everyday users who can view assets, initiate transfers, and mathematically verify public records.

### 2. Upgraded Administrative Dashboard & Role Manager
The Admin Dashboard (`RoleManager`) has been completely overhauled to offer a high-fidelity monitoring and control interface:
- **Live Ecosystem Statistics**: Displays real-time counts of total properties registered, pending transfers, and active Land Registrars.
- **Dynamic Registrar Audits**: Compiles a real-time table of active Land Registrars on-the-fly by parsing historic `RoleGranted` and `RoleRevoked` smart contract events.
- **Direct Governance Tools**: Allows the Chief Authority to grant new Registrar roles or revoke existing ones directly from the tables with intuitive inline actions and interactive, responsive feedback.

### 3. Dual-Theme Engine (System-Aware Dark & Light Modes)
The application includes a premium styling system that allows users to toggle between vibrant, modern light and dark modes:
- **Intelligent Default**: Detects and respects the user's OS preference (`prefers-color-scheme`) on initial load.
- **Persistent Preferences**: Stores selection seamlessly in `localStorage` so choices are remembered across sessions.
- **High-Fidelity Aesthetics**: Leverages custom HSL-based CSS variables, frosted glass navigation menus, smooth transition micro-animations, and vibrant gradients to offer an immersive, premium user experience in both modes.

### 4. Zero-Trust Document Verification & IPFS Storage
To maintain economic feasibility (gas optimization), heavy documents (PDFs/Images of physical land deeds) are kept off-chain, while their cryptographic proofs are stored on-chain. Documents are securely uploaded to the IPFS network, and the resulting Content Identifier (CID) is immutably stored in the smart contract's `documentHash` field.
TerraLedger allows anyone to mathematically verify a physical deed without trusting the government or the system itself:
- **Local Hashing**: The user selects a local file which is hashed entirely client-side using SHA-256.
- **Remote Fetching & Comparison**: The official document is fetched from IPFS using the on-chain CID and hashed. If the local hash matches the IPFS hash, the document is proven authentic and untampered.

### 5. High-Performance Event Chunking & RPC Limit Bypass
Modern RPC nodes (such as Alchemy or Infura) enforce strict event query limitations, capping searches to a maximum block range (e.g., 50,000 blocks). 
- **Sequential Block Parsing**: TerraLedger implements a custom `fetchEventsChunked` helper (`src/utils/chunkedProvider.js`) to seamlessly query the blockchain in sequential block chunks.
- **Zero Query Failure**: Ensures historical events (like transaction histories, role changes, and audit logs) load instantly and completely, regardless of the RPC provider constraints.

### 6. Live On-Chain Access Control Verification
To eliminate the vulnerability of trusting client-cached data:
- **Direct Hook-Based Validation**: The `useWalletRoles` hook continuously queries the Sepolia testnet to verify the active wallet's RBAC privileges directly on-chain.
- **Dynamic State Refresh**: Replaces static state flags with live queries, ensuring instantaneous visual updates whenever a user changes MetaMask accounts or gets assigned a new role.

### 7. Secure Property Transfer Escrow Workflow
A dual-signature "Trustless Escrow" mechanism prevents unilateral fraudulent transfers:
- **Transfer Request**: The current owner securely flags the property as pending and designates a buyer's wallet address.
- **Registrar Approval**: An authorized Land Registrar must validate the request and formally finalize the ledger transition to the new owner.

### 8. Auditable Document Corrections
Registrars can fix data-entry errors using the `updatePropertyDocument` function. This overwrites the IPFS CID and explicitly emits a `PropertyDocumentUpdated` event, creating an immutable on-chain audit trail of the correction.

### 9. Wallet-less High Availability & Crash Proofing
To support citizens without crypto-wallets who wish to view public records, TerraLedger implements a dynamic fallback RPC mechanism:
- **Unrestricted Public Node Routing**: If MetaMask is unavailable, the application seamlessly routes through an unrestricted Public node, allowing massive historical queries without rate limits.
- **Bulletproof Error Boundaries**: Robust null-check handling across all screens prevents connection-related page crashes and handles wallet disconnections gracefully.

### 10. Comprehensive Mobile Responsiveness
Every layout, screen, and component has been systematically overhauled for full mobile and tablet responsiveness:
- **Fluid Layouts**: Grids collapse, text scales dynamically (utilizing modern CSS rules like `clamp()`), and navigation components collapse elegantly.
- **Target-Friendly Elements**: Spacing, margins, and tap areas are designed to adapt flawlessly from 4K desktop screens down to 400px mobile devices.

## 🚀 Getting Started

### 🌍 Accessing the Live Network (Sepolia Testnet)
The project is currently deployed live on the Ethereum Sepolia testnet. 
1. Visit the live site: [terraledger.pages.dev](https://terraledger.pages.dev/)
2. Switch your MetaMask network to **Sepolia**.
3. *Note: You can view the transaction history and public records without connecting a wallet, thanks to the public RPC fallback mechanism.*

### 💻 Local Development Setup

#### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)
- [MetaMask](https://metamask.io/) browser extension

#### Installation

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
