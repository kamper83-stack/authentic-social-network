import React, { useState, useEffect } from 'react';
import { ShieldCheck, Award, FileCheck, Calendar } from 'lucide-react';
import { fetchUserProfile } from '../utils/api';
import PostCard from './PostCard';

export default function ProfileView() {
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetchUserProfile('u1');
        if (res.success) {
          setProfile(res.user);
          setPosts(res.posts);
        }
      } catch (err) {
        console.error('Fetch profile error:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  if (isLoading) {
    return <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>Loading user profile...</div>;
  }

  if (!profile) return null;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Profile Header Card */}
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '1.8rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '80px', background: 'linear-gradient(90deg, rgba(16,185,129,0.3), rgba(245,158,11,0.2))' }} />

        <div style={{ position: 'relative', display: 'flex', gap: '1.5rem', alignItems: 'flex-end', marginTop: '20px' }}>
          <img
            src={profile.avatar}
            alt={profile.display_name}
            style={{ width: '90px', height: '90px', borderRadius: '50%', border: '4px solid var(--bg-primary)', objectFit: 'cover' }}
          />

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>{profile.display_name}</h2>
              <div className="badge-human">
                <ShieldCheck size={14} /> Verified Human
              </div>
            </div>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>@{profile.username}</p>
          </div>
        </div>

        <p style={{ marginTop: '1.2rem', fontSize: '0.94rem', color: '#cbd5e1' }}>
          {profile.bio}
        </p>

        {/* Human Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '1.5rem', paddingTop: '1.2rem', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ textAlign: 'center', background: 'rgba(11,15,25,0.4)', padding: '0.8rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--human-emerald)' }}>
              {profile.human_trust_score}%
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
              <Award size={12} /> Trust Score
            </div>
          </div>

          <div style={{ textAlign: 'center', background: 'rgba(11,15,25,0.4)', padding: '0.8rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff' }}>
              {profile.verified_posts_count || posts.length}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
              <FileCheck size={12} /> Human Posts
            </div>
          </div>

          <div style={{ textAlign: 'center', background: 'rgba(11,15,25,0.4)', padding: '0.8rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--amber-warm)' }}>
              100%
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
              <Calendar size={12} /> Zero-AI Rating
            </div>
          </div>
        </div>
      </div>

      {/* User's Posts Feed */}
      <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '1rem', fontWeight: 700 }}>
        Published Human Posts
      </h3>
      {posts.length === 0 ? (
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          No posts created yet.
        </div>
      ) : (
        posts.map((post) => <PostCard key={post.id} post={post} />)
      )}
    </div>
  );
}
