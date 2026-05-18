import React, { useState } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../contractConfig';
import { uploadToPinata } from '../utils/pinata';
import { useToast } from '../components/Toast';
import useWalletRoles from '../hooks/useWalletRoles';
import './RegisterProperty.css';

function RegisterProperty() {
  const [activeTab, setActiveTab] = useState('register');
  const [ownerAddress, setOwnerAddress] = useState('');
  const [location, setLocation] = useState('');
  const [area, setArea] = useState('');
  const [propertyType, setPropertyType] = useState('Residential');
  const [documentFile, setDocumentFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [transactionData, setTransactionData] = useState(null);
  const [errors, setErrors] = useState({});
  const [correctPropertyId, setCorrectPropertyId] = useState('');
  const [correctFile, setCorrectFile] = useState(null);
  const [correctLoading, setCorrectLoading] = useState(false);
  const [correctSuccess, setCorrectSuccess] = useState(null);
  const [correctError, setCorrectError] = useState('');

  const { addToast, updateToast } = useToast();
  const { address: currentUserAddress, isAdmin: userIsAdmin, isRegistrar: userIsRegistrar, loading: rolesLoading } = useWalletRoles();
  const canRegister = userIsAdmin || userIsRegistrar;

  const isValidEthereumAddress = (address) => /^0x[a-fA-F0-9]{40}$/.test(address);

  const validateForm = () => {
    const nextErrors = {};
    if (!ownerAddress.trim()) nextErrors.ownerAddress = 'Owner address is required.';
    else if (!isValidEthereumAddress(ownerAddress)) nextErrors.ownerAddress = 'Enter a valid Ethereum address.';
    if (!location.trim()) nextErrors.location = 'Property location is required.';
    else if (location.trim().length < 10) nextErrors.location = 'Location must be at least 10 characters.';
    if (!area.trim()) nextErrors.area = 'Property area is required.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const setUploadFile = (file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, document: 'File size must be under 10MB.' }));
      setDocumentFile(null);
      return;
    }
    setErrors(prev => {
      const { document, ...rest } = prev;
      return rest;
    });
    setDocumentFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    if (!validateForm()) return;

    if (!window.ethereum) {
      setErrors({ submit: 'MetaMask is required to register a property.' });
      return;
    }

    setLoading(true);
    setSuccess(false);
    const toastId = addToast('Preparing registration', 'Validating property details.', 'pending', 0);

    try {
      let documentHash = '';
      if (documentFile) {
        updateToast(toastId, 'Uploading document', `Pinning ${documentFile.name} to IPFS.`, 'pending', 0);
        const result = await uploadToPinata(documentFile);
        documentHash = result.ipfsHash;
        updateToast(toastId, 'Document uploaded', `CID: ${documentHash.slice(0, 20)}...`, 'info', 0);
      }

      updateToast(toastId, 'Awaiting signature', 'Confirm the transaction in your wallet.', 'pending', 0);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.registerProperty(ownerAddress, location, area, propertyType, documentHash);

      const miningStart = performance.now();
      updateToast(toastId, 'Transaction sent', 'Waiting for block confirmation.', 'pending', 0);
      const receipt = await tx.wait();
      const latencySec = ((performance.now() - miningStart) / 1000).toFixed(2);

      setTransactionData({
        hash: tx.hash,
        blockNumber: receipt.blockNumber,
        timestamp: new Date().toISOString(),
        gasUsed: Number(receipt.gasUsed).toLocaleString(),
        gasPrice: ethers.formatUnits(receipt.gasPrice || tx.gasPrice || 0, 'gwei') + ' Gwei',
        latency: latencySec,
        documentHash,
        documentUrl: documentHash ? `https://gateway.pinata.cloud/ipfs/${documentHash}` : null
      });

      updateToast(toastId, 'Property registered', `Block #${receipt.blockNumber} | Gas: ${Number(receipt.gasUsed).toLocaleString()} | ${latencySec}s`, 'success', 7000);
      setSuccess(true);
    } catch (error) {
      const msg = error.reason || error.message || 'Transaction failed.';
      console.error('Transaction Error:', error);
      updateToast(toastId, 'Registration failed', msg, 'error', 7000);
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

  const handleCorrection = async (e) => {
    e.preventDefault();
    setCorrectError('');
    setCorrectSuccess(null);

    const id = parseInt(correctPropertyId, 10);
    if (!correctPropertyId || Number.isNaN(id) || id <= 0) {
      setCorrectError('Enter a valid property ID.');
      return;
    }
    if (!correctFile) {
      setCorrectError('Select the corrected deed document.');
      return;
    }
    if (!window.ethereum) {
      setCorrectError('MetaMask is required to submit corrections.');
      return;
    }

    setCorrectLoading(true);
    const toastId = addToast('Uploading correction', 'Pinning corrected deed to IPFS.', 'pending', 0);
    try {
      const result = await uploadToPinata(correctFile);
      const newCid = result.ipfsHash;
      updateToast(toastId, 'Submitting correction', 'Awaiting wallet signature.', 'pending', 0);

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      const tx = await contract.updatePropertyDocument(id, newCid);
      await tx.wait();

      updateToast(toastId, 'Document corrected', `Property #${id} has a new document hash.`, 'success', 6000);
      setCorrectSuccess({ propertyId: id, newCid, txHash: tx.hash });
      setCorrectPropertyId('');
      setCorrectFile(null);
    } catch (err) {
      const msg = err?.reason || err?.message || 'Transaction failed.';
      console.error(err);
      updateToast(toastId, 'Correction failed', msg, 'error', 7000);
      setCorrectError(msg);
    } finally {
      setCorrectLoading(false);
    }
  };

  if (rolesLoading) {
    return (
      <div className="register-page">
        <div className="register-container">
          <p style={{ textAlign: 'center', padding: '3rem' }}>Verifying on-chain permissions…</p>
        </div>
      </div>
    );
  }

  if (!canRegister) {
    return (
      <div className="register-page">
        <div className="register-container">
          <div className="access-denied">
            <h1>Access Denied</h1>
            <p>Only authorized land registrars can register or correct property documents.</p>
            <div className="admin-info">
              <p>Your connected address</p>
              <code>{currentUserAddress || 'Not Connected'}</code>
            </div>
            <p className="hint">Connect an authorized wallet to access this workflow.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-header">
          <h1>Property Registration</h1>
          <p>Register new land titles and maintain corrected deed references on the blockchain.</p>
          <div className="admin-badge">{userIsAdmin ? 'Authority Mode' : 'Registrar Mode'}</div>
        </div>

        <div className="tab-switcher" role="tablist" aria-label="Registration workflows">
          <button type="button" className={activeTab === 'register' ? 'active' : ''} onClick={() => { setActiveTab('register'); setSuccess(false); }}>
            Register New Property
          </button>
          <button type="button" className={activeTab === 'correct' ? 'active' : ''} onClick={() => { setActiveTab('correct'); setCorrectSuccess(null); setCorrectError(''); }}>
            Correct Document
          </button>
        </div>

        {activeTab === 'correct' && (
          <div className="register-form">
            <div className="notice-box">
              Document corrections update the deed hash for an existing property and create a permanent audit event.
            </div>

            {correctSuccess && (
              <div className="success-panel">
                <h3>Correction Recorded</h3>
                <p><strong>Property ID:</strong> #{correctSuccess.propertyId}</p>
                <p><strong>New Document CID:</strong> <code>{correctSuccess.newCid}</code></p>
                <p><strong>Transaction:</strong> <code>{correctSuccess.txHash}</code></p>
              </div>
            )}

            <form onSubmit={handleCorrection} className="register-form-inner">
              <div className="form-group">
                <label>Property ID to Correct <span className="required">*</span></label>
                <input type="number" min="1" placeholder="e.g. 1" value={correctPropertyId} onChange={e => setCorrectPropertyId(e.target.value)} />
              </div>

              <div className="form-group">
                <label>Corrected Deed Document <span className="required">*</span></label>
                <div className="file-drop-zone" onClick={() => document.getElementById('correct-file-input').click()}>
                  <input id="correct-file-input" type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }} onChange={e => setCorrectFile(e.target.files[0])} />
                  {correctFile ? <p>{correctFile.name}</p> : <p>Click to upload corrected deed. PDF or image, max 10MB.</p>}
                </div>
              </div>

              {correctError && <div className="error-message-box">{correctError}</div>}
              <button type="submit" className="submit-button" disabled={correctLoading}>
                {correctLoading ? 'Submitting Correction...' : 'Submit Correction On-chain'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'register' && (
          <>
            {!success ? (
              <form onSubmit={handleSubmit} className="register-form">
                {errors.submit && <div className="error-message-box">{errors.submit}</div>}
                <div className="form-row">
                  <div className="form-group">
                    <label>Owner Address <span className="required">*</span><span className="field-hint">Valid Ethereum address</span></label>
                    <input type="text" placeholder="0x..." value={ownerAddress} onChange={(e) => setOwnerAddress(e.target.value)} disabled={loading} className={errors.ownerAddress ? 'input-error' : ''} />
                    {errors.ownerAddress && <span className="error-message">{errors.ownerAddress}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Property Location <span className="required">*</span><span className="field-hint">Full address or survey description</span></label>
                    <input type="text" placeholder="Enter full property address" value={location} onChange={(e) => setLocation(e.target.value)} disabled={loading} className={errors.location ? 'input-error' : ''} />
                    {errors.location && <span className="error-message">{errors.location}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Property Area <span className="required">*</span><span className="field-hint">e.g. 2,500 sq ft</span></label>
                    <input type="text" placeholder="e.g. 2,500 sq ft" value={area} onChange={(e) => setArea(e.target.value)} disabled={loading} className={errors.area ? 'input-error' : ''} />
                    {errors.area && <span className="error-message">{errors.area}</span>}
                  </div>
                  <div className="form-group">
                    <label>Property Type</label>
                    <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)} disabled={loading}>
                      <option value="Residential">Residential</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Industrial">Industrial</option>
                      <option value="Agricultural">Agricultural</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Land Deed Document <span className="field-hint">Optional IPFS-backed deed reference</span></label>
                    <div className={`file-drop-zone ${documentFile ? 'has-file' : ''} ${errors.document ? 'input-error' : ''}`} onDrop={(e) => { e.preventDefault(); setUploadFile(e.dataTransfer.files[0]); }} onDragOver={(e) => e.preventDefault()} onClick={() => document.getElementById('doc-upload').click()}>
                      <input id="doc-upload" type="file" accept=".pdf,.png,.jpg,.jpeg,.webp" onChange={(e) => setUploadFile(e.target.files[0])} style={{ display: 'none' }} disabled={loading} />
                      {documentFile ? (
                        <div className="file-info">
                          <div>
                            <div className="file-name">{documentFile.name}</div>
                            <div className="file-size">{(documentFile.size / 1024).toFixed(1)} KB</div>
                          </div>
                          <button type="button" className="remove-file" onClick={(e) => { e.stopPropagation(); setDocumentFile(null); }}>Remove</button>
                        </div>
                      ) : (
                        <div className="drop-prompt">
                          <p>Drag and drop a document here, or click to browse.</p>
                          <p className="file-types">Supported: PDF, PNG, JPG, WEBP. Max 10MB.</p>
                        </div>
                      )}
                    </div>
                    {errors.document && <span className="error-message">{errors.document}</span>}
                  </div>
                </div>

                <button type="submit" className="submit-button" disabled={loading}>
                  {loading ? <><span className="spinner"></span>Processing...</> : 'Register Property'}
                </button>
              </form>
            ) : (
              <div className="success-container">
                <div className="success-icon">✓</div>
                <h2>Property Registered</h2>
                <p>The property is now permanently recorded on-chain.</p>
                <div className="transaction-details">
                  <h3>Transaction Details</h3>
                  <div className="detail-row"><span className="detail-label">Transaction Hash</span><span className="detail-value hash">{transactionData.hash}</span></div>
                  <div className="detail-row"><span className="detail-label">Block Number</span><span className="detail-value">{transactionData.blockNumber.toLocaleString()}</span></div>
                  <div className="detail-row"><span className="detail-label">Gas Used</span><span className="detail-value">{transactionData.gasUsed}</span></div>
                  <div className="detail-row"><span className="detail-label">Gas Price</span><span className="detail-value">{transactionData.gasPrice}</span></div>
                  {transactionData.documentHash && (
                    <div className="detail-row"><span className="detail-label">IPFS Document</span><span className="detail-value"><a href={transactionData.documentUrl} target="_blank" rel="noopener noreferrer" className="ipfs-link">{transactionData.documentHash.slice(0, 18)}...</a></span></div>
                  )}
                </div>
                <div className="property-summary">
                  <h3>Property Information</h3>
                  <div className="summary-grid">
                    <div className="summary-item"><span className="summary-label">Owner</span><span className="summary-value">{ownerAddress}</span></div>
                    <div className="summary-item"><span className="summary-label">Location</span><span className="summary-value">{location}</span></div>
                    <div className="summary-item"><span className="summary-label">Area</span><span className="summary-value">{area}</span></div>
                    <div className="summary-item"><span className="summary-label">Type</span><span className="summary-value">{propertyType}</span></div>
                  </div>
                </div>
                <button onClick={resetForm} className="submit-button">Register Another Property</button>
              </div>
            )}

            <div className="info-section">
              <h3>Registry Controls</h3>
              <div className="info-grid">
                <div className="info-card"><h4>Permanent Records</h4><p>Registered properties cannot be silently altered or deleted.</p></div>
                <div className="info-card"><h4>Instant Verification</h4><p>Ownership can be checked directly from the blockchain ledger.</p></div>
                <div className="info-card"><h4>Fraud Reduction</h4><p>Document hashes help detect forged or mismatched title deeds.</p></div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default RegisterProperty;
