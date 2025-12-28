import React, { useState } from 'react';
import { generateMockTransaction, generateBlockNumber } from '../mockData';
import './RegisterProperty.css';

function RegisterProperty() {
  const [ownerAddress, setOwnerAddress] = useState('');
  const [location, setLocation] = useState('');
  const [area, setArea] = useState('');
  const [propertyType, setPropertyType] = useState('Residential');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [transactionData, setTransactionData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    await new Promise(resolve => setTimeout(resolve, 2000));

    const txHash = generateMockTransaction();
    const blockNum = generateBlockNumber();

    setTransactionData({
      hash: txHash,
      blockNumber: blockNum,
      timestamp: new Date().toISOString(),
      gasUsed: '89234',
      gasPrice: '28 Gwei'
    });

    setLoading(false);
    setSuccess(true);

    setTimeout(() => {
      setOwnerAddress('');
      setLocation('');
      setArea('');
      setSuccess(false);
      setTransactionData(null);
    }, 10000);
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-header">
          <div className="header-icon">📝</div>
          <h1>Property Registration</h1>
          <p>Register a new property on the blockchain with permanent, immutable records</p>
        </div>

        {!success ? (
          <form onSubmit={handleSubmit} className="register-form">
            <div className="form-row">
              <div className="form-group">
                <label>Owner Address</label>
                <input
                  type="text"
                  placeholder="0x..."
                  value={ownerAddress}
                  onChange={(e) => setOwnerAddress(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Property Location</label>
                <input
                  type="text"
                  placeholder="Enter full property address"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Property Area</label>
                <input
                  type="text"
                  placeholder="e.g., 2,500 sq ft"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Property Type</label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  disabled={loading}
                >
                  <option value="Residential">Residential</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Industrial">Industrial</option>
                  <option value="Agricultural">Agricultural</option>
                </select>
              </div>
            </div>

            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Processing Transaction...
                </>
              ) : (
                'Register Property'
              )}
            </button>
          </form>
        ) : (
          <div className="success-container">
            <div className="success-icon">✓</div>
            <h2>Property Successfully Registered!</h2>
            <p>Your property has been permanently recorded on the blockchain</p>

            <div className="transaction-details">
              <h3>Transaction Details</h3>
              <div className="detail-row">
                <span className="detail-label">Transaction Hash:</span>
                <span className="detail-value hash">{transactionData.hash}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Block Number:</span>
                <span className="detail-value">{transactionData.blockNumber.toLocaleString()}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Timestamp:</span>
                <span className="detail-value">{new Date(transactionData.timestamp).toLocaleString()}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Gas Used:</span>
                <span className="detail-value">{transactionData.gasUsed}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Gas Price:</span>
                <span className="detail-value">{transactionData.gasPrice}</span>
              </div>
            </div>

            <div className="property-summary">
              <h3>Property Information</h3>
              <div className="summary-grid">
                <div className="summary-item">
                  <span className="summary-label">Owner</span>
                  <span className="summary-value">{ownerAddress}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Location</span>
                  <span className="summary-value">{location}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Area</span>
                  <span className="summary-value">{area}</span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Type</span>
                  <span className="summary-value">{propertyType}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="info-section">
          <h3>Why Register on Blockchain?</h3>
          <div className="info-grid">
            <div className="info-card">
              <span className="info-icon">🔒</span>
              <h4>Permanent Records</h4>
              <p>Once registered, your property record cannot be altered or deleted</p>
            </div>
            <div className="info-card">
              <span className="info-icon">✅</span>
              <h4>Instant Verification</h4>
              <p>Anyone can verify ownership instantly without intermediaries</p>
            </div>
            <div className="info-card">
              <span className="info-icon">🛡️</span>
              <h4>Fraud Prevention</h4>
              <p>Cryptographic security eliminates the risk of forged documents</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterProperty;
