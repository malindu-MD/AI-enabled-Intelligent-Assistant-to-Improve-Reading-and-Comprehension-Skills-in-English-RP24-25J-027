import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'


const GameSelectionDashboard = () => {
  const [selectedGame, setSelectedGame] = useState(null);
  const navigate = useNavigate();

  const gameTypes = [
    {
      id: 'chess',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 stroke-current" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
        </svg>
      ),
      title: 'SpellMaster',
      description: 'Outsmart opponents with calculated moves',
      gradient: 'from-blue-500 to-indigo-600',
      background: 'bg-gradient-to-br from-blue-50 to-indigo-100',
      textColor: 'text-blue-900',
      route: '/word-association'
    },
    {
      id: 'rpg',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 stroke-current" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 15l-2-1m0 0l2-1m-2 1v2.5M12 3l2 1m-2-1v2.5" />
        </svg>
      ),
      title: 'Word Association game ',
      description: 'Immerse yourself in rich, character-driven worlds',
      gradient: 'from-green-500 to-teal-600',
      background: 'bg-gradient-to-br from-green-50 to-teal-100',
      textColor: 'text-green-900',
      route: '/word-association'
    },
    {
      id: 'trivia',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 stroke-current" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.764.133-1.994.393-1.994 1.093 0 .969 1.908 1 2 1M12 17h.01M12 3v.01M5 19l2-2 2 2 2-2 2 2 2-2 2 2 2-2 2 2L21 5H3l2 2" />
        </svg>
      ),
      title: 'Taboo Chat',
      description: 'Test your wit with challenging trivia challenges',
      gradient: 'from-purple-500 to-pink-600',
      background: 'bg-gradient-to-br from-purple-50 to-pink-100',
      textColor: 'text-purple-900',
      route: '/taboo'
    }
  ];

  const handleGameSelection = (gameId) => {
    const selectedGameRoute = gameTypes.find(g => g.id === gameId)?.route;
    if (selectedGameRoute) {
      navigate(selectedGameRoute);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white shadow-2xl rounded-3xl overflow-hidden transform transition-all duration-500 hover:scale-[1.02]">
        {/* Animated Header */}
        <div className="p-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-gradient-to-r from-indigo-800 via-purple-800 to-pink-800 animate-pulse"></div>
          <h1 className="text-4xl font-extrabold text-white text-center relative z-10 tracking-tight">
          The Path to Mastery Your Vocabulary Journey
          </h1>
          <p className="text-center text-white/80 mt-2 relative z-10">
            Choose your path and begin your adventure
          </p>
        </div>

        {/* Game Selection Grid */}
        <div className="p-8 grid md:grid-cols-3 gap-8">
          {gameTypes.map((game) => (
            <div 
              key={game.id}
              onClick={() => {
                setSelectedGame(game.id);
                handleGameSelection(game.id);
              }}
              className={`
                ${game.background}
                border-2 border-transparent 
                ${selectedGame === game.id 
                  ? `border-2 border-opacity-80 border-white shadow-2xl scale-105 ${game.gradient}` 
                  : 'hover:border-gray-200 hover:shadow-xl'}
                transition-all duration-500 
                rounded-2xl 
                p-6 
                text-center 
                cursor-pointer 
                transform 
                relative
                group
                overflow-hidden
              `}
            >
              {/* Gradient Overlay */}
              <div className={`
                absolute inset-0 opacity-10 
                ${selectedGame === game.id ? game.gradient : ''}
              `}></div>

              {/* Icon and Content */}
              <div className="relative z-10">
                <div className="flex justify-center mb-5">
                  <div className={`
                    p-4 rounded-full mb-4 
                    transition-all duration-500
                    ${selectedGame === game.id 
                      ? `${game.gradient} text-white shadow-2xl` 
                      : 'bg-white shadow-lg'}
                  `}>
                    {game.icon}
                  </div>
                </div>
                <h2 className={`text-2xl font-bold mb-3 ${game.textColor}`}>
                  {game.title}
                </h2>
                <p className="text-gray-600 mb-4 text-sm">
                  {game.description}
                </p>
                {selectedGame === game.id && (
                  <div className="absolute top-4 right-4 text-white bg-white/20 rounded-full p-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameSelectionDashboard;