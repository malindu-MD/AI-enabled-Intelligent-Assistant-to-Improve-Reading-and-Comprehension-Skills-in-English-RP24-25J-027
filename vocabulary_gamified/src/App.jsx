import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import TabooVocabularyGame from './pages/TabooVocabularyGame'
import TabooGame from './pages/TabooGame'
import WordAssociationGame from './pages/WordAssociationGame'
import VocabularyDashboard from './pages/VocabularyDashboard'
import GameTypes from './pages/GameTypes'
import GameSelectionDashboard from './pages/GameSelectionDashboard'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<VocabularyDashboard />} />
        <Route path="/game-selection" element={<GameSelectionDashboard />} />
        <Route path="/word-association" element={<WordAssociationGame />} />
        <Route path="/taboo" element={<TabooGame />} />
        <Route path="/taboo-vocabulary" element={<TabooVocabularyGame />} />
        {/* Add more routes as needed */}
      </Routes>
    </Router>
  )
}

export default App
