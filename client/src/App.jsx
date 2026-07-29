import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import PostCard from './components/PostCard';
import CreatePostModal from './components/CreatePostModal';
import ModerationQueue from './components/ModerationQueue';
import ProfileView from './components/ProfileView';
import { fetchPosts, fetchModerationQueue } from './utils/api';
import { ShieldCheck, Filter, Sparkles, RefreshCw } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('feed');
  const [filter, setFilter] = useState('all'); // all, verified, flagged
  const [posts, setPosts] = useState([]);
  const [flaggedCount, setFlaggedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadFeed = async () => {
    setIsLoading(true);
    try {
      const res = await fetchPosts(filter);
      if (res.success) {
        setPosts(res.posts);
      }
    } catch (err) {
      console.error('Error fetching feed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadModerationCount = async () => {
    try {
      const res = await fetchModerationQueue();
      if (res.success) {
        setFlaggedCount(res.flaggedPosts.length);
      }
    } catch (err) {
      console.error('Error fetching audit queue:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'feed') {
      loadFeed();
    }
    loadModerationCount();
  }, [activeTab, filter]);

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
    loadModerationCount();
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCreateModal={() => setIsModalOpen(true)}
        flaggedCount={flaggedCount}
      />

      <main className="main-layout">
        {/* Left Sidebar - Manifesto & Info */}
        <aside className="sidebar-left">
          <div className="glass-panel" style={{ padding: '1.2rem', position: 'sticky', top: '80px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--human-emerald)', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.6rem' }}>
              <ShieldCheck size={18} /> Our Human Oath
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '1rem' }}>
              Authentic is built on a simple premise: human emotion, craftsmanship, and raw unedited stories matter. No LLMs, no AI-generated images, no bots.
            </p>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', borderTop: '1px solid var(--border-color)', paddingTop: '0.8rem' }}>
              ⚡ Scanned by Multi-layer Heuristic AI Detector & EXIF Inspector.
            </div>
          </div>
        </aside>

        {/* Center Main Workspace */}
        <section style={{ width: '100%' }}>
          {activeTab === 'feed' && (
            <div>
              {/* Feed Controls */}
              <div className="glass-panel" style={{ padding: '0.9rem 1.2rem', marginBottom: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', fontWeight: 600 }}>
                  <Filter size={16} color="var(--human-emerald)" /> Filter Feed:
                  <button
                    className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setFilter('all')}
                    style={{ padding: '0.3rem 0.7rem', fontSize: '0.78rem' }}
                  >
                    All Published
                  </button>
                  <button
                    className={`btn ${filter === 'verified' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setFilter('verified')}
                    style={{ padding: '0.3rem 0.7rem', fontSize: '0.78rem' }}
                  >
                    100% Verified Only
                  </button>
                </div>

                <button className="btn btn-secondary" onClick={loadFeed} style={{ padding: '0.3rem 0.6rem' }}>
                  <RefreshCw size={14} />
                </button>
              </div>

              {/* Feed Posts */}
              {isLoading ? (
                <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Scanning and verifying feed authenticity...
                </div>
              ) : posts.length === 0 ? (
                <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
                  <p style={{ color: 'var(--text-muted)' }}>No posts match the current filter.</p>
                </div>
              ) : (
                posts.map((post) => (
                  <PostCard key={post.id} post={post} onPostUpdated={loadFeed} />
                ))
              )}
            </div>
          )}

          {activeTab === 'moderation' && (
            <ModerationQueue onAuditCompleted={loadModerationCount} />
          )}

          {activeTab === 'profile' && (
            <ProfileView />
          )}
        </section>

        {/* Right Sidebar - Trending Human Topics */}
        <aside className="sidebar-right">
          <div className="glass-panel" style={{ padding: '1.2rem', position: 'sticky', top: '80px' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Sparkles size={16} color="var(--amber-warm)" /> Verified Human Topics
            </h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.84rem' }}>
              <li style={{ background: 'rgba(255,255,255,0.03)', padding: '0.5rem 0.8rem', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontWeight: 600, color: 'var(--human-emerald)' }}>#AnalogPhotography</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>142 verified photo logs</div>
              </li>
              <li style={{ background: 'rgba(255,255,255,0.03)', padding: '0.5rem 0.8rem', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontWeight: 600, color: 'var(--human-emerald)' }}>#HandwrittenEssays</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>89 human journal entries</div>
              </li>
              <li style={{ background: 'rgba(255,255,255,0.03)', padding: '0.5rem 0.8rem', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontWeight: 600, color: 'var(--human-emerald)' }}>#StudioCrafts</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>215 pottery & woodwork logs</div>
              </li>
            </ul>
          </div>
        </aside>
      </main>

      {/* Post Creation Modal */}
      <CreatePostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPostCreated={handlePostCreated}
      />
    </div>
  );
}
