import React, { useState } from 'react';
import { mockProperties } from '../mockData';
import './PropertySearch.css';

function PropertySearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState(null);

  const handleSearch = () => {
    const results = mockProperties.filter(p =>
      p.propertyId.toString().includes(searchTerm) ||
      p.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.owner.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setSearchResults(results);
    setSelectedProperty(null);
  };

  return (
    <div className="search-page">
      <div className="search-container">
        <div className="search-header">
          <div className="header-icon">🔍</div>
          <h1>Property Search</h1>
          <p>Search and verify any registered property on the blockchain</p>
        </div>

        <div className="search-box">
          <input
            type="text"
            placeholder="Search by Property ID, Location, or Owner Address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch}>
            <span>🔍</span>
            Search
          </button>
        </div>

        {searchResults.length > 0 && (
          <div className="search-results">
            <h2>{searchResults.length} Properties Found</h2>
            <div className="results-grid">
              {searchResults.map((property) => (
                <div
                  key={property.propertyId}
                  className="result-card"
                  onClick={() => setSelectedProperty(property)}
                >
                  <div className="result-header">
                    <span className="result-id">ID: {property.propertyId}</span>
                    <span className="result-type">{property.type}</span>
                  </div>
                  <div className="result-location">{property.location}</div>
                  <div className="result-details">
                    <span>{property.area}</span>
                    <span className="verified-badge">✓ Verified</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedProperty && (
          <div className="property-details-modal">
            <div className="modal-content">
              <button className="close-btn" onClick={() => setSelectedProperty(null)}>×</button>

              <div className="modal-header">
                <h2>Property Details</h2>
                <span className="verified-large">✓ Blockchain Verified</span>
              </div>

              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">Property ID</span>
                  <span className="detail-value">{selectedProperty.propertyId}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Owner</span>
                  <span className="detail-value hash">{selectedProperty.owner}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Owner Name</span>
                  <span className="detail-value">{selectedProperty.ownerName}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Location</span>
                  <span className="detail-value">{selectedProperty.location}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Property Type</span>
                  <span className="detail-value">{selectedProperty.type}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Area</span>
                  <span className="detail-value">{selectedProperty.area}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Estimated Value</span>
                  <span className="detail-value">{selectedProperty.price}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Registration Date</span>
                  <span className="detail-value">{new Date(selectedProperty.registrationDate).toLocaleString()}</span>
                </div>
                <div className="detail-item full-width">
                  <span className="detail-label">Transaction Hash</span>
                  <span className="detail-value hash">{selectedProperty.transactionHash}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Block Number</span>
                  <span className="detail-value">{selectedProperty.blockNumber.toLocaleString()}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Status</span>
                  <span className="detail-value status-active">Active & Verified</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="quick-search">
          <h3>Quick Search</h3>
          <div className="quick-buttons">
            {mockProperties.slice(0, 5).map((prop) => (
              <button
                key={prop.propertyId}
                onClick={() => {
                  setSearchTerm(prop.propertyId.toString());
                  setSearchResults([prop]);
                  setSelectedProperty(prop);
                }}
              >
                Property #{prop.propertyId}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PropertySearch;
