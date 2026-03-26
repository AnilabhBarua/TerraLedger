// src/hooks/useAdmin.js
import { useEffect, useState, useCallback } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../contractConfig";

export default function useAdmin() {
  const [account, setAccount] = useState(null);
  const [isAdmin, setIsAdmin] = useState(null);
  const [isRegistrar, setIsRegistrar] = useState(null);
  const [contract, setContract] = useState(null);

  const checkAdmin = useCallback(async () => {
    if (!window.ethereum) {
      setIsAdmin(false);
      return;
    }

    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();

      setAccount(userAddress);

      const contractInstance = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        provider
      );
      setContract(contractInstance);

      const authorityRole = await contractInstance.AUTHORITY_ROLE();
      const registrarRole = await contractInstance.REGISTRAR_ROLE();
      
      const hasAuthority = await contractInstance.hasRole(authorityRole, userAddress);
      const hasRegistrar = await contractInstance.hasRole(registrarRole, userAddress);

      setIsAdmin(hasAuthority);
      setIsRegistrar(hasRegistrar);
    } catch (err) {
      console.error("Admin check failed:", err);
      setIsAdmin(false);
      setIsRegistrar(false);
    }
  }, []);

  useEffect(() => {
    checkAdmin();

    window.ethereum?.on("accountsChanged", checkAdmin);
    window.ethereum?.on("chainChanged", checkAdmin);

    return () => {
      window.ethereum?.removeListener("accountsChanged", checkAdmin);
      window.ethereum?.removeListener("chainChanged", checkAdmin);
    };
  }, [checkAdmin]);

  return { account, isAdmin, isRegistrar, contract, refresh: checkAdmin };
}
