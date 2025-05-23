import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'
import { Check, X, Search, Plus, Home, BookOpen, Settings } from 'lucide-react';

const VocabularyDashboard = () => {


  const navigate = useNavigate()

  const handleClick = () => {
    // Navigate to the 'game-selection' route when the button is clicked
    navigate('/game-selection')
  }

  // Sample data
  const [data, setData] = useState([
    {
      word: 'Apple',
      translation: 'Apple',
      category: 'Apple',
      progress: 100
    },
    {
      word: 'Banana',
      translation: 'Банан',
      category: 'Fruit',
      progress: 75
    },
    {
      word: 'Cheetah',
      translation: 'Гепард',
      category: 'Animal',
      progress: 50
    },
    {
      word: 'Dog',
      translation: 'Собака',
      category: 'Animal',
      progress: 90
    },
    {
      word: 'Elephant',
      translation: 'Слон',
      category: 'Animal',
      progress: 25
    }
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeNav, setActiveNav] = useState('words');

  // Function to render progress icon
  const ProgressIcon = ({ progress }) => {
    if (progress === 100) {
      return <Check className="text-green-500 w-5 h-5" />;
    } else if (progress > 50) {
      return <Check className="text-yellow-500 w-5 h-5" />;
    } else {
      return <X className="text-red-500 w-5 h-5" />;
    }
  };

  const NavItem = ({ icon: Icon, label, active, onClick }) => (
    <button 
      className={`flex flex-col items-center justify-center py-2 px-4 
        ${active ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-100'}
        transition-colors duration-200 rounded-lg`}
      onClick={onClick}
    >
      <Icon className="w-6 h-6 mb-1" />
      <span className="text-xs">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="text-2xl font-bold text-gray-800">Vocabulary Learning </div>
          <div className="flex space-x-4">
            <NavItem 
              icon={Home} 
              label="Home" 
              active={activeNav === 'home'}
              onClick={() => setActiveNav('home')}
            />
            <NavItem 
              icon={BookOpen} 
              label="Words" 
              active={activeNav === 'words'}
              onClick={() => setActiveNav('words')}
            />
            <NavItem 
              icon={() => (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                  <line x1="8" y1="21" x2="16" y2="21"></line>
                  <line x1="12" y1="17" x2="12" y2="21"></line>
                </svg>
              )} 
              label="Games" 
              active={activeNav === 'games'}
              onClick={() => setActiveNav('games')}
            />
            <NavItem 
              icon={Settings} 
              label="Settings" 
              active={activeNav === 'settings'}
              onClick={() => setActiveNav('settings')}
            />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="w-full max-w-4xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-4 bg-gray-50 border-b">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Word Information</h2>
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative flex-grow max-w-xs">
                <input
                  type="text"
                  placeholder="Find the word"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
              <button className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors">
                <Plus className="w-5 h-5" />
                <span>Add Word</span>
              </button>
              <button       onClick={handleClick} className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-gray-300 transition-colors">
                Play Games →
              </button>
            </div>
          </div>
          <div className="overflow-x-auto flex justify-center">
          <table className="w-full max-w-4xl text-center">
    <thead className="bg-gray-100">
      <tr>
        <th className="p-3 border-b font-semibold text-gray-600">Word</th>
        <th className="p-3 border-b font-semibold text-gray-600">Translation</th>
        <th className="p-3 border-b font-semibold text-gray-600">Category</th>
        <th className="p-3 border-b font-semibold text-gray-600">Progress</th>
      </tr>
    </thead>
    <tbody>
      {data
        .filter((item) => item.word.toLowerCase().includes(searchTerm.toLowerCase()))
        .map((item, index) => (
          <tr 
            key={index} 
            className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors`}
          >
            <td className="p-3 border-b text-gray-800">{item.word}</td>
            <td className="p-3 border-b text-gray-600">{item.translation}</td>
            <td className="p-3 border-b text-gray-600">{item.category}</td>
            <td className="p-3 border-b">
              <div className="flex items-center justify-center space-x-2">
                <div className="relative size-20">
                  <svg className="size-full -rotate-90" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="18" cy="18" r="16" fill="none" className="stroke-current text-gray-200 dark:text-neutral-700" strokeWidth="3"></circle>
                    <circle cx="18" cy="18" r="16" fill="none" className="stroke-current text-blue-600 dark:text-blue-500" strokeWidth="3" strokeDasharray="100" strokeDashoffset="65" strokeLinecap="round"></circle>
                  </svg>
                  <div className="absolute top-1/2 start-1/2 transform -translate-y-1/2 -translate-x-1/2">
                    <span className="text-center text-xl font-bold text-blue-600 dark:text-blue-500">{item.progress}%</span>
                  </div>
                </div>
              </div>
            </td>
          </tr>
        ))}
    </tbody>
  </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VocabularyDashboard;
