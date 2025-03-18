import React, { useState, useRef, useEffect } from 'react';
import { X, Plus, BookOpen, Search, Save } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useUser } from '../components/UserContext';
import firebase from 'firebase/compat/app';
import 'firebase/compat/database';
import { toast } from 'react-hot-toast';

const ContextualVocabularyForm = ({setShowPreferences}) => {
  const [showForm, setShowForm] = useState(true);
  const [contextInterests, setContextInterests] = useState(['Business', 'Sports']);
  const [inputValue, setInputValue] = useState('');
  const [previewWord, setPreviewWord] = useState('accomplish');
  const [previewContext, setPreviewContext] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const {user, setUser} = useUser();
  
  const suggestedContexts = [
    { id: 'business', label: 'Business', icon: '💼' },
    { id: 'sports', label: 'Sports', icon: '🏆' },
    { id: 'technology', label: 'Technology', icon: '💻' },
    { id: 'medicine', label: 'Medicine', icon: '🏥' },
    { id: 'education', label: 'Education', icon: '🎓' },
    { id: 'travel', label: 'Travel', icon: '✈️' },
    { id: 'cooking', label: 'Cooking', icon: '🍳' },
    { id: 'music', label: 'Music', icon: '🎵' },
    { id: 'film', label: 'Movies', icon: '🎬' }
  ];
  
  const exampleWords = ['accomplish', 'strategy', 'coordinate', 'establish', 'generate'];
  
  // Load user preferences from context when component mounts
  useEffect(() => {
    if (user && user.preferences && user.preferences.contextInterests) {
      setContextInterests(user.preferences.contextInterests);
    } else if (user && user.uid) {
      // If not in context, try to fetch from Firebase
      const userRef = firebase.database().ref(`users/${user.uid}/preferences/contextInterests`);
      userRef.once('value')
        .then((snapshot) => {
          const firebasePreferences = snapshot.val();
          if (firebasePreferences && Array.isArray(firebasePreferences)) {
            setContextInterests(firebasePreferences);
          }
        })
        .catch((error) => {
          console.error("Error loading preferences from Firebase:", error);
        });
    }
  }, [user]);
  
  useEffect(() => {
    // Generate a contextual example when interests change
    if (contextInterests.length > 0) {
      const randomContext = contextInterests[Math.floor(Math.random() * contextInterests.length)];
      setPreviewContext(randomContext);
    } else {
      setPreviewContext('');
    }
  }, [contextInterests]);

  const getContextualDefinition = (word, context) => {
    if (!context) return "Please select at least one context to see examples.";
    
    const definitions = {
      accomplish: {
        Business: "To succeed in completing a business goal or target, such as meeting quarterly sales objectives.",
        Sports: "To achieve a sporting objective, like winning a championship or breaking a personal record.",
        Technology: "To successfully complete a technical task, such as deploying new software or fixing a critical bug.",
        Medicine: "To successfully complete a medical procedure or treatment plan with the desired outcome.",
        Education: "To successfully complete an educational goal, such as graduating with honors or mastering a subject.",
        Travel: "To successfully visit all planned destinations or experience all activities on a travel itinerary.",
        Cooking: "To successfully prepare a complex dish or master a challenging cooking technique.",
        Music: "To successfully perform a difficult piece or master a challenging musical technique.",
        Movies: "To successfully complete filming or accomplish a complex scene or special effect."
      },
      strategy: {
        Business: "A plan of action designed to achieve long-term business goals, such as market expansion.",
        Sports: "A plan developed by coaches and players to win games, like offensive or defensive game plans.",
        Technology: "A technical approach to solving complex problems or implementing system architecture.",
        Medicine: "A carefully designed treatment plan to address a patient's medical condition.",
        Education: "A planned approach to teaching or learning a subject effectively.",
        Travel: "A carefully planned itinerary that maximizes experiences while managing time and budget.",
        Cooking: "A methodical approach to preparing complex dishes or managing time in the kitchen.",
        Music: "A planned approach to composition, arrangement, or performance of musical pieces.",
        Movies: "A planned approach to storytelling, filming, or marketing a film production."
      },
      coordinate: {
        Business: "To organize different business departments to work together effectively on a project.",
        Sports: "To synchronize team movements in sports, like passing plays or defensive rotations.",
        Technology: "To align different software components or teams to work together in development.",
        Medicine: "To organize different aspects of patient care across medical specialties or departments.",
        Education: "To arrange educational activities or align curriculum across different subjects.",
        Travel: "To arrange transportation, accommodations, and activities to create a seamless journey.",
        Cooking: "To time different elements of a meal so they're ready to serve together.",
        Music: "To synchronize different instruments or voices to perform harmoniously together.",
        Movies: "To organize different production elements like cameras, lighting, and actors during filming."
      },
      establish: {
        Business: "To set up a new business entity or create a strong market presence.",
        Sports: "To create a new team record or set a precedent for performance standards.",
        Technology: "To implement new technical standards or create stable system foundations.",
        Medicine: "To confirm a diagnosis or create new treatment protocols based on research.",
        Education: "To create new educational programs or set academic standards.",
        Travel: "To create a base or home away from home when visiting a new destination.",
        Cooking: "To create signature dishes or cooking techniques that become well-known.",
        Music: "To create a distinctive sound or style that becomes recognized in the industry.",
        Movies: "To create new film techniques or establish a director's signature style."
      },
      generate: {
        Business: "To create new business opportunities, revenue streams, or product ideas.",
        Sports: "To create scoring opportunities or produce statistical advantages during games.",
        Technology: "To produce code, content, or data through automated processes or programming.",
        Medicine: "To produce new cells, tissue, or biological responses through medical interventions.",
        Education: "To create new ideas, theories, or educational content for learning.",
        Travel: "To create new experiences or memories through exploration and adventure.",
        Cooking: "To create new flavors, dishes, or culinary experiences through experimentation.",
        Music: "To create new melodies, harmonies, or musical compositions through inspiration.",
        Movies: "To create new scenes, special effects, or emotional responses through filmmaking."
      }
    };
    
    return definitions[word]?.[context] || `Definition example for "${word}" in ${context} context.`;
  };
  
  const handleChipInput = (e) => {
    setInputValue(e.target.value);
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      addChip(inputValue.trim());
    }
  };
  
  const addChip = (value) => {
    if (!contextInterests.includes(value)) {
      setContextInterests([...contextInterests, value]);
    }
    setInputValue('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  const removeChip = (chip) => {
    setContextInterests(contextInterests.filter(item => item !== chip));
  };
  
  const addSuggestedContext = (context) => {
    if (!contextInterests.includes(context.label)) {
      setContextInterests([...contextInterests, context.label]);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      if (user && user.uid) {
        // Save to Firebase
        await firebase.database().ref(`users/${user.uid}/preferences`).update({
          contextInterests: contextInterests
        });
        
        // Update user context
        const updatedUser = {
          ...user,
          preferences: {
            ...(user.preferences || {}),
            contextInterests: contextInterests
          }
        };
        
        setUser(updatedUser);
        
        toast.success('Your vocabulary context preferences have been saved!');
      } else {
        console.error("Cannot save preferences: User not authenticated");
        alert('Please log in to save your preferences.');
      }
    } catch (error) {
      console.error("Error saving preferences to Firebase:", error);
      toast.error('There was an error saving your preferences. Please try again.❌');
    } finally {
      setIsSaving(false);
      setShowPreferences(false);
    }
  };
  
  const changeExampleWord = () => {
    const randomWord = exampleWords[Math.floor(Math.random() * exampleWords.length)];
    setPreviewWord(randomWord);
  };
  
  const closePopup = () => {
    setShowPreferences(false);
  };

  if (!showForm) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 px-6 py-3 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <BookOpen className="mr-2" size={18} />
              <h2 className="text-lg font-bold">Personalized Learning</h2>
            </div>
  
            <button 
              className="text-red hover:text-gray-200 transition-colors"
              aria-label="Close"  
              onClick={closePopup}
            >
              <X size={18} />
            </button>
          </div>
          <p className="text-purple-100 mt-1 text-xs">Choose contexts that make vocabulary relevant to you</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Left Column */}
            <div className="md:w-1/2">
              {/* Context Interests Section */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-gray-700 font-medium text-sm">
                    I want vocabulary explained through:
                  </label>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                    {contextInterests.length} selected
                  </span>
                </div>
                
                {/* Chips display */}
                <div className="flex flex-wrap gap-2 mb-2 min-h-10 bg-gray-50 p-2 rounded-lg border border-gray-200">
                  {contextInterests.length > 0 ? (
                    contextInterests.map(chip => (
                      <div key={chip} className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full flex items-center shadow-sm">
                        {chip}
                        <button
                          type="button"
                          onClick={() => removeChip(chip)}
                          className="ml-1 text-purple-500 hover:text-purple-700 transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-400 text-xs italic px-2">
                      No contexts selected yet
                    </div>
                  )}
                </div>
                
                {/* Input with search icon */}
                <div className="flex relative">
                  <span className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none text-gray-400">
                    <Search size={14} />
                  </span>
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={handleChipInput}
                    onKeyDown={handleKeyDown}
                    className="flex-1 pl-8 pr-2 py-1.5 border border-gray-300 rounded-l-lg text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                    placeholder="Add a custom context..."
                  />
                  <button
                    type="button"
                    onClick={() => inputValue.trim() && addChip(inputValue.trim())}
                    className="px-2 py-1.5 bg-purple-600 text-white rounded-r-lg hover:bg-purple-700 transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
              
              {/* Suggested Categories */}
              <div className="mb-4">
                <label className="block text-gray-700 font-medium text-sm mb-1">
                  Popular contexts:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {suggestedContexts.map(context => (
                    <button
                      key={context.id}
                      type="button"
                      onClick={() => addSuggestedContext(context)}
                      disabled={contextInterests.includes(context.label)}
                      className={`text-xs px-2 py-1 rounded-full transition-colors flex items-center ${
                        contextInterests.includes(context.label)
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'
                      }`}
                    >
                      <span className="mr-1">{context.icon}</span>
                      {context.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Right Column */}
            <div className="md:w-1/2">
              {/* Preview Example */}
              <div className="mb-4 bg-indigo-50 rounded-lg p-3 border border-indigo-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center text-indigo-700 font-medium text-sm">
                    <span className="mr-1">💡</span>
                    See how it works
                  </div>
                  <button
                    type="button"
                    onClick={changeExampleWord}
                    className="text-xs text-indigo-600 hover:text-indigo-800 underline"
                  >
                    Try another word
                  </button>
                </div>
                
                <div className="mb-1">
                  <span className="font-bold text-gray-800">{previewWord}</span>
                  <span className="text-xs text-gray-500 ml-1 italic">verb</span>
                </div>
                
                {previewContext ? (
                  <div className="text-xs text-gray-700 bg-white p-2 rounded border border-indigo-100">
                    <div className="font-medium text-indigo-600 mb-1">{previewContext} Context:</div>
                    {getContextualDefinition(previewWord, previewContext)}
                  </div>
                ) : (
                  <div className="text-xs text-gray-500 italic">
                    Select at least one context to see examples.
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-purple-600 hover:to-indigo-700 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:ring-offset-2 transition-all shadow-md flex items-center disabled:opacity-70"
            >
              {isSaving ? (
                <>
                  <div className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={14} className="mr-1" />
                  Save My Preferences
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContextualVocabularyForm;