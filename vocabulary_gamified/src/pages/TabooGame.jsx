import React, { useState, useRef, useEffect } from 'react';
import { Send, RefreshCw, LightbulbIcon, CheckCircle2, Moon, Sun, Info } from 'lucide-react';

const TabooGame = () => {
  // Game state
  const [messages, setMessages] = useState([
    { id: 1, user: 'System', text: 'Welcome to Taboo! Try to describe the word without using any taboo words.', isSystem: true }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [currentWord, setCurrentWord] = useState(null);
  const [tabooWords, setTabooWords] = useState([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameActive, setGameActive] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [countdown, setCountdown] = useState(0);
  
  // New states for word popup and progress
  const [showWordPopup, setShowWordPopup] = useState(false);
  const [wordPopupTimer, setWordPopupTimer] = useState(3);
  const [wordProgressTimer, setWordProgressTimer] = useState(0);

  // Vocabulary database with expanded details
  const vocabularyDatabase = [
    {
      word: 'Mountain',
      tabooWords: ['hill', 'climb', 'high', 'peak'],
      description: 'A large natural elevation of the earth\'s surface rising abruptly from the surrounding level.',
      systemResponses: [
        "Hmm, interesting description! Keep going, you're on the right track.",
        "Nice start! Try to be more specific about its characteristics.",
        "You're describing something big and natural, but can you be more precise?",
        "Good clues, but can you tell me more about its shape or terrain?"
      ]
    },
    {
      word: 'Ocean',
      tabooWords: ['water', 'sea', 'blue', 'swim'],
      description: 'A very large expanse of sea, typically dividing continents.',
      systemResponses: [
        "Intriguing description! You're getting closer.",
        "Think about its global significance and massive scale.",
        "Good hints! What makes this large body different from other water bodies?",
        "You're describing something vast, but can you elaborate more?"
      ]
    },
    {
      word: 'Computer',
      tabooWords: ['laptop', 'screen', 'type', 'device'],
      description: 'An electronic machine that can store and process data.',
      systemResponses: [
        "Interesting clues! You're on the right path.",
        "Think about its primary function in modern life.",
        "Good start! What does this machine help people do?",
        "You're describing a technological tool, keep exploring its purpose!"
      ]
    },
    {
      word: 'Pizza',
      tabooWords: ['food', 'eat', 'slice', 'cheese'],
      description: 'A savory dish originating from Italy, consisting of a round, flat base of dough topped with tomato sauce, cheese, and various ingredients.',
      systemResponses: [
        "Yummy description! You're getting closer.",
        "Think about its origin and what makes it unique.",
        "Good hints about its shape and components!",
        "You're describing a delicious dish, keep going!"
      ]
    },
    {
      word: 'Guitar',
      tabooWords: ['music', 'play', 'strings', 'instrument'],
      description: 'A musical instrument with six strings, typically played by strumming or plucking with fingers or a pick.',
      systemResponses: [
        "Melodious description! You're on the right track.",
        "Think about its shape and how it produces sound.",
        "Good clues about its physical characteristics!",
        "You're describing something musical, keep exploring!"
      ]
    }
  ];

  const messagesEndRef = useRef(null);
  const timerRef = useRef(null);
  const countdownRef = useRef(null);
  const wordPopupTimerRef = useRef(null);

  // Simulated user context
  const currentUser = {
    id: 2,
    username: 'Player'
  };

  // Generate a random system response
  const generateSystemResponse = (word) => {
    const wordData = vocabularyDatabase.find(item => item.word === word);
    const responses = wordData ? wordData.systemResponses : [];
    return responses.length > 0 
      ? responses[Math.floor(Math.random() * responses.length)]
      : "Interesting description! Keep trying.";
  };

  // Countdown effect
 // Countdown effect
const startCountdown = () => {
    setCountdown(3);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (prev === 1) {
            // Display 'Start' after countdown reaches 1
            setCountdown("Start");
            setTimeout(() => {
              setCountdown(0);
              startNewRound();
            }, 1000); // Show "Start" for 1 second
          }
          return "Start"; // Prevent further countdown
        }
        return prev - 1;
      });
    }, 1000);
  };
  

  // Start a new round
  const startNewRound = () => {
    const randomWord = vocabularyDatabase[Math.floor(Math.random() * vocabularyDatabase.length)];
    setCurrentWord(randomWord.word);
    setTabooWords(randomWord.tabooWords);
    setTimeLeft(60);
    setGameActive(true);
    setWordProgressTimer(0);

    // Show word popup
    setShowWordPopup(true);
    setWordPopupTimer(3);
    wordPopupTimerRef.current = setInterval(() => {
      setWordPopupTimer((prev) => {
        if (prev <= 1) {
          clearInterval(wordPopupTimerRef.current);
          setShowWordPopup(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Start timer
    timerRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        // Increment word progress timer
        setWordProgressTimer(current => current + 1);

        if (prevTime <= 1) {
          clearInterval(timerRef.current);
          setGameActive(false);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    // Add system message about the new round
    setMessages(prev => [
      ...prev, 
      { 
        id: prev.length + 1, 
        user: 'System', 
        text: `New word! Describe: ${randomWord.word}\nDon't use these words: ${randomWord.tabooWords.join(', ')}`, 
        isSystem: true 
      }
    ]);
  };

  // Send message and check for correct guess
  const sendMessage = () => {
    if (inputMessage.trim() === '') return;

    const newMessage = {
      id: messages.length + 1,
      user: currentUser.username,
      text: inputMessage,
      timestamp: new Date().toLocaleTimeString()
    };

    // Check if the message correctly guesses the word
    const isCorrectGuess = inputMessage.toLowerCase().includes(currentWord.toLowerCase());
    const containsTabooWord = tabooWords.some(word => 
      inputMessage.toLowerCase().includes(word.toLowerCase())
    );

    // Add player's message
    setMessages(prev => [...prev, newMessage]);

    if (isCorrectGuess && !containsTabooWord) {
      // Add system congratulatory message
      const congratsMessage = {
        id: messages.length + 2,
        user: 'System',
        text: `🎉 Correct! The word was ${currentWord}. +1 point!`,
        isSystem: true
      };

      // Add system description message
      const wordDescriptionMessage = {
        id: messages.length + 3,
        user: 'System',
        text: `Description: ${
          vocabularyDatabase.find(item => item.word === currentWord).description
        }`,
        isSystem: true
      };

      // Update messages with system messages
      setMessages(prev => [...prev, congratsMessage, wordDescriptionMessage]);

      // Increment score
      setScore(prev => prev + 1);
      
      // Clear current timer
      clearInterval(timerRef.current);

      // Start a short pause before new round
      setTimeout(() => {
        startNewRound();
      }, 2000); // 2-second pause to read system messages
    } else if (containsTabooWord) {
      // Add system message about taboo word
      const tabooMessage = {
        id: messages.length + 2,
        user: 'System',
        text: 'Oops! You used a taboo word. Try again without those words.',
        isSystem: true
      };

      setMessages(prev => [...prev, tabooMessage]);
    } else {
      // Add system response to the description
      const systemResponseMessage = {
        id: messages.length + 2,
        user: 'System',
        text: generateSystemResponse(currentWord),
        isSystem: true
      };

      setMessages(prev => [...prev, systemResponseMessage]);
    }

    setInputMessage('');
  };

  // Handle enter key for sending messages
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  // Auto-scroll and game initialization
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
      if (wordPopupTimerRef.current) {
        clearInterval(wordPopupTimerRef.current);
      }
    };
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Conditional classes for dark mode
  const bgBase = darkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900';
  const headerBg = darkMode ? 'bg-blue-800' : 'bg-blue-500';
  const systemMsgBg = darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-700';
  const inputBg = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300';

  if (countdown > 0 && countdown !== "Start") {
    return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center ${bgBase} transition-colors`}>
        <div className="text-9xl font-bold animate-bounce">
          {countdown === 3 ? '3' : countdown === 2 ? '2' : '1'}
        </div>
      </div>
    );
  }
  
  // Show 'Start' word after countdown
  if (countdown === "Start") {
    return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center ${bgBase} transition-colors`}>
        <div className="text-9xl font-bold animate-pulse text-yellow-500">
          Start
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 flex flex-col ${bgBase} transition-colors`}>
      {/* Word Popup */}
      {showWordPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className={`
            p-6 rounded-lg shadow-xl text-center 
            ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}
          `}>
            <h2 className="text-3xl font-bold mb-4">Your Word</h2>
            <p className="text-5xl font-extrabold text-blue-600 mb-4">{currentWord}</p>
            <p className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Popup closes in {wordPopupTimer} second{wordPopupTimer !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      )}

<div className={`${headerBg} p-3 border-b rounded-t-lg text-white flex justify-between items-center`}>
  <h2 className="text-lg font-semibold">Taboo Vocabulary Game</h2>
  <div className="flex items-center space-x-4">
    {/* Dark Mode Toggle */}
    <button 
      onClick={toggleDarkMode}
      className="hover:bg-opacity-50 p-1 rounded-full transition"
    >
      {darkMode ? <Sun size={20} /> : <Moon size={20} />}
    </button>
    
    {/* Score */}
    <div className="flex items-center space-x-2 bg-green-700 px-3 py-1 rounded-full shadow-lg">
      <CheckCircle2 className="text-white" size={18} />
      <span className="text-white font-semibold">Score:</span>
      <span className="text-lg font-bold text-yellow-300">{score}</span>
    </div>

    {/* Exit Button */}
    <button
      onClick={() => {
        if (window.confirm('Are you sure you want to exit the game?')) {
          // Add logic to exit the game or reset the state here
          setGameActive(false); // Deactivate the game
          setMessages([
            { id: 1, user: 'System', text: 'Game Over! Thanks for playing.', isSystem: true }
          ]); // Optional: Show a game over message
        }
      }}
      className="hover:bg-opacity-50 p-2 rounded-full bg-red-500 text-white transition"
    >
      Exit
    </button>
  </div>
</div>



      {/* Progress Bar for Word Timer */}
      <div className="h-2 w-full bg-gray-200 dark:bg-gray-700">
        <div 
          className="h-2 bg-amber-300" 
          style={{ 
            width: `${(wordProgressTimer / 20) * 100}%`, 
            transition: 'width 0.5s linear' 
          }}
        />
      </div>

      {/* Timer and Game Control */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-100'} p-2 flex justify-between items-center`}>
        <div className={`text-slate-100 ${darkMode ? 'text-gray-300' : 'text-gray-600'} flex items-center`}>
          <LightbulbIcon className="mr-2 text-yellow-500" size={18} />
          Time Left: {timeLeft}s
        </div>
        {!gameActive && (
          <button 
            onClick={startCountdown}
            className={`
              ${darkMode 
                ? 'bg-green-700 hover:bg-green-600' 
                : 'bg-green-500 hover:bg-green-600'
              } 
              text-white px-3 py-1 rounded flex items-center
            `}
          >
            <RefreshCw className="mr-2" size={16} />
            Start Game
          </button>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-grow overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex flex-col ${
              msg.isSystem 
                ? 'items-center text-gray-500 italic' 
                : msg.user === currentUser.username 
                  ? 'items-end' 
                  : 'items-start'
            }`}
          >
            {!msg.isSystem && (
              <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mb-1`}>
                {msg.user}
              </span>
            )}
            <div 
              className={`
                p-2 rounded-lg max-w-[80%]
                ${msg.isSystem 
                  ? systemMsgBg
                  : msg.user === currentUser.username 
                    ? `${darkMode ? 'bg-blue-800' : 'bg-blue-500'} text-white` 
                    : `${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`
                }
              `}
            >
              {msg.text}
            </div>
            {!msg.isSystem && (
              <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                {msg.timestamp}
              </span>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className={`p-3 border-t flex items-center ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
        <input 
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={gameActive ? "Describe the word..." : "Start a new game"}
          disabled={!gameActive}
          className={`
            flex-grow p-2 border rounded-l-lg focus:outline-none focus:ring-2 
            ${inputBg}
            ${darkMode 
              ? 'focus:ring-blue-600 text-gray-100 placeholder-gray-500' 
              : 'focus:ring-blue-500'}
            disabled:bg-gray-100
          `}
        />
        <button 
          onClick={sendMessage}
          disabled={!gameActive}
          className={`
            ${gameActive 
              ? (darkMode 
                  ? 'bg-blue-800 hover:bg-blue-700' 
                  : 'bg-blue-500 hover:bg-blue-600') 
              : 'bg-gray-300'
            } 
            text-white p-2 rounded-r-lg transition
          `}
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );

}


export default TabooGame;