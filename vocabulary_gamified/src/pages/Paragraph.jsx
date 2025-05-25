import React, { useState, useEffect } from 'react';
import { useUser } from '../components/UserContext';
import { ref, get, set, update } from "firebase/database";
import { initializeRealtimeDB } from "../config/firebaseConfig";
import { Link, useNavigate } from "react-router-dom";


const DashboardOne = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  console.log('usfffffffer',user);
  // Student data - would come from a database in a real app
  const [student, setStudent] = useState({
    name: "Alex Chen",
    level: user?.level || 'Beginner',  // Use optional chaining and default value
    points: 0,
    streak: 0,
    preferences: {
      gameStyles: [],
      categories: ["academic", "technology", "literature"],
      difficulty: "medium",
      learningStyle: "visual",
      dailyGoal: 10,
      reviewFrequency: "daily"
    },
    correctCount:0,
    incorrectCount:0,
    averageTime:0,
    questionCount:0,
  });

 

  // Example difficult words list with categories
  const [words, setWords] = useState([
    { id: 1, word: "Ubiquitous", definition: "Present everywhere", category: "academic", mastered: false },
    { id: 2, word: "Ephemeral", definition: "Lasting for a very short time", category: "academic", mastered: false },
    { id: 3, word: "Algorithm", definition: "A process or set of rules to be followed in calculations", category: "technology", mastered: true },
    { id: 4, word: "Rhetoric", definition: "The art of effective speaking or writing", category: "literature", mastered: false },
    { id: 5, word: "Paradigm", definition: "A typical example or pattern of something", category: "academic", mastered: false }
  ]);

  // Game modes
  const gameModes=[
    { id: "food-health", name: "Food & Health", icon: "🍎", description: "Learn paragraphs related to food and health" },
    { id: "places-travel", name: "Places & Travel", icon: "✈️", description: "Learn paragraphs related to places and travel" },
    { id: "festivals-celebrations", name: "Festivals & Celebrations", icon: "🎉", description: "Learn paragraphs related to festivals and celebrations" },
    { id: "folktales", name: "Folktales", icon: "📖", description: "Learn paragraphs related to folktales" },
    { id: "fiction", name: "Fiction", icon: "📚", description: "Learn paragraphs related to fiction" },
    { id: "science", name: "Science", icon: "🔬", description: "Learn paragraphs related to science" },
    { id: "heroes", name: "Heroes", icon: "🦸", description: "Learn paragraphs related to heroes" },
    { id: "cartoons", name: "Cartoons", icon: "🎨", description: "Learn paragraphs related to cartoons" },
    { id: "animals", name: "Animals", icon: "🐾", description: "Learn paragraphs related to animals" },
    { id: "vehicles", name: "Vehicles", icon: "🚗", description: "Learn paragraphs related to vehicles" },
    { id: "fairytales", name: "Fairytales", icon: "🧚", description: "Learn paragraphs related to fairytales" },
    { id: "sports", name: "Sports", icon: "⚽", description: "Learn paragraphs related to sports" },
    { id: "nature", name: "Nature", icon: "🌿", description: "Learn paragraphs related to nature" }
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
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);
  const [gameActive, setGameActive] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [showAddWord, setShowAddWord] = useState(false);
  const [newWord, setNewWord] = useState({ word: "", definition: "", category: "academic" });
  console.log('showww==',student);
  // Reading and MCQ states
  const [readingContent, setReadingContent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentParagraphIndex, setCurrentParagraphIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [resultsData, setResultsData] = useState(null);
  // Simple matching game state
  const [matchingGameState, setMatchingGameState] = useState({
    words: [],
    definitions: [],
    matched: [],
    selected: null
  });
  
  useEffect(() => {
    
    const email = user.validKey;
    console.log('usererer',user);
    const db = initializeRealtimeDB();
    const sanitizedEmail = email;
    const userRef = ref(db, `userdata/${sanitizedEmail}`);
    console.log('userRef', email);
    get(userRef).then((snapshot) => {
      console.log('snapshot', snapshot);
      if (snapshot.exists()) {
        console.log('snapshot.val()', snapshot.val());
        const userData = snapshot.val();
      setStudent(prev => ({
          preferences:{
            gameStyles:userData.topics
          }
        }));
        console.log('userDatssa', userData);
        let leveld;
        if(userData.level==='1'){
          leveld='Beginner';
        }else if(userData.level==='2'){
          leveld='Elementary';
        }else if(userData.level==='3'){
          leveld='Intermediate';
        }else if(userData.level==='4'){
          leveld='Upper Intermediate';
        }
          
        setStudent(prev => ({
          ...prev,
          points: userData.totalPoints || 0,
          streak: userData.streak || 4,
          level: leveld || 'Beginner',
          gameModes: userData.topics || gameModes,
          correctCount:userData.correctCount || 0,
          incorrectCount:userData.incorrectCount || 0,
          averageTime:userData.averageTime || 0,
          questionCount:userData.questionCount || 0,
        }));
       console.log('studentssds',student)
      }
    }).catch(error => {
      console.error("Error fetching user data:", error);
    });
  }, []);
const fetchReadingContent = async () => {
  setIsLoading(true);
  try {
    const response = await fetch('http://127.0.0.1:8000/generate_mcqs/?level=A1&category=Animals&count=2');
    const data = await response.json();

    // Transform the API response to match the expected structure
    const transformedData = {
      title: "Reading Practice", // You can customize this title
      paragraphs: data.paragraphs.map(paragraph => {
        const options = paragraph.options.split(",").map(option => option.trim());

        // Normalize the answer and options for comparison
        const normalizeText = (text) => {
          // Remove extra spaces and trim, and ensure consistent formatting
          return text.replace(/\s*\)\s*/, ')').trim();
        };

        const normalizedAnswer = normalizeText(paragraph.answer);
        const normalizedOptions = options.map(option => normalizeText(option));

        // Find the correct answer index
        const correctAnswer = normalizedOptions.indexOf(normalizedAnswer);

        console.log('options', normalizedOptions);
        console.log('answer', normalizedAnswer);
        console.log('correctAnswer', correctAnswer);

        return {
          id: `p${paragraph.id}`,
          text: paragraph.paragraph,
          questions: [
            {
              id: `q1p${paragraph.id}`,
              question: paragraph.mcq_question,
              options: options,
              correctAnswer: correctAnswer
            }
          ]
        };
      })
    };

    setReadingContent(transformedData);
    setCurrentParagraphIndex(0);
    setUserAnswers({});
    setShowResults(false);
    setIsLoading(false);
  } catch (error) {
    console.error("Error fetching reading content:", error);
    setIsLoading(false);
  }
};
const updategameStyleToFirebase = async (topics)=>{

  const email = user.validKey;
  const db = initializeRealtimeDB();
  const userRef = ref(db, `userdata/${email}`);
  const userData = {
    topics: topics,
  };

  try {
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      await update(userRef, userData);
      console.log("User updated successfully");
    } else {
      await set(userRef, userData);
      console.log("New user created successfully");
    }
  } catch (error) {
    console.error("Error updating user:", error);
  }
}
  // Handle selecting an answer for MCQs
  const handleAnswerSelect = (questionId, optionIndex) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const exitGame1= () => {
    navigate('/DashboardOne');
    console.log("Exiting game...");
  };
  const exitGame2= () => {
    navigate('/paragraph');
    console.log("Exiting game...");
  };
  
  // Calculate results for MCQs
  const calculateResults = () => {
    if (!readingContent) return null;
    
    let correct = 0;
    let total = 0;
    const detailedResults = [];
    
    readingContent.paragraphs.forEach(paragraph => {
      paragraph.questions.forEach(question => {
        total++;
        const userAnswer = userAnswers[question.id];
        const isCorrect = userAnswer === question.correctAnswer;
        
        if (isCorrect) correct++;
        
        detailedResults.push({
          questionId: question.id,
          question: question.question,
          userAnswer: userAnswer !== undefined ? question.options[userAnswer] : "Not answered",
          correctAnswer: question.options[question.correctAnswer],
          isCorrect
        });
      });
    });
    
    return {
      score: correct,
      total,
      percentage: Math.round((correct / total) * 100),
      detailedResults
    };
  };
  
  // Handle MCQ submission
  const handleSubmit = () => {
    const results = calculateResults();
    setResultsData(results);
    setShowResults(true);
    
    // Award points based on performance
    if (results) {
      const earnedPoints = results.score * 10; // 10 points per correct answer
      setStudent(prev => ({
        ...prev,
        points: prev.points + earnedPoints
      }));
    }
  };
  
  // Reset the reading session
  const resetReadingSession = () => {
    setReadingContent(null);
    setCurrentParagraphIndex(0);
    setUserAnswers({});
    setShowResults(false);
    setResultsData(null);
  };
  
  // Navigate to next paragraph
  const goToNextParagraph = () => {
    if (currentParagraphIndex < readingContent.paragraphs.length - 1) {
      setCurrentParagraphIndex(prev => prev + 1);
    }
  };
  
  // Navigate to previous paragraph
  const goToPreviousParagraph = () => {
    if (currentParagraphIndex > 0) {
      setCurrentParagraphIndex(prev => prev - 1);
    }
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
      <header className="bg-indigo-600 text-white p-4 shadow-md">
        <div className="flex justify-between items-center">
          <Link to="/" className="bg-indigo-500 hover:bg-indigo-500 transition-colors duration-200 px-4 py-2 rounded-full flex items-center shadow-md mr-4">
            <span className="mr-2">🏠</span><span>Home</span>
          </Link>

          
        
          <div className="flex ml-6 space-x-2">
      
      </div>
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
          </div>
         
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-4">
        {showPreferences ? (
          <div className="bg-white rounded-lg p-6 shadow-md mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-indigo-800"> Change Your Reading Preferences</h2>
              <button 
                onClick={() => setShowPreferences(false)}
                className="bg-gray-200 text-gray-800 px-3 py-1 rounded-md hover:bg-gray-300"
              >
                Close
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {gameModes.map(game => (
                      <div 
                        key={game.id}
                        className={`px-3 py-2 rounded-md cursor-pointer border 
                          ${student.preferences.gameStyles.includes(game.id) 
                            ? 'bg-indigo-100 border-indigo-500' 
                            : 'bg-gray-100 border-gray-300'}`}
                        onClick={() => {
                          const updatedStyles = student.preferences.gameStyles.includes(game.id)
                            ? student.preferences.gameStyles.filter(style => style !== game.id)
                            : [...student.preferences.gameStyles, game.id];
                            console.log('updatedStyles', updatedStyles);
                            updategameStyleToFirebase(updatedStyles);
                          setStudent({
                            ...student,
                            preferences: {
                              ...student.preferences,
                              gameStyles: updatedStyles
                            }
                          });
                        }}
                      >
                        <span>{game.icon} {game.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div>
                {/* <h3 className="font-bold text-indigo-700 mb-3">Change Level</h3>
                 */}
                <div className="mb-4">
                  {/* <label className="block text-gray-700 mb-2">Difficulty Level</label> */}
                  {/* <select 
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={student.preferences.difficulty}
                    onChange={(e) => setStudent({
                      ...student,
                      preferences: {
                        ...student.preferences,
                        difficulty: e.target.value
                      }
                    })}
                  >
                    <option value="easy">Beginner A1</option>
                    <option value="medium">Beginner A2</option>
                    <option value="hard">Intermediate B1</option>
                    <option value="very-hard">Intermediate B2</option>
                    <option value="hard">Advanced C1</option>
                    <option value="very-hard">Advanced C2</option>
                  </select> */}
                </div>
              </div>
            </div>
          </div>
        ) : showAddWord ? (
          <div className="bg-white rounded-lg p-6 shadow-md mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-indigo-800">Add Your Difficult Words</h2>
              <button 
                onClick={() => setShowAddWord(false)}
                className="bg-gray-200 text-gray-800 px-3 py-1 rounded-md hover:bg-gray-300"
              >
                Close
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-4 mb-6">
              <div>
                <label className="block text-gray-700 mb-2">Word</label>
                <input 
                  type="text" 
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={newWord.word}
                  onChange={(e) => setNewWord({...newWord, word: e.target.value})}
                  placeholder="Enter a difficult word"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Definition</label>
                <textarea 
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={newWord.definition}
                  onChange={(e) => setNewWord({...newWord, definition: e.target.value})}
                  placeholder="Enter the definition"
                  rows="3"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 mb-2">Category</label>
                <select 
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={newWord.category}
                  onChange={(e) => setNewWord({...newWord, category: e.target.value})}
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button 
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                onClick={() => {
                  if (newWord.word.trim() && newWord.definition.trim()) {
                    // Add the new word to the list
                    const newWordObj = {
                      id: words.length + 1,
                      word: newWord.word.trim(),
                      definition: newWord.definition.trim(),
                      category: newWord.category,
                      mastered: false
                    };
                    
                    setWords([...words, newWordObj]);
                    // Reset the form
                    setNewWord({ word: "", definition: "", category: "academic" });
                    // Show success message
                    alert("Word added successfully! You earned 10 points for adding a new word.");
                    setStudent({...student, points: student.points + 10});
                  } else {
                    alert("Please enter both a word and definition.");
                  }
                }}
              >
                Add Word
              </button>
            </div>
          </div>
        ) : readingContent ? (
          // Reading Content Display
          <div className="bg-white rounded-lg p-6 shadow-md mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-indigo-800">{readingContent.title}</h2>
              <button 
                onClick={resetReadingSession}
                className="bg-gray-200 text-gray-800 px-3 py-1 rounded-md hover:bg-gray-300"
              >
                Back to Menu
              </button>
            </div>
            
            {showResults ? (
              // Results display
              <div className="mt-4">
                <div className="bg-indigo-50 p-4 rounded-md mb-4">
                  <h3 className="text-lg font-bold text-indigo-800 mb-2">Your Reading Assessment Results</h3>
                  <p className="text-indigo-600 font-bold text-xl mb-2">
                    Score: {resultsData.score}/{resultsData.total} ({resultsData.percentage}%)
                  </p>
                  <p className="text-indigo-700">
                    You earned {resultsData.score * 10} points!
                  </p>
                </div>
                
                <div className="mt-4">
                  <h3 className="font-bold text-gray-700 mb-2">Detailed Results:</h3>
                  {resultsData.detailedResults.map((result, index) => (
                    <div 
                      key={result.questionId} 
                      className={`p-3 mb-3 rounded-md ${result.isCorrect ? 'bg-green-50 border-l-4 border-green-500' : 'bg-red-50 border-l-4 border-red-500'}`}
                    >
                      <p className="font-medium mb-1">{result.question}</p>
                      <p className={`${result.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                        Your answer: {result.userAnswer}
                      </p>
                      {!result.isCorrect && (
                        <p className="text-green-700">Correct answer: {result.correctAnswer}</p>
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 flex justify-center">
                  <button 
                    onClick={resetReadingSession}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                  >
                    Try Another Reading
                  </button>
                </div>
              </div>
            ) : (
              // Reading and question content
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-gray-700">
                    Paragraph {currentParagraphIndex + 1} of {readingContent.paragraphs.length}
                  </h3>
                  <div className="flex space-x-2">
                    <button 
                      onClick={goToPreviousParagraph}
                      disabled={currentParagraphIndex === 0}
                      className={`px-3 py-1 rounded-md ${currentParagraphIndex === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'}`}
                    >
                      Previous
                    </button>
                    <button 
                      onClick={goToNextParagraph}
                      disabled={currentParagraphIndex === readingContent.paragraphs.length - 1}
                      className={`px-3 py-1 rounded-md ${currentParagraphIndex === readingContent.paragraphs.length - 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'}`}
                    >
                      Next
                    </button>
                  </div>
                </div>
                
                <div className="bg-indigo-50 p-4 rounded-md mb-6">
                  <p className="text-gray-800 leading-relaxed">
                    {readingContent.paragraphs[currentParagraphIndex].text}
                  </p>
                </div>
                
                <div className="mt-6">
                  <h3 className="font-bold text-gray-700 mb-4">Questions:</h3>
                  
                  {readingContent.paragraphs[currentParagraphIndex].questions.map((question) => (
                    <div key={question.id} className="mb-6">
                      <p className="font-medium mb-3">{question.question}</p>
                      <div className="space-y-2">
                        {question.options.map((option, optionIndex) => (
                          <div 
                            key={optionIndex}
                            className={`p-3 border rounded-md cursor-pointer
                              ${userAnswers[question.id] === optionIndex ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:bg-gray-50'}`}
                            onClick={() => handleAnswerSelect(question.id, optionIndex)}
                          >
                            <div className="flex items-center">
                              <div className={`w-5 h-5 rounded-full border ${userAnswers[question.id] === optionIndex ? 'border-indigo-500 bg-indigo-500' : 'border-gray-400'} mr-3 flex items-center justify-center`}>
                                {userAnswers[question.id] === optionIndex && (
                                  <div className="w-2 h-2 rounded-full bg-white"></div>
                                )}
                              </div>
                              <span>{option}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                
                {currentParagraphIndex === readingContent.paragraphs.length - 1 && (
                  <div className="mt-6 flex justify-center">
                    <button 
                      onClick={handleSubmit}
                      className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 font-medium"
                    >
                      Submit Answers
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : !gameActive ? (
          <div>
            {/* NEW SECTION: Reading Practice with MCQs */}
            <div className="bg-white rounded-lg p-6 shadow-md mb-6">
              <h2 className="text-xl font-bold text-indigo-800 mb-3">Improve Your Reading Comprehension</h2>
              <p className="text-gray-600 mb-4">Read interesting paragraphs and test your understanding with related questions</p>
              
              <div className="bg-indigo-50 p-4 rounded-md mb-4">
                <div className="flex items-start">
                  <div className="bg-indigo-100 p-2 rounded-md mr-4">
                    <span className="text-2xl">📚</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-indigo-800 mb-1">Reading Practice</h3>
                    <p className="text-indigo-600 text-sm mb-3">Read engaging paragraphs on diverse topics and answer questions to test your comprehension</p>
                    <ul className="text-gray-700 text-sm mb-3">
                      <li className="flex items-center">
                        <span className="mr-2">✓</span> Improve vocabulary and comprehension
                      </li>
                      <li className="flex items-center">
                        <span className="mr-2">✓</span> Test your understanding with MCQs
                      </li>
                      <li className="flex items-center">
                        <span className="mr-2">✓</span> Earn points for correct answers
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="mt-4">
                  <button 
                    className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 w-full font-medium"
                    onClick={() => navigate('/mcq')}
                  >
                    Start Now
                  </button>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">Science</span>
                <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">History</span>
                <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">Literature</span>
                <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">Technology</span>
                <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">Current Events</span>
              </div>
            </div>
            
              {/* Welcome section with a correctCount:0,
    incorrectCount:0,
    averageTime:0,
    questionCount:0,nalytics */}
            <div className="bg-white rounded-lg p-6 shadow-md mb-6">
              <h2 className="text-xl font-bold text-indigo-800 mb-2">Hello, {user?.email || "Guest"}!</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-indigo-50 p-3 rounded-lg">
                  <p className="text-sm text-indigo-600">Total Questions</p>
                  <p className="text-xl font-bold">{student?.questionCount || 0}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm text-green-600">Correct Answers</p>
                  <p className="text-xl font-bold">{student?.correctCount || 0}</p>
                </div>
                <div className="bg-red-50 p-3 rounded-lg">
                  <p className="text-sm text-red-600">Wrong Answers</p>
                  <p className="text-xl font-bold">{student?.incorrectCount || 0}</p>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <p className="text-sm text-yellow-600">Avg Time (sec)</p>
                  <p className="text-xl font-bold">{student?.averageTime ? Math.round(student.averageTime) : 0}</p>
                </div>
              </div>
            
              {/* <button 
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                onClick={() => {
                  setShowAddWord(true);
                  setShowPreferences(false);
                }}
              >
                + Add Your Difficult Words
              </button> */}
              
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
        <p className="text-sm">Personalized Reading Experience for users at all levels</p>
      </footer>
    </div>
  );
};

export default DashboardOne;
