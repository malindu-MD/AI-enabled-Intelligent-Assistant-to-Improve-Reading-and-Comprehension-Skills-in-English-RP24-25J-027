import React, { useState, useEffect } from 'react';
import { 
  LightbulbIcon, 
  TimerIcon 
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
  // Game State
  const [gameStage, setGameStage] = useState('setup');
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

  // Setup Stage
  if (gameStage === 'setup') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        {toast && <ToastComponent {...toast} />}
        <div className="w-full max-w-5xl bg-white shadow-2xl rounded-3xl overflow-hidden transform transition-all duration-500 hover:scale-[1.02]">
          {/* Animated Header */}
          <div className="p-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-gradient-to-r from-indigo-800 via-purple-800 to-pink-800 animate-pulse"></div>
            <h1 className="text-4xl font-extrabold text-white text-center relative z-10 tracking-tight">
              Word Association Challenge
            </h1>
            <p className="text-center text-white/80 mt-2 relative z-10">
              Test your linguistic skills and word connections
            </p>
          </div>

          {/* Game Setup */}
          <div className="p-8">
            <div className="space-y-6 max-w-md mx-auto">
              <div>
                <label className="block mb-2 text-lg font-semibold text-indigo-900">Difficulty Level</label>
                <div className="grid grid-cols-3 gap-4">
                  {['Easy', 'Medium', 'Hard'].map((difficulty) => (
                    <button
                      key={difficulty}
                      onClick={() => setSelectedDifficulty(difficulty)}
                      className={`
                        p-4 rounded-lg text-center font-bold transition-all duration-500
                        ${selectedDifficulty === difficulty 
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-2xl' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}
                      `}
                    >
                      {difficulty}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={startGame} 
                disabled={!selectedDifficulty}
                className="
                  w-full p-4 
                  bg-gradient-to-r from-indigo-600 to-purple-600
                  text-white 
                  rounded-full 
                  text-lg 
                  font-bold
                  hover:from-indigo-700 hover:to-purple-700 
                  transition-all 
                  duration-500
                  transform
                  hover:-translate-y-1
                  shadow-xl
                  hover:shadow-2xl
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                Begin Challenge
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        {toast && <ToastComponent {...toast} />}
        <div className="w-full max-w-5xl bg-white shadow-2xl rounded-3xl overflow-hidden transform transition-all duration-500 hover:scale-[1.02]">
          {/* Animated Header */}
          <div className="p-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-gradient-to-r from-indigo-800 via-purple-800 to-pink-800 animate-pulse"></div>
            <h1 className="text-4xl font-extrabold text-white text-center relative z-10 tracking-tight">
              Game Over
            </h1>
          </div>

          {/* Score Display */}
          <div className="p-8 text-center space-y-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-2xl shadow-lg">
              <p className="text-3xl font-bold text-indigo-900 mb-4">Your Final Score</p>
              <div className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                {score}
              </div>
            </div>

            <button 
              onClick={restartGame}
              className="
                px-8 py-4 
                bg-gradient-to-r from-indigo-600 to-purple-600
                text-white 
                rounded-full 
                text-lg 
                font-bold
                hover:from-indigo-700 hover:to-purple-700 
                transition-all 
                duration-500
                transform
                hover:-translate-y-1
                shadow-xl
                hover:shadow-2xl
              "
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {toast && <ToastComponent {...toast} />}
      <div className="w-full max-w-5xl bg-white shadow-2xl rounded-3xl overflow-hidden transform transition-all duration-500 hover:scale-[1.02]">
        {/* Game Header */}
        <div className="p-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-gradient-to-r from-indigo-800 via-purple-800 to-pink-800 animate-pulse"></div>
          <div className="flex justify-between items-center relative z-10">
            <div className="flex items-center space-x-2 text-white">
              <TimerIcon className="h-6 w-6" />
              <span className="text-lg font-bold">{timeLeft} seconds</span>
            </div>
            <div className="text-white text-lg font-bold">
              Score: {score}
            </div>
          </div>
        </div>

        {/* Game Content */}
        <div className="p-8">
          <div className="max-w-md mx-auto space-y-6">
            <div className="text-center text-2xl font-bold text-indigo-900 bg-indigo-50 p-4 rounded-lg">
              {currentQuestion.words.join(' | ')}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {currentQuestion.options.map(option => (
                <button 
                  key={option} 
                  onClick={() => handleAnswer(option)}
                  className="
                    w-full p-4 
                    bg-gradient-to-r from-blue-500 to-indigo-600
                    text-white 
                    rounded-lg 
                    text-lg 
                    font-bold
                    hover:from-blue-600 hover:to-indigo-700 
                    transition-all 
                    duration-500
                    transform
                    hover:-translate-y-1
                    shadow-lg
                    hover:shadow-xl
                  "
                >
                  {option}
                </button>
              ))}
            </div>

            <button 
              onClick={generateHintForQuestion}
              className="
                w-full p-4 
                bg-gradient-to-r from-purple-500 to-pink-600
                text-white 
                rounded-lg 
                text-lg 
                font-bold
                hover:from-purple-600 hover:to-pink-700 
                transition-all 
                duration-500
                transform
                hover:-translate-y-1
                shadow-lg
                hover:shadow-xl
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center
              "
              disabled={hintsUsed >= 3}
            >
              <LightbulbIcon className="mr-2 h-6 w-6" /> 
              Get Hint ({3 - hintsUsed} remaining)
            </button>

            {currentHint && (
              <div className="mt-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg shadow-md">
                <p className="text-sm text-indigo-900">{currentHint}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WordAssociationGame;