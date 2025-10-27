import React, { useState } from 'react';
import './AdminPanel.css';

function AdminPanel({ contract }) {
  const [newOwnerAddress, setNewOwnerAddress] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleRegisterProperty = async (e) => {
    e.preventDefault();

    if (!newOwnerAddress || !location) {
      setMessage({ type: 'error', text: 'Please fill in all fields.' });
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: '', text: '' });

      const tx = await contract.registerProperty(newOwnerAddress, location);
      setMessage({ type: 'info', text: 'Transaction submitted. Waiting for confirmation...' });

      await tx.wait();

      setMessage({ type: 'success', text: 'Property registered successfully!' });
      setNewOwnerAddress('');
      setLocation('');
    } catch (error) {
      console.error('Error registering property:', error);
      setMessage({
        type: 'error',
        text: error.reason || error.message || 'Failed to register property. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-panel">
      <div className="panel-header">
        <h2>Admin Panel</h2>
        <p>Register new properties to the TerraLedger blockchain</p>
      </div>

      <div className="admin-card">
        <form onSubmit={handleRegisterProperty} className="admin-form">
          <div className="form-group">
            <label htmlFor="ownerAddress">New Owner Address</label>
            <input
              type="text"
              id="ownerAddress"
              placeholder="0x..."
              value={newOwnerAddress}
              onChange={(e) => setNewOwnerAddress(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="location">Property Location</label>
            <input
              type="text"
              id="location"
              placeholder="Enter property location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={loading}
            />
          </div>

          {message.text && (
            <div className={`message message-${message.type}`}>
              {message.text}
            </div>
          )}

          <button
            type="submit"
            className="register-btn"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register Property'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminPanel;
