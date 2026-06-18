const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const verifyToken = require('../middleware/auth');

// POST /api/mcq/start
// Body: { topic: 'DSA' | 'OS' | 'DBMS' | 'All', difficulty: 'easy' | 'medium' | 'hard' | 'All', count: 10 }
router.post('/start', verifyToken, async (req, res) => {
  const { topic = 'All', difficulty = 'All', count = 10 } = req.body;

  try {
    let query = 'SELECT id, topic, difficulty, text, options FROM questions';
    const params = [];
    const conditions = [];

    if (topic !== 'All') {
      params.push(topic);
      conditions.push(`topic = $${params.length}`);
    }
    if (difficulty !== 'All') {
      params.push(difficulty);
      conditions.push(`difficulty = $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY RANDOM()';
    params.push(count);
    query += ` LIMIT $${params.length}`;

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No questions found for selected filters' });
    }

    // Create a session
    const session = await pool.query(
      `INSERT INTO interview_sessions (user_id, type, topic, total)
       VALUES ($1, 'mcq', $2, $3) RETURNING id`,
      [req.user.id, topic, result.rows.length]
    );

    res.json({
      sessionId: session.rows[0].id,
      questions: result.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/mcq/submit
// Body: { sessionId, timeTaken, answers: [{ questionId, selectedIndex, timeSpent }] }
router.post('/submit', verifyToken, async (req, res) => {
  const { sessionId, answers, timeTaken = 0 } = req.body;

  try {
    // Verify session belongs to this user
    const sessionCheck = await pool.query(
      'SELECT * FROM interview_sessions WHERE id = $1 AND user_id = $2',
      [sessionId, req.user.id]
    );
    if (sessionCheck.rows.length === 0) {
      return res.status(403).json({ message: 'Invalid session' });
    }

    let score = 0;
    const answerResults = [];

    for (const answer of answers) {
      const qResult = await pool.query(
        'SELECT correct_index FROM questions WHERE id = $1',
        [answer.questionId]
      );

      if (qResult.rows.length === 0) continue;

      const isCorrect = qResult.rows[0].correct_index === answer.selectedIndex;
      if (isCorrect) score++;

      await pool.query(
        `INSERT INTO session_answers (session_id, question_id, selected_index, is_correct, time_spent)
         VALUES ($1, $2, $3, $4, $5)`,
        [sessionId, answer.questionId, answer.selectedIndex, isCorrect, answer.timeSpent || 0]
      );

      answerResults.push({
        questionId: answer.questionId,
        selectedIndex: answer.selectedIndex,
        isCorrect,
        correctIndex: qResult.rows[0].correct_index,
      });
    }

    // Update session with final score
    await pool.query(
      `UPDATE interview_sessions SET score = $1, time_taken = $2, completed_at = NOW()
       WHERE id = $3`,
      [score, timeTaken, sessionId]
    );

    res.json({
      sessionId,
      score,
      total: answers.length,
      percentage: Math.round((score / answers.length) * 100),
      answerResults,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/mcq/results/:sessionId
router.get('/results/:sessionId', verifyToken, async (req, res) => {
  const { sessionId } = req.params;

  try {
    const session = await pool.query(
      'SELECT * FROM interview_sessions WHERE id = $1 AND user_id = $2',
      [sessionId, req.user.id]
    );

    if (session.rows.length === 0) {
      return res.status(404).json({ message: 'Session not found' });
    }

    const answers = await pool.query(
      `SELECT sa.*, q.text, q.options, q.correct_index, q.topic, q.difficulty
       FROM session_answers sa
       JOIN questions q ON sa.question_id = q.id
       WHERE sa.session_id = $1`,
      [sessionId]
    );

    res.json({
      session: session.rows[0],
      answers: answers.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;