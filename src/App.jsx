import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import RegisterProperty from './pages/RegisterProperty';
import TransferOwnership from './pages/TransferOwnership';
import ImmutableRecords from './pages/ImmutableRecords';
import PropertySearch from './pages/PropertySearch';
import TransactionHistory from './pages/TransactionHistory';
import WalletAuth from './pages/WalletAuth';
import './App.css';

function App() {
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
        </Routes>
      </div>
    </Router>
  );
}

export default App;
