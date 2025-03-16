import React, { useState, useEffect, useRef } from 'react';

const WordAssociation = () => {
  // Game questions - each has 3 clue words, 4 possible answers with 1 correct, and an explanation
 

  // Game state
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const [gameStarted, setGameStarted] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [timeExpired, setTimeExpired] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [animation, setAnimation] = useState('');
  const [points, setPoints] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [gameQuestions, setGameQuestions] = useState([]);
  const [error, setError] = useState(null);
  
  // Game level and preferences
  const [gameLevel, setGameLevel] = useState("Beginner");
  const [gamePreferences, setGamePreferences] = useState("Software");
  
  const timerRef = useRef(null);

  // Timer effect
  useEffect(() => {
    if (gameStarted && !answerSubmitted && !timeExpired) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            clearInterval(timerRef.current);
            setTimeExpired(true);
            setAnswerSubmitted(true);
            setStreak(0);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameStarted, currentQuestion, answerSubmitted, timeExpired]);

  // Handle answer selection
  const handleAnswerSelect = (answer) => {
    if (!answerSubmitted && !timeExpired) {
      setSelectedAnswer(answer);
    }
  };

  // Handle answer submission
  const handleSubmit = () => {
    if (selectedAnswer && !answerSubmitted && !timeExpired) {
      clearInterval(timerRef.current);
      
      const isCorrect = selectedAnswer === gameQuestions[currentQuestion].correctAnswer;
      
      if (isCorrect) {
        // Calculate points based on time left (faster = more points)
        const questionPoints = 100 + (timeLeft * 10);
        setPoints(questionPoints);
        setTotalPoints(prev => prev + questionPoints);
        setScore(score + 1);
        setStreak(prev => prev + 1);
        setMaxStreak(prev => Math.max(prev, streak + 1));
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);
        setAnimation('correct-animation');
      } else {
        setStreak(0);
        setAnimation('wrong-animation');
      }
      
      setAnswerSubmitted(true);
    }
  };

  // Move to next question
  const handleNextQuestion = () => {
    if (currentQuestion < gameQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setAnswerSubmitted(false);
      setTimeExpired(false);
      setTimeLeft(10);
      setAnimation('');
      setPoints(0);
    } else {
      setGameComplete(true);
    }
  };

  // Reset game
  const resetGame = () => {
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setAnswerSubmitted(false);
    setGameComplete(false);
    setTimeLeft(10);
    setGameStarted(false);
    setShowInstructions(true);
    setStreak(0);
    setMaxStreak(0);
    setTimeExpired(false);
    setAnimation('');
    setPoints(0);
    setTotalPoints(0);
  };

  // Functions
  // Function to fetch questions from API
  const fetchQuestions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('http://127.0.0.1:8000/api/v1/relatedmcq/', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          level: gameLevel,
          preferences: gamePreferences
        })
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transform API data to match our game format
      const formattedQuestions = data.map((item, index) => {
        // Extract clue words from the question
        const questionMatch = item.question.match(/\[(.*?)\]/);
        const clueWords = questionMatch ? questionMatch[1].split(', ') : ['Missing', 'Clue', 'Words'];
        
        return {
          id: index + 1,
          clueWords: clueWords,
          options: [item.option1, item.option2, item.option3, item.option4],
          correctAnswer: item[item.correct_answer], // Get the value using correct_answer key
          explanation: item.explanation
        };
      });
      
      setGameQuestions(formattedQuestions);
      setGameStarted(true);
      setShowInstructions(false);
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError(err.message);
      // Fall back to default questions if API fails
      setGameQuestions(questions);
      setGameStarted(true);
      setShowInstructions(false);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Start game
  const startGame = () => {
    fetchQuestions();
  };

  // Render functions
  const renderOptionButton = (option) => {
    let buttonClass = "p-4 m-1 rounded-lg text-xl font-medium transition-all duration-300 transform hover:scale-105 ";
    
    if (!answerSubmitted && !timeExpired) {
      buttonClass += selectedAnswer === option 
        ? "bg-blue-600 text-white shadow-lg scale-105 border-2 border-blue-300" 
        : "bg-white border-2 border-blue-400 text-blue-800 hover:bg-blue-100 hover:shadow-md";
    } else {
      if (option === gameQuestions[currentQuestion]?.correctAnswer) {
        buttonClass += "bg-green-500 text-white shadow-lg";
      } else if (selectedAnswer === option) {
        buttonClass += "bg-red-500 text-white";
      } else {
        buttonClass += "bg-blue-100 text-blue-400";
      }
    }
    
    return (
      <button
        key={option}
        className={buttonClass}
        onClick={() => handleAnswerSelect(option)}
        disabled={answerSubmitted || timeExpired}
      >
        {option}
      </button>
    );
  };

  const renderTimer = () => {
    let timerClass = "text-lg font-bold ";
    
    if (timeLeft <= 3) {
      timerClass += "text-red-600 animate-pulse";
    } else if (timeLeft <= 5) {
      timerClass += "text-orange-500";
    } else {
      timerClass += "text-blue-600";
    }
    
    return (
      <div className="flex flex-col items-center">
        <div className="relative w-12 h-12 mb-1">
          <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 100 100">
            <circle
              className="text-gray-200"
              strokeWidth="10"
              stroke="currentColor"
              fill="transparent"
              r="40"
              cx="50"
              cy="50"
            />
            <circle
              className={`${timeLeft <= 3 ? 'text-red-500' : timeLeft <= 5 ? 'text-orange-500' : 'text-blue-500'} transition-all duration-1000`}
              strokeWidth="10"
              strokeDasharray={251.2}
              strokeDashoffset={251.2 * (1 - timeLeft / 10)}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="40"
              cx="50"
              cy="50"
            />
          </svg>
          <div className="absolute top-0 left-0 flex items-center justify-center w-full h-full">
            <span className={timerClass}>{timeLeft}</span>
          </div>
        </div>
        <span className="text-xs text-blue-600">sec</span>
      </div>
    );
  };

  const renderPoints = () => {
    return (
      <div className="flex flex-col items-center justify-center bg-blue-800 text-white p-1 rounded-lg w-20 h-12">
        <div className="text-xs">POINTS</div>
        <div className="text-lg font-bold">{totalPoints}</div>
      </div>
    );
  };

  const renderStreak = () => {
    return (
      <div className="flex flex-col items-center justify-center bg-blue-600 text-white p-1 rounded-lg w-20 h-12">
        <div className="text-xs">STREAK</div>
        <div className="text-lg font-bold">{streak}🔥</div>
      </div>
    );
  };

  const renderGameScreen = () => {
    const currentQ = gameQuestions[currentQuestion];
    
    return (
      <div className={`flex flex-col items-center ${animation}`}>
        {/* Game Container */}
        <div className="w-full max-w-6xl">
          {/* Top Bar with Stats */}
          <div className="flex justify-between items-center mb-4 px-2">
            <div className="flex items-center space-x-2">
              <button 
                className="bg-red-500 text-white text-sm px-3 py-1 rounded-lg font-bold shadow-sm hover:bg-red-600 transition-colors"
                onClick={resetGame}
              >
                Exit
              </button>
              <div className="text-base bg-blue-100 px-3 py-1 rounded-lg">
                <span className="font-bold">Q:</span> {currentQuestion + 1}/{gameQuestions.length}
              </div>
            </div>
            <div className="flex space-x-3">
              {renderPoints()}
              {renderStreak()}
              {renderTimer()}
            </div>
          </div>
          
          {/* Main Game Area - Vertical Layout */}
          <div className="flex flex-col space-y-4">
            {/* Clue Words */}
            <div className="w-full">
              <div className="bg-gradient-to-r from-blue-600 to-blue-400 p-4 rounded-xl shadow-lg flex flex-col justify-center">
                <h2 className="text-white text-lg mb-3 text-center font-bold">Find the connection:</h2>
                
                {/* Visual brain connections illustration */}
                <div className="relative mb-4">
                  <div className="absolute inset-0 flex justify-center">
                    <svg className="w-full h-8 -mt-1" viewBox="0 0 200 30">
                      <path d="M50,15 C70,0 130,0 150,15" stroke="#ffffff" strokeWidth="2" strokeDasharray="4" fill="none" strokeLinecap="round" />
                      <path d="M50,15 C70,30 130,30 150,15" stroke="#ffffff" strokeWidth="2" strokeDasharray="4" fill="none" strokeLinecap="round" />
                      <circle cx="50" cy="15" r="3" fill="#ffffff" />
                      <circle cx="150" cy="15" r="3" fill="#ffffff" />
                    </svg>
                  </div>
                </div>
                
                <div className="flex justify-center space-x-4 items-center">
                  {currentQ.clueWords.map((word, index) => (
                    <div 
                      key={index} 
                      className="bg-white text-blue-800 px-5 py-3 rounded-lg font-bold text-xl shadow-md text-center transform transition-all duration-300"
                      style={{ transform: `rotate(${index % 2 === 0 ? '-0.5deg' : '0.5deg'})` }}
                    >
                      {word}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Answer Options */}
            <div className="w-full">
              <div className="grid grid-cols-2 gap-3 mb-3">
                {currentQ.options.map(option => renderOptionButton(option))}
              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-center mt-2">
                {!answerSubmitted && !timeExpired ? (
                  <button 
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold shadow-lg hover:bg-blue-700 transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed transform hover:scale-105 text-lg"
                    onClick={handleSubmit}
                    disabled={!selectedAnswer}
                  >
                    Submit Answer
                  </button>
                ) : (
                  <button 
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold shadow-lg hover:bg-blue-700 transition-colors duration-300 transform hover:scale-105 text-lg"
                    onClick={handleNextQuestion}
                  >
                    {currentQuestion < gameQuestions.length - 1 ? "Next Question" : "See Results"}
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Feedback - Only show when answered */}
          {(answerSubmitted || timeExpired) && (
            <div className={`mt-4 p-4 rounded-lg ${timeExpired ? 'bg-orange-100 border-l-4 border-orange-500' : selectedAnswer === currentQ.correctAnswer ? 'bg-green-100 border-l-4 border-green-500' : 'bg-red-100 border-l-4 border-red-500'}`}>
              <div className="flex flex-col space-y-2">
                <p className="font-bold text-lg">
                  {timeExpired ? (
                    <span className="flex items-center"><span className="mr-2">⏱️</span> Time's up!</span>
                  ) : selectedAnswer === gameQuestions[currentQuestion]?.correctAnswer ? (
                    <span className="flex items-center"><span className="mr-2">🎉</span> Correct! +{points} points</span>
                  ) : (
                    <span className="flex items-center"><span className="mr-2">❌</span> Not quite!</span>
                  )}
                </p>
                <p className="text-base">
                  The correct answer is <strong className="text-blue-800">{gameQuestions[currentQuestion]?.correctAnswer}</strong>.
                </p>
                <div className="text-sm text-gray-700">
                  <strong>Explanation:</strong> {gameQuestions[currentQuestion]?.explanation}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Confetti effect for correct answers */}
        {showConfetti && (
          <div className="confetti-container">
            {[...Array(50)].map((_, i) => (
              <div 
                key={i}
                className="confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  backgroundColor: ['#1E40AF', '#3B82F6', '#93C5FD', '#fff'][Math.floor(Math.random() * 4)]
                }}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderGameComplete = () => {
    const percentage = Math.round((score / gameQuestions.length) * 100);
    let message = "";
    let emoji = "";
    
    if (percentage >= 90) {
      message = "Outstanding!";
      emoji = "🏆";
    } else if (percentage >= 70) {
      message = "Great job!";
      emoji = "🎉";
    } else if (percentage >= 50) {
      message = "Good effort!";
      emoji = "👍";
    } else {
      message = "Keep practicing!";
      emoji = "💪";
    }
    
    return (
              <div className="text-center">
        <h2 className="text-3xl font-bold mb-4 text-blue-800">Game Complete!</h2>
        
        {/* Trophy/Award Image */}
        <div className="mb-6 flex justify-center">
          <div className="relative w-40 h-40">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-yellow-500 rounded-full shadow-lg border-4 border-yellow-400">
              <div className="absolute w-full h-full bg-yellow-400 rounded-full animate-pulse opacity-70"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl">{emoji}</span>
              </div>
            </div>
            <div className="absolute top-10 left-1/2 transform -translate-x-1/2 w-12 h-8 bg-yellow-600"></div>
            <div className="absolute top-18 left-1/2 transform -translate-x-1/2 w-24 h-24 bg-gradient-to-b from-yellow-500 to-yellow-600 rounded-b-lg border-b-4 border-l-4 border-r-4 border-yellow-700 flex items-center justify-center">
              <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center border-4 border-yellow-500">
                <span className="text-xl font-bold text-yellow-700">{percentage}%</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-600 to-blue-400 p-6 rounded-xl text-white mb-6 shadow-lg">
          <div className="mb-4">
            <p className="text-5xl font-bold mb-2">{score} / {gameQuestions.length}</p>
            <p className="text-2xl mb-2">{percentage}%</p>
            <p className="text-3xl">{message} {emoji}</p>
          </div>
          
          <div className="flex justify-center gap-8 mt-6">
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <div className="text-sm">TOTAL POINTS</div>
              <div className="text-3xl font-bold">{totalPoints}</div>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <div className="text-sm">BEST STREAK</div>
              <div className="text-3xl font-bold">{maxStreak}🔥</div>
            </div>
          </div>
        </div>
        <div className="flex justify-center space-x-6">
          <button 
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold text-lg shadow-lg hover:bg-blue-700 transform hover:scale-105 transition-all duration-300"
            onClick={resetGame}
          >
            Play Again
          </button>
          <button 
            className="bg-red-500 text-white px-8 py-3 rounded-lg font-bold text-lg shadow-lg hover:bg-red-600 transform hover:scale-105 transition-all duration-300"
            onClick={() => {
              resetGame();
              setGameStarted(false);
              setShowInstructions(true);
            }}
          >
            Exit
          </button>
        </div>
      </div>
    );
  };

  const renderInstructions = () => {
    return (
              <div className="text-center max-w-lg mx-auto">
        <h1 className="text-3xl font-bold mb-4 text-blue-800 text-center">Word Connection Challenge</h1>
        
        {/* Game Logo/Image */}
        <div className="mb-4">
          <div className="relative w-64 h-64 mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute inset-4 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full shadow-lg flex items-center justify-center">
              <div className="absolute">
                <div className="flex -space-x-2">
                  <div className="w-16 h-16 rounded-full bg-white shadow-inner flex items-center justify-center transform -rotate-12 translate-x-6 -translate-y-1">
                    <span className="text-2xl font-bold text-blue-800">A</span>
                  </div>
                  <div className="w-16 h-16 rounded-full bg-white shadow-inner flex items-center justify-center transform rotate-3 translate-y-2">
                    <span className="text-2xl font-bold text-blue-800">B</span>
                  </div>
                  <div className="w-16 h-16 rounded-full bg-white shadow-inner flex items-center justify-center transform rotate-12 -translate-x-6 -translate-y-1">
                    <span className="text-2xl font-bold text-blue-800">C</span>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-10 w-full text-center">
                <svg className="mx-auto w-24 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-100 p-4 rounded-lg mb-6 border-l-4 border-blue-500">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-blue-800 mb-4">How to Play:</h2>
            <div className="space-y-3 mb-4">
              <div className="flex items-start">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0 text-xs">1</span>
                <span className="text-base">You'll see <strong>3 clue words</strong> that share a connection.</span>
              </div>
              <div className="flex items-start">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0 text-xs">2</span>
                <span className="text-base">Choose <strong>1 answer</strong> from the 4 options that relates to all clues.</span>
              </div>
              <div className="flex items-start">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0 text-xs">3</span>
                <span className="text-base">You have <strong>only 10 seconds</strong> to answer each question!</span>
              </div>
              <div className="flex items-start">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-2 flex-shrink-0 text-xs">4</span>
                <span className="text-base">Earn more points for faster answers and build a streak.</span>
              </div>
            </div>
          </div>
          <button 
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold text-lg shadow-lg hover:bg-blue-700 transform hover:scale-105 transition-all duration-300 animate-pulse"
            onClick={startGame}
          >
            Start Game
          </button>
        </div>
      </div>
    );
  };

  const renderLoadingScreen = () => {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="relative w-24 h-24">
          <div className="absolute top-0 left-0 w-full h-full border-8 border-blue-200 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-8 border-transparent border-t-blue-600 rounded-full animate-spin"></div>
        </div>  
        <p className="mt-6 text-xl font-bold text-blue-800">Building Your Brain Connections...</p>
        <p className="mt-2 text-sm text-blue-600">Preparing Your Word Challenge...</p>
        
        {/* Show error message if API request failed */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-lg max-w-md">
            <p className="font-bold">Error connecting to API:</p>
            <p className="text-sm">{error}</p>
            <p className="text-sm mt-2">Falling back to default questions...</p>
          </div>
        )}
        
        {/* Animated brain connections */}
        <div className="mt-8 relative w-48 h-12">
          <svg className="w-full h-full" viewBox="0 0 200 50">
            <circle cx="40" cy="25" r="8" fill="#3B82F6" className="animate-pulse" style={{ animationDelay: '0ms' }} />
            <circle cx="100" cy="25" r="8" fill="#3B82F6" className="animate-pulse" style={{ animationDelay: '300ms' }} />
            <circle cx="160" cy="25" r="8" fill="#3B82F6" className="animate-pulse" style={{ animationDelay: '600ms' }} />
            
            <path d="M48,25 C60,10 80,10 92,25" stroke="#3B82F6" strokeWidth="2" strokeDasharray="4" fill="none" strokeLinecap="round" className="animate-dash" />
            <path d="M108,25 C120,10 140,10 152,25" stroke="#3B82F6" strokeWidth="2" strokeDasharray="4" fill="none" strokeLinecap="round" className="animate-dash-delayed" />
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-blue-50 p-3 w-full min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-4 w-full max-w-4xl mx-auto border-t-4 border-blue-600">
        {!gameStarted && !isLoading && showInstructions && renderInstructions()}
        {isLoading && renderLoadingScreen()}
        {gameStarted && !gameComplete && renderGameScreen()}
        {gameComplete && renderGameComplete()}
      </div>
      
      <style jsx>{`
        .confetti {
          position: absolute;
          width: 8px;
          height: 8px;
          opacity: 0;
          animation: confetti-fall 3s ease-in-out forwards;
        }
        
        @keyframes confetti-fall {
          0% {
            transform: translateY(-50vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(50vh) rotate(720deg);
            opacity: 0;
          }
        }
        
        .correct-animation {
          animation: correct-pulse 0.5s ease-in-out;
        }
        
        @keyframes correct-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        
        .wrong-animation {
          animation: wrong-shake 0.5s ease-in-out;
        }
        
        @keyframes wrong-shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-3px); }
          40%, 80% { transform: translateX(3px); }
        }
        
        .animate-dash {
          stroke-dasharray: 30;
          animation: dash 1.5s linear infinite;
        }
        
        .animate-dash-delayed {
          stroke-dasharray: 30;
          animation: dash 1.5s linear infinite;
          animation-delay: 0.75s;
        }
        
        @keyframes dash {
          to {
            stroke-dashoffset: -60;
          }
        }
      `}</style>
    </div>
  );
};

export default WordAssociation;