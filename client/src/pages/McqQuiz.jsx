import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

const QUESTION_TIME = 30; // seconds per question

export default function McqQuiz() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const { sessionId, questions } = location.state || {};

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [tabWarning, setTabWarning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const startTimeRef = useRef(Date.now());
  const sessionStartRef = useRef(Date.now());

  // Redirect if no quiz data (e.g. page refresh)
  useEffect(() => {
    if (!questions || !sessionId) {
      navigate('/mcq');
    }
  }, []);

  // Timer countdown
  useEffect(() => {
    if (!questions) return;
    if (timeLeft <= 0) {
      handleNext();
      return;
    }
    const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  // Tab switch detection
  useEffect(() => {
    const handleBlur = () => setTabWarning(true);
    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, []);

  if (!questions) return null;

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex) / questions.length) * 100;

  const handleNext = () => {
    const timeSpent = QUESTION_TIME - timeLeft;
    const newAnswer = {
      questionId: currentQuestion.id,
      selectedIndex: selected,
      timeSpent,
    };

    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
      setSelected(null);
      setTimeLeft(QUESTION_TIME);
      setTabWarning(false);
    } else {
      handleSubmit(updatedAnswers);
    }
  };

  const handleSubmit = async (finalAnswers) => {
    setSubmitting(true);
    const totalTime = Math.round((Date.now() - sessionStartRef.current) / 1000);

    try {
      const res = await axios.post(
        'http://localhost:5000/api/mcq/submit',
        { sessionId, answers: finalAnswers, timeTaken: totalTime },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate('/mcq/results', { state: { sessionId } });
    } catch (err) {
      console.error(err);
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      {/* Progress bar */}
      <div style={styles.progressTrack}>
        <div style={{ ...styles.progressFill, width: `${progress}%` }} />
      </div>

      <div style={styles.header}>
        <span style={styles.questionCount}>
          Question {currentIndex + 1} of {questions.length}
        </span>
        <span style={{ ...styles.timer, color: timeLeft <= 10 ? '#ef4444' : '#a78bfa' }}>
          ⏱ {timeLeft}s
        </span>
      </div>

      {tabWarning && (
        <div style={styles.warning}>
          ⚠️ Tab switch detected. Please stay on this page during the quiz.
        </div>
      )}

      <div style={styles.card}>
        <div style={styles.meta}>
          <span style={styles.tag}>{currentQuestion.topic}</span>
          <span style={styles.tag}>{currentQuestion.difficulty}</span>
        </div>

        <h3 style={styles.questionText}>{currentQuestion.text}</h3>

        <div style={styles.options}>
          {currentQuestion.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => setSelected(idx)}
              style={{
                ...styles.optionBtn,
                ...(selected === idx ? styles.optionSelected : {}),
              }}
            >
              <span style={styles.optionLetter}>{String.fromCharCode(65 + idx)}</span>
              {opt}
            </button>
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={selected === null || submitting}
          style={{
            ...styles.nextBtn,
            opacity: selected === null ? 0.5 : 1,
          }}
        >
          {submitting ? 'Submitting...' : currentIndex + 1 === questions.length ? 'Finish Quiz' : 'Next →'}
        </button>
      </div>
    </Layout>
  );
}

const styles = {
  progressTrack: {
    height: 6,
    backgroundColor: '#1e1e2e',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#a78bfa',
    transition: 'width 0.3s ease',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  questionCount: { fontSize: 14, color: '#94a3b8', fontWeight: 500 },
  timer: { fontSize: 18, fontWeight: 700 },
  warning: {
    backgroundColor: '#ef444422',
    border: '1px solid #ef4444',
    color: '#ef4444',
    padding: '10px 16px',
    borderRadius: 8,
    fontSize: 13,
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#1e1e2e',
    border: '1px solid #2e2e3e',
    borderRadius: 12,
    padding: 32,
    maxWidth: 640,
  },
  meta: { display: 'flex', gap: 8, marginBottom: 16 },
  tag: {
    fontSize: 11,
    fontWeight: 600,
    color: '#a78bfa',
    backgroundColor: '#a78bfa22',
    padding: '4px 10px',
    borderRadius: 6,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  questionText: { fontSize: 18, fontWeight: 600, color: '#e2e8f0', marginBottom: 24, lineHeight: 1.5 },
  options: { display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 },
  optionBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '14px 16px',
    borderRadius: 8,
    border: '1px solid #2e2e3e',
    backgroundColor: '#0f0f1a',
    color: '#e2e8f0',
    cursor: 'pointer',
    fontSize: 14,
    textAlign: 'left',
  },
  optionSelected: {
    borderColor: '#a78bfa',
    backgroundColor: '#a78bfa22',
  },
  optionLetter: {
    width: 24,
    height: 24,
    borderRadius: '50%',
    backgroundColor: '#2e2e3e',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    fontWeight: 700,
    flexShrink: 0,
  },
  nextBtn: {
    width: '100%',
    backgroundColor: '#a78bfa',
    color: '#fff',
    border: 'none',
    padding: '12px',
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
  },
};