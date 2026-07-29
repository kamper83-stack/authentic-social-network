const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/moderation/flagged - Get posts pending AI audit
router.get('/flagged', (req, res) => {
  try {
    const flaggedPosts = db.prepare(`
      SELECT posts.*, users.username, users.display_name, users.avatar, users.human_trust_score,
             (SELECT COUNT(*) FROM ai_reports WHERE post_id = posts.id) as report_count
      FROM posts
      JOIN users ON posts.user_id = users.id
      WHERE posts.status = 'flagged' OR posts.ai_probability >= 25
      ORDER BY report_count DESC, posts.created_at DESC
    `).all();

    const reports = db.prepare(`
      SELECT ai_reports.*, users.username as reporter_username
      FROM ai_reports
      JOIN users ON ai_reports.reported_by_user_id = users.id
      ORDER BY ai_reports.created_at DESC
    `).all();

    res.json({ success: true, flaggedPosts, reports });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/moderation/resolve - Resolve flagged post report
router.post('/resolve', (req, res) => {
  const { postId, decision } = req.body; // decision: 'approve_human' or 'remove_ai'

  if (!postId || !['approve_human', 'remove_ai'].includes(decision)) {
    return res.status(400).json({ success: false, error: 'Invalid moderation parameters' });
  }

  try {
    const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(postId);
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    if (decision === 'approve_human') {
      db.prepare(`
        UPDATE posts
        SET status = 'published', is_human_verified = 1, ai_probability = 5
        WHERE id = ?
      `).run(postId);

      db.prepare("UPDATE ai_reports SET status = 'dismissed' WHERE post_id = ?").run(postId);

      res.json({ success: true, message: 'Post approved as 100% Human Verified.' });
    } else {
      db.prepare("UPDATE posts SET status = 'removed' WHERE id = ?").run(postId);
      db.prepare("UPDATE ai_reports SET status = 'removed_as_ai' WHERE post_id = ?").run(postId);

      // Penalize creator's human trust score
      db.prepare(`
        UPDATE users
        SET human_trust_score = MAX(0, human_trust_score - 15)
        WHERE id = ?
      `).run(post.user_id);

      res.json({ success: true, message: 'Post removed for violating No-AI policy. User trust score penalized.' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
