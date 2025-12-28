import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { mockUser } from '../mockData';
import './Navbar.css';

function Navbar() {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="logo">
          <span className="logo-icon">🌍</span>
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
        </div>

        <div className="navbar-right">
          <Link to="/wallet" className="wallet-button">
            <span className="wallet-icon">👛</span>
            <span className="wallet-text">{mockUser.address.substring(0, 6)}...{mockUser.address.slice(-4)}</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
