import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

export default function Contests() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [contests, setContests] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/contests', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setContests(res.data);
      } catch (err) {
        setError('Failed to load contests');
      }
    };
    fetchContests();
  }, [token]);

  const statusColor = (status) => {
    if (status === 'active') return '#10b981';
    if (status === 'upcoming') return '#f59e0b';
    return '#64748b';
  };

  const statusLabel = (status) => {
    if (status === 'active') return '🟢 Live Now';
    if (status === 'upcoming') return '🟡 Upcoming';
    return '⚫ Ended';
  };

  return (
    <Layout>
      <h2 style={styles.title}>Contests</h2>
      <p style={styles.subtitle}>Compete with others and climb the leaderboard</p>

      {error && <p style={{ color: '#ef4444' }}>{error}</p>}

      <div style={styles.list}>
        {contests.map(c => (
          <div key={c.id} style={styles.card} onClick={() => navigate(`/contests/${c.id}`)}>
            <div style={styles.cardTop}>
              <h3 style={styles.cardTitle}>{c.title}</h3>
              <span style={{ ...styles.statusBadge, color: statusColor(c.status), borderColor: statusColor(c.status) }}>
                {statusLabel(c.status)}
              </span>
            </div>
            <p style={styles.cardDesc}>{c.description}</p>
            <div style={styles.cardMeta}>
              <span>🕐 Starts: {new Date(c.starts_at).toLocaleString()}</span>
              <span>🏁 Ends: {new Date(c.ends_at).toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}

const styles = {
  title: { fontSize: 22, fontWeight: 700, marginBottom: 4, color: '#e2e8f0' },
  subtitle: { fontSize: 14, color: '#64748b', marginBottom: 24 },
  list: { display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 700 },
  card: {
    backgroundColor: '#1e1e2e', border: '1px solid #2e2e3e',
    borderRadius: 10, padding: '20px 24px', cursor: 'pointer',
  },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTitle: { margin: 0, fontSize: 16, fontWeight: 600, color: '#e2e8f0' },
  statusBadge: { fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 6, border: '1px solid' },
  cardDesc: { fontSize: 14, color: '#94a3b8', margin: '0 0 12px' },
  cardMeta: { display: 'flex', gap: 20, fontSize: 12, color: '#64748b' },
};