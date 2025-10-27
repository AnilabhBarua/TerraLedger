import React from 'react';
import './Sidebar.css';

function Sidebar({ isAdmin, currentView, setCurrentView, account }) {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <span className="logo-icon">🌍</span>
          <span className="logo-text">TerraLedger</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <button
          className={`nav-item ${currentView === 'search' ? 'active' : ''}`}
          onClick={() => setCurrentView('search')}
          disabled={!account}
        >
          <span className="nav-icon">🔍</span>
          <span className="nav-text">Public Search</span>
        </button>

        {isAdmin && (
          <button
            className={`nav-item ${currentView === 'admin' ? 'active' : ''}`}
            onClick={() => setCurrentView('admin')}
          >
            <span className="nav-icon">⚙️</span>
            <span className="nav-text">Admin Panel</span>
          </button>
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="footer-content">
          <p className="footer-title">Blockchain Registry</p>
          <p className="footer-subtitle">Secure & Transparent</p>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
