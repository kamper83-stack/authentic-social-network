import React from 'react';
import { ShieldCheck, PlusCircle, ShieldAlert, User, Home, Sparkles } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onOpenCreateModal, flaggedCount = 0 }) {
  return (
    <header className="app-header">
      <div className="header-container">
        {/* Brand Logo */}
        <div className="brand-logo" onClick={() => setActiveTab('feed')} style={{ cursor: 'pointer' }}>
          <div className="brand-icon">
            <ShieldCheck size={20} />
          </div>
          <span>Authentic</span>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--human-emerald)', background: 'var(--human-emerald-glow)', padding: '0.15rem 0.5rem', borderRadius: '12px' }}>
            NO-AI
          </span>
        </div>

        {/* Center Nav Links */}
        <nav style={{ display: 'flex', gap: '0.6rem' }}>
          <button
            className={`btn ${activeTab === 'feed' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('feed')}
            style={{ padding: '0.5rem 1rem' }}
          >
            <Home size={16} /> Feed
          </button>
          <button
            className={`btn ${activeTab === 'moderation' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('moderation')}
            style={{ padding: '0.5rem 1rem', position: 'relative' }}
          >
            <ShieldAlert size={16} /> Audit Queue
            {flaggedCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                background: 'var(--ruby-risk)',
                color: '#fff',
                fontSize: '0.7rem',
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
            style={{ padding: '0.5rem 1rem' }}
          >
            <User size={16} /> My Profile
          </button>
        </nav>

        {/* Right Action */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="badge-human" title="Your Verified Human Trust Rating">
            <ShieldCheck size={14} /> 99% Human Trust
          </div>

          <button className="btn btn-primary" onClick={onOpenCreateModal}>
            <PlusCircle size={18} /> Post Content
          </button>
        </div>
      </div>
    </header>
  );
}
