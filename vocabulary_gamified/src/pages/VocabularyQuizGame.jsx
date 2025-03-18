import React, { useState, useEffect, useRef } from 'react';
import { API_URL } from '../services/Config';
import { useUser } from '../components/UserContext';
import { useNavigate } from 'react-router-dom';

const VocabularyQuizGame = () => {
  // Quiz questions data
 

  // State variables
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizData, setQuizData] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [animateQuestion, setAnimateQuestion] = useState(true);
  const [timeLeft, setTimeLeft] = useState(20);
  const [isTimerActive, setIsTimerActive] = useState(true);
  const [hintsRemaining, setHintsRemaining] = useState(3);
  const [showHint, setShowHint] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [apiError, setApiError] = useState(null);
  const [streakCount, setStreakCount] = useState(0);
  const [showStreakBonus, setShowStreakBonus] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [comboMultiplier, setComboMultiplier] = useState(1);
  const [pointAnimation, setPointAnimation] = useState({ show: false, points: 0 });
  // Added loading state for API fetch simulation
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  // Audio references
  const correctSoundRef = useRef(null);
  const wrongSoundRef = useRef(null);
  const timerSoundRef = useRef(null);
  const countdownSoundRef = useRef(null);
  const completionSoundRef = useRef(null);
  const clickSoundRef = useRef(null);
  const hintSoundRef = useRef(null);
  const streakSoundRef = useRef(null);


  const {user,setuser}=useUser();

  const currentQuestion = quizData[currentQuestionIndex];

  // Initialize audio elements
  useEffect(() => {
    // In a real implementation, you would load actual audio files
    correctSoundRef.current = new Audio();
    correctSoundRef.current.src = "/sounds/correct-sound.mp3"; // Placeholder URL
    
    wrongSoundRef.current = new Audio();
    wrongSoundRef.current.src = "/sounds/wrong-sound.mp3"; // Placeholder URL
    
    timerSoundRef.current = new Audio();
    timerSoundRef.current.src = "timer-sound.mp3"; // Placeholder URL
    
    countdownSoundRef.current = new Audio();
    countdownSoundRef.current.src = "countdown-sound.mp3"; // Placeholder URL
    
    completionSoundRef.current = new Audio();
    completionSoundRef.current.src = "completion-sound.mp3"; // Placeholder URL
    
    clickSoundRef.current = new Audio();
    clickSoundRef.current.src = "/sounds/click-sound.mp3"; // Placeholder URL
    
    hintSoundRef.current = new Audio();
    hintSoundRef.current.src = "hint-sound.mp3"; // Placeholder URL
    
    streakSoundRef.current = new Audio();
    streakSoundRef.current.src = "streak-sound.mp3"; // Placeholder URL
  }, []);


  const exitGame1= () => {
    navigate('/DashboardOne');
    console.log("Exiting game...");
  };
  



  const fetchQuizData = async () => {
    console.log("Hi mallindu");


    const userLevel = user?.level && user.level !== 'level' 
    ? user.level 
    : 'Elementary';


    const userPreference = user?.preferences?.contextInterests?.length > 0
  ? user.preferences.contextInterests[Math.floor(Math.random() * user.preferences.contextInterests.length)]
  : 'any';

  console.log(userLevel);
  console.log(userPreference);
    try {
      setIsLoading(true);
      setApiError(null);
        
      const requestData = {
            
              level: userLevel,  // Make sure these values are properly set in your component
              preferences: userPreference
          };
      
          // Send a POST request to the API
      const response = await fetch(`${API_URL}/fillintheblankten`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify(requestData)
          });

     
      
      if (!response.ok) {
        throw new Error('Failed to fetch quiz data');
      }
      
      const data = await response.json();
      
      // Transform the API response to match the existing component structure
      const transformedData = data.map((item, index) => ({
        id: index + 1,
        sentence: item.question.replace('[____]', '_____'),
        options: [
          item.option1, 
          item.option2, 
          item.option3, 
          item.option4
        ],
        correctIndex: ['Option 1', 'Option 2', 'Option 3', 'Option 4'].indexOf(item.correct_answer),
        explanation: item.explanation
      }));

      setQuizData(transformedData);
      
      setTimeout(() => {
        setIsLoading(false);
        setShowCountdown(true);

      
        
        // Countdown animation before starting
        let count = 3;
        const countdownInterval = setInterval(() => {
          playSound('countdown');
          setCountdown(count - 1);
          count -= 1;
          
          if (count === 0) {
            clearInterval(countdownInterval);
            setTimeout(() => {
              setShowCountdown(false);
              setGameStarted(true);
              
            }, 1000);
          }
        }, 1000);
      }, 2000); // Simulate 2 second loading time

    } catch (err) {
      console.error('Error fetching quiz data:', err);
      setApiError('Failed to load quiz. Please try again.');
      setIsLoading(false);
    }
  };

  

  // Start game function
  const startGame = () => {
    playSound('click');
    // Set loading state to true to simulate API fetch
    fetchQuizData();

     

    
    // Simulate API fetch for quiz data
   
  };

  // Exit game function
  const exitGame = () => {
    if (window.confirm("Are you sure you want to exit the game? Your progress will be lost.")) {
      // Reset all game states
      handleResetQuiz();
      // Return to start screen
      setGameStarted(false);
      setQuizCompleted(false);
    }
  };

  // Timer effect
  useEffect(() => {
    let timer;
    if (gameStarted && isTimerActive && timeLeft > 0 && !quizCompleted) {
      timer = setTimeout(() => {
        if (timeLeft <= 5) {
          playSound('timer');
        }
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerActive && !quizCompleted) {
      // Time's up for this question
      handleTimesUp();
    }

    return () => clearTimeout(timer);
  }, [timeLeft, isTimerActive, gameStarted, quizCompleted]);

  // Handle time's up
  const handleTimesUp = () => {
    setIsTimerActive(false);
    playSound('wrong');
    setStreakCount(0);
    setComboMultiplier(1);
    
    // Show correct answer
    setSelectedOption(-1); // Special value to indicate timeout
    setShowExplanation(true);
  };
  
  // Function to play sound effects
  const playSound = (type) => {
    try {
      switch (type) {
        case 'correct':
          if (correctSoundRef.current) {
            correctSoundRef.current.play();
          }
          break;
        case 'wrong':
          if (wrongSoundRef.current) {
            wrongSoundRef.current.play();
          }
          break;
        case 'timer':
          if (timerSoundRef.current) {
            timerSoundRef.current.play();
          }
          break;
        case 'countdown':
          if (countdownSoundRef.current) {
            countdownSoundRef.current.play();
          }
          break;
        case 'complete':
          if (completionSoundRef.current) {
            completionSoundRef.current.play();
          }
          break;
        case 'click':
          if (clickSoundRef.current) {
            clickSoundRef.current.play();
          }
          break;
        case 'hint':
          if (hintSoundRef.current) {
            hintSoundRef.current.play();
          }
          break;
        case 'streak':
          if (streakSoundRef.current) {
            streakSoundRef.current.play();
          }
          break;
        default:
          console.log(`No sound defined for type: ${type}`);
      }
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  };

  // Handle option selection
  const handleOptionSelect = (optionIndex) => {
    if (selectedOption !== null || !isTimerActive) return; // Prevent selecting again after answer
    
    playSound('click');
    setSelectedOption(optionIndex);
    setIsTimerActive(false);
    
    // Check if answer is correct
    const isCorrect = optionIndex === currentQuestion.correctIndex;
    
    if (isCorrect) {
      playSound('correct');
      
      // Calculate points based on time left
      let points = 10 + timeLeft;
      
      // Increase streak for correct answers
      const newStreak = streakCount + 1;
      setStreakCount(newStreak);
      
      // Add combo multiplier for streaks
      let multiplier = comboMultiplier;
      if (newStreak >= 3) {
        multiplier = Math.min(3, Math.floor(newStreak / 3) + 1);
        setComboMultiplier(multiplier);
        
        if (multiplier > 1) {
          setShowStreakBonus(true);
          playSound('streak');
          setTimeout(() => setShowStreakBonus(false), 2000);
        }
      }
      
      // Apply multiplier to points
      points = points * multiplier;
      
      // Update score and points earned
      setScore(score + points);
      setPointsEarned(points);
      
      // Animate points being added
      setPointAnimation({
        show: true,
        points: points
      });
      
      setTimeout(() => {
        setPointAnimation({
          show: false,
          points: 0
        });
      }, 1500);
      
    } else {
      playSound('wrong');
      setStreakCount(0);
      setComboMultiplier(1);
      setShowExplanation(true);
    }
    
    // Mark question as answered
    setAnsweredQuestions([...answeredQuestions, currentQuestionIndex]);
  };

  // Show hint function
  const handleShowHint = () => {
    if (hintsRemaining > 0 && !showHint) {
      playSound('hint');
      setHintsRemaining(hintsRemaining - 1);
      setShowHint(true);
    }
  };

  // Move to next question
  const handleNextQuestion = () => {
    playSound('click');
    
    if (currentQuestionIndex < quizData.length - 1) {
      setAnimateQuestion(false);
      
      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedOption(null);
        setShowExplanation(false);
        setShowHint(false);
        setTimeLeft(20);
        setIsTimerActive(true);
        setAnimateQuestion(true);
        setPointAnimation({ show: false, points: 0 });
      }, 300);
    } else {
      // Quiz completed
      setQuizCompleted(true);
      setShowConfetti(true);
      playSound('complete');
    }
  };

  // Reset quiz function
  const handleResetQuiz = () => {
    playSound('click');
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setScore(0);
    setShowExplanation(false);
    setQuizCompleted(false);
    setShowConfetti(false);
    setAnsweredQuestions([]);
    setAnimateQuestion(true);
    setTimeLeft(20);
    setIsTimerActive(true);
    setHintsRemaining(3);
    setShowHint(false);
    setPointsEarned(0);
    setStreakCount(0);
    setShowStreakBonus(false);
    setGameStarted(false);
    setComboMultiplier(1);
    setPointAnimation({ show: false, points: 0 });
  };

  // Get two incorrect options to eliminate for hint
  const getHintOptions = () => {
    const correctIndex = currentQuestion.correctIndex;
    const allIndices = [0, 1, 2, 3];
    const incorrectIndices = allIndices.filter(idx => idx !== correctIndex);
    
    // Randomly select two incorrect options to eliminate
    incorrectIndices.sort(() => 0.5 - Math.random());
    return incorrectIndices.slice(0, 2);
  };

  // Generate confetti elements
  const renderConfetti = () => {
    if (!showConfetti) return null;

    const confettiElements = [];
    const colors = ['bg-red-500', 'bg-blue-500', 'bg-yellow-400', 'bg-green-500', 'bg-purple-500', 'bg-pink-500'];
    
    for (let i = 0; i < 150; i++) {
      const left = `${Math.random() * 100}%`;
      const animationDuration = `${Math.random() * 3 + 2}s`;
      const colorClass = colors[Math.floor(Math.random() * colors.length)];
      const size = `${Math.random() * 0.5 + 0.1}rem`;
      
      confettiElements.push(
        <div
          key={i}
          className={`absolute ${colorClass} rounded-full`}
          style={{
            left,
            top: '-20px',
            width: size,
            height: size,
            animation: `fall ${animationDuration} ease-in forwards`,
            animationDelay: `${Math.random() * 5}s`
          }}
        />
      );
    }
    return confettiElements;
  };

  // Get reward message based on score
  const getRewardMessage = () => {
    const percentage = (score / (quizData.length * 30)) * 100;
    
    if (percentage >= 90) return "Word Wizard! Your vocabulary is legendary! 🏆";
    if (percentage >= 75) return "Vocabulary Master! Exceptional knowledge! 🥇";
    if (percentage >= 60) return "Word Champion! Impressive vocabulary skills! 🥈";
    if (percentage >= 40) return "Word Explorer! Good vocabulary foundation! 🥉";
    return "Vocabulary Apprentice! Keep building your word power! 📚";
  };

  // Get appropriate badge based on score
  const renderBadge = () => {
    const percentage = (score / (quizData.length * 30)) * 100;
    
    let badgeType, badgeColor, badgeIcon;
    
    if (percentage >= 90) {
      badgeType = "wizard";
      badgeColor = "from-purple-500 to-indigo-600";
      badgeIcon = (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-yellow-100" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
      );
    } else if (percentage >= 75) {
      badgeType = "master";
      badgeColor = "from-yellow-400 to-yellow-600";
      badgeIcon = (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-yellow-100" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 1l2.928 6.377 6.541.95-4.735 4.614 1.12 6.53L10 16.13l-5.854 3.34 1.12-6.53L.53 8.328l6.541-.95L10 1z" clipRule="evenodd" />
        </svg>
      );
    } else if (percentage >= 60) {
      badgeType = "champion";
      badgeColor = "from-blue-400 to-blue-600";
      badgeIcon = (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-blue-100" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M7 2a1 1 0 00-.707 1.707L7 4.414v3.758a1 1 0 01-.293.707l-4 4C.817 14.769 2.156 18 4.828 18h10.343c2.673 0 4.012-3.231 2.122-5.121l-4-4A1 1 0 0113 8.172V4.414l.707-.707A1 1 0 0013 2H7zm2 6.172V4h2v4.172a3 3 0 00.879 2.12l1.168 1.168a4 4 0 00-2.278.592l-.172.096a4 4 0 01-3.98-.096l-.172-.096a4 4 0 00-2.278-.592l1.168-1.168A3 3 0 009 8.172z" clipRule="evenodd" />
        </svg>
      );
    } else if (percentage >= 40) {
      badgeType = "explorer";
      badgeColor = "from-green-400 to-green-600";
      badgeIcon = (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-100" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
        </svg>
      );
    } else {
      badgeType = "apprentice";
      badgeColor = "from-gray-400 to-gray-600";
      badgeIcon = (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-100" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
        </svg>
      );
    }
    
    return (
      <div className="flex flex-col items-center space-y-4">
        <div className={`relative w-28 h-28 rounded-full bg-gradient-to-br ${badgeColor} shadow-xl flex items-center justify-center animate-bounce-slow`}>
          {badgeIcon}
          <div className="absolute inset-0 rounded-full border-4 border-white opacity-30"></div>
        </div>
        <div className="text-2xl font-bold text-purple-700">{badgeType.toUpperCase()}</div>
      </div>
    );
  };
  
  // Render character avatar based on current state
  const renderCharacter = () => {
    // Different character states based on quiz progress
    let characterState = "default";
    
    if (selectedOption !== null) {
      characterState = selectedOption === currentQuestion.correctIndex ? "happy" : "sad";
    } else if (timeLeft <= 5 && isTimerActive) {
      characterState = "worried";
    }
    
    // Define the character images/emojis for each state
    const characters = {
      default: "👨‍🏫",
      happy: "😃",
      sad: "😔",
      worried: "😰"
    };
    
    return (
      <div className="absolute -left-12 top-1/2 transform -translate-y-1/2 hidden md:block">
        <div className={`text-5xl ${characterState === "worried" ? "animate-pulse" : characterState === "happy" ? "animate-bounce" : ""}`}>
          {characters[characterState]}
        </div>
      </div>
    );
  };

  // Loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 flex items-center justify-center font-sans">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="flex justify-center mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
          </div>
          <h2 className="text-2xl font-bold text-purple-700 mb-2">Get ready! Your quiz is loading…</h2>
          <p className="text-gray-600"> We’re picking some great vocab questions for you</p>
        </div>
      </div>
    );
  }




  if (showCountdown) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 flex items-center justify-center font-sans">
        <div className="text-center">
          <div className="text-9xl font-bold text-purple-600 animate-pulse">
            {countdown}
          </div>
          <div className="text-2xl text-purple-700 mt-4">
            Get Ready!
          </div>
        </div>
      </div>
    );
  }

  // Start screen
  if (!gameStarted && !quizCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-4 flex flex-col items-center justify-center font-sans">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden relative z-10 max-w-2xl w-full">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-6 text-white text-center">
            <h1 className="text-3xl font-bold mb-2">Vocabulary Challenge</h1>
            <p className="text-lg text-blue-100">Test and expand your vocabulary with this interactive quiz!</p>
          </div>
          
          <div className="p-6 text-center">
            <div className="mb-6">
              <div className="text-6xl mb-4">🎮</div>
              <h2 className="text-2xl font-bold text-purple-700 mb-2">How to Play</h2>
              <ul className="text-gray-700 text-left space-y-2 mb-6">
                <li className="flex items-start">
                  <span className="mr-2 text-purple-500">✓</span>
                  Fill in the blanks with the correct vocabulary word
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-purple-500">✓</span>
                  Answer quickly for more points - you have 20 seconds per question
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-purple-500">✓</span>
                  Get a streak of correct answers for point multipliers
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-purple-500">✓</span>
                  Use hints when you're stuck (3 available)
                </li>
              </ul>
            </div>
            
            <div className="flex flex-row space-x-4 items-center justify-center">
  <button
    className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold text-lg shadow-lg hover:bg-blue-700 transform hover:scale-105 transition-all duration-300 animate-pulse"
    onClick={startGame}
  >
    Start
  </button>
  <button
    className="bg-red-600 text-white px-8 py-3 rounded-lg font-bold text-lg shadow-lg hover:bg-red-700 transform hover:scale-105 transition-all duration-300"
     onClick={exitGame1}
  >
    Exit
  </button>
</div>


            
          </div>
        </div>
      </div>
    );
  }

  // Countdown screen
 

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-4 flex flex-col items-center justify-center font-sans">
      {/* Container with confetti overlay */}
      <div className="relative w-full max-w-3xl">
        {/* Confetti container */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {renderConfetti()}
        </div>

        {/* Main content */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden relative z-10">
          {/* Header with title and progress */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 text-white">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-bold">Vocabulary Challenge</h1>
              <div className="flex items-center space-x-2">
                {!quizCompleted && (
                  <>
                    <div className="text-sm bg-white bg-opacity-20 px-3 py-1 rounded-full">
                      Q{currentQuestionIndex + 1}/{quizData.length}
                    </div>
                    <div className={`flex items-center justify-center rounded-full h-8 w-8 ${
                      timeLeft <= 5 ? 'bg-red-500 animate-pulse' : 'bg-blue-400'
                    }`}>
                      <span className="font-bold">{timeLeft}</span>
                    </div>
                  </>
                )}
                {/* Exit button */}
                <button 
                  onClick={exitGame}
                  className="ml-2 bg-red-600 hover:bg-red-700 text-white rounded-full h-8 w-8 flex items-center justify-center transition-colors"
                  title="Exit Game"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Progress bar */}
            {!quizCompleted && (
              <div className="mt-2 h-2 bg-white bg-opacity-20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-300 to-yellow-500 rounded-full transition-all duration-500"
                  style={{ width: `${((currentQuestionIndex) / quizData.length) * 100}%` }}
                ></div>
              </div>
            )}
          </div>

          {/* Quiz content */}
          <div className="p-4 relative">
            {!quizCompleted ? (
              <div className={`transition-opacity duration-300 ${animateQuestion ? 'opacity-100' : 'opacity-0'}`}>
                {/* Game stats */}
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center">
                    <div className="bg-yellow-100 text-yellow-800 font-bold px-3 py-1 rounded-full border-2 border-yellow-300 text-sm">
                      Score: {score}
                    </div>
                    {comboMultiplier > 1 && (
                      <div className="ml-2 bg-purple-100 text-purple-800 font-bold px-3 py-1 rounded-full border-2 border-purple-300 animate-pulse text-sm">
                        {comboMultiplier}x
                      </div>
                    )}
                  </div>
                  <div className="flex items-center">
                    <div className="bg-blue-100 text-blue-800 font-bold px-3 py-1 rounded-full border-2 border-blue-300 flex items-center text-sm">
                      <span className="mr-1">💡</span>
                      <span>{hintsRemaining}</span>
                    </div>
                    {hintsRemaining > 0 && selectedOption === null && isTimerActive && (
                      <button
                        onClick={handleShowHint}
                        className="ml-2 bg-blue-500 hover:bg-blue-600 text-white font-bold px-3 py-1 rounded-full transition-colors text-sm"
                      >
                        Hint
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Streak bonus alert */}
                {showStreakBonus && (
                  <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-2 rounded-lg shadow-lg animate-bounce-once z-20 text-sm">
                    <div className="font-bold">🔥 {streakCount} Streak! 🔥</div>
                    <div className="text-xs">{comboMultiplier}x multiplier!</div>
                  </div>
                )}
                
                {/* Points animation */}
                {pointAnimation.show && (
                  <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl font-bold text-green-500 animate-fly-up">
                    +{pointAnimation.points} pts
                  </div>
                )}
                
                {/* Question */}
                <div className="mb-4 bg-blue-50 p-3 rounded-xl shadow-sm">
                  <h2 className="text-lg text-gray-800 mb-2 font-bold">Fill in the blank:</h2>
                  <p className="text-base sm:text-lg">
                    {currentQuestion.sentence.split('_____').map((part, index, array) => (
                      <React.Fragment key={index}>
                        {part}
                        {index < array.length - 1 && (
                          <span className="inline-block w-16 sm:w-24 h-0.5 bg-blue-500 mx-1 align-middle animate-pulse"></span>
                        )}
                      </React.Fragment>
                    ))}
                  </p>
                </div>

                {/* Answer options */}
                <div className="space-y-2 relative">
                  {renderCharacter()}
                  
                  {currentQuestion.options.map((option, index) => {
                    // Determine if this option should be hidden due to hint
                    const hintOptions = getHintOptions();
                    const isHiddenByHint = showHint && hintOptions.includes(index);
                    
                    if (isHiddenByHint) {
                      return (
                        <div
                          key={index}
                          className="w-full p-3 rounded-xl bg-gray-200 opacity-50 text-center text-gray-500 text-sm"
                        >
                          Option eliminated by hint
                        </div>
                      );
                    }
                    
                    return (
                      <button
                        key={index}
                        onClick={() => handleOptionSelect(index)}
                        disabled={selectedOption !== null || !isTimerActive}
                        className={`w-full text-left p-3 rounded-xl transition-all duration-300 transform ${
                          selectedOption === null && isTimerActive
                            ? 'bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 hover:shadow-md hover:scale-102'
                            : selectedOption === index
                              ? index === currentQuestion.correctIndex
                                ? 'bg-gradient-to-r from-green-100 to-green-200 border-2 border-green-500 shadow-md scale-102'
                                : 'bg-gradient-to-r from-red-100 to-red-200 border-2 border-red-500 shadow-md scale-102'
                              : index === currentQuestion.correctIndex && selectedOption !== null
                                ? 'bg-gradient-to-r from-green-100 to-green-200 border-2 border-green-500 shadow-md scale-102'
                                : 'bg-gray-50 opacity-70'
                        }`}
                      >
                        <div className="flex items-center">
                          <span className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center mr-2 text-sm ${
                            selectedOption === null && isTimerActive
                              ? 'bg-blue-200 text-blue-700'
                              : selectedOption === index
                                ? index === currentQuestion.correctIndex
                                  ? 'bg-green-500 text-white'
                                  : 'bg-red-500 text-white'
                                : index === currentQuestion.correctIndex && selectedOption !== null
                                  ? 'bg-green-500 text-white'
                                  : 'bg-gray-200 text-gray-700'
                          }`}>
                            {String.fromCharCode(65 + index)}
                          </span>
                          <span className="text-base sm:text-lg">{option}</span>
                          
                          {/* Correct/incorrect icons */}
                          {selectedOption !== null && (
                            <span className="ml-auto">
                              {index === currentQuestion.correctIndex ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              ) : selectedOption === index ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              ) : null}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Time's up message */}
                {timeLeft === 0 && (
                  <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-3 rounded-r-lg animate-fade-in">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Time's Up!</h3>
                        <div className="mt-1 text-sm text-red-700">
                          The correct answer is: {currentQuestion.options[currentQuestion.correctIndex]}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Explanation for wrong answer */}
                {showExplanation && (
                  <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded-r-lg animate-fade-in">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">Explanation:</h3>
                        <div className="mt-1 text-xs sm:text-sm text-yellow-700">
                          {currentQuestion.explanation}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Next button appears after selection or time's up */}
                {(selectedOption !== null || timeLeft === 0) && (
                  <div className="mt-4 flex justify-center">
                    <button
                      onClick={handleNextQuestion}
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-2 px-6 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-300 ease-in-out"
                    >
                      {currentQuestionIndex < quizData.length - 1 ? 'Next Question' : 'See Results'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-4 text-center animate-fade-in">
                {/* Results */}
                <h2 className="text-2xl font-bold text-indigo-800 mb-3">Quiz Completed!</h2>
                <div className="text-lg text-gray-700 mb-4">
                  Your score: <span className="font-bold text-indigo-600">{score}</span> points
                </div>
                
                {/* Badge reward */}
                <div className="flex flex-col items-center justify-center mb-6">
                  {renderBadge()}
                  <div className="mt-4 text-lg font-medium text-purple-700">
                    {getRewardMessage()}
                  </div>
                </div>

                {/* Statistics */}
                <div className="bg-blue-50 rounded-xl p-3 max-w-md mx-auto mb-4 text-sm">
                  <h3 className="font-bold text-blue-800 mb-2">Your Stats</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-2 rounded-lg">
                      <div className="text-xs text-gray-600">Correct Answers</div>
                      <div className="text-lg font-bold text-green-600">
                        {answeredQuestions.filter(q => 
                          quizData[q].correctIndex === 
                          (selectedOption === -1 ? -1 : quizData[q].correctIndex)
                        ).length}
                      </div>
                    </div>
                    <div className="bg-white p-2 rounded-lg">
                      <div className="text-xs text-gray-600">Longest Streak</div>
                      <div className="text-lg font-bold text-purple-600">
                        {streakCount}
                      </div>
                    </div>
                    <div className="bg-white p-2 rounded-lg">
                      <div className="text-xs text-gray-600">Hints Used</div>
                      <div className="text-lg font-bold text-blue-600">
                        {3 - hintsRemaining}
                      </div>
                    </div>
                    <div className="bg-white p-2 rounded-lg">
                      <div className="text-xs text-gray-600">Max Multiplier</div>
                      <div className="text-lg font-bold text-yellow-600">
                        {comboMultiplier}x
                      </div>
                    </div>
                  </div>
                </div>

                {/* Retry button */}
                <button
                  onClick={handleResetQuiz}
                  className="mt-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-2 px-6 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-300 ease-in-out"
                >
                  Play Again
                </button>
              </div>
            )}
          </div>

          {/* Footer with progress dots */}
          <div className="bg-gray-50 border-t border-gray-100 px-4 py-2">
            <div className="flex justify-center items-center">
              {/* Dots for each question (filled if answered) */}
              <div className="flex space-x-1">
                {quizData.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      answeredQuestions.includes(index)
                        ? quizData[index].correctIndex === 
                          (selectedOption === -1 ? -1 : quizData[index].correctIndex)
                          ? 'bg-green-500'
                          : 'bg-red-500'
                        : index === currentQuestionIndex && !quizCompleted
                          ? 'bg-yellow-400 animate-pulse'
                          : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fall {
          0% { transform: translateY(-10vh) rotate(0deg); }
          100% { transform: translateY(100vh) rotate(720deg); }
        }
        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        .animate-bounce-slow {
          animation: bounce 2s infinite;
        }
        .animate-bounce-once {
          animation: bounce 1s ease-in-out;
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-in-out;
        }
        .animate-fly-up {
          animation: fly-up 1.5s ease-out forwards;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(-5%); }
          50% { transform: translateY(0); }
        }
        @keyframes fly-up {
          0% { opacity: 0; transform: translate(-50%, 0); }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { opacity: 0; transform: translate(-50%, -100px); }
        }
        .scale-102 {
          transform: scale(1.02);
        }
      `}</style>
      
      {/* Audio elements for sounds */}
      <audio ref={correctSoundRef} />
      <audio ref={wrongSoundRef} />
      <audio ref={timerSoundRef} />
      <audio ref={countdownSoundRef} />
      <audio ref={completionSoundRef} />
      <audio ref={clickSoundRef} />
      <audio ref={hintSoundRef} />
      <audio ref={streakSoundRef} />
    </div>
  );
};

export default VocabularyQuizGame;