import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Sidebar from './components/Sidebar';
import AdminPanel from './components/AdminPanel';
import SearchPortal from './components/SearchPortal';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './contractConfig';
import './App.css';

function App() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentView, setCurrentView] = useState('search');
  const [loading, setLoading] = useState(false);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('Please install MetaMask to use this application!');
      return;
    }

    try {
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const userAccount = accounts[0];
      setAccount(userAccount);

      const signer = await provider.getSigner();
      const contractInstance = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );
      setContract(contractInstance);

      const contractOwner = await contractInstance.owner();
      setIsAdmin(contractOwner.toLowerCase() === userAccount.toLowerCase());
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          if (contract) {
            contract.owner().then((owner) => {
              setIsAdmin(owner.toLowerCase() === accounts[0].toLowerCase());
            });
          }
        } else {
          setAccount(null);
          setContract(null);
          setIsAdmin(false);
        }
      });
    }
  }, [contract]);

  return (
    <div className="app">
      <Sidebar
        isAdmin={isAdmin}
        currentView={currentView}
        setCurrentView={setCurrentView}
        account={account}
      />
      <div className="main-content">
        <header className="header">
          <div className="header-content">
            <h1>TerraLedger</h1>
            <p className="subtitle">Blockchain Land Registry System</p>
          </div>
          {!account ? (
            <button
              className="connect-btn"
              onClick={connectWallet}
              disabled={loading}
            >
              {loading ? 'Connecting...' : 'Connect Wallet'}
            </button>
          ) : (
            <div className="wallet-info">
              <div className="account-badge">
                {isAdmin && <span className="admin-tag">ADMIN</span>}
                <span className="address">
                  {account.slice(0, 6)}...{account.slice(-4)}
                </span>
              </div>
            </div>
          )}
        </header>

        <div className="content-area">
          {!account ? (
            <div className="welcome-screen">
              <div className="welcome-card">
                <h2>Welcome to TerraLedger</h2>
                <p>Connect your wallet to access the decentralized land registry system.</p>
                <div className="features">
                  <div className="feature">
                    <div className="feature-icon">🔍</div>
                    <h3>Search Properties</h3>
                    <p>Look up any registered property by ID</p>
                  </div>
                  <div className="feature">
                    <div className="feature-icon">🔐</div>
                    <h3>Secure Transfer</h3>
                    <p>Transfer property ownership securely on-chain</p>
                  </div>
                  <div className="feature">
                    <div className="feature-icon">📝</div>
                    <h3>Register New Properties</h3>
                    <p>Admins can register new properties to the ledger</p>
                  </div>
                </div>
              </div>
            </div>
          ) : currentView === 'search' ? (
            <SearchPortal contract={contract} account={account} />
          ) : (
            <AdminPanel contract={contract} />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
