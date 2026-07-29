const express = require('express');
const router = express.Router();
const multer = require('multer');
const db = require('../db');
const { inspectContent } = require('../services/aiDetector');

const upload = multer({ storage: multer.memoryStorage() });

// GET /api/posts - Fetch timeline posts
router.get('/', (req, res) => {
  const { filter = 'all' } = req.query;

  let query = `
    SELECT posts.*, users.username, users.display_name, users.avatar, users.human_trust_score
    FROM posts
    JOIN users ON posts.user_id = users.id
  `;

  if (filter === 'verified') {
    query += ` WHERE posts.is_human_verified = 1 AND posts.status = 'published'`;
  } else if (filter === 'flagged') {
    query += ` WHERE posts.status = 'flagged' OR posts.ai_probability >= 25`;
  } else {
    query += ` WHERE posts.status = 'published'`;
  }

  query += ` ORDER BY posts.created_at DESC`;

  try {
    const posts = db.prepare(query).all();
    res.json({ success: true, posts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/posts/analyze - Live pre-flight draft inspection
router.post('/analyze', upload.single('image'), async (req, res) => {
  try {
    const { content = '' } = req.body;
    const imageBuffer = req.file ? req.file.buffer : null;

    const analysis = await inspectContent({ text: content, imageBuffer });
    res.json({ success: true, analysis });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/posts - Create post with mandatory AI content inspection
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { userId = 'u1', content, imageUrl: rawImageUrl } = req.body;
    const imageBuffer = req.file ? req.file.buffer : null;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Post content cannot be empty' });
    }

    // Run AI content inspection
    const analysis = await inspectContent({ text: content, imageBuffer });

    // Reject post if AI probability is extraordinarily high (>80%)
    if (analysis.aiProbability > 80) {
      return res.status(422).json({
        success: false,
        error: 'Post blocked: High AI-generated content probability detected. Only 100% human-created content is allowed on Authentic.',
        analysis
      });
    }

    const postId = 'p_' + Date.now();
    const status = analysis.aiProbability >= 25 ? 'flagged' : 'published';
    const isHumanVerified = analysis.isHumanVerified ? 1 : 0;
    const finalImageUrl = rawImageUrl || (req.file ? `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}` : null);

    const stmt = db.prepare(`
      INSERT INTO posts (id, user_id, content, image_url, ai_probability, text_risk_score, metadata_risk_score, is_human_verified, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      postId,
      userId,
      content,
      finalImageUrl,
      analysis.aiProbability,
      analysis.textRiskScore,
      analysis.metadataRiskScore,
      isHumanVerified,
      status
    );

    // Update user's verified post count if published as human verified
    if (isHumanVerified) {
      db.prepare('UPDATE users SET verified_posts_count = verified_posts_count + 1 WHERE id = ?').run(userId);
    }

    const createdPost = db.prepare(`
      SELECT posts.*, users.username, users.display_name, users.avatar, users.human_trust_score
      FROM posts
      JOIN users ON posts.user_id = users.id
      WHERE posts.id = ?
    `).get(postId);

    res.json({ success: true, post: createdPost, analysis });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/posts/:id/like - Toggle like
router.post('/:id/like', (req, res) => {
  const { userId = 'u1' } = req.body;
  const postId = req.params.id;

  try {
    const existing = db.prepare('SELECT * FROM likes WHERE post_id = ? AND user_id = ?').get(postId, userId);

    if (existing) {
      db.prepare('DELETE FROM likes WHERE post_id = ? AND user_id = ?').run(postId, userId);
      db.prepare('UPDATE posts SET likes_count = MAX(0, likes_count - 1) WHERE id = ?').run(postId);
      res.json({ success: true, liked: false });
    } else {
      db.prepare('INSERT INTO likes (post_id, user_id) VALUES (?, ?)').run(postId, userId);
      db.prepare('UPDATE posts SET likes_count = likes_count + 1 WHERE id = ?').run(postId);
      res.json({ success: true, liked: true });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/posts/:id/comments - Get comments for post
router.get('/:id/comments', (req, res) => {
  try {
    const comments = db.prepare(`
      SELECT comments.*, users.username, users.display_name, users.avatar
      FROM comments
      JOIN users ON comments.user_id = users.id
      WHERE comments.post_id = ?
      ORDER BY comments.created_at ASC
    `).all(req.params.id);

    res.json({ success: true, comments });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/posts/:id/comments - Add comment
router.post('/:id/comments', (req, res) => {
  const { userId = 'u1', content } = req.body;
  const postId = req.params.id;

  if (!content || !content.trim()) {
    return res.status(400).json({ success: false, error: 'Comment cannot be empty' });
  }

  try {
    const commentId = 'c_' + Date.now();
    db.prepare('INSERT INTO comments (id, post_id, user_id, content) VALUES (?, ?, ?, ?)').run(
      commentId,
      postId,
      userId,
      content
    );
    db.prepare('UPDATE posts SET comments_count = comments_count + 1 WHERE id = ?').run(postId);

    const newComment = db.prepare(`
      SELECT comments.*, users.username, users.display_name, users.avatar
      FROM comments
      JOIN users ON comments.user_id = users.id
      WHERE comments.id = ?
    `).get(commentId);

    res.json({ success: true, comment: newComment });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/posts/:id/report-ai - Community report for suspected AI content
router.post('/:id/report-ai', (req, res) => {
  const { userId = 'u1', reason } = req.body;
  const postId = req.params.id;

  if (!reason || !reason.trim()) {
    return res.status(400).json({ success: false, error: 'Report reason is required' });
  }

  try {
    const reportId = 'r_' + Date.now();
    db.prepare('INSERT INTO ai_reports (id, post_id, reported_by_user_id, reason) VALUES (?, ?, ?, ?)').run(
      reportId,
      postId,
      userId,
      reason
    );

    // Update post status to flagged
    db.prepare("UPDATE posts SET status = 'flagged' WHERE id = ?").run(postId);

    res.json({ success: true, message: 'Post reported to moderators for AI inspection.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
