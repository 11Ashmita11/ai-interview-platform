import { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const TABS = ['Overview', 'MCQ Questions', 'Coding Problems', 'Contests', 'Users'];

export default function Admin() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('Overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [problems, setProblems] = useState([]);
  const [contests, setContests] = useState([]);
  const [msg, setMsg] = useState('');

  // New question form
  const [qForm, setQForm] = useState({ topic: 'DSA', difficulty: 'medium', text: '', options: ['', '', '', ''], correct_index: 0 });

  // New contest form
  const [cForm, setCForm] = useState({ title: '', description: '', starts_at: '', ends_at: '' });

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    fetchAll();
  }, [user]);

  const api = (path) => axios.get(`http://localhost:5000/api/admin/${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const fetchAll = async () => {
  try {
    const [s, u, q, p, c] = await Promise.all([
      api('stats'),
      api('users'),
      api('questions'),
      api('problems'),
      axios.get('http://localhost:5000/api/contests', { headers: { Authorization: `Bearer ${token}` } }),
    ]);
    setStats(s.data);
    setUsers(u.data);
    setQuestions(q.data);
    setProblems(p.data);
    setContests(c.data);
  } catch (err) {
    console.error(err);
  }
};
  const showMsg = (text) => { setMsg(text); setTimeout(() => setMsg(''), 3000); };

  const deleteItem = async (type, id) => {
    if (!window.confirm(`Delete this ${type}?`)) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/${type}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showMsg(`${type} deleted!`);
      fetchAll();
    } catch (err) {
      showMsg('Delete failed');
    }
  };

  const addQuestion = async () => {
    if (!qForm.text || qForm.options.some(o => !o)) {
      showMsg('Fill all question fields'); return;
    }
    try {
      await axios.post('http://localhost:5000/api/admin/questions', qForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showMsg('Question added!');
      setQForm({ topic: 'DSA', difficulty: 'medium', text: '', options: ['', '', '', ''], correct_index: 0 });
      fetchAll();
    } catch (err) {
      showMsg('Failed to add question');
    }
  };

  const addContest = async () => {
    if (!cForm.title || !cForm.starts_at || !cForm.ends_at) {
      showMsg('Fill all contest fields'); return;
    }
    try {
      await axios.post('http://localhost:5000/api/admin/contests', cForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showMsg('Contest created!');
      setCForm({ title: '', description: '', starts_at: '', ends_at: '' });
      fetchAll();
    } catch (err) {
      showMsg('Failed to create contest');
    }
  };

  return (
    <Layout>
      <h2 style={styles.title}>Admin Panel</h2>
      {msg && <div style={styles.toast}>{msg}</div>}

      {/* Tabs */}
      <div style={styles.tabs}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ ...styles.tab, ...(tab === t ? styles.tabActive : {}) }}>
            {t}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'Overview' && stats && (
        <div style={styles.statsGrid}>
          {[
            { label: 'Total Users', value: stats.totalUsers, icon: '👥' },
            { label: 'Total Sessions', value: stats.totalSessions, icon: '📊' },
            { label: 'MCQ Questions', value: stats.totalQuestions, icon: '📝' },
            { label: 'Coding Problems', value: stats.totalProblems, icon: '💻' },
            { label: 'Contests', value: stats.totalContests, icon: '🏆' },
          ].map(s => (
            <div key={s.label} style={styles.statCard}>
              <span style={styles.statIcon}>{s.icon}</span>
              <span style={styles.statValue}>{s.value}</span>
              <span style={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* MCQ Questions */}
      {tab === 'MCQ Questions' && (
        <div>
          {/* Add question form */}
          <div style={styles.formCard}>
            <h3 style={styles.formTitle}>Add New Question</h3>
            <div style={styles.formRow}>
              <select value={qForm.topic} onChange={e => setQForm({ ...qForm, topic: e.target.value })} style={styles.input}>
                {['DSA', 'OS', 'DBMS'].map(t => <option key={t}>{t}</option>)}
              </select>
              <select value={qForm.difficulty} onChange={e => setQForm({ ...qForm, difficulty: e.target.value })} style={styles.input}>
                {['easy', 'medium', 'hard'].map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <textarea
              placeholder="Question text"
              value={qForm.text}
              onChange={e => setQForm({ ...qForm, text: e.target.value })}
              style={{ ...styles.input, width: '100%', minHeight: 70, resize: 'vertical', boxSizing: 'border-box' }}
            />
            {qForm.options.map((opt, idx) => (
              <div key={idx} style={styles.optionRow}>
                <input
                  placeholder={`Option ${idx + 1}`}
                  value={opt}
                  onChange={e => {
                    const opts = [...qForm.options];
                    opts[idx] = e.target.value;
                    setQForm({ ...qForm, options: opts });
                  }}
                  style={{ ...styles.input, flex: 1 }}
                />
                <button
                  onClick={() => setQForm({ ...qForm, correct_index: idx })}
                  style={{ ...styles.correctBtn, ...(qForm.correct_index === idx ? styles.correctBtnActive : {}) }}
                >
                  {qForm.correct_index === idx ? '✓ Correct' : 'Set Correct'}
                </button>
              </div>
            ))}
            <button onClick={addQuestion} style={styles.addBtn}>Add Question</button>
          </div>

          {/* Questions list */}
          <div style={styles.listCard}>
            <h3 style={styles.formTitle}>All Questions ({questions.length})</h3>
            {questions.map(q => (
              <div key={q.id} style={styles.listItem}>
                <div style={styles.listItemLeft}>
                  <div style={styles.listItemMeta}>
                    <span style={styles.tag}>{q.topic}</span>
                    <span style={styles.tag}>{q.difficulty}</span>
                  </div>
                  <p style={styles.listItemText}>{q.text}</p>
                </div>
                <button onClick={() => deleteItem('questions', q.id)} style={styles.deleteBtn}>Delete</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Coding Problems */}
      {tab === 'Coding Problems' && (
        <div style={styles.listCard}>
          <h3 style={styles.formTitle}>All Coding Problems ({problems.length})</h3>
          {problems.map(p => (
            <div key={p.id} style={styles.listItem}>
              <div style={styles.listItemLeft}>
                <div style={styles.listItemMeta}>
                  <span style={styles.tag}>{p.difficulty}</span>
                  {p.tags?.map(t => <span key={t} style={styles.tag}>{t}</span>)}
                </div>
                <p style={styles.listItemText}>{p.title}</p>
              </div>
              <button onClick={() => deleteItem('problems', p.id)} style={styles.deleteBtn}>Delete</button>
            </div>
          ))}
        </div>
      )}

      {/* Contests */}
      {tab === 'Contests' && (
        <div>
          <div style={styles.formCard}>
            <h3 style={styles.formTitle}>Create New Contest</h3>
            <input placeholder="Title" value={cForm.title} onChange={e => setCForm({ ...cForm, title: e.target.value })} style={{ ...styles.input, width: '100%', boxSizing: 'border-box' }} />
            <textarea placeholder="Description" value={cForm.description} onChange={e => setCForm({ ...cForm, description: e.target.value })} style={{ ...styles.input, width: '100%', minHeight: 60, resize: 'vertical', boxSizing: 'border-box' }} />
            <div style={styles.formRow}>
              <div style={{ flex: 1 }}>
                <label style={styles.label}>Starts At</label>
                <input type="datetime-local" value={cForm.starts_at} onChange={e => setCForm({ ...cForm, starts_at: e.target.value })} style={{ ...styles.input, width: '100%', boxSizing: 'border-box' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={styles.label}>Ends At</label>
                <input type="datetime-local" value={cForm.ends_at} onChange={e => setCForm({ ...cForm, ends_at: e.target.value })} style={{ ...styles.input, width: '100%', boxSizing: 'border-box' }} />
              </div>
            </div>
            <button onClick={addContest} style={styles.addBtn}>Create Contest</button>
          </div>

          <div style={styles.listCard}>
            <h3 style={styles.formTitle}>All Contests ({contests.length})</h3>
            {contests.map && contests.map(c => (
              <div key={c.id} style={styles.listItem}>
                <div style={styles.listItemLeft}>
                  <p style={styles.listItemText}>{c.title}</p>
                  <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>
                    {new Date(c.starts_at).toLocaleString()} → {new Date(c.ends_at).toLocaleString()}
                  </p>
                </div>
                <button onClick={() => deleteItem('contests', c.id)} style={styles.deleteBtn}>Delete</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Users */}
      {tab === 'Users' && (
        <div style={styles.listCard}>
          <h3 style={styles.formTitle}>All Users ({users.length})</h3>
          <table style={styles.table}>
            <thead>
              <tr>
                {['Name', 'Email', 'Role', 'Target Role', 'Sessions', 'Joined'].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={styles.tr}>
                  <td style={styles.td}>{u.name}</td>
                  <td style={styles.td}>{u.email}</td>
                  <td style={styles.td}>
                    <span style={{ color: u.role === 'admin' ? '#a78bfa' : '#64748b', fontWeight: 600 }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={styles.td}>{u.target_role || '—'}</td>
                  <td style={styles.td}>{u.total_sessions}</td>
                  <td style={styles.td}>{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}

const styles = {
  title: { fontSize: 22, fontWeight: 700, marginBottom: 20, color: '#e2e8f0' },
  toast: {
    backgroundColor: '#a78bfa22', border: '1px solid #a78bfa', color: '#a78bfa',
    padding: '10px 16px', borderRadius: 8, marginBottom: 16, fontSize: 14,
  },
  tabs: { display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' },
  tab: {
    padding: '8px 18px', borderRadius: 8, border: '1px solid #2e2e3e',
    backgroundColor: '#0f0f1a', color: '#94a3b8', cursor: 'pointer', fontSize: 13, fontWeight: 500,
  },
  tabActive: { borderColor: '#a78bfa', backgroundColor: '#a78bfa22', color: '#a78bfa' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14 },
  statCard: {
    backgroundColor: '#1e1e2e', border: '1px solid #2e2e3e', borderRadius: 10,
    padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
  },
  statIcon: { fontSize: 22 },
  statValue: { fontSize: 26, fontWeight: 800, color: '#a78bfa' },
  statLabel: { fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' },
  formCard: {
    backgroundColor: '#1e1e2e', border: '1px solid #2e2e3e', borderRadius: 12,
    padding: '24px', marginBottom: 20,
  },
  formTitle: { margin: '0 0 16px', fontSize: 16, fontWeight: 600, color: '#e2e8f0' },
  formRow: { display: 'flex', gap: 12, marginBottom: 12 },
  label: { display: 'block', fontSize: 12, color: '#64748b', marginBottom: 6 },
  input: {
    backgroundColor: '#0f0f1a', border: '1px solid #2e2e3e', borderRadius: 6,
    color: '#e2e8f0', padding: '9px 12px', fontSize: 13, marginBottom: 10,
  },
  optionRow: { display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 },
  correctBtn: {
    padding: '8px 12px', borderRadius: 6, border: '1px solid #2e2e3e',
    backgroundColor: '#0f0f1a', color: '#64748b', cursor: 'pointer', fontSize: 12, whiteSpace: 'nowrap',
  },
  correctBtnActive: { borderColor: '#10b981', color: '#10b981', backgroundColor: '#10b98115' },
  addBtn: {
    backgroundColor: '#a78bfa', color: '#fff', border: 'none',
    padding: '10px 24px', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', marginTop: 4,
  },
  listCard: {
    backgroundColor: '#1e1e2e', border: '1px solid #2e2e3e', borderRadius: 12, padding: '24px',
  },
  listItem: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '12px 0', borderBottom: '1px solid #1a1a2a',
  },
  listItemLeft: { flex: 1, marginRight: 16 },
  listItemMeta: { display: 'flex', gap: 6, marginBottom: 4 },
  listItemText: { margin: 0, fontSize: 14, color: '#cbd5e1' },
  tag: { fontSize: 11, color: '#a78bfa', backgroundColor: '#a78bfa22', padding: '2px 7px', borderRadius: 5 },
  deleteBtn: {
    backgroundColor: 'transparent', border: '1px solid #ef4444', color: '#ef4444',
    padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600, flexShrink: 0,
  },
  table: { width: '100%', borderCollapse: 'collapse', marginTop: 12 },
  th: {
    textAlign: 'left', fontSize: 11, color: '#64748b', textTransform: 'uppercase',
    letterSpacing: '0.05em', padding: '8px 12px', borderBottom: '1px solid #2e2e3e',
  },
  tr: { borderBottom: '1px solid #1a1a2a' },
  td: { padding: '12px 12px', fontSize: 13, color: '#cbd5e1' },
};