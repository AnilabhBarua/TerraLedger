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
  const [pendingApprovals, setPendingApprovals] = useState([]);

  const currentUserAddress = localStorage.getItem('wallet_user_address') || 'Not Connected';
  const userIsRegistrar = localStorage.getItem('wallet_is_registrar') === 'true' || localStorage.getItem('wallet_is_admin') === 'true';

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
          const req = await contract.transferRequests(i);
          props.push({
            propertyId: Number(p.propertyId),
            owner: p.owner,
            location: p.location,
            area: p.area,
            type: p.propertyType,
            registrationDate: new Date(),
            isPending: req.pending,
            buyer: req.buyer
          });
        }
      }
      setAllProperties(props);
      if (currentUserAddress !== 'Not Connected') {
        setUserProperties(props.filter(p => p.owner.toLowerCase() === currentUserAddress.toLowerCase()));
      }
      setPendingApprovals(props.filter(p => p.isPending));
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
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

    if (found.owner.toLowerCase() !== currentUserAddress.toLowerCase() && !userIsRegistrar) {
        setErrors({ propertyId: `You are not the owner of this property.` });
      return;
    }

    setProperty(found);
    if (found.isPending && userIsRegistrar) {
        setStep(4); // Registrar approval view
    } else if (found.isPending) {
        setStep(5); // Pending cancellation view for owners
    } else {
        setStep(2); // Request transfer view
    }
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

  const handleRequestTransfer = async (e) => {
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

      const tx = await contract.requestTransfer(property.propertyId, newOwner);
      const receipt = await tx.wait();

      setTransactionData({
        hash: tx.hash,
        blockNumber: receipt.blockNumber,
        timestamp: new Date().toISOString(),
        from: property.owner,
        to: newOwner,
        status: 'Transfer Requested'
      });
      setSuccess(true);
      fetchProps(); // Refresh list automatically
    } catch (error) {
      console.error(error);
      setErrors({ newOwner: error.reason || error.message || "Transaction failed" });
      setStep(2);
    } finally {
      setLoading(false);
    }
  };
  
  const handleApproveTransfer = async () => {
    if (!window.ethereum) return;
    setLoading(true);
    setStep(3);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await contract.approveTransfer(property.propertyId);
      const receipt = await tx.wait();
      
      setTransactionData({
        hash: tx.hash,
        blockNumber: receipt.blockNumber,
        timestamp: new Date().toISOString(),
        from: property.owner,
        to: property.buyer,
        status: 'Transfer Approved'
      });
      setSuccess(true);
      fetchProps(); // Refresh list automatically
    } catch (error) {
      console.error(error);
      setErrors({ generic: error.reason || error.message || "Transaction failed" });
      setStep(4);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelTransfer = async () => {
    if (!window.ethereum) return;
    setLoading(true);
    setStep(3); // reusing processing UI
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await contract.cancelTransfer(property.propertyId);
      const receipt = await tx.wait();
      
      setTransactionData({
        hash: tx.hash,
        blockNumber: receipt.blockNumber,
        timestamp: new Date().toISOString(),
        from: property.owner,
        to: property.buyer,
        status: 'Transfer Cancelled'
      });
      setSuccess(true);
      fetchProps();
    } catch (error) {
        console.error(error);
        setErrors({ generic: error.reason || error.message || "Transaction failed" });
        setStep(5); // Return to owner cancellation view
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

  // Helper renderer
  const renderTransactionSuccess = () => (
    <div className="success-container">
        <div className="success-icon">✓</div>
        <h2>{transactionData.status}!</h2>
        <p>This action has been successfully processed on the blockchain</p>

        <div className="transaction-details">
            <h3>Transaction Details</h3>
            <div className="detail-row">
            <span className="detail-label">Transaction Hash:</span>
            <span className="detail-value hash">{transactionData.hash}</span>
            </div>
            <div className="detail-row">
            <span className="detail-label">Block Number:</span>
            <span className="detail-value">{transactionData.blockNumber?.toLocaleString()}</span>
            </div>
            <div className="detail-row">
            <span className="detail-label">From:</span>
            <span className="detail-value hash">{transactionData.from}</span>
            </div>
            <div className="detail-row">
            <span className="detail-label">Pending Buyer:</span>
            <span className="detail-value hash">{transactionData.to}</span>
            </div>
        </div>

        <button onClick={resetForm} className="reset-button">
            Return to Dashboard
        </button>
    </div>
  );

  return (
    <div className="transfer-page">
      <div className="transfer-container">
        <div className="transfer-header">
          <div className="header-icon">🔄</div>
          <h1>Ownership Transfers</h1>
          <p>Secure multi-step workflow for property transfers. Owners request, Registrars approve.</p>
          <div className="current-user-info">
            <span className="user-label">Connected as:</span>
            <code>{currentUserAddress !== 'Not Connected' ? `${currentUserAddress.slice(0, 6)}...${currentUserAddress.slice(-4)}` : 'Not Connected'}</code>
          </div>
        </div>

        {(step === 1 || step === 2) && (
            <div className="steps-indicator">
            <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
                <div className="step-number">1</div>
                <div className="step-label">Select Property</div>
            </div>
            <div className="step-connector"></div>
            <div className={`step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
                <div className="step-number">2</div>
                <div className="step-label">Request Transfer</div>
            </div>
            <div className="step-connector"></div>
            <div className={`step ${step >= 3 ? 'active' : ''} ${success ? 'completed' : ''}`}>
                <div className="step-number">3</div>
                <div className="step-label">Await Approval</div>
            </div>
            </div>
        )}

        {step === 1 && (
          <div className="step-content">
            <h2>Select Property</h2>
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
                Lookup
              </button>
            </div>
            {errors.propertyId && (
              <div className="error-message-box">
                <span className="error-icon">⚠️</span>
                <span>{errors.propertyId}</span>
              </div>
            )}

            {userIsRegistrar && (
                <div className="all-properties-section" style={{ marginTop: '2rem'}}>
                    <h3>Pending Approvals (Registrar View) <span className="badge">{pendingApprovals.length}</span></h3>
                    {pendingApprovals.length === 0 ? (
                        <p style={{background: '#f8f9fa', padding: '1rem', borderRadius: '8px'}}>No transfers currently pending approval.</p>
                    ) : (
                        <div className="properties-grid">
                            {pendingApprovals.map(prop => (
                                <div key={prop.propertyId} className="property-item pending-approval" 
                                    onClick={() => { setPropertyId(prop.propertyId.toString()); setProperty(prop); setStep(4); }}>
                                    <div className="property-id-badge">ID: {prop.propertyId}</div>
                                    <div className="approval-badge">Needs Approval</div>
                                    <div className="property-location">{prop.location}</div>
                                    <div className="property-details">
                                        <span>From: {prop.owner.slice(0,6)}...</span>
                                        <span>To: {prop.buyer.slice(0,6)}...</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div className="property-list">
              <h3>Your Properties</h3>
              {userProperties.length === 0 ? (
                <div className="no-properties">
                  <p>You don't own any properties.</p>
                </div>
              ) : (
                <div className="properties-grid">
                  {userProperties.map(prop => (
                    <div
                      key={prop.propertyId}
                      className={`property-item owned ${prop.isPending ? 'is-pending' : ''}`}
                      onClick={() => {
                        setPropertyId(prop.propertyId.toString());
                        setProperty(prop);
                        setErrors({});
                        if (prop.isPending) setStep(5);
                        else setStep(2);
                      }}
                    >
                      <div className="property-id-badge">ID: {prop.propertyId}</div>
                      <div className="owned-badge">{prop.isPending ? 'Transfer Pending' : 'Owned'}</div>
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
          </div>
        )}

        {step === 2 && property && (
          <div className="step-content">
            <h2>Request Transfer</h2>
            <p>Initiate a transfer request. This will require Registrar approval.</p>

            <div className="current-property">
              <div className="property-info-grid">
                <div className="info-item"><span className="info-label">Property ID</span><span className="info-value">{property.propertyId}</span></div>
                <div className="info-item"><span className="info-label">Location</span><span className="info-value">{property.location}</span></div>
                <div className="info-item"><span className="info-label">Current Owner</span><span className="info-value hash">{property.owner}</span></div>
              </div>
            </div>

            <form onSubmit={handleRequestTransfer} className="transfer-form">
              <div className="form-group">
                <label>
                  New Owner / Buyer Address <span className="required">*</span>
                </label>
                <input
                  type="text"
                  placeholder="0x..."
                  value={newOwner}
                  onChange={(e) => setNewOwner(e.target.value)}
                  className={errors.newOwner ? 'input-error' : ''}
                />
                {errors.newOwner && <span className="error-message">{errors.newOwner}</span>}
              </div>

              <div className="button-group">
                <button type="button" onClick={() => setStep(1)} className="back-button">Cancel</button>
                <button type="submit" className="submit-button">Submit Request</button>
              </div>
            </form>
          </div>
        )}

        {step === 4 && property && userIsRegistrar && (
          <div className="step-content registrar-view">
             <h2>Review Transfer Request</h2>
             {errors.generic && <div className="error-message-box" style={{marginBottom:'1rem'}}>{errors.generic}</div>}
             <div className="current-property pending">
              <h3>Transfer Details</h3>
              <div className="property-info-grid">
                <div className="info-item"><span className="info-label">Property ID</span><span className="info-value">{property.propertyId}</span></div>
                <div className="info-item"><span className="info-label">Location</span><span className="info-value">{property.location}</span></div>
                <div className="info-item"><span className="info-label">Current Owner</span><span className="info-value hash">{property.owner}</span></div>
                <div className="info-item"><span className="info-label">Requested Buyer</span><span className="info-value hash" style={{color: '#e74c3c'}}>{property.buyer}</span></div>
              </div>
             </div>

             <div className="button-group" style={{marginTop: '2rem'}}>
                <button type="button" onClick={() => setStep(1)} className="back-button">Back</button>
                <button type="button" onClick={handleCancelTransfer} className="back-button" style={{background: '#ffebee', color: '#e74c3c'}}>Reject Request</button>
                <button type="button" onClick={handleApproveTransfer} className="submit-button" style={{background: '#2ecc71'}}>Approve Transfer</button>
             </div>
          </div>
        )}

        {step === 5 && property && !userIsRegistrar && (
            <div className="step-content owner-cancel-view">
                <h2>Pending Transfer</h2>
                <p>You have already requested a transfer for this property. It is currently awaiting Registrar approval.</p>
                {errors.generic && <div className="error-message-box" style={{marginBottom:'1rem'}}>{errors.generic}</div>}
                
                <div className="current-property pending">
                <div className="property-info-grid">
                    <div className="info-item"><span className="info-label">Property ID</span><span className="info-value">{property.propertyId}</span></div>
                    <div className="info-item"><span className="info-label">Requested Buyer</span><span className="info-value hash">{property.buyer}</span></div>
                </div>
                </div>

                <div className="button-group" style={{marginTop: '2rem'}}>
                    <button type="button" onClick={() => setStep(1)} className="back-button">Back</button>
                    <button type="button" onClick={handleCancelTransfer} className="back-button" style={{background: '#ffebee', color: '#e74c3c'}}>Cancel Transfer Request</button>
                </div>
            </div>
        )}

        {step === 3 && (
          <div className="step-content">
            {!success ? (
              <div className="processing-container">
                <div className="processing-spinner"></div>
                <h2>Processing Transaction...</h2>
                <p>Please confirm the transaction in your wallet and wait for it to be mined.</p>
              </div>
            ) : renderTransactionSuccess()}
          </div>
        )}
      </div>
    </div>
  );
}

export default TransferOwnership;
