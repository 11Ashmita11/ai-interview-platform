import { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const roles = [
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Data Engineer',
  'DevOps Engineer',
  'Software Engineer',
];

export default function Profile() {
  const { token, updateUser } = useAuth();
  const [form, setForm] = useState({ name: '', target_role: '' });
  const [email, setEmail] = useState('');
  const [joinedAt, setJoinedAt] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/users/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setForm({ name: res.data.name, target_role: res.data.target_role || '' });
        setEmail(res.data.email);
        setJoinedAt(new Date(res.data.created_at).toLocaleDateString());
      } catch (err) {
        setError('Failed to load profile');
      }
    };
    fetchProfile();
  }, [token]);

  const handleSave = async () => {
    setError('');
    try {
      const res = await axios.put('http://localhost:5000/api/users/me', form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      updateUser(res.data);
      toast.success('Profile saved!');
    } catch (err) {
      toast.error('Failed to save profile');
    }
  };

  return (
    <Layout>
      <h2 style={styles.pageTitle}>Your Profile</h2>

      <div style={styles.card}>
        <div style={styles.avatarRow}>
          <div style={styles.avatar}>{form.name?.charAt(0).toUpperCase()}</div>
          <div>
            <p style={styles.emailText}>{email}</p>
            <p style={styles.joinedText}>Joined {joinedAt}</p>
          </div>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Full Name</label>
          <input
            style={styles.input}
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Target Role</label>
          <select
            style={styles.input}
            value={form.target_role}
            onChange={e => setForm({ ...form, target_role: e.target.value })}
          >
            <option value="">Select a role...</option>
            {roles.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        {error && <p style={{ color: '#ef4444', fontSize: 14 }}>{error}</p>}

        <button onClick={handleSave} style={styles.saveBtn}>Save Changes</button>
      </div>
    </Layout>
  );
}

const styles = {
  pageTitle: { fontSize: 22, fontWeight: 700, marginBottom: 24, color: '#e2e8f0' },
  card: {
    backgroundColor: '#1e1e2e',
    border: '1px solid #2e2e3e',
    borderRadius: 12,
    padding: '32px',
    maxWidth: 520,
  },
  avatarRow: { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: '50%',
    backgroundColor: '#a78bfa',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 22,
    fontWeight: 700,
  },
  emailText: { margin: 0, color: '#e2e8f0', fontSize: 15, fontWeight: 500 },
  joinedText: { margin: '4px 0 0', color: '#64748b', fontSize: 13 },
  field: { marginBottom: 20 },
  label: { display: 'block', fontSize: 13, color: '#94a3b8', marginBottom: 6, fontWeight: 500 },
  input: {
    width: '100%',
    padding: '10px 12px',
    backgroundColor: '#0f0f1a',
    border: '1px solid #2e2e3e',
    borderRadius: 8,
    color: '#e2e8f0',
    fontSize: 14,
    boxSizing: 'border-box',
  },
  saveBtn: {
    backgroundColor: '#a78bfa',
    color: '#fff',
    border: 'none',
    padding: '10px 24px',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: 8,
  },
};