import React, { useState, useEffect, useRef } from 'react';
import { Play, Moon, Sun, Volume2, VolumeX } from 'lucide-react';

// Sound files (in a real application, you'd import or link to actual sound files)
const SOUNDS = {
  countdown: '/sounds/countdown.mp3',
  correctGuess: '/sounds/correct.mp3',
  skipWord: '/sounds/skip.mp3',
  gameStart: '/sounds/start.mp3',
  gameOver: '/sounds/gameover.mp3',
  tick: '/sounds/tick.mp3'
};

const TabooVocabularyGame = () => {
  const [gameState, setGameState] = useState('countdown');
  const [countdown, setCountdown] = useState(3);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentWord, setCurrentWord] = useState(null);
  const [tabooWords, setTabooWords] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [score, setScore] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  // Audio refs for each sound
  const audioRefs = {
    countdown: useRef(null),
    correctGuess: useRef(null),
    skipWord: useRef(null),
    gameStart: useRef(null),
    gameOver: useRef(null),
    tick: useRef(null)
  };

  // Vocabulary data with words, meanings, and taboo words
  const vocabularyData = [
    {
      word: 'Adventure',
      meaning: 'An exciting experience or journey',
      tabooWords: ['Travel', 'Explore', 'Exciting', 'Journey']
    },
    {
      word: 'Brilliant',
      meaning: 'Very intelligent or talented',
      tabooWords: ['Smart', 'Clever', 'Intelligent', 'Genius']
    },
    {
      word: 'Communicate',
      meaning: 'To share or exchange information',
      tabooWords: ['Talk', 'Speak', 'Tell', 'Share']
    }
  ];

  // Play sound function with mute check
  const playSound = (soundKey) => {
    if (!isMuted && audioRefs[soundKey].current) {
      audioRefs[soundKey].current.currentTime = 0;
      audioRefs[soundKey].current.play().catch(error => {
        console.log('Audio play failed:', error);
      });
    }
  };

  // Countdown logic
  useEffect(() => {
    if (gameState === 'countdown' && countdown > 0) {
      playSound('tick');
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      startGame();
    }
  }, [countdown, gameState]);

  // Game timer logic
  useEffect(() => {
    let timer;
    if (gameState === 'playing' && timeRemaining > 0) {
      timer = setTimeout(() => {
        if (timeRemaining <= 10) playSound('tick');
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      endGame();
    }
    return () => clearTimeout(timer);
  }, [timeRemaining, gameState]);

  const startGame = () => {
    playSound('gameStart');
    setGameState('playing');
    selectNextWord();
  };

  const selectNextWord = () => {
    const randomWord = vocabularyData[Math.floor(Math.random() * vocabularyData.length)];
    setCurrentWord(randomWord);
    setTabooWords(randomWord.tabooWords);
  };

  const endGame = () => {
    playSound('gameOver');
    setGameState('gameOver');
  };

  const handleCorrectGuess = () => {
    playSound('correctGuess');
    setScore(score + 1);
    selectNextWord();
  };

  const handleSkipWord = () => {
    playSound('skipWord');
    selectNextWord();
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const renderCountdownScreen = () => (
    <div className={`
      flex items-center justify-center h-screen text-9xl font-bold 
      ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'}
    `}>
      {countdown > 0 ? countdown : 'Start!'}

      {/* Hidden Audio Elements */}
      {Object.entries(SOUNDS).map(([key, src]) => (
        <audio 
          key={key} 
          ref={audioRefs[key]} 
          src={src} 
          preload="auto"
        />
      ))}
    </div>
  );

  const renderGameScreen = () => (
    <div className={`
      min-h-screen p-6 
      ${isDarkMode 
        ? 'bg-gray-900 text-white' 
        : 'bg-white text-black'
      }
    `}>
      {/* Audio Elements */}
      {Object.entries(SOUNDS).map(([key, src]) => (
        <audio 
          key={key} 
          ref={audioRefs[key]} 
          src={src} 
          preload="auto"
        />
      ))}

      {/* Mode Toggles */}
      <div className="absolute top-4 right-4 flex space-x-2">
        {/* Dark/Light Mode Toggle */}
        <button 
          onClick={toggleDarkMode} 
          className={`
            p-2 rounded-full
            ${isDarkMode 
              ? 'bg-gray-700 text-white hover:bg-gray-600' 
              : 'bg-gray-200 text-black hover:bg-gray-300'
            }
          `}
        >
          {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
        </button>

        {/* Mute Toggle */}
        <button 
          onClick={toggleMute} 
          className={`
            p-2 rounded-full
            ${isDarkMode 
              ? 'bg-gray-700 text-white hover:bg-gray-600' 
              : 'bg-gray-200 text-black hover:bg-gray-300'
            }
          `}
        >
          {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
        </button>
      </div>

      {/* Game Info */}
      <div className="flex justify-between mb-8">
        <div>Score: {score}</div>
        <div>Time: {timeRemaining}s</div>
      </div>

      {/* Current Word Card */}
      <div className={`
        p-6 rounded-lg shadow-lg text-center 
        ${isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-gray-100 border-gray-200'
        }
      `}>
        <h2 className="text-4xl font-bold mb-4">{currentWord.word}</h2>
        <p className="text-xl mb-6">{currentWord.meaning}</p>

        {/* Taboo Words */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          {tabooWords.map((tabooWord, index) => (
            <div 
              key={index} 
              className={`
                p-3 rounded-lg 
                ${isDarkMode 
                  ? 'bg-gray-700 text-gray-300' 
                  : 'bg-gray-200 text-gray-700'
                }
              `}
            >
              {tabooWord}
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center mt-8 space-x-4">
        <button 
          onClick={handleCorrectGuess}
          className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600"
        >
          Correct
        </button>
        <button 
          onClick={handleSkipWord}
          className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600"
        >
          Skip
        </button>
      </div>
    </div>
  );

  const renderGameOverScreen = () => (
    <div className={`
      flex flex-col items-center justify-center h-screen 
      ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'}
    `}>
      {/* Audio Elements */}
      {Object.entries(SOUNDS).map(([key, src]) => (
        <audio 
          key={key} 
          ref={audioRefs[key]} 
          src={src} 
          preload="auto"
        />
      ))}

      <h1 className="text-5xl font-bold mb-6">Game Over!</h1>
      <p className="text-2xl mb-4">Your Score: {score}</p>
      <button 
        onClick={() => {
          playSound('gameStart');
          setGameState('countdown');
          setCountdown(3);
          setScore(0);
          setTimeRemaining(60);
        }}
        className={`
          px-6 py-3 rounded-lg 
          ${isDarkMode 
            ? 'bg-blue-700 text-white hover:bg-blue-600' 
            : 'bg-blue-500 text-white hover:bg-blue-600'
          }
        `}
      >
        Play Again
      </button>
    </div>
  );

  return (
    <>
      {gameState === 'countdown' && renderCountdownScreen()}
      {gameState === 'playing' && renderGameScreen()}
      {gameState === 'gameOver' && renderGameOverScreen()}
    </>
  );
};

export default TabooVocabularyGame;