import React from 'react';
import { ShieldCheck, PlusCircle, ShieldAlert, User, Home } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onOpenCreateModal, flaggedCount = 0 }) {
  return (
    <header className="app-header">
      <div className="header-container">
        {/* Top row on mobile: Logo & Trust Badge */}
        <div className="header-nav-row">
          <div className="brand-logo" onClick={() => setActiveTab('feed')} style={{ cursor: 'pointer' }}>
            <div className="brand-icon">
              <ShieldCheck size={20} />
            </div>
            <span>Authentic</span>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--human-emerald)', background: 'var(--human-emerald-glow)', padding: '0.15rem 0.45rem', borderRadius: '12px' }}>
              NO-AI
            </span>
          </div>

          <div className="badge-human hide-on-mobile" title="Your Verified Human Trust Rating">
            <ShieldCheck size={14} /> 99% Trust
          </div>
        </div>

        {/* Action row: Tabs & Post Button */}
        <div className="header-actions-row">
          <nav style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            <button
              className={`btn ${activeTab === 'feed' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('feed')}
              style={{ padding: '0.45rem 0.8rem', fontSize: '0.82rem' }}
            >
              <Home size={15} /> Feed
            </button>
            <button
              className={`btn ${activeTab === 'moderation' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('moderation')}
              style={{ padding: '0.45rem 0.8rem', fontSize: '0.82rem', position: 'relative' }}
            >
              <ShieldAlert size={15} /> Audit Queue
              {flaggedCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: 'var(--ruby-risk)',
                  color: '#fff',
                  fontSize: '0.68rem',
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700
                }}>
                  {flaggedCount}
                </span>
              )}
            </button>
            <button
              className={`btn ${activeTab === 'profile' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('profile')}
              style={{ padding: '0.45rem 0.8rem', fontSize: '0.82rem' }}
            >
              <User size={15} /> Profile
            </button>
          </nav>

          <button className="btn btn-primary" onClick={onOpenCreateModal} style={{ padding: '0.45rem 0.9rem', fontSize: '0.84rem' }}>
            <PlusCircle size={17} /> Post Content
          </button>
        </div>
      </div>
    </header>
  );
}
