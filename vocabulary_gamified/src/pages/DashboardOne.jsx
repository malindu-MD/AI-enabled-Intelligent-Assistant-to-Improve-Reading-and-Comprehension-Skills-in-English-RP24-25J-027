import React, { useEffect, useState } from 'react';
import { useUser } from '../components/UserContext';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import VocabularyAnalyzer from './VocabularyAnalyzer';
import ContextualVocabularyForm from './ContextualVocabularyForm';
import { Link,useNavigate  } from "react-router-dom";



const DashboardOne = () => {
  // Student data - would come from a database in a real app

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);
  const [gameActive, setGameActive] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [showAddWord, setShowAddWord] = useState(false);
  const [newWord, setNewWord] = useState({ word: "", definition: "", category: "academic" });
  const {user,setUser}=useUser();
  const navigate = useNavigate();

  const handleGameClick = (game) => {
    setSelectedGame(game.id);
    navigate(`${game.link}`); // Redirects to the game page
  };


  const [student, setStudent] = useState({
    name: "Alex Chen",
    level: user.level,
    points: 780,
    streak: 5,
    preferences: {
      gameStyles: ["matching", "quiz", "flashcards"],
      categories: ["academic", "technology", "literature"],
      difficulty: "medium",
      learningStyle: "visual",
      dailyGoal: 10,
      reviewFrequency: "daily"
    }
  });
  
 
  const handleSignOut = () => {
    firebase.auth().signOut();
    setUser(null);
  };

  useEffect(() => {
    // Check if student level is the default "level" value
    if (student.level === 'level') {
      setShowAddWord(true);
    }
  }, [student.level]);


  
  // Example difficult words list with categories
  const [words, setWords] = useState([
    { id: 1, word: "Ubiquitous", definition: "Present everywhere", category: "academic", mastered: false },
    { id: 2, word: "Ephemeral", definition: "Lasting for a very short time", category: "academic", mastered: false },
    { id: 3, word: "Algorithm", definition: "A process or set of rules to be followed in calculations", category: "technology", mastered: true },
    { id: 4, word: "Rhetoric", definition: "The art of effective speaking or writing", category: "literature", mastered: false },
    { id: 5, word: "Paradigm", definition: "A typical example or pattern of something", category: "academic", mastered: false }
  ]);

  // Game modes
  const gameModes = [
    { id: "matching", name: "Word Association", icon: "🔤", description: "Match words with connection" ,link:"/wordssociation-two"},
    { id: "quiz", name: "Word Quiz", icon: "❓", description: "Multiple choice questions about word meanings",link:"/vocabulary-game-quiz" },
    { id: "hangman", name: "Word Guess", icon: "🎮", description: "Guess the word letter by letter" ,link:"/vocabulary-game-quiz1"}
  ];

  // Categories
  const categories = [
    { id: "academic", name: "Academic", count: 15, icon: "🎓" },
    { id: "technology", name: "Technology", count: 12, icon: "💻" },
    { id: "literature", name: "Literature", count: 8, icon: "📚" },
    { id: "science", name: "Science", count: 10, icon: "🧪" },
    { id: "business", name: "Business", count: 14, icon: "💼" }
  ];
  
  // Interface states

  
  // Simple matching game state
  const [matchingGameState, setMatchingGameState] = useState({
    words: [],
    definitions: [],
    matched: [],
    selected: null
  });
  
  // Initialize a matching game with selected category
  const startMatchingGame = (categoryId) => {
    const categoryWords = words.filter(w => w.category === categoryId && !w.mastered).slice(0, 4);
    if (categoryWords.length < 2) {
      alert("Not enough unmastered words in this category for a game!");
      return;
    }
    
    const gameWords = categoryWords.map(w => ({ id: w.id, text: w.word, type: "word" }));
    const gameDefs = categoryWords.map(w => ({ id: w.id, text: w.definition, type: "definition" }));
    
    setMatchingGameState({
      words: shuffleArray([...gameWords, ...gameDefs]),
      definitions: gameDefs,
      matched: [],
      selected: null
    });
    
    setGameActive(true);
    setSelectedGame("matching");
  };
  
  // Handle card click in matching game
  const handleCardClick = (cardId, cardType, itemId) => {
    // Already matched
    if (matchingGameState.matched.includes(itemId)) return;
    
    // First selection
    if (matchingGameState.selected === null) {
      setMatchingGameState({
        ...matchingGameState,
        selected: { id: itemId, type: cardType }
      });
      return;
    }
    
    // Second selection - check for match
    const firstSelection = matchingGameState.selected;
    
    // Reset selection if clicking the same card
    if (firstSelection.id === itemId && firstSelection.type === cardType) {
      setMatchingGameState({
        ...matchingGameState,
        selected: null
      });
      return;
    }
    
    // Check for match (same id but different types)
    if (firstSelection.id === itemId && firstSelection.type !== cardType) {
      // It's a match!
      setMatchingGameState({
        ...matchingGameState,
        matched: [...matchingGameState.matched, itemId],
        selected: null
      });
      
      // Check if game is complete
      if (matchingGameState.matched.length + 1 === matchingGameState.words.length / 2) {
        setTimeout(() => {
          alert("Game completed! +50 points");
          setStudent({...student, points: student.points + 50});
          setGameActive(false);
        }, 500);
      }
    } else {
      // Not a match, reset selection after a delay
      setTimeout(() => {
        setMatchingGameState({
          ...matchingGameState,
          selected: null
        });
      }, 1000);
    }
  };
  
  // Helper function to shuffle array
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };
  
  // Return to main menu
  const returnToMenu = () => {
    setGameActive(false);
    setSelectedGame(null);
    setSelectedCategory(null);
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-indigo-50">
      {/* Header */}
     
{
  /**
   * 
   *  A1: { title: "Beginner", color: "bg-blue-500" },
  A2: { title: "Elementary", color: "bg-green-500" },
  B1: { title: "Intermediate", color: "bg-yellow-500" },
  B2: { title: "Upper Intermediate", color: "bg-orange-500" },
  C1: { title: "Advanced", color: "bg-red-500" },
  C2: { title: "Proficient", color: "bg-purple-500" }
   * 
   * 
   * 
   * 
   * 
   * 
   */
}

<header className="bg-indigo-600 text-white p-4 shadow-md">
  <div className="flex justify-between items-center">
    {/* Modified left section to include level */}
    <div className="flex items-center">
      {/* <h1 className="text-2xl font-bold">Word Wizard</h1> */}
     
      {/* Level indicator - ADD THIS */}
      <div className={`${
  student.level === 'level' ? 'bg-gray-600' :
  student.level === 'Beginner' ? 'bg-blue-600' :
  student.level === 'Elementary' ? 'bg-green-600' :
  student.level === 'Intermediate' ? 'bg-yellow-600' :
  student.level === 'Upper Intermediate' ? 'bg-orange-600' :
  student.level === 'Advanced' ? 'bg-red-600' :
  student.level === 'Proficient' ? 'bg-purple-600' : 'bg-gray-600'
} ml-4 px-3 py-1 rounded-full flex items-center`}>
 
  <span>Your Level: <strong>{student.level}</strong> </span>
  <span className="mr-2">{
    student.level === 'Beginner' ? '🌱' :
    student.level === 'Elementary' ? '🌿' :
    student.level === 'Intermediate' ? '🌾' :
    student.level === 'Upper Intermediate' ? '🌲' :
    student.level === 'Advanced' ? '🌳' :
    student.level === 'Proficient' ? '🌟' : '👤'
  }</span>
</div>

      {/* New buttons for Paragraph, Vocabulary, and Pronunciation */}
      <div className="flex ml-6 space-x-2">
        <button 
          onClick={() => handleSectionChange('paragraph')} 
          className="bg-indigo-700 hover:bg-indigo-500 transition-colors duration-200 px-4 py-2 rounded-lg flex items-center shadow-md"
        >
          <span className="mr-2">📝</span>
          <span>Paragraph</span>
        </button>
        <button 
          onClick={() => handleSectionChange('vocabulary')} 
          className="bg-indigo-700 hover:bg-indigo-500 transition-colors duration-200 px-4 py-2 rounded-lg flex items-center shadow-md"
        >
          <span className="mr-2">📚</span>
          <span>Vocabulary</span>
        </button>
        <button 
          onClick={() => handleSectionChange('pronunciation')} 
          className="bg-indigo-700 hover:bg-indigo-500 transition-colors duration-200 px-4 py-2 rounded-lg flex items-center shadow-md"
        >
          <span className="mr-2">🗣️</span>
          <span>Pronunciation</span>
        </button>
      </div>
    </div>
   
    {/* Right section - unchanged */}
    <div className="flex items-center space-x-4">
      <div className="bg-indigo-500 px-3 py-1 rounded-full flex items-center">
        <span className="mr-2">⭐</span>
        <span>{student.points} pts</span>
      </div>
      <div className="bg-indigo-500 px-3 py-1 rounded-full flex items-center">
        <span className="mr-2">🔥</span>
        <span>{student.streak} days</span>
      </div>
      <button
        onClick={() => {
          setShowPreferences(true);
          setShowAddWord(false);
        }}
        className="bg-indigo-500 px-3 py-1 rounded-full flex items-center hover:bg-indigo-400"
      >
        <span className="mr-2">⚙️</span>
        <span>Preferences</span>
      </button>
      <div
        className="bg-indigo-800 rounded-full w-10 h-10 flex items-center justify-center cursor-pointer"
        onClick={handleSignOut}
      >
        {student.name.charAt(0)}
      </div>
    </div>
  </div>
</header>


      {/* Main Content */}
      <main className="flex-grow p-4">
        {showPreferences ? (
          <ContextualVocabularyForm setShowPreferences={setShowPreferences}/>
        ) : showAddWord ? (
         <VocabularyAnalyzer setShowAddWord={setShowAddWord}/>
        ) : !gameActive ? (
          <div>
            {/* Welcome section */}
            <div className="bg-white rounded-lg p-6 shadow-md mb-6">
              <h2 className="text-xl font-bold text-indigo-800 mb-2">Hello, {user?.name}!</h2>
              <p className="text-gray-600">Continue building your vocabulary skills. You're on a {student.streak}-day streak!</p>
              <div className="mt-4 mb-4 bg-indigo-100 p-3 rounded-md">
                <h3 className="font-semibold text-indigo-800">Today's Challenge:</h3>
                <p className="text-indigo-600">Learn {student.preferences.dailyGoal} new words to earn 100 bonus points</p>
              </div>
              <button 
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                onClick={() => {
                  setShowAddWord(true);
                  setShowPreferences(false);
                }}
              >
                Test Your Level
              </button>
            </div>

            {/* Game modes section */}
            <div className="bg-white rounded-lg p-6 shadow-md mb-6">
              <h2 className="text-xl font-bold text-indigo-800 mb-4">Choose a Game Mode</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 ">
                {gameModes.map(game => (
                  <div 
                    key={game.id}
                    className={`p-4 rounded-lg text-center cursor-pointer transition-colors border-2 
                      ${selectedGame === game.id ? 'border-indigo-600 bg-indigo-100' : 'border-gray-200 hover:bg-indigo-50'}`}
                    onClick={() => handleGameClick(game)} 
                  >
                    <div className="text-3xl mb-2">{game.icon}</div>
                    <h3 className="font-bold text-indigo-800">{game.name}</h3>
                    <p className="text-sm text-gray-600">{game.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* My Difficult Words section */}
            <div className="bg-white rounded-lg p-6 shadow-md mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-indigo-800">My Difficult Words</h2>
                <span className="text-indigo-600">{words.filter(w => !w.mastered).length} words to master</span>
              </div>
              
              <div className="overflow-auto max-h-48">
                <table className="min-w-full">
                  <thead className="bg-indigo-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-indigo-800">Word</th>
                      <th className="px-4 py-2 text-left text-indigo-800">Definition</th>
                      <th className="px-4 py-2 text-left text-indigo-800">Category</th>
                      <th className="px-4 py-2 text-left text-indigo-800">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {words.map(word => (
                      <tr key={word.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 font-medium">{word.word}</td>
                        <td className="px-4 py-2 text-gray-600">{word.definition}</td>
                        <td className="px-4 py-2">
                          <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs">
                            {categories.find(c => c.id === word.category)?.name}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          {word.mastered ? (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                              Mastered
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                              Learning
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <button 
                className="mt-4 bg-indigo-100 text-indigo-800 px-4 py-2 rounded-md hover:bg-indigo-200 w-full"
                onClick={() => {
                  setShowAddWord(true);
                  setShowPreferences(false);
                }}
              >
                + Add More Difficult Words
              </button>
            </div>
            
            {/* Categories section */}
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-indigo-800">Word Categories</h2>
                {selectedGame && selectedCategory && (
                  <button 
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                    onClick={() => startMatchingGame(selectedCategory)}
                  >
                    Start Game
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {categories.map(category => (
                  <div 
                    key={category.id}
                    className={`p-4 rounded-lg cursor-pointer transition-colors border-2
                      ${selectedCategory === category.id ? 'border-indigo-600 bg-indigo-100' : 'border-gray-200 hover:bg-indigo-50'}`}
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{category.icon}</span>
                        <h3 className="font-bold text-indigo-800">{category.name}</h3>
                      </div>
                      <span className="bg-indigo-100 text-indigo-800 text-sm px-2 py-1 rounded-full">
                        {category.count} words
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div>
            {/* Game interface - Basic matching game */}
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-indigo-800">
                  {categories.find(c => c.id === selectedCategory)?.name} Word Match
                </h2>
                <button 
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300"
                  onClick={returnToMenu}
                >
                  Exit Game
                </button>
              </div>
              
              <p className="mb-4 text-gray-600">Match each word with its correct definition.</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                {matchingGameState.words.map((item, index) => {
                  const isMatched = matchingGameState.matched.includes(item.id);
                  const isSelected = matchingGameState.selected?.id === item.id && 
                                    matchingGameState.selected?.type === item.type;
                  
                  return (
                    <div 
                      key={`${item.type}-${item.id}-${index}`}
                      className={`p-4 rounded-lg text-center cursor-pointer min-h-24 flex items-center justify-center transition-all
                        ${isMatched ? 'bg-green-100 border-2 border-green-500' : 
                          isSelected ? 'bg-indigo-100 border-2 border-indigo-500' : 
                          'bg-gray-100 border-2 border-gray-300 hover:bg-gray-200'}`}
                      onClick={() => handleCardClick(index, item.type, item.id)}
                    >
                      <p className={isMatched || isSelected ? '' : 'text-gray-800'}>
                        {item.text}
                      </p>
                    </div>
                  );
                })}
              </div>
              
              <div className="flex justify-between items-center mt-6 p-3 bg-indigo-50 rounded-md">
                <div>
                  <span className="text-indigo-800 font-bold">Progress: </span>
                  <span>{matchingGameState.matched.length} / {matchingGameState.words.length / 2} pairs</span>
                </div>
                <div>
                  <span className="text-indigo-800 font-bold">Category: </span>
                  <span>{categories.find(c => c.id === selectedCategory)?.name}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-indigo-800 text-white p-3 text-center">
        <p className="text-sm">Personalized vocabulary learning for students at all levels</p>
      </footer>
    </div>
  );
};

export default DashboardOne;