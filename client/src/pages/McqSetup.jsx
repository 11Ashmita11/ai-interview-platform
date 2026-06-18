import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

const topics = ['All', 'DSA', 'OS', 'DBMS'];
const difficulties = ['All', 'easy', 'medium', 'hard'];
const counts = [5, 10, 15, 20];

export default function McqSetup() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [topic, setTopic] = useState('All');
  const [difficulty, setDifficulty] = useState('All');
  const [count, setCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStart = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(
        'http://localhost:5000/api/mcq/start',
        { topic, difficulty, count },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate('/mcq/quiz', { state: { sessionId: res.data.sessionId, questions: res.data.questions } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start quiz');
      setLoading(false);
    }
  };

  return (
    <Layout>
      <h2 style={styles.title}>MCQ Round</h2>
      <p style={styles.subtitle}>Configure your quiz before you begin</p>

      <div style={styles.card}>
        <div style={styles.field}>
          <label style={styles.label}>Topic</label>
          <div style={styles.optionsRow}>
            {topics.map(t => (
              <button
                key={t}
                onClick={() => setTopic(t)}
                style={{ ...styles.optionBtn, ...(topic === t ? styles.optionActive : {}) }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Difficulty</label>
          <div style={styles.optionsRow}>
            {difficulties.map(d => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                style={{ ...styles.optionBtn, ...(difficulty === d ? styles.optionActive : {}) }}
              >
                {d.charAt(0).toUpperCase() + d.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Number of Questions</label>
          <div style={styles.optionsRow}>
            {counts.map(c => (
              <button
                key={c}
                onClick={() => setCount(c)}
                style={{ ...styles.optionBtn, ...(count === c ? styles.optionActive : {}) }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div style={styles.infoBox}>
          ⏱️ Each question has a 30-second timer. Switching tabs will be flagged.
        </div>

        {error && <p style={{ color: '#ef4444', fontSize: 14 }}>{error}</p>}

        <button onClick={handleStart} disabled={loading} style={styles.startBtn}>
          {loading ? 'Starting...' : 'Start Quiz →'}
        </button>
      </div>
    </Layout>
  );
}

const styles = {
  title: { fontSize: 22, fontWeight: 700, marginBottom: 4, color: '#e2e8f0' },
  subtitle: { fontSize: 14, color: '#64748b', marginBottom: 24 },
  card: {
    backgroundColor: '#1e1e2e',
    border: '1px solid #2e2e3e',
    borderRadius: 12,
    padding: 32,
    maxWidth: 560,
  },
  field: { marginBottom: 24 },
  label: { display: 'block', fontSize: 13, color: '#94a3b8', marginBottom: 10, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' },
  optionsRow: { display: 'flex', gap: 10, flexWrap: 'wrap' },
  optionBtn: {
    padding: '8px 18px',
    borderRadius: 8,
    border: '1px solid #2e2e3e',
    backgroundColor: '#0f0f1a',
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 500,
  },
  optionActive: {
    borderColor: '#a78bfa',
    backgroundColor: '#a78bfa22',
    color: '#a78bfa',
  },
  infoBox: {
    backgroundColor: '#0f0f1a',
    border: '1px solid #2e2e3e',
    borderRadius: 8,
    padding: '12px 16px',
    fontSize: 13,
    color: '#64748b',
    marginBottom: 20,
  },
  startBtn: {
    width: '100%',
    backgroundColor: '#a78bfa',
    color: '#fff',
    border: 'none',
    padding: '12px',
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
  },
};