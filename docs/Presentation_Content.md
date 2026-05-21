# TerraLedger: PowerPoint Presentation Content

**Title Slide:**
- **Title:** TerraLedger: A Blockchain-Based Land Registry System
- **Authors:** Anilabh Barua, Rishikesh Verma
- **Guided by:** Dr. Satyajit Sarmah, Gauhati University

---

## 1. Introduction

**Slide: Basic Introduction**
- **What is TerraLedger?**
  - A decentralized application (DApp) designed to modernize land record management.
  - Replaces centralized, paper-heavy systems with a transparent, secure, and immutable blockchain ledger.
  - Built on the Ethereum network, utilizing smart contracts to eliminate intermediaries.

**Slide: Problem Statement**
- Traditional land registries suffer from several critical inefficiencies:
  - **Single Point of Failure:** Centralized databases are vulnerable to hacks, server downtime, and data loss.
  - **Lack of Transparency:** It is difficult for citizens to easily access and verify land records independently.
  - **High Susceptibility to Fraud:** Paper documents and centralized digital entries can be forged, manipulated, or tampered with by corrupt administrators.
  - **Bureaucratic Bottlenecks:** Time-consuming processes relying on manual verification.

**Slide: Objective**
- **Core Goal:** To solve these issues by creating a single source of truth on the blockchain.
- **Key Objectives:**
  - Automate property registration and ownership transfers using Smart Contracts.
  - Ensure **Immutable Records** that cannot be altered or deleted once registered.
  - Implement **Decentralized Security** to prevent single points of failure.
  - Completely replace traditional trust-based backend servers with cryptographic proofs.

---

## 2. Related Works

**Slide: Existing Solutions and Their Flaws**
- **Existing Works:** Traditional centralized relational databases (e.g., standard government portals) and early-stage localized digital registries.
- **Pros:** Familiar user interfaces, fast query times, and easy to update.
- **Cons (The Flaws):** 
  - Prone to unauthorized database modifications (an admin can secretly alter a record).
  - Requires 100% trust in the central authority.
  - Vulnerable to data silos and unauthorized access.

**Slide: What We Have Solved**
- **Transitioning from Trust to Math:** TerraLedger solves the "Trust" and "Immutability" issues.
- **Our Solutions:**
  - **Eliminated Data Tampering:** Smart Contract state is permanent and cannot be altered even by the developers.
  - **Prevented Fraudulent Transfers:** Implemented a rigorous **Multi-Step Ownership Transfer Workflow** (Request from Owner $\rightarrow$ Approval from Registrar).
  - **Secure Identity Management:** Replaced easily hackable passwords with Web3 Wallet-based authentication (MetaMask), using cryptographic signatures.

---

## 3. Methodology

**Slide: Step-by-Step Building**
- **Step 1: Smart Contract Development (Solidity)**
  - Developed `TerraLedger.sol` (v0.8.20) with Role-Based Access Control (Authority, Registrar, Property Owner).
- **Step 2: Local Blockchain Testing (Hardhat)**
  - Utilized the Hardhat framework to compile, test, and deploy smart contracts on a local development node.
- **Step 3: Decentralized Storage Integration (IPFS)**
  - Integrated IPFS (via Pinata API) to securely upload physical property documents.
  - The resulting cryptographic hash (CID) is stored permanently on the blockchain.
- **Step 4: Frontend Development (React & Vite)**
  - Built a dynamic UI using React.js.
  - Connected the frontend directly to the Ethereum network using `ethers.js` (no traditional backend API required).

---

## 4. Implementation

**Slide: Working Environment Implementation**
- **Smart Contract Deployment:** 
  - Deployed the immutable smart contract to the public **Ethereum Sepolia Testnet**.
  - Node communication is handled via the **Alchemy RPC Node**.
- **Frontend Hosting:** 
  - Deployed the React application globally using **Cloudflare Pages** for high availability.
- **Real-World Application Flow:**
  - Users authenticate by connecting their MetaMask wallet.
  - Authorized **Registrars** mint new land titles, upload deeds to IPFS, and save the hash to the blockchain.
  - **Property Owners** securely request transfers to buyers.
  - Registrars review and approve transfers on-chain, finalizing the ledger transition.

---

## 5. Experiment and Result

**Slide: Experiment Overview**
- Successfully deployed a fully functional DApp, entirely replacing a traditional backend server with Ethereum smart contracts.
- Processed end-to-end property registrations and multi-step transfers securely on the Sepolia testnet.
- Integrated decentralized storage (IPFS) seamlessly for tamper-proof document handling.

**Slide: 5.1 Comparison with Existing Works**
| Feature | Traditional Registry | TerraLedger (Our Project) |
| :--- | :--- | :--- |
| **Data Storage** | Centralized Server | Decentralized Ethereum Network |
| **Record Integrity** | Modifiable by Database Admin | **100% Immutable** (Cannot be altered) |
| **Document Verification**| Manual visual inspection | **Cryptographic Hash** (IPFS CID) |
| **Security** | Username / Password | **Public-Key Cryptography** (MetaMask) |
| **Trust Model** | Trust the Authority | **Trust the Code** (Smart Contracts) |

**Slide: 5.2 Benefits of Our Project**
- **Transparency:** Anyone can easily verify public records on the blockchain.
- **Security:** Distributed ledger technology inherently prevents single points of failure.
- **Automation:** The complex logic for registration and transfer is strictly enforced by code, not by error-prone human clerks.
- **Reduced Fraud:** The combination of a strict Request-to-Approval workflow and immutable IPFS document hashes guarantees that land deeds cannot be faked or unilaterally stolen.

**Slide: 5.3 Summary and Justification**
- **Summary:** TerraLedger successfully demonstrates the feasibility of moving critical government infrastructure (like land registries) to a modern Web3 stack.
- **Justification:** The inherent properties of blockchain—immutability, transparency, and decentralization—make it the perfect technological fit to combat systemic fraud and inefficiency in land management.
- **Future Roadmap:** Expanding to native mobile applications (React Native) for on-the-go auditing, and advanced document hash verification to bridge physical papers with digital assets.
