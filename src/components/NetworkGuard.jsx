import React from 'react';
import useNetwork, { SUPPORTED_NETWORKS, TARGET_CHAIN_ID } from '../hooks/useNetwork';
import './NetworkGuard.css';

/**
 * NetworkGuard renders a full-width warning banner below the Navbar whenever
 * the connected wallet is on the wrong network. It also provides a one-click
 * "Switch Network" button to automatically correct it.
 */
function NetworkGuard() {
  const { chainId, isCorrectNetwork, networkName, isSwitching, switchError, switchToCorrectNetwork } = useNetwork();

  // If no MetaMask, no wallet connected yet, or already on the right chain — render nothing
  if (!window.ethereum || chainId === null || isCorrectNetwork) {
    return null;
  }

  const targetName = SUPPORTED_NETWORKS[TARGET_CHAIN_ID]?.chainName ?? `Chain ${TARGET_CHAIN_ID}`;

  return (
    <div className="network-guard" role="alert">
      <div className="network-guard__inner">
        <div className="network-guard__icon">⚠️</div>
        <div className="network-guard__body">
          <span className="network-guard__title">Wrong Network Detected</span>
          <span className="network-guard__sub">
            You are connected to&nbsp;<strong>{networkName}</strong>. TerraLedger requires&nbsp;
            <strong>{targetName}</strong>.
          </span>
        </div>
        <div className="network-guard__actions">
          {switchError && (
            <span className="network-guard__error">{switchError}</span>
          )}
          <button
            className="network-guard__btn"
            onClick={switchToCorrectNetwork}
            disabled={isSwitching}
          >
            {isSwitching ? (
              <>
                <span className="network-guard__spinner" />
                Switching…
              </>
            ) : (
              `Switch to ${targetName}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default NetworkGuard;
