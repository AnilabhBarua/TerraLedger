# TerraLedger Demo Guide

Quick demonstration scenarios for showcasing TerraLedger's blockchain land registry system.

---

## Demo Overview

TerraLedger demonstrates a decentralized land registry where:
- Property ownership is recorded on an immutable blockchain
- Only rightful owners can transfer their properties
- An admin can register new properties
- All transactions are transparent and verifiable

---

## Quick Start (5 Minutes)

### 1. Start the System
```bash
# Terminal 1: Start blockchain
npm run blockchain

# Terminal 2: Deploy and seed
npm run deploy:local
npm run seed

# Terminal 3: Start app
npm run dev
```

### 2. Setup MetaMask
- Add network: http://127.0.0.1:8545, Chain ID: 31337
- Import admin key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`

### 3. Open Application
- Visit http://localhost:3000
- Connect MetaMask
- Start exploring!

---

## Demo Scenario 1: Property Search (2 minutes)

**Purpose:** Show how anyone can verify property ownership.

1. **Search for a Property**
   - Enter property ID: `1`
   - Click "Search"
   - Show the property details:
     - Property ID
     - Current owner address
     - Location

2. **Explain:**
   - This data lives on the blockchain
   - It cannot be altered or deleted
   - Anyone can verify ownership
   - Perfect transparency for land records

---

## Demo Scenario 2: Ownership Transfer (3 minutes)

**Purpose:** Demonstrate secure property transfer between owners.

**Setup:**
- Import Owner 1 account in MetaMask
- Private key: `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`

**Steps:**

1. **Verify Ownership**
   - Search for property ID: `1`
   - Show "You own this property" badge
   - Point out the transfer section appears

2. **Attempt Transfer**
   - Enter new owner address: `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC`
   - Click "Transfer Ownership"
   - Show MetaMask transaction popup
   - Explain the smart contract security checks

3. **Confirm Transaction**
   - Click "Confirm" in MetaMask
   - Show the pending message
   - Wait for blockchain confirmation
   - Show success message

4. **Verify Transfer**
   - Search property ID `1` again
   - Show the new owner address
   - Explain the transfer is now permanent and recorded on blockchain

**Explain:**
- Only the rightful owner can initiate transfer
- Smart contract enforces this (try transferring someone else's property - it fails)
- Once confirmed, the transfer is immutable
- No intermediary needed (lawyers, government offices)

---

## Demo Scenario 3: Failed Transfer (Security) (2 minutes)

**Purpose:** Show the security features that prevent fraud.

**Setup:**
- Stay on Owner 1 account OR switch to any other account

**Steps:**

1. **Try to Transfer Someone Else's Property**
   - Search for property ID: `2` (owned by someone else)
   - Notice: No transfer section appears (you don't own it)
   - Show this is enforced by the frontend

2. **Explain Backend Security**
   - Even if someone bypasses the UI
   - The smart contract will reject unauthorized transfers
   - Smart contract checks: `msg.sender == property.owner`
   - Blockchain ensures only legitimate owners can transfer

3. **Try to Transfer Non-existent Property**
   - Search for property ID: `999`
   - Show error: "Property not found"
   - Smart contract validates property exists before any transfer

**Explain:**
- Multiple layers of security
- Frontend validation (user experience)
- Smart contract validation (security guarantee)
- Cryptographic signatures ensure authenticity

---

## Demo Scenario 4: Admin Registration (3 minutes)

**Purpose:** Show how new properties enter the system.

**Setup:**
- Import admin account in MetaMask
- Private key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
- Switch to admin account

**Steps:**

1. **Access Admin Panel**
   - Show the "Admin Panel" option in sidebar (only visible to admin)
   - Click "Admin Panel"

2. **Register New Property**
   - Enter new owner address: `0x90F79bf6EB2c4f870365E785982E1f101E93b906`
   - Enter location: `999 Demo Street, Blockchain City, BC 12345`
   - Click "Register Property"
   - Confirm in MetaMask

3. **Verify Registration**
   - Wait for confirmation
   - Note the new property ID
   - Go back to "Property Search"
   - Search for the new property ID
   - Show it now exists with the specified owner

**Explain:**
- In a real system, the admin represents a government land registry office
- Only authorized admin can add new properties to the system
- Prevents unauthorized creation of fake property records
- This is the "mint" process for real estate NFTs
- Each property gets a unique ID on the blockchain

---

## Demo Scenario 5: Multi-Account Switching (2 minutes)

**Purpose:** Show different user perspectives.

**Setup:**
- Have 2-3 accounts imported in MetaMask

**Steps:**

1. **Admin View**
   - Switch to admin account
   - Show admin panel access
   - Show properties owned by admin

2. **Property Owner View**
   - Switch to Owner 1 account
   - Search their property (ID: 1)
   - Show transfer capabilities

3. **Observer View**
   - Switch to an account that owns no properties
   - Search any property
   - Show read-only view (no transfer option)

**Explain:**
- Different users have different capabilities
- All enforced by smart contract logic
- Demonstrates real-world roles in land registry

---

## Key Talking Points

### Problem It Solves
- Traditional land registries are centralized and vulnerable to:
  - Fraud (fake documents, altered records)
  - Corruption (bribes to change ownership)
  - Disasters (fire, flooding destroys paper records)
  - Inefficiency (slow transfers, high fees)

### Blockchain Solution
- **Immutable:** Once recorded, cannot be altered or deleted
- **Transparent:** Anyone can verify ownership
- **Secure:** Cryptographic signatures prevent fraud
- **Efficient:** No intermediaries needed
- **Permanent:** Blockchain never loses data

### Technical Highlights
- **Smart Contract:** Written in Solidity, deployed on Ethereum
- **Frontend:** React app with ethers.js for blockchain interaction
- **Wallet Integration:** MetaMask for secure transaction signing
- **Local Development:** Hardhat for testing before real deployment

### Real-World Applications
- Land registries (like we're demonstrating)
- Vehicle title management
- Supply chain tracking
- Digital identity systems
- Any system requiring proof of ownership

---

## Advanced Demo: Read the Blockchain (2 minutes)

**Purpose:** Show that data truly lives on the blockchain.

**Steps:**

1. **Open Hardhat Console**
```bash
npx hardhat console --network localhost
```

2. **Query the Contract Directly**
```javascript
const TerraLedger = await ethers.getContractFactory("TerraLedger");
const contract = TerraLedger.attach("0x5FbDB2315678afecb367f032d93F642f64180aa3");

// Get property details
const property = await contract.properties(1);
console.log("Property ID:", property.propertyId.toString());
console.log("Owner:", property.owner);
console.log("Location:", property.location);
console.log("Registered:", property.isRegistered);
```

**Explain:**
- The data is stored on the blockchain, not in our app
- Our app just provides a nice interface to interact with it
- Anyone can read this data directly from the blockchain
- True decentralization and transparency

---

## Common Questions

**Q: Is this using real money?**
A: No, it's a local test blockchain. The ETH is fake and worthless. For production, you'd deploy to a real network.

**Q: Can this scale to millions of properties?**
A: Yes, but gas fees on Ethereum mainnet would be high. You'd likely use a Layer 2 solution or alternative blockchain for production.

**Q: What happens if I lose my private key?**
A: You permanently lose access to your property. That's why key management is crucial in blockchain systems. Solutions include multi-signature wallets and social recovery.

**Q: Can the government shut this down?**
A: If deployed to a public blockchain like Ethereum, no single entity can shut it down. The blockchain runs on thousands of nodes worldwide.

**Q: How is this different from a regular database?**
A: Databases can be altered, hacked, or shut down by whoever controls them. Blockchain is decentralized, immutable, and transparent.

---

## Demo Tips

1. **Prepare in Advance**
   - Have blockchain running
   - Contract deployed and seeded
   - MetaMask configured with 2-3 accounts
   - Test the flow once before presenting

2. **Keep It Simple**
   - Start with searching (easiest to understand)
   - Move to transfers (shows the power)
   - End with admin (shows governance)

3. **Visual Flow**
   - Keep MetaMask visible during transactions
   - Show the "pending" states
   - Celebrate successful transactions
   - Point out the blockchain confirmations

4. **Handle Questions**
   - Be honest about limitations (gas fees, scalability)
   - Emphasize this is a proof of concept
   - Discuss production considerations
   - Connect to real-world use cases

5. **Time Management**
   - Full demo: 15-20 minutes
   - Quick demo: 5-7 minutes (just scenarios 1 & 2)
   - Deep dive: 30+ minutes (include advanced sections)

---

## Cleanup After Demo

```bash
# Stop blockchain (Ctrl+C in blockchain terminal)
# That's it! Everything resets when you restart.
```

---

## Making It Your Own

Want to customize for your demo?

1. **Edit Seed Data** (`scripts/seed.js`)
   - Change property locations
   - Add more properties
   - Use meaningful addresses

2. **Customize Styling**
   - Update colors in CSS files
   - Change the logo/branding
   - Adjust the layout

3. **Add Features**
   - Property images
   - Price information
   - Transaction history
   - Multi-signature transfers

---

Good luck with your demo! 🎬
