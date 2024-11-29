import React, { useState } from 'react';

const GameSelectionDashboard = () => {
  const [selectedGame, setSelectedGame] = useState(null);

  const gameTypes = [
    {
      id: 'strategy',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 stroke-current" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 01-4.105-4.031l-.546-2.387a2 2 0 00-.554-1.022L9.732 4.732l-2.122 2.122a1 1 0 00-.293.707V12h-2V6.414a1 1 0 01.293-.707L9.732 2.585a2 2 0 011.022-.554l2.387-.546a6 6 0 014.105 4.032l.546 2.386a2 2 0 00.554 1.022l2.122 2.121-2.122 2.122a2 2 0 00-.553 1.021l.546 2.387a6 6 0 01-4.032 4.105l-2.386.546a2 2 0 01-1.022.554l-2.121-2.122-2.122 2.122a1 1 0 01-.707.293H4v-2h5.586a1 1 0 00.707-.293l2.122-2.122z" />
        </svg>
      ),
      title: 'Strategic Conquest',
      description: 'Master complex scenarios and outsmart opponents',
      gradient: 'from-blue-500 to-indigo-600',
      background: 'bg-gradient-to-br from-blue-50 to-indigo-100',
      textColor: 'text-blue-900'
    },
    {
      id: 'adventure',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 stroke-current" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m3.343-5.657L5.929 5.929m12.728 12.728L18.071 18.07M7.05 7.05l-1.414-1.414m12.728 12.728l1.414 1.414M7.757 16.243a4 4 0 01-1.207-2.657 4 4 0 014-4h4a4 4 0 014 4 4 4 0 01-1.207 2.657" />
        </svg>
      ),
      title: 'Epic Odyssey',
      description: 'Embark on legendary journeys and explore vast worlds',
      gradient: 'from-green-500 to-teal-600',
      background: 'bg-gradient-to-br from-green-50 to-teal-100',
      textColor: 'text-green-900'
    },
    {
      id: 'puzzle',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 stroke-current" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.445.29-3.5.804v10A7.969 7.969 0 015.5 14c1.255 0 2.445.29 3.5.804V4.804zM7.5 14a7.964 7.964 0 00-3 .804V4.804A7.968 7.968 0 017.5 4c1.255 0 2.445.29 3.5.804v10A7.969 7.969 0 007.5 14zm5-10a7.968 7.968 0 013.5-.804c1.255 0 2.445.29 3.5.804v10a7.969 7.969 0 00-3.5-.804c-1.255 0-2.445.29-3.5.804V4.804z" />
        </svg>
      ),
      title: 'Mind Maze',
      description: 'Challenge your intellect with intricate puzzles',
      gradient: 'from-purple-500 to-pink-600',
      background: 'bg-gradient-to-br from-purple-50 to-pink-100',
      textColor: 'text-purple-900'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white shadow-2xl rounded-3xl overflow-hidden transform transition-all duration-500 hover:scale-[1.02]">
        {/* Animated Header */}
        <div className="p-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-gradient-to-r from-indigo-800 via-purple-800 to-pink-800 animate-pulse"></div>
          <h1 className="text-4xl font-extrabold text-white text-center relative z-10 tracking-tight">
            Unlock Your Gaming Destiny
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
              onClick={() => setSelectedGame(game.id)}
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

        {/* Start Game Section */}
        {selectedGame && (
          <div className="p-8 bg-gray-50 text-center">
            <button 
              className="
                bg-gradient-to-r from-indigo-600 to-purple-600
                text-white 
                px-8 
                py-4 
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
              onClick={() => alert(`Launching ${gameTypes.find(g => g.id === selectedGame).title}`)}
            >
              Begin Your Quest
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameSelectionDashboard;