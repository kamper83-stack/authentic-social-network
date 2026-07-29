const express = require('express');
const cors = require('cors');
const path = require('path');
const postsRouter = require('./routes/posts');
const usersRouter = require('./routes/users');
const moderationRouter = require('./routes/moderation');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/posts', postsRouter);
app.use('/api/users', usersRouter);
app.use('/api/moderation', moderationRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'Authentic (AI-Free Human Social Network)',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Authentic Server running on http://localhost:${PORT}`);
});
