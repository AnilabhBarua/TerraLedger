# Multi-User Simulation Guide for TerraLedger

## Overview

This guide walks through a complete, end-to-end simulation of all TerraLedger user flows using three separate MetaMask wallet accounts. This tests the full Role-Based Access Control (RBAC) system and every possible transaction type: registration, transfer request, approval, and cancellation.

This guide works on both environments:
- **Local**: Hardhat running on `localhost:8545`
- **Testnet**: Deployed contract on Ethereum Sepolia

---

## Wallet Setup

You need three MetaMask accounts. Create them via **MetaMask → Add Account** and label them clearly:

| Label | Role in TerraLedger | Chain Required |
|---|---|---|
| `Account A — Authority` | Deploys contract, grants roles | Local / Sepolia |
| `Account B — Registrar` | Registers properties, approves transfers | Local / Sepolia |
| `Account C — Landowner` | Owns property, requests transfers | Local / Sepolia |

**For Local Testing:**
- Accounts A and B can be from the Hardhat pre-funded accounts (copy their private keys from the Hardhat node terminal output into MetaMask using "Import Account").
- Account C can be a third Hardhat account.

**For Sepolia Testing:**
- All three accounts need a small amount of Sepolia ETH from a faucet.

---

## Step 1: Initial Setup (Account A — Authority)

### 1.1 Connect to the App
1. Open TerraLedger in your browser.
2. Click the **Wallet** button in the navbar.
3. Connect **Account A** (the deployer wallet — the one that ran `deploy:sepolia` or `deploy:local`).
4. The app should show this account as connected.

### 1.2 Verify Authority Role
- Navigate to **Role Manager** (`/role-manager`).
- You should see a confirmation that the connected wallet holds the `AUTHORITY_ROLE`.
- If not, the wrong account is connected — switch in MetaMask to Account A.

---

## Step 2: Grant Registrar Role (Account A → Account B)

1. Still on Role Manager, in the **Grant Registrar Role** section:
   - Paste **Account B's** wallet address into the address field.
   - Click **Grant Role**.
   - MetaMask will pop up — confirm the transaction.
   - ✅ **Expected**: Toast notification shows "Role Granted" with gas and latency.

2. Switch MetaMask to **Account B**.
3. Reload TerraLedger.
4. Navigate to Role Manager — Account B should now show the `REGISTRAR_ROLE` badge.

---

## Step 3: Register a Property (Account B — Registrar)

1. Navigate to **Register Property** (`/register`).
2. Fill in the form:
   - **Owner Address**: Paste **Account C's** wallet address (the landowner).
   - **Location**: "123 Blockchain Avenue, Kolkata"
   - **Area**: "1200 sqm"
   - **Property Type**: "Residential"
   - **Document**: (Optional) Attach any PDF. It will be pinned to IPFS.
3. Click **Register Property**.
4. Watch the Toast notifications cycle through:
   - `Preparing Registration`
   - `Uploading to IPFS` (if document attached)
   - `Awaiting Signature` (MetaMask popup — confirm it)
   - `Transaction Sent`
   - ✅ `✅ Property Registered! • Gas: 52,841 • 1.24s`

**Expected Outcome:**
- Navigate to **Immutable Records** (`/records`).
- Property #1 should be visible, owned by Account C's address.

---

## Step 4: Initiate Ownership Transfer (Account C — Landowner)

Account C wants to sell their property to a fourth address (or back to Account A for simplicity).

1. Switch MetaMask to **Account C**.
2. Navigate to **Transfer Ownership** (`/transfer`).
3. Find **Property #1** in the list.
4. In the **New Owner Address** field, paste **Account A's** address.
5. Click **Request Transfer**.
6. Confirm in MetaMask.
7. ✅ **Expected**: Toast shows "Transfer Requested • Pending Registrar approval".

---

## Step 5: Approve the Transfer (Account B — Registrar)

1. Switch MetaMask to **Account B**.
2. Navigate to **Transfer Ownership** (`/transfer`).
3. Property #1 should now appear with a **"Pending Transfer"** status.
4. Click **Approve Transfer**.
5. Confirm in MetaMask.
6. ✅ **Expected**: Toast shows "Transfer Approved! • Ownership transferred".

**Verification:**
- Navigate to **Immutable Records** (`/records`).
- Property #1's owner should now be **Account A's** address.
- Navigate to **Transaction History** (`/transactions`).
- You should see two entries: 1 Registration + 1 Transfer, each with real gas used metrics.

---

## Step 6: Test Transfer Cancellation

1. Switch to the current owner (Account A after Step 5).
2. Navigate to **Transfer Ownership** and request a new transfer to any address.
3. Before a Registrar approves it, click **Cancel Transfer**.
4. ✅ **Expected**: Toast shows "Transfer Cancelled • Request withdrawn".
5. The property returns to "No pending transfer" status.

---

## Step 7: Test Role Revocation

1. Switch back to **Account A** (Authority).
2. Navigate to **Role Manager**.
3. In the **Revoke Registrar Role** section, paste **Account B's** address.
4. Click **Revoke Role** and confirm in MetaMask.
5. Switch to **Account B** and try to Register a new property.
6. ✅ **Expected**: Transaction will fail with an `AccessControl` revert error — Account B can no longer register properties.

---

## Step 8: Test Wrong Network Guard

1. In MetaMask, switch to **Ethereum Mainnet** (or any network other than the target).
2. Return to TerraLedger.
3. ✅ **Expected**:
   - The Navbar badge turns **red** showing "Wrong Network".
   - A persistent warning banner appears below the Navbar.
   - Clicking **"Switch to [target network]"** automatically triggers MetaMask to switch back.

---

## Expected Gas Cost Reference (Hardhat Local)

| Transaction Type | Approx. Gas Used | Notes |
|---|---|---|
| Deploy Contract | ~1,500,000 | One-time, paid by deployer |
| Grant Registrar Role | ~50,000 | AccessControl overhead |
| Register Property | ~150,000–200,000 | Higher with IPFS hash stored |
| Request Transfer | ~80,000 | Stores pending buyer address |
| Approve Transfer | ~60,000 | Updates owner mapping |
| Cancel Transfer | ~45,000 | Clears pending buyer |
| Revoke Role | ~35,000 | AccessControl operation |

On Sepolia, gas costs are the same in gas units but use test ETH with no real value.

---

## Troubleshooting

| Issue | Solution |
|---|---|
| "Execution reverted" on Register | Ensure connected wallet holds `REGISTRAR_ROLE` |
| "Wrong Network" banner on app load | MetaMask is on wrong chain — click the switch button |
| Property not showing in Records | Check you are connected to the correct network and Hardhat node is running (local only) |
| Transfer not showing for Registrar | Ensure the transfer was requested first by the current owner |
