# TerraLedger Development Guide

Complete guide for developers working on TerraLedger.

## Project Structure

```
terraledger/
├── contracts/
│   └── TerraLedger.sol          # Main smart contract
├── scripts/
│   ├── seed-properties.ts       # Deployment & seeding script
│   └── send-op-tx.ts           # Utility script
├── src/
│   ├── components/
│   │   ├── Sidebar.jsx         # Navigation sidebar
│   │   ├── AdminPanel.jsx      # Admin features
│   │   ├── SearchPortal.jsx    # Property search
│   │   └── PropertyCard.jsx    # Property details
│   ├── hooks/
│   │   └── useAdmin.js         # Admin state hook
│   ├── App.jsx                 # Main application
│   └── contractConfig.js       # Contract configuration
├── ignition/                    # Hardhat Ignition deployments
├── test/                        # Smart contract tests
├── hardhat.config.cts          # Hardhat configuration
├── DEMO_SETUP.md              # User setup guide
└── DEVELOPMENT.md             # This file
```

## Smart Contract Architecture

### TerraLedger.sol

The core contract manages property registration and ownership transfer.

**Key Data Structures:**
```solidity
struct Property {
    uint256 propertyId;    // Unique identifier
    address owner;         // Current owner address
    string location;       // Property location
    bool isRegistered;     // Registration status
}

mapping(uint256 => Property) public properties;  // Property storage
uint256 public nextPropertyId = 1;               // Counter for IDs
address public owner;                            // Contract deployer
```

**Key Functions:**

1. **registerProperty(address _propertyOwner, string memory _location)**
   - Admin only (contract owner)
   - Creates new property with auto-incrementing ID
   - Assigns ownership to specified address
   - Sets isRegistered to true

2. **transferOwnership(uint256 _propertyId, address _newOwner)**
   - Any property owner can call
   - Verifies property exists and caller owns it
   - Updates owner to new address
   - No approval mechanism (direct transfer)

## Development Workflow

### 1. Local Blockchain Setup

**Start the blockchain:**
```bash
./start-blockchain.sh  # macOS/Linux
# or
start-blockchain.bat   # Windows
```

This runs Hardhat node at http://localhost:8545 with 20 test accounts.

### 2. Deploy & Seed Data

**In another terminal:**
```bash
./seed-data.sh        # macOS/Linux
# or
seed-data.bat         # Windows
```

This:
- Deploys TerraLedger contract
- Registers 8 test properties
- Displays contract address and test accounts

### 3. Start Frontend

```bash
npm run dev
```

Opens React app at http://localhost:5173

### 4. Test in Browser

1. Open MetaMask and switch to "Localhost 31337"
2. Import test accounts from Hardhat node output
3. Connect wallet in the app
4. Test property search and transfers

## Frontend Components

### App.jsx

Main component that:
- Manages wallet connection
- Routes between views (search/admin)
- Displays top bar with account info
- Handles user interactions

### Sidebar.jsx

Navigation component with:
- Logo and branding
- Navigation items (Property Search, Admin Panel)
- Current account display
- Active view highlighting

### SearchPortal.jsx

Property search interface:
- Search by property ID
- Display property details
- Transfer form (for property owner)
- Error/success messages

### PropertyCard.jsx

Reusable property display:
- Shows property info (ID, location, owner)
- Transfer ownership form
- Input validation
- Transaction status

### AdminPanel.jsx

Admin-only interface for:
- Registering new properties
- Setting owner address
- Entering location
- Success/error feedback

## Contract Configuration

Edit `/src/contractConfig.js` to point to your deployed contract:

```javascript
export const CONTRACT_ADDRESS = "0x...";  // From seed output
export const CHAIN_ID = 31337;            // Hardhat chain ID
export const RPC_URL = "http://localhost:8545";
```

When you redeploy the contract, update this file with the new address.

## Testing

### Run Tests

```bash
npx hardhat test
```

Tests are in `/test/TerraLedger.test.js`

### Manual Testing Checklist

- [ ] Connect wallet (multiple accounts)
- [ ] View registered properties
- [ ] Search by property ID
- [ ] View property details
- [ ] Transfer property (as owner)
- [ ] Register property (as admin)
- [ ] Switch accounts and verify permissions
- [ ] Test error messages

## Contract Modification Workflow

### 1. Edit Contract

Modify `/contracts/TerraLedger.sol`

### 2. Restart Blockchain

```bash
# Stop Hardhat node (Ctrl+C)
./start-blockchain.sh
```

### 3. Redeploy

```bash
./seed-data.sh
```

### 4. Update Contract Address

Copy new address to `/src/contractConfig.js`

### 5. Refresh Browser

The app will use the new contract

## Common Tasks

### Add a New Property Function

1. Add function to `TerraLedger.sol`
2. Rebuild: `npx hardhat compile`
3. Update contract ABI (happens automatically)
4. Call from frontend using ethers

### Add a New Frontend Component

1. Create component in `/src/components/`
2. Add corresponding CSS file
3. Import in `App.jsx`
4. Add view toggle in Sidebar

### Debug Smart Contract

**Using Hardhat console:**
```bash
npx hardhat console --network localhost
```

**Example:**
```javascript
const contract = await ethers.getContractAt(
  "TerraLedger",
  "0x..."
);
const prop = await contract.properties(1);
console.log(prop);
```

## Deployment to Testnet

### Prerequisites
- Testnet ETH for gas fees
- RPC endpoint (Infura, Alchemy, etc.)
- Private key of deployer account

### Steps

1. **Update hardhat.config.cts:**
```typescript
networks: {
  sepolia: {
    url: process.env.SEPOLIA_RPC,
    accounts: [process.env.PRIVATE_KEY]
  }
}
```

2. **Deploy:**
```bash
npx hardhat ignition deploy ignition/modules/Deploy.js --network sepolia
```

3. **Update contract address** in `contractConfig.js`

4. **Update MetaMask** to Sepolia network

## Environment Variables

If needed for production deployment:

```
.env
SEPOLIA_RPC=https://sepolia.infura.io/v3/YOUR_KEY
PRIVATE_KEY=0x...
ETHERSCAN_API_KEY=...
```

**Never commit .env to version control**

## Performance Considerations

- Properties mapping uses direct uint256 keys (O(1) lookup)
- No loops in contract functions
- Frontend pagination could be added for many properties
- Consider indexing for event-based property discovery

## Security Considerations

**Current Implementation:**
- Only contract owner can register properties
- Only owner can transfer their property
- No approval mechanism needed (direct transfer)

**For Production:**
- Add formal audits
- Implement ERC721 for NFT standard
- Add multi-sig for admin functions
- Consider governance token
- Add access control (roles/permissions)

## Troubleshooting

### "Cannot find contract at address"
- Check contract address in `contractConfig.js`
- Run `./seed-data.sh` again
- Ensure Hardhat node is still running

### "Method not found" error
- Contract may not match ABI
- Redeploy contract
- Check contract address

### MetaMask won't connect
- Network must be "Localhost 31337"
- Check RPC URL: http://localhost:8545
- Try refreshing page or clearing MetaMask cache

### Permission denied when running scripts
```bash
chmod +x start-blockchain.sh seed-data.sh  # macOS/Linux
```

## Learning Resources

- [Solidity Docs](https://docs.soliditylang.org/)
- [Hardhat Docs](https://hardhat.org/docs)
- [ethers.js Docs](https://docs.ethers.org/)
- [MetaMask Docs](https://docs.metamask.io/)

## Next Steps

- Implement ERC721 standard for true NFTs
- Add metadata (images, descriptions, history)
- Implement property listing/marketplace
- Add transaction history
- Create mobile app
- Deploy to mainnet
