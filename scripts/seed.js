const hre = require("hardhat");

async function main() {
  console.log("🌱 Seeding TerraLedger with test data...\n");

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  const [admin, owner1, owner2, owner3, owner4] = await hre.ethers.getSigners();

  console.log("👤 Admin account:", admin.address);
  console.log("👥 Test accounts:", [owner1.address, owner2.address, owner3.address, owner4.address].join(", "));
  console.log();

  const TerraLedger = await hre.ethers.getContractFactory("TerraLedger");
  const terraLedger = TerraLedger.attach(contractAddress);

  const properties = [
    { owner: owner1.address, location: "123 Blockchain Avenue, Crypto City, CC 90001" },
    { owner: owner2.address, location: "456 Smart Contract Street, DeFi District, DD 90002" },
    { owner: owner3.address, location: "789 Ethereum Lane, Web3 Valley, WV 90003" },
    { owner: owner4.address, location: "321 Bitcoin Boulevard, Token Town, TT 90004" },
    { owner: admin.address, location: "555 Decentralized Drive, MetaMask Manor, MM 90005" }
  ];

  console.log("📝 Registering properties...\n");

  for (let i = 0; i < properties.length; i++) {
    const { owner, location } = properties[i];
    const tx = await terraLedger.connect(admin).registerProperty(owner, location);
    await tx.wait();
    console.log(`✅ Property ${i + 1} registered:`);
    console.log(`   Owner: ${owner}`);
    console.log(`   Location: ${location}\n`);
  }

  console.log("=".repeat(80));
  console.log("🎉 SUCCESS! Seeded", properties.length, "properties");
  console.log("=".repeat(80));
  console.log("\n📋 Test Account Details:\n");
  console.log("Admin (Contract Owner):");
  console.log(`  Address: ${admin.address}`);
  console.log(`  Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`);
  console.log();
  console.log("Property Owner 1:");
  console.log(`  Address: ${owner1.address}`);
  console.log(`  Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`);
  console.log();
  console.log("Property Owner 2:");
  console.log(`  Address: ${owner2.address}`);
  console.log(`  Private Key: 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a`);
  console.log();
  console.log("Property Owner 3:");
  console.log(`  Address: ${owner3.address}`);
  console.log(`  Private Key: 0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6`);
  console.log();
  console.log("Property Owner 4:");
  console.log(`  Address: ${owner4.address}`);
  console.log(`  Private Key: 0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a`);
  console.log();
  console.log("=".repeat(80));
  console.log("💡 Import any of these private keys into MetaMask to test the application");
  console.log("=".repeat(80));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
