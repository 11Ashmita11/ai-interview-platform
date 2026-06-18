import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

export default function ContestDetail() {
  const { id } = useParams();
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [contest, setContest] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [timeLeft, setTimeLeft] = useState('');
  const [error, setError] = useState('');
  const pollRef = useRef(null);

  const fetchContest = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/contests/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setContest(res.data);
    } catch (err) {
      setError('Failed to load contest');
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/contests/${id}/leaderboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLeaderboard(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchContest();
    fetchLeaderboard();

    // Poll leaderboard every 30 seconds
    pollRef.current = setInterval(() => {
      fetchLeaderboard();
    }, 30000);

    return () => clearInterval(pollRef.current);
  }, [id]);

  // Countdown timer
  useEffect(() => {
    if (!contest) return;

    const tick = () => {
      const now = new Date();
      const target = contest.status === 'upcoming'
        ? new Date(contest.starts_at)
        : new Date(contest.ends_at);

      const diff = target - now;
      if (diff <= 0) {
        setTimeLeft(contest.status === 'upcoming' ? 'Starting now!' : 'Contest ended');
        fetchContest();
        return;
      }

      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${h}h ${m}m ${s}s`);
    };

    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [contest]);

  const handleQuickSubmit = async () => {
    // Submit a practice score to test the leaderboard
    const score = Math.floor(Math.random() * 50) + 50;
    const timeTaken = Math.floor(Math.random() * 1800) + 300;
    try {
      await axios.post(
        `http://localhost:5000/api/contests/${id}/submit`,
        { score, timeTaken },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchLeaderboard();
      fetchContest();
    } catch (err) {
      alert(err.response?.data?.message || 'Submit failed');
    }
  };

  if (error) return <Layout><p style={{ color: '#ef4444' }}>{error}</p></Layout>;
  if (!contest) return <Layout><p style={{ color: '#94a3b8' }}>Loading...</p></Layout>;

  const rankColor = (rank) => {
    if (rank == 1) return '#f59e0b';
    if (rank == 2) return '#94a3b8';
    if (rank == 3) return '#cd7f32';
    return '#64748b';
  };

  const rankEmoji = (rank) => {
    if (rank == 1) return '🥇';
    if (rank == 2) return '🥈';
    if (rank == 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <Layout>
      <button onClick={() => navigate('/contests')} style={styles.backBtn}>← All Contests</button>

      {/* Contest header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>{contest.title}</h2>
          <p style={styles.desc}>{contest.description}</p>
        </div>
        <div style={styles.timerBox}>
          <p style={styles.timerLabel}>
            {contest.status === 'upcoming' ? 'Starts in' : contest.status === 'active' ? 'Ends in' : 'Contest'}
          </p>
          <p style={{
            ...styles.timerValue,
            color: contest.status === 'active' ? '#10b981' : contest.status === 'upcoming' ? '#f59e0b' : '#64748b'
          }}>
            {contest.status === 'ended' ? 'Ended' : timeLeft}
          </p>
        </div>
      </div>

      {/* Action area */}
      <div style={styles.actionCard}>
        {contest.status === 'upcoming' && (
          <p style={styles.lockedMsg}>🔒 Contest hasn't started yet. Come back when the timer hits zero!</p>
        )}
        {contest.status === 'ended' && (
          <p style={styles.lockedMsg}>⚫ This contest has ended. Check the final leaderboard below.</p>
        )}
        {contest.status === 'active' && !contest.userEntry && (
          <div>
            <p style={styles.activeMsg}>🟢 Contest is live! Complete MCQ or Coding rounds and your best score will be submitted.</p>
            <div style={styles.actionBtns}>
              <button onClick={() => navigate('/mcq')} style={styles.roundBtn}>📝 Start MCQ Round</button>
              <button onClick={() => navigate('/coding')} style={styles.roundBtn}>💻 Start Coding Round</button>
              <button onClick={handleQuickSubmit} style={styles.testBtn}>🎯 Submit Test Score</button>
            </div>
          </div>
        )}
        {contest.status === 'active' && contest.userEntry && (
          <div>
            <p style={styles.activeMsg}>
              ✅ Your current score: <strong style={{ color: '#a78bfa' }}>{contest.userEntry.score}</strong> — keep practicing to improve it!
            </p>
            <div style={styles.actionBtns}>
              <button onClick={() => navigate('/mcq')} style={styles.roundBtn}>📝 MCQ Round</button>
              <button onClick={() => navigate('/coding')} style={styles.roundBtn}>💻 Coding Round</button>
            </div>
          </div>
        )}
      </div>

      {/* Leaderboard */}
      <div style={styles.leaderboardCard}>
        <div style={styles.lbHeader}>
          <h3 style={styles.lbTitle}>🏆 Leaderboard</h3>
          <span style={styles.lbSub}>Updates every 30 seconds</span>
        </div>

        {leaderboard.length === 0 ? (
          <p style={styles.emptyLb}>No entries yet — be the first on the leaderboard!</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                {['Rank', 'Name', 'Score', 'Time Taken', 'Submitted'].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leaderboard.map(entry => (
                <tr
                  key={entry.user_id}
                  style={{
                    ...styles.tr,
                    backgroundColor: entry.user_id === user?.id ? '#a78bfa11' : 'transparent',
                  }}
                >
                  <td style={{ ...styles.td, color: rankColor(entry.rank), fontWeight: 700, fontSize: 16 }}>
                    {rankEmoji(entry.rank)}
                  </td>
                  <td style={styles.td}>
                    {entry.name}
                    {entry.user_id === user?.id && <span style={styles.youBadge}>you</span>}
                  </td>
                  <td style={{ ...styles.td, color: '#a78bfa', fontWeight: 700 }}>{entry.score}</td>
                  <td style={styles.td}>{entry.time_taken}s</td>
                  <td style={styles.td}>{new Date(entry.submitted_at).toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}

const styles = {
  backBtn: {
    backgroundColor: 'transparent', border: '1px solid #2e2e3e', color: '#94a3b8',
    padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 13, marginBottom: 20,
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    backgroundColor: '#1e1e2e', border: '1px solid #2e2e3e', borderRadius: 12,
    padding: '24px 28px', marginBottom: 20,
  },
  title: { margin: '0 0 8px', fontSize: 22, fontWeight: 700, color: '#e2e8f0' },
  desc: { margin: 0, fontSize: 14, color: '#94a3b8' },
  timerBox: { textAlign: 'right', flexShrink: 0 },
  timerLabel: { margin: '0 0 4px', fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' },
  timerValue: { margin: 0, fontSize: 24, fontWeight: 800 },
  actionCard: {
    backgroundColor: '#1e1e2e', border: '1px solid #2e2e3e', borderRadius: 12,
    padding: '20px 24px', marginBottom: 20,
  },
  lockedMsg: { fontSize: 14, color: '#64748b', margin: 0 },
  activeMsg: { fontSize: 14, color: '#94a3b8', marginBottom: 16 },
  actionBtns: { display: 'flex', gap: 12, flexWrap: 'wrap' },
  roundBtn: {
    backgroundColor: '#a78bfa', color: '#fff', border: 'none',
    padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600,
  },
  testBtn: {
    backgroundColor: 'transparent', color: '#10b981', border: '1px solid #10b981',
    padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600,
  },
  leaderboardCard: {
    backgroundColor: '#1e1e2e', border: '1px solid #2e2e3e', borderRadius: 12, padding: '24px 28px',
  },
  lbHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  lbTitle: { margin: 0, fontSize: 18, fontWeight: 700, color: '#e2e8f0' },
  lbSub: { fontSize: 12, color: '#64748b' },
  emptyLb: { fontSize: 14, color: '#64748b', textAlign: 'center', padding: '20px 0' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    textAlign: 'left', fontSize: 11, color: '#64748b', textTransform: 'uppercase',
    letterSpacing: '0.05em', padding: '8px 12px', borderBottom: '1px solid #2e2e3e',
  },
  tr: { borderBottom: '1px solid #1a1a2a' },
  td: { padding: '14px 12px', fontSize: 14, color: '#cbd5e1' },
  youBadge: {
    fontSize: 10, fontWeight: 700, color: '#a78bfa', backgroundColor: '#a78bfa22',
    padding: '2px 6px', borderRadius: 4, marginLeft: 8,
  },
};