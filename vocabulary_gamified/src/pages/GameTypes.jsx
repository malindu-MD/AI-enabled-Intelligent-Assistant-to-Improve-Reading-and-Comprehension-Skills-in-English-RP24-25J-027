import React from 'react';
import { Play } from 'lucide-react';

// Game data with images (using placeholders)
const games = [
  {
    id: 1,
    name: "Quiz Master",
    description: "Test your knowledge across various categories and challenge your intellect!",
    imageUrl: "/api/placeholder/400/250?text=Quiz+Game"
  },
  {
    id: 2, 
    name: "Memory Challenge", 
    description: "Train your brain with our memory matching game. How good is your recall?",
    imageUrl: "/api/placeholder/400/250?text=Memory+Game"
  },
  {
    id: 3,
    name: "Speed Typing", 
    description: "Improve your typing skills and race against the clock in this fast-paced typing challenge!",
    imageUrl: "/api/placeholder/400/250?text=Typing+Game"
  }
];

const GameTypes = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">Choose Your Game</h1>
      
      <div className="flex overflow-x-auto space-x-6 w-full max-w-6xl pb-4">
        {games.map((game) => (
          <div 
            key={game.id} 
            className="flex-shrink-0 w-80 bg-white rounded-xl shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-xl"
          >
            <img 
              src={game.imageUrl} 
              alt={game.name} 
              className="w-full h-48 object-cover"
            />
            
            <div className="p-5">
              <h2 className="text-2xl font-semibold mb-3 text-gray-800">{game.name}</h2>
              <p className="text-gray-600 mb-4 h-20 overflow-hidden">{game.description}</p>
              
              <button 
                className="w-full flex items-center justify-center bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Play className="mr-2" />
                Play Now
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Scroll hint for horizontal scrolling */}
      <div className="mt-4 text-gray-500 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
        Scroll to see more games
      </div>
    </div>
  );
};

export default GameTypes;