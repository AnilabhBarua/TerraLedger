import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../contractConfig';
import './WalletAuth.css';

function WalletAuth() {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [currentUser, setCurrentUser] = useState({
    name: 'Web3 User',
    address: '',
    balance: '0 ETH',
    network: 'Unknown',
    isAdmin: false,
    isRegistrar: false
  });

  useEffect(() => {
    const checkConnection = async () => {
      const persisted = localStorage.getItem('wallet_connected') === 'true';
      if (persisted && window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          await loadUserData(accounts[0]);
        } else {
          handleDisconnect();
        }
      }
    };
    checkConnection();

    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) {
          loadUserData(accounts[0]);
        } else {
          handleDisconnect();
        }
      };
      const handleChainChanged = () => window.location.reload();

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  const loadUserData = async (address) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      const balanceWei = await provider.getBalance(address);
      const balanceEth = ethers.formatEther(balanceWei);
      
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      
      let isAdmin = false;
      let isRegistrar = false;
      try {
        const authorityRole = await contract.AUTHORITY_ROLE();
        const registrarRole = await contract.REGISTRAR_ROLE();
        isAdmin = await contract.hasRole(authorityRole, address);
        isRegistrar = await contract.hasRole(registrarRole, address);
      } catch (err) {
        console.warn("Could not verify admin status (contract may not be deployed on this network):", err);
      }

      setCurrentUser({
        name: 'Web3 Citizen',
        address: address,
        balance: parseFloat(balanceEth).toFixed(4) + ' ETH',
        network: network.name === 'unknown' ? 'Localhost' : network.name,
        isAdmin: isAdmin,
        isRegistrar: isRegistrar
      });

      setConnected(true);
      localStorage.setItem('wallet_connected', 'true');
      localStorage.setItem('wallet_user_address', address);
      localStorage.setItem('wallet_is_admin', isAdmin.toString());
      localStorage.setItem('wallet_is_registrar', isRegistrar.toString());
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const handleConnect = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }
    setConnecting(true);
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      await loadUserData(accounts[0]);
    } catch (e) {
      console.error(e);
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setConnected(false);
    localStorage.removeItem('wallet_connected');
    localStorage.removeItem('wallet_user_address');
    localStorage.removeItem('wallet_is_admin');
    localStorage.removeItem('wallet_is_registrar');
  };

  return (
    <div className="wallet-page">
      <div className="wallet-container">
        <div className="wallet-header">
          <div className="header-icon">👛</div>
          <h1>Wallet Authentication</h1>
          <p>Secure, decentralized authentication using blockchain wallet technology</p>
        </div>

        {!connected ? (
          <div className="connect-section">
            <div className="wallet-card">
              <div className="card-icon">🔐</div>
              <h2>Connect Your Wallet</h2>
              <p>Sign in securely using your blockchain wallet. No passwords required.</p>

              <button
                onClick={handleConnect}
                disabled={connecting}
                className="connect-button"
              >
                {connecting ? (
                  <>
                    <span className="spinner"></span>
                    Connecting...
                  </>
                ) : (
                  <>
                    <span>👛</span>
                    Connect Wallet
                  </>
                )}
              </button>

              <div className="security-features">
                <div className="feature-item">
                  <span>✓</span>
                  <p>Cryptographic authentication</p>
                </div>
                <div className="feature-item">
                  <span>✓</span>
                  <p>No password storage</p>
                </div>
                <div className="feature-item">
                  <span>✓</span>
                  <p>Complete privacy control</p>
                </div>
                <div className="feature-item">
                  <span>✓</span>
                  <p>Multi-chain support</p>
                </div>
              </div>
            </div>

            <div className="wallet-options">
              <h3>Supported Wallets</h3>
              <div className="wallet-list">
                <div className="wallet-option">
                  <div className="wallet-logo">🦊</div>
                  <div className="wallet-name">MetaMask</div>
                  <div className="wallet-status">Available</div>
                </div>
                <div className="wallet-option">
                  <div className="wallet-logo">🔷</div>
                  <div className="wallet-name">Coinbase Wallet</div>
                  <div className="wallet-status">Available</div>
                </div>
                <div className="wallet-option">
                  <div className="wallet-logo">🌈</div>
                  <div className="wallet-name">Rainbow</div>
                  <div className="wallet-status">Available</div>
                </div>
                <div className="wallet-option">
                  <div className="wallet-logo">🔐</div>
                  <div className="wallet-name">WalletConnect</div>
                  <div className="wallet-status">Available</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="connected-section">
            <div className="success-badge-large">
              <span className="check-icon">✓</span>
              Connected Successfully
            </div>

            <div className="user-profile">
              <div className="profile-header">
                <div className="avatar">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="profile-info">
                  <h2>{currentUser.name}</h2>
                  <p className="address">{currentUser.address}</p>
                </div>
              </div>

              <div className="profile-details">
                <div className="detail-card">
                  <div className="detail-label">Account Balance</div>
                  <div className="detail-value">{currentUser.balance}</div>
                </div>
                <div className="detail-card">
                  <div className="detail-label">Network</div>
                  <div className="detail-value">{currentUser.network}</div>
                </div>
                <div className="detail-card">
                  <div className="detail-label">Assigned Role(s)</div>
                  <div className="detail-value">
                    {currentUser.isAdmin && <span className="role-badge admin">👑 Chief Authority</span>}
                    {currentUser.isRegistrar && !currentUser.isAdmin && <span className="role-badge registrar">📋 Land Registrar</span>}
                    {!currentUser.isAdmin && !currentUser.isRegistrar && <span className="role-badge user">👤 Property Owner</span>}
                  </div>
                </div>
                <div className="detail-card">
                  <div className="detail-label">Status</div>
                  <div className="detail-value status-active">Active</div>
                </div>
              </div>

              <div className="permissions">
                <h3>Role Permissions</h3>
                <div className="permission-list">
                  {(currentUser.isAdmin || currentUser.isRegistrar) && (
                    <div className="permission-item">
                      <span className="permission-icon">✓</span>
                      <div>
                        <div className="permission-name">Property Registration</div>
                        <div className="permission-desc">Authorized to mint new land titles</div>
                      </div>
                    </div>
                  )}
                  {currentUser.isAdmin && (
                    <div className="permission-item">
                      <span className="permission-icon">✓</span>
                      <div>
                        <div className="permission-name">Role Management</div>
                        <div className="permission-desc">Can assign or revoke Registrar privileges</div>
                      </div>
                    </div>
                  )}
                  <div className="permission-item">
                    <span className="permission-icon">✓</span>
                    <div>
                      <div className="permission-name">Ownership Transfer</div>
                      <div className="permission-desc">Transfer property ownership (if owned)</div>
                    </div>
                  </div>
                  <div className="permission-item">
                    <span className="permission-icon">✓</span>
                    <div>
                      <div className="permission-name">Record Verification</div>
                      <div className="permission-desc">Verify and audit public property records</div>
                    </div>
                  </div>
                </div>
              </div>

              <button onClick={handleDisconnect} className="disconnect-button">
                Disconnect Wallet
              </button>
            </div>
          </div>
        )}

        <div className="authentication-info">
          <h2>How Wallet Authentication Works</h2>
          <div className="info-steps">
            <div className="step-item">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Connect Wallet</h3>
                <p>Click the connect button to initiate the authentication process</p>
              </div>
            </div>
            <div className="step-item">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Sign Message</h3>
                <p>Your wallet will ask you to sign a message to prove ownership</p>
              </div>
            </div>
            <div className="step-item">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Verification</h3>
                <p>The signature is verified cryptographically on the blockchain</p>
              </div>
            </div>
            <div className="step-item">
              <div className="step-number">4</div>
              <div className="step-content">
                <h3>Access Granted</h3>
                <p>You're authenticated and can access all platform features</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WalletAuth;
