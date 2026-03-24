import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './src/contractConfig.js';

async function test() {
  const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
  
  try {
      const nextId = await contract.nextPropertyId();
      console.log("On-chain nextPropertyId:", nextId.toString());
      
      const filterReg = contract.filters.PropertyRegistered();
      const logs = await contract.queryFilter(filterReg, 0, 'latest');
      console.log("PropertyRegistered logs found:", logs.length);
      
      if (Number(nextId) > 1) {
         const p1 = await contract.properties(1);
         console.log("Property 1 exists, owner:", p1.owner);
      }
  } catch (error) {
      console.error("Local RPC error:", error);
  }
}
test().catch(console.error);
