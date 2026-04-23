import { useState, useEffect, useCallback } from 'react';

// Supported networks configuration
export const SUPPORTED_NETWORKS = {
  31337: {
    chainId: '0x7A69',
    chainName: 'Hardhat Local',
    rpcUrls: ['http://127.0.0.1:8545'],
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    blockExplorerUrls: [],
  },
  // Add more networks here when deploying to testnet/mainnet
  // 11155111: {
  //   chainId: '0xAA36A7',
  //   chainName: 'Sepolia Testnet',
  //   rpcUrls: ['https://rpc.sepolia.org'],
  //   nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
  //   blockExplorerUrls: ['https://sepolia.etherscan.io'],
  // },
};

// The target chain ID the app is deployed on
export const TARGET_CHAIN_ID = 31337;

/**
 * useNetwork — monitors the connected wallet's chain and exposes helpers
 * to detect mismatches and trigger automatic network switching.
 */
export default function useNetwork() {
  const [chainId, setChainId] = useState(null);
  const [isSwitching, setIsSwitching] = useState(false);
  const [switchError, setSwitchError] = useState(null);

  const isCorrectNetwork = chainId === TARGET_CHAIN_ID;
  const networkName = SUPPORTED_NETWORKS[chainId]?.chainName ?? `Chain ${chainId}`;

  // Fetch the current chain ID from MetaMask
  const fetchChainId = useCallback(async () => {
    if (!window.ethereum) return;
    try {
      const hex = await window.ethereum.request({ method: 'eth_chainId' });
      setChainId(parseInt(hex, 16));
    } catch (err) {
      console.error('useNetwork: failed to fetch chainId', err);
    }
  }, []);

  useEffect(() => {
    fetchChainId();

    const handleChainChanged = (hex) => {
      setChainId(parseInt(hex, 16));
      setSwitchError(null);
    };

    window.ethereum?.on('chainChanged', handleChainChanged);
    return () => {
      window.ethereum?.removeListener('chainChanged', handleChainChanged);
    };
  }, [fetchChainId]);

  /**
   * switchToCorrectNetwork — attempts to switch MetaMask to TARGET_CHAIN_ID.
   * If the network isn't known to MetaMask yet, it will attempt to add it first.
   */
  const switchToCorrectNetwork = useCallback(async () => {
    if (!window.ethereum) return;
    const target = SUPPORTED_NETWORKS[TARGET_CHAIN_ID];
    if (!target) return;

    setIsSwitching(true);
    setSwitchError(null);

    try {
      // Try switching first (works if the chain is already in MetaMask)
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: target.chainId }],
      });
    } catch (switchErr) {
      // Error code 4902 = chain not added to MetaMask yet → add it
      if (switchErr.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [target],
          });
        } catch (addErr) {
          setSwitchError(addErr.message || 'Failed to add network.');
        }
      } else if (switchErr.code !== 4001) {
        // 4001 = user rejected, ignore silently
        setSwitchError(switchErr.message || 'Failed to switch network.');
      }
    } finally {
      setIsSwitching(false);
    }
  }, []);

  return {
    chainId,
    isCorrectNetwork,
    networkName,
    isSwitching,
    switchError,
    switchToCorrectNetwork,
  };
}
