# TerraLedger - Setup and Usage Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Hardhat Local Blockchain
Open a terminal and run:
```bash
npx hardhat node
```
Keep this terminal running. This creates a local blockchain with test accounts.

### 3. Deploy the Smart Contract
Open a new terminal and run:
```bash
npx hardhat ignition deploy ignition/modules/Deploy.js --network localhost
```

The contract will be deployed to: `0x5FbDB2315678afecb367f032d93F642f64180aa3`

### 4. Start the Application
```bash
npm run dev
```

The app will open at `http://localhost:3000`

## Using the Application

### First Time Setup in MetaMask

1. **Install MetaMask** (if not already installed)
   - Visit https://metamask.io/
   - Install the browser extension

2. **Add Hardhat Local Network**
   - Open MetaMask
   - Click network dropdown
   - Click "Add Network" > "Add a network manually"
   - Enter:
     - Network Name: `Hardhat Local`
     - RPC URL: `http://127.0.0.1:8545`
     - Chain ID: `31337`
     - Currency Symbol: `ETH`
   - Click "Save"

3. **Import Admin Account**
   - Click MetaMask account icon
   - Select "Import Account"
   - Choose "Private Key"
   - Paste: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
   - This account is the contract owner (Admin)

## Features

### 1. Connect Wallet
- Click "Connect Wallet" button
- Select your MetaMask account
- Approve the connection

### 2. Disconnect Wallet
- Click "Disconnect" button in top-right
- This allows you to switch to a different account

### 3. Property Search (All Users)
- Enter a property ID (e.g., 1, 2, 3)
- Click "Search"
- View property details
- If you own the property, you can transfer it

### 4. Admin Panel (Admin Only)
- Only visible when connected with the contract owner account
- Register new properties by entering:
  - Owner's wallet address
  - Property location
- Click "Register Property"

### 5. Transfer Property Ownership
- Search for a property you own
- Enter the new owner's address
- Click "Transfer Ownership"

## Testing Workflow

### Scenario 1: Register and Search Properties (As Admin)

1. Connect with admin account (the first Hardhat account)
2. Go to "Admin Panel"
3. Register a property:
   - Owner: `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` (Account #1)
   - Location: `123 Main Street, New York`
4. Click "Register Property"
5. Go to "Property Search"
6. Search for property ID: `1`
7. View the registered property

### Scenario 2: Transfer Property (As Property Owner)

1. Disconnect wallet
2. Import Account #1 in MetaMask:
   - Private Key: `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`
3. Connect with this account
4. Search for property ID: `1`
5. You'll see "You own this property"
6. Transfer to Account #2: `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC`
7. Click "Transfer Ownership"

### Scenario 3: Verify Transfer

1. Disconnect wallet
2. Import Account #2 in MetaMask:
   - Private Key: `0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a`
3. Connect with this account
4. Search for property ID: `1`
5. You'll now see "You own this property" for Account #2

## Test Accounts Reference

**Admin (Contract Owner)**
- Address: `0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266`
- Private Key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
- Can access: Admin Panel + Property Search

**Standard User #1**
- Address: `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`
- Private Key: `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`
- Can access: Property Search only

**Standard User #2**
- Address: `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC`
- Private Key: `0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a`
- Can access: Property Search only

## Troubleshooting

### Problem: "Failed to connect wallet"
**Solution**: Make sure MetaMask is installed and you've added the Hardhat Local network

### Problem: "Transaction failed"
**Solution**:
- Ensure Hardhat node is running
- Check you're connected to the correct network (Hardhat Local, Chain ID 31337)
- Try resetting your account in MetaMask: Settings > Advanced > Reset Account

### Problem: "Property not found"
**Solution**: Register at least one property first using the Admin Panel

### Problem: "Access Denied" on Admin Panel
**Solution**: You must be connected with the contract owner account

### Problem: Contract address mismatch
**Solution**:
1. Check the deployed contract address in console after deployment
2. Update `src/contractConfig.js` with the correct address
3. Restart the dev server

## Security Reminder

These private keys are PUBLIC test keys from Hardhat. NEVER use them with real funds or on any public network. They are only safe for local development.
