import React, { useState } from 'react';
import { BookOpen, CheckCircle, X, Award, Zap, RefreshCw, FileText, BarChart, ChevronRight, ArrowRight, ArrowLeft, AlertTriangle } from 'lucide-react';
import { useUser } from '../components/UserContext';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';

// Level info
const levelInfo = {
   A1: { title: "Beginner", color: "bg-blue-500" },
  "A1+": { title: "Elementary", color: "bg-blue-500" },
  A2: { title: "Elementary", color: "bg-green-500" },
  "A2+": { title: "Intermediate", color: "bg-green-500" },
  B1: { title: "Intermediate", color: "bg-yellow-500" },
  "B1+": { title: "Upper Intermediate", color: "bg-yellow-500" },
  B2: { title: "Upper Intermediate", color: "bg-orange-500" },
  "B2+": { title: "Advanced", color: "bg-orange-500" },
  C1: { title: "Advanced", color: "bg-red-500" },
  "C1+": { title: "Proficient", color: "bg-red-500" },
  C2: { title: "Proficient", color: "bg-purple-500" },
  "C2+": { title: "Proficient", color: "bg-purple-500" }
};


// Content for welcome slides
const welcomeSlides = [
  {
    title: "Welcome to the Vocabulary Level Predictor",
    content: (
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <BookOpen size={60} className="text-blue-600" />
        </div>
        <p className="text-lg">This tool will assess your English vocabulary level based on the CEFR framework (A1-C2)</p>
        <p className="mt-4 text-gray-600">Navigate through a few quick slides to learn how to get the most accurate assessment</p>
      </div>
    )
  },
  {
    title: "Show Your Best English Skills",
    content: (
      <div>
        <p className="font-medium mb-4">Write using the <span className="font-bold">full range of vocabulary and grammar</span> that you know.</p>
        <p>Don't limit yourself to simple words or basic sentences if you can write more advanced ones.</p>
      </div>
    )
  },
  {
    title: "1. Use Complex Sentences and Rich Vocabulary",
    content: (
      <div>
        <ul className="list-disc pl-5 mb-4 space-y-1">
          <li>Try to include <span className="font-bold">varied sentence structures</span> (simple, compound, and complex).</li>
          <li>Use <span className="font-bold">a mix of common and advanced vocabulary</span> that you are comfortable with.</li>
        </ul>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm mb-2">Examples:</p>
          <p className="text-green-600 mb-2">✅ <em>Although I was exhausted after a long day at work, I still managed to prepare a delicious dinner for my family.</em></p>
          <p className="text-red-500">❌ <em>I was tired. I cooked dinner.</em></p>
        </div>
      </div>
    )
  },
  {
    title: "2. Write More Than Just Basic Facts",
    content: (
      <div>
        <ul className="list-disc pl-5 mb-4 space-y-1">
          <li>Instead of short, factual statements, <span className="font-bold">explain your thoughts and opinions</span> in detail.</li>
        </ul>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm mb-2">Examples:</p>
          <p className="text-green-600 mb-2">✅ <em>Reading books is an essential way to expand one's knowledge. In particular, I enjoy historical novels because they provide insight into different cultures and eras.</em></p>
          <p className="text-red-500">❌ <em>I like books. They are good.</em></p>
        </div>
      </div>
    )
  },
  {
    title: "3. Avoid Using Only Simple Words",
    content: (
      <div>
        <ul className="list-disc pl-5 mb-4 space-y-1">
          <li>If you know synonyms or more advanced words, use them!</li>
        </ul>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm mb-2">Examples:</p>
          <p className="text-green-600 mb-2">✅ <em>The conference was insightful and thought-provoking.</em></p>
          <p className="text-red-500">❌ <em>The conference was good.</em></p>
        </div>
      </div>
    )
  },
  {
    title: "4. Write in English Only",
    content: (
      <div>
        <ul className="list-disc pl-5 mb-6 space-y-1">
          <li>Your text should reflect <span className="font-bold">your own writing ability</span>, not the result of a translation tool.</li>
          <li>Avoid using online translators as they may not accurately represent your vocabulary level.</li>
        </ul>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <p className="text-yellow-800">By following these guidelines, the system will be able to give you a <span className="font-bold">more accurate assessment of your English level</span>.</p>
        </div>
      </div>
    )
  },
  {
    title: "How It Works",
    content: (
      <div>
        <div className="space-y-6">
          <div className="flex items-center justify-center">
           
          </div>
          <div className="flex items-center justify-center">
            <div className="bg-blue-100 rounded-full p-2 mr-4 w-10 h-10 flex items-center justify-center text-blue-600">1</div>
            <div>
              <p className="font-medium">Write your text</p>
              <p className="text-sm text-gray-600">Express yourself fully using your best vocabulary</p>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="bg-blue-100 rounded-full p-2 mr-4 w-10 h-10 flex items-center justify-center text-blue-600">2</div>
            <div>
              <p className="font-medium">Get your vocabulary analysis</p>
              <p className="text-sm text-gray-600">View your CEFR level and detailed breakdown</p>
            </div>
          </div>
        </div>
      </div>
    )
  }
];

const VocabularyAnalyzer = ({setShowAddWord}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPhase, setCurrentPhase] = useState('intro'); // intro, input, processing, results
  const [welcomeSlideIndex, setWelcomeSlideIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [isSavingLevel, setIsSavingLevel] = useState(false);
  const {user, setUser} = useUser();
  
  // Open the slides experience
  const openSlides = () => {
    setIsOpen(true);
    setCurrentPhase('intro');
    setWelcomeSlideIndex(0);
  };
  
  // Close the slides experience
  const closeSlides = () => {
    if (analysis && !isSavingLevel) {
      saveUserLevel();
    }
    setShowAddWord(false);
  };
  
  // Navigate welcome slides
  const nextWelcomeSlide = () => {
    if (welcomeSlideIndex < welcomeSlides.length - 1) {
      setWelcomeSlideIndex(prev => prev + 1);
    } else {
      setCurrentPhase('input');
    }
  };
  
  const prevWelcomeSlide = () => {
    if (welcomeSlideIndex > 0) {
      setWelcomeSlideIndex(prev => prev - 1);
    }
  };
  
  // Input validation function
  const validateInput = (text) => {
    const errors = [];
    const trimmedText = text.trim();
    
    // Check minimum length
    if (trimmedText.length < 50) {
      errors.push("Text should be at least 50 characters long for accurate analysis.");
    }
    
    // Check minimum word count
    const words = trimmedText.match(/\b\w+\b/g) || [];
    if (words.length < 10) {
      errors.push("Please write at least 10 words for meaningful analysis.");
    }
    
    // Check maximum length (to prevent API overload)
    if (trimmedText.length > 5000) {
      errors.push("Text is too long. Please keep it under 5000 characters.");
    }
    
    // Check for excessive repetition
    const wordCounts = {};
    words.forEach(word => {
      const lowerWord = word.toLowerCase();
      wordCounts[lowerWord] = (wordCounts[lowerWord] || 0) + 1;
    });
    
    const totalWords = words.length;
    const repeatedWords = Object.entries(wordCounts)
      .filter(([word, count]) => count > Math.max(3, totalWords * 0.1) && word.length > 3)
      .map(([word]) => word);
    
    if (repeatedWords.length > 0) {
      errors.push(`Avoid excessive repetition of words: ${repeatedWords.slice(0, 3).join(', ')}`);
    }
    
    // Check for minimum sentence count
    const sentences = trimmedText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length < 2) {
      errors.push("Please write at least 2 complete sentences.");
    }
    
    // Check for non-English characters (basic check)
    const nonEnglishPattern = /[^\x00-\x7F\u00C0-\u017F\u0100-\u024F]/g;
    if (nonEnglishPattern.test(trimmedText)) {
      errors.push("Please write only in English using standard characters.");
    }
    
    // Check for excessive punctuation or special characters
    const specialCharCount = (trimmedText.match(/[^a-zA-Z0-9\s.,!?;:'"()-]/g) || []).length;
    if (specialCharCount > trimmedText.length * 0.05) {
      errors.push("Please use standard punctuation and avoid excessive special characters.");
    }
    
    // Check for potential copy-paste indicators (very short sentences or very long single sentence)
    const avgSentenceLength = totalWords / sentences.length;
    if (avgSentenceLength < 3) {
      errors.push("Please write more complete, detailed sentences.");
    }
    
    // Check for single very long sentence (might indicate poor structure)
    const longestSentence = Math.max(...sentences.map(s => (s.match(/\b\w+\b/g) || []).length));
    if (longestSentence > totalWords * 0.8 && totalWords > 20) {
      errors.push("Try to use a variety of sentence lengths for better analysis.");
    }
    
    return errors;
  };
  
  // Real-time validation as user types
  const handleInputChange = (e) => {
    const value = e.target.value;
    setUserInput(value);
    
    // Clear previous validation errors when user starts typing
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
    
    // Clear API errors when user starts typing
    if (error) {
      setError(null);
    }
  };
  
  // Go back to input
  const goBackToInput = () => {
    setUserInput('');
    setValidationErrors([]);
    setCurrentPhase('input');
  };
  
  // Handle text submission with validation
  const handleSubmit = async () => {
    const trimmedInput = userInput.trim();
    if (!trimmedInput) return;
    
    // Validate input
    const errors = validateInput(trimmedInput);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    // Clear validation errors if validation passes
    setValidationErrors([]);
    setCurrentPhase('processing');
    setError(null);
    
    try {
      await analyzeText(trimmedInput);
      setCurrentPhase('results');
    } catch (err) {
      setError('An error occurred during analysis. Please try again.');
      setCurrentPhase('input');
    }
  };
  
  // Save user level to Firebase and update context
  const saveUserLevel = async () => {
    if (!analysis || !user || !user.uid) return;
    
    try {
      setIsSavingLevel(true);
      
      // Get level title from levelInfo
      const levelTitle = levelInfo[analysis.dominantLevel].title;
      
      // Update Firebase
      await firebase.database().ref(`users/${user.uid}`).update({
        level: levelTitle,
        vocabulary_feedback:analysis.feedback
      });
      
      // Update user context
      const updatedUser = {
        ...user,
        level: levelTitle
      };
      
      setUser(updatedUser);
      
      // Optional: show success message
      console.log("Level saved successfully:", levelTitle);
      
    } catch (error) {
      console.error("Error saving level to Firebase:", error);
    } finally {
      setIsSavingLevel(false);
    }
  };
  
  // Reset to start
  const restartAssessment = () => {
    setUserInput('');
    setValidationErrors([]);
    setAnalysis(null);
    setCurrentPhase('intro');
    setWelcomeSlideIndex(0);
  };
  
  // Try again
  const tryAgain = () => {
    setUserInput('');
    setValidationErrors([]);
    setAnalysis(null);
    setCurrentPhase('input');
  };
  
  // Analyze text using the API
  const analyzeText = async (text) => {
    try {
      const response = await fetch('http://54.162.57.15/predict', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          texts: [text] 
        })
      });
      
      if (!response.ok) {
        throw new Error(`API response status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        const result = data[0];
        console.log(result);
        
        // Calculate word count and unique words
        const words = text.match(/\b\w+\b/g) || [];
        const uniqueWords = new Set(words).size;
        
        // Calculate score based on CEFR level scores
        const score = Math.floor(
          (result.scores.A1 * 1) + 
          (result.scores.A2 * 20) + 
          (result.scores.B1 * 50) + 
          (result.scores.B2 * 100) + 
          (result.scores.C1 * 150) +
          (result.scores.C2 * 200)
        );
        
        // Create analysis result
        const analysisResult = {
          wordCount: words.length,
          uniqueWords: uniqueWords,
          dominantLevel: result.level,
          scores: result.scores,
          text: result.text,
          feedback :result.feedback,
          score: score
        };
        
        // Set analysis state
        setAnalysis(analysisResult);
        
        // Automatically save the level to Firebase after analysis is complete
        setTimeout(() => {
          saveUserLevel();
        }, 1000);
        
        return result;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error analyzing text:', error);
      throw error;
    }
  };
  
  // Get highlighted text
  const getHighlightedText = () => {
    if (!analysis) return userInput;
    
    // Simple highlighting for demonstration
    // In a real implementation, you might want to use a more sophisticated approach
    return userInput;
  };
  
  // Get input statistics for display
  const getInputStats = () => {
    const trimmedText = userInput.trim();
    const words = trimmedText.match(/\b\w+\b/g) || [];
    const sentences = trimmedText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    return {
      characters: trimmedText.length,
      words: words.length,
      sentences: sentences.length
    };
  };
  const getChartData = () => {
    if (!analysis) return [];
    
    return [
      { level: 'A1', value: analysis.scores.A1, color: 'bg-blue-500' },
      { level: 'A2', value: analysis.scores.A2, color: 'bg-green-500' },
      { level: 'B1', value: analysis.scores.B1, color: 'bg-yellow-500' },
      { level: 'B2', value: analysis.scores.B2, color: 'bg-orange-500' },
      { level: 'C1', value: analysis.scores.C1, color: 'bg-red-500' },
      { level: 'C2', value: analysis.scores.C2, color: 'bg-purple-500' }
    ].filter(item => item.value > 0.001); // Filter out very small values
  };

  return (
    <div className="flex flex-col items-center">
      {/* Slides Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        {/* Slides Content */}
        <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl relative overflow-hidden max-h-screen">
          {/* Close Button */}
          <button 
            onClick={closeSlides}
            className="absolute top-4 right-4 text-gray-500 hover:text-white-700 z-10"
          >
            <X color='white' size={20} />
          </button>
          
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6">
            <h1 className="text-xl font-bold flex items-center">
              <BookOpen className="mr-2" /> Vocabulary Level Assessment
            </h1>
          </div>
          
          {/* Content Area */}
          <div className="p-6 overflow-y-auto" style={{ maxHeight: "calc(80vh - 80px)" }}>
            {/* Welcome Slides */}
            {currentPhase === 'intro' && (
              <div className="min-h-64">
                {/* Progress Indicator */}
                <div className="flex mb-6 bg-gray-100 h-1 rounded-full overflow-hidden">
                  {welcomeSlides.map((_, index) => (
                    <div 
                      key={index} 
                      className={`flex-1 ${index <= welcomeSlideIndex ? 'bg-blue-500' : 'bg-gray-200'}`}
                    ></div>
                  ))}
                </div>
                
                {/* Slide Content */}
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
                    {welcomeSlides[welcomeSlideIndex].title}
                  </h2>
                  <div className="min-h-56">
                    {welcomeSlides[welcomeSlideIndex].content}
                  </div>
                </div>
                
                {/* Navigation */}
                <div className="flex justify-between">
                  <button
                    onClick={prevWelcomeSlide}
                    disabled={welcomeSlideIndex === 0}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    <ArrowLeft size={16} className="mr-1" /> Back
                  </button>
                  <button
                    onClick={nextWelcomeSlide}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 flex items-center"
                  >
                    {welcomeSlideIndex < welcomeSlides.length - 1 ? 'Next' : 'Start Assessment'} <ArrowRight size={16} className="ml-1" />
                  </button>
                </div>
              </div>
            )}
            
            {/* Input Screen */}
            {currentPhase === 'input' && (
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-2 text-center">Write Your Text</h2>
                
                {error && (
                  <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center">
                    <AlertTriangle size={16} className="mr-2 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                
                {validationErrors.length > 0 && (
                  <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">
                    <div className="flex items-center mb-2">
                      <AlertTriangle size={16} className="mr-2 flex-shrink-0" />
                      <span className="font-medium">Please fix the following issues:</span>
                    </div>
                    <ul className="list-disc pl-6 space-y-1">
                      {validationErrors.map((error, index) => (
                        <li key={index} className="text-sm">{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="space-y-3 mb-6">
                  <textarea
                    value={userInput}
                    onChange={handleInputChange}
                    className={`w-full p-4 border rounded-lg transition-colors ${
                      validationErrors.length > 0 
                        ? 'border-red-300 focus:border-red-500' 
                        : 'border-gray-300 focus:border-blue-500'
                    }`}
                    placeholder="Type your paragraph or essay here..."
                    rows={8}
                  />
                  
                  {/* Input Statistics */}
                  {userInput.trim() && (
                    <div className="flex justify-between text-xs text-gray-500 bg-gray-50 p-2 rounded">
                      <span>Characters: {getInputStats().characters}/5000</span>
                      <span>Words: {getInputStats().words}</span>
                      <span>Sentences: {getInputStats().sentences}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center text-sm text-yellow-700 bg-yellow-50 p-2 rounded">
                    <AlertTriangle size={16} className="mr-1 flex-shrink-0" />
                    <span>Remember to use a variety of sentence structures and vocabulary to get the most accurate assessment.</span>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <button 
                    onClick={() => {
                      setCurrentPhase('intro');
                      setWelcomeSlideIndex(welcomeSlides.length - 1);
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200 flex items-center"
                  >
                    <ArrowLeft size={16} className="mr-1" /> Back to Instructions
                  </button>
                  <button 
                    onClick={handleSubmit}
                    disabled={!userInput.trim() || userInput.trim().length < 10}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
                  >
                    Analyze My Text <BarChart size={16} className="ml-1" />
                  </button>
                </div>
              </div>
            )}
            
            {/* Processing Screen */}
            {currentPhase === 'processing' && (
              <div className="flex flex-col items-center justify-center py-10">
                <RefreshCw className="text-blue-600 animate-spin mb-4" size={48} />
                <h2 className="text-xl font-bold text-gray-800 mb-2">Analyzing Your Vocabulary</h2>
                <p className="text-gray-600">Evaluating your language level and word choices...</p>
              </div>
            )}
            
            {/* Results Screen */}
            {currentPhase === 'results' && analysis && (
              <div>
                <div className="text-center mb-4">
                  <Award className="text-blue-600 mx-auto mb-1" size={30} />
                  <h2 className="text-xl font-bold text-gray-800 mb-1">Your Vocabulary Assessment</h2>
                  <p className="text-blue-600 text-sm">Analysis complete! Here's your language profile.</p>
                  {isSavingLevel && (
                    <p className="text-xs text-green-600 mt-1">Saving your level...</p>
                  )}
                </div>
                
                {/* Main Results - 2 Column Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    {/* CEFR Level Result */}
                    <div className={`${levelInfo[analysis.dominantLevel].color} bg-opacity-10 rounded-lg p-3 border border-opacity-20 ${levelInfo[analysis.dominantLevel].color} mb-4`}>
                      <div className="text-center">
                        <div className="text-sm text-gray-600 mb-1">Your CEFR Level</div>
                        <div className="text-xl font-bold">
                          {analysis.dominantLevel}: {levelInfo[analysis.dominantLevel].title}
                        </div>
                      </div>
                    </div>
                    
                    {/* Statistics */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-white border border-gray-200 rounded-lg p-2 text-center">
                        <div className="text-gray-500 text-xs">Words</div>
                        <div className="text-base font-bold text-gray-800">{analysis.wordCount}</div>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-lg p-2 text-center">
                        <div className="text-gray-500 text-xs">Unique</div>
                        <div className="text-base font-bold text-gray-800">{analysis.uniqueWords}</div>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-lg p-2 text-center">
                        <div className="text-gray-500 text-xs">Score</div>
                        <div className="text-base font-bold text-blue-600">{analysis.score}</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Distribution */}
                  <div className="bg-white border border-gray-200 rounded-lg p-3">
                    <h3 className="text-sm font-bold text-gray-800 mb-2 flex items-center">
                      <BarChart className="mr-1 text-blue-500" size={16} /> Vocabulary Distribution
                    </h3>
                    <div className="space-y-1">
                      {getChartData().map(item => (
                        <div key={item.level} className="flex items-center">
                          <div className="w-6 font-medium text-gray-700 text-xs">{item.level}</div>
                          <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden mx-1">
                            <div 
                              className={`h-full ${item.color}`} 
                              style={{ width: `${Math.min(100, item.value * 100)}%` }}
                            ></div>
                          </div>
                          <div className="w-12 text-right text-xs">{(item.value * 100).toFixed(1)}%</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Text Analysis */}
                 <div className="bg-white border border-gray-200 rounded-lg p-3 mb-4">
                  <h3 className="text-sm font-bold text-gray-800 mb-2 flex items-center">
                    <FileText className="mr-1 text-blue-500" size={16} /> Feedback 💬
                  </h3>
                  <div 
                    className="p-2 bg-gray-50 border border-gray-200 rounded-lg max-h-24 overflow-y-auto text-sm"
                   
                  >{analysis.feedback}</div>
                  <div className="flex flex-wrap gap-1 mt-2 text-xs">
                    <span className="px-2 py-0.5 bg-blue-100 rounded text-xs">A1: Basic</span>
                    <span className="px-2 py-0.5 bg-green-100 rounded text-xs">A2: Elementary</span>
                    <span className="px-2 py-0.5 bg-yellow-100 rounded text-xs">B1: Intermediate</span>
                    <span className="px-2 py-0.5 bg-orange-100 rounded text-xs">B2: Upper Int.</span>
                    <span className="px-2 py-0.5 bg-red-100 rounded text-xs">C1: Advanced</span>
                    <span className="px-2 py-0.5 bg-purple-100 rounded text-xs">C2: Proficient</span>
                  </div>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-3 mb-4">
                  <h3 className="text-sm font-bold text-gray-800 mb-2 flex items-center">
                    <FileText className="mr-1 text-blue-500" size={16} /> Your Analyzed Text
                  </h3>
                  <div 
                    className="p-2 bg-gray-50 border border-gray-200 rounded-lg max-h-24 overflow-y-auto text-sm"
                    dangerouslySetInnerHTML={{ __html: getHighlightedText() }}
                  />
                  <div className="flex flex-wrap gap-1 mt-2 text-xs">
                    <span className="px-2 py-0.5 bg-blue-100 rounded text-xs">A1: Basic</span>
                    <span className="px-2 py-0.5 bg-green-100 rounded text-xs">A2: Elementary</span>
                    <span className="px-2 py-0.5 bg-yellow-100 rounded text-xs">B1: Intermediate</span>
                    <span className="px-2 py-0.5 bg-orange-100 rounded text-xs">B2: Upper Int.</span>
                    <span className="px-2 py-0.5 bg-red-100 rounded text-xs">C1: Advanced</span>
                    <span className="px-2 py-0.5 bg-purple-100 rounded text-xs">C2: Proficient</span>
                  </div>
                </div>

                
                {/* Actions */}
                <div className="flex justify-between">
                  <button 
                    onClick={restartAssessment}
                    className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200 text-sm"
                  >
                    Start Over
                  </button>
                  <button 
                    onClick={tryAgain}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 text-sm"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Styles for highlighted text */}
      <style jsx>{`
        .level-A1 { background-color: rgba(59, 130, 246, 0.2); }
        .level-A2 { background-color: rgba(16, 185, 129, 0.2); }
        .level-B1 { background-color: rgba(245, 158, 11, 0.2); }
        .level-B2 { background-color: rgba(249, 115, 22, 0.2); }
        .level-C1 { background-color: rgba(239, 68, 68, 0.2); }
        .level-C2 { background-color: rgba(147, 51, 234, 0.2); }
        .level-unknown { background-color: rgba(156, 163, 175, 0.2); }
      `}</style>
    </div>
  );
};

export default VocabularyAnalyzer;