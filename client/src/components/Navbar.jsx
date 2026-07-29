import React from 'react';
import { ShieldCheck, PlusCircle, ShieldAlert, User, Home } from 'lucide-react';

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
          <span className="no-ai-pill">
            NO-AI
          </span>
        </div>

        {/* Center Nav Links */}
        <nav className="header-nav-links">
          <button
            className={`btn ${activeTab === 'feed' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('feed')}
          >
            <Home size={15} /> Feed
          </button>
          <button
            className={`btn ${activeTab === 'moderation' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('moderation')}
            style={{ position: 'relative' }}
          >
            <ShieldAlert size={15} /> Audit Queue
            {flaggedCount > 0 && (
              <span className="flag-count-badge">
                {flaggedCount}
              </span>
            )}
          </button>
          <button
            className={`btn ${activeTab === 'profile' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('profile')}
          >
            <User size={15} /> Profile
          </button>
        </nav>

        {/* Right Actions: Trust pill & Post button */}
        <div className="header-right-actions">
          <div className="badge-human trust-pill" title="Your Verified Human Trust Rating">
            <ShieldCheck size={14} /> 99% Trust
          </div>

          <button className="btn btn-primary create-post-btn" onClick={onOpenCreateModal}>
            <PlusCircle size={17} /> Post Content
          </button>
        </div>
      </div>
    </header>
  );
}
