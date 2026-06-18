import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

export default function AiSession() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { sessionId, questions, role } = location.state || {};

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [allFeedback, setAllFeedback] = useState([]);
  const [evaluating, setEvaluating] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [answered, setAnswered] = useState(false);

  useEffect(() => {
    if (!questions || !sessionId) navigate('/ai-interview');
  }, []);

  if (!questions) return null;

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const progress = ((currentIndex + (answered ? 1 : 0)) / questions.length) * 100;

  const handleEvaluate = async () => {
    setEvaluating(true);
    setFeedback(null);
    try {
      const res = await axios.post(
        'http://localhost:5000/api/ai/evaluate-answer',
        { sessionId, question: currentQuestion.question, answer },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFeedback(res.data.evaluation);
      setAllFeedback(prev => [...prev, { question: currentQuestion.question, answer, evaluation: res.data.evaluation }]);
      setAnswered(true);
    } catch (err) {
      console.error(err);
    }
    setEvaluating(false);
  };

  const handleNext = () => {
    setCurrentIndex(currentIndex + 1);
    setAnswer('');
    setFeedback(null);
    setAnswered(false);
  };

  const handleFinish = async () => {
    setFinishing(true);
    try {
      await axios.post(
        'http://localhost:5000/api/ai/finish-session',
        { sessionId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate('/ai-interview/results', { state: { sessionId, allFeedback, role } });
    } catch (err) {
      console.error(err);
      setFinishing(false);
    }
  };

  const scoreColor = (score) => {
    if (score >= 7) return '#10b981';
    if (score >= 4) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <Layout>
      {/* Progress */}
      <div style={styles.progressTrack}>
        <div style={{ ...styles.progressFill, width: `${progress}%` }} />
      </div>

      <div style={styles.header}>
        <span style={styles.counter}>Question {currentIndex + 1} of {questions.length}</span>
        <span style={styles.roleTag}>🎯 {role}</span>
      </div>

      <div style={styles.layout}>
        {/* Question + Answer */}
        <div style={styles.mainPanel}>
          <div style={styles.questionCard}>
            <div style={styles.qLabel}>Question {currentIndex + 1}</div>
            <p style={styles.questionText}>{currentQuestion.question}</p>

            <textarea
              style={styles.textarea}
              placeholder="Type your answer here. Be as detailed as you can..."
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              disabled={answered}
              rows={7}
            />

            {!answered && (
              <button
                onClick={handleEvaluate}
                disabled={evaluating || !answer.trim()}
                style={{ ...styles.evalBtn, opacity: !answer.trim() ? 0.5 : 1 }}
              >
                {evaluating ? 'AI is evaluating...' : 'Submit Answer →'}
              </button>
            )}
            {evaluating && <p style={styles.evalNote}>Gemini is evaluating your answer, please wait...</p>}
          </div>

          {/* Inline feedback */}
          {feedback && (
            <div style={styles.feedbackCard}>
              <div style={styles.feedbackHeader}>
                <span style={styles.feedbackTitle}>AI Feedback</span>
                <div style={{ ...styles.scoreCircle, borderColor: scoreColor(feedback.score) }}>
                  <span style={{ color: scoreColor(feedback.score), fontSize: 18, fontWeight: 800 }}>
                    {feedback.score}/10
                  </span>
                </div>
              </div>

              <div style={styles.feedbackSection}>
                <p style={styles.feedbackLabel}>📋 Overall Feedback</p>
                <p style={styles.feedbackText}>{feedback.feedback}</p>
              </div>

              <div style={styles.feedbackRow}>
                <div style={styles.feedbackHalf}>
                  <p style={{ ...styles.feedbackLabel, color: '#10b981' }}>✓ Strengths</p>
                  <p style={styles.feedbackText}>{feedback.strengths}</p>
                </div>
                <div style={styles.feedbackHalf}>
                  <p style={{ ...styles.feedbackLabel, color: '#f59e0b' }}>↑ Improvements</p>
                  <p style={styles.feedbackText}>{feedback.improvements}</p>
                </div>
              </div>

              <div style={styles.nextRow}>
                {!isLastQuestion ? (
                  <button onClick={handleNext} style={styles.nextBtn}>Next Question →</button>
                ) : (
                  <button onClick={handleFinish} disabled={finishing} style={styles.finishBtn}>
                    {finishing ? 'Finishing...' : 'Finish Interview →'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Side panel: answered questions */}
        <div style={styles.sidePanel}>
          <p style={styles.sideTitle}>Progress</p>
          {questions.map((q, idx) => {
            const fb = allFeedback[idx];
            return (
              <div key={idx} style={{
                ...styles.sideItem,
                borderColor: idx === currentIndex ? '#a78bfa' : fb ? scoreColor(fb.evaluation.score) : '#2e2e3e',
                backgroundColor: idx === currentIndex ? '#a78bfa11' : '#0f0f1a',
              }}>
                <div style={styles.sideItemTop}>
                  <span style={styles.sideQNum}>Q{idx + 1}</span>
                  {fb && (
                    <span style={{ color: scoreColor(fb.evaluation.score), fontSize: 12, fontWeight: 700 }}>
                      {fb.evaluation.score}/10
                    </span>
                  )}
                  {!fb && idx > currentIndex && <span style={{ color: '#374151', fontSize: 11 }}>Not started</span>}
                  {!fb && idx === currentIndex && <span style={{ color: '#a78bfa', fontSize: 11 }}>Current</span>}
                </div>
                <p style={styles.sideQText}>{q.question.slice(0, 60)}...</p>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}

const styles = {
  progressTrack: { height: 5, backgroundColor: '#1e1e2e', borderRadius: 3, overflow: 'hidden', marginBottom: 20 },
  progressFill: { height: '100%', backgroundColor: '#a78bfa', transition: 'width 0.4s ease' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  counter: { fontSize: 14, color: '#94a3b8', fontWeight: 500 },
  roleTag: { fontSize: 13, color: '#a78bfa', backgroundColor: '#a78bfa22', padding: '4px 12px', borderRadius: 6 },
  layout: { display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20 },
  mainPanel: { display: 'flex', flexDirection: 'column', gap: 16 },
  questionCard: {
    backgroundColor: '#1e1e2e', border: '1px solid #2e2e3e', borderRadius: 12, padding: 28,
  },
  qLabel: { fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12, fontWeight: 600 },
  questionText: { fontSize: 18, color: '#e2e8f0', lineHeight: 1.6, marginBottom: 20 },
  textarea: {
    width: '100%',
    backgroundColor: '#0f0f1a',
    border: '1px solid #2e2e3e',
    borderRadius: 8,
    color: '#e2e8f0',
    fontSize: 14,
    padding: '12px 14px',
    resize: 'vertical',
    fontFamily: 'inherit',
    lineHeight: 1.6,
    boxSizing: 'border-box',
    marginBottom: 16,
  },
  evalBtn: {
    backgroundColor: '#a78bfa', color: '#fff', border: 'none',
    padding: '12px 24px', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer',
  },
  evalNote: { fontSize: 12, color: '#64748b', marginTop: 10 },
  feedbackCard: {
    backgroundColor: '#1e1e2e', border: '1px solid #2e2e3e', borderRadius: 12, padding: 24,
  },
  feedbackHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  feedbackTitle: { fontSize: 16, fontWeight: 700, color: '#e2e8f0' },
  scoreCircle: {
    width: 60, height: 60, borderRadius: '50%', border: '3px solid',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  feedbackSection: { marginBottom: 16 },
  feedbackRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 },
  feedbackHalf: {},
  feedbackLabel: { fontSize: 12, fontWeight: 600, color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' },
  feedbackText: { fontSize: 14, color: '#cbd5e1', lineHeight: 1.6, margin: 0 },
  nextRow: { display: 'flex', justifyContent: 'flex-end' },
  nextBtn: {
    backgroundColor: '#a78bfa', color: '#fff', border: 'none',
    padding: '10px 24px', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer',
  },
  finishBtn: {
    backgroundColor: '#10b981', color: '#fff', border: 'none',
    padding: '10px 24px', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer',
  },
  sidePanel: { display: 'flex', flexDirection: 'column', gap: 10 },
  sideTitle: { fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, margin: 0 },
  sideItem: {
    border: '1px solid', borderRadius: 8, padding: '10px 12px', transition: 'border-color 0.2s',
  },
  sideItemTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  sideQNum: { fontSize: 12, fontWeight: 700, color: '#94a3b8' },
  sideQText: { fontSize: 11, color: '#64748b', margin: 0, lineHeight: 1.4 },
};