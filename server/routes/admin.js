const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const verifyToken = require('../middleware/auth');

// Admin-only middleware
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// GET /api/admin/stats
router.get('/stats', verifyToken, isAdmin, async (req, res) => {
  try {
    const users = await pool.query('SELECT COUNT(*) FROM users');
    const sessions = await pool.query('SELECT COUNT(*) FROM interview_sessions');
    const questions = await pool.query('SELECT COUNT(*) FROM questions');
    const problems = await pool.query('SELECT COUNT(*) FROM coding_problems');
    const contests = await pool.query('SELECT COUNT(*) FROM contests');

    res.json({
      totalUsers: parseInt(users.rows[0].count),
      totalSessions: parseInt(sessions.rows[0].count),
      totalQuestions: parseInt(questions.rows[0].count),
      totalProblems: parseInt(problems.rows[0].count),
      totalContests: parseInt(contests.rows[0].count),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/users
router.get('/users', verifyToken, isAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.role, u.target_role, u.created_at,
       COUNT(s.id) as total_sessions
       FROM users u
       LEFT JOIN interview_sessions s ON s.user_id = u.id
       GROUP BY u.id ORDER BY u.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/questions
router.get('/questions', verifyToken, isAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM questions ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/admin/questions
router.post('/questions', verifyToken, isAdmin, async (req, res) => {
  const { topic, difficulty, text, options, correct_index } = req.body;
  if (!topic || !text || !options || correct_index === undefined) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO questions (topic, difficulty, text, options, correct_index) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [topic, difficulty, text, options, correct_index]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/admin/questions/:id
router.delete('/questions/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM questions WHERE id = $1', [req.params.id]);
    res.json({ message: 'Question deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/problems
router.get('/problems', verifyToken, isAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, title, difficulty, tags FROM coding_problems ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/admin/problems/:id
router.delete('/problems/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM coding_problems WHERE id = $1', [req.params.id]);
    res.json({ message: 'Problem deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/admin/contests
router.post('/contests', verifyToken, isAdmin, async (req, res) => {
  const { title, description, starts_at, ends_at } = req.body;
  if (!title || !starts_at || !ends_at) {
    return res.status(400).json({ message: 'title, starts_at, ends_at are required' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO contests (title, description, starts_at, ends_at, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, description, starts_at, ends_at, req.user.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/admin/contests/:id
router.delete('/contests/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM contests WHERE id = $1', [req.params.id]);
    res.json({ message: 'Contest deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;