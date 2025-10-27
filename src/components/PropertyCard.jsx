import React, { useState } from 'react';
import './PropertyCard.css';

function PropertyCard({ property, contract, account }) {
  const [newOwner, setNewOwner] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const isOwner = account && property.owner.toLowerCase() === account.toLowerCase();

  const handleTransfer = async (e) => {
    e.preventDefault();

    if (!newOwner) {
      setMessage({ type: 'error', text: 'Please enter a new owner address.' });
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: '', text: '' });

      const tx = await contract.transferOwnership(property.propertyId, newOwner);
      setMessage({ type: 'info', text: 'Transaction submitted. Waiting for confirmation...' });

      await tx.wait();

      setMessage({ type: 'success', text: 'Ownership transferred successfully!' });
      setNewOwner('');

      property.owner = newOwner;
    } catch (error) {
      console.error('Error transferring ownership:', error);
      setMessage({
        type: 'error',
        text: error.reason || error.message || 'Failed to transfer ownership. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="property-card">
      <div className="property-header">
        <h3>Property Details</h3>
        <span className="property-id-badge">ID: {property.propertyId}</span>
      </div>

      <div className="property-info">
        <div className="info-row">
          <span className="info-label">Location</span>
          <span className="info-value">{property.location}</span>
        </div>

        <div className="info-row">
          <span className="info-label">Current Owner</span>
          <span className="info-value owner-address">{property.owner}</span>
        </div>

        {isOwner && (
          <div className="owner-badge">
            You own this property
          </div>
        )}
      </div>

      {isOwner && (
        <div className="transfer-section">
          <h4>Transfer Ownership</h4>
          <form onSubmit={handleTransfer} className="transfer-form">
            <div className="form-group">
              <input
                type="text"
                placeholder="New owner address (0x...)"
                value={newOwner}
                onChange={(e) => setNewOwner(e.target.value)}
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
              className="transfer-btn"
              disabled={loading}
            >
              {loading ? 'Transferring...' : 'Transfer Ownership'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default PropertyCard;
