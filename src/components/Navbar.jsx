import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import useNetwork from '../hooks/useNetwork';
import terraLogo from '../icons/SmallSquareLogoJpg.jpg';
import './Navbar.css';

function Navbar() {
  const location = useLocation();
  const [walletAddress, setWalletAddress] = useState(localStorage.getItem('wallet_user_address'));
  const [userIsAdmin, setUserIsAdmin] = useState(localStorage.getItem('wallet_is_admin') === 'true');
  const { chainId, isCorrectNetwork, networkName, switchToCorrectNetwork } = useNetwork();

  useEffect(() => {
    // Simple polling to catch localStorage updates since 'storage' event only fires across tabs
    const interval = setInterval(() => {
      setWalletAddress(localStorage.getItem('wallet_user_address'));
      setUserIsAdmin(localStorage.getItem('wallet_is_admin') === 'true');
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="logo">
          <img src={terraLogo} alt="TerraLedger" className="logo-img" />
          <span className="logo-text">TerraLedger</span>
        </Link>

        <div className="nav-links">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
            Dashboard
          </Link>
          <Link to="/register" className={`nav-link ${isActive('/register') ? 'active' : ''}`}>
            Register
          </Link>
          <Link to="/transfer" className={`nav-link ${isActive('/transfer') ? 'active' : ''}`}>
            Transfer
          </Link>
          <Link to="/records" className={`nav-link ${isActive('/records') ? 'active' : ''}`}>
            Records
          </Link>
          <Link to="/search" className={`nav-link ${isActive('/search') ? 'active' : ''}`}>
            Search
          </Link>
          <Link to="/transactions" className={`nav-link ${isActive('/transactions') ? 'active' : ''}`}>
            Transactions
          </Link>
          {userIsAdmin && (
            <Link to="/roles" className={`nav-link ${isActive('/roles') ? 'active' : ''}`}>
              Roles
            </Link>
          )}
        </div>

        <div className="navbar-right">
          {/* Live network badge — only show when wallet is connected */}
          {chainId !== null && (
            <div
              className={`network-badge ${isCorrectNetwork ? 'network-badge--ok' : 'network-badge--wrong'}`}
              onClick={!isCorrectNetwork ? switchToCorrectNetwork : undefined}
              title={isCorrectNetwork ? `Connected to ${networkName}` : `Wrong network — click to switch to Hardhat Local`}
            >
              <span className="network-badge__dot" />
              {isCorrectNetwork ? networkName : `Wrong Network`}
            </div>
          )}
          <Link to="/wallet" className="wallet-button">
            <span className="wallet-icon">👛</span>
            <span className="wallet-text">
              {walletAddress ? `${walletAddress.substring(0, 6)}...${walletAddress.slice(-4)}` : 'Connect'}
            </span>
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
