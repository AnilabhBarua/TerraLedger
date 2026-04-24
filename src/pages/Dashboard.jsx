import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI, getReadOnlyProvider } from '../contractConfig';
import terraLogo from '../icons/SmallSquareLogoJpg.jpg';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    properties: '...',
    transfers: '...',
    security: '100%'
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const provider = getReadOnlyProvider();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);

        const nextId = await contract.nextPropertyId();
        const registered = Number(nextId) > 0 ? Number(nextId) - 1 : 0;

        const filter = contract.filters.OwnershipTransferred();
        const logs = await contract.queryFilter(filter, 0, 'latest');

        setStats({
          properties: registered.toString(),
          transfers: logs.length.toString(),
          security: '100%'
        });
      } catch (err) {
        console.error("Dashboard stats error:", err);
      }
    };
    fetchStats();
  }, []);

  const features = [
    {
      id: 1,
      title: 'Property Registration',
      description: 'Register new properties on the blockchain with complete transparency and security',
      icon: '📝',
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      path: '/register'
    },
    {
      id: 2,
      title: 'Ownership Transfer',
      description: 'Securely transfer property ownership with cryptographic verification',
      icon: '🔄',
      color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      path: '/transfer'
    },
    {
      id: 3,
      title: 'Immutable Records',
      description: 'View permanent, tamper-proof blockchain records of all properties',
      icon: '🔒',
      color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      path: '/records'
    },
    {
      id: 4,
      title: 'Property Search',
      description: 'Search and verify any registered property by ID or owner address',
      icon: '🔍',
      color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      path: '/search'
    },
    {
      id: 5,
      title: 'Transaction History',
      description: 'Real-time updates and complete history of all property transactions',
      icon: '📊',
      color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      path: '/transactions'
    },
    {
      id: 6,
      title: 'Wallet Authentication',
      description: 'Secure wallet-based authentication for property owners and admins',
      icon: '👛',
      color: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
      path: '/wallet'
    }
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-hero">
        <div className="hero-content">
          <div className="hero-logo-wrap">
            <img src={terraLogo} alt="TerraLedger Logo" className="hero-logo" />
          </div>
          <h1 className="hero-title">
            <span className="gradient-text">TerraLedger</span>
          </h1>
          <p className="hero-subtitle">
            Revolutionizing Land Registry with Blockchain Technology
          </p>
          <p className="hero-description">
            Experience the future of property ownership with transparent, secure, and immutable blockchain records
          </p>
        </div>

        <div className="hero-stats">
          <div className="stat-card">
            <div className="stat-value">{stats.properties}</div>
            <div className="stat-label">Properties Registered</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.transfers}</div>
            <div className="stat-label">Transfers Completed</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.security}</div>
            <div className="stat-label">Secure & Verified</div>
          </div>
        </div>
      </div>

      <div className="features-section">
        <h2 className="section-title">Explore Features</h2>
        <div className="features-grid">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="feature-card"
              onClick={() => navigate(feature.path)}
            >
              <div className="feature-icon" style={{ background: feature.color }}>
                <span>{feature.icon}</span>
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
              <button className="feature-button">
                Explore
                <span className="arrow">→</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="benefits-section">
        <h2 className="section-title">Why TerraLedger?</h2>
        <div className="benefits-grid">
          <div className="benefit-card">
            <div className="benefit-icon">🛡️</div>
            <h3>Fraud Prevention</h3>
            <p>Cryptographic security eliminates the possibility of forged or altered records</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">⚡</div>
            <h3>Instant Verification</h3>
            <p>Real-time property verification without intermediaries or delays</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">🌍</div>
            <h3>Global Access</h3>
            <p>Access property records from anywhere in the world, 24/7</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">💎</div>
            <h3>Transparency</h3>
            <p>Complete ownership history visible and auditable on the blockchain</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
