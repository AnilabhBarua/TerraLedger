import React, { useState, useEffect, useRef } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI, getReadOnlyProvider } from '../contractConfig';
import './LiveEventsPanel.css';

// ── Event metadata config ────────────────────────────────────────────────────

const EVENT_CONFIGS = {
  PropertyRegistered: {
    label: 'Property Registered',
    icon: '🏠',
    colorClass: 'lep-item--registered',
    accentVar: '--lep-green',
    getDetails: (args) =>
      `Property #${Number(args[0])} · Owner: ${String(args[1]).slice(0, 8)}…`,
  },
  TransferRequested: {
    label: 'Transfer Requested',
    icon: '📤',
    colorClass: 'lep-item--req',
    accentVar: '--lep-amber',
    getDetails: (args) =>
      `Property #${Number(args[0])} · From: ${String(args[1]).slice(0, 8)}…`,
  },
  TransferApproved: {
    label: 'Transfer Approved',
    icon: '✅',
    colorClass: 'lep-item--approved',
    accentVar: '--lep-blue',
    getDetails: (args) =>
      `Property #${Number(args[0])} → ${String(args[2]).slice(0, 8)}…`,
  },
  OwnershipTransferred: {
    label: 'Ownership Transferred',
    icon: '🔄',
    colorClass: 'lep-item--ownership',
    accentVar: '--lep-purple',
    getDetails: (args) =>
      `Property #${Number(args[0])} · New owner: ${String(args[2]).slice(0, 8)}…`,
  },
  PropertyDocumentUpdated: {
    label: 'Document Updated',
    icon: '📄',
    colorClass: 'lep-item--doc',
    accentVar: '--lep-cyan',
    getDetails: (args) =>
      `Property #${Number(args[0])} · Updated by ${String(args[1]).slice(0, 8)}…`,
  },
};

let _evId = 0;

// ── Component ────────────────────────────────────────────────────────────────

export default function LiveEventsPanel() {
  const [events, setEvents] = useState([]);
  const [isOpen, setIsOpen] = useState(true);
  const [connected, setConnected] = useState(false);
  const contractRef = useRef(null);
  const MAX = 8;

  useEffect(() => {
    let contract;

    const setup = async () => {
      try {
        const provider = getReadOnlyProvider();
        contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
        contractRef.current = contract;

        // Record the current block so we ONLY show events mined AFTER we mount
        const startBlock = await provider.getBlockNumber();
        setConnected(true);

        // Deduplicate: track seen tx+index combos so polling can't duplicate events
        const seenKeys = new Set();

        const push = (eventName, rawArgs) => {
          const config = EVENT_CONFIGS[eventName];
          if (!config) return;

          // In ethers v6, last arg is the ContractEventPayload / EventLog object
          const log = rawArgs[rawArgs.length - 1];
          const args = rawArgs.slice(0, -1);

          // Ignore any historical events from before we mounted
          if (log?.blockNumber != null && log.blockNumber <= startBlock) return;

          // Deduplicate by txHash + logIndex
          const dedupeKey = `${log?.transactionHash ?? ''}-${log?.index ?? log?.logIndex ?? _evId}`;
          if (seenKeys.has(dedupeKey)) return;
          seenKeys.add(dedupeKey);
          // Keep the seen set from growing unbounded
          if (seenKeys.size > 200) seenKeys.clear();

          const ev = {
            id: ++_evId,
            eventName,
            label: config.label,
            icon: config.icon,
            colorClass: config.colorClass,
            details: config.getDetails(args),
            txHash: log?.transactionHash ?? null,
            blockNumber: log?.blockNumber ?? null,
            ts: Date.now(),
          };

          setEvents(prev => [ev, ...prev].slice(0, MAX));
        };

        // Subscribe to all 5 contract events
        Object.keys(EVENT_CONFIGS).forEach(name => {
          contract.on(name, (...rawArgs) => push(name, rawArgs));
        });
      } catch (err) {
        console.warn('[LiveEventsPanel] Could not connect:', err.message);
        setConnected(false);
      }
    };

    setup();

    return () => {
      contractRef.current?.removeAllListeners();
    };
  }, []);

  // Format relative time
  const relTime = (ts) => {
    const s = Math.floor((Date.now() - ts) / 1000);
    if (s < 5) return 'just now';
    if (s < 60) return `${s}s ago`;
    return `${Math.floor(s / 60)}m ago`;
  };

  return (
    <div className={`lep ${isOpen ? 'lep--open' : 'lep--collapsed'}`} role="complementary" aria-label="Live blockchain events">
      {/* ── Header (always visible) ── */}
      <button className="lep__header" onClick={() => setIsOpen(v => !v)} aria-expanded={isOpen}>
        <div className="lep__header-left">
          <span className={`lep__dot ${connected ? 'lep__dot--live' : 'lep__dot--offline'}`} />
          <span className="lep__title">Live Chain Events</span>
        </div>
        <div className="lep__header-right">
          {events.length > 0 && <span className="lep__badge">{events.length}</span>}
          <svg className={`lep__chevron ${isOpen ? 'lep__chevron--up' : ''}`} viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      {/* ── Body ── */}
      {isOpen && (
        <div className="lep__body">
          {events.length === 0 ? (
            <div className="lep__empty">
              <div className="lep__empty-icon">⛓️</div>
              <p className="lep__empty-title">Listening for events…</p>
              <p className="lep__empty-sub">Smart contract events will appear here in real-time as transactions are mined.</p>
            </div>
          ) : (
            <ul className="lep__list" aria-live="polite" aria-relevant="additions">
              {events.map((ev, idx) => (
                <li key={ev.id} className={`lep__item ${ev.colorClass} ${idx === 0 ? 'lep__item--new' : ''}`}>
                  <div className="lep__item-icon">{ev.icon}</div>
                  <div className="lep__item-body">
                    <div className="lep__item-header">
                      <span className="lep__item-label">{ev.label}</span>
                      <span className="lep__item-time">{relTime(ev.ts)}</span>
                    </div>
                    <div className="lep__item-details">{ev.details}</div>
                    <div className="lep__item-meta">
                      {ev.txHash && (
                        <span className="lep__item-hash">
                          Tx: <code>{ev.txHash.slice(0, 10)}…{ev.txHash.slice(-6)}</code>
                        </span>
                      )}
                      {ev.blockNumber && (
                        <span className="lep__item-block">Block #{Number(ev.blockNumber).toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {events.length > 0 && (
            <button className="lep__clear" onClick={() => setEvents([])}>
              Clear feed
            </button>
          )}
        </div>
      )}
    </div>
  );
}
