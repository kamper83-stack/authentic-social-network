const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'authentic.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize Database Schema
function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      display_name TEXT NOT NULL,
      avatar TEXT NOT NULL,
      bio TEXT,
      human_trust_score INTEGER DEFAULT 100,
      verified_posts_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      content TEXT NOT NULL,
      image_url TEXT,
      ai_probability INTEGER DEFAULT 0,
      text_risk_score INTEGER DEFAULT 0,
      metadata_risk_score INTEGER DEFAULT 0,
      is_human_verified BOOLEAN DEFAULT 1,
      status TEXT DEFAULT 'published', -- published, flagged, removed
      likes_count INTEGER DEFAULT 0,
      comments_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS comments (
      id TEXT PRIMARY KEY,
      post_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS likes (
      post_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      PRIMARY KEY (post_id, user_id),
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS ai_reports (
      id TEXT PRIMARY KEY,
      post_id TEXT NOT NULL,
      reported_by_user_id TEXT NOT NULL,
      reason TEXT NOT NULL,
      status TEXT DEFAULT 'pending', -- pending, dismissed, removed_as_ai
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (reported_by_user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Seed sample human users if empty
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount === 0) {
    const insertUser = db.prepare(`
      INSERT INTO users (id, username, display_name, avatar, bio, human_trust_score, verified_posts_count)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    insertUser.run(
      'u1',
      'maya_art',
      'Maya Lin',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      'Ceramics sculptor & analog photographer. 100% human studio practice.',
      99,
      14
    );

    insertUser.run(
      'u2',
      'david_journal',
      'David K.',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      'Hiking logs, urban sketches, and unedited thoughts. Zero LLMs allowed.',
      98,
      9
    );

    insertUser.run(
      'u3',
      'sarah_words',
      'Sarah Chen',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      'Essays written by coffee-fueled human brains. No prompt engineers.',
      100,
      22
    );

    // Seed initial posts
    const insertPost = db.prepare(`
      INSERT INTO posts (id, user_id, content, image_url, ai_probability, text_risk_score, metadata_risk_score, is_human_verified, status, likes_count, comments_count, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertPost.run(
      'p1',
      'u1',
      'Spent 6 hours shaping this clay vase on the wheel today. My hands are still covered in terracotta dust, but the neck turned out so organic!',
      'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80',
      4,
      3,
      5,
      1,
      'published',
      18,
      4,
      new Date(Date.now() - 3600000 * 2).toISOString()
    );

    insertPost.run(
      'p2',
      'u3',
      'Unpopular opinion: writing by hand in a notebook clarifies thinking in a way no keyboard or AI auto-suggest ever will. The friction of ink on paper is a feature, not a bug.',
      null,
      2,
      2,
      0,
      1,
      'published',
      34,
      7,
      new Date(Date.now() - 3600000 * 5).toISOString()
    );

    insertPost.run(
      'p3',
      'u2',
      'Early morning trail walk in the fog. Caught this sunrise light breaking through the redwood canopy. Shot on my old 35mm Leica film camera.',
      'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
      6,
      4,
      8,
      1,
      'published',
      29,
      3,
      new Date(Date.now() - 3600000 * 12).toISOString()
    );
  }
}

initDb();

module.exports = db;
