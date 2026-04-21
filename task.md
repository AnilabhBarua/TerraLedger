# Phase 2 — Core System Expansion Implementation Checklist

- [X] **1. Advanced Role-Based Access Control (RBAC)**

  - [X] Smart Contract: Integrate OpenZeppelin `AccessControl`.
  - [X] Smart Contract: Define `AUTHORITY_ROLE`, `REGISTRAR_ROLE`.
  - [X] Smart Contract: Add functions for the Authority to grant/revoke Registrar roles.
  - [X] Frontend: Update UI and Context to read and reflect the user's role (Admin, Registrar, Landowner).
  - [X] Frontend: Create an interface for authorities to assign roles.
- [X] **2. Multi-step Ownership Transfer Workflow**

  - [X] Smart Contract: Add `TransferRequest` state mapping (`propertyId` -> `TransferRequest`).
  - [X] Smart Contract: Function `requestTransfer` (callable by Owner).
  - [X] Smart Contract: Function `approveTransfer` (callable by Registrar/Authority).
  - [X] Smart Contract: Execute transfer upon approval.
  - [X] Frontend: Update `TransferOwnership` UI to show "Request Transfer" for owners.
  - [X] Frontend: Create "Pending Approvals" UI for Registrars to approve transfers.
- [X] **3. Off-chain Document Storage Integration (IPFS)**

  - [X] Smart Contract: Update `Property` struct to include `documentURI` or `ipfsHash`.
  - [X] Frontend: Integrate IPFS upload (e.g., via Pinata API or generic IPFS gateway) into `RegisterProperty` and transfer requests.
  - [X] Frontend: Link uploaded documents to the smart contract transactions.
- [ ] **4. Property Document Verification System**

  - [ ] Frontend: Build a verification UI where users can upload a file, calculate its hash locally (e.g., using `crypto-js`), and compare it with the hash stored on-chain to prove authenticity.
- [ ] **5. Transaction UX Enhancements**

  - [ ] Frontend: Implement a global Toast notification system or dedicated UI overlay for transaction states (Pending, Mining, Success, Failure).
  - [ ] Frontend: Integrate real-time feedback everywhere a transaction occurs.
- [ ] **6. Network Management System**

  - [ ] Frontend: Detect current network (Chain ID Validation).
  - [ ] Frontend: Implement `wallet_switchEthereumChain` / `wallet_addEthereumChain` to prompt users to switch to the correct local/testnet network seamlessly.
