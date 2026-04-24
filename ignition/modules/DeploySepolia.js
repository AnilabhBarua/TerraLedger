// Sepolia Deployment Module
// This is identical to Deploy.js but intended for the Sepolia testnet.
// Run with: npm run deploy:sepolia

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("TerraLedgerSepolia", (m) => {
  const terraLedger = m.contract("TerraLedger");
  return { terraLedger };
});
