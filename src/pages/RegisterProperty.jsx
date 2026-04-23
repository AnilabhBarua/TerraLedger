import React, { useState } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../contractConfig';
import { uploadToPinata } from '../utils/pinata';
import { useToast } from '../components/Toast';
import './RegisterProperty.css';

function RegisterProperty() {
  const [ownerAddress, setOwnerAddress] = useState('');
  const [location, setLocation] = useState('');
  const [area, setArea] = useState('');
  const [propertyType, setPropertyType] = useState('Residential');
  const [documentFile, setDocumentFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [transactionData, setTransactionData] = useState(null);
  const [errors, setErrors] = useState({});

  const { addToast, updateToast } = useToast();

  const userIsAdmin = localStorage.getItem('wallet_is_admin') === 'true';
  const userIsRegistrar = localStorage.getItem('wallet_is_registrar') === 'true';
  const canRegister = userIsAdmin || userIsRegistrar;
  const currentUserAddress = localStorage.getItem('wallet_user_address') || 'Not Connected';

  const isValidEthereumAddress = (address) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!ownerAddress.trim()) {
      newErrors.ownerAddress = 'Owner address is required.';
    } else if (!isValidEthereumAddress(ownerAddress)) {
      newErrors.ownerAddress = 'Invalid Ethereum address. Must start with 0x followed by 40 hex characters.';
    }

    if (!location.trim()) {
      newErrors.location = 'Property location is required.';
    } else if (location.trim().length < 10) {
      newErrors.location = 'Location must be at least 10 characters long.';
    }

    if (!area.trim()) {
      newErrors.area = 'Property area is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        setErrors(prev => ({ ...prev, document: 'File size must be under 10MB.' }));
        setDocumentFile(null);
        return;
      }
      setErrors(prev => { const { document, ...rest } = prev; return rest; });
      setDocumentFile(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        setErrors(prev => ({ ...prev, document: 'File size must be under 10MB.' }));
        setDocumentFile(null);
        return;
      }
      setErrors(prev => { const { document, ...rest } = prev; return rest; });
      setDocumentFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) return;

    if (!window.ethereum) {
      setErrors({ submit: "MetaMask is not installed" });
      return;
    }

    setLoading(true);
    setSuccess(false);

    // Create a single sticky toast that we mutate through the lifecycle
    const toastId = addToast('Preparing Registration', 'Validating your inputs…', 'pending', 0);

    try {
      let documentHash = '';

      // Step 1: Upload document to IPFS if a file is attached
      if (documentFile) {
        updateToast(toastId, 'Uploading to IPFS', `Pinning "${documentFile.name}" to IPFS…`, 'pending', 0);
        try {
          const result = await uploadToPinata(documentFile);
          documentHash = result.ipfsHash;
          updateToast(toastId, 'IPFS Upload Complete', `CID: ${documentHash.slice(0, 20)}…`, 'info', 0);
        } catch (uploadErr) {
          console.error('IPFS Upload Error:', uploadErr);
          updateToast(toastId, 'IPFS Upload Failed', uploadErr.message || 'Could not pin document.', 'error', 6000);
          setErrors({ document: uploadErr.message || 'Failed to upload document to IPFS.' });
          setLoading(false);
          return;
        }
      }

      // Step 2: Request MetaMask signature
      updateToast(toastId, 'Awaiting Signature', 'Please confirm the transaction in MetaMask…', 'pending', 0);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = await contract.registerProperty(ownerAddress, location, area, propertyType, documentHash);

      // Step 3: Mining
      updateToast(toastId, 'Transaction Sent', 'Waiting for block confirmation…', 'pending', 0);
      const receipt = await tx.wait();

      setTransactionData({
        hash: tx.hash,
        blockNumber: receipt.blockNumber,
        timestamp: new Date().toISOString(),
        gasUsed: receipt.gasUsed.toString(),
        gasPrice: ethers.formatUnits(receipt.gasPrice || tx.gasPrice || 0, 'gwei') + ' Gwei',
        documentHash: documentHash,
        documentUrl: documentHash ? `https://gateway.pinata.cloud/ipfs/${documentHash}` : null
      });

      // Step 4: Done
      updateToast(
        toastId,
        '\u2705 Property Registered!',
        `Block #${receipt.blockNumber} • Tx: ${tx.hash.slice(0, 14)}…`,
        'success',
        7000
      );
      setSuccess(true);
    } catch (error) {
      console.error("Transaction Error:", error);
      const msg = error.reason || error.message || 'Transaction failed';
      updateToast(toastId, 'Transaction Failed', msg, 'error', 7000);
      setErrors({ submit: msg });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setOwnerAddress('');
    setLocation('');
    setArea('');
    setPropertyType('Residential');
    setDocumentFile(null);
    setSuccess(false);
    setTransactionData(null);
    setErrors({});
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

            {/* IPFS Document Upload */}
            <div className="form-row">
              <div className="form-group">
                <label>
                  Land Deed Document
                  <span className="field-hint">PDF, Image, or Scan (max 10MB). Stored on IPFS.</span>
                </label>
                <div
                  className={`file-drop-zone ${documentFile ? 'has-file' : ''} ${errors.document ? 'input-error' : ''}`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => document.getElementById('doc-upload').click()}
                >
                  <input
                    id="doc-upload"
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.webp"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    disabled={loading}
                  />
                  {documentFile ? (
                    <div className="file-info">
                      <span className="file-icon">📄</span>
                      <div>
                        <div className="file-name">{documentFile.name}</div>
                        <div className="file-size">{(documentFile.size / 1024).toFixed(1)} KB</div>
                      </div>
                      <button
                        type="button"
                        className="remove-file"
                        onClick={(e) => { e.stopPropagation(); setDocumentFile(null); }}
                      >✕</button>
                    </div>
                  ) : (
                    <div className="drop-prompt">
                      <span className="upload-icon">📁</span>
                      <p>Drag & drop your document here, or <strong>click to browse</strong></p>
                      <p className="file-types">Supported: PDF, PNG, JPG, WEBP</p>
                    </div>
                  )}
                </div>
                {errors.document && (
                  <span className="error-message">{errors.document}</span>
                )}
              </div>
            </div>

            {/* Upload status is now shown via Toast, removed inline status bar */}

            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Processing...
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
              {transactionData.documentHash && (
                <div className="detail-row">
                  <span className="detail-label">IPFS Document:</span>
                  <span className="detail-value">
                    <a href={transactionData.documentUrl} target="_blank" rel="noopener noreferrer" className="ipfs-link">
                      📄 {transactionData.documentHash.slice(0, 16)}... 
                      <span className="link-arrow">↗</span>
                    </a>
                  </span>
                </div>
              )}
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

            <button onClick={resetForm} className="submit-button" style={{ marginTop: '1.5rem' }}>
              Register Another Property
            </button>
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
