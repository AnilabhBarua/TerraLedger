import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../contractConfig';
import './TransactionHistory.css';

function TransactionHistory() {
  const [filter, setFilter] = useState('all');
  const [allTransactions, setAllTransactions] = useState([]);
  const [transfersCount, setTransfersCount] = useState(0);
  const [registrationsCount, setRegistrationsCount] = useState(0);
  const [totalGasUsed, setTotalGasUsed] = useState(BigInt(0));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!window.ethereum) {
        setLoading(false);
        return;
      }
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

        const filterReg = contract.filters.PropertyRegistered();
        const filterTrans = contract.filters.OwnershipTransferred();

        const logsReg = await contract.queryFilter(filterReg, 0, 'latest');
        const logsTrans = await contract.queryFilter(filterTrans, 0, 'latest');

        const regs = await Promise.all(logsReg.map(async log => {
          const block = await provider.getBlock(log.blockHash);
          const tx = await provider.getTransaction(log.transactionHash);
          const receipt = await provider.getTransactionReceipt(log.transactionHash);
          const gasCostWei = receipt.gasUsed * tx.gasPrice;
          return {
            id: log.transactionHash + '-' + log.index,
            type: 'Registration',
            propertyId: Number(log.args[0]),
            from: 'System',
            to: log.args[1],
            toName: 'Contract Deployer / Admin',
            transactionHash: log.transactionHash,
            timestamp: new Date(block.timestamp * 1000).toISOString(),
            blockNumber: log.blockNumber,
            status: 'confirmed',
            gasUsed: receipt.gasUsed.toString(),
            gasPrice: ethers.formatUnits(tx.gasPrice, 'gwei') + ' Gwei',
            gasCostEth: ethers.formatEther(gasCostWei),
            latency: null,
          };
        }));

        const trans = await Promise.all(logsTrans.map(async log => {
          const block = await provider.getBlock(log.blockHash);
          const tx = await provider.getTransaction(log.transactionHash);
          const receipt = await provider.getTransactionReceipt(log.transactionHash);
          const gasCostWei = receipt.gasUsed * tx.gasPrice;
          return {
            id: log.transactionHash + '-' + log.index,
            type: 'Transfer',
            propertyId: Number(log.args[0]),
            from: log.args[1],
            to: log.args[2],
            toName: 'New Owner',
            transactionHash: log.transactionHash,
            timestamp: new Date(block.timestamp * 1000).toISOString(),
            blockNumber: log.blockNumber,
            status: 'confirmed',
            gasUsed: receipt.gasUsed.toString(),
            gasPrice: ethers.formatUnits(tx.gasPrice, 'gwei') + ' Gwei',
            gasCostEth: ethers.formatEther(gasCostWei),
            latency: null,
          };
        }));

        const combined = [...regs, ...trans].sort((a, b) =>
          new Date(b.timestamp) - new Date(a.timestamp)
        );

        const totalGas = combined.reduce((sum, t) => sum + BigInt(t.gasUsed || 0), BigInt(0));

        setAllTransactions(combined);
        setRegistrationsCount(regs.length);
        setTransfersCount(trans.length);
        setTotalGasUsed(totalGas);
      } catch (err) {
        console.error("Error fetching transactions:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const sortedTransactions = filter === 'all' 
    ? allTransactions 
    : filter === 'transfer' 
        ? allTransactions.filter(tx => tx.type === 'Transfer')
        : allTransactions.filter(tx => tx.type === 'Registration');

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
            <div className="stat-number">{transfersCount}</div>
            <div className="stat-label">Transfers</div>
          </div>
          <div className="stat-box">
            <div className="stat-number">{registrationsCount}</div>
            <div className="stat-label">Registrations</div>
          </div>
          <div className="stat-box">
            <div className="stat-number">100%</div>
            <div className="stat-label">Success Rate</div>
          </div>
          <div className="stat-box">
            <div className="stat-number" title={totalGasUsed.toString()}>
              {allTransactions.length > 0
                ? `${(Number(totalGasUsed) / 1000).toFixed(1)}K`
                : '—'}
            </div>
            <div className="stat-label">Total Gas Used</div>
          </div>
          <div className="stat-box">
            <div className="stat-number">
              {allTransactions.length > 0
                ? `${Math.round(Number(totalGasUsed) / allTransactions.length).toLocaleString()}`
                : '—'}
            </div>
            <div className="stat-label">Avg Gas / Tx</div>
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
          {loading ? (
            <p>Loading transactions from blockchain...</p>
          ) : sortedTransactions.length === 0 ? (
            <p>No transactions found on the blockchain.</p>
          ) : sortedTransactions.map((tx, index) => (
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
                      {tx.fromName || (tx.from === 'System' ? 'System' : 'Previous Owner')}
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
                    <span>{Number(tx.gasUsed).toLocaleString()} units</span>
                  </div>
                  <div className="meta-item">
                    <span>Gas Price:</span>
                    <span>{tx.gasPrice}</span>
                  </div>
                  <div className="meta-item">
                    <span>Gas Cost:</span>
                    <span>{parseFloat(tx.gasCostEth).toFixed(8)} ETH</span>
                  </div>
                  {tx.latency && (
                    <div className="meta-item">
                      <span>Latency:</span>
                      <span>{tx.latency}s</span>
                    </div>
                  )}
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
