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
    <div className="app-root">
      <Sidebar
        isAdmin={isAdmin}
        currentView={view}
        setCurrentView={setView}
        account={account}
      />

      <main className="main-content">
        <header className="app-header">
          <p>{account ? `Connected: ${account}` : "Not connected"}</p>
          {isAdmin === null && <small>Checking admin...</small>}
          {isAdmin === true && <small>Admin detected</small>}
          {isAdmin === false && <small>Standard user</small>}
          <button onClick={refresh}>Refresh</button>
        </header>

        {view === "search" && (
          <SearchPortal contract={contract} account={account} />
        )}

        {view === "admin" && isAdmin && (
          <AdminPanel contract={contract} account={account} />
        )}
      </main>
    </div>
  );
}

export default App;
