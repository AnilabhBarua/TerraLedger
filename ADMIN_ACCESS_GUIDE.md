# TerraLedger Admin Access Guide

## How to Access the Admin Panel

The Admin Panel in TerraLedger is restricted to the **contract owner** only. This is the wallet address that deployed the smart contract.

### Step 1: Find the Contract Owner Address

The contract owner is automatically set when the contract is deployed. Based on your deployment, the owner address is:

```
0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266
```

This can be found in: `ignition/deployments/chain-31337/journal.jsonl`

### Step 2: Connect with the Owner Wallet

1. **Start your local Hardhat node** (if not already running):
   ```bash
   npx hardhat node
   ```

2. **In MetaMask**:
   - Click on your account icon
   - Select "Import Account"
   - Choose "Select Type" > "Private Key"
   - Paste the private key for the first Hardhat account

3. **Hardhat Default Account Private Key**:
   ```
   0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   ```
   This is the private key for address `0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266`

4. **Connect to Localhost Network**:
   - In MetaMask, click on the network dropdown
   - Add Network > Add a network manually
   - Network Name: `Hardhat Local`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `31337`
   - Currency Symbol: `ETH`

### Step 3: Connect to TerraLedger

1. Open the TerraLedger application in your browser
2. Click "Connect Wallet"
3. Select the imported Hardhat account in MetaMask
4. Approve the connection

### Step 4: Access Admin Panel

Once connected with the owner account:
1. You'll see "Admin" displayed in the top bar
2. The "Admin Panel" option will appear in the sidebar
3. Click "Admin Panel" to register new properties

## Testing with Multiple Accounts

### Switching Accounts

1. **Disconnect Current Wallet**:
   - Click the "Disconnect" button in the top-right corner

2. **Switch Account in MetaMask**:
   - Click on your account icon in MetaMask
   - Select a different account

3. **Reconnect**:
   - Click "Connect Wallet" in TerraLedger
   - Approve the new account connection

### Hardhat Test Accounts

Hardhat provides 20 test accounts. Here are the first few:

**Account #0 (Contract Owner - Admin)**
- Address: `0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266`
- Private Key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`

**Account #1 (Standard User)**
- Address: `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`
- Private Key: `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`

**Account #2 (Standard User)**
- Address: `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC`
- Private Key: `0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a`

## Common Issues

### Issue: "Access Denied" on Admin Panel
**Solution**: Make sure you're connected with the contract owner account (`0xf39fd...2266`)

### Issue: Transactions Failing
**Solution**: Ensure you're connected to the correct network (Hardhat Local on port 8545)

### Issue: Contract Not Found
**Solution**:
1. Make sure Hardhat node is running
2. Deploy the contract:
   ```bash
   npx hardhat ignition deploy ignition/modules/Deploy.js --network localhost
   ```
3. Update the contract address in `src/contractConfig.js`

### Issue: Cannot Connect Wallet
**Solution**:
1. Install MetaMask browser extension
2. Make sure you've added the Hardhat Local network
3. Import at least one Hardhat test account

## Security Note

The private keys listed above are from Hardhat's default test accounts and should **NEVER** be used on mainnet or with real funds. They are publicly known and only safe for local development.
