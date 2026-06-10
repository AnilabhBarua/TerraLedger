/**
 * AdminTelemetry.jsx
 *
 * A floating glassmorphic dashboard that surfaces live blockchain telemetry
 * exclusively for admin wallets. It activates whenever any pending toast is
 * detected and fades out on completion.
 *
 * Charts shown:
 *  1. Block Time Feed  — real block timestamps from the provider, plotted as latency (ms between blocks)
 *  2. Network Gas Limit — live gas limit per block fetched from provider
 *  3. Simulated Peer Latency — synthetic data mimicking mempool propagation latency
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  AreaChart, Area,
  LineChart, Line,
  BarChart, Bar,
  XAxis, YAxis,
  Tooltip, ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { ethers } from 'ethers';
import { useToast } from './Toast';
import useWalletRoles from '../hooks/useWalletRoles';
import './AdminTelemetry.css';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MAX_POINTS = 20;

function shortBlock(n) {
  return `#${Number(n).toLocaleString()}`;
}

function randBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Custom Tooltip styled to match the dark theme
function DarkTooltip({ active, payload, label, unit = '' }) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="at-tooltip">
      <span className="at-tooltip__label">{label}</span>
      <span className="at-tooltip__val">{payload[0]?.value?.toLocaleString()}{unit}</span>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function AdminTelemetry() {
  const { toasts } = useToast();
  const { isAdmin } = useWalletRoles();

  const hasPending = toasts.some(t => t.status === 'pending');
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const exitTimer = useRef(null);

  // Animate in/out
  useEffect(() => {
    if (hasPending && isAdmin) {
      clearTimeout(exitTimer.current);
      setExiting(false);
      setVisible(true);
    } else if (visible) {
      // Delay hiding to let exit animation play
      setExiting(true);
      exitTimer.current = setTimeout(() => {
        setVisible(false);
        setExiting(false);
      }, 600);
    }
    return () => clearTimeout(exitTimer.current);
  }, [hasPending, isAdmin]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Block-time data ──────────────────────────────────────────────────────────
  const [blockData, setBlockData] = useState([]);
  const [gasData, setGasData] = useState([]);
  const [latencyData, setLatencyData] = useState(() =>
    Array.from({ length: 10 }, (_, i) => ({ t: `T-${10 - i}`, ms: randBetween(40, 120) }))
  );
  const [txPool, setTxPool] = useState(() => randBetween(85, 210));
  const [confirmations, setConfirmations] = useState(0);
  const [currentBlock, setCurrentBlock] = useState(null);
  const [networkName, setNetworkName] = useState('—');

  const lastTimestampRef = useRef(null);
  const providerRef = useRef(null);

  const initProvider = useCallback(async () => {
    if (!window.ethereum) return;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      providerRef.current = provider;
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);
      // Map common chain IDs to readable names
      const names = { 1: 'Ethereum', 11155111: 'Sepolia', 31337: 'Hardhat Local', 5: 'Goerli' };
      setNetworkName(names[chainId] || `Chain ${chainId}`);
    } catch (_) { /* ignore */ }
  }, []);

  // Subscribe to new blocks when visible
  useEffect(() => {
    if (!visible) return;

    initProvider();

    const provider = providerRef.current || (window.ethereum ? new ethers.BrowserProvider(window.ethereum) : null);
    if (!provider) return;

    let blockCount = 0;

    const handleBlock = async (blockNumber) => {
      try {
        const block = await provider.getBlock(blockNumber);
        if (!block) return;

        setCurrentBlock(blockNumber);
        setConfirmations(c => c + 1);

        // Block time delta
        const ts = Number(block.timestamp) * 1000;
        const delta = lastTimestampRef.current ? ts - lastTimestampRef.current : 12000;
        lastTimestampRef.current = ts;

        setBlockData(prev => {
          const next = [...prev, { block: shortBlock(blockNumber), ms: Math.round(delta / 1000) }];
          return next.slice(-MAX_POINTS);
        });

        // Gas limit (convert from bigint, scale to M)
        const gasLimitM = Math.round(Number(block.gasLimit) / 1_000_000);
        setGasData(prev => {
          const next = [...prev, { block: shortBlock(blockNumber), gas: gasLimitM }];
          return next.slice(-MAX_POINTS);
        });

        blockCount++;
      } catch (_) { /* ignore */ }
    };

    provider.on('block', handleBlock);

    // Synthetic latency ticker (every 2s)
    const latencyInterval = setInterval(() => {
      setLatencyData(prev => {
        const next = [...prev, { t: 'now', ms: randBetween(30, 180) }];
        return next.slice(-MAX_POINTS);
      });
      setTxPool(p => Math.max(50, p + randBetween(-15, 20)));
    }, 2000);

    return () => {
      provider.removeListener('block', handleBlock);
      clearInterval(latencyInterval);
      lastTimestampRef.current = null;
    };
  }, [visible, initProvider]);

  if (!visible || !isAdmin) return null;

  return createPortal(
    <div className={`at-overlay ${exiting ? 'at-overlay--exit' : 'at-overlay--enter'}`}>
      {/* Header */}
      <div className="at-header">
        <div className="at-header__left">
          <span className="at-pulse" />
          <span className="at-header__title">Admin Telemetry</span>
          <span className="at-header__badge">LIVE</span>
        </div>
        <div className="at-header__right">
          <span className="at-header__meta">{networkName}</span>
          {currentBlock && (
            <span className="at-header__meta">Block {Number(currentBlock).toLocaleString()}</span>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="at-stats">
        <div className="at-stat">
          <span className="at-stat__label">Confirmations</span>
          <span className="at-stat__val at-stat__val--green">{confirmations}</span>
        </div>
        <div className="at-stat">
          <span className="at-stat__label">Pending Txns</span>
          <span className="at-stat__val at-stat__val--yellow">{txPool}</span>
        </div>
        <div className="at-stat">
          <span className="at-stat__label">Avg Block Time</span>
          <span className="at-stat__val">
            {blockData.length > 1
              ? `${(blockData.reduce((s, d) => s + d.ms, 0) / blockData.length).toFixed(1)}s`
              : '—'}
          </span>
        </div>
        <div className="at-stat">
          <span className="at-stat__label">Network</span>
          <span className="at-stat__val at-stat__val--blue">{networkName}</span>
        </div>
      </div>

      {/* Charts */}
      <div className="at-charts">

        {/* Chart 1: Block Time */}
        <div className="at-chart-card">
          <div className="at-chart-card__header">
            <span className="at-chart-card__dot at-chart-card__dot--teal" />
            Block Time (seconds)
          </div>
          <ResponsiveContainer width="100%" height={110}>
            {blockData.length >= 2 ? (
              <AreaChart data={blockData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="tealGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00e5cc" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#00e5cc" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="block" tick={{ fill: '#888', fontSize: 9 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fill: '#888', fontSize: 9 }} tickLine={false} axisLine={false} />
                <Tooltip content={<DarkTooltip unit="s" />} />
                <Area type="monotone" dataKey="ms" stroke="#00e5cc" strokeWidth={2} fill="url(#tealGrad)" dot={false} isAnimationActive={false} />
              </AreaChart>
            ) : (
              <div className="at-chart-waiting">Waiting for blocks…</div>
            )}
          </ResponsiveContainer>
        </div>

        {/* Chart 2: Gas Limit per Block */}
        <div className="at-chart-card">
          <div className="at-chart-card__header">
            <span className="at-chart-card__dot at-chart-card__dot--purple" />
            Gas Limit (M)
          </div>
          <ResponsiveContainer width="100%" height={110}>
            {gasData.length >= 2 ? (
              <BarChart data={gasData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0.3} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="block" tick={{ fill: '#888', fontSize: 9 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fill: '#888', fontSize: 9 }} tickLine={false} axisLine={false} />
                <Tooltip content={<DarkTooltip unit="M" />} />
                <Bar dataKey="gas" fill="url(#purpleGrad)" radius={[3, 3, 0, 0]} isAnimationActive={false} />
              </BarChart>
            ) : (
              <div className="at-chart-waiting">Waiting for blocks…</div>
            )}
          </ResponsiveContainer>
        </div>

        {/* Chart 3: Simulated Peer Latency */}
        <div className="at-chart-card">
          <div className="at-chart-card__header">
            <span className="at-chart-card__dot at-chart-card__dot--amber" />
            Mempool Propagation Latency (ms)
          </div>
          <ResponsiveContainer width="100%" height={110}>
            <LineChart data={latencyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="t" tick={{ fill: '#888', fontSize: 9 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: '#888', fontSize: 9 }} tickLine={false} axisLine={false} domain={[0, 200]} />
              <Tooltip content={<DarkTooltip unit="ms" />} />
              <Line
                type="monotone"
                dataKey="ms"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={false}
                filter="url(#glow)"
                isAnimationActive={true}
                animationDuration={400}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* Footer */}
      <div className="at-footer">
        <span className="at-footer__icon">⛓</span>
        Transaction pending — monitoring chain state
      </div>
    </div>,
    document.body
  );
}
