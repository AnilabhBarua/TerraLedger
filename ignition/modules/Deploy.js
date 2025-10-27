const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("TerraLedgerModule", (m) => {
  // This is the line that deploys our 'TerraLedger' contract.
  const terraLedger = m.contract("TerraLedger");

  // We return the deployed contract instance.
  return { terraLedger };
});