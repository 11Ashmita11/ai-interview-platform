import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import Skeleton from '../components/Skeleton';

export default function CodingSetup() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/coding/problems', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProblems(res.data);
      } catch (err) {
        setError('Failed to load problems');
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, [token]);

  const difficultyColor = (d) => {
    if (d === 'easy') return '#10b981';
    if (d === 'medium') return '#f59e0b';
    return '#ef4444';
  };

  return (
    <Layout>
      <h2 style={styles.title}>Coding Round</h2>
      <p style={styles.subtitle}>Pick a problem to solve</p>

      {error && <p style={{ color: '#ef4444' }}>{error}</p>}

      <div style={styles.list}>
        {loading && [1, 2, 3, 4, 5].map(i => (
          <Skeleton key={i} height={72} borderRadius={10} />
        ))}

        {!loading && problems.map(p => (
          <div key={p.id} style={styles.card} onClick={() => navigate(`/coding/${p.id}`)}>
            <div style={styles.cardLeft}>
              <h3 style={styles.cardTitle}>{p.title}</h3>
              <div style={styles.tags}>
                {p.tags?.map(t => <span key={t} style={styles.tag}>{t}</span>)}
              </div>
            </div>
            <span style={{
              ...styles.difficulty,
              color: difficultyColor(p.difficulty),
              border: `1px solid ${difficultyColor(p.difficulty)}`,
            }}>
              {p.difficulty}
            </span>
          </div>
        ))}
      </div>
    </Layout>
  );
}

const styles = {
  title: { fontSize: 22, fontWeight: 700, marginBottom: 4, color: '#e2e8f0' },
  subtitle: { fontSize: 14, color: '#64748b', marginBottom: 24 },
  list: { display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 700 },
  card: {
    backgroundColor: '#1e1e2e',
    border: '1px solid #2e2e3e',
    borderRadius: 10,
    padding: '18px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
  },
  cardLeft: {},
  cardTitle: { margin: 0, fontSize: 15, fontWeight: 600, color: '#e2e8f0' },
  tags: { display: 'flex', gap: 6, marginTop: 8 },
  tag: {
    fontSize: 11,
    color: '#a78bfa',
    backgroundColor: '#a78bfa22',
    padding: '3px 8px',
    borderRadius: 5,
  },
  difficulty: {
    fontSize: 12,
    fontWeight: 600,
    padding: '4px 12px',
    borderRadius: 6,
    textTransform: 'capitalize',
  },
};