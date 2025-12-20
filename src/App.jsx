// src/App.jsx
import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import AdminPanel from "./components/AdminPanel";
import SearchPortal from "./components/SearchPortal";
import useAdmin from "./hooks/useAdmin";
import "./App.css";

function App() {
  const { account, isAdmin, contract, refresh } = useAdmin();
  const [view, setView] = useState("search");

  return (
    <div className="app-container">
      {/* Sidebar */}
      <Sidebar
        isAdmin={isAdmin}
        currentView={view}
        setCurrentView={setView}
        account={account}
      />

      {/* Main Area */}
      <div className="content-container">
        <header className="top-bar">
          <div>
            <strong>
              {account
                ? `Connected: ${account.slice(0, 6)}...${account.slice(-4)}`
                : "No wallet"}
            </strong>
            <p>
              {isAdmin === null
                ? "Checking admin..."
                : isAdmin
                ? "Admin user"
                : "Standard user"}
            </p>
          </div>

          <button onClick={refresh}>Refresh</button>
        </header>

        <main className="page-content">
          {view === "search" && (
            <SearchPortal contract={contract} account={account} />
          )}

          {view === "admin" && isAdmin && (
            <AdminPanel contract={contract} account={account} />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
