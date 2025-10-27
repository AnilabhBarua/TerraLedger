import React, { useState } from 'react';
import PropertyCard from './PropertyCard';
import './SearchPortal.css';

function SearchPortal({ contract, account }) {
  const [propertyId, setPropertyId] = useState('');
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!propertyId) {
      setError('Please enter a property ID.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setProperty(null);

      const result = await contract.properties(propertyId);

      if (!result.isRegistered) {
        setError('Property not found. This ID may not be registered yet.');
        return;
      }

      setProperty({
        propertyId: result.propertyId.toString(),
        owner: result.owner,
        location: result.location,
        isRegistered: result.isRegistered,
      });
    } catch (error) {
      console.error('Error fetching property:', error);
      setError('Failed to fetch property. Please check the ID and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="search-portal">
      <div className="portal-header">
        <h2>Property Search</h2>
        <p>Look up any registered property by its unique ID</p>
      </div>

      <div className="search-card">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-group">
            <input
              type="number"
              placeholder="Enter Property ID (e.g., 1, 2, 3...)"
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
              disabled={loading}
              min="1"
            />
            <button
              type="submit"
              className="search-btn"
              disabled={loading}
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </div>

      {property && (
        <PropertyCard
          property={property}
          contract={contract}
          account={account}
        />
      )}
    </div>
  );
}

export default SearchPortal;
