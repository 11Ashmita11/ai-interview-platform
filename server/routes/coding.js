const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const verifyToken = require('../middleware/auth');
const { runCode } = require('../utils/codeRunner');

// GET /api/coding/problems
router.get('/problems', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, title, difficulty, tags, examples FROM coding_problems ORDER BY id'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/coding/problems/:id
router.get('/problems/:id', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, title, description, difficulty, tags, examples FROM coding_problems WHERE id = $1',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Problem not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/coding/run
router.post('/run', verifyToken, async (req, res) => {
  const { problemId, code, language } = req.body;

  if (!['python', 'javascript'].includes(language)) {
    return res.status(400).json({ message: 'Unsupported language. Use python or javascript.' });
  }

  try {
    const problemResult = await pool.query('SELECT examples FROM coding_problems WHERE id = $1', [problemId]);
    if (problemResult.rows.length === 0) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    const examples = problemResult.rows[0].examples;
    const results = [];

    for (const ex of examples) {
      const output = await runCode(code, language, ex.input);
      const expected = (ex.expected_output || '').trim();
      const passed = output.stdout === expected;
      results.push({
        input: ex.input,
        expected,
        actual: output.stdout,
        passed,
        status: output.status,
        stderr: output.stderr,
      });
    }

    res.json({ results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Code execution failed', error: err.message });
  }
});

// POST /api/coding/submit
router.post('/submit', verifyToken, async (req, res) => {
  const { sessionId, problemId, code, language } = req.body;

  if (!['python', 'javascript'].includes(language)) {
    return res.status(400).json({ message: 'Unsupported language. Use python or javascript.' });
  }

  try {
    const problemResult = await pool.query('SELECT test_cases FROM coding_problems WHERE id = $1', [problemId]);
    if (problemResult.rows.length === 0) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    const testCases = problemResult.rows[0].test_cases;
    let passedCount = 0;
    const results = [];

    for (const tc of testCases) {
      const output = await runCode(code, language, tc.input);
      const passed = output.stdout === tc.expected_output.trim();
      if (passed) passedCount++;
      results.push({
        passed,
        status: output.status,
        stderr: output.stderr,
      });
    }

    const status = passedCount === testCases.length ? 'Accepted' : 'Wrong Answer';

    await pool.query(
      'INSERT INTO code_submissions (session_id, problem_id, language, code, passed_tests, total_tests, status) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [sessionId || null, problemId, language, code, passedCount, testCases.length, status]
    );

    res.json({
      passedTests: passedCount,
      totalTests: testCases.length,
      status,
      results,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Submission failed', error: err.message });
  }
});

module.exports = router;