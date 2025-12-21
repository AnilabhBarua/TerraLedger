import { useEffect, useState, useCallback } from "react";
import { ethers, BrowserProvider } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../contractConfig";

export default function useAdmin() {
  const [account, setAccount] = useState(null);
  const [isAdmin, setIsAdmin] = useState(null);
  const [contract, setContract] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask to use this application!");
      return;
    }

    try {
      setIsConnecting(true);
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts"
      });

      if (accounts.length === 0) {
        setIsConnecting(false);
        return;
      }

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();

      setAccount(userAddress);

      const contractWithSigner = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );
      setContract(contractWithSigner);

      const owner = await contractWithSigner.owner();

      setIsAdmin(
        userAddress.toLowerCase() === owner.toLowerCase()
      );
    } catch (err) {
      console.error("Wallet connection failed:", err);
      alert("Failed to connect wallet: " + err.message);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setIsAdmin(null);
    setContract(null);
  }, []);

  const handleAccountsChanged = useCallback((accounts) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else {
      connectWallet();
    }
  }, [connectWallet, disconnectWallet]);

  const handleChainChanged = useCallback(() => {
    window.location.reload();
  }, []);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      window.ethereum.request({ method: "eth_accounts" })
        .then((accounts) => {
          if (accounts.length > 0) {
            connectWallet();
          }
        })
        .catch(console.error);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, [connectWallet, handleAccountsChanged, handleChainChanged]);

  return {
    account,
    isAdmin,
    contract,
    connectWallet,
    disconnectWallet,
    isConnecting
  };
}
