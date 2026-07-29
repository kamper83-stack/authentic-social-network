const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/users/me - Get current logged-in user profile
router.get('/me', (req, res) => {
  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get('u1');
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/users/:id - Get profile details & posts
router.get('/:id', (req, res) => {
  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const userPosts = db.prepare(`
      SELECT posts.*, users.username, users.display_name, users.avatar, users.human_trust_score
      FROM posts
      JOIN users ON posts.user_id = users.id
      WHERE posts.user_id = ? AND posts.status = 'published'
      ORDER BY posts.created_at DESC
    `).all(req.params.id);

    res.json({ success: true, user, posts: userPosts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
