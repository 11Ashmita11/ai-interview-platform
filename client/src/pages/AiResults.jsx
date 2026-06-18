import { useLocation, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

export default function AiResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const { allFeedback, role } = location.state || {};

  if (!allFeedback || allFeedback.length === 0) {
    navigate('/ai-interview');
    return null;
  }

  const avgScore = (allFeedback.reduce((sum, f) => sum + f.evaluation.score, 0) / allFeedback.length).toFixed(1);
  const avgColor = avgScore >= 7 ? '#10b981' : avgScore >= 4 ? '#f59e0b' : '#ef4444';

  const scoreColor = (score) => {
    if (score >= 7) return '#10b981';
    if (score >= 4) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <Layout>
      {/* Summary banner */}
      <div style={styles.banner}>
        <div style={{ ...styles.bigScore, borderColor: avgColor }}>
          <span style={{ color: avgColor, fontSize: 28, fontWeight: 800 }}>{avgScore}</span>
          <span style={{ color: '#64748b', fontSize: 12 }}>/10</span>
        </div>
        <div>
          <h2 style={styles.bannerTitle}>Interview Complete!</h2>
          <p style={styles.bannerSub}>Role: {role}</p>
          <p style={styles.bannerSub}>{allFeedback.length} questions answered</p>
        </div>
      </div>

      {/* Score breakdown */}
      <div style={styles.scoreRow}>
        {allFeedback.map((f, idx) => (
          <div key={idx} style={{ ...styles.scorePill, borderColor: scoreColor(f.evaluation.score) }}>
            <span style={{ fontSize: 11, color: '#64748b' }}>Q{idx + 1}</span>
            <span style={{ color: scoreColor(f.evaluation.score), fontWeight: 700 }}>{f.evaluation.score}/10</span>
          </div>
        ))}
      </div>

      {/* Detailed breakdown */}
      <h3 style={styles.sectionTitle}>Detailed Breakdown</h3>
      <div style={styles.list}>
        {allFeedback.map((f, idx) => (
          <div key={idx} style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.qBadge}>Q{idx + 1}</span>
              <div style={{ ...styles.scoreTag, color: scoreColor(f.evaluation.score), borderColor: scoreColor(f.evaluation.score) }}>
                {f.evaluation.score}/10
              </div>
            </div>

            <p style={styles.questionText}>{f.question}</p>

            <div style={styles.answerBox}>
              <p style={styles.answerLabel}>Your Answer</p>
              <p style={styles.answerText}>{f.answer || '(No answer provided)'}</p>
            </div>

            <div style={styles.feedbackGrid}>
              <div>
                <p style={{ ...styles.feedbackLabel, color: '#94a3b8' }}>Overall Feedback</p>
                <p style={styles.feedbackText}>{f.evaluation.feedback}</p>
              </div>
              <div>
                <p style={{ ...styles.feedbackLabel, color: '#10b981' }}>✓ Strengths</p>
                <p style={styles.feedbackText}>{f.evaluation.strengths}</p>
              </div>
              <div>
                <p style={{ ...styles.feedbackLabel, color: '#f59e0b' }}>↑ Improvements</p>
                <p style={styles.feedbackText}>{f.evaluation.improvements}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.actions}>
        <button onClick={() => navigate('/ai-interview')} style={styles.retryBtn}>Try Another Interview</button>
        <button onClick={() => navigate('/dashboard')} style={styles.dashBtn}>Back to Dashboard</button>
      </div>
    </Layout>
  );
}

const styles = {
  banner: {
    display: 'flex', alignItems: 'center', gap: 24,
    backgroundColor: '#1e1e2e', border: '1px solid #2e2e3e',
    borderRadius: 12, padding: '24px 32px', marginBottom: 24,
  },
  bigScore: {
    width: 80, height: 80, borderRadius: '50%', border: '3px solid',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  bannerTitle: { margin: 0, fontSize: 22, color: '#e2e8f0' },
  bannerSub: { margin: '4px 0 0', fontSize: 14, color: '#64748b' },
  scoreRow: { display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 28 },
  scorePill: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    border: '1px solid', borderRadius: 8, padding: '8px 14px', gap: 2,
  },
  sectionTitle: { fontSize: 13, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 },
  list: { display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 28 },
  card: {
    backgroundColor: '#1e1e2e', border: '1px solid #2e2e3e', borderRadius: 10, padding: 24,
  },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  qBadge: { fontSize: 12, fontWeight: 700, color: '#64748b' },
  scoreTag: { fontSize: 13, fontWeight: 700, border: '1px solid', padding: '3px 10px', borderRadius: 6 },
  questionText: { fontSize: 15, color: '#e2e8f0', lineHeight: 1.6, marginBottom: 14 },
  answerBox: {
    backgroundColor: '#0f0f1a', border: '1px solid #2e2e3e',
    borderRadius: 8, padding: '12px 14px', marginBottom: 16,
  },
  answerLabel: { fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 6px', fontWeight: 600 },
  answerText: { fontSize: 13, color: '#cbd5e1', lineHeight: 1.6, margin: 0 },
  feedbackGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 },
  feedbackLabel: { fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 },
  feedbackText: { fontSize: 13, color: '#94a3b8', lineHeight: 1.6, margin: 0 },
  actions: { display: 'flex', gap: 12 },
  retryBtn: {
    backgroundColor: '#a78bfa', color: '#fff', border: 'none',
    padding: '12px 24px', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer',
  },
  dashBtn: {
    backgroundColor: 'transparent', color: '#94a3b8', border: '1px solid #2e2e3e',
    padding: '12px 24px', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer',
  },
};