import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

const rounds = [
  { label: 'MCQ Round', icon: '📝', desc: 'Multiple choice — DSA, OS, DBMS', color: '#3b82f6', path: '/mcq' },
  { label: 'Coding Round', icon: '💻', desc: 'Solve problems in your language', color: '#10b981', path: '/coding' },
  { label: 'AI Interview', icon: '🤖', desc: 'Answer questions, get AI feedback', color: '#a78bfa', path: '/ai-interview' },
  { label: 'Contests', icon: '🏆', desc: 'Compete on the leaderboard', color: '#f59e0b', path: '/contests' },
];

export default function Dashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalSessions: 0, avgScore: 0, streak: 0 });

  useEffect(() => {
  const fetchStats = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/analytics/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats({
        totalSessions: res.data.totalSessions,
        avgScore: res.data.avgScore,
        streak: res.data.streak,
      });
    } catch (err) {
      console.error(err);
    }
  };
  fetchStats();
}, [token]);

  return (
    <Layout>
      {/* Welcome banner */}
      <div style={styles.banner}>
        <div>
          <h1 style={styles.welcomeTitle}>Welcome back, {user?.name} 👋</h1>
          <p style={styles.welcomeSub}>
            {user?.target_role
              ? `Preparing for: ${user.target_role}`
              : 'Set your target role in Profile to get started'}
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div style={styles.statsRow}>
        {[
          { label: 'Total Sessions', value: stats.totalSessions, icon: '📊' },
          { label: 'Average Score', value: stats.avgScore ? `${stats.avgScore}%` : '—', icon: '🎯' },
          { label: 'Day Streak', value: stats.streak, icon: '🔥' },
        ].map(stat => (
          <div key={stat.label} style={styles.statCard}>
            <span style={styles.statIcon}>{stat.icon}</span>
            <span style={styles.statValue}>{stat.value}</span>
            <span style={styles.statLabel}>{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Round cards */}
      <h2 style={styles.sectionTitle}>Start a Round</h2>
      <div style={styles.roundsGrid}>
        {rounds.map(round => (
          <div
            key={round.label}
            style={{ ...styles.roundCard, borderTop: `3px solid ${round.color}` }}
            onClick={() => navigate(round.path)}
          >
            <span style={styles.roundIcon}>{round.icon}</span>
            <h3 style={styles.roundLabel}>{round.label}</h3>
            <p style={styles.roundDesc}>{round.desc}</p>
            <button style={{ ...styles.startBtn, backgroundColor: round.color }}>
              Start →
            </button>
          </div>
        ))}
      </div>
    </Layout>
  );
}

const styles = {
  banner: {
    background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
    borderRadius: 12,
    padding: '28px 32px',
    marginBottom: 28,
    border: '1px solid #3730a3',
  },
  welcomeTitle: { margin: 0, fontSize: 24, fontWeight: 700, color: '#e2e8f0' },
  welcomeSub: { margin: '8px 0 0', color: '#94a3b8', fontSize: 14 },
  statsRow: { display: 'flex', gap: 16, marginBottom: 32 },
  statCard: {
    flex: 1,
    backgroundColor: '#1e1e2e',
    border: '1px solid #2e2e3e',
    borderRadius: 10,
    padding: '20px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
  },
  statIcon: { fontSize: 24 },
  statValue: { fontSize: 28, fontWeight: 700, color: '#a78bfa' },
  statLabel: { fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' },
  sectionTitle: { fontSize: 16, fontWeight: 600, color: '#94a3b8', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' },
  roundsGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 },
  roundCard: {
    backgroundColor: '#1e1e2e',
    border: '1px solid #2e2e3e',
    borderRadius: 10,
    padding: '24px',
    cursor: 'pointer',
    transition: 'transform 0.15s, border-color 0.15s',
  },
  roundIcon: { fontSize: 32 },
  roundLabel: { margin: '12px 0 6px', fontSize: 16, fontWeight: 600, color: '#e2e8f0' },
  roundDesc: { margin: '0 0 16px', fontSize: 13, color: '#64748b' },
  startBtn: {
    border: 'none',
    color: '#fff',
    padding: '8px 16px',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 500,
  },
};