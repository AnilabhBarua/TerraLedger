import React, { useState } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../contractConfig';
import './RegisterProperty.css';

function RegisterProperty() {
  const [ownerAddress, setOwnerAddress] = useState('');
  const [location, setLocation] = useState('');
  const [area, setArea] = useState('');
  const [propertyType, setPropertyType] = useState('Residential');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [transactionData, setTransactionData] = useState(null);
  const [errors, setErrors] = useState({});

  const userIsAdmin = localStorage.getItem('wallet_is_admin') === 'true';
  const userIsRegistrar = localStorage.getItem('wallet_is_registrar') === 'true';
  const canRegister = userIsAdmin || userIsRegistrar;
  const currentUserAddress = localStorage.getItem('wallet_user_address') || 'Not Connected';

  // Simple validation for ethereum address
  const isValidEthereumAddress = (address) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  // Validate all form inputs
  const validateForm = () => {
    const newErrors = {};

    // Validate Owner Address
    if (!ownerAddress.trim()) {
      newErrors.ownerAddress = 'Owner address is required.';
    } else if (!isValidEthereumAddress(ownerAddress)) {
      newErrors.ownerAddress = 'Invalid Ethereum address. Must start with 0x followed by 40 hex characters.';
    }

    // Validate Location
    if (!location.trim()) {
      newErrors.location = 'Property location is required.';
    } else if (location.trim().length < 10) {
      newErrors.location = 'Location must be at least 10 characters long.';
    }

    // Validate Area
    if (!area.trim()) {
      newErrors.area = 'Property area is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({});

    // Validate form
    if (!validateForm()) {
      return;
    }

    if (!window.ethereum) {
      setErrors({ submit: "MetaMask is not installed" });
      return;
    }

    setLoading(true);
    setSuccess(false);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await contract.registerProperty(ownerAddress, location, area, propertyType);
      const receipt = await tx.wait();

      setTransactionData({
        hash: tx.hash,
        blockNumber: receipt.blockNumber,
        timestamp: new Date().toISOString(),
        gasUsed: receipt.gasUsed.toString(),
        gasPrice: ethers.formatUnits(receipt.gasPrice || tx.gasPrice || 0, 'gwei') + ' Gwei'
      });

      setSuccess(true);
      setTimeout(() => {
        setOwnerAddress('');
        setLocation('');
        setArea('');
        setSuccess(false);
        setTransactionData(null);
      }, 10000);
    } catch (error) {
      console.error("Transaction Error:", error);
      setErrors({ submit: error.reason || error.message || "Transaction failed" });
    } finally {
      setLoading(false);
    }
  };

  // If user is not admin or registrar, show access denied
  if (!canRegister) {
    return (
      <div className="register-page">
        <div className="register-container">
          <div className="access-denied">
            <div className="denied-icon">🚫</div>
            <h1>Access Denied</h1>
            <p>Only authorized Registrars can register new properties.</p>
            <div className="admin-info">
              <p><strong>Your Address:</strong></p>
              <code>{currentUserAddress}</code>
            </div>
            <p className="hint">
              Please connect to MetaMask using an authorized wallet to access this page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-header">
          <div className="header-icon">📝</div>
          <h1>Property Registration</h1>
          <p>Register a new property on the blockchain with permanent, immutable records</p>
          <div className="admin-badge">
            <span className="badge-icon">{userIsAdmin ? '👑' : '📋'}</span>
            <span>{userIsAdmin ? 'Admin Mode' : 'Registrar Mode'}</span>
          </div>
        </div>

        {!success ? (
          <form onSubmit={handleSubmit} className="register-form">
            {errors.submit && (
              <div className="error-message-box" style={{ marginBottom: '1rem', color: 'red' }}>
                {errors.submit}
              </div>
            )}
            <div className="form-row">
              <div className="form-group">
                <label>
                  Owner Address <span className="required">*</span>
                  <span className="field-hint">Valid Ethereum address (0x...)</span>
                </label>
                <input
                  type="text"
                  placeholder="0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
                  value={ownerAddress}
                  onChange={(e) => setOwnerAddress(e.target.value)}
                  disabled={loading}
                  className={errors.ownerAddress ? 'input-error' : ''}
                />
                {errors.ownerAddress && (
                  <span className="error-message">{errors.ownerAddress}</span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  Property Location <span className="required">*</span>
                  <span className="field-hint">Full address (min. 10 characters)</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter full property address"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  disabled={loading}
                  className={errors.location ? 'input-error' : ''}
                />
                {errors.location && (
                  <span className="error-message">{errors.location}</span>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  Property Area <span className="required">*</span>
                  <span className="field-hint">e.g., 2,500 sq ft</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., 2,500 sq ft"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  disabled={loading}
                  className={errors.area ? 'input-error' : ''}
                />
                {errors.area && (
                  <span className="error-message">{errors.area}</span>
                )}
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
