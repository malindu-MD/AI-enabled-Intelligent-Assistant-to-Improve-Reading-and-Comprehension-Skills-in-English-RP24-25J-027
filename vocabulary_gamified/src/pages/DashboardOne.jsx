import React, { useEffect, useState } from 'react';
import { useUser } from '../components/UserContext';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import VocabularyAnalyzer from './VocabularyAnalyzer';
import ContextualVocabularyForm from './ContextualVocabularyForm';
import { Link,useNavigate  } from "react-router-dom";
import Header from '../components/Header';
import Footer from '../components/Footer';



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


  const exitGame1= () => {
    navigate('/DashboardOne');
    console.log("Exiting game...");
  };
  const exitGame2= () => {
    navigate('/paragraph');
    console.log("Exiting game...");
  };


  
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

<Header  student={student}
  setShowPreferences={setShowPreferences}
  setShowAddWord={setShowAddWord}
  handleSignOut={handleSignOut} />


      {/* Main Content */}
      <main className="flex-grow p-4">
        {showPreferences ? (
          <ContextualVocabularyForm setShowPreferences={setShowPreferences}/>
        ) : showAddWord ? (
         <VocabularyAnalyzer setShowAddWord={setShowAddWord}/>
        ) : !gameActive ? (
          <div>
            {/* Welcome section */}
            {/* <div className="bg-white rounded-lg p-6 shadow-md mb-6">
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
                Test Vocabulary Your Level
              </button>
            </div> */}

            {/* Welcome section */}
<div className="bg-white rounded-xl p-6 shadow-xl mb-6 border-2 border-indigo-100 relative overflow-hidden hover:shadow-2xl transition-all duration-300">
  {/* Gaming particles */}
  <div className="absolute top-2 right-4 text-yellow-500 animate-bounce text-xl">⭐</div>
  <div className="absolute bottom-3 left-6 text-orange-500 animate-pulse text-xl">🔥</div>
  <div className="absolute top-6 left-20 text-blue-400 animate-ping">💎</div>
  
  <div className="flex items-center justify-between mb-3">
    <h2 className="text-2xl font-bold text-indigo-800 mb-2 flex items-center gap-2">
      <span className="animate-bounce text-2xl">🎮</span>
      Hello, {user?.name}!
    </h2>
    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg p-3 shadow-lg hover:scale-105 transition-transform duration-300">
      <div className="text-center">
        <div className="text-xl font-bold text-white">{student.streak}</div>
        <div className="text-xs text-indigo-100 flex items-center justify-center gap-1">
          <span className="animate-pulse">🔥</span>
          Day Streak
        </div>
      </div>
    </div>
  </div>
  
  <p className="text-gray-700 mb-4">Continue building your vocabulary skills.<span className="font-bold text-indigo-600"></span></p>
  
  <div className="mt-4 mb-4 bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg border-2 border-indigo-200 hover:from-indigo-100 hover:to-purple-100 transition-all duration-300 hover:shadow-md cursor-pointer">
    <h3 className="font-bold text-indigo-800 mb-2 flex items-center gap-2">
      <span className="text-xl">🎯</span>
      Today's Challenge:
      <span className="bg-yellow-400 text-black text-xs px-3 py-1 rounded-full animate-pulse font-bold shadow-md">+100 XP</span>
    </h3>
    <p className="text-gray-700">Learn <span className="font-bold text-purple-600 bg-purple-100 px-2 py-1 rounded">{student.preferences.dailyGoal} new words</span> to earn bonus points</p>
  </div>
  
  <button
    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold px-6 py-4 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center justify-center gap-3 group relative overflow-hidden"
    onClick={() => {
      setShowAddWord(true);
      setShowPreferences(false);
    }}
  >
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
    <span className="text-xl group-hover:rotate-12 transition-transform duration-300">📚</span>
    <span className="text-lg">Test Vocabulary Your Level</span>
    <span className="group-hover:translate-x-2 transition-transform duration-300 text-xl">🚀</span>
  </button>
  
  {/* Progress indicator */}
  <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
    <div className="flex gap-1">
      <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-100"></div>
      <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse delay-200"></div>
    </div>
    <span>Ready to level up?</span>
  </div>
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
    <Footer text="Personalized vocabulary learning for students at all levels" />
    </div>
  );
};

export default DashboardOne;