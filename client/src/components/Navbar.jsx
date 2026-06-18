import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/mcq', label: 'MCQ' },
    { path: '/coding', label: 'Coding' },
    { path: '/ai-interview', label: 'AI Interview' },
    { path: '/contests', label: 'Contests' },
    { path: '/analytics', label: 'Analytics' },
    { path: '/profile', label: 'Profile' },
    ...(user?.role === 'admin' ? [{ path: '/admin', label: '⚙ Admin' }] : []),
  ];

  return (
    <nav style={styles.nav}>
      <div style={styles.brand}>
        <Link to="/dashboard" style={styles.brandLink}>🎯 InterviewAI</Link>
      </div>

      <div style={styles.links}>
        {navLinks.map(link => (
          <Link
            key={link.path}
            to={link.path}
            style={{
              ...styles.link,
              ...(location.pathname === link.path ? styles.activeLink : {})
            }}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div style={styles.right}>
        <span style={styles.userName}>Hi, {user?.name?.split(' ')[0]}</span>
        <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 32px',
    height: 60,
    backgroundColor: '#1e1e2e',
    borderBottom: '1px solid #2e2e3e',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  brand: { flex: 1 },
  brandLink: {
    color: '#a78bfa',
    textDecoration: 'none',
    fontSize: 18,
    fontWeight: 700,
  },
  links: {
    display: 'flex',
    gap: 20,
    flex: 3,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  link: {
    color: '#94a3b8',
    textDecoration: 'none',
    fontSize: 13,
    fontWeight: 500,
    padding: '4px 0',
    borderBottom: '2px solid transparent',
  },
  activeLink: {
    color: '#a78bfa',
    borderBottom: '2px solid #a78bfa',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    flex: 1,
    justifyContent: 'flex-end',
  },
  userName: {
    color: '#94a3b8',
    fontSize: 14,
  },
  logoutBtn: {
    backgroundColor: 'transparent',
    border: '1px solid #ef4444',
    color: '#ef4444',
    padding: '6px 14px',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 13,
  },
};