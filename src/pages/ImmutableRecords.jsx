import React from 'react';
import { mockProperties } from '../mockData';
import './ImmutableRecords.css';

function ImmutableRecords() {
  return (
    <div className="records-page">
      <div className="records-container">
        <div className="records-header">
          <div className="header-icon">🔒</div>
          <h1>Immutable Blockchain Records</h1>
          <p>Permanent, tamper-proof property records secured by blockchain technology</p>
        </div>

        <div className="blockchain-visual">
          <div className="block-chain">
            {[1, 2, 3, 4, 5].map((block) => (
              <div key={block} className="block">
                <div className="block-header">
                  <span>Block #{15234560 + block * 1000}</span>
                </div>
                <div className="block-content">
                  <div className="block-hash">
                    {`0x${Math.random().toString(16).substr(2, 16)}...`}
                  </div>
                  <div className="block-tx">{Math.floor(Math.random() * 50 + 10)} transactions</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="records-grid">
          {mockProperties.map((property) => (
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
                  <span className="value">{new Date(property.registrationDate).toLocaleString()}</span>
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
