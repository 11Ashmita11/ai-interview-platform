import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <Layout>
      <div style={styles.container}>
        <h1 style={styles.code}>404</h1>
        <p style={styles.title}>Page not found</p>
        <p style={styles.sub}>The page you're looking for doesn't exist or has been moved.</p>
        <button onClick={() => navigate('/dashboard')} style={styles.btn}>
          Back to Dashboard
        </button>
      </div>
    </Layout>
  );
}

const styles = {
  container: { textAlign: 'center', padding: '80px 20px' },
  code: { fontSize: 80, fontWeight: 800, color: '#a78bfa', margin: 0 },
  title: { fontSize: 24, fontWeight: 600, color: '#e2e8f0', margin: '8px 0' },
  sub: { fontSize: 14, color: '#64748b', marginBottom: 28 },
  btn: {
    backgroundColor: '#a78bfa', color: '#fff', border: 'none',
    padding: '12px 28px', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer',
  },
};