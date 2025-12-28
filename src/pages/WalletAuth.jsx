import React, { useState, useEffect } from 'react';
import { getCurrentUser } from '../mockData';
import './WalletAuth.css';

function WalletAuth() {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [currentUser, setCurrentUser] = useState(getCurrentUser());

  useEffect(() => {
    const persisted = localStorage.getItem('wallet_connected') === 'true';
    const storedAddr = localStorage.getItem('wallet_user_address');
    const actualUser = getCurrentUser();
    setCurrentUser(actualUser);

    if (persisted && storedAddr && storedAddr.toLowerCase() === actualUser.address.toLowerCase()) {
      setConnected(true);
    } else {
      setConnected(false);
      localStorage.removeItem('wallet_connected');
      localStorage.removeItem('wallet_user_address');
    }
  }, []);

  const handleConnect = async () => {
    setConnecting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setConnected(true);
    setConnecting(false);
    const user = getCurrentUser();
    setCurrentUser(user);
    try {
      localStorage.setItem('wallet_connected', 'true');
      localStorage.setItem('wallet_user_address', user.address);
    } catch (e) {
      // ignore localStorage errors in environments where it's not available
    }
  };

  const handleDisconnect = () => {
    setConnected(false);
    try {
      localStorage.removeItem('wallet_connected');
      localStorage.removeItem('wallet_user_address');
    } catch (e) {}
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
                  <div className="detail-label">Account Type</div>
                  <div className="detail-value">{currentUser.isAdmin ? 'Admin' : 'Standard'}</div>
                </div>
                <div className="detail-card">
                  <div className="detail-label">Status</div>
                  <div className="detail-value status-active">Active</div>
                </div>
              </div>

              <div className="permissions">
                <h3>Granted Permissions</h3>
                <div className="permission-list">
                  <div className="permission-item">
                    <span className="permission-icon">✓</span>
                    <div>
                      <div className="permission-name">Property Registration</div>
                      <div className="permission-desc">Create new property records</div>
                    </div>
                  </div>
                  <div className="permission-item">
                    <span className="permission-icon">✓</span>
                    <div>
                      <div className="permission-name">Ownership Transfer</div>
                      <div className="permission-desc">Transfer property ownership</div>
                    </div>
                  </div>
                  <div className="permission-item">
                    <span className="permission-icon">✓</span>
                    <div>
                      <div className="permission-name">Record Verification</div>
                      <div className="permission-desc">Verify and audit property records</div>
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
