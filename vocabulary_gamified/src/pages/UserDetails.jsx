import React, { useState, useEffect } from 'react';
import EmotionCapture from '../components/EmotionCapture';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../components/UserContext';

const UserDetails = () => {
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    age: '',
    grade: '',
    interests: []
  });

  // Emotion tracking states
  const [emotionData, setEmotionData] = useState([]);
  const [emotionHistory, setEmotionHistory] = useState([]);
console.log('emohitporyty',emotionHistory);
  // Handle emotion capture
  const handleEmotionCapture = async (imageData) => {
    try {
      const response = await fetch('https://h8d7t2rqxi.execute-api.ap-south-1.amazonaws.com/default/imagedetect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageData })
      });

      const emotionResults = await response.json();
      setEmotionData('dsdfs',emotionResults.Emotions);
      setEmotionHistory(prev => [...prev, {
        timestamp: new Date().toISOString(),
        emotions: emotionResults.emotions.FaceDetails[0].Emotions,
        question: currentQuestion
          }]);
    } catch (error) {
      console.error('Error analyzing emotions:', error);
    }
  };

  // Available interest topics
  const interestTopics = [
    { id: 'food-health', name: 'Food & Health', icon: '🍎' },
    { id: 'places-travel', name: 'Places & Travel', icon: '✈️' },
    { id: 'festivals-celebrations', name: 'Festivals & Celebrations', icon: '🎉' },
    { id: 'folktales', name: 'Folktales', icon: '📖' },
    { id: 'fiction', name: 'Fiction', icon: '📚' },
    { id: 'science', name: 'Science', icon: '🔬' },
    { id: 'heroes', name: 'Heroes', icon: '🦸' },
    { id: 'cartoons', name: 'Cartoons', icon: '🎨' },
    { id: 'animals', name: 'Animals', icon: '🐾' },
    { id: 'vehicles', name: 'Vehicles', icon: '🚗' },
    { id: 'fairytales', name: 'Fairytales', icon: '🧚' },
    { id: 'sports', name: 'Sports', icon: '⚽' },
    { id: 'nature', name: 'Nature', icon: '🌿' }
  ];

  // CEFR levels for assessment
  const cefrLevels = ['A1', 'A2', 'B1', 'B2'];
  
  // Assessment state
  const [assessmentMode, setAssessmentMode] = useState(false);
  const [currentLevel, setCurrentLevel] = useState(0); // Index of cefrLevels array
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [assessmentComplete, setAssessmentComplete] = useState(false);
  const [determinedLevel, setDeterminedLevel] = useState('');
  
  // Sample assessment content for each CEFR level
  const [assessmentContent, setAssessmentContent] = useState({
    'A1': {
      paragraph: 'My name is John. I am 25 years old. I live in New York. I like to play soccer. I have a dog. His name is Max. I go to work by bus. I eat breakfast at 7 AM. I sleep at 10 PM.',
      questions: [
        {
          id: 'a1q1',
          question: 'How old is John?',
          options: ['20 years old', '25 years old', '30 years old', '35 years old'],
          correctAnswer: 1
        },
        {
          id: 'a1q2',
          question: 'Where does John live?',
          options: ['London', 'Paris', 'New York', 'Tokyo'],
          correctAnswer: 2
        },
        {
          id: 'a1q3',
          question: 'What is the name of John\'s dog?',
          options: ['Rex', 'Max', 'Buddy', 'Charlie'],
          correctAnswer: 1
        }
      ]
    },
    'A2': {
      paragraph: 'Last weekend, I went to the beach with my friends. We swam in the ocean and played volleyball. The weather was sunny and warm. We had a picnic for lunch. I took many photos with my camera. In the evening, we watched the sunset. It was a beautiful day.',
      questions: [
        {
          id: 'a2q1',
          question: 'Where did the person go last weekend?',
          options: ['To the mountains', 'To the beach', 'To the park', 'To the cinema'],
          correctAnswer: 1
        },
        {
          id: 'a2q2',
          question: 'What was the weather like?',
          options: ['Rainy and cold', 'Cloudy and windy', 'Sunny and warm', 'Snowy and freezing'],
          correctAnswer: 2
        },
        {
          id: 'a2q3',
          question: 'What did they do in the evening?',
          options: ['Went home early', 'Watched the sunset', 'Had dinner at a restaurant', 'Went swimming'],
          correctAnswer: 1
        }
      ]
    },
    'B1': {
      paragraph: 'Environmental protection has become a major concern in recent years. Many countries are implementing policies to reduce pollution and conserve natural resources. Recycling programs have been established in cities around the world. Some governments are promoting renewable energy sources like solar and wind power. Individuals can also contribute by using less plastic, saving water, and using public transportation instead of private cars.',
      questions: [
        {
          id: 'b1q1',
          question: 'What is the main topic of this paragraph?',
          options: ['Global warming', 'Environmental protection', 'Renewable energy', 'Government policies'],
          correctAnswer: 1
        },
        {
          id: 'b1q2',
          question: 'What are some examples of renewable energy mentioned in the text?',
          options: ['Coal and natural gas', 'Solar and wind power', 'Nuclear and hydroelectric', 'Oil and petroleum'],
          correctAnswer: 1
        },
        {
          id: 'b1q3',
          question: 'How can individuals help protect the environment according to the text?',
          options: ['By voting for green parties', 'By donating to environmental organizations', 'By using less plastic and saving water', 'By studying environmental science'],
          correctAnswer: 2
        }
      ]
    },
    'B2': {
      paragraph: 'The digital revolution has transformed how we communicate, work, and access information. While technology offers numerous benefits, it also presents challenges such as privacy concerns and digital addiction. Social media platforms connect people globally but may contribute to feelings of isolation and anxiety. Remote work opportunities have increased flexibility but blurred the boundaries between professional and personal life. As we navigate this digital landscape, finding a balance between embracing innovation and maintaining human connection remains crucial.',
      questions: [
        {
          id: 'b2q1',
          question: 'What paradox does the text suggest about social media?',
          options: ['It is expensive but necessary', 'It connects people but may cause isolation', 'It is popular but declining in use', 'It is educational but boring'],
          correctAnswer: 1
        },
        {
          id: 'b2q2',
          question: 'According to the text, what effect has remote work had?',
          options: ['Decreased productivity', 'Increased work hours', 'Blurred work-life boundaries', 'Reduced job opportunities'],
          correctAnswer: 2
        },
        {
          id: 'b2q3',
          question: 'What does the author suggest is important in dealing with digital technology?',
          options: ['Completely avoiding technology', 'Finding balance between technology and human connection', 'Focusing only on innovation', 'Returning to pre-digital communication methods'],
          correctAnswer: 1
        }
      ]
    }
  });

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle interest topic selection
  const handleInterestToggle = (topicId) => {
    setFormData(prevData => {
      if (prevData.interests.includes(topicId)) {
        return {
          ...prevData,
          interests: prevData.interests.filter(id => id !== topicId)
        };
      } else {
        return {
          ...prevData,
          interests: [...prevData.interests, topicId]
        };
      }
    });
  };

  // Start the CEFR level assessment
  const startAssessment = () => {
    // Validate form data
    if (!formData.firstName || !formData.lastName || !formData.age || !formData.grade || formData.interests.length === 0) {
      alert('Please fill in all fields and select at least one interest topic.');
      return;
    }
    
    setAssessmentMode(true);
    setCurrentLevel(0);
    setCurrentQuestion(0);
    setUserAnswers({});
  };

  // Handle answer selection in assessment
  const handleAnswerSelect = (questionId, optionIndex) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  // Move to next question or level in assessment
  const nextQuestion = () => {
    const currentLevelQuestions = assessmentContent[cefrLevels[currentLevel]].questions;
    
    if (currentQuestion < currentLevelQuestions.length - 1) {
      // Move to next question in current level
      setCurrentQuestion(currentQuestion + 1);
    } else if (currentLevel < cefrLevels.length - 1) {
      // Move to next level
      setCurrentLevel(currentLevel + 1);
      setCurrentQuestion(0);
    } else {
      // Assessment complete
      completeAssessment();
    }
  };

  // Complete the assessment and determine CEFR level
  const completeAssessment = () => {
    // Calculate correct answers for each level
    const levelScores = {};
    
    cefrLevels.forEach(level => {
      const questions = assessmentContent[level].questions;
      let correctCount = 0;
      
      questions.forEach(question => {
        if (userAnswers[question.id] === question.correctAnswer) {
          correctCount++;
        }
      });
      
      levelScores[level] = correctCount / questions.length;
    });
    
    // Determine the user's CEFR level based on scores
    let determinedLevel = 'A1'; // Default to lowest level
    
    if (levelScores['B2'] >= 0.7) {
      determinedLevel = 'B2';
    } else if (levelScores['B1'] >= 0.7) {
      determinedLevel = 'B1';
    } else if (levelScores['A2'] >= 0.7) {
      determinedLevel = 'A2';
    }
    
    setDeterminedLevel(determinedLevel);
    setAssessmentComplete(true);
  };

  // Save user data and navigate to dashboard
  const saveUserData = async (userData, emotionData, quizResults) => {
    try {
      const geminiResponse = await fetch('https://gemini-api.com', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Analyze user performance based on:
          Emotions: ${emotionData}
          Correct Answers: ${quizResults.correct}
          Incorrect Answers: ${quizResults.incorrect}
          Suggest appropriate CEFR level.`
            }]
          }]
        })
      });
  
      const geminiData = await geminiResponse.json();
      const cefrLevel = geminiData.choices[0].message.content;
  
      await setDoc(doc(db, 'userdata', userData.email), {
        firstName: userData.firstName,
        lastName: userData.lastName,
        age: userData.age,
        grade: userData.grade,
        topics: userData.topics,
        level: cefrLevel,
        points: quizResults.points,
        email: userData.email,
        timestamp: new Date()
      });
  
      console.log('User data saved successfully');
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };

  return (
    <div className="min-h-screen bg-indigo-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-indigo-700 mb-6">
            {!assessmentMode ? 'User Profile Setup' : 
             assessmentComplete ? 'Assessment Complete' : 
             `CEFR Level Assessment - ${cefrLevels[currentLevel]}`}
          </h1>
          
          {!assessmentMode && (
            <div className="space-y-6">
              {/* Personal Information Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                    min="5"
                    max="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grade/Year</label>
                  <select
                    name="grade"
                    value={formData.grade}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="">Select Grade/Year</option>
                    <option value="1">Grade 1</option>
                    <option value="2">Grade 2</option>
                    <option value="3">Grade 3</option>
                    <option value="4">Grade 4</option>
                    <option value="5">Grade 5</option>
                    <option value="6">Grade 6</option>
                    <option value="7">Grade 7</option>
                    <option value="8">Grade 8</option>
                    <option value="9">Grade 9</option>
                    <option value="10">Grade 10</option>
                    <option value="11">Grade 11</option>
                    <option value="12">Grade 12</option>
                    <option value="college">College/University</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              
              {/* Interest Topics */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Interest Topics (Select at least one)</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {interestTopics.map(topic => (
                    <div 
                      key={topic.id}
                      onClick={() => handleInterestToggle(topic.id)}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors flex items-center ${formData.interests.includes(topic.id) ? 'bg-indigo-100 border-indigo-500' : 'bg-white border-gray-300 hover:bg-gray-50'}`}
                    >
                      <span className="text-xl mr-2">{topic.icon}</span>
                      <span>{topic.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-8">
                <button
                  onClick={startAssessment}
                  className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors font-medium text-lg"
                >
                  Continue to Level Assessment
                </button>
              </div>
            </div>
          )}
          
          {assessmentMode && !assessmentComplete && (
            <div className="space-y-6">
              <EmotionCapture
                onCapture={handleEmotionCapture}
                interval={5000}
              />
              {/* CEFR Level Assessment */}
              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-500">Level: {cefrLevels[currentLevel]}</span>
                  <span className="text-sm font-medium text-gray-500">Question {currentQuestion + 1} of {assessmentContent[cefrLevels[currentLevel]].questions.length}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-indigo-600 h-2.5 rounded-full" 
                    style={{ width: `${((currentLevel * 3 + currentQuestion + 1) / (cefrLevels.length * 3)) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Reading Paragraph */}
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-3">Read the following paragraph:</h3>
                <p className="text-gray-700 leading-relaxed">
                  {assessmentContent[cefrLevels[currentLevel]].paragraph}
                </p>
              </div>
              
              {/* Question */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-lg font-medium text-gray-800 mb-4">
                  {assessmentContent[cefrLevels[currentLevel]].questions[currentQuestion].question}
                </h3>
                <div className="space-y-3">
                  {assessmentContent[cefrLevels[currentLevel]].questions[currentQuestion].options.map((option, index) => (
                    <div 
                      key={index}
                      onClick={() => handleAnswerSelect(assessmentContent[cefrLevels[currentLevel]].questions[currentQuestion].id, index)}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${userAnswers[assessmentContent[cefrLevels[currentLevel]].questions[currentQuestion].id] === index ? 'bg-indigo-100 border-indigo-500' : 'bg-white border-gray-300 hover:bg-gray-50'}`}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-6">
                <button
                  onClick={nextQuestion}
                  disabled={userAnswers[assessmentContent[cefrLevels[currentLevel]].questions[currentQuestion].id] === undefined}
                  className={`w-full py-3 px-6 rounded-lg font-medium text-lg ${userAnswers[assessmentContent[cefrLevels[currentLevel]].questions[currentQuestion].id] !== undefined ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                >
                  {currentLevel === cefrLevels.length - 1 && currentQuestion === assessmentContent[cefrLevels[currentLevel]].questions.length - 1 ? 'Complete Assessment' : 'Next Question'}
                </button>
              </div>
            </div>
          )}
          
          {assessmentComplete && (
            <div className="text-center space-y-6">
              <div className="bg-indigo-50 p-8 rounded-lg border border-indigo-200 inline-block">
                <h2 className="text-2xl font-bold text-indigo-700 mb-2">Your English Level</h2>
                <div className="text-5xl font-bold text-indigo-600 mb-3">{determinedLevel}</div>
                <p className="text-gray-600">
                  {determinedLevel === 'A1' && 'Beginner - You can understand and use familiar everyday expressions and very basic phrases.'}
                  {determinedLevel === 'A2' && 'Elementary - You can communicate in simple and routine tasks requiring a simple and direct exchange of information.'}
                  {determinedLevel === 'B1' && 'Intermediate - You can deal with most situations likely to arise while traveling in an area where the language is spoken.'}
                  {determinedLevel === 'B2' && 'Upper Intermediate - You can interact with a degree of fluency and spontaneity that makes regular interaction with native speakers quite possible.'}
                </p>
              </div>
              
              <button
                onClick={saveUserData}
                className="bg-indigo-600 text-white py-3 px-8 rounded-lg hover:bg-indigo-700 transition-colors font-medium text-lg"
              >
                Continue to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
