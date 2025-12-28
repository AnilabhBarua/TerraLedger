import React, { useState } from 'react';
import { mockTransactions, mockProperties } from '../mockData';
import './TransactionHistory.css';

function TransactionHistory() {
  const [filter, setFilter] = useState('all');

  const allTransactions = [
    ...mockTransactions,
    ...mockProperties.map(prop => ({
      id: `reg-${prop.propertyId}`,
      type: 'Registration',
      propertyId: prop.propertyId,
      from: 'System',
      to: prop.owner,
      toName: prop.ownerName,
      transactionHash: prop.transactionHash,
      timestamp: prop.registrationDate,
      blockNumber: prop.blockNumber,
      status: 'confirmed',
      gasUsed: '89234',
      gasPrice: '25 Gwei'
    }))
  ];

  const sortedTransactions = allTransactions.sort((a, b) =>
    new Date(b.timestamp) - new Date(a.timestamp)
  );

  return (
    <div className="transactions-page">
      <div className="transactions-container">
        <div className="transactions-header">
          <div className="header-icon">📊</div>
          <h1>Transaction History</h1>
          <p>Real-time updates and complete history of all property transactions</p>
        </div>

        <div className="stats-overview">
          <div className="stat-box">
            <div className="stat-number">{allTransactions.length}</div>
            <div className="stat-label">Total Transactions</div>
          </div>
          <div className="stat-box">
            <div className="stat-number">{mockTransactions.length}</div>
            <div className="stat-label">Transfers</div>
          </div>
          <div className="stat-box">
            <div className="stat-number">{mockProperties.length}</div>
            <div className="stat-label">Registrations</div>
          </div>
          <div className="stat-box">
            <div className="stat-number">100%</div>
            <div className="stat-label">Success Rate</div>
          </div>
        </div>

        <div className="filter-bar">
          <button
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            All Transactions
          </button>
          <button
            className={filter === 'transfer' ? 'active' : ''}
            onClick={() => setFilter('transfer')}
          >
            Transfers Only
          </button>
          <button
            className={filter === 'registration' ? 'active' : ''}
            onClick={() => setFilter('registration')}
          >
            Registrations Only
          </button>
        </div>

        <div className="transactions-list">
          {sortedTransactions.map((tx, index) => (
            <div key={tx.id || index} className="transaction-item">
              <div className="tx-main">
                <div className="tx-icon">
                  {tx.type === 'Registration' ? '📝' : '🔄'}
                </div>
                <div className="tx-info">
                  <div className="tx-title">
                    {tx.type === 'Registration' ? 'Property Registration' : 'Ownership Transfer'}
                    <span className="tx-property">Property #{tx.propertyId}</span>
                  </div>
                  <div className="tx-details">
                    <span className="tx-hash">{tx.transactionHash.substring(0, 20)}...</span>
                    <span className="tx-time">{new Date(tx.timestamp).toLocaleString()}</span>
                  </div>
                </div>
                <div className="tx-status">
                  <div className="status-badge confirmed">
                    <span className="status-dot"></span>
                    Confirmed
                  </div>
                  <div className="block-number">Block #{tx.blockNumber.toLocaleString()}</div>
                </div>
              </div>

              <div className="tx-expanded">
                <div className="tx-flow">
                  <div className="flow-item">
                    <div className="flow-label">From</div>
                    <div className="flow-value">
                      {tx.fromName || tx.from}
                      {tx.from !== 'System' && (
                        <div className="flow-address">{tx.from.substring(0, 20)}...</div>
                      )}
                    </div>
                  </div>
                  <div className="flow-arrow">→</div>
                  <div className="flow-item">
                    <div className="flow-label">To</div>
                    <div className="flow-value">
                      {tx.toName}
                      <div className="flow-address">{tx.to.substring(0, 20)}...</div>
                    </div>
                  </div>
                </div>

                <div className="tx-meta">
                  <div className="meta-item">
                    <span>Gas Used:</span>
                    <span>{tx.gasUsed}</span>
                  </div>
                  <div className="meta-item">
                    <span>Gas Price:</span>
                    <span>{tx.gasPrice}</span>
                  </div>
                  <div className="meta-item">
                    <span>Status:</span>
                    <span className="success">✓ Success</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="real-time-indicator">
          <div className="pulse-dot"></div>
          <span>Real-time Updates Active</span>
        </div>
      </div>
    </div>
  );
}

export default TransactionHistory;
