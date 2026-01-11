TerraLedger: A Blockchain-Based Land Registry System
TerraLedger is a decentralized application (DApp) designed to modernize land record management by replacing centralized, paper-heavy systems with a transparent, secure, and immutable blockchain ledger. Built on the Ethereum network, it leverages smart contracts to automate property registration and ownership transfers, eliminating intermediaries and preventing fraud.

Project Overview
Traditional land registries suffer from inefficiencies, lack of transparency, and vulnerability to data tampering. TerraLedger solves these issues by creating a single source of truth on the blockchain.


Immutable Records: Once registered, property data cannot be altered or deleted.

Decentralized Security: Distributed ledger technology prevents single points of failure.

Smart Contract Automation: Logic for registration and transfer is enforced by code, not clerks.

🛠 Tech Stack
This project utilizes a modern Web3 development stack:

Blockchain Layer: Solidity (v0.8.20), Ethereum Virtual Machine (EVM)

Development Framework: Hardhat (for compilation, deployment, and local node testing)

Frontend Interface: React.js (via Vite)

Blockchain Interaction: Ethers.js (Web3 Bridge)

Authentication: MetaMask (Wallet-based identity management)

Core Features
1. Role-Based Access Control (RBAC)
The system distinguishes between Administrators and Public Users.

Admin: The contract deployer (government/authority) has exclusive rights to register new properties (Minting).

Property Owner: Users can view their assets and initiate transfers.

2. Secure Property Registration
Only the authorized administrator can execute the registerProperty function. This mints a new land title on the blockchain containing:

Unique Property ID

Location/Physical Description

Initial Owner's Wallet Address

Registration Timestamp

3. Peer-to-Peer Ownership Transfer
The transferOwnership function allows a property owner to transfer their title to a buyer without an intermediary. The smart contract enforces strict security checks:

Existence Check: Verifies the property ID is valid and registered.

Cryptographic Ownership Verification: Ensures msg.sender (the transaction signer) matches the current owner of record. If this check fails, the transaction is automatically reverted.

4. Wallet-Based Authentication
TerraLedger eliminates traditional usernames and passwords. Users authenticate via MetaMask, using their unique Ethereum wallet addresses to sign transactions securely.

 Future Roadmap & Next Phase
The current implementation has successfully demonstrated a web-based DApp on a local Hardhat network. The immediate next phase of development focuses on accessibility and mobile integration:

 Android Application Development: We are currently developing a native Android mobile app (using React Native or Kotlin). This will allow users to view property records, receive notifications, and sign transactions directly from their smartphones.

Cloud Synchronization: Integrating optional cloud backups for non-critical user preferences.

Government API Integration: Future plans include APIs to interface with existing legacy government databases.

Authors
Anilabh Barua

Rishikesh Verma

Guided by: Dr. Satyajit Sarmah, Gauhati University
