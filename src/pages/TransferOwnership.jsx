import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../contractConfig';
import './TransferOwnership.css';

function TransferOwnership() {
  const [propertyId, setPropertyId] = useState('');
  const [newOwner, setNewOwner] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [property, setProperty] = useState(null);
  const [transactionData, setTransactionData] = useState(null);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [allProperties, setAllProperties] = useState([]);
  const [userProperties, setUserProperties] = useState([]);

  const currentUserAddress = localStorage.getItem('wallet_user_address') || 'Not Connected';

  useEffect(() => {
    const fetchProps = async () => {
      if (!window.ethereum) return;
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      try {
        const nextId = await contract.nextPropertyId();
        const props = [];
        for (let i = 1; i < Number(nextId); i++) {
          const p = await contract.properties(i);
          if (p.isRegistered) {
            props.push({
              propertyId: Number(p.propertyId),
              owner: p.owner,
              location: p.location,
              area: p.area,
              type: p.propertyType,
              registrationDate: new Date()
            });
          }
        }
        setAllProperties(props);
        if (currentUserAddress !== 'Not Connected') {
          setUserProperties(props.filter(p => p.owner.toLowerCase() === currentUserAddress.toLowerCase()));
        }
      } catch (err) { console.error(err); }
    };
    fetchProps();
  }, [currentUserAddress]);

  const isValidEthereumAddress = (address) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const handlePropertyLookup = () => {
    setErrors({});
    const id = parseInt(propertyId);
    if (isNaN(id) || id <= 0) {
      setErrors({ propertyId: 'Please enter a valid property ID.' });
      return;
    }
    
    const found = allProperties.find(p => p.propertyId === id);
    if (!found) {
      setErrors({ propertyId: `Property with ID ${id} does not exist.` });
      return;
    }

    if (found.owner.toLowerCase() !== currentUserAddress.toLowerCase()) {
      setErrors({
        propertyId: `You are not the owner of this property. This belongs to ${found.owner.slice(0, 6)}...${found.owner.slice(-4)}.`
      });
      return;
    }

    setProperty(found);
    setStep(2);
  };

  const validateTransferForm = () => {
    const newErrors = {};
    if (!newOwner.trim()) {
      newErrors.newOwner = 'New owner address is required.';
    } else if (!isValidEthereumAddress(newOwner)) {
      newErrors.newOwner = 'Invalid Ethereum address.';
    } else if (newOwner.toLowerCase() === property.owner.toLowerCase()) {
      newErrors.newOwner = 'Cannot transfer to the same owner.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    setErrors({});
    if (!validateTransferForm()) return;

    if (!window.ethereum) {
      setErrors({ newOwner: "MetaMask is not installed" });
      return;
    }

    setLoading(true);
    setStep(3);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await contract.transferOwnership(property.propertyId, newOwner);
      const receipt = await tx.wait();

      setTransactionData({
        hash: tx.hash,
        blockNumber: receipt.blockNumber,
        timestamp: new Date().toISOString(),
        from: property.owner,
        to: newOwner,
        gasUsed: receipt.gasUsed.toString(),
        gasPrice: ethers.formatUnits(receipt.gasPrice || tx.gasPrice || 0, 'gwei') + ' Gwei'
      });
      setSuccess(true);
    } catch (error) {
      console.error(error);
      setErrors({ newOwner: error.reason || error.message || "Transaction failed" });
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setPropertyId('');
    setNewOwner('');
    setProperty(null);
    setSuccess(false);
    setTransactionData(null);
    setStep(1);
    setErrors({});
  };

  return (
    <div className="transfer-page">
      <div className="transfer-container">
        <div className="transfer-header">
          <div className="header-icon">🔄</div>
          <h1>Ownership Transfer</h1>
          <p>Securely transfer property ownership with blockchain verification</p>
          <div className="current-user-info">
            <span className="user-label">Connected as:</span>
            <code>{currentUserAddress !== 'Not Connected' ? `${currentUserAddress.slice(0, 6)}...${currentUserAddress.slice(-4)}` : 'Not Connected'}</code>
          </div>
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
            <p>Enter the Property ID you wish to transfer (you must be the owner)</p>

            <div className="input-group">
              <input
                type="number"
                placeholder="Enter Property ID (e.g., 1, 2, 3...)"
                value={propertyId}
                onChange={(e) => setPropertyId(e.target.value)}
                min="1"
                className={errors.propertyId ? 'input-error' : ''}
              />
              <button onClick={handlePropertyLookup} disabled={!propertyId}>
                Lookup Property
              </button>
            </div>
            {errors.propertyId && (
              <div className="error-message-box">
                <span className="error-icon">⚠️</span>
                <span>{errors.propertyId}</span>
              </div>
            )}

            <div className="property-list">
              <h3>Your Properties ({userProperties.length})</h3>
              {userProperties.length === 0 ? (
                <div className="no-properties">
                  <p>You don't own any properties.</p>
                  <p className="hint">
                    Please register a property from the Registration Page first.
                  </p>
                </div>
              ) : (
                <div className="properties-grid">
                  {userProperties.map(prop => (
                    <div
                      key={prop.propertyId}
                      className="property-item owned"
                      onClick={() => {
                        setPropertyId(prop.propertyId.toString());
                        setProperty(prop);
                        setErrors({});
                        setStep(2);
                      }}
                    >
                      <div className="property-id-badge">ID: {prop.propertyId}</div>
                      <div className="owned-badge">You Own This</div>
                      <div className="property-location">{prop.location}</div>
                      <div className="property-details">
                        <span>{prop.type}</span>
                        <span>{prop.area}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {userProperties.length > 0 && (
              <div className="all-properties-section">
                <h3>All Registered Properties</h3>
                <div className="properties-grid">
                  {allProperties.filter(p => !userProperties.find(u => u.propertyId === p.propertyId)).map(prop => (
                    <div
                      key={prop.propertyId}
                      className="property-item not-owned"
                      onClick={() => {
                        setPropertyId(prop.propertyId.toString());
                        setErrors({
                          propertyId: `You are not the owner of this property. This belongs to ${prop.owner.slice(0, 6)}...${prop.owner.slice(-4)}.`
                        });
                      }}
                    >
                      <div className="property-id-badge">ID: {prop.propertyId}</div>
                      <div className="not-owned-badge">Not Your Property</div>
                      <div className="property-location">{prop.location}</div>
                      <div className="property-details">
                        <span>{prop.type}</span>
                        <span>Owner: {prop.owner.slice(0, 4)}...{prop.owner.slice(-4)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
                <label>
                  New Owner Address <span className="required">*</span>
                  <span className="field-hint">Valid Ethereum address (0x...)</span>
                </label>
                <input
                  type="text"
                  placeholder="0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
                  value={newOwner}
                  onChange={(e) => setNewOwner(e.target.value)}
                  className={errors.newOwner ? 'input-error' : ''}
                />
                {errors.newOwner && (
                  <span className="error-message">{errors.newOwner}</span>
                )}
              </div>

              <div className="button-group">
                <button type="button" onClick={() => { setStep(1); setErrors({}); }} className="back-button">
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
