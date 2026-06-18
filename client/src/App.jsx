import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import McqSetup from './pages/McqSetup';
import McqQuiz from './pages/McqQuiz';
import McqResults from './pages/McqResults';
import CodingSetup from './pages/CodingSetup';
import CodingEditor from './pages/CodingEditor';
import AiSetup from './pages/AiSetup';
import AiSession from './pages/AiSession';
import AiResults from './pages/AiResults';
import Analytics from './pages/Analytics';
import Contests from './pages/Contests';
import ContestDetail from './pages/ContestDetails';
import Admin from './pages/Admin';
import { Toaster } from 'react-hot-toast';
import NotFound from './pages/NotFound';
export default function App() {
  return (
    <AuthProvider>
      <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: '#1e1e2e',
          color: '#e2e8f0',
          border: '1px solid #2e2e3e',
          fontSize: '14px',
        },
        success: { iconTheme: { primary: '#10b981', secondary: '#1e1e2e' } },
        error: { iconTheme: { primary: '#ef4444', secondary: '#1e1e2e' } },
      }}
    />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute><Profile /></ProtectedRoute>
          } />
          <Route path="/mcq" element={
            <ProtectedRoute><McqSetup /></ProtectedRoute>
          } />
          <Route path="/coding" element={
            <ProtectedRoute><CodingSetup /></ProtectedRoute>
          } />
          <Route path="/coding/:id" element={
            <ProtectedRoute><CodingEditor /></ProtectedRoute>
          } />
          <Route path="/mcq/quiz" element={
            <ProtectedRoute><McqQuiz /></ProtectedRoute>
          } />
          <Route path="/mcq/results" element={
            <ProtectedRoute><McqResults /></ProtectedRoute>
          } />
          <Route path="/ai-interview" element={
             <ProtectedRoute><AiSetup /></ProtectedRoute>
          } />
          <Route path="/ai-interview/session" element={
             <ProtectedRoute><AiSession /></ProtectedRoute>
          } />
          <Route path="/ai-interview/results" element={
              <ProtectedRoute><AiResults /></ProtectedRoute>
          } />
          <Route path="/analytics" element={
             <ProtectedRoute><Analytics /></ProtectedRoute>
          } />
          <Route path="/contests" element={
             <ProtectedRoute><Contests /></ProtectedRoute>
          } />
          <Route path="/contests/:id" element={
             <ProtectedRoute><ContestDetail /></ProtectedRoute>
          } />
          <Route path="/admin" element={
             <ProtectedRoute><Admin /></ProtectedRoute>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}