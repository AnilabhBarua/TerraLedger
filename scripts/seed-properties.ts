import { ethers } from "hardhat";

async function main() {
  const [deployer, addr1, addr2, addr3, addr4, addr5] = await ethers.getSigners();

  console.log("Deploying TerraLedger contract...");
  console.log("Deployer address:", deployer.address);

  const TerraLedger = await ethers.getContractFactory("TerraLedger");
  const contract = await TerraLedger.deploy();
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log("TerraLedger deployed to:", contractAddress);

  const testProperties = [
    {
      owner: addr1.address,
      location: "123 Main Street, Brooklyn, NY 11201",
    },
    {
      owner: addr2.address,
      location: "456 Park Avenue, Manhattan, NY 10022",
    },
    {
      owner: addr3.address,
      location: "789 Ocean Drive, Miami Beach, FL 33139",
    },
    {
      owner: addr4.address,
      location: "321 Sunset Boulevard, Los Angeles, CA 90028",
    },
    {
      owner: addr5.address,
      location: "654 Market Street, San Francisco, CA 94103",
    },
    {
      owner: addr1.address,
      location: "987 Michigan Avenue, Chicago, IL 60611",
    },
    {
      owner: addr2.address,
      location: "147 Spring Street, New York, NY 10012",
    },
    {
      owner: addr3.address,
      location: "258 Washington Street, Boston, MA 02108",
    },
  ];

  console.log("\nRegistering test properties...");
  for (const property of testProperties) {
    const tx = await contract.registerProperty(
      property.owner,
      property.location
    );
    await tx.wait();
    console.log(
      `Registered property at ${property.location} for ${property.owner.slice(0, 6)}...${property.owner.slice(-4)}`
    );
  }

  console.log("\nTest accounts for MetaMask:");
  console.log("=".repeat(70));
  const accounts = [deployer, addr1, addr2, addr3, addr4, addr5];
  accounts.forEach((account, index) => {
    console.log(
      `Account ${index}: ${account.address} (has private key from local node)`
    );
  });

  console.log("\n=".repeat(70));
  console.log("Contract Configuration for Frontend:");
  console.log("=".repeat(70));
  console.log(`CONTRACT_ADDRESS=${contractAddress}`);
  console.log(`CHAIN_ID=31337`);
  console.log(`RPC_URL=http://localhost:8545`);

  console.log("\n=".repeat(70));
  console.log("All test properties registered successfully!");
  console.log("Total properties:", testProperties.length);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
