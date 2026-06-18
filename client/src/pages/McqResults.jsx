import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

export default function McqResults() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { sessionId } = location.state || {};

  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!sessionId) {
      navigate('/mcq');
      return;
    }
    const fetchResults = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/mcq/results/${sessionId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(res.data);
      } catch (err) {
        setError('Failed to load results');
      }
    };
    fetchResults();
  }, [sessionId]);

  if (error) return <Layout><p style={{ color: '#ef4444' }}>{error}</p></Layout>;
  if (!data) return <Layout><p style={{ color: '#94a3b8' }}>Loading results...</p></Layout>;

  const { session, percentage, answers } = data;
  const scoreColor = percentage >= 70 ? '#10b981' : percentage >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <Layout>
      {/* Score summary */}
      <div style={styles.summaryCard}>
        <div style={{ ...styles.scoreCircle, border: `4px solid ${scoreColor}` }}>
          <span style={{ ...styles.scorePercent, color: scoreColor }}>{percentage}%</span>
        </div>
        <div style={styles.summaryDetails}>
          <h2 style={styles.summaryTitle}>Quiz Complete!</h2>
          <p style={styles.summaryText}>
            You scored <strong>{session.score}</strong> out of <strong>{session.total}</strong>
          </p>
          <p style={styles.summaryMeta}>
            Topic: {session.topic} • Time taken: {session.time_taken}s
          </p>
        </div>
      </div>

      {/* Question breakdown */}
      <h3 style={styles.breakdownTitle}>Question Breakdown</h3>
      <div style={styles.breakdownList}>
        {answers.map((a, idx) => (
          <div key={a.id} style={styles.questionCard}>
            <div style={styles.questionHeader}>
              <span style={styles.qNumber}>Q{idx + 1}</span>
              <span style={{ ...styles.resultBadge, ...(a.is_correct ? styles.correctBadge : styles.wrongBadge) }}>
                {a.is_correct ? '✓ Correct' : '✗ Incorrect'}
              </span>
            </div>
            <p style={styles.qText}>{a.text}</p>
            <div style={styles.optionsList}>
              {a.options.map((opt, oIdx) => {
                let optStyle = { ...styles.optionDisplay };
                if (oIdx === a.correct_index) optStyle = { ...optStyle, ...styles.correctOption };
                else if (oIdx === a.selected_index) optStyle = { ...optStyle, ...styles.wrongOption };
                return (
                  <div key={oIdx} style={optStyle}>
                    {String.fromCharCode(65 + oIdx)}. {opt}
                    {oIdx === a.correct_index && ' ✓'}
                    {oIdx === a.selected_index && oIdx !== a.correct_index && ' (your answer)'}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div style={styles.actions}>
        <button onClick={() => navigate('/mcq')} style={styles.retryBtn}>Try Another Quiz</button>
        <button onClick={() => navigate('/dashboard')} style={styles.dashBtn}>Back to Dashboard</button>
      </div>
    </Layout>
  );
}

const styles = {
  summaryCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 28,
    backgroundColor: '#1e1e2e',
    border: '1px solid #2e2e3e',
    borderRadius: 12,
    padding: 32,
    marginBottom: 32,
  },
  scoreCircle: {
    width: 100,
    height: 100,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  scorePercent: { fontSize: 24, fontWeight: 800 },
  summaryDetails: {},
  summaryTitle: { margin: 0, fontSize: 22, color: '#e2e8f0' },
  summaryText: { margin: '8px 0 4px', fontSize: 15, color: '#94a3b8' },
  summaryMeta: { margin: 0, fontSize: 13, color: '#64748b' },
  breakdownTitle: {
    fontSize: 16, fontWeight: 600, color: '#94a3b8',
    marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em',
  },
  breakdownList: { display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 28 },
  questionCard: {
    backgroundColor: '#1e1e2e',
    border: '1px solid #2e2e3e',
    borderRadius: 10,
    padding: 20,
  },
  questionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  qNumber: { fontSize: 13, fontWeight: 700, color: '#64748b' },
  resultBadge: { fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 6 },
  correctBadge: { backgroundColor: '#10b98122', color: '#10b981' },
  wrongBadge: { backgroundColor: '#ef444422', color: '#ef4444' },
  qText: { fontSize: 15, color: '#e2e8f0', marginBottom: 12, lineHeight: 1.5 },
  optionsList: { display: 'flex', flexDirection: 'column', gap: 6 },
  optionDisplay: {
    fontSize: 13,
    color: '#94a3b8',
    padding: '8px 12px',
    borderRadius: 6,
    backgroundColor: '#0f0f1a',
    border: '1px solid #2e2e3e',
  },
  correctOption: { border: '1px solid #10b981', color: '#10b981', backgroundColor: '#10b98115' },
  wrongOption: { border: '1px solid #ef4444', color: '#ef4444', backgroundColor: '#ef444415' },
  actions: { display: 'flex', gap: 12 },
  retryBtn: {
    backgroundColor: '#a78bfa',
    color: '#fff',
    border: 'none',
    padding: '12px 24px',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
  dashBtn: {
    backgroundColor: 'transparent',
    color: '#94a3b8',
    border: '1px solid #2e2e3e',
    padding: '12px 24px',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
};