const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const verifyToken = require('../middleware/auth');

// GET /api/contests - list all contests with status
router.get('/', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM contests ORDER BY starts_at DESC'
    );

    const now = new Date();
    const contests = result.rows.map(c => ({
      ...c,
      status: now < new Date(c.starts_at)
        ? 'upcoming'
        : now > new Date(c.ends_at)
        ? 'ended'
        : 'active',
    }));

    res.json(contests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/contests/:id - single contest details
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM contests WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    const contest = result.rows[0];
    const now = new Date();
    contest.status = now < new Date(contest.starts_at)
      ? 'upcoming'
      : now > new Date(contest.ends_at)
      ? 'ended'
      : 'active';

    // Check if current user has entered
    const entryResult = await pool.query(
      'SELECT * FROM contest_entries WHERE contest_id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    contest.userEntry = entryResult.rows[0] || null;

    res.json(contest);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/contests/:id/submit - submit a score for a contest
router.post('/:id/submit', verifyToken, async (req, res) => {
  const { score, timeTaken } = req.body;

  try {
    const contestResult = await pool.query('SELECT * FROM contests WHERE id = $1', [req.params.id]);
    if (contestResult.rows.length === 0) {
      return res.status(404).json({ message: 'Contest not found' });
    }

    const contest = contestResult.rows[0];
    const now = new Date();

    if (now < new Date(contest.starts_at)) {
      return res.status(400).json({ message: 'Contest has not started yet' });
    }
    if (now > new Date(contest.ends_at)) {
      return res.status(400).json({ message: 'Contest has ended' });
    }

    // Upsert — update if already submitted, insert if not
    await pool.query(
      `INSERT INTO contest_entries (contest_id, user_id, score, time_taken)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (contest_id, user_id)
       DO UPDATE SET score = GREATEST(contest_entries.score, $3), time_taken = $4, submitted_at = NOW()`,
      [req.params.id, req.user.id, score, timeTaken || 0]
    );

    res.json({ message: 'Score submitted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/contests/:id/leaderboard - ranked list
router.get('/:id/leaderboard', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         ce.user_id,
         u.name,
         ce.score,
         ce.time_taken,
         ce.submitted_at,
         RANK() OVER (ORDER BY ce.score DESC, ce.time_taken ASC) as rank
       FROM contest_entries ce
       JOIN users u ON ce.user_id = u.id
       WHERE ce.contest_id = $1
       ORDER BY rank`,
      [req.params.id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;