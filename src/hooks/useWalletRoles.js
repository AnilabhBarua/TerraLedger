/**
 * useWalletRoles.js
 *
 * Reads the connected wallet's roles LIVE from the contract on every mount
 * and whenever the account or chain changes.
 *
 * Returns { address, isAdmin, isRegistrar, loading }
 * - isAdmin    → holds AUTHORITY_ROLE
 * - isRegistrar → holds REGISTRAR_ROLE (also true when isAdmin is true)
 */
import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../contractConfig';

export default function useWalletRoles() {
  const [address, setAddress] = useState(
    () => localStorage.getItem('wallet_user_address') || null
  );
  const [isAdmin, setIsAdmin] = useState(false);
  const [isRegistrar, setIsRegistrar] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!window.ethereum) {
      setIsAdmin(false);
      setIsRegistrar(false);
      setLoading(false);
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (!accounts || accounts.length === 0) {
        setAddress(null);
        setIsAdmin(false);
        setIsRegistrar(false);
        setLoading(false);
        return;
      }

      const account = accounts[0];
      setAddress(account);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

      const [authorityRole, registrarRole] = await Promise.all([
        contract.AUTHORITY_ROLE(),
        contract.REGISTRAR_ROLE(),
      ]);

      const [hasAuthority, hasRegistrar] = await Promise.all([
        contract.hasRole(authorityRole, account),
        contract.hasRole(registrarRole, account),
      ]);

      setIsAdmin(hasAuthority);
      // Admins (Authority) can also act as registrars
      setIsRegistrar(hasAuthority || hasRegistrar);
    } catch (err) {
      console.warn('useWalletRoles: could not query contract roles.', err);
      // Fallback to localStorage cache while contract may be unreachable
      setIsAdmin(localStorage.getItem('wallet_is_admin') === 'true');
      setIsRegistrar(
        localStorage.getItem('wallet_is_admin') === 'true' ||
          localStorage.getItem('wallet_is_registrar') === 'true'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();

    const onAccountsChanged = () => refresh();
    const onChainChanged = () => refresh();

    window.ethereum?.on('accountsChanged', onAccountsChanged);
    window.ethereum?.on('chainChanged', onChainChanged);

    return () => {
      window.ethereum?.removeListener('accountsChanged', onAccountsChanged);
      window.ethereum?.removeListener('chainChanged', onChainChanged);
    };
  }, [refresh]);

  return { address, isAdmin, isRegistrar, loading, refresh };
}
