import React, { useState } from 'react';
import { mockProperties, generateMockTransaction, generateBlockNumber } from '../mockData';
import './TransferOwnership.css';

function TransferOwnership() {
  const [propertyId, setPropertyId] = useState('');
  const [newOwner, setNewOwner] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [property, setProperty] = useState(null);
  const [transactionData, setTransactionData] = useState(null);
  const [step, setStep] = useState(1);

  const handlePropertyLookup = () => {
    const found = mockProperties.find(p => p.propertyId === parseInt(propertyId));
    if (found) {
      setProperty(found);
      setStep(2);
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStep(3);

    await new Promise(resolve => setTimeout(resolve, 2500));

    const txHash = generateMockTransaction();
    const blockNum = generateBlockNumber();

    setTransactionData({
      hash: txHash,
      blockNumber: blockNum,
      timestamp: new Date().toISOString(),
      from: property.owner,
      to: newOwner,
      gasUsed: '95421',
      gasPrice: '32 Gwei'
    });

    setLoading(false);
    setSuccess(true);
  };

  const resetForm = () => {
    setPropertyId('');
    setNewOwner('');
    setProperty(null);
    setSuccess(false);
    setTransactionData(null);
    setStep(1);
  };

  return (
    <div className="transfer-page">
      <div className="transfer-container">
        <div className="transfer-header">
          <div className="header-icon">🔄</div>
          <h1>Ownership Transfer</h1>
          <p>Securely transfer property ownership with blockchain verification</p>
        </div>

        <div className="steps-indicator">
          <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            <div className="step-number">1</div>
            <div className="step-label">Select Property</div>
          </div>
          <div className="step-connector"></div>
          <div className={`step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
            <div className="step-number">2</div>
            <div className="step-label">Enter New Owner</div>
          </div>
          <div className="step-connector"></div>
          <div className={`step ${step >= 3 ? 'active' : ''} ${success ? 'completed' : ''}`}>
            <div className="step-number">3</div>
            <div className="step-label">Confirm Transfer</div>
          </div>
        </div>

        {step === 1 && (
          <div className="step-content">
            <h2>Step 1: Select Property</h2>
            <p>Enter the Property ID you wish to transfer</p>

            <div className="input-group">
              <input
                type="number"
                placeholder="Enter Property ID (e.g., 1, 2, 3...)"
                value={propertyId}
                onChange={(e) => setPropertyId(e.target.value)}
                min="1"
              />
              <button onClick={handlePropertyLookup} disabled={!propertyId}>
                Lookup Property
              </button>
            </div>

            <div className="property-list">
              <h3>Available Properties</h3>
              <div className="properties-grid">
                {mockProperties.map(prop => (
                  <div
                    key={prop.propertyId}
                    className="property-item"
                    onClick={() => {
                      setPropertyId(prop.propertyId.toString());
                      setProperty(prop);
                      setStep(2);
                    }}
                  >
                    <div className="property-id-badge">ID: {prop.propertyId}</div>
                    <div className="property-location">{prop.location}</div>
                    <div className="property-details">
                      <span>{prop.type}</span>
                      <span>{prop.area}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && property && (
          <div className="step-content">
            <h2>Step 2: Transfer Details</h2>
            <p>Review property details and enter the new owner's address</p>

            <div className="current-property">
              <h3>Current Property Details</h3>
              <div className="property-info-grid">
                <div className="info-item">
                  <span className="info-label">Property ID</span>
                  <span className="info-value">{property.propertyId}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Location</span>
                  <span className="info-value">{property.location}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Current Owner</span>
                  <span className="info-value hash">{property.owner}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Type</span>
                  <span className="info-value">{property.type}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Area</span>
                  <span className="info-value">{property.area}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Registered</span>
                  <span className="info-value">{new Date(property.registrationDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleTransfer} className="transfer-form">
              <div className="form-group">
                <label>New Owner Address</label>
                <input
                  type="text"
                  placeholder="0x..."
                  value={newOwner}
                  onChange={(e) => setNewOwner(e.target.value)}
                  required
                />
              </div>

              <div className="button-group">
                <button type="button" onClick={() => setStep(1)} className="back-button">
                  Back
                </button>
                <button type="submit" className="submit-button">
                  Transfer Ownership
                </button>
              </div>
            </form>
          </div>
        )}

        {step === 3 && (
          <div className="step-content">
            {!success ? (
              <div className="processing-container">
                <div className="processing-spinner"></div>
                <h2>Processing Transaction...</h2>
                <p>Your ownership transfer is being recorded on the blockchain</p>
                <div className="loading-steps">
                  <div className="loading-step">Verifying ownership...</div>
                  <div className="loading-step">Signing transaction...</div>
                  <div className="loading-step">Broadcasting to network...</div>
                  <div className="loading-step">Waiting for confirmation...</div>
                </div>
              </div>
            ) : (
              <div className="success-container">
                <div className="success-icon">✓</div>
                <h2>Transfer Successful!</h2>
                <p>Property ownership has been transferred successfully</p>

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
                    <span className="detail-label">From:</span>
                    <span className="detail-value hash">{transactionData.from}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">To:</span>
                    <span className="detail-value hash">{transactionData.to}</span>
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

                <button onClick={resetForm} className="reset-button">
                  Transfer Another Property
                </button>
              </div>
            )}
          </div>
        )}

        <div className="security-notice">
          <h3>🔒 Secure Transfer Process</h3>
          <div className="security-features">
            <div className="security-item">
              <span className="check">✓</span>
              <p>Cryptographic signature verification</p>
            </div>
            <div className="security-item">
              <span className="check">✓</span>
              <p>Ownership validation before transfer</p>
            </div>
            <div className="security-item">
              <span className="check">✓</span>
              <p>Permanent blockchain record</p>
            </div>
            <div className="security-item">
              <span className="check">✓</span>
              <p>Instant global verification</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TransferOwnership;
