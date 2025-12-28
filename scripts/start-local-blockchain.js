const { execSync } = require('child_process');

console.log("🔷 TerraLedger Local Blockchain Setup");
console.log("=".repeat(80));
console.log();

try {
  console.log("Step 1: Starting Hardhat local blockchain node...");
  console.log("=".repeat(80));
  console.log();
  console.log("⚠️  Keep this terminal open while developing!");
  console.log();
  console.log("📍 Network: Hardhat Local");
  console.log("🌐 RPC URL: http://127.0.0.1:8545");
  console.log("🔗 Chain ID: 31337");
  console.log();
  console.log("After the node starts, open a NEW terminal and run:");
  console.log("  npm run deploy:local");
  console.log("  npm run seed");
  console.log();
  console.log("=".repeat(80));
  console.log();

  execSync('npx hardhat node', { stdio: 'inherit' });
} catch (error) {
  console.error("Error starting blockchain:", error.message);
  process.exit(1);
}
