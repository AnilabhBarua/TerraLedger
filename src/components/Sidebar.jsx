import React from 'react';
import './Sidebar.css';

export default function Sidebar({
  isAdmin,
  currentView,
  setCurrentView,
  account
}) {
  return (
    <aside className="sidebar">
      <h2>TerraLedger</h2>

      <button
        className={currentView === 'search' ? 'active' : ''}
        onClick={() => setCurrentView('search')}
      >
        Property Search
      </button>

      {isAdmin && (
        <button
          className={currentView === 'admin' ? 'active' : ''}
          onClick={() => setCurrentView('admin')}
        >
          Admin Panel
        </button>
      )}

      <div className="sidebar-account">
        {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Not connected'}
      </div>
    </aside>
  );
}
