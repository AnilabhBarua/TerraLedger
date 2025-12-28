const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying TerraLedger contract...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  console.log("💰 Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString(), "wei\n");

  const TerraLedger = await hre.ethers.getContractFactory("TerraLedger");
  const terraLedger = await TerraLedger.deploy();
  await terraLedger.waitForDeployment();

  const contractAddress = await terraLedger.getAddress();

  console.log("✅ TerraLedger deployed to:", contractAddress);
  console.log("👤 Contract owner:", await terraLedger.owner());
  console.log("\n" + "=".repeat(60));
  console.log("🔧 IMPORTANT: Update CONTRACT_ADDRESS in src/contractConfig.js");
  console.log("=".repeat(60));
  console.log(`\nCopy this address: ${contractAddress}\n`);

  return contractAddress;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
