import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Editor from '@monaco-editor/react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

const DEFAULT_CODE = {
  python: '# Write your solution here\n\n',
  javascript: '// Write your solution here\n\n',
};

const LANGUAGES = [
  { value: 'python', label: 'Python', monaco: 'python' },
  { value: 'javascript', label: 'JavaScript', monaco: 'javascript' },
];

export default function CodingEditor() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [problem, setProblem] = useState(null);
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState(DEFAULT_CODE.python);
  const [output, setOutput] = useState(null);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/coding/problems/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProblem(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProblem();
  }, [id, token]);

  // Timer
  useEffect(() => {
    const t = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setCode(DEFAULT_CODE[lang]);
  };

  const handleRun = async () => {
    setRunning(true);
    setOutput(null);
    try {
      const res = await axios.post(
        'http://localhost:5000/api/coding/run',
        { problemId: id, code, language },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOutput({ type: 'run', data: res.data.results });
    } catch (err) {
      setOutput({ type: 'error', data: err.response?.data?.message || 'Run failed' });
    }
    setRunning(false);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setOutput(null);
    try {
      const res = await axios.post(
        'http://localhost:5000/api/coding/submit',
        { problemId: id, code, language },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOutput({ type: 'submit', data: res.data });
    } catch (err) {
      setOutput({ type: 'error', data: err.response?.data?.message || 'Submit failed' });
    }
    setSubmitting(false);
  };

  if (!problem) return <Layout><p style={{ color: '#94a3b8' }}>Loading problem...</p></Layout>;

  const difficultyColor = problem.difficulty === 'easy' ? '#10b981' : problem.difficulty === 'medium' ? '#f59e0b' : '#ef4444';

  return (
    <Layout>
      <div style={styles.header}>
        <button onClick={() => navigate('/coding')} style={styles.backBtn}>← Problems</button>
        <span style={styles.timer}>⏱ {formatTime(seconds)}</span>
      </div>

      <div style={styles.splitLayout}>
        {/* Left: Problem statement */}
        <div style={styles.leftPanel}>
          <div style={styles.problemHeader}>
            <h2 style={styles.problemTitle}>{problem.title}</h2>
            <span style={{ ...styles.difficulty, color: difficultyColor, borderColor: difficultyColor }}>
              {problem.difficulty}
            </span>
          </div>

          <div style={styles.tags}>
            {problem.tags?.map(t => <span key={t} style={styles.tag}>{t}</span>)}
          </div>

          <p style={styles.description}>{problem.description}</p>

          <h4 style={styles.examplesTitle}>Examples</h4>
          {problem.examples.map((ex, idx) => (
            <div key={idx} style={styles.example}>
              <div><strong>Input:</strong></div>
              <pre style={styles.pre}>{ex.input}</pre>
              <div><strong>Output:</strong></div>
              <pre style={styles.pre}>{ex.expected_output || ex.output}</pre>
              {ex.explanation && <p style={styles.explanation}>{ex.explanation}</p>}
            </div>
          ))}
        </div>

        {/* Right: Editor */}
        <div style={styles.rightPanel}>
          <div style={styles.editorToolbar}>
            <select value={language} onChange={e => handleLanguageChange(e.target.value)} style={styles.langSelect}>
              {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
            <div style={styles.toolbarBtns}>
              <button onClick={handleRun} disabled={running || submitting} style={styles.runBtn}>
                {running ? 'Running...' : '▶ Run'}
              </button>
              <button onClick={handleSubmit} disabled={running || submitting} style={styles.submitBtn}>
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>

          <div style={styles.editorWrapper}>
            <Editor
              height="380px"
              language={LANGUAGES.find(l => l.value === language).monaco}
              value={code}
              onChange={(value) => setCode(value)}
              theme="vs-dark"
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
              }}
            />
          </div>

          {/* Output panel */}
          <div style={styles.outputPanel}>
            <h4 style={styles.outputTitle}>Output</h4>
            {!output && <p style={styles.outputEmpty}>Run your code to see results here</p>}

            {output?.type === 'error' && (
              <p style={{ color: '#ef4444', fontSize: 13 }}>{output.data}</p>
            )}

            {output?.type === 'run' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {output.data.map((r, idx) => (
                  <div key={idx} style={{ ...styles.testCase, borderColor: r.passed ? '#10b981' : '#ef4444' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <strong style={{ fontSize: 13 }}>Test Case {idx + 1}</strong>
                      <span style={{ color: r.passed ? '#10b981' : '#ef4444', fontSize: 12, fontWeight: 600 }}>
                        {r.passed ? '✓ Passed' : '✗ Failed'}
                      </span>
                    </div>
                    <div style={styles.outputRow}><span style={styles.outputLabel}>Input:</span><pre style={styles.outputPre}>{r.input}</pre></div>
                    <div style={styles.outputRow}><span style={styles.outputLabel}>Expected:</span><pre style={styles.outputPre}>{r.expected}</pre></div>
                    <div style={styles.outputRow}><span style={styles.outputLabel}>Got:</span><pre style={styles.outputPre}>{r.actual || '(empty)'}</pre></div>
                    {r.stderr && <div style={styles.outputRow}><span style={styles.outputLabel}>Error:</span><pre style={{ ...styles.outputPre, color: '#ef4444' }}>{r.stderr}</pre></div>}
                  </div>
                ))}
              </div>
            )}

            {output?.type === 'submit' && (
              <div>
                <div style={{
                  padding: '14px 16px',
                  borderRadius: 8,
                  backgroundColor: output.data.status === 'Accepted' ? '#10b98122' : '#ef444422',
                  border: `1px solid ${output.data.status === 'Accepted' ? '#10b981' : '#ef4444'}`,
                  marginBottom: 12,
                }}>
                  <strong style={{ color: output.data.status === 'Accepted' ? '#10b981' : '#ef4444', fontSize: 15 }}>
                    {output.data.status === 'Accepted' ? '✓ Accepted' : '✗ ' + output.data.status}
                  </strong>
                  <p style={{ margin: '6px 0 0', fontSize: 13, color: '#94a3b8' }}>
                    {output.data.passedTests} / {output.data.totalTests} test cases passed
                  </p>
                </div>
                {output.data.status === 'Accepted' && (
                  <button onClick={() => navigate('/coding')} style={styles.nextProblemBtn}>
                    Try Another Problem →
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  backBtn: {
    backgroundColor: 'transparent',
    border: '1px solid #2e2e3e',
    color: '#94a3b8',
    padding: '6px 14px',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 13,
  },
  timer: { fontSize: 16, fontWeight: 700, color: '#a78bfa' },
  splitLayout: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 },
  leftPanel: {
    backgroundColor: '#1e1e2e',
    border: '1px solid #2e2e3e',
    borderRadius: 10,
    padding: 24,
    maxHeight: 'calc(100vh - 140px)',
    overflowY: 'auto',
  },
  problemHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  problemTitle: { margin: 0, fontSize: 20, color: '#e2e8f0' },
  difficulty: {
    fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 6, border: '1px solid', textTransform: 'capitalize',
  },
  tags: { display: 'flex', gap: 6, marginBottom: 16 },
  tag: { fontSize: 11, color: '#a78bfa', backgroundColor: '#a78bfa22', padding: '3px 8px', borderRadius: 5 },
  description: { fontSize: 14, color: '#cbd5e1', lineHeight: 1.7, whiteSpace: 'pre-wrap', marginBottom: 20 },
  examplesTitle: { fontSize: 13, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 },
  example: {
    backgroundColor: '#0f0f1a',
    border: '1px solid #2e2e3e',
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    fontSize: 13,
    color: '#cbd5e1',
  },
  pre: {
    backgroundColor: '#15151f',
    padding: '6px 10px',
    borderRadius: 6,
    fontSize: 12,
    overflowX: 'auto',
    margin: '4px 0 8px',
    color: '#e2e8f0',
  },
  explanation: { fontSize: 12, color: '#64748b', margin: '4px 0 0' },
  rightPanel: { display: 'flex', flexDirection: 'column', gap: 12 },
  editorToolbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  langSelect: {
    backgroundColor: '#1e1e2e',
    border: '1px solid #2e2e3e',
    color: '#e2e8f0',
    padding: '8px 12px',
    borderRadius: 6,
    fontSize: 13,
  },
  toolbarBtns: { display: 'flex', gap: 8 },
  runBtn: {
    backgroundColor: 'transparent',
    border: '1px solid #a78bfa',
    color: '#a78bfa',
    padding: '8px 18px',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
  },
  submitBtn: {
    backgroundColor: '#a78bfa',
    border: 'none',
    color: '#fff',
    padding: '8px 18px',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
  },
  editorWrapper: {
    border: '1px solid #2e2e3e',
    borderRadius: 8,
    overflow: 'hidden',
  },
  outputPanel: {
    backgroundColor: '#1e1e2e',
    border: '1px solid #2e2e3e',
    borderRadius: 10,
    padding: 18,
    minHeight: 140,
    maxHeight: 280,
    overflowY: 'auto',
  },
  outputTitle: { margin: '0 0 10px', fontSize: 13, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' },
  outputEmpty: { fontSize: 13, color: '#64748b' },
  testCase: {
    border: '1px solid',
    borderRadius: 8,
    padding: 12,
  },
  outputRow: { display: 'flex', gap: 8, fontSize: 12, marginBottom: 4, alignItems: 'flex-start' },
  outputLabel: { color: '#64748b', minWidth: 60, flexShrink: 0, marginTop: 4 },
  outputPre: {
    backgroundColor: '#0f0f1a',
    padding: '4px 8px',
    borderRadius: 4,
    margin: 0,
    fontSize: 12,
    color: '#e2e8f0',
    whiteSpace: 'pre-wrap',
    overflowX: 'auto',
    flex: 1,
  },
  nextProblemBtn: {
    backgroundColor: '#a78bfa',
    border: 'none',
    color: '#fff',
    padding: '10px 20px',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
  },
};