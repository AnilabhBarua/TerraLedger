import fs from 'fs';

try {
  const artifactPath = './artifacts/contracts/TerraLedger.sol/TerraLedger.json';
  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
  
  const deployPath = './ignition/deployments/chain-31337/deployed_addresses.json';
  let addr = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  if (fs.existsSync(deployPath)) {
      const deployData = JSON.parse(fs.readFileSync(deployPath, 'utf8'));
      addr = deployData['TerraLedgerModule#TerraLedger'] || addr;
  }
  
  const configPath = './src/contractConfig.js';
  let configStr = fs.readFileSync(configPath, 'utf8');
  
  configStr = configStr.replace(/export const CONTRACT_ADDRESS = ".*";/, `export const CONTRACT_ADDRESS = "${addr}";`);
  configStr = configStr.replace(/export const CONTRACT_ABI = \[[\s\S]*\];/, 'export const CONTRACT_ABI = ' + JSON.stringify(artifact.abi, null, 2) + ';');
  
  fs.writeFileSync(configPath, configStr);
  console.log('Successfully updated CONTRACT_ABI and CONTRACT_ADDRESS');
} catch (e) {
  console.error('Failed to update ABI:', e);
}
