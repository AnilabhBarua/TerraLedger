import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../contractConfig';
import { verifyDocumentAgainstChain } from '../utils/verifyDocument';
import './ImmutableRecords.css';

function ImmutableRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  // Verification state per property ID: { file, status, result, error }
  const [verifyState, setVerifyState] = useState({});

  const updateVerify = (propertyId, patch) => {
    setVerifyState(prev => ({
      ...prev,
      [propertyId]: { ...(prev[propertyId] || {}), ...patch },
    }));
  };

  const handleVerifyFileChange = (propertyId, file) => {
    updateVerify(propertyId, { file, status: 'idle', result: null, error: null });
  };

  const handleVerify = async (propertyId, ipfsCid) => {
    const state = verifyState[propertyId];
    if (!state?.file) return;
    updateVerify(propertyId, { status: 'loading', result: null, error: null });
    try {
      const result = await verifyDocumentAgainstChain(state.file, ipfsCid);
      updateVerify(propertyId, { status: 'done', result });
    } catch (err) {
      updateVerify(propertyId, { status: 'error', error: err.message });
    }
  };

  useEffect(() => {
    const fetchProps = async () => {
      if (!window.ethereum) {
        setLoading(false);
        return;
      }
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
        
        // Fetch properties
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
                documentHash: p.documentHash || ''
            });
          }
        }
        
        // Fetch registration events for hash/block info
        const filterRegistered = contract.filters.PropertyRegistered();
        const logsRegistered = await contract.queryFilter(filterRegistered, 0, 'latest');
        
        // Merge
        const merged = await Promise.all(props.map(async prop => {
           const log = logsRegistered.find(l => Number(l.args[0]) === prop.propertyId);
           let timestamp = new Date();
           if (log) {
               const block = await provider.getBlock(log.blockHash);
               timestamp = new Date(block.timestamp * 1000);
           }
           return {
             ...prop,
             transactionHash: log ? log.transactionHash : 'Unknown',
             blockNumber: log ? log.blockNumber : 0,
             registrationDate: timestamp
           };
        }));
        
        setRecords(merged);
      } catch (err) { 
          console.error(err); 
      } finally {
          setLoading(false);
      }
    };
    fetchProps();
  }, []);


  const renderBlocks = () => {
    // Unique block numbers from records
    const blockNumbers = [...new Set(records.map(r => r.blockNumber).filter(b => b > 0))];
    if (blockNumbers.length === 0) return null;

    return blockNumbers.slice(0, 5).map((block, index) => {
      const txCount = records.filter(r => r.blockNumber === block).length;
      return (
        <div key={block} className="block">
          <div className="block-header">
            <span>Block #{block}</span>
          </div>
          <div className="block-content">
            <div className="block-tx">{txCount} registration tx(s)</div>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="records-page">
      <div className="records-container">
        <div className="records-header">
          <div className="header-icon">🔒</div>
          <h1>Immutable Blockchain Records</h1>
          <p>Permanent, tamper-proof property records secured by real blockchain technology</p>
        </div>

        {records.length > 0 && (
            <div className="blockchain-visual">
            <div className="block-chain">
                {renderBlocks()}
            </div>
            </div>
        )}

        <div className="records-grid">
          {loading ? (
              <p>Loading immutable records from blockchain...</p>
          ) : records.length === 0 ? (
              <p>No records found on the blockchain.</p>
          ) : records.map((property) => (
            <div key={property.propertyId} className="record-card">
              <div className="record-header">
                <div className="property-id">Property #{property.propertyId}</div>
                <div className="status-badge">Verified</div>
              </div>

              <div className="record-body">
                <div className="record-item">
                  <span className="label">Location</span>
                  <span className="value">{property.location}</span>
                </div>

                <div className="record-item">
                  <span className="label">Owner</span>
                  <span className="value hash">{property.owner}</span>
                </div>

                <div className="record-item">
                  <span className="label">Registration Date</span>
                  <span className="value">{property.registrationDate.toLocaleString()}</span>
                </div>

                <div className="record-item">
                  <span className="label">Transaction Hash</span>
                  <span className="value hash">{property.transactionHash}</span>
                </div>

                <div className="record-item">
                  <span className="label">Block Number</span>
                  <span className="value">{property.blockNumber.toLocaleString()}</span>
                </div>

                <div className="record-item">
                  <span className="label">Type</span>
                  <span className="value">{property.type}</span>
                </div>

                <div className="record-item">
                  <span className="label">Area</span>
                  <span className="value">{property.area}</span>
                </div>

                {property.documentHash && (
                  <>
                    <div className="record-item">
                      <span className="label">Land Deed</span>
                      <span className="value">
                        <a
                          href={`https://gateway.pinata.cloud/ipfs/${property.documentHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ipfs-link"
                        >
                          📄 View on IPFS ↗
                        </a>
                      </span>
                    </div>

                    {/* ── Document Verification Panel ── */}
                    <div className="verify-panel">
                      <div className="verify-header">
                        <span className="verify-icon">🔍</span>
                        <span>Verify Document Authenticity</span>
                      </div>
                      <p className="verify-hint">
                        Upload the document you want to check. We will compare its fingerprint against the on-chain record.
                      </p>

                      <div className="verify-upload-row">
                        <label
                          htmlFor={`verify-file-${property.propertyId}`}
                          className="verify-file-label"
                        >
                          {verifyState[property.propertyId]?.file
                            ? `📄 ${verifyState[property.propertyId].file.name}`
                            : '📁 Choose file to verify'}
                        </label>
                        <input
                          id={`verify-file-${property.propertyId}`}
                          type="file"
                          style={{ display: 'none' }}
                          onChange={(e) => handleVerifyFileChange(property.propertyId, e.target.files[0])}
                        />
                        <button
                          className="verify-btn"
                          disabled={!verifyState[property.propertyId]?.file || verifyState[property.propertyId]?.status === 'loading'}
                          onClick={() => handleVerify(property.propertyId, property.documentHash)}
                        >
                          {verifyState[property.propertyId]?.status === 'loading' ? 'Verifying…' : 'Verify'}
                        </button>
                      </div>

                      {/* Result */}
                      {verifyState[property.propertyId]?.status === 'done' && (
                        <div className={`verify-result ${verifyState[property.propertyId].result.isMatch ? 'authentic' : 'tampered'}`}>
                          <div className="verify-result-title">
                            {verifyState[property.propertyId].result.isMatch
                              ? '✅ Document is AUTHENTIC'
                              : '❌ Document is TAMPERED / MISMATCH'}
                          </div>
                          <div className="verify-hashes">
                            <div className="hash-row">
                              <span className="hash-label">Your file SHA-256:</span>
                              <code className="hash-value">{verifyState[property.propertyId].result.localHash}</code>
                            </div>
                            <div className="hash-row">
                              <span className="hash-label">On-chain SHA-256:</span>
                              <code className="hash-value">{verifyState[property.propertyId].result.ipfsHash}</code>
                            </div>
                          </div>
                        </div>
                      )}

                      {verifyState[property.propertyId]?.status === 'error' && (
                        <div className="verify-result tampered">
                          ⚠️ {verifyState[property.propertyId].error}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              <div className="record-footer">
                <div className="immutable-badge">
                  <span className="lock-icon">🔒</span>
                  Permanently Recorded
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="immutability-info">
          <h2>What Makes These Records Immutable?</h2>
          <div className="info-grid">
            <div className="info-item">
              <div className="info-icon">⛓️</div>
              <h3>Blockchain Technology</h3>
              <p>Records are stored across a distributed network of computers, making unauthorized changes impossible</p>
            </div>
            <div className="info-item">
              <div className="info-icon">🔐</div>
              <h3>Cryptographic Hashing</h3>
              <p>Each record is secured with cryptographic algorithms that detect any tampering attempts</p>
            </div>
            <div className="info-item">
              <div className="info-icon">📜</div>
              <h3>Complete History</h3>
              <p>Every change is recorded permanently, creating an auditable trail of ownership</p>
            </div>
            <div className="info-item">
              <div className="info-icon">🌐</div>
              <h3>Global Verification</h3>
              <p>Anyone can verify the authenticity of records from anywhere in the world</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImmutableRecords;
