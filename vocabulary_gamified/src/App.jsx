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
import MainLayout from './components/MainLayout.jsx'
import EnglishLearningHomepage from './pages/EnglishLearningHomepage.jsx'
import ScrollToTop from './components/ScrollToTop.jsx'
<<<<<<< HEAD
import EnglishPricePlan from './pages/EnglishPricePlan.jsx'
import EnglishLearningAboutPage from './pages/EnglishLearningAboutPage.jsx'

=======
import PronunciationComparison from './pages/PhonemeComparison.jsx' 
import PronounceStartup from './pages/PronouncePageStartup.jsx' // Assuming this is the correct import for PronunciationComparison
>>>>>>> parent of 4228dae (Merge branch 'main' into AS-01)

function AppRoutes() {
  const { user } = useUser();

  // Redirect to login if not authenticated for protected routes
  const ProtectedRoute = ({ children }) => {
    return user ? children : <Navigate to="/login" />;
  };


  return (
    <Router>
      <ScrollToTop/>
      <Toaster position="top-right" reverseOrder={false} /> {/* Add Toaster Here */}
      <Routes>

        {/* <Route path="/" element={user ? <Navigate to="/DashboardOne" /> : <Navigate to="/login" />} /> */}
        <Route path="/login" element={user ? <Navigate to="/DashboardOne" /> : <LoginForm />} />
        <Route path="/user-details" element={<UserDetails />} />     
        
        <Route path="/login" element={user ? <Navigate to="/" /> : <LoginForm />} />
  
      
      {/* Home Page */}

        <Route path="/" element={
          
            < EnglishLearningHomepage />
         
        } />


      {/* sample page that you can use for add page */}

      <Route path="/sample" element={
          <ProtectedRoute>
            < MainLayout />
          </ProtectedRoute>
        } />
        <Route path="/paragraph" element={
          <ProtectedRoute>
            <Paragraph />
          </ProtectedRoute>
        } />






      {/* bavantha  route Below */}


      <Route path="/paragraph" element={
          <ProtectedRoute>
            < Paragraph />
          </ProtectedRoute>
        } />
        
        
        
        
        
        
         
        
        



        
        
        
        {/* Malindu Routes Below */}
        
        {/* <Route path="/dashboard" element={
          <ProtectedRoute>
            <VocabularyDashboard />
          </ProtectedRoute>
        } /> */}
              
        <Route path="/DashboardOne" element={
          <ProtectedRoute>
            <DashboardOne />
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