import hre from "hardhat";

async function main() {
  const TerraLedger = await hre.ethers.getContractFactory("TerraLedger");

  const terraLedger = await TerraLedger.deploy();

  // Ethers v6 fix
  await terraLedger.waitForDeployment();

  console.log("TerraLedger deployed to:", terraLedger.target);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
