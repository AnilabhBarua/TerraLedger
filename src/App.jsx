import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import AdminPanel from "./components/AdminPanel";
import SearchPortal from "./components/SearchPortal";
import useAdmin from "./hooks/useAdmin";
import "./App.css";

function App() {
  const {
    account,
    isAdmin,
    contract,
    connectWallet,
    disconnectWallet,
    isConnecting
  } = useAdmin();
  const [view, setView] = useState("search");

  return (
    <div className="app-container">
      <Sidebar
        isAdmin={isAdmin}
        currentView={view}
        setCurrentView={setView}
        account={account}
      />

      <div className="content-container">
        <header className="top-bar">
          <div className="wallet-info">
            {account ? (
              <>
                <div className="account-display">
                  <span className="account-label">Connected</span>
                  <span className="account-address">
                    {account.slice(0, 6)}...{account.slice(-4)}
                  </span>
                </div>
                <div className="account-role">
                  {isAdmin === null
                    ? "Checking role..."
                    : isAdmin
                    ? "Admin"
                    : "Standard User"}
                </div>
              </>
            ) : (
              <div className="no-wallet">Wallet Not Connected</div>
            )}
          </div>

          <div className="wallet-actions">
            {account ? (
              <button className="btn-disconnect" onClick={disconnectWallet}>
                Disconnect
              </button>
            ) : (
              <button
                className="btn-connect"
                onClick={connectWallet}
                disabled={isConnecting}
              >
                {isConnecting ? "Connecting..." : "Connect Wallet"}
              </button>
            )}
          </div>
        </header>

        <main className="page-content">
          {!account ? (
            <div className="connect-prompt">
              <div className="connect-card">
                <h2>Welcome to TerraLedger</h2>
                <p>Connect your wallet to get started</p>
                <button
                  className="btn-connect-large"
                  onClick={connectWallet}
                  disabled={isConnecting}
                >
                  {isConnecting ? "Connecting..." : "Connect Wallet"}
                </button>
              </div>
            </div>
          ) : (
            <>
              {view === "search" && (
                <SearchPortal contract={contract} account={account} />
              )}

              {view === "admin" && isAdmin && (
                <AdminPanel contract={contract} account={account} />
              )}

              {view === "admin" && !isAdmin && (
                <div className="access-denied">
                  <h2>Access Denied</h2>
                  <p>You need admin privileges to access this panel.</p>
                  <p className="admin-hint">
                    Only the contract owner can register properties.
                  </p>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
