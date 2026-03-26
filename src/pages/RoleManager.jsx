import React, { useState } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../contractConfig';
import './RoleManager.css';

function RoleManager() {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const userIsAdmin = localStorage.getItem('wallet_is_admin') === 'true';

  const handleRoleAction = async (action) => {
    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      setMessage({ type: 'error', text: 'Valid Ethereum address required.' });
      return;
    }
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    if (!window.ethereum) {
      setMessage({ type: 'error', text: 'MetaMask is required.' });
      setLoading(false);
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      
      let tx;
      if (action === 'add') {
        tx = await contract.addRegistrar(address);
      } else {
        tx = await contract.removeRegistrar(address);
      }
      setMessage({ type: 'info', text: 'Transaction pending...' });
      await tx.wait();
      setMessage({ type: 'success', text: `Registrar role ${action === 'add' ? 'granted' : 'revoked'} successfully.` });
      setAddress('');
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: err.reason || err.message || 'Transaction failed.' });
    } finally {
      setLoading(false);
    }
  };

  if (!userIsAdmin) {
    return (
      <div className="role-manager-page">
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>Only the Authority can manage roles.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="role-manager-page">
      <div className="role-manager-container">
        <h1>Role Management</h1>
        <p>Grant or revoke Registrar privileges.</p>
        
        <div className="form-group">
          <input 
            type="text" 
            placeholder="User Address (0x...)" 
            value={address} 
            onChange={(e) => setAddress(e.target.value)}
            disabled={loading}
          />
        </div>
        
        {message.text && (
          <div className={`message message-${message.type}`}>
            {message.text}
          </div>
        )}
        
        <div className="button-group">
          <button 
            className="btn-add" 
            onClick={() => handleRoleAction('add')} 
            disabled={loading}
          >
            Grant Registrar Role
          </button>
          <button 
            className="btn-remove" 
            onClick={() => handleRoleAction('remove')} 
            disabled={loading}
          >
            Revoke Registrar Role
          </button>
        </div>
      </div>
    </div>
  );
}

export default RoleManager;
