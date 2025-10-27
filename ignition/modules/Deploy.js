import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

// We changed 'module.exports =' to 'export default'
export default buildModule("TerraLedgerModule", (m) => {
  // This line is the same
  const terraLedger = m.contract("TerraLedger");

  // We return the deployed contract instance
  return { terraLedger };
});
