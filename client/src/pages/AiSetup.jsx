import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

const roles = [
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Data Engineer',
  'DevOps Engineer',
  'Software Engineer',
];

const topics = [
  'React and Node.js',
  'Data Structures and Algorithms',
  'System Design',
  'Databases and SQL',
  'Operating Systems',
  'Computer Networks',
  'Object Oriented Programming',
];

const difficulties = ['easy', 'medium', 'hard'];
const counts = [3, 5, 7];

export default function AiSetup() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStart = async () => {
    if (!role || !topic) {
      setError('Please select a role and topic before starting.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(
        'http://localhost:5000/api/ai/generate-questions',
        { role, topic, difficulty, count },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate('/ai-interview/session', {
        state: { sessionId: res.data.sessionId, questions: res.data.questions, role },
      });
    } catch (err) {
      setError('Failed to generate questions. Try again.');
      setLoading(false);
    }
  };

  return (
    <Layout>
      <h2 style={styles.title}>AI Interview</h2>
      <p style={styles.subtitle}>Set up your personalized interview session</p>

      <div style={styles.card}>
        {/* Role */}
        <div style={styles.field}>
          <label style={styles.label}>Target Role</label>
          <div style={styles.optionsGrid}>
            {roles.map(r => (
              <button
                key={r}
                onClick={() => setRole(r)}
                style={{ ...styles.optionBtn, ...(role === r ? styles.optionActive : {}) }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Topic */}
        <div style={styles.field}>
          <label style={styles.label}>Topic</label>
          <div style={styles.optionsGrid}>
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

        {/* Difficulty */}
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

        {/* Count */}
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
          🤖 Gemini AI will generate real interview questions based on your selections and evaluate each of your answers instantly.
        </div>

        {error && <p style={{ color: '#ef4444', fontSize: 14, marginBottom: 12 }}>{error}</p>}

        <button onClick={handleStart} disabled={loading} style={styles.startBtn}>
          {loading ? 'Generating questions...' : 'Start Interview →'}
        </button>
        {loading && <p style={styles.loadingNote}>This may take 5-10 seconds while AI generates your questions.</p>}
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
    maxWidth: 640,
  },
  field: { marginBottom: 24 },
  label: {
    display: 'block', fontSize: 12, color: '#94a3b8', marginBottom: 10,
    fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em',
  },
  optionsGrid: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  optionsRow: { display: 'flex', gap: 10 },
  optionBtn: {
    padding: '8px 16px',
    borderRadius: 8,
    border: '1px solid #2e2e3e',
    backgroundColor: '#0f0f1a',
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: 13,
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
  loadingNote: { fontSize: 12, color: '#64748b', textAlign: 'center', marginTop: 8 },
};