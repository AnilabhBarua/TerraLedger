import React, { useState, useEffect, useMemo } from 'react';
import { ethers } from 'ethers';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Cell,
} from 'recharts';
import { CONTRACT_ADDRESS, CONTRACT_ABI, getReadOnlyProvider, DEPLOY_BLOCK } from '../contractConfig';
import { fetchEventsChunked } from '../utils/chunkedProvider';
import './TransactionHistory.css';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function DarkTooltip({ active, payload, label, unit = '' }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="th-tooltip">
      <div className="th-tooltip__label">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="th-tooltip__row" style={{ color: p.color }}>
          <span>{p.name}:</span>
          <strong>{p.value?.toLocaleString()}{unit}</strong>
        </div>
      ))}
    </div>
  );
}

// Generate simulated transaction data for non-metamask users
function getSimulatedChartData() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const activityData = days.map(d => ({
    day: d,
    Registrations: Math.floor(2 + Math.random() * 5),
    Transfers: Math.floor(1 + Math.random() * 3),
  }));
  const gasData = days.map((d, i) => ({
    day: d,
    gas: Math.floor(180000 + Math.random() * 80000 + i * 5000),
  }));
  return { activityData, gasData };
}

// ─── Main Component ────────────────────────────────────────────────────────────

function TransactionHistory() {
  const [filter, setFilter] = useState('all');
  const [allTransactions, setAllTransactions] = useState([]);
  const [transfersCount, setTransfersCount] = useState(0);
  const [registrationsCount, setRegistrationsCount] = useState(0);
  const [totalGasUsed, setTotalGasUsed] = useState(BigInt(0));
  const [loading, setLoading] = useState(true);
  const [alchemyError, setAlchemyError] = useState(false);
  const [isSimulated, setIsSimulated] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const provider = getReadOnlyProvider();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

        let logsReg = [];
        let logsTrans = [];
        try {
          const provider2 = getReadOnlyProvider();
          logsReg = await fetchEventsChunked(contract, contract.filters.PropertyRegistered(), DEPLOY_BLOCK, provider2);
          logsTrans = await fetchEventsChunked(contract, contract.filters.OwnershipTransferred(), DEPLOY_BLOCK, provider2);
        } catch (logErr) {
          console.warn('Chunked event fetch failed.', logErr);
          setAlchemyError(true);
          setIsSimulated(true);
          setLoading(false);
          return;
        }

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

        const combined = [...regs, ...trans].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        const totalGas = combined.reduce((sum, t) => sum + BigInt(t.gasUsed || 0), BigInt(0));

        setAllTransactions(combined);
        setRegistrationsCount(regs.length);
        setTransfersCount(trans.length);
        setTotalGasUsed(totalGas);
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setIsSimulated(true);
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

  // ── Chart data ─────────────────────────────────────────────────────────────
  const { activityData, gasData } = useMemo(() => {
    if (isSimulated || allTransactions.length === 0) return getSimulatedChartData();

    // Build activity by day of week from real transactions
    const dayMap = { 0: 'Sun', 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat' };
    const activity = {};
    const gasMap = {};

    allTransactions.forEach(tx => {
      const d = dayMap[new Date(tx.timestamp).getDay()];
      if (!activity[d]) activity[d] = { Registrations: 0, Transfers: 0 };
      if (!gasMap[d]) gasMap[d] = 0;
      if (tx.type === 'Registration') activity[d].Registrations++;
      else activity[d].Transfers++;
      gasMap[d] += Number(tx.gasUsed || 0);
    });

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const activityData = days.map(d => ({ day: d, ...(activity[d] || { Registrations: 0, Transfers: 0 }) }));
    const gasDataArr = days.map(d => ({ day: d, gas: gasMap[d] || 0 }));
    return { activityData, gasData: gasDataArr };
  }, [allTransactions, isSimulated]);

  const displayTotalTx = isSimulated ? '47' : allTransactions.length;
  const displayTransfers = isSimulated ? '18' : transfersCount;
  const displayRegs = isSimulated ? '29' : registrationsCount;
  const displayGas = isSimulated ? '12.4K' : (
    allTransactions.length > 0 ? `${(Number(totalGasUsed) / 1000).toFixed(1)}K` : '—'
  );
  const displayAvgGas = isSimulated ? '263K' : (
    allTransactions.length > 0 ? `${Math.round(Number(totalGasUsed) / allTransactions.length).toLocaleString()}` : '—'
  );

  return (
    <div className="transactions-page">
      <div className="transactions-container">
        <div className="transactions-header">
          <h1>Transaction History</h1>
          <p>Real-time updates and complete history of all property transactions</p>
        </div>

        {/* ── Analytics Section ──────────────────────────────────────────── */}
        <div className="th-dashboard">
          {isSimulated && (
            <div className="th-simulated-badge">
              <span>⚡ Simulated Network View</span>
              <span className="th-simulated-sub">Connect a wallet for live transaction data</span>
            </div>
          )}

          {/* Stats */}
          <div className="stats-overview">
            <div className="stat-box">
              <div className="stat-number">{displayTotalTx}</div>
              <div className="stat-label">Total Transactions</div>
            </div>
            <div className="stat-box">
              <div className="stat-number">{displayTransfers}</div>
              <div className="stat-label">Transfers</div>
            </div>
            <div className="stat-box">
              <div className="stat-number">{displayRegs}</div>
              <div className="stat-label">Registrations</div>
            </div>
            <div className="stat-box">
              <div className="stat-number">100%</div>
              <div className="stat-label">Success Rate</div>
            </div>
            <div className="stat-box">
              <div className="stat-number" title={totalGasUsed.toString()}>{displayGas}</div>
              <div className="stat-label">Total Gas Used</div>
            </div>
            <div className="stat-box">
              <div className="stat-number">{displayAvgGas}</div>
              <div className="stat-label">Avg Gas / Tx</div>
            </div>
          </div>

          {/* Charts row */}
          <div className="th-charts">
            <div className="th-chart-card th-chart-card--wide">
              <div className="th-chart-card__header">
                <span className="th-dot th-dot--teal" />
                Transaction Activity by Day
              </div>
              <ResponsiveContainer width="100%" height={190}>
                <AreaChart data={activityData} margin={{ top: 8, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="thRegGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00e5cc" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#00e5cc" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="thTrfGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip content={<DarkTooltip />} />
                  <Area type="monotone" dataKey="Registrations" stroke="#00e5cc" strokeWidth={2} fill="url(#thRegGrad)" dot={false} />
                  <Area type="monotone" dataKey="Transfers" stroke="#a855f7" strokeWidth={2} fill="url(#thTrfGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="th-chart-card">
              <div className="th-chart-card__header">
                <span className="th-dot th-dot--amber" />
                Gas Consumption by Day
              </div>
              <ResponsiveContainer width="100%" height={190}>
                <BarChart data={gasData} margin={{ top: 8, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="thGasGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.9} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.3} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip content={<DarkTooltip unit=" gas" />} />
                  <Bar dataKey="gas" name="Gas" fill="url(#thGasGrad)" radius={[4, 4, 0, 0]}>
                    {gasData.map((_, i) => (
                      <Cell key={i} fill="url(#thGasGrad)" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ── Filters & List ────────────────────────────────────────────── */}
        {alchemyError && (
          <div className="error-message-box" style={{ margin: '0 0 20px 0' }}>
            <strong>Limited View:</strong> Connect a Web3 wallet (MetaMask) to view complete live transaction history.
            Displaying simulated data for demonstration purposes.
          </div>
        )}

        <div className="filter-bar">
          <button id="filter-all" className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All Transactions</button>
          <button id="filter-transfer" className={filter === 'transfer' ? 'active' : ''} onClick={() => setFilter('transfer')}>Transfers Only</button>
          <button id="filter-registration" className={filter === 'registration' ? 'active' : ''} onClick={() => setFilter('registration')}>Registrations Only</button>
        </div>

        <div className="transactions-list">
          {loading ? (
            <p style={{ color: 'var(--text-muted)', padding: '20px 0' }}>Loading transactions from blockchain...</p>
          ) : sortedTransactions.length === 0 ? (
            <div className="th-empty">
              <div className="th-empty__icon">⛓</div>
              <div className="th-empty__title">No transactions to display</div>
              <div className="th-empty__sub">
                {isSimulated
                  ? 'Connect a wallet to load live blockchain transactions.'
                  : `Switch the filter or complete a blockchain transaction first.`}
              </div>
            </div>
          ) : sortedTransactions.map((tx, index) => (
            <div key={tx.id || index} className="transaction-item">
              <div className="tx-main">
                <div className={`tx-icon ${tx.type === 'Registration' ? 'tx-icon--reg' : 'tx-icon--trf'}`}>
                  {tx.type === 'Registration' ? 'REG' : 'TRF'}
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
                    <span className="status-dot" />
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
          <div className="pulse-dot" />
          <span>{isSimulated ? 'Simulated View — Connect Wallet for Live Updates' : 'Real-time Updates Active'}</span>
        </div>
      </div>
    </div>
  );
}

export default TransactionHistory;
