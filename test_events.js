import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./src/contractConfig.js";

async function main() {
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

    console.log("Fetching events...");
    
    try {
        const filterReg = contract.filters.PropertyRegistered();
        const logsReg = await contract.queryFilter(filterReg, 0, 'latest');
        
        console.log("Logs found:", logsReg.length);
        
        for (const log of logsReg) {
            console.log("Log Hash:", log.transactionHash);
            const block = await provider.getBlock(log.blockHash);
            console.log("Block:", block.number);
            const tx = await provider.getTransaction(log.transactionHash);
            console.log("Tx gasPrice:", tx.gasPrice);
            
            // test formatUnits
            try {
                const gasStr = ethers.formatUnits(tx.gasPrice || 0n, 'gwei');
                console.log("formatted gas:", gasStr);
            } catch (e) {
                console.log("formatUnits error:", e.message);
            }
        }
        
        // Also test ImmutableRecords logic
        const nextId = await contract.nextPropertyId();
        console.log("nextId:", nextId.toString());
        for (let i = 1; i < Number(nextId); i++) {
            const p = await contract.properties(i);
            console.log("Property", i, "Registered:", p.isRegistered);
        }

    } catch(e) {
        console.error("Error:", e);
    }
}

main();
