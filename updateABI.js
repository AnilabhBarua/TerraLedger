const fs = require('fs');
try {
  const artifactPath = './artifacts/contracts/TerraLedger.sol/TerraLedger.json';
  const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
  const configPath = './src/contractConfig.js';
  
  let configStr = fs.readFileSync(configPath, 'utf8');
  
  // Replace everything from `export const CONTRACT_ABI = [` to the end of the file/array
  configStr = configStr.replace(/export const CONTRACT_ABI = \[[\s\S]*\];/, 'export const CONTRACT_ABI = ' + JSON.stringify(artifact.abi, null, 2) + ';');
  
  fs.writeFileSync(configPath, configStr);
  console.log('Successfully updated CONTRACT_ABI in contractConfig.js');
} catch (e) {
  console.error('Failed to update ABI:', e);
}
