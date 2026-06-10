import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI, getReadOnlyProvider, DEPLOY_BLOCK } from '../contractConfig';
import { useToast } from '../components/Toast';
import useWalletRoles from '../hooks/useWalletRoles';
import './RoleManager.css';

function RoleManager() {
  const [address, setAddress] = useState('');
  const [txLoading, setTxLoading] = useState(false);
  const [registrars, setRegistrars] = useState([]);
  const [stats, setStats] = useState({ properties: 0, pendingTransfers: 0, registrars: 0 });
  const [dataLoading, setDataLoading] = useState(true);

  const { addToast, updateToast } = useToast();
  const { address: adminAddress, isAdmin: userIsAdmin, loading: rolesLoading } = useWalletRoles();

  // ── Fetch on-chain data: registrar list + stats ──
  const fetchDashboardData = useCallback(async () => {
    setDataLoading(true);
    try {
      const provider = getReadOnlyProvider();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

      // 1. Fetch stats concurrently
      const [nextId] = await Promise.all([contract.nextPropertyId()]);
      const totalProperties = Number(nextId) - 1;

      // 2. Fetch pending transfers concurrently
      let pendingCount = 0;
      if (totalProperties > 0) {
        const ids = Array.from({ length: totalProperties }, (_, i) => i + 1);
        const reqs = await Promise.all(ids.map(i => contract.transferRequests(i)));
        pendingCount = reqs.filter(r => r.pending).length;
      }

      // 3. Fetch RoleGranted / RoleRevoked events to build live registrar list
      const registrarRole = await contract.REGISTRAR_ROLE();
      let grantedLogs = [], revokedLogs = [];
      try {
        const grantFilter = contract.filters.RoleGranted(registrarRole);
        const revokeFilter = contract.filters.RoleRevoked(registrarRole);
        [grantedLogs, revokedLogs] = await Promise.all([
          contract.queryFilter(grantFilter, DEPLOY_BLOCK, 'latest'),
          contract.queryFilter(revokeFilter, DEPLOY_BLOCK, 'latest'),
        ]);
      } catch (logErr) {
        console.warn('Could not fetch role events (block range limit):', logErr);
      }

      // Build set: granted minus revoked
      const revokedSet = new Set(revokedLogs.map(l => l.args.account.toLowerCase()));
      const seen = new Set();
      const activeRegistrars = [];
      for (const log of grantedLogs) {
        const acc = log.args.account.toLowerCase();
        if (!revokedSet.has(acc) && !seen.has(acc)) {
          seen.add(acc);
          // Double-check live on-chain status
          const isStillRegistrar = await contract.hasRole(registrarRole, log.args.account);
          if (isStillRegistrar) {
            activeRegistrars.push({
              address: log.args.account,
              grantedBy: log.args.sender,
              blockNumber: log.blockNumber,
              txHash: log.transactionHash,
            });
          }
        }
      }

      setRegistrars(activeRegistrars);
      setStats({
        properties: totalProperties,
        pendingTransfers: pendingCount,
        registrars: activeRegistrars.length,
      });
    } catch (err) {
      console.error('fetchDashboardData error:', err);
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userIsAdmin) fetchDashboardData();
  }, [userIsAdmin, fetchDashboardData]);

  // ── Grant / Revoke Registrar Role ──
  const handleRoleAction = async (action, targetAddress) => {
    const addr = targetAddress || address;
    if (!addr || !/^0x[a-fA-F0-9]{40}$/.test(addr)) {
      addToast('Invalid Address', 'Please enter a valid Ethereum address (0x…).', 'error', 5000);
      return;
    }
    setTxLoading(true);
    if (!window.ethereum) {
      addToast('MetaMask Required', 'Please install MetaMask to continue.', 'error', 5000);
      setTxLoading(false);
      return;
    }

    const actionLabel = action === 'add' ? 'Granting' : 'Revoking';
    const toastId = addToast(`${actionLabel} Registrar Role`, 'Awaiting MetaMask signature…', 'pending', 0);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const tx = action === 'add'
        ? await contract.addRegistrar(addr)
        : await contract.removeRegistrar(addr);

      updateToast(toastId, 'Transaction Sent', 'Waiting for block confirmation…', 'pending', 0, { hash: tx.hash });
      const t0 = performance.now();
      await tx.wait();
      const latency = ((performance.now() - t0) / 1000).toFixed(2);

      updateToast(
        toastId,
        `✅ Role ${action === 'add' ? 'Granted' : 'Revoked'}`,
        `${action === 'add' ? 'Granted to' : 'Revoked from'} ${addr.slice(0, 16)}… • ${latency}s`,
        'success',
        8000,
        { hash: tx.hash }
      );
      setAddress('');
      await fetchDashboardData(); // refresh the table
    } catch (err) {
      console.error(err);
      updateToast(toastId, 'Transaction Failed', err.reason || err.message || 'Transaction failed.', 'error', 7000);
    } finally {
      setTxLoading(false);
    }
  };

  // ── Guard renders ──
  if (rolesLoading) {
    return (
      <div className="role-manager-page">
        <div className="rm-loading-screen">
          <div className="rm-spinner" />
          <p>Verifying on-chain permissions…</p>
        </div>
      </div>
    );
  }

  if (!userIsAdmin) {
    return (
      <div className="role-manager-page">
        <div className="rm-access-denied">
          <div className="rm-denied-icon">🔒</div>
          <h2>Access Denied</h2>
          <p>This dashboard is restricted to the <strong>Authority</strong> role only.</p>
        </div>
      </div>
    );
  }

  // ── Stat card component ──
  const StatCard = ({ icon, label, value, color }) => (
    <div className={`rm-stat-card rm-stat-card--${color}`}>
      <div className="rm-stat-icon">{icon}</div>
      <div className="rm-stat-value">{dataLoading ? '—' : value}</div>
      <div className="rm-stat-label">{label}</div>
    </div>
  );

  return (
    <div className="role-manager-page">
      <div className="role-manager-container">

        {/* ── Header ── */}
        <div className="rm-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Manage registrar access, monitor system health, and oversee land registry activity.</p>
          </div>
          <div className="rm-authority-badge">
            <span className="rm-authority-dot" />
            Authority: {adminAddress ? `${adminAddress.slice(0, 8)}…${adminAddress.slice(-6)}` : '—'}
          </div>
        </div>

        {/* ── Stats Row ── */}
        <div className="rm-stats-grid">
          <StatCard icon="🏛️" label="Total Properties Registered" value={stats.properties} color="blue" />
          <StatCard icon="⏳" label="Pending Transfers" value={stats.pendingTransfers} color="yellow" />
          <StatCard icon="🪪" label="Active Registrars" value={stats.registrars} color="green" />
        </div>

        {/* ── Grant New Registrar ── */}
        <div className="rm-section">
          <h2 className="rm-section-title">Grant Registrar Access</h2>
          <p className="rm-section-desc">Enter an Ethereum wallet address to grant the Registrar role. Registrars can register new land parcels and approve ownership transfers.</p>
          <div className="rm-grant-row">
            <input
              type="text"
              className="rm-input"
              placeholder="Wallet address (0x...)"
              value={address}
              onChange={e => setAddress(e.target.value)}
              disabled={txLoading}
              spellCheck={false}
            />
            <button
              className="rm-btn rm-btn--grant"
              onClick={() => handleRoleAction('add')}
              disabled={txLoading || !address}
            >
              {txLoading ? <span className="rm-btn-spinner" /> : '＋'} Grant Role
            </button>
          </div>
        </div>

        {/* ── Active Registrars Table ── */}
        <div className="rm-section">
          <div className="rm-section-title-row">
            <h2 className="rm-section-title">Active Registrars</h2>
            <button className="rm-refresh-btn" onClick={fetchDashboardData} disabled={dataLoading} title="Refresh">
              {dataLoading ? '⟳' : '↻'} Refresh
            </button>
          </div>

          {dataLoading ? (
            <div className="rm-skeleton-table">
              {[1, 2, 3].map(i => (
                <div key={i} className="rm-skeleton-row">
                  <div className="rm-skeleton rm-skeleton--wide" />
                  <div className="rm-skeleton rm-skeleton--mid" />
                  <div className="rm-skeleton rm-skeleton--short" />
                </div>
              ))}
            </div>
          ) : registrars.length === 0 ? (
            <div className="rm-empty-state">
              <span>🪪</span>
              <p>No active registrars found. Grant access to a wallet address above.</p>
            </div>
          ) : (
            <div className="rm-table-wrapper">
              <table className="rm-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Registrar Address</th>
                    <th>Granted By</th>
                    <th>Block</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {registrars.map((r, i) => (
                    <tr key={r.address}>
                      <td className="rm-td-num">{i + 1}</td>
                      <td>
                        <div className="rm-address-cell">
                          <span className="rm-address-full">{r.address}</span>
                          <span className="rm-address-short">{r.address.slice(0, 10)}…{r.address.slice(-8)}</span>
                          <span className="rm-active-pill">Active</span>
                        </div>
                      </td>
                      <td>
                        <span className="rm-address-short">{r.grantedBy.slice(0, 10)}…{r.grantedBy.slice(-6)}</span>
                      </td>
                      <td className="rm-td-block">#{r.blockNumber.toLocaleString()}</td>
                      <td>
                        <button
                          className="rm-revoke-btn"
                          onClick={() => handleRoleAction('remove', r.address)}
                          disabled={txLoading}
                          title={`Revoke registrar role from ${r.address}`}
                        >
                          Revoke
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Info panel ── */}
        <div className="rm-info-panel">
          <div className="rm-info-icon">ℹ️</div>
          <div>
            <strong>Role Architecture</strong>
            <p>The <em>Authority</em> role (you) manages Registrar access. Registrars can register properties and approve transfers, but cannot manage other roles. All role changes are recorded permanently on-chain.</p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default RoleManager;
