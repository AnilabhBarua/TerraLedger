import React, { useState } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../contractConfig';
import { useToast } from '../components/Toast';
import './RoleManager.css';

function RoleManager() {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const { addToast, updateToast } = useToast();
  const userIsAdmin = localStorage.getItem('wallet_is_admin') === 'true';

  const handleRoleAction = async (action) => {
    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      addToast('Invalid Address', 'Please enter a valid Ethereum address (0x…).', 'error', 5000);
      return;
    }
    setLoading(true);

    if (!window.ethereum) {
      addToast('MetaMask Required', 'Please install MetaMask to continue.', 'error', 5000);
      setLoading(false);
      return;
    }

    const actionLabel = action === 'add' ? 'Granting' : 'Revoking';
    const toastId = addToast(`${actionLabel} Registrar Role`, 'Awaiting MetaMask signature…', 'pending', 0);

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
      updateToast(toastId, 'Transaction Sent', 'Waiting for block confirmation…', 'pending', 0);
      const miningStart = performance.now();
      await tx.wait();
      const latencySec = ((performance.now() - miningStart) / 1000).toFixed(2);
      updateToast(
        toastId,
        `\u2705 Role ${action === 'add' ? 'Granted' : 'Revoked'}`,
        `${action === 'add' ? 'Granted to' : 'Revoked from'} ${address.slice(0, 16)}\u2026 \u2022 Gas included \u2022 ${latencySec}s`,
        'success',
        6000
      );
      setAddress('');
    } catch (err) {
      console.error(err);
      updateToast(toastId, 'Transaction Failed', err.reason || err.message || 'Transaction failed.', 'error', 7000);
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
