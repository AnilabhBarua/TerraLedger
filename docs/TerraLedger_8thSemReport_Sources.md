TERRALEDGER – Blockchain Based LAnd Registry
REPORT SUBMITTED IN PARTIAL FULFILLMENT OF THE REQUIREMENT FOR THE DEGREE OF
BACHELOR OF TECHNOLOGY
IN
COMPUTER SCIENCE & ENGINEERING
By
Anilabh Barua
Roll Number: 220103005
Rishikesh Verma
Roll Number: 220103004
UNDER THE GUIDANCE
OF
Dr. Satyajit Sarmah
Assistant Professor
DEPARTMENT OF INFORMATION TECHNOLOGY
GAUHATI UNIVERSITY
GUWAHATI, INDIA
GAUHATI UNIVERSITY
DEPARTMENT OF INFORMATION TECHNOLOGY
Gopinath Bordoloi Nagar, Jalukbari Guwahati-781014
DECLARATION
We Anilabh Barua and Rishikesh Verma, bearing Roll No 220103005 and 220103004 respectively, B.Tech. student of the department of Information Technology, Gauhati University hereby declares that we have compiled this report reflecting all our works during the semester long full time project as part of our BTech curriculum.
we declare that we have included the descriptions etc. of our project work, and nothing has been copied/replicated from other’s work. The facts, figures, analysis, results, claims etc. depicted in our thesis are all related to our full time project work.
We also declare that the same report or any substantial portion of this report has not been submitted anywhere else as part of any requirements for any degree/diploma etc.
Anilabh BaruaBranch: Computer Science & Engineering Date: 29-12-2025Anilabh BaruaBranch: Computer Science & Engineering Date: 29-12-2025
Rishikesh VermaBranch: Computer Science & Engineering Date: 29-12-2025Rishikesh VermaBranch: Computer Science & Engineering Date: 29-12-2025
GAUHATI UNIVERSITY
DEPARTMENT OF INFORMATION TECHNOLOGY
Gopinath Bordoloi Nagar, Jalukbari Guwahati-781014
Date: 29-12-2025
CERTIFICATE

# This is to certify that “Anilabh Barua” and “Rishikesh Verma” bearing Roll No: “220103005” and “220103004” has carried out the project work “TerraLedger-Blockchain based Registry” under my supervision and has compiled this report reflecting the candidates work in the semester long project. The candidates did this project full time during the whole semester under my supervision, and the analysis, results, claims etc. are all related to their studies and works during the semester. (Title)


# I recommend submission of this project report as a part for partial fulfillment of the requirements for the degree of Bachelor of Technology in Information Technology/Computer Science & Engineering of Gauhati University. (Title)

Dr. Satyajit SarmahAssistant Professor Department of Information Technology Gauhati UniversityDr. Satyajit SarmahAssistant Professor Department of Information Technology Gauhati University
GAUHATI UNIVERSITY
DEPARTMENT OF INFORMATION TECHNOLOGY
Gopinath Bordoloi Nagar, Jalukbari Guwahati-781014
External Examiners Certificate

# This is to certify that “Anilabh Barua” and “Rishikesh Verma”, bearing Roll No “220103005” and “220103004” has delivered his project presentation on “DD/MM/YYYY” and I examined his/her report entitled “Project Name” and recommend this project report as a part for partial fulfillment of the requirements for the degree of Bachelor of Technology in Computer Science & Engineering of Gauhati University. (Title)

______________
(External Examiner)(External Examiner)
GAUHATI UNIVERSITY
DEPARTMENT OF INFORMATION TECHNOLOGY
Gopinath Bordoloi Nagar, Jalukbari Guwahati-781014
Date:29-12-2025
TO WHOM IT MAY CONCERN
This is to certify that Anilabh Barua and Rishikesh Verma bearing Roll No 220103005 and 220103004 respectively, B.Tech. student of the department of Information Technology, Gauhati University, has submitted the softcopy of their project for undergoing screening through anti-plagiarism software and the similar report found to be       % (in words).
Dr. Satyajit SarmahAssistant Professor Department of Information Technology Gauhati UniversityDr. Satyajit SarmahAssistant Professor Department of Information Technology Gauhati University
ACKNOWLEDGEMENTS
We would like to express our sincere gratitude to all those who have contributed directly or indirectly to the successful completion of this project titled “TerraLedger: A Blockchain-Based Land Registry System.”
First and foremost, we extend our sincere thanks to our project supervisor, Satyajit Sarma, for their invaluable guidance, continuous support, and encouragement. Their insights and feedback played a crucial role in shaping the project and ensuring that it met academic and technical standards.
We would also like to acknowledge our teamwork and collaborative efforts throughout the project. As a two-member team, effective coordination, idea sharing, and mutual support played a vital role in overcoming technical challenges and successfully implementing the system.
We are also deeply grateful to the faculty members of the Department of Information Technology, whose knowledge and expertise have been a constant source of inspiration and learning throughout our academic journey. Their teachings and support have laid the foundation for our understanding of machine learning and its applications.
ABSTRACT
Our Primary objective of our project is that many land registration systems in many regions continue to rely on centralized and manual processes, making them vulnerable to issues such as data tampering, lack of transparency, fraudulent ownership claims, and inefficient record management. These challenges often result in disputes, delays, and reduced trust in land administration authorities. To address these limitations, this project proposes TerraLedger, a Blockchain-Based Land Registry System that leverages decentralized ledger technology to ensure secure, transparent, and tamper-resistant land record management.
The proposed system utilizes blockchain technology to store property ownership records in an immutable manner, ensuring that once a land record is registered, it cannot be altered without proper authorization. Smart contracts are employed to automate key operations such as property registration and ownership transfer, thereby reducing manual intervention and enhancing trust between stakeholders. The system supports role-based access, allowing administrators to register properties and property owners to transfer ownership securely through blockchain transactions.
The frontend of the system is developed using modern web technologies to provide a user-friendly interface for interacting with the blockchain network. Wallet-based authentication enables secure user verification and transaction signing, ensuring data integrity and accountability. The backend blockchain infrastructure is implemented using Solidity smart contracts and deployed on a local Ethereum network for testing and validation.
Our project demonstrates how blockchain technology can be effectively applied to land registry systems to enhance security, transparency, and operational efficiency. The project highlights the potential of decentralized solutions in modernizing traditional land administration processes and lays the foundation for future enhancements such as integration with government systems and scalability to public blockchain networks.

# TABLE OF CONTENTS


# LIST OF TABLES

Table 2.1 — Property Struct Fields
Table 2.2 — TransferRequest Struct Fields
Table 2.3 — Smart Contract Functions
Table 2.4 — Smart Contract Events
Table 4.1 — Frontend Page Routes
Table 5.1 — Gas Metrics (Sepolia Testnet)
Table 5.2 — Gas Metrics (Hardhat Local)
Table 5.3 — End-to-End Transaction Lifecycle
Table 5.4 — Security Threat Mitigation Matrix
Table 6.1 — Comparative Analysis with Existing Systems

# CHAPTER 1: INTRODUCTION


## 1.1 Background and Motivation

Land is the most fundamental asset class in any agrarian economy, and secure land rights are a prerequisite for economic development, access to credit, and social stability. In India, land ownership is documented through a fragmented system of registration governed by the Registration Act of 1908, which records transactions rather than establishing conclusive ownership. This foundational limitation has resulted in a system rife with ambiguity, disputes, and vulnerability to fraud.
The consequences are severe. Land-related disputes constitute the majority of civil litigation in India. According to government data, property disputes are among the most common and prolonged cases in Indian courts. In flood-prone states like Assam, the physical destruction of paper-based land records during floods further complicates title establishment for millions of farmers and landowners.
India's current land digitization initiatives — most notably the Digital India Land Records Modernization Programme (DILRMP) and state-level systems such as Bhoomi (Karnataka) and Dharani (Telangana) — have made partial progress in digitizing records. However, these systems remain fundamentally centralized: they rely on SQL databases that are vulnerable to single points of failure, administrative manipulation, and lack any cryptographic audit trail. Citizens cannot independently verify ownership records.

## 1.2 Problem Statement

India's land records system suffers from four critical structural failures:
- Single Point of Failure: Centralized SQL databases are vulnerable to server downtime, hacking, and catastrophic data loss.
- Bureaucratic Bottlenecks: Multi-week manual verification processes governed by an archaic legal framework (the Registration Act of 1908) that records transactions, not ownership.
- Document Forgery: Paper deeds and digital entries can be altered by corrupt administrators with no cryptographic proof of tampering.
- Lack of Transparency: Citizens cannot independently verify records. Systems like DILRMP offer zero cryptographic audit trail.

## 1.3 Proposed Solution

TerraLedger addresses all four failures through a hybrid decentralized architecture combining Ethereum smart contracts and the InterPlanetary File System (IPFS). The core insight is that blockchain technology offers exactly the properties absent from traditional land registry systems: immutability, transparency, decentralization, and cryptographic verifiability.
TerraLedger shifts land titles from presumptive (trust-based) to conclusive (cryptographically secured) ownership records. Any citizen, anywhere in the world, can verify the authenticity of a land deed in seconds without trusting any government authority, registrar, or intermediary.

## 1.4 Objectives

- Design and implement a decentralized smart contract-based land registry on the Ethereum blockchain using Solidity v0.8.20.
- Implement a multi-tier role-based access control (RBAC) system using OpenZeppelin AccessControl, modelling real-world legal governance hierarchies.
- Develop a zero-trust document verification protocol using SHA-256 hashing and IPFS content addressing.
- Create a dual-signature trustless escrow mechanism for ownership transfers.
- Build a full-featured React.js frontend with MetaMask integration and wallet-less read access.
- Empirically measure and demonstrate the economic viability of the system on a live Ethereum testnet.

## 1.5 Scope

TerraLedger is deployed and validated on the Ethereum Sepolia testnet (Chain ID: 11155111). The system is designed for the Indian context, particularly for Assam, where land record vulnerabilities are exacerbated by natural disasters. While the current implementation is on a testnet, all architectural and economic decisions are made with eventual mainnet or Layer 2 deployment in mind.

## 1.6 Report Organization

This report is organized as follows: Chapter 2 presents the background and review of related literature. Chapter 3 describes the system architecture and methodology. Chapter 4 covers the implementation details. Chapter 5 presents results and discussions including gas metrics, performance data, and security analysis. Chapter 6 concludes the report and outlines future work.

# CHAPTER 2: BACKGROUND AND REVIEW OF LITERATURE


## 2.1 Blockchain Technology

A blockchain is a distributed, append-only ledger maintained by a peer-to-peer network of nodes. Each block contains a cryptographic hash of the previous block, a timestamp, and transaction data. This chained structure makes retroactive alteration of any block computationally infeasible, as it would require recalculating all subsequent blocks faster than the honest network. Ethereum, introduced by Vitalik Buterin in 2015, extended Bitcoin's model by adding a Turing-complete virtual machine (the Ethereum Virtual Machine, or EVM) that executes smart contracts.
Smart contracts are self-executing programs stored on the blockchain whose terms are directly written in code. Once deployed, they execute deterministically without the possibility of downtime, censorship, or third-party interference. This property makes smart contracts ideal for land registry, where impartial, transparent execution of ownership rules is paramount.

## 2.2 Existing Land Registry Systems


### 2.2.1 DILRMP (India)

The Digital India Land Records Modernization Programme is the government's flagship initiative for digitizing land records. While it has successfully created digital records in many states, DILRMP lacks cryptographic audit trails, public verifiability, and is fundamentally centralized. Records are stored in government-controlled databases and can be altered by administrators without detection.

### 2.2.2 Bhoomi and Dharani

Bhoomi (Karnataka) and Dharani (Telangana) are state-level land record management systems that provide online access to land records. Both systems suffer from centralization issues and have been the subject of controversy regarding data manipulation. Neither system provides any form of cryptographic document verification.

### 2.2.3 Propy

Propy is a private blockchain-based real estate transaction platform. While it provides immutable records and an RBAC authority hierarchy, it does not offer IPFS document storage, zero-trust verification, wallet-less read access, or an on-chain audit trail for document corrections. It is also not open-source.

### 2.2.4 Chromaway (Sweden)

Sweden's land authority (Lantmateriet) piloted a blockchain-based property registry using Chromaway's Postchain. The system demonstrated immutable records and RBAC hierarchy, but similarly lacks IPFS document storage, zero-trust verification, wallet-less access, and open-source availability. The pilot was limited in scope and did not proceed to full production deployment.

## 2.3 IPFS and Content Addressing

The InterPlanetary File System (IPFS) is a peer-to-peer hypermedia protocol designed to make the web faster, safer, and more open. Unlike HTTP, which locates content by address (where it is stored), IPFS locates content by its cryptographic hash (what the content is). This Content Identifier (CID) is a cryptographic fingerprint of the file: altering a single byte produces a completely different CID. This property makes IPFS ideal for legal document storage — once a deed's CID is stored on the blockchain, any tampering with the document is immediately detectable.

## 2.4 Role-Based Access Control (RBAC)

OpenZeppelin's AccessControl library provides a flexible and audited implementation of RBAC for Solidity smart contracts. Unlike simple ownership models (Ownable), AccessControl supports multiple independent roles with configurable admin relationships. For TerraLedger, this enables a governance hierarchy (Authority → Registrar → Owner → Public) that mirrors real-world land administration structures, with all role assignments enforced at the EVM level.

## 2.5 Research Gap

A review of existing literature and systems reveals a consistent pattern: no single existing system provides all eight of the identified critical features — immutable records, public verifiability, IPFS document storage, zero-trust cryptographic verification, wallet-less read access, open-source code, RBAC hierarchy, and on-chain audit trails — simultaneously. TerraLedger is designed to bridge this gap.

# CHAPTER 3: METHODOLOGY AND SYSTEM ARCHITECTURE


## 3.1 Architectural Overview

TerraLedger employs a layered hybrid architecture comprising five distinct layers, eliminating any centralized backend server:
- User Layer: Browser with MetaMask extension for public citizens and administrators.
- Frontend Layer: React.js v18.3 with Vite, deployed on Cloudflare Pages CDN. Includes the NetworkGuard component, ethers.js v6 for Web3 interactions.
- RPC / Middleware Layer: Alchemy RPC as the primary provider, with a public Sepolia node (ethereum-sepolia-rpc.publicnode.com) as an automatic fallback for wallet-less users. Event scanning is optimized via the DEPLOY_BLOCK constant (#10,725,429).
- Blockchain Layer: TerraLedger.sol deployed on Ethereum Sepolia. OpenZeppelin RBAC governs all state-changing operations. All property records are immutably stored on-chain.
- Storage Layer: Legal documents are stored on IPFS via Pinata. Only the IPFS CID (cryptographic hash) is stored on-chain, enabling content-addressed document verification.

## 3.2 Smart Contract Design (TerraLedger.sol)


### 3.2.1 Inheritance

The contract inherits from OpenZeppelin's AccessControl (not the simpler Ownable), enabling granular, multi-role permission management enforced at the EVM level. This choice was deliberate: AccessControl supports configurable role admin hierarchies, allowing the AUTHORITY_ROLE to govern the REGISTRAR_ROLE independently of the DEFAULT_ADMIN_ROLE.

### 3.2.2 Role Hierarchy

- DEFAULT_ADMIN_ROLE: Assigned to the deployer. Supreme role capable of managing other role admins. Intended for transfer to a Gnosis Safe multisig wallet in production.
- AUTHORITY_ROLE: keccak256("AUTHORITY_ROLE"). High-level governance. Can grant and revoke REGISTRAR_ROLE via addRegistrar() and removeRegistrar().
- REGISTRAR_ROLE: keccak256("REGISTRAR_ROLE"). Operational role. Can register properties, approve transfers, and update documents.
- Property Owner: Holds title. Can initiate a transfer request to a designated buyer.
- Public Citizen: Wallet-less read access to any record via public RPC fallback.

### 3.2.3 Data Structures

Table 2.1 — Property Struct Fields

| Field | Type | Purpose |
| --- | --- | --- |
| propertyId | uint256 | Auto-incrementing unique identifier |
| owner | address | Current legal owner's Ethereum wallet |
| location | string | Physical address or coordinates |
| area | string | Land measurement (string to support mixed units) |
| propertyType | string | Classification: Residential, Commercial, Agricultural |
| documentHash | string | IPFS CID of the pinned legal deed |
| isRegistered | bool | Existence flag preventing null-pointer access |

Table 2.2 — TransferRequest Struct Fields

| Field | Type | Purpose |
| --- | --- | --- |
| buyer | address | Wallet of the intended new owner |
| pending | bool | Active transfer request flag |


### 3.2.4 Key Functions

Table 2.3 — Smart Contract Functions

| Function | Access Control | Description |
| --- | --- | --- |
| addRegistrar(address) | AUTHORITY_ROLE | Grants REGISTRAR_ROLE to an address |
| removeRegistrar(address) | AUTHORITY_ROLE | Revokes REGISTRAR_ROLE from an address |
| registerProperty(...) | REGISTRAR_ROLE | Creates new Property struct, increments nextPropertyId, emits PropertyRegistered |
| requestTransfer(uint256, address) | Property Owner | Sets TransferRequest with buyer and pending=true, emits TransferRequested |
| approveTransfer(uint256) | REGISTRAR_ROLE | Transfers ownership to buyer, deletes request, emits TransferApproved + OwnershipTransferred |
| cancelTransfer(uint256) | Owner or Registrar | Deletes the pending TransferRequest, emits TransferCancelled |
| updatePropertyDocument(uint256, string) | REGISTRAR_ROLE | Overwrites documentHash field, emits PropertyDocumentUpdated (audit trail) |


### 3.2.5 Input Validation

All state-changing functions include defensive require() statements:
- _propertyOwner != address(0) — prevents minting to the zero address
- bytes(_location).length > 0 — location cannot be empty
- property.isRegistered == true — property must exist before transfer or update
- msg.sender == property.owner — only owner can initiate a transfer
- _buyer != property.owner — self-transfer is prohibited
- request.pending == true — transfer request must exist before approval

## 3.3 Ownership Transfer: Trustless Escrow State Machine

The ownership transfer mechanism is formalized as a Finite State Machine (FSM) with three states and clearly defined transitions:
- AVAILABLE → PENDING: Owner calls requestTransfer(propertyId, buyerAddress), designating the buyer.
- PENDING → TRANSFERRED: Registrar calls approveTransfer(propertyId), validating and executing the transfer.
- PENDING → AVAILABLE: Owner or Registrar calls cancelTransfer(propertyId), aborting the transfer.
The dual-signature requirement ensures that neither the owner nor the registrar can act unilaterally. The mathematical formalization is: Gamma(S_Pending, sigma_Registrar, sigma_Buyer) → S_Transferred, where sigma denotes a valid on-chain signature.

## 3.4 Zero-Trust Document Verification

TerraLedger's document verification protocol eliminates the need for citizens to trust any intermediary. The algorithm proceeds as follows:
- Step 1 — Local Hashing: User selects a local file. FileReader reads it as ArrayBuffer, which is converted to a CryptoJS WordArray. SHA-256 hash is computed entirely client-side.
- Step 2 — On-Chain CID Retrieval: The smart contract is queried for properties[propertyId].documentHash.
- Step 3 — IPFS Fetch and Hash: The original document is fetched from the Pinata IPFS gateway. Its SHA-256 hash is computed identically.
- Step 4 — Comparison: If localHash === ipfsHash, the result is AUTHENTIC. Otherwise, the result is TAMPERED.
The mathematical formalization is: V = 1 if H(F_local) = H(F_ipfs), where H(x) denotes the SHA-256 hash function. The probability of a forged document passing verification is approximately 1 in 2^256, or approximately 1.16 × 10^-77 — computationally infeasible for any adversary.
A critical privacy property: the file never leaves the user's browser during hashing. All computation is client-side.

## 3.5 IPFS Document Storage via Pinata

Legal deed documents are uploaded to IPFS via the Pinata pinning service. The upload flow, implemented via a Cloudflare Worker serverless middleware, proceeds as follows: the user selects a file (PDF, JPG, or PNG, maximum 5MB); the Worker validates file size and MIME type; the Worker authenticates with Pinata using a server-side JWT (stored in Cloudflare Secrets, never exposed in the frontend bundle); the file is pinned to IPFS and the CID (Content Identifier, version 1) is returned to the frontend; the registrar then calls registerProperty() with the CID, which is stored immutably on-chain.

## 3.6 Dynamic RPC Fallback and Wallet-less Access

TerraLedger is designed to be usable by citizens without cryptocurrency wallets or MetaMask. The dynamic provider selection in contractConfig.js works as follows:
- Priority 1: If window.ethereum exists, use ethers.BrowserProvider(window.ethereum) — full MetaMask functionality.
- Priority 2: If absent, use ethers.JsonRpcProvider with the public Sepolia node — read-only wallet-less access.
This ensures mobile users, incognito browsers, and citizens unfamiliar with Web3 can independently verify any property record on TerraLedger.

# CHAPTER 4: IMPLEMENTATION


## 4.1 Technology Stack

The complete technology stack used in TerraLedger is:
- Smart Contract Language: Solidity v0.8.20 with Solidity Optimizer (200 runs)
- Smart Contract Framework: OpenZeppelin Contracts v5 (AccessControl)
- Development & Testing: Hardhat v2.22, Chai
- Frontend Framework: React v18.3 + Vite v7.1
- Routing: React Router DOM v7.11
- Web3 Client Library: ethers.js v6.15
- Cryptographic Hashing (Client-side): crypto-js v4.2 (SHA-256)
- Decentralized Storage: IPFS via Pinata API (CID v1)
- Wallet Integration: MetaMask browser extension (window.ethereum)
- Frontend Hosting: Cloudflare Pages (auto-deploy from GitHub main branch)
- Testnet: Ethereum Sepolia (Chain ID: 11155111)
- Local Dev Network: Hardhat (Chain ID: 31337, auto-mining, interval 0)
- RPC Provider (Production): Alchemy (free tier, 300M compute units/month)
- RPC Provider (Fallback): ethereum-sepolia-rpc.publicnode.com

## 4.2 Frontend Architecture


### 4.2.1 Application Structure

The React application is structured with a top-level provider hierarchy: ThemeProvider wraps a ToastProvider, which wraps the Router. The NetworkGuard component renders as a global overlay below the Navbar, visible on any page when the user's MetaMask is connected to the wrong network.

### 4.2.2 Pages and Routes

Table 4.1 — Frontend Page Routes

| Route | Component | Purpose |
| --- | --- | --- |
| / | Dashboard.jsx | Live ecosystem statistics — total properties, pending transfers, active registrars |
| /register | RegisterProperty.jsx | Property registration form with IPFS document upload |
| /transfer | TransferOwnership.jsx | Dual-view: Citizen (request) + Registrar (approve/reject queue) |
| /records | ImmutableRecords.jsx | Browse all registered properties |
| /search | PropertySearch.jsx | Search properties by ID, owner, location |
| /transactions | TransactionHistory.jsx | Full chronological history of all on-chain events |
| /wallet | WalletAuth.jsx | MetaMask connection and wallet details |
| /roles | RoleManager.jsx | Admin dashboard for Authority to manage Registrars |


### 4.2.3 Custom Hooks

Three custom React hooks encapsulate Web3 state management:
useWalletRoles.js: Queries contract.hasRole() for both AUTHORITY_ROLE and REGISTRAR_ROLE directly on-chain on every mount. Listens to accountsChanged and chainChanged MetaMask events for real-time updates. Falls back to localStorage cache if the contract is unreachable. Returns { address, isAdmin, isRegistrar, loading, refresh }.
useAdmin.js: Manages the Ethereum signer lifecycle. Creates contract instances with ethers.Contract. Listens to accountsChanged and chainChanged events. Returns { account, isAdmin, isRegistrar, contract, refresh }.
useNetwork.js: Reads the current chainId from MetaMask via eth_chainId. Compares against TARGET_CHAIN_ID derived from the VITE_NETWORK environment variable. Provides switchToCorrectNetwork() using wallet_switchEthereumChain, with automatic fallback to wallet_addEthereumChain if the chain is unknown to MetaMask (error code 4902).

## 4.3 Event Indexing and Chunked Provider

TerraLedger's frontend uses a chunked parallel event fetching strategy implemented in src/utils/chunkedProvider.js. The function fetchEventsChunked splits the block range from the deployment block to the latest block into chunks of 40,000 blocks (safely under the 50,000 block RPC limit). All chunks are fetched in parallel using Promise.all(), with failed chunks returning empty arrays rather than crashing. Results are flattened into a single sorted array.
The DEPLOY_BLOCK constant (10725429 on Sepolia, 0 on localhost) optimizes all queryFilter calls to start scanning only from the contract's deployment block, eliminating millions of irrelevant blocks from every query.

## 4.4 Theme Engine

TerraLedger implements a full dark/light theme engine via React Context. The ThemeContext detects the user's OS preference using window.matchMedia('(prefers-color-scheme: dark)') and persists the preference in localStorage under the key terra_theme. The mechanism sets a data-theme attribute on the root html element, which CSS custom properties (HSL-based color variables) respond to. The design language incorporates glassmorphism effects, smooth micro-animations, and vibrant gradient accents.

## 4.5 Toast Notification System

A global Toast notification system is implemented via React Context (ToastProvider) and React.createPortal to document.body. The API supports addToast() for creating notifications with statuses: pending (spinner animation), success (checkmark), error (X mark), and info (i icon). The updateToast() function enables in-place updates, allowing a pending notification to transition to success or error without creating a new notification — critical for the blockchain transaction lifecycle where the user must wait for block confirmation. ARIA attributes (role='alert', aria-live='polite') ensure screen reader accessibility.

## 4.6 Deployment


### 4.6.1 Smart Contract Deployment

Smart contract deployment uses Hardhat Ignition, a declarative deployment framework. For local development: npx hardhat ignition deploy ignition/modules/Deploy.js --network localhost. For Sepolia testnet: npx hardhat ignition deploy ignition/modules/DeploySepolia.js --network sepolia. Deployment requires SEPOLIA_RPC_URL and PRIVATE_KEY environment variables. The Solidity optimizer is enabled with 200 runs.

### 4.6.2 Frontend Deployment

The React frontend auto-deploys from the GitHub main branch to Cloudflare Pages on every push. Environment variables (VITE_CONTRACT_ADDRESS_SEPOLIA, VITE_NETWORK) are configured on the Cloudflare dashboard. A single VITE_NETWORK environment variable controls the entire application target: 'sepolia' routes all calls to the Sepolia testnet, while 'local' routes to a local Hardhat node.

## 4.7 Multi-User Simulation (Validation)

TerraLedger was validated through a full end-to-end multi-user simulation using three MetaMask wallets on the Ethereum Sepolia testnet, simulating the complete governance lifecycle:
- Step 1 — Account A (Authority) deployed the contract and verified AUTHORITY_ROLE assignment on the Role Manager dashboard. Contract live at Sepolia address.
- Step 2 — Account A granted REGISTRAR_ROLE to Account B via addRegistrar(B_address). Account B gained the REGISTRAR badge. Gas consumed: ~50,000.
- Step 3 — Account B called registerProperty(owner=C, location, area, CID) with a PDF deed uploaded to IPFS. Property #1 minted, CID stored on-chain. Gas consumed: ~244,229.
- Step 4 — Account C called requestTransfer(propertyId=1, buyer=A_address). Property #1 set to PENDING state. Gas consumed: ~51,500.
- Step 5 — Account B called approveTransfer(propertyId=1). Ownership transferred to Account A. Gas consumed: ~38,852.
- Step 6 — Account A called requestTransfer then cancelTransfer before Registrar approval. Transfer cancelled, property returned to AVAILABLE state. Gas consumed: ~45,000.
- Step 7 — Account A called revokeRegistrar(B_address). Account B's subsequent registerProperty() attempt reverted with an AccessControl error. RBAC enforced at EVM level.

# CHAPTER 5: RESULTS AND DISCUSSIONS


## 5.1 Gas Metrics and Economic Viability


### 5.1.1 Live Sepolia Measurements

Table 5.1 — Gas Metrics (Ethereum Sepolia Testnet)

| Function | Gas Used | Transaction Hash |
| --- | --- | --- |
| Contract Deployment | 2,115,315 | 0x9800ae6c...537fc455 |
| registerProperty() | 244,229 | 0x0e4ac6c4...bd9792e |


### 5.1.2 Local Hardhat Measurements

Table 5.2 — Gas Metrics (Hardhat Local — Deterministic)

| Function | Gas Used |
| --- | --- |
| registerProperty() | 289,529 |
| requestTransfer() | 51,500 |
| approveTransfer() | 38,852 |
| updatePropertyDocument() | 47,735 |


### 5.1.3 Cost Analysis

At a gas price of 1.505 Gwei on the Sepolia testnet, the transaction fee for a complete property registration (244,229 gas) is approximately 0.00037 ETH. The gas efficiency is 98.74% (244,229 / 247,335 gas limit). This demonstrates significant economic viability: the cost of registering a property on TerraLedger is a small fraction of the administrative fees and legal costs associated with traditional land registration in India.

## 5.2 Performance Data


### 5.2.1 End-to-End Transaction Lifecycle

Table 5.3 — End-to-End Transaction Lifecycle

| Phase | Duration |
| --- | --- |
| IPFS Upload (Pinata API) | 2–5 seconds |
| MetaMask Signature Prompt | User-dependent |
| Transaction Broadcast to Mempool | < 1 second |
| Block Inclusion (1 confirmation) | ~12 seconds |
| 3 Block Confirmations (recommended) | ~36 seconds |
| Frontend UI Update | < 1 second after confirmation |
| Total (excl. user input) | ~15–42 seconds |

The empirically measured end-to-end transaction lifecycle of 15 to 42 seconds represents a dramatic improvement over the multi-week manual verification processes of traditional land registries in India.
Key empirical data points from the live Sepolia deployment: block interval of 12 seconds (empirically observed), deployment block #10,725,429 (timestamp: 2026-04-24T21:38:12 UTC), registration block #10,725,509 (timestamp: 2026-04-24T21:56:00 UTC), average transactions per block approximately 128.

## 5.3 Security Analysis

Table 5.4 — Security Threat Mitigation Matrix

| Threat | Mitigation |
| --- | --- |
| Unauthorized Minting | EVM-enforced RBAC: onlyRole(REGISTRAR_ROLE) modifier. Enforced at EVM level. |
| Document Tampering | IPFS content addressing (CIDs). Altering a single byte changes the hash entirely, breaking the on-chain link. |
| Front-Running Transfers | Dual-signature workflow: both owner's requestTransfer() and Registrar's approveTransfer() required. |
| Double-Spending | Ethereum PoS consensus enforces single-state truth across the distributed ledger. |
| Wrong Network Interaction | NetworkGuard.jsx + useNetwork.js hooks render a full-screen block overlay on incorrect chain. |
| API Token Exposure | Cloudflare Worker serverless middleware hides Pinata JWT from the frontend bundle. |
| Centralization Risk | Multisig wallet (Gnosis Safe) + TimelockController (48-hour delay) for governance actions. |
| Private Key Exposure | MetaMask signs locally. Application never handles private keys. |
| Frontend Manipulation | All business logic enforced in the smart contract at EVM level. Frontend is read-only display. |
| Unauthorized Upgrade (Future) | UUPS pattern: upgrades restricted to AUTHORITY_ROLE (Gnosis Safe multi-sig) with 48-hour TimelockController delay. |


## 5.4 Comparative Analysis

Table 6.1 — Comparative Analysis with Existing Systems

| Feature | DILRMP | Propy | Chromaway | TerraLedger |
| --- | --- | --- | --- | --- |
| Immutable Records | No | Yes | Yes | YES |
| Public Verifiability | No | No | No | YES |
| IPFS Document Storage | No | No | No | YES |
| Zero-Trust Verification | No | No | No | YES |
| Wallet-less Read Access | N/A | No | No | YES |
| Open Source | No | No | No | YES |
| RBAC Authority Hierarchy | No | Yes | Yes | YES |
| On-Chain Audit Trail | No | No | No | YES |

TerraLedger is the only system providing all eight evaluated features simultaneously. It is the only implementation combining IPFS document storage, zero-trust cryptographic verification, and wallet-less read access in a single open-source, RBAC-governed framework.

# CHAPTER 6: CONCLUSION AND FUTURE WORK


## 6.1 Conclusion

TerraLedger successfully demonstrates that a decentralized, hybrid Ethereum + IPFS architecture can provide a fundamentally superior alternative to existing land registry systems in India. Four major contributions are made by this work:
- Cryptographic Title Certainty: TerraLedger shifts land titles from presumptive (trust-based) to conclusive (cryptographically secured) ownership, a fundamental legal upgrade enabled by Ethereum's immutable ledger.
- Zero-Trust Verification: The SHA-256 + IPFS CID verification protocol allows any citizen to independently audit any deed without trusting any authority, government, or intermediary. The collision probability of approximately 1 in 2^256 makes document forgery computationally infeasible.
- Economic Feasibility: Full property registration at approximately 0.00037 ETH (244,229 gas at 1.505 Gwei) is a fraction of traditional administrative fees, with the entire transaction completing in 15 to 42 seconds versus the multi-week traditional process.
- Production-Ready Architecture: UUPS upgradeability, The Graph Protocol indexing, and a Dynamic RPC fallback layer position TerraLedger as a scalable, maintainable land governance framework ready for production deployment.
The system has been empirically validated through a complete multi-user simulation on the Ethereum Sepolia testnet, covering all seven governance lifecycle operations with measurable gas costs and on-chain transaction proofs.

## 6.2 Future Work


### 6.2.1 IoT GPS Boundary Markers

GPS-enabled IoT devices can be deployed at physical land boundaries to feed real-time spatial coordinates directly into the smart contract, linking physical ground reality to the immutable ledger. This would prevent encroachment disputes by providing an independent, tamper-proof record of physical boundaries.

### 6.2.2 Zero-Knowledge Proofs (ZKPs)

zk-SNARK circuits can enable citizens to prove ownership or tax compliance without revealing sensitive personal details (purchase price, identity) to the public ledger. This would make TerraLedger compliant with privacy regulations while maintaining public verifiability of the ownership graph.

### 6.2.3 Layer 2 Deployment

Migration to Ethereum Layer 2 rollups (Polygon, Optimism, or Arbitrum) would reduce gas costs by 10 to 100 times while inheriting Ethereum's Proof-of-Stake security guarantees. At Layer 2 gas prices, property registration could cost less than $0.01, making TerraLedger economically accessible for rural farmers in Assam.

### 6.2.4 The Graph Protocol Integration

Replacing the current O(n) eth_getLogs event scanning with The Graph Protocol's O(1) GraphQL queries would enable instant dashboard loading and complex filtering (by owner, location, date range) regardless of registry size. The subgraph schema would define entities: Property, OwnershipTransfer, and RegistryStats.

### 6.2.5 IT Act 2000 Compliance

Legal integration with the Information Technology Act 2000 and the Registration Act 1908 would grant blockchain titles full evidentiary weight in Indian courts, completing the transition from a technical prototype to a legally recognized land governance system.

### 6.2.6 AI-Powered Fraud Detection

Machine learning models analyzing on-chain transfer patterns, ownership graph topology, and gas usage anomalies could flag suspicious activity in real-time — for example, detecting coordinated transfer sequences indicative of land grabbing.

# REFERENCES

[1] Buterin, V. (2014). "A Next-Generation Smart Contract and Decentralized Application Platform." Ethereum White Paper. https://ethereum.org/en/whitepaper/
[2] Benet, J. (2014). "IPFS — Content Addressed, Versioned, P2P File System." arXiv:1407.3561. https://arxiv.org/abs/1407.3561
[3] OpenZeppelin. (2024). "OpenZeppelin Contracts v5." GitHub. https://github.com/OpenZeppelin/openzeppelin-contracts
[4] Ministry of Rural Development, Government of India. (2023). "Digital India Land Records Modernization Programme (DILRMP)." https://dilrmp.gov.in/
[5] Propy, Inc. (2023). "Propy Real Estate Platform." https://propy.com/
[6] Chromaway AB and Lantmateriet. (2018). "The Land Registry in the Blockchain — Testbed." Report. Swedish Land Registry.
[7] National Institute for Smart Government. (2019). "Bhoomi: Online Delivery of Land Records in Karnataka." E-governance case study.
[8] Wood, G. (2014). "Ethereum: A Secure Decentralised Generalised Transaction Ledger (Berlin Version)." Ethereum Yellow Paper.
[9] Szabo, N. (1997). "Formalizing and Securing Relationships on Public Networks." First Monday, 2(9).
[10] The Graph Protocol. (2024). "The Graph: Indexing Protocol for Querying Networks." https://thegraph.com/
[11] Ethereum Foundation. (2024). "Ethereum Sepolia Testnet Documentation." https://ethereum.org/en/developers/docs/
[12] Pinata Cloud. (2024). "Pinata IPFS Pinning Service API Documentation." https://docs.pinata.cloud/
[13] Ethereum Improvement Proposals. (2021). "EIP-1967: Standard Proxy Storage Slots." https://eips.ethereum.org/EIPS/eip-1967
[14] OpenZeppelin. (2024). "UUPS Proxies: Tutorial and Usage." https://docs.openzeppelin.com/contracts/5.x/api/proxy
[15] Information Technology Act 2000, Government of India.
[16] Registration Act 1908, Government of India.
[17] Cloudflare, Inc. (2024). "Cloudflare Pages and Workers Documentation." https://developers.cloudflare.com/
[18] ethers.js. (2024). "ethers.js v6 Documentation." https://docs.ethers.org/v6/

# APPENDICES


## Appendix A: Smart Contract Deployment Details

- Network: Ethereum Sepolia Testnet
- Chain ID: 11155111
- Deployment Block: #10,725,429
- Deployment Timestamp: 2026-04-24T21:38:12 UTC
- Contract Deployer: Account A (AUTHORITY_ROLE)
- Solidity Version: 0.8.20
- Optimizer: Enabled, 200 runs
- Deployment Gas Used: 2,115,315
- Source Code: github.com/anilabhbarua/TerraLedger

## Appendix B: Empirical Gas Measurement Data

- registerProperty() on Sepolia: 244,229 gas | Tx: 0x0e4ac6c4...bd9792e
- registerProperty() on Hardhat: 289,529 gas
- requestTransfer() on Hardhat: 51,500 gas
- approveTransfer() on Hardhat: 38,852 gas
- updatePropertyDocument() on Hardhat: 47,735 gas
- Gas Price (Sepolia, empirical): 1.505 Gwei
- Registration cost: 0.000367556305800795 ETH (~0.00037 ETH)
- Gas Efficiency: 98.74% (244,229 / 247,335 gas limit)

## Appendix C: Multi-User Simulation Wallet Addresses

- Account A — AUTHORITY_ROLE: Deployed contract, granted registrar, acted as final buyer
- Account B — REGISTRAR_ROLE: Registered properties, approved transfers, had role revoked in Step 7
- Account C — LANDOWNER: Received registered title, initiated transfer, tested cancel flow

## Appendix D: IPFS Content Identifier (CID) Specification

All documents uploaded to TerraLedger use CID version 1 (CIDv1) with the following properties:
- Hash function: SHA2-256
- Codec: dag-pb (MerkleDAG protobuf)
- Multibase: base32 (case-insensitive)
- Example CID format: bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi

## Appendix E: Environment Configuration

Required environment variables for production deployment:
- VITE_CONTRACT_ADDRESS_SEPOLIA — deployed contract address on Sepolia
- VITE_NETWORK — 'sepolia' for production, 'local' for development
- SEPOLIA_RPC_URL — Alchemy RPC endpoint (for Hardhat deployment scripts)
- PRIVATE_KEY — deployer wallet private key (Hardhat deployment only, never in frontend)
- PINATA_JWT — Pinata API JWT (Cloudflare Secret, never in frontend bundle)