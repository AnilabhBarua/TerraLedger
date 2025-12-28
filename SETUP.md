# TerraLedger Setup Guide

Complete guide to run TerraLedger locally with a blockchain development environment.

---

## Prerequisites

- Node.js v16 or higher
- MetaMask browser extension
- Terminal/Command Prompt

---

## Step 1: Install Dependencies

```bash
npm install
```

---

## Step 2: Start Local Blockchain

Open a terminal and run:

```bash
npm run blockchain
```

**Important:** Keep this terminal open! It runs your local Ethereum blockchain.

You'll see output like:
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/

Accounts
========
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

---

## Step 3: Deploy Smart Contract

Open a **NEW terminal** (keep the blockchain running) and run:

```bash
npm run deploy:local
```

You'll see:
```
✅ TerraLedger deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
```

**Note:** The contract address should already match `src/contractConfig.js`. If it's different, update the file.

---

## Step 4: Seed Test Data

In the same terminal, run:

```bash
npm run seed
```

This creates 5 test properties owned by different accounts. You'll see the private keys for each test account.

---

## Step 5: Configure MetaMask

### Add Hardhat Network to MetaMask:

1. Open MetaMask
2. Click the network dropdown (top center)
3. Click "Add network" → "Add a network manually"
4. Enter these details:

```
Network Name: Hardhat Local
New RPC URL: http://127.0.0.1:8545
Chain ID: 31337
Currency Symbol: ETH
```

5. Click "Save"

### Import Test Accounts:

You need to import accounts to interact with the app. Use any of these private keys:

**Admin Account (Can register new properties):**
```
0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

**Property Owner Accounts (Can transfer their properties):**
```
0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a
0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6
0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a
```

**How to import:**
1. Click MetaMask icon
2. Click account dropdown (top right)
3. Select "Add account or hardware wallet"
4. Click "Import account"
5. Paste one of the private keys above
6. Click "Import"

---

## Step 6: Start the Application

In your terminal (not the blockchain one), run:

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

---

## Step 7: Connect MetaMask

1. Click "Connect" in MetaMask when prompted
2. Select "Hardhat Local" network
3. Choose one of your imported accounts

---

## Using the Application

### As Admin (Account #0):
- You'll see the "Admin Panel" in the sidebar
- Register new properties by entering an owner address and location
- The admin can only register, not transfer

### As Property Owner (Accounts #1-4):
- Search for your property by ID (1, 2, 3, 4, or 5)
- If you own it, you'll see "You own this property"
- Transfer ownership by entering a new owner's address
- You can only transfer properties you own

### Search Any Property:
- Enter any property ID (1-5)
- View owner and location details
- If you're not the owner, you can only view (no transfer option)

---

## Test Scenarios

### Scenario 1: View a Property
1. In the app, enter property ID: `1`
2. Click "Search"
3. See property details

### Scenario 2: Transfer Property
1. Import owner account with private key for property 1
2. Switch to that account in MetaMask
3. Search for property ID: `1`
4. Enter a new owner address (e.g., `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC`)
5. Click "Transfer Ownership"
6. Confirm transaction in MetaMask
7. Wait for confirmation

### Scenario 3: Register New Property (Admin Only)
1. Import admin account
2. Switch to admin account in MetaMask
3. Click "Admin Panel" in sidebar
4. Enter new owner address and location
5. Click "Register Property"
6. Confirm transaction

---

## Troubleshooting

### "Nonce too high" Error
If you see this error in MetaMask:
1. Open MetaMask
2. Go to Settings → Advanced
3. Click "Clear activity tab data"
4. Refresh the page

### Contract Not Found
Make sure:
1. Blockchain is running (Step 2)
2. Contract is deployed (Step 3)
3. Contract address in `src/contractConfig.js` matches deployment

### MetaMask Not Connecting
1. Make sure you're on "Hardhat Local" network
2. Refresh the page
3. Check that blockchain terminal is still running

### Transaction Fails
1. Make sure you have ETH in your account (test accounts start with 10000 ETH)
2. Check you're using the correct account (admin for registration, owner for transfers)
3. Verify the blockchain is still running

---

## Quick Reference

### Accounts
| Role | Address | Private Key |
|------|---------|-------------|
| Admin | `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` | `0xac09...ff80` |
| Owner 1 | `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` | `0x59c6...690d` |
| Owner 2 | `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC` | `0x5de4...365a` |
| Owner 3 | `0x90F79bf6EB2c4f870365E785982E1f101E93b906` | `0x7c85...007a6` |
| Owner 4 | `0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65` | `0x47e1...4926a` |

### Seeded Properties
- Property ID 1: Owned by Owner 1
- Property ID 2: Owned by Owner 2
- Property ID 3: Owned by Owner 3
- Property ID 4: Owned by Owner 4
- Property ID 5: Owned by Admin

### Commands
```bash
npm run blockchain      # Start local blockchain (keep running)
npm run deploy:local    # Deploy contract to local blockchain
npm run seed           # Add test data
npm run dev            # Start frontend application
npm test               # Run smart contract tests
```

---

## Resetting Everything

If you need to start fresh:

1. Stop the blockchain (Ctrl+C in that terminal)
2. Restart with `npm run blockchain`
3. In a new terminal, run `npm run deploy:local`
4. Run `npm run seed`
5. Clear MetaMask activity (Settings → Advanced → Clear activity tab data)
6. Refresh your browser

The blockchain resets every time you restart it, giving you fresh accounts with 10000 ETH each.

---

## What's Happening Behind the Scenes

1. **Hardhat Node**: A local Ethereum blockchain running on your computer
2. **Smart Contract**: TerraLedger.sol deployed to this local chain
3. **MetaMask**: Connects to your local blockchain (not real Ethereum)
4. **Frontend**: React app interacts with your local contract via ethers.js
5. **Test Accounts**: Pre-funded accounts provided by Hardhat

This is exactly how professional blockchain developers work before deploying to real networks. You're using the same tools as production developers, just in a safe local environment.

---

## Next Steps

- Run the test suite: `npm test`
- Modify the smart contract and redeploy
- Add more properties or test different scenarios
- Explore the contract code in `contracts/TerraLedger.sol`

Happy testing! 🚀
