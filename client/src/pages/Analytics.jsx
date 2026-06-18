import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import Layout from '../components/Layout';
import Skeleton from '../components/Skeleton';
import { useAuth } from '../context/AuthContext';

const typeColors = { MCQ: '#3b82f6', Coding: '#10b981', AI: '#a78bfa' };

export default function Analytics() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/analytics/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(res.data);
      } catch (err) {
        setError('Failed to load analytics');
      }
    };
    fetchAnalytics();
  }, [token]);

  if (error) return <Layout><p style={{ color: '#ef4444' }}>{error}</p></Layout>;
  if (!data) return (
  <Layout>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
      {[1,2,3,4].map(i => <Skeleton key={i} height={100} borderRadius={10} />)}
    </div>
    <Skeleton height={280} borderRadius={12} style={{ marginBottom: 20 }} />
    <Skeleton height={280} borderRadius={12} />
  </Layout>
);

  const isEmpty = data.totalSessions === 0;

  return (
    <Layout>
      <h2 style={styles.title}>Analytics</h2>
      <p style={styles.subtitle}>Track your performance across all rounds</p>

      {/* Stat cards */}
      <div style={styles.statsRow}>
        {[
          { label: 'Total Sessions', value: data.totalSessions, icon: '📊' },
          { label: 'Average Score', value: data.avgScore ? `${data.avgScore}%` : '—', icon: '🎯' },
          { label: 'Best Round', value: data.bestType || '—', icon: '🏅' },
          { label: 'Day Streak', value: data.streak, icon: '🔥' },
        ].map(stat => (
          <div key={stat.label} style={styles.statCard}>
            <span style={styles.statIcon}>{stat.icon}</span>
            <span style={styles.statValue}>{stat.value}</span>
            <span style={styles.statLabel}>{stat.label}</span>
          </div>
        ))}
      </div>

      {isEmpty ? (
        <div style={styles.emptyState}>
          <p style={styles.emptyIcon}>📈</p>
          <p style={styles.emptyTitle}>No sessions yet</p>
          <p style={styles.emptyText}>Complete an MCQ, Coding, or AI Interview round to see your analytics here.</p>
        </div>
      ) : (
        <>
          {/* Score trend chart */}
          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>Score Trend</h3>
            <p style={styles.chartSub}>Your last {data.scoreTrend.length} sessions</p>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data.scoreTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2e2e3e" />
                <XAxis dataKey="session" tick={{ fill: '#64748b', fontSize: 12 }} label={{ value: 'Session', position: 'insideBottom', offset: -2, fill: '#64748b', fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={v => `${v}%`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e1e2e', border: '1px solid #2e2e3e', borderRadius: 8 }}
                  labelStyle={{ color: '#94a3b8' }}
                  formatter={(value, name) => [`${value}%`, 'Score']}
                  labelFormatter={(label, payload) => payload?.[0] ? `${payload[0].payload.type} — ${payload[0].payload.date}` : `Session ${label}`}
                />
                <Line type="monotone" dataKey="score" stroke="#a78bfa" strokeWidth={2.5} dot={{ fill: '#a78bfa', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Topic performance chart */}
          {data.topicPerformance.length > 0 && (
            <div style={styles.chartCard}>
              <h3 style={styles.chartTitle}>Performance by Topic</h3>
              <p style={styles.chartSub}>Average score per topic</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.topicPerformance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#2e2e3e" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={v => `${v}%`} />
                  <YAxis type="category" dataKey="topic" tick={{ fill: '#94a3b8', fontSize: 12 }} width={160} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e1e2e', border: '1px solid #2e2e3e', borderRadius: 8 }}
                    formatter={(value) => [`${value}%`, 'Avg Score']}
                  />
                  <Bar dataKey="avg" fill="#a78bfa" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Session history table */}
          <div style={styles.tableCard}>
            <h3 style={styles.chartTitle}>Recent Sessions</h3>
            <table style={styles.table}>
              <thead>
                <tr>
                  {['Type', 'Topic', 'Score', 'Percentage', 'Time', 'Date'].map(h => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.recentSessions.map(s => (
                  <tr key={s.id} style={styles.tr}>
                    <td style={styles.td}>
                      <span style={{ ...styles.typeBadge, backgroundColor: (typeColors[s.type] || '#64748b') + '22', color: typeColors[s.type] || '#64748b' }}>
                        {s.type}
                      </span>
                    </td>
                    <td style={styles.td}>{s.topic}</td>
                    <td style={styles.td}>{s.score}/{s.total}</td>
                    <td style={styles.td}>
                      <span style={{ color: s.percentage >= 70 ? '#10b981' : s.percentage >= 40 ? '#f59e0b' : '#ef4444', fontWeight: 600 }}>
                        {s.percentage}%
                      </span>
                    </td>
                    <td style={styles.td}>{s.timeTaken ? `${s.timeTaken}s` : '—'}</td>
                    <td style={styles.td}>{s.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Layout>
  );
}

const styles = {
  title: { fontSize: 22, fontWeight: 700, marginBottom: 4, color: '#e2e8f0' },
  subtitle: { fontSize: 14, color: '#64748b', marginBottom: 24 },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 },
  statCard: {
    backgroundColor: '#1e1e2e', border: '1px solid #2e2e3e', borderRadius: 10,
    padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
  },
  statIcon: { fontSize: 22 },
  statValue: { fontSize: 26, fontWeight: 800, color: '#a78bfa' },
  statLabel: { fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' },
  emptyState: {
    backgroundColor: '#1e1e2e', border: '1px solid #2e2e3e', borderRadius: 12,
    padding: '60px 32px', textAlign: 'center',
  },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: 600, color: '#e2e8f0', margin: '0 0 8px' },
  emptyText: { fontSize: 14, color: '#64748b', margin: 0 },
  chartCard: {
    backgroundColor: '#1e1e2e', border: '1px solid #2e2e3e', borderRadius: 12,
    padding: '24px 28px', marginBottom: 20,
  },
  chartTitle: { margin: '0 0 4px', fontSize: 16, fontWeight: 600, color: '#e2e8f0' },
  chartSub: { margin: '0 0 20px', fontSize: 13, color: '#64748b' },
  tableCard: {
    backgroundColor: '#1e1e2e', border: '1px solid #2e2e3e', borderRadius: 12,
    padding: '24px 28px', marginBottom: 20, overflowX: 'auto',
  },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: 16 },
  th: {
    textAlign: 'left', fontSize: 11, color: '#64748b', textTransform: 'uppercase',
    letterSpacing: '0.05em', padding: '8px 12px', borderBottom: '1px solid #2e2e3e',
  },
  tr: { borderBottom: '1px solid #1a1a2a' },
  td: { padding: '12px 12px', fontSize: 13, color: '#cbd5e1' },
  typeBadge: { fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 5 },
};