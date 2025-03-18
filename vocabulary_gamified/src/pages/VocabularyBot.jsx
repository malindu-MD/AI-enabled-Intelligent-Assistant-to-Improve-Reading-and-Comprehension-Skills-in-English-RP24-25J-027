import React, { useState, useEffect, useRef } from 'react';
import Draggable from 'react-draggable';
import { API_URL } from '../services/Config';
import { useUser } from '../components/UserContext';
const VocabularyBot = () => {

    const [position, setPosition] = useState({ x: 0, y: 0 });
  
    // Track if the chatbot is being dragged to prevent button clicks during drag
    const [isDragging, setIsDragging] = useState(false);

    
    // Handle start/stop dragging
    const handleStartDrag = () => setIsDragging(true);
    const handleStopDrag = () => {
      // Add a small delay before setting isDragging to false to prevent
      // immediate click events from firing
      setTimeout(() => setIsDragging(false), 10);
    };  
  // State management
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [learningStyle, setLearningStyle] = useState('visual');
  const [animations, setAnimations] = useState(true);

   const {user,setUser}=useUser();  
  
  // References
  const messagesEndRef = useRef(null);
  const chatboxRef = useRef(null);
  
  // List of suggested words
  const suggestedWords = [
    'serendipity', 'ephemeral', 'mellifluous', 'ubiquitous', 'pernicious',
    'eloquent', 'resilient', 'egregious', 'benevolent', 'meticulous'
  ];
  
  // Functions for chat functionality
  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      playSound('open');
    }
  };
  
  const handleInputChange = (e) => setInput(e.target.value);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const playSound = (type) => {
    // In a real app, this would play actual sounds
    console.log(`Playing ${type} sound`);
  };
  
  // Initialize the chat with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setTimeout(() => {
        setMessages([
          { 
            id: Date.now(), 
            sender: 'bot', 
            text: `👋 Hi ${user?.name} I'm Mr. Vocab, your vocabulary assistant! What word would you like to learn about today?`,
            special: 'welcome'
          }
        ]);
        
        setTimeout(() => {
          setMessages(prev => [
            ...prev,
            {
              id: Date.now() + 1,
              sender: 'bot',
              text: "Type any word to get its definition, examples, synonyms, and more!",
              special: 'tip'
            }
          ]);
        }, 1000);
      }, 500);
    }
  }, [isOpen, messages.length]);
  
  // Scroll to bottom when messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Function to handle sending a message
  const handleSendMessage = () => {
    if (input.trim() === '') return;
    
    // Add user message
    const userMessage = { id: Date.now(), sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    
    // Play sound effect
    playSound('send');
    
    // Get bot response
    getBotResponse(input);
    
    // Clear input field
    setInput('');
  };
  
  // Function to get bot response
  const getBotResponse = async (userInput) => {
    setIsLoading(true);
    const normalizedInput = userInput.trim().toLowerCase();

    
    const extractedWord = extractKeyword(normalizedInput);


    if (!extractedWord) {
      setMessages(prev => [
          ...prev,
          { id: Date.now(), sender: 'bot', text: `I couldn't understand your request. Please enter a valid word.`, special: 'error' }
      ]);
      setIsLoading(false);
      return;
  }

    
    // Handle special commands
    if (normalizedInput === 'help') {
      showHelp();
      return;
    }


    const userLevel = user?.level && user.level !== 'level' 
    ? user.level 
    : 'Elementary';


    const userPreference = user?.preferences?.contextInterests?.length > 0
  ? user.preferences.contextInterests[Math.floor(Math.random() * user.preferences.contextInterests.length)]
  : 'any';

  console.log(userLevel);
  console.log(userPreference);
    
    try {
      // Fetch data from the API
      const requestData = {
        word: extractedWord,
        level: userLevel,  // Make sure these values are properly set in your component
        preferences: userPreference
    };

    // Send a POST request to the API
    const response = await fetch(`${API_URL}/api/v1/wordexplanation/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
    });

      
      if (response.ok) {
        const wordData = await response.json();
        
        // Format the response based on learning style
        const formattedResponse = formatWordResponse(wordData, extractedWord);
        
        setMessages(prev => [
          ...prev, 
          { id: Date.now(), sender: 'bot', text: formattedResponse, special: 'definition' }
        ]);
      } else {
        // Word not found in API
        setMessages(prev => [
          ...prev, 
          { 
            id: Date.now(), 
            sender: 'bot', 
            text: `I don't have a definition for "${normalizedInput}" yet. Try another word, or check your spelling!`,
            special: 'unknown'
          }
        ]);
        
        // Suggest some advanced words
        setTimeout(() => {
          const suggestions = getRandomWords(3);
          setMessages(prev => [
            ...prev,
            { 
              id: Date.now() + 1, 
              sender: 'bot', 
              text: `How about trying one of these interesting words? ${suggestions.join(', ')}`,
              special: 'suggestion'
            }
          ]);
        }, 800);
      }
    } catch (error) {
      console.error('Error fetching word data:', error);
      
      setMessages(prev => [
        ...prev, 
        { 
          id: Date.now(), 
          sender: 'bot', 
          text: `Sorry, I'm having trouble connecting . Please try again later.`,
          special: 'error'
        }
      ]);
    }
    
    setIsLoading(false);
  };

  
  const ignoreWords = [
    'meaning', 'menaing', 'meenning', 'meanng',  
    'of', 'fo', 'ov',  
    'what', 'whatt', 'waht', 'wha',  
    'is', 'iz', 'i',  
    'the', 'teh', 'th',  
    'definition', 'defination', 'defenition', 'defintion', 'defie', 'difine',  
    'explain', 'expalin', 'exlpain', 'exlain', 'expalain',  
    'describe', 'descrbe', 'desribe', 'discribe',  
    'does', 'dose', 'doe',  
    'mean', 'mena', 'meen', 'mene',  
    'by', 'bi', 'bey',  
    'do', 'd',  
    'you', 'u', 'yuo', 'yo',  
    'understand', 'understad', 'uderstand', 'understnad',  
    'can', 'cn', 'cna',  
    'tell', 'tel', 'tlel',  
    'me', 'm', 'mee',  
    'about', 'abot', 'abaut', 'abt',  
    'who', 'wjo', 'wheo',  
    'where', 'wer', 'wher',  
    'when', 'whn', 'wen',  
    'how', 'hw', 'hwo'  
]; 


  const extractKeyword = (input) => {
    const cleanedInput = input.replace(/[^\w\s]/g, ''); 

    const words = cleanedInput.split(/\s+/); // Split by spaces

    for (const word of words) {
        if (!ignoreWords.includes(word)) {
            return word; // Return the first meaningful word
        }
    }
    
    return ''; // Return empty string if no valid word is found
};
  
  // Get random words from the suggestions list
  const getRandomWords = (count) => {
    const shuffled = [...suggestedWords].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };
  
  // Format word response based on learning style
  const formatWordResponse = (wordData, style) => {
    let response = `📚 **${style}**`;
    
    // if (wordData.pronunciation) {
    //   response += ` (${wordData.pronunciation})`;
    // }
    
    response += '\n\n';

    response += ` (${wordData.personalized_explanation})`;

    response += '\n\n';
    
    // switch (style) {
    //   case 'visual':
    //     response += `${wordData.emoji || '📝'} **Definition:**\n${wordData.definition}\n\n`;
        
    //     if (wordData.examples && wordData.examples.length > 0) {
    //       response += '**Examples:**\n';
    //       wordData.examples.forEach((example, index) => {
    //         response += `${index + 1}. "${example}"\n`;
    //       });
    //       response += '\n';
    //     }
        
    //     if (wordData.synonyms && wordData.synonyms.length > 0) {
    //       response += `**Synonyms:** ${wordData.synonyms.join(', ')}\n\n`;
    //     }
        
    //     if (wordData.antonyms && wordData.antonyms.length > 0) {
    //       response += `**Antonyms:** ${wordData.antonyms.join(', ')}\n\n`;
    //     }
        
    //     response += `**Difficulty:** ${wordData.difficulty}/5`;
    //     break;
        
    //   case 'verbal':
    //     response += `I'd describe "${wordData.word}" as ${wordData.definition}.\n\n`;
        
    //     if (wordData.examples && wordData.examples.length > 0) {
    //       response += "Here's how you might use it:\n";
    //       wordData.examples.forEach((example, index) => {
    //         response += `• "${example}"\n`;
    //       });
    //       response += '\n';
    //     }
        
    //     if (wordData.synonyms && wordData.synonyms.length > 0) {
    //       response += `You could also use words like: ${wordData.synonyms.join(', ')}\n\n`;
    //     }
        
    //     response += `This is generally considered a ${getDifficultyText(wordData.difficulty)} level word.`;
    //     break;
        
    //   case 'interactive':
    //     response += `**Definition:** ${wordData.definition}\n\n`;
        
    //     if (wordData.mnemonic) {
    //       response += `**Remember it:** ${wordData.mnemonic}\n\n`;
    //     }
        
    //     if (wordData.examples && wordData.examples.length > 0) {
    //       response += "**Try to fill in the blank:**\n";
    //       const example = wordData.examples[0];
    //       const blanked = example.replace(new RegExp(wordData.word, 'i'), '______');
    //       response += `"${blanked}"\n\n`;
    //     }
        
    //     response += `**Pro tip:** ${wordData.hint || "Try using this word in a sentence today!"}`;
    //     break;
        
    //   default:
    //     response += `**Definition:** ${wordData.definition}\n\n`;
        
    //     if (wordData.examples && wordData.examples.length > 0) {
    //       response += '**Examples:**\n';
    //       wordData.examples.forEach((example, index) => {
    //         response += `• "${example}"\n`;
    //       });
    //     }
    // }
    
    return response;
  };
  
  // Get difficulty text
  const getDifficultyText = (difficulty) => {
    switch (difficulty) {
      case 1: return 'very basic';
      case 2: return 'easy';
      case 3: return 'intermediate';
      case 4: return 'advanced';
      case 5: return 'expert';
      default: return 'intermediate';
    }
  };
  
  // Show help information
  const showHelp = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      setMessages(prev => [
        ...prev, 
        { 
          id: Date.now(), 
          sender: 'bot', 
          text: `**Commands you can use:**
• Type any word to get its definition and examples
• Type 'help' to see this message again
• Use the settings panel to change your learning style preferences

**Learning Styles:**
• Visual: Shows structured information with examples and synonyms
• Verbal: Explains the word in a conversational manner
• Interactive: Includes memory aids and exercises
`,
          special: 'help'
        }
      ]);
      
      setIsLoading(false);
    }, 800);
  };
  
  // Function to handle preferences change
  const handlePreferenceChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'learningStyle') {
      setLearningStyle(value);
    } else if (name === 'animations') {
      setAnimations(checked);
    }
  };
  
  // Function to handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };
  
  // CSS classes for animations
  const animationClasses = animations ? {
    messageContainer: "transition-all duration-300 ease-in-out",
    userMessage: "transform transition-all duration-300 ease-in-out",
    botMessage: "transform transition-all duration-300 ease-in-out",
    chatWindow: "transition-all duration-300 ease-in-out"
  } : {
    messageContainer: "",
    userMessage: "",
    botMessage: "",
    chatWindow: ""
  };
  
  // Render React component
  return (
    <div className="relative font-sans">
      {/* Teacher avatar with chat button */}
      <Draggable
        position={position}
        onStart={handleStartDrag}
        onStop={handleStopDrag}
        onDrag={(e, data) => setPosition({ x: data.x, y: data.y })}
        handle=".drag-handle" // Only allow dragging by this handle class
      >
      <div className="fixed bottom-6 right-6 flex flex-col items-center">
        <div className="relative drag-handle">
          <img 
            src='/Images/teacher.png'
            alt="Professor Avatar" 
            className={`w-16 h-16 rounded-full border-4 ${isOpen ? 'border-blue-500' : 'border-purple-600'} shadow-lg cursor-pointer transform transition-transform duration-300 ${isOpen ? 'scale-90' : 'hover:scale-110'}`}
            onClick={toggleChat}
          />
          {!isOpen && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center animate-pulse">
              1
            </div>
          )}
        </div>
        {!isOpen && (
          <div className="mt-2 px-3 py-1 bg-purple-600 text-white text-sm rounded-full shadow-lg animate-pulse">
            Need a definition?
          </div>
        )}
      </div>
      </Draggable>
      {/* Chat window */}
      <div className={`fixed bottom-24 right-6 w-80 sm:w-96 md:w-120 ${animationClasses.chatWindow} ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
        <div 
          ref={chatboxRef}
          className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl shadow-2xl overflow-hidden flex flex-col h-96 md:h-120"
        >
          {/* Chat header */}
          <div className="bg-opacity-30 bg-black p-3 text-white flex justify-between items-center border-b border-purple-400 border-opacity-30">
            <div className="flex items-center space-x-2">
              <img 
                src="/Images/teacher.png" 
                alt="Professor" 
                className="w-10 h-10 rounded-full border-2 border-white"
              />
              <div>
                <h3 className="font-bold text-lg">Mr. Vocab</h3>
                <div className="text-xs text-purple-200">Vocabulary Expert</div>
              </div>
            </div>
            <div className="flex items-center">
              <button 
                onClick={() => {
                  document.getElementById('settings-panel').classList.toggle('hidden');
                }}
                className="text-white hover:text-yellow-200 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Settings panel */}
          <div id="settings-panel" className="hidden absolute top-16 right-0 w-64 bg-white shadow-lg rounded-lg p-4 z-10 border border-purple-200">
            <h4 className="font-bold text-purple-800 mb-3">Settings</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Learning Style</label>
                <select
                  name="learningStyle"
                  value={learningStyle}
                  onChange={handlePreferenceChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="visual">Visual (Images & Text)</option>
                  <option value="verbal">Verbal (Conversational)</option>
                  <option value="interactive">Interactive (Exercises)</option>
                </select>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="animations"
                  name="animations"
                  checked={animations}
                  onChange={handlePreferenceChange}
                  className="mr-2 h-4 w-4 text-purple-600"
                />
                <label htmlFor="animations" className="text-sm text-gray-700">Enable animations</label>
              </div>
              <div className="pt-2 border-t border-gray-200">
                <button
                  onClick={() => showHelp()}
                  className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-sm transition-colors"
                >
                  View Help
                </button>
              </div>
            </div>
          </div>
          
          {/* Chat messages area */}
          <div className="flex-1 p-4 overflow-y-auto bg-white bg-opacity-10 backdrop-blur-sm">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div 
                  key={message.id} 
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} ${animationClasses.messageContainer}`}
                  style={{ transitionDelay: `${index * 0.05}s` }}
                >
                  <div 
                    className={`max-w-3/4 px-4 py-3 rounded-2xl ${
                      message.sender === 'user' 
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-none shadow-lg' 
                        : message.special === 'definition'
                          ? 'bg-gradient-to-r from-purple-100 to-indigo-100 text-gray-800 rounded-bl-none shadow-md border border-purple-200'
                          : message.special === 'unknown'
                            ? 'bg-gradient-to-r from-red-100 to-pink-100 text-gray-800 rounded-bl-none shadow-md border border-red-200'
                            : message.special === 'error'
                              ? 'bg-gradient-to-r from-red-100 to-red-200 text-gray-800 rounded-bl-none shadow-md border border-red-300'
                            : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 rounded-bl-none shadow-md border border-gray-200'
                    } ${message.sender === 'user' ? animationClasses.userMessage : animationClasses.botMessage}`}
                  >
                    {message.sender === 'bot' ? (
                      <div className="whitespace-pre-line">
                        {message.text.split('\n').map((line, i) => {
                          // Handle bold text marked with **
                          if (line.startsWith('**') && line.endsWith('**')) {
                            return <p key={i} className="font-bold">{line.replace(/\*\*/g, '')}</p>;
                          } else if (line.startsWith('**')) {
                            // Handle line starting with bold
                            const parts = line.split('**');
                            return (
                              <p key={i} className="mt-1">
                                <span className="font-bold">{parts[1]}</span>
                                {parts[2]}
                              </p>
                            );
                          } else if (line.includes('**')) {
                            // Handle inline bold
                            const parts = line.split('**');
                            return (
                              <p key={i} className="mt-1">
                                {parts[0]}
                                {parts.slice(1).map((part, j) => 
                                  j % 2 === 0 
                                    ? <span key={j} className="font-bold">{part}</span> 
                                    : part
                                )}
                              </p>
                            );
                          } else {
                            return <p key={i} className="mt-1">{line}</p>;
                          }
                        })}
                      </div>
                    ) : (
                      <div>{message.text}</div>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Typing indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-200 px-4 py-2 rounded-full rounded-bl-none">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>
          
          {/* Input area */}
          <div className="bg-white bg-opacity-20 backdrop-blur-sm p-3 border-t border-purple-400 border-opacity-30">
            <div className="flex items-center bg-white bg-opacity-90 rounded-full shadow-inner">
              <input
                type="text"
                value={input}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Type a word to learn its definition..."
                className="flex-1 px-4 py-2 bg-transparent rounded-l-full focus:outline-none"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                className={`${
                  isLoading ? 'bg-gray-400' : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
                } text-white px-5 py-2 rounded-r-full mr-1 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </div>
            
            {/* Quick suggestion buttons */}
            <div className="flex justify-center mt-2 space-x-2">
              <button 
                onClick={() => getBotResponse('help')}
                className="px-3 py-1 text-xs bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors"
              >
                Help
              </button>
              <button 
                onClick={() => {
                  // Get a random word suggestion
                  const randomWord = getRandomWords(1)[0];
                  setInput(randomWord);
                }}
                className="px-3 py-1 text-xs bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
              >
                Random Word
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VocabularyBot;