const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const verifyToken = require('../middleware/auth');
const { generateQuestions, evaluateAnswer } = require('../utils/gemini');

// POST /api/ai/generate-questions
// Creates a new AI session with generated questions
router.post('/generate-questions', verifyToken, async (req, res) => {
  const { role, topic, difficulty, count = 5 } = req.body;

  if (!role || !topic || !difficulty) {
    return res.status(400).json({ message: 'role, topic, and difficulty are required' });
  }

  try {
    const questions = await generateQuestions(role, topic, difficulty, count);

    const session = await pool.query(
      'INSERT INTO ai_sessions (user_id, role, topic, difficulty, questions) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [req.user.id, role, topic, difficulty, JSON.stringify(questions)]
    );

    res.json({
      sessionId: session.rows[0].id,
      questions,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to generate questions', error: err.message });
  }
});

// POST /api/ai/evaluate-answer
// Evaluates a single answer and appends it to the session
router.post('/evaluate-answer', verifyToken, async (req, res) => {
  const { sessionId, question, answer } = req.body;

  if (!sessionId || !question) {
    return res.status(400).json({ message: 'sessionId and question are required' });
  }

  try {
    const sessionResult = await pool.query('SELECT * FROM ai_sessions WHERE id = $1 AND user_id = $2', [sessionId, req.user.id]);
    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ message: 'Session not found' });
    }

    const session = sessionResult.rows[0];
    const evaluation = await evaluateAnswer(question, answer || '(no answer provided)', session.role);

    const updatedAnswers = [...(session.answers || []), { question, answer }];
    const updatedScores = [...(session.scores || []), evaluation];

    await pool.query(
      'UPDATE ai_sessions SET answers = $1, scores = $2 WHERE id = $3',
      [JSON.stringify(updatedAnswers), JSON.stringify(updatedScores), sessionId]
    );

    res.json({ evaluation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to evaluate answer', error: err.message });
  }
});

// POST /api/ai/finish-session
// Finalizes the session — computes average score
router.post('/finish-session', verifyToken, async (req, res) => {
  const { sessionId } = req.body;

  try {
    const sessionResult = await pool.query('SELECT * FROM ai_sessions WHERE id = $1 AND user_id = $2', [sessionId, req.user.id]);
    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ message: 'Session not found' });
    }

    const session = sessionResult.rows[0];
    const scores = session.scores || [];
    const avgScore = scores.length > 0
      ? (scores.reduce((sum, s) => sum + s.score, 0) / scores.length).toFixed(2)
      : 0;

    await pool.query('UPDATE ai_sessions SET avg_score = $1 WHERE id = $2', [avgScore, sessionId]);

    // Also log into interview_sessions for unified analytics later
    await pool.query(
      'INSERT INTO interview_sessions (user_id, type, topic, score, total) VALUES ($1, $2, $3, $4, $5)',
      [req.user.id, 'AI', session.topic, Math.round(avgScore * scores.length), scores.length * 10]
    );

    res.json({ avgScore: parseFloat(avgScore), scores });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to finish session', error: err.message });
  }
});

// GET /api/ai/results/:sessionId
router.get('/results/:sessionId', verifyToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM ai_sessions WHERE id = $1 AND user_id = $2', [req.params.sessionId, req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Session not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;