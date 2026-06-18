const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const verifyToken = require('../middleware/auth');

// GET /api/analytics/me
router.get('/me', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // All sessions ordered by date
    const sessionsResult = await pool.query(
      `SELECT id, type, topic, score, total, time_taken, completed_at
       FROM interview_sessions
       WHERE user_id = $1
       ORDER BY completed_at DESC`,
      [userId]
    );
    const sessions = sessionsResult.rows;

    if (sessions.length === 0) {
      return res.json({
        totalSessions: 0,
        avgScore: 0,
        bestType: null,
        streak: 0,
        recentSessions: [],
        topicPerformance: [],
        scoreTrend: [],
      });
    }

    // Total sessions
    const totalSessions = sessions.length;

    // Average score percentage across all sessions
    const avgScore = Math.round(
      sessions.reduce((sum, s) => sum + (s.total > 0 ? (s.score / s.total) * 100 : 0), 0) / sessions.length
    );

    // Best round type
    const typeScores = {};
    const typeCounts = {};
    for (const s of sessions) {
      if (!typeScores[s.type]) { typeScores[s.type] = 0; typeCounts[s.type] = 0; }
      typeScores[s.type] += s.total > 0 ? (s.score / s.total) * 100 : 0;
      typeCounts[s.type]++;
    }
    let bestType = null, bestAvg = 0;
    for (const type of Object.keys(typeScores)) {
      const avg = typeScores[type] / typeCounts[type];
      if (avg > bestAvg) { bestAvg = avg; bestType = type; }
    }

    // Streak — consecutive days with at least one session
    const uniqueDays = [...new Set(sessions.map(s => new Date(s.completed_at).toDateString()))];
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < uniqueDays.length; i++) {
      const day = new Date(uniqueDays[i]);
      const diff = Math.round((today - day) / (1000 * 60 * 60 * 24));
      if (diff === i) streak++;
      else break;
    }

    // Score trend — last 10 sessions (oldest to newest for chart)
    const scoreTrend = sessions
      .slice(0, 10)
      .reverse()
      .map((s, idx) => ({
        session: idx + 1,
        score: s.total > 0 ? Math.round((s.score / s.total) * 100) : 0,
        type: s.type,
        date: new Date(s.completed_at).toLocaleDateString(),
      }));

    // Topic performance
    const topicMap = {};
    for (const s of sessions) {
      const key = s.topic || s.type;
      if (!topicMap[key]) topicMap[key] = { total: 0, count: 0 };
      topicMap[key].total += s.total > 0 ? (s.score / s.total) * 100 : 0;
      topicMap[key].count++;
    }
    const topicPerformance = Object.entries(topicMap).map(([topic, data]) => ({
      topic,
      avg: Math.round(data.total / data.count),
    }));

    // Recent sessions for history table
    const recentSessions = sessions.slice(0, 10).map(s => ({
      id: s.id,
      type: s.type,
      topic: s.topic || '—',
      score: s.score,
      total: s.total,
      percentage: s.total > 0 ? Math.round((s.score / s.total) * 100) : 0,
      timeTaken: s.time_taken,
      date: new Date(s.completed_at).toLocaleDateString(),
    }));

    res.json({ totalSessions, avgScore, bestType, streak, scoreTrend, topicPerformance, recentSessions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;