import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle, Trash2, RefreshCw, AlertTriangle } from 'lucide-react';
import { fetchModerationQueue, resolveModeration } from '../utils/api';

export default function ModerationQueue({ onAuditCompleted }) {
  const [flaggedPosts, setFlaggedPosts] = useState([]);
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState(null);

  const loadQueue = async () => {
    setIsLoading(true);
    try {
      const res = await fetchModerationQueue();
      if (res.success) {
        setFlaggedPosts(res.flaggedPosts);
        setReports(res.reports);
      }
    } catch (err) {
      console.error('Fetch moderation queue error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, []);

  const handleResolve = async (postId, decision) => {
    try {
      const res = await resolveModeration(postId, decision);
      if (res.success) {
        setActionMsg(res.message);
        loadQueue();
        if (onAuditCompleted) onAuditCompleted();
        setTimeout(() => setActionMsg(null), 3000);
      }
    } catch (err) {
      console.error('Resolve moderation error:', err);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <ShieldAlert color="var(--amber-warm)" size={22} />
              AI Moderation & Audit Queue
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Review community flags and suspicious posts flagged by the AI detection engine.
            </p>
          </div>
          <button className="btn btn-secondary" onClick={loadQueue} style={{ padding: '0.5rem' }}>
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {actionMsg && (
        <div style={{ background: 'var(--human-emerald-glow)', border: '1px solid var(--human-emerald)', padding: '0.8rem', borderRadius: 'var(--radius-md)', color: 'var(--human-emerald)', fontSize: '0.88rem', marginBottom: '1.2rem' }}>
          ✓ {actionMsg}
        </div>
      )}

      {isLoading ? (
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading moderation queue...
        </div>
      ) : flaggedPosts.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <CheckCircle size={40} color="var(--human-emerald)" style={{ marginBottom: '0.8rem' }} />
          <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '0.4rem' }}>Audit Queue Clean</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No pending AI flags or reported posts. Human content integrity is 100% intact!</p>
        </div>
      ) : (
        flaggedPosts.map((post) => {
          const postReports = reports.filter((r) => r.post_id === post.id);
          return (
            <div key={post.id} className="glass-panel" style={{ padding: '1.4rem', marginBottom: '1.2rem', borderLeft: '4px solid var(--amber-warm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <img src={post.avatar} alt={post.display_name} style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
                  <div>
                    <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>{post.display_name}</span>
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.78rem', marginLeft: '0.4rem' }}>@{post.username}</span>
                  </div>
                </div>

                <div className="badge-risk">
                  <AlertTriangle size={14} /> {post.ai_probability}% AI Risk Probability
                </div>
              </div>

              <p style={{ fontSize: '0.92rem', color: '#cbd5e1', marginBottom: '1rem', background: 'rgba(11,15,25,0.5)', padding: '0.8rem', borderRadius: 'var(--radius-sm)' }}>
                "{post.content}"
              </p>

              {post.image_url && (
                <div style={{ maxHeight: '180px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', marginBottom: '1rem' }}>
                  <img src={post.image_url} alt="Flagged attachment" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}

              {/* Reports list */}
              {postReports.length > 0 && (
                <div style={{ marginBottom: '1rem', background: 'rgba(245, 158, 11, 0.08)', padding: '0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(245,158,11,0.2)' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--amber-warm)', marginBottom: '0.4rem' }}>
                    Community Flag Reason ({postReports.length}):
                  </div>
                  {postReports.map((r) => (
                    <div key={r.id} style={{ fontSize: '0.8rem', color: '#e2e8f0' }}>
                      • @{r.reporter_username}: "{r.reason}"
                    </div>
                  ))}
                </div>
              )}

              {/* Moderator Decision Toolbar */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem', paddingTop: '0.8rem', borderTop: '1px solid var(--border-color)' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => handleResolve(post.id, 'approve_human')}
                  style={{ color: 'var(--human-emerald)', borderColor: 'rgba(16,185,129,0.3)' }}
                >
                  <CheckCircle size={16} /> Approve as 100% Human
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleResolve(post.id, 'remove_ai')}
                >
                  <Trash2 size={16} /> Remove AI Content
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
