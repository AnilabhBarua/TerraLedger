# TerraLedger - Local Development Setup & Demo Guide

A complete guide to setting up TerraLedger for local development with a private blockchain network.

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MetaMask browser extension installed

## Quick Start (3 Steps)

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Start Local Blockchain & Deploy Contract

Open a terminal and run:

```bash
npx hardhat node
```

This will:
- Start a local Hardhat blockchain at `http://localhost:8545`
- Display 20 test accounts with private keys
- Keep the blockchain running

### Step 3: In Another Terminal, Seed Test Data

```bash
npx hardhat run scripts/seed-properties.ts --network localhost
```

This will:
- Deploy the TerraLedger contract
- Register 8 test properties across different addresses
- Display contract address and configuration
- Show account addresses for use in MetaMask

---

## MetaMask Configuration

### Adding Localhost Network to MetaMask

1. **Open MetaMask** and click the network selector (top-left)
2. **Select "Add a custom network"** or go to Settings → Networks → Add Network
3. **Fill in these details:**

   | Field | Value |
   | --- | --- |
   | Network name | Localhost 31337 |
   | RPC URL | http://localhost:8545 |
   | Chain ID | 31337 |
   | Currency symbol | ETH |
   | Block explorer URL | (leave empty) |

4. **Click "Save"** and the network will be added

### Importing Test Accounts

1. **Get private keys** from the Hardhat node terminal output (they display when it starts)
2. **In MetaMask**, click the account icon → "Import Account"
3. **Paste a private key** from the Hardhat output
4. **Click "Import"**

Example (from Hardhat node output):
```
Accounts
========
Account #0: 0x1234... (private key: 0xabcd...)
Account #1: 0x5678... (private key: 0xefgh...)
...
```

Use the private key strings (without the "0x" is okay, MetaMask handles it)

### Important Notes

- Each account starts with 10,000 test ETH
- These are not real funds, only for local testing
- Never share private keys from production networks
- Test accounts reset when you stop and restart the Hardhat node

---

## Using TerraLedger

### 1. Open the Application

Start the development server:

```bash
npm run dev
```

The app will open at `http://localhost:5173` (or similar)

### 2. Connect Wallet

- **Click the "Connect Wallet" button**
- **Select one of your imported MetaMask accounts**
- Make sure MetaMask is set to "Localhost 31337" network
- The app will display your account address

### 3. View Properties

- **Go to "Property Search"** tab
- **View all 8 registered test properties**
- Search by property ID to see details
- View owner address, location, and transfer options

### 4. Transfer Property

- **Find a property you own**
- Scroll to "Transfer Property" section
- **Enter new owner's address** (use another test account)
- **Click "Transfer"**
- Confirm the transaction in MetaMask
- Property ownership updates instantly

### 5. Admin Panel (Contract Owner Only)

- **Switch to the deployer account** (Account #0 from Hardhat)
- Navigate to **"Admin Panel"** tab
- **Register new properties:**
  - Enter property owner address
  - Enter property location
  - Click "Register"
- New properties appear immediately

---

## Test Accounts & Properties

### Default Test Accounts (from seed script)

| # | Address | Role | Properties Owned |
| --- | --- | --- | --- |
| 0 | (First account) | Contract Owner | Can register properties |
| 1 | (Second account) | User | Main Street, Sunset Blvd |
| 2 | (Third account) | User | Park Avenue, Spring Street |
| 3 | (Fourth account) | User | Ocean Drive, Washington St |
| 4 | (Fifth account) | User | Market Street |
| 5 | (Sixth account) | User | Michigan Avenue |

### Pre-Registered Properties

1. **123 Main Street, Brooklyn, NY 11201** - Account #1
2. **456 Park Avenue, Manhattan, NY 10022** - Account #2
3. **789 Ocean Drive, Miami Beach, FL 33139** - Account #3
4. **321 Sunset Boulevard, Los Angeles, CA 90028** - Account #4
5. **654 Market Street, San Francisco, CA 94103** - Account #5
6. **987 Michigan Avenue, Chicago, IL 60611** - Account #1
7. **147 Spring Street, New York, NY 10012** - Account #2
8. **258 Washington Street, Boston, MA 02108** - Account #3

---

## Troubleshooting

### "Network error" or "Cannot connect to contract"

1. **Check Hardhat is running**: Look for the terminal where you ran `npx hardhat node`
2. **Verify MetaMask network**: Ensure it's set to "Localhost 31337"
3. **Check contract address**: Should match output from `seed-properties.ts`

### "Account not connected" or "Wrong network"

1. **Switch MetaMask to localhost** (top-left dropdown)
2. **Refresh the page** (Cmd/Ctrl + R)
3. **Click "Connect Wallet"** again

### Properties not showing up

1. **Run the seed script**: `npx hardhat run scripts/seed-properties.ts --network localhost`
2. **Refresh the app** (Cmd/Ctrl + R)
3. **Verify contract address** in MetaMask DevTools

### "Only the contract owner can register properties" error

1. **Switch to Account #0** (the deployer account)
2. Ensure MetaMask shows this account is selected
3. Try registering again

---

## Development Workflow

### 1. Make Contract Changes

Edit `/contracts/TerraLedger.sol`

### 2. Restart Everything

```bash
# Stop Hardhat node (Ctrl+C in its terminal)
# Restart it
npx hardhat node

# In another terminal, redeploy
npx hardhat run scripts/seed-properties.ts --network localhost
```

### 3. Test in App

Refresh the frontend and test your changes

---

## Advanced: Manual Contract Interaction

### Using Hardhat Console

```bash
npx hardhat console --network localhost
```

Example commands:
```javascript
// Get signer
const [owner] = await ethers.getSigners();

// Get contract
const contract = await ethers.getContractAt(
  "TerraLedger",
  "0x..." // contract address
);

// View property
const property = await contract.properties(1);
console.log(property);

// Manually register property
await contract.registerProperty(
  "0x...", // owner address
  "123 Test Street"
);
```

---

## Security Notes

**For Local Development Only**
- Hardhat node accounts are not secure
- Never expose private keys publicly
- Never use real networks with test account keys
- Always use proper key management for production

---

## Next Steps

- Modify the smart contract in `/contracts/TerraLedger.sol`
- Enhance the UI in `/src/components/`
- Add more features to the contract
- Deploy to a testnet (Sepolia, Goerli, etc.)

---

**Need Help?**

Check these files:
- `hardhat.config.cts` - Network configuration
- `contracts/TerraLedger.sol` - Smart contract
- `scripts/seed-properties.ts` - Deployment script
- `src/contractConfig.js` - Frontend contract configuration
