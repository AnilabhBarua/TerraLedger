# TerraLedger: A Blockchain-Based Land Registry

## Quick Start

New to TerraLedger? Get started in 3 commands:

```bash
npm install
npm run blockchain    # Terminal 1: Start local blockchain
npm run seed         # Terminal 2: Deploy contract & seed test data
npm run dev          # Terminal 3: Start React app
```

Then open **[DEMO_SETUP.md](./DEMO_SETUP.md)** for complete setup instructions.

## For Developers

Detailed development guide: **[DEVELOPMENT.md](./DEVELOPMENT.md)**

---

## Project Overview

TerraLedger is a decentralized application (DApp) designed to address the critical vulnerabilities and inefficiencies of traditional, centralized land registry systems. By leveraging the Ethereum blockchain, this project provides a transparent, secure, and immutable ledger for land ownership and transfer.

The core of the project is a smart contract built with Solidity that acts as a digital deed registry. This contract ensures that all transactions are final, auditable, and protected from fraud, fundamentally changing how land titles are managed.

The Problem

Traditional land registries are often paper-based or stored in siloed digital databases. This centralized approach is susceptible to:

Fraud: Records can be illicitly altered, forged, or duplicated.

Inefficiency: Transfers of ownership are often slow, costly, and require numerous intermediaries.

Lack of Transparency: It can be difficult for the public to verify ownership history, leading to disputes and a lack of trust.

Data Loss: Centralized systems are at risk of data loss due to disaster, mismanagement, or targeted attacks.

The Solution: TerraLedger

TerraLedger solves these problems by moving the entire registry onto the blockchain, providing a single source of truth for all land titles.

Immutability: Once a property is registered or a transfer is completed, it is recorded on the blockchain forever. It cannot be altered or deleted, eliminating the possibility of fraud.

Security: The system is secured by cryptographic principles. All ownership transfers must be digitally signed by the rightful owner, making unauthorized transactions impossible.

Transparency: Anyone can view the history and current ownership of a property (while maintaining the privacy of real-world identities), making the entire system auditable and trustworthy.

Efficiency: By using a smart contract, the rules for property transfer are automated, reducing the need for intermediaries and speeding up the transaction process.

Core Smart Contract Features

The TerraLedger.sol smart contract is the heart of the application and enforces all the rules of the registry.

1. Administrative Control

A single, authorized "owner" (representing a government or administrative body) is designated when the contract is first deployed. This administrative account is the only one with the power to add new, officially recognized properties to the ledger.

2. Secure Property Registration

The registerProperty function allows the administrative owner to mint a new land title. It records the property's unique ID, its location, and the Ethereum address of its first rightful owner.

3. Secure Ownership Transfer

The transferOwnership function allows a property owner to securely transfer their title to a new owner. The smart contract automatically enforces two critical security checks:

It verifies that the property being transferred actually exists.

It cryptographically confirms that the person initiating the transfer is the current, legitimate owner of that specific property.

If either of these checks fails, the transaction is automatically rejected, ensuring that only a rightful owner can ever transfer their property.
