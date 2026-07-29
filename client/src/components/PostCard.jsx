import React, { useState } from 'react';
import { Heart, MessageSquare, ShieldCheck, ShieldAlert, Flag, Send } from 'lucide-react';
import { toggleLike, fetchComments, addComment, reportAiContent } from '../utils/api';

export default function PostCard({ post, onPostUpdated }) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  
  // Report AI Modal
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);

  const handleLike = async () => {
    try {
      const res = await toggleLike(post.id);
      if (res.success) {
        setLiked(res.liked);
        setLikesCount((prev) => (res.liked ? prev + 1 : Math.max(0, prev - 1)));
      }
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  const handleToggleComments = async () => {
    if (!showComments && comments.length === 0) {
      setIsLoadingComments(true);
      try {
        const res = await fetchComments(post.id);
        if (res.success) {
          setComments(res.comments);
        }
      } catch (err) {
        console.error('Comments fetch error:', err);
      } finally {
        setIsLoadingComments(false);
      }
    }
    setShowComments(!showComments);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const res = await addComment(post.id, newComment);
      if (res.success) {
        setComments([...comments, res.comment]);
        setNewComment('');
      }
    } catch (err) {
      console.error('Add comment error:', err);
    }
  };

  const handleReportAi = async (e) => {
    e.preventDefault();
    if (!reportReason.trim()) return;

    try {
      const res = await reportAiContent(post.id, reportReason);
      if (res.success) {
        setReportSuccess(true);
        setTimeout(() => {
          setShowReportModal(false);
          setReportSuccess(false);
          if (onPostUpdated) onPostUpdated();
        }, 1200);
      }
    } catch (err) {
      console.error('Report error:', err);
    }
  };

  return (
    <article className="glass-panel" style={{ padding: '1.4rem', marginBottom: '1.4rem' }}>
      {/* Header Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
          <img
            src={post.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
            alt={post.display_name}
            style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.98rem' }}>{post.display_name}</span>
              <span style={{ color: 'var(--text-dim)', fontSize: '0.82rem' }}>@{post.username}</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {post.human_trust_score || 99}% Trust Rating
            </div>
          </div>
        </div>

        {/* Human Verification Badge */}
        {post.is_human_verified ? (
          <div className="badge-human" title="Scanned: Zero AI patterns detected">
            <ShieldCheck size={14} /> 100% Human Verified
          </div>
        ) : (
          <div className="badge-amber" title="Under Community AI Inspection">
            <ShieldAlert size={14} /> Under AI Review ({post.ai_probability}% risk)
          </div>
        )}
      </div>

      {/* Post Text Content */}
      <p style={{ fontSize: '0.96rem', lineHeight: '1.6', color: '#e2e8f0', marginBottom: '1rem', whiteSpace: 'pre-line' }}>
        {post.content}
      </p>

      {/* Optional Photo Attachment */}
      {post.image_url && (
        <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '1rem', maxHeight: '380px' }}>
          <img src={post.image_url} alt="Post attachment" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}

      {/* Actions Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.8rem', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', gap: '1.2rem' }}>
          <button
            onClick={handleLike}
            style={{ background: 'none', border: 'none', color: liked ? '#f43f5e' : 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem', fontWeight: 600 }}
          >
            <Heart size={18} fill={liked ? '#f43f5e' : 'none'} />
            {likesCount}
          </button>

          <button
            onClick={handleToggleComments}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.88rem', fontWeight: 600 }}
          >
            <MessageSquare size={18} />
            {post.comments_count || comments.length}
          </button>
        </div>

        <button
          onClick={() => setShowReportModal(true)}
          style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem' }}
          title="Report post if suspected to be generated by AI"
        >
          <Flag size={14} /> Report AI
        </button>
      </div>

      {/* Comments Drawer */}
      {showComments && (
        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed var(--border-color)' }}>
          {isLoadingComments ? (
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Loading comments...</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1rem' }}>
              {comments.length === 0 ? (
                <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>No comments yet. Be the first human to respond!</p>
              ) : (
                comments.map((c) => (
                  <div key={c.id} style={{ display: 'flex', gap: '0.6rem', background: 'rgba(11,15,25,0.4)', padding: '0.6rem 0.8rem', borderRadius: 'var(--radius-sm)' }}>
                    <img src={c.avatar} alt={c.display_name} style={{ width: '28px', height: '28px', borderRadius: '50%' }} />
                    <div>
                      <span style={{ fontWeight: 700, fontSize: '0.82rem', color: '#fff' }}>{c.display_name}</span>
                      <p style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>{c.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              placeholder="Write a human reply..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              style={{ fontSize: '0.85rem', padding: '0.5rem 0.8rem' }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 0.8rem' }}>
              <Send size={14} />
            </button>
          </form>
        </div>
      )}

      {/* Report AI Modal */}
      {showReportModal && (
        <div className="modal-overlay" onClick={() => setShowReportModal(false)}>
          <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.6rem', color: '#fff' }}>Report Suspected AI Content</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Authentic relies on human vigilance. Flagging this post will send it to the Moderator AI Inspection Queue.
            </p>

            {reportSuccess ? (
              <div style={{ background: 'var(--human-emerald-glow)', color: 'var(--human-emerald)', padding: '1rem', borderRadius: 'var(--radius-md)', textAlign: 'center', fontWeight: 600 }}>
                ✓ Report submitted to community moderators!
              </div>
            ) : (
              <form onSubmit={handleReportAi}>
                <textarea
                  rows={3}
                  placeholder="Why do you suspect this content was generated by AI? (e.g. signature phrases, uncanny image details, unnatural syntax)"
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  required
                  style={{ marginBottom: '1rem' }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowReportModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-danger">
                    Submit Flag
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
