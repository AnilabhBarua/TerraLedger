// src/components/Sidebar.jsx
import React from "react";
import "./Sidebar.css";

export default function Sidebar({
  isAdmin,
  currentView,
  setCurrentView,
  account
}) {
  return (
    <aside className="sidebar">
      <h2>🌍 TerraLedger</h2>

      <button
        className={currentView === "search" ? "active" : ""}
        onClick={() => setCurrentView("search")}
      >
        Property Search
      </button>

      {isAdmin === true && (
        <button
          className={currentView === "admin" ? "active" : ""}
          onClick={() => setCurrentView("admin")}
        >
          Admin Panel
        </button>
      )}

      <footer>
        <small>
          {account
            ? `${account.slice(0, 6)}...${account.slice(-4)}`
            : "No wallet"}
        </small>
      </footer>
    </aside>
  );
}
