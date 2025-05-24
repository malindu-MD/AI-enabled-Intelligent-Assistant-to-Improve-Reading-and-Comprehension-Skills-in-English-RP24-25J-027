// File: App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import TabooVocabularyGame from './pages/TabooVocabularyGame'
import TabooGame from './pages/TabooGame'
import WordAssociationGame from './pages/WordAssociationGame'
import VocabularyDashboard from './pages/VocabularyDashboard'
import GameTypes from './pages/GameTypes'
import GameSelectionDashboard from './pages/GameSelectionDashboard'
import LoginForm from './pages/LoginForm'
import DashboardOne from './pages/DashboardOne'
import VocabularyBot from './pages/VocabularyBot'
import VocabularyQuizGame from './pages/VocabularyQuizGame'
import WordAssociation from './pages/WordAssociation'
import Paragraph from  './pages/Paragraph.jsx'
import VocabularyAnalyzer from './pages/VocabularyAnalyzer'
import { Toaster } from 'react-hot-toast';
import { UserProvider, useUser } from './components/UserContext.jsx'
import UserDetails from './pages/UserDetails'
import MCQAssessment from './components/MCQAssessment.jsx'

function AppRoutes() {
  const { user } = useUser();

  // Redirect to login if not authenticated for protected routes
  const ProtectedRoute = ({ children }) => {
    return user ? children : <Navigate to="/login" />;
  };


  return (
    <Router>

      <Toaster position="top-right" reverseOrder={false} /> {/* ✅ Add Toaster Here */}
      <Routes>
        <Route path="/" element={user ? <Navigate to="/DashboardOne" /> : <Navigate to="/login" />} />
        <Route path="/login" element={user ? <Navigate to="/DashboardOne" /> : <LoginForm />} />
        <Route path="/user-details" element={<UserDetails />} />
        <Route path="/DashboardOne" element={
          <ProtectedRoute>
            <DashboardOne />
          </ProtectedRoute>
        } />
        <Route path="/paragraph" element={
          <ProtectedRoute>
            <Paragraph />
          </ProtectedRoute>
        } />

      <Route path="/paragraph" element={
          <ProtectedRoute>
            < Paragraph />
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <VocabularyDashboard />
          </ProtectedRoute>
        } />
        <Route path="/game-selection" element={
          <ProtectedRoute>
            <GameSelectionDashboard />
          </ProtectedRoute>
        } />
        <Route path="/word-association" element={
          <ProtectedRoute>
            <WordAssociationGame />
          </ProtectedRoute>
        } />
        <Route path="vocabulary-game-quiz1" element={
          <ProtectedRoute>
            <TabooGame />
          </ProtectedRoute>
        } />
        <Route path="/taboo-vocabulary" element={
          <ProtectedRoute>
            <TabooVocabularyGame />
          </ProtectedRoute>
        } />
        <Route path="/mcq" element={
          <ProtectedRoute>
            <MCQAssessment />
          </ProtectedRoute>
        } />

        <Route path="/vocabulary-game-quiz" element={
          <ProtectedRoute>
            <VocabularyQuizGame />
          </ProtectedRoute>
        } />
        <Route path="/wordssociation-two" element={
          <ProtectedRoute>
            <WordAssociation />
          </ProtectedRoute>
        } />
        <Route path="/vocabulary-analyzer" element={
          <ProtectedRoute>
            <VocabularyAnalyzer />
          </ProtectedRoute>
        } />
      </Routes>
      <VocabularyBot />

      
    </Router>
  );
}

function App() {
  return (
    <UserProvider>
      <AppRoutes />
    </UserProvider>
  );
}

export default App