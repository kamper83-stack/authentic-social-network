import React, { useState, useEffect } from 'react';
import { X, Upload, ShieldCheck, ShieldAlert, Sparkles, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { analyzeDraft, createPost } from '../utils/api';

export default function CreatePostModal({ isOpen, onClose, onPostCreated }) {
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Live pre-flight analysis debounced when user types or uploads file
  useEffect(() => {
    if (!content.trim() && !selectedFile) {
      setAnalysis(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsAnalyzing(true);
      try {
        const res = await analyzeDraft(content, selectedFile);
        if (res.success) {
          setAnalysis(res.analysis);
        }
      } catch (err) {
        console.error('Draft analysis error:', err);
      } finally {
        setIsAnalyzing(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [content, selectedFile]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const loadPreset = (type) => {
    if (type === 'human') {
      setContent("Spent the morning in my studio throwing ceramic bowls. My apron is clay-covered, but the glaze on this piece turned out perfectly organic!");
      setSelectedFile(null);
      setImagePreview("https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80");
    } else {
      setContent("As an AI language model, it is important to remember that this image serves as a testament to unlocking the potential in an ever-evolving digital landscape. In conclusion, delving deeper reveals a tapestry of innovation.");
      setSelectedFile(null);
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await createPost(content, selectedFile, imagePreview);
      if (res.success) {
        setContent('');
        setSelectedFile(null);
        setImagePreview(null);
        onPostCreated(res.post);
        onClose();
      } else {
        setErrorMsg(res.error || 'Failed to publish post');
      }
    } catch (err) {
      setErrorMsg('Server connection failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff' }}>Create Human Post</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Real-time zero-AI verification scanner active</p>
          </div>
          <button className="btn btn-secondary" onClick={onClose} style={{ padding: '0.4rem', borderRadius: '50%' }}>
            <X size={18} />
          </button>
        </div>

        {/* Preset Helpers */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <button className="btn btn-secondary" onClick={() => loadPreset('human')} style={{ fontSize: '0.78rem', padding: '0.3rem 0.6rem' }}>
            ✨ Load Human Sample
          </button>
          <button className="btn btn-secondary" onClick={() => loadPreset('ai')} style={{ fontSize: '0.78rem', padding: '0.3rem 0.6rem' }}>
            🤖 Test AI Sample Phrase
          </button>
        </div>

        {errorMsg && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--ruby-risk)', padding: '0.8rem', borderRadius: 'var(--radius-md)', color: '#fca5a5', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <AlertCircle size={16} /> {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Post Textarea */}
          <div style={{ marginBottom: '1rem' }}>
            <textarea
              rows={4}
              placeholder="Share your authentic thoughts, photos, or work... (Strictly NO AI-generated text or art allowed)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>

          {/* Media Upload / Preview */}
          <div style={{ marginBottom: '1.2rem' }}>
            {imagePreview ? (
              <div style={{ position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden', maxHeight: '180px' }}>
                <img src={imagePreview} alt="Upload preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button
                  type="button"
                  onClick={() => { setSelectedFile(null); setImagePreview(null); }}
                  style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.7)', color: '#fff', border: 'none', borderRadius: '50%', padding: '4px', cursor: 'pointer' }}
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.7rem 1rem', background: 'rgba(255,255,255,0.03)', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <ImageIcon size={18} color="var(--human-emerald)" />
                <span>Attach authentic photo (scans EXIF camera metadata)</span>
                <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
              </label>
            )}
          </div>

          {/* Live AI Risk Inspector Widget */}
          {analysis && (
            <div style={{ background: 'rgba(11, 15, 25, 0.7)', border: `1px solid ${analysis.aiProbability > 50 ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`, borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600 }}>
                  {analysis.aiProbability < 25 ? (
                    <ShieldCheck size={16} color="var(--human-emerald)" />
                  ) : (
                    <ShieldAlert size={16} color={analysis.aiProbability >= 60 ? 'var(--ruby-risk)' : 'var(--amber-warm)'} />
                  )}
                  <span>{analysis.statusLabel}</span>
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: analysis.aiProbability > 50 ? 'var(--ruby-risk)' : 'var(--human-emerald)' }}>
                  {analysis.aiProbability}% AI Risk Score
                </div>
              </div>

              {/* Progress Bar */}
              <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden', marginBottom: '0.6rem' }}>
                <div style={{ width: `${analysis.aiProbability}%`, height: '100%', background: analysis.aiProbability > 50 ? 'var(--ruby-risk)' : 'var(--human-emerald)', transition: 'width 0.3s' }} />
              </div>

              {/* Flags list */}
              {analysis.flags.length > 0 ? (
                <ul style={{ paddingLeft: '1.2rem', fontSize: '0.78rem', color: '#fca5a5' }}>
                  {analysis.flags.map((flag, idx) => (
                    <li key={idx}>{flag}</li>
                  ))}
                </ul>
              ) : (
                <p style={{ fontSize: '0.78rem', color: 'var(--human-emerald)' }}>
                  ✓ Natural human sentence structure & clean metadata verified.
                </p>
              )}
            </div>
          )}

          {/* Submit Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || (analysis && analysis.aiProbability > 80)}
              style={{ opacity: (analysis && analysis.aiProbability > 80) ? 0.5 : 1 }}
            >
              {isSubmitting ? 'Verifying & Posting...' : 'Publish Human Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
