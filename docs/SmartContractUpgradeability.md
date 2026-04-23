# Smart Contract Upgradeability for TerraLedger

## Overview

TerraLedger's current smart contract, `TerraLedger.sol`, is deployed at a fixed address on the blockchain. Like all standard contracts, it is immutable by design — once deployed, its bytecode cannot be changed. While this immutability is the foundation of trustless systems, it presents a practical engineering challenge: **how do we fix bugs, add features, or adapt to regulatory changes without losing all of our property records?**

This document presents the architectural strategy for making TerraLedger upgradeable, explains the tradeoffs involved, and provides a step-by-step migration roadmap.

---

## The Problem: Why Immutability is Both a Feature and a Constraint

### Why Immutability Matters
Every property record, ownership transfer, and registered document hash is immutably stored in the contract's state on-chain. This is TerraLedger's primary value proposition — a tamper-evident, censorship-resistant land registry.

### Why We Still Need Upgrades
In a production land registry system, code changes are inevitable:
- **Bug Fixes**: A logical error in the `approveTransfer` function could permanently lock a property or transfer it to the wrong owner.
- **Regulatory Compliance**: Government land registry regulations evolve. New data fields (e.g., GPS coordinates, valuation metadata) may become legally mandated.
- **Feature Expansion**: Phase 4 features like fractional ownership, lease tracking, or collateral liens require new contract logic.
- **Security Patches**: A newly discovered vulnerability in an OpenZeppelin dependency must be patchable immediately.

The naive solution — deploy a new contract and migrate all data — is prohibitively expensive and risks data integrity during migration. The correct solution is a **Proxy Pattern**.

---

## The Proxy Pattern: Separating State from Logic

The core insight of upgradeable smart contracts is a separation of concerns:

| Concern | Contract | Stable? |
|---|---|---|
| **State** (property records, balances) | Proxy Contract | ✅ Never changes address |
| **Logic** (functions, business rules) | Implementation Contract | ✅ Swappable without touching state |

Users and the frontend **always interact with the Proxy**. The Proxy stores all state variables and simply **delegates all function calls** to the currently-registered Implementation contract using the EVM's `DELEGATECALL` opcode.

`DELEGATECALL` is the critical mechanism: it runs the implementation's code but inside the **storage context of the proxy**. This means property records stay at the proxy's address forever.

---

## The UUPS Standard: Our Recommended Pattern

OpenZeppelin provides three proxy patterns. We recommend **UUPS (Universal Upgradeable Proxy Standard)**, as defined in [EIP-1822](https://eips.ethereum.org/EIPS/eip-1822).

### Why UUPS over Transparent Proxy?

| Feature | Transparent Proxy | UUPS |
|---|---|---|
| Upgrade logic location | Proxy contract | Implementation contract |
| Gas cost per call | Higher (admin check on every call) | Lower (no admin check) |
| Deployment cost | Higher | Lower |
| Security model | Proxy handles access control | Implementation handles access control |
| OpenZeppelin recommendation | Legacy | **Current standard** |

### Why UUPS over Diamond (EIP-2535)?
The Diamond pattern supports multiple implementation contracts and is extremely powerful, but it introduces significant architectural complexity that is disproportionate for TerraLedger's scale. UUPS gives us 95% of the benefit with 20% of the complexity.

---

## Implementation Architecture

### Contract Structure

```
TerraLedger/
└── contracts/
    ├── TerraLedgerV1.sol          ← Current logic (to be migrated)
    ├── TerraLedgerV2.sol          ← Future upgraded logic
    └── proxy/
        └── ERC1967Proxy.sol       ← OpenZeppelin's UUPS Proxy (used as-is)
```

### TerraLedgerV1.sol (Upgraded Version)

The current `TerraLedger.sol` must be modified in the following ways to become UUPS-compatible:

**1. Replace constructor with `initialize()` function**

A UUPS proxy cannot use a `constructor` because the proxy's storage is separate from the implementation's. The initialization logic must be a regular function that can only be called once.

```solidity
// BEFORE (current)
contract TerraLedger is AccessControl {
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(AUTHORITY_ROLE, msg.sender);
    }
}

// AFTER (UUPS-compatible)
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

contract TerraLedgerV1 is Initializable, AccessControlUpgradeable, UUPSUpgradeable {
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers(); // Security: prevents initializing the implementation directly
    }
    
    function initialize(address authority) public initializer {
        __AccessControl_init();
        __UUPSUpgradeable_init();
        _grantRole(DEFAULT_ADMIN_ROLE, authority);
        _grantRole(AUTHORITY_ROLE, authority);
    }
    
    // Required by UUPS: restrict upgrade permissions to AUTHORITY_ROLE only
    function _authorizeUpgrade(address newImplementation)
        internal
        override
        onlyRole(AUTHORITY_ROLE)
    {}
}
```

**2. Storage Layout Rules (Critical)**

When deploying V2, you **must not change the order of existing state variables**. The EVM maps variables to storage slots by position, not by name.

```solidity
// ✅ SAFE V2 - only append new variables at the end
contract TerraLedgerV2 is TerraLedgerV1 {
    // All V1 variables inherited — do not reorder them!
    
    // New V2 fields added at the end
    mapping(uint256 => string) public gpsCoordinates;
    mapping(uint256 => uint256) public propertyValuation;
}

// ❌ DANGEROUS - inserting a variable in the middle corrupts all state
contract TerraLedgerV2_WRONG is TerraLedgerV1 {
    uint256 public newVar;  // This shifts all existing storage slots → data corruption!
    mapping(uint256 => Property) public properties;  // Now at wrong slot!
}
```

**OpenZeppelin's `@openzeppelin/upgrades-core` package enforces storage layout compatibility automatically during the build process.**

---

## Deployment Procedure

### First-Time Deployment (replacing the current contract)

```javascript
// ignition/modules/DeployUpgradeable.js
const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const { ethers, upgrades } = require("hardhat");

module.exports = buildModule("TerraLedgerUpgradeable", (m) => {
  // 1. Deploy the UUPS proxy + V1 implementation in one step
  const proxy = m.contract("TerraLedgerV1", [], {
    kind: "uups",
    initializer: "initialize",
    constructorArgs: [process.env.AUTHORITY_ADDRESS],
  });

  // proxy.address is now the PERMANENT address that never changes
  return { proxy };
});
```

### Upgrading to V2 (zero downtime)

```javascript
// scripts/upgradeToV2.js
const { ethers, upgrades } = require("hardhat");

async function main() {
  const proxyAddress = "0x..."; // The proxy address — never changes
  
  const TerraLedgerV2 = await ethers.getContractFactory("TerraLedgerV2");
  
  // This atomically: deploys V2, verifies storage compatibility, and updates the proxy
  const upgraded = await upgrades.upgradeProxy(proxyAddress, TerraLedgerV2);
  
  console.log("TerraLedger upgraded to V2 at proxy:", upgraded.target);
  // Property records, ownership history, and all state is preserved!
}
```

---

## Security Considerations

### 1. `_disableInitializers()` in Implementation Constructor
Without this, an attacker could directly initialize the implementation contract (not the proxy) and set themselves as the Authority, then attempt to exploit the takeover in unexpected ways. The `_disableInitializers()` call prevents any `initialize()` call on the bare implementation.

### 2. `_authorizeUpgrade()` Access Control
Only the `AUTHORITY_ROLE` can execute an upgrade. This ensures a single rogue Registrar cannot swap the logic contract. In a production deployment, the `AUTHORITY_ROLE` should be held by a **Gnosis Safe multi-sig wallet** requiring 2-of-3 or 3-of-5 signers.

### 3. Timelock for Upgrades
For maximum transparency, upgrades should be routed through a **TimelockController** (also from OpenZeppelin). A 48-hour delay between proposing and executing an upgrade gives the community time to audit the new implementation before it goes live.

```solidity
// Recommended production governance stack:
// Authority Multi-sig → TimelockController (48hr delay) → UUPSUpgradeable proxy
```

### 4. Storage Gap Pattern
When writing base contracts that will be inherited, reserve unused storage slots to prevent future storage collisions:

```solidity
contract TerraLedgerV1 is ... {
    // ... existing state ...
    
    // Reserve 50 slots for future V1 additions without breaking V2 inheritance
    uint256[50] private __gap;
}
```

---

## Testing Upgradeability

OpenZeppelin provides a testing plugin to validate storage layout safety before deployment:

```bash
npm install --save-dev @openzeppelin/hardhat-upgrades
```

```javascript
// test/upgrade.test.js
const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("TerraLedger Upgrade", () => {
  it("Should upgrade V1 to V2 preserving state", async () => {
    const [admin] = await ethers.getSigners();

    // Deploy V1
    const V1 = await ethers.getContractFactory("TerraLedgerV1");
    const proxy = await upgrades.deployProxy(V1, [admin.address], { kind: "uups" });

    // Register a property on V1
    await proxy.registerProperty(admin.address, "Block 7A", "450 sqm", "Residential", "");
    expect(await proxy.nextPropertyId()).to.equal(2n);

    // Upgrade to V2
    const V2 = await ethers.getContractFactory("TerraLedgerV2");
    const upgraded = await upgrades.upgradeProxy(await proxy.getAddress(), V2);

    // Verify state is preserved
    expect(await upgraded.nextPropertyId()).to.equal(2n);
    const prop = await upgraded.properties(1);
    expect(prop.location).to.equal("Block 7A");
  });
});
```

---

## Migration Roadmap

| Phase | Action | Risk |
|---|---|---|
| **Now** | Audit current `TerraLedger.sol` for state variable ordering | Low |
| **Next** | Create `TerraLedgerV1.sol` using `Initializable` + `UUPSUpgradeable` | Medium — requires redeployment |
| **Next** | Write upgrade tests against a local fork | Low |
| **Production** | Deploy behind a Gnosis Safe + TimelockController | High — requires multisig coordination |

---

## Why We Should Implement This

TerraLedger is designed to be a long-lived, production-grade land registry. A system that cannot be patched is a liability, not an asset. The UUPS pattern:

1. **Preserves data permanence** — the proxy address never changes, so historical records and external integrations remain stable.
2. **Enables iteration** — we can add GPS coordinates, fractional ownership, or lease tracking without a costly data migration.
3. **Meets audit standards** — auditors and institutional partners expect upgradeable architecture in land registry systems.
4. **Is battle-tested** — UUPS is used by Aave, Compound, and dozens of production DeFi protocols managing billions of dollars.
