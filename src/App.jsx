import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import RegisterProperty from './pages/RegisterProperty';
import TransferOwnership from './pages/TransferOwnership';
import ImmutableRecords from './pages/ImmutableRecords';
import PropertySearch from './pages/PropertySearch';
import TransactionHistory from './pages/TransactionHistory';
import WalletAuth from './pages/WalletAuth';
import RoleManager from './pages/RoleManager';
import './App.css';

function App() {
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) {
          localStorage.setItem('wallet_user_address', accounts[0]);
          window.dispatchEvent(new Event('storage'));
        } else {
          localStorage.removeItem('wallet_connected');
          localStorage.removeItem('wallet_user_address');
          localStorage.removeItem('wallet_is_admin');
          window.dispatchEvent(new Event('storage'));
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, []);

  return (
    <Router>
      <div className="app">
        <Navbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/register" element={<RegisterProperty />} />
          <Route path="/transfer" element={<TransferOwnership />} />
          <Route path="/records" element={<ImmutableRecords />} />
          <Route path="/search" element={<PropertySearch />} />
          <Route path="/transactions" element={<TransactionHistory />} />
          <Route path="/wallet" element={<WalletAuth />} />
          <Route path="/roles" element={<RoleManager />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
