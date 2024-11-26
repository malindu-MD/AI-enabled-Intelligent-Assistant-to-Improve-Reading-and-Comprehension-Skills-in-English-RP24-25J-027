import React, { useState, useEffect } from 'react';
import { 
  MoonIcon, 
  SunIcon, 
  TimerIcon, 
  LightbulbIcon, 
  HomeIcon, 
  TrophyIcon, 
  HelpCircleIcon 
} from 'lucide-react';

// Utility for generating random hints
const generateHint = (question) => {
  const hintStrategies = [
    `Look for a word that creates a similar contextual relationship.`,
    `Consider the underlying semantic connection between the original words.`,
    `Think about how these words might be used together in a sentence.`,
    `Explore potential synonymic or antonymic relationships.`
  ];
  return hintStrategies[Math.floor(Math.random() * hintStrategies.length)];
};

// Comprehensive question bank
const QUESTIONS = [
  {
    words: ['SHOP', 'WATER', 'STOP'],
    options: ['CODE', 'BAR'],
    correctAnswer: 'BAR',
    explanation: 'Contextual association: I will STOP at the SHOP to get WATER.',
    difficulty: 'Easy'
  },
  {
    words: ['HAPPY', 'BRIGHT', 'LIGHT'],
    options: ['DARK', 'SAD'],
    correctAnswer: 'SAD',
    explanation: 'Antonymic relationship: Opposite emotional and descriptive states.',
    difficulty: 'Medium'
  },
  {
    words: ['BOOK', 'LEARN', 'READ'],
    options: ['WRITE', 'SLEEP'],
    correctAnswer: 'WRITE',
    explanation: 'Semantic connection: Activities related to knowledge acquisition.',
    difficulty: 'Hard'
  }
];

const WordAssociationGame = () => {
  // Theme Management
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Game State
  const [gameStage, setGameStage] = useState('setup');
  const [selectedProvider, setSelectedProvider] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  
  // Game Mechanics
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [score, setScore] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  
  // Timer Management
  const [timeLeft, setTimeLeft] = useState(60);
  const [isTimerActive, setIsTimerActive] = useState(false);

  // Hint System
  const [hintsUsed, setHintsUsed] = useState(0);
  const [currentHint, setCurrentHint] = useState('');

  // Toast Management
  const [toast, setToast] = useState(null);

  // Show Toast
  const showToast = (type, message, description = '') => {
    setToast({ type, message, description });
    setTimeout(() => setToast(null), 3000);
  };

  // Toggle Theme
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark', !isDarkMode);
  };

  // Timer Logic
  useEffect(() => {
    let timer;
    if (isTimerActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      endGame();
    }
    return () => clearInterval(timer);
  }, [isTimerActive, timeLeft]);

  // Game Start
  const startGame = () => {
    const filteredQuestions = QUESTIONS.filter(
      q => q.difficulty === selectedDifficulty
    );
    
    if (filteredQuestions.length === 0) {
      showToast('error', 'No questions available', 'Please select a different difficulty');
      return;
    }

    setCurrentQuestion(filteredQuestions[0]);
    setGameStage('playing');
    setIsTimerActive(true);
    setTimeLeft(60);
    setScore(0);
  };

  // Answer Handling
  const handleAnswer = (selectedOption) => {
    const isCorrect = selectedOption === currentQuestion.correctAnswer;
    
    if (isCorrect) {
      setScore(prev => prev + 10);
      showToast('success', 'Correct Answer!', currentQuestion.explanation);
    } else {
      showToast('error', 'Incorrect Answer', `The correct answer was ${currentQuestion.correctAnswer}`);
    }

    // Move to next question
    moveToNextQuestion();
  };

  // Move to Next Question
  const moveToNextQuestion = () => {
    const filteredQuestions = QUESTIONS.filter(
      q => q.difficulty === selectedDifficulty
    );
    
    const nextIndex = (questionIndex + 1) % filteredQuestions.length;
    setQuestionIndex(nextIndex);
    setCurrentQuestion(filteredQuestions[nextIndex]);
    setCurrentHint('');
  };

  // Generate Hint
  const generateHintForQuestion = () => {
    if (hintsUsed < 3) {
      const newHint = generateHint(currentQuestion);
      setCurrentHint(newHint);
      setHintsUsed(prev => prev + 1);
    } else {
      showToast('warning', 'Hint limit reached!');
    }
  };

  // End Game
  const endGame = () => {
    setIsTimerActive(false);
    setGameStage('gameOver');
  };

  // Restart Game
  const restartGame = () => {
    setGameStage('setup');
    setScore(0);
    setHintsUsed(0);
    setTimeLeft(60);
  };

  // Toast Component
  const ToastComponent = ({ type, message, description }) => {
    const typeStyles = {
      success: 'bg-green-500 text-white',
      error: 'bg-red-500 text-white',
      warning: 'bg-yellow-500 text-black'
    };

    return (
      <div className={`fixed top-4 right-4 p-4 rounded shadow-lg z-50 ${typeStyles[type]}`}>
        <div className="font-bold">{message}</div>
        {description && <div className="text-sm">{description}</div>}
      </div>
    );
  };

  // Navigation Bar Component
  const Navbar = () => (
    <nav className="flex justify-between items-center p-4 bg-gray-100 dark:bg-gray-800">
      <div className="flex items-center space-x-4">
        <HomeIcon className="h-6 w-6 dark:text-white" />
        <TrophyIcon className="h-6 w-6 dark:text-white" />
        <HelpCircleIcon className="h-6 w-6 dark:text-white" />
      </div>
      <div className="flex items-center space-x-4">
        <button 
          onClick={toggleTheme} 
          className="text-gray-600 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 p-2 rounded-full"
        >
          {isDarkMode ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>
    </nav>
  );

  // Setup Stage
  if (gameStage === 'setup') {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900 text-white' : ''}`}>
        {toast && <ToastComponent {...toast} />}
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-center mb-6">Word Association Challenge</h2>
            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium">Test Provider</label>
                <select 
                  value={selectedProvider} 
                  onChange={(e) => setSelectedProvider(e.target.value)}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                >
                  <option value="">Select Provider</option>
                  <option value="Verbal Reasoning">Verbal Reasoning</option>
                  <option value="Linguistic Challenge">Linguistic Challenge</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium">Difficulty</label>
                <select 
                  value={selectedDifficulty} 
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
                >
                  <option value="">Select Difficulty</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <button 
                onClick={startGame} 
                disabled={!selectedProvider || !selectedDifficulty}
                className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Start Game
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Game Over Stage
  if (gameStage === 'gameOver') {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'dark bg-gray-900 text-white' : ''}`}>
        {toast && <ToastComponent {...toast} />}
        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-center mb-6">Game Over</h2>
          <div className="text-center space-y-4">
            <p className="text-2xl font-bold">Your Score: {score}</p>
            <button 
              onClick={restartGame}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Play Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Playing Stage
  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900 text-white' : ''}`}>
      {toast && <ToastComponent {...toast} />}
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-2">
              <TimerIcon className="h-5 w-5" />
              <span>{timeLeft} seconds</span>
            </div>
            <span className="font-bold">Score: {score}</span>
          </div>
          <div className="space-y-4">
            <div className="text-center text-xl font-bold mb-4">
              {currentQuestion.words.join(' | ')}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {currentQuestion.options.map(option => (
                <button 
                  key={option} 
                  onClick={() => handleAnswer(option)}
                  className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  {option}
                </button>
              ))}
            </div>

            <button 
              onClick={generateHintForQuestion}
              className="w-full p-2 border rounded dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              disabled={hintsUsed >= 3}
            >
              <div className="flex items-center justify-center">
                <LightbulbIcon className="mr-2 h-5 w-5" /> 
                Get Hint ({3 - hintsUsed} remaining)
              </div>
            </button>

            {currentHint && (
              <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded">
                <p className="text-sm">{currentHint}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WordAssociationGame;