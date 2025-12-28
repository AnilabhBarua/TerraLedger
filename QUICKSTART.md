# TerraLedger - Quick Start

Get TerraLedger running in under 5 minutes.

---

## Prerequisites

- Node.js installed
- MetaMask browser extension

---

## Installation & Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Local Blockchain
Open **Terminal 1** and run:
```bash
npm run blockchain
```
Keep this terminal open.

### 3. Deploy Contract
Open **Terminal 2** and run:
```bash
npm run deploy:local
npm run seed
```

### 4. Configure MetaMask

Add local network to MetaMask:
- Network Name: `Hardhat Local`
- RPC URL: `http://127.0.0.1:8545`
- Chain ID: `31337`
- Currency: `ETH`

Import test account (copy this private key):
```
0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

### 5. Start Application
In Terminal 2:
```bash
npm run dev
```

Open http://localhost:3000

---

## Test It

1. Connect MetaMask (select Hardhat Local network)
2. Search for property ID: `1`
3. See property details

Import another account to test transfers:
```
0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
```

---

## Need Help?

See detailed guides:
- `SETUP.md` - Complete setup instructions
- `DEMO.md` - Demo scenarios and talking points
- `README.md` - Project overview

---

## Quick Commands

```bash
npm run blockchain      # Start local blockchain
npm run deploy:local    # Deploy smart contract
npm run seed           # Add test data
npm run dev            # Start frontend app
npm run test           # Run tests
npm run build          # Build for production
```

---

That's it! You're ready to explore blockchain-based land registry. 🎉
