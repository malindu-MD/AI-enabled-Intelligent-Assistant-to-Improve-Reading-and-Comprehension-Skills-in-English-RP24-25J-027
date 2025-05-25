import React, { useState, useEffect } from "react";
import { ref, get, set, update } from "firebase/database";
import { initializeRealtimeDB } from "../config/firebaseConfig";
import EmotionCapture from "./EmotionCapture";
import { useUser } from './UserContext';
import { useNavigate } from "react-router-dom";

const MCQAssessment3= () => {
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [assessmentComplete, setAssessmentComplete] = useState(false);
  const [emotionHistory, setEmotionHistory] = useState([]);
  const [finalEmotion, setFinalEmotion] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roundScore,setRoundScore]=useState(0);

  useEffect(() => {
    console.log("Fetching user and generating questions...");
    const fetchUserAndGenerateQuestions = async () => {
      const db = initializeRealtimeDB();
      const email = user.validKey;
      const userRef = ref(db, `userdata/${email}`);
      const errorPatternRef = ref(db, `errorPatterns/${email}`);

      try {
        const [userSnap, errorSnap] = await Promise.all([get(userRef), get(errorPatternRef)]);
        const userData = userSnap.exists() ? userSnap.val() : {};
        const errorData = errorSnap.exists() ? errorSnap.val() : {};
        const latestAnalysis = errorData.analysis?.slice(-1)[0]?.summary || "";

        const userLevel = userData.level || 1;

        // Generate prompt for Gemini
        const prompt = `
You are an expert reading comprehension tutor. Based on this student's current level level(cefr A2) and their past error pattern analysis, generate 3 multiple choice comprehension questions with 3 options each. Each question should include:

1. A short paragraph (3-5 sentences).
2. One question based on the paragraph.
3. Three answer options.
4. The index of the correct answer (0-based).
5. Tags describing the skill (e.g., "vocabulary", "grammar").

Error pattern summary: 
${latestAnalysis}

Respond in this JSON format:

[
  {
    "id": "q1",
    "paragraph": "....",
    "question": "....",
    "options": ["...","...","..."],
    "correctAnswer": 1,
    "tags": ["grammar"]
  },
  ...
]
`;

        // Call Gemini API
        const response = await fetch(
          "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyA78rw7GrB4eXQi2XtJkapwRPBbDJad3F0",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
            }),
          }
        );

        const result = await response.json();
        console.log("Gemini Response:", result);
        
        // Extract JSON from Gemini response
        const match = result?.candidates?.[0]?.content?.parts?.[0]?.text?.match(
          /```json\n([\s\S]*?)\n```/
        );
        
        let mcqData = match ? JSON.parse(match[1]) : [];
        
        // Fallback to default questions if API fails or returns empty
        if (mcqData.length === 0) {
          mcqData = [
            {
              id: "q1",
              question: "What is the main topic of this paragraph?",
              paragraph: "Environmental protection has become a major concern in recent years. Many countries are implementing policies to reduce pollution and conserve natural resources. Recycling programs have been established in cities around the world.",
              options: ["Global warming", "Environmental protection", "Renewable energy"],
              correctAnswer: 1,
              tags: ["vocabulary"],
            },
            {
              id: "q2",
              question: "What are some examples of renewable energy mentioned in the text?",
              paragraph: "Some governments are promoting renewable energy sources like solar and wind power. These sustainable solutions help reduce our dependence on fossil fuels and combat climate change.",
              options: ["Coal and natural gas", "Solar and wind power", "Nuclear and hydroelectric"],
              correctAnswer: 1,
              tags: ["grammar"],
            },
            {
              id: "q3",
              question: "How can individuals help protect the environment?",
              paragraph: "Individuals can contribute to environmental protection in many ways. Using less plastic, saving water, and choosing public transportation over private cars are effective methods to reduce our environmental impact.",
              options: ["By voting for green parties", "By donating to organizations", "By reducing plastic use and saving water"],
              correctAnswer: 2,
              tags: ["grammar"],
            }
          ];
        }

        setQuestions(mcqData);
        console.log("Generated Questions:", mcqData);
        
        // Set start time for first question
        if (mcqData.length > 0) {
          setUserAnswers({
            [mcqData[0].id]: {
              startTime: new Date(),
            },
          });
        }
        
      } catch (err) {
        console.error("Error generating questions:", err);
        // Fallback to default questions if there's an error
        setQuestions([
          {
            id: "q1",
            question: "What is the main topic of this paragraph?",
            paragraph: "Environmental protection has become a major concern in recent years. Many countries are implementing policies to reduce pollution and conserve natural resources. Recycling programs have been established in cities around the world.",
            options: ["Global warming", "Environmental protection", "Renewable energy"],
            correctAnswer: 1,
            tags: ["vocabulary"],
          },
          {
            id: "q2",
            question: "What are some examples of renewable energy mentioned in the text?",
            paragraph: "Some governments are promoting renewable energy sources like solar and wind power. These sustainable solutions help reduce our dependence on fossil fuels and combat climate change.",
            options: ["Coal and natural gas", "Solar and wind power", "Nuclear and hydroelectric"],
            correctAnswer: 1,
            tags: ["grammar"],
          },
          {
            id: "q3",
            question: "How can individuals help protect the environment?",
            paragraph: "Individuals can contribute to environmental protection in many ways. Using less plastic, saving water, and choosing public transportation over private cars are effective methods to reduce our environmental impact.",
            options: ["By voting for green parties", "By donating to organizations", "By reducing plastic use and saving water"],
            correctAnswer: 2,
            tags: ["grammar"],
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndGenerateQuestions();
  }, []);

  const handleEmotionCapture = async (imageData) => {
    try {
      const response = await fetch(
        "https://h8d7t2rqxi.execute-api.ap-south-1.amazonaws.com/default/imagedetect",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: imageData }),
        }
      );

      const emotionResults = await response.json();
      setEmotionHistory((prev) => [
        ...prev,
        {
          timestamp: new Date().toISOString(),
          emotions: emotionResults.emotions.FaceDetails[0].Emotions,
          question: currentQuestion,
        },
      ]);
    } catch (error) {
      console.error("Error analyzing emotions:", error);
    }
  };

  const handleAnswerSelect = (optionIndex) => {
    const startTime =
      userAnswers[questions[currentQuestion].id]?.startTime || new Date();
    const timeSpent = new Date() - startTime;

    setUserAnswers((prev) => ({
      ...prev,
      [questions[currentQuestion].id]: {
        selectedOption: optionIndex,
        timeSpent,
        isCorrect: optionIndex === questions[currentQuestion].correctAnswer,
        tags: questions[currentQuestion].tags,
        startTime: prev[questions[currentQuestion].id]?.startTime || startTime,
      },
    }));
  };

  const nextQuestion = async () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      // Set start time for next question
      setUserAnswers((prev) => ({
        ...prev,
        [questions[currentQuestion + 1].id]: {
          startTime: new Date(),
        },
      }));
    } else {
      await completeAssessment();
    }
  };

  const completeAssessment = async () => {
    try {
      const email = user.validKey;
      const db = initializeRealtimeDB();
      console.log("Emotion History:", emotionHistory);
      
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyA78rw7GrB4eXQi2XtJkapwRPBbDJad3F0",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Analyze the emotion history and current emotion data to provide a complete emotional profile. Consider the progression of emotions throughout the assessment:

Emotion History:
${JSON.stringify(emotionHistory, null, 2)}

Required Output Format:
{
  "Emotions": [
    {
      "Type": "HAPPY",
      "Confidence": number
    },
    {
      "Type": "CALM", 
      "Confidence": number
    },
    // Include all 8 emotion types
  ],
  "EmotionalProgression": {
    "Pattern": "string describing emotional changes",
    "Recommendations": "suggestions based on emotional patterns"
  }
}`,
                  },
                ],
              },
            ],
          }),
        }
      );

      const result = await response.json();
      const emotionData = JSON.parse(
        result.candidates[0].content.parts[0].text.match(
          /```json\n([\s\S]*?)\n```/
        )[1]
      );
      
      console.log("Emotion Data:", emotionData);
      let levelPrediction;
      if (emotionData) {
        const apiData = {
          answers: Object.values(userAnswers).map((answer) => ({
            is_correct: answer.isCorrect,
            time_spent: answer.timeSpent,
            tags: answer.tags,
          })),
          response_times: Object.values(userAnswers).map(
            (answer) => answer.timeSpent
          ),
          emotion_data: {
            Emotions: emotionData.Emotions,
          },
          difficulty_level: 2,
        };

        console.log("API Data:", apiData);
        
        const response = await fetch(
          "https://h8d7t2rqxi.execute-api.ap-south-1.amazonaws.com/default/levelPrediction",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(apiData),
          }
        );
        
        const result = await response.json();
        levelPrediction=result;
        setRoundScore(result.final_score);
        console.log("Level Prediction:", result);
      } else {
        console.warn('No valid emotion data found');
      }
      
      setAssessmentComplete(true);

      // Analyze error patterns for wrong answers
      const wrongAnswers = Object.entries(userAnswers).filter(([id, answer]) => !answer.isCorrect);

      if (wrongAnswers.length > 0) {
        const errorPatternPrompt = wrongAnswers.map(([id, answer]) => {
          const question = questions.find(q => q.id === id);
          return `Question: ${question.question}\n` +
                 `Context: ${question.paragraph}\n` +
                 `Selected Answer: ${question.options[answer.selectedOption]}\n` +
                 `Correct Answer: ${question.options[question.correctAnswer]}\n` +
                 `Time Spent: ${answer.timeSpent}ms\n`;
        }).join('\n');

        const response1 = await fetch(
          "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyA78rw7GrB4eXQi2XtJkapwRPBbDJad3F0",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: `Analyze the following wrong answers and identify error patterns. For each wrong answer, provide:
                  1. Error Pattern Type (e.g., comprehension, vocabulary, time management)
                  2. Specific Issues (what concepts or skills were misunderstood)
                  3. Suggested Improvements
                  4. Related Skills to Practice

                  Questions and Answers:\n${errorPatternPrompt}`
                }]
              }]
            })
          }
        );

        const result1 = await response1.json();
        console.log("Error Analysis:", result1);
        const errorAnalysis = result1.candidates[0].content.parts[0].text;
        console.log("Error Analysis:", errorAnalysis);
       
        // Save error patterns to Firebase
        const errorPatternRef = ref(db, `errorPatterns/${email}`);

        get(errorPatternRef).then(snapshot => {
          const existingData = snapshot.val();
          const existingAnalysis = existingData?.analysis || [];

          const newAnalysis = {
            timestamp: new Date().toISOString(),
            wrongAnswers: wrongAnswers.map(([id, answer]) => ({
              questionId: id,
              selectedAnswer: questions.find(q => q.id === id).options[answer.selectedOption],
              correctAnswer: questions.find(q => q.id === id).options[questions.find(q => q.id === id).correctAnswer],
              timeSpent: answer.timeSpent
            })),
            summary: errorAnalysis
          };

          const updatedErrorPattern = {
            ...existingData,
            analysis: [...existingAnalysis, newAnalysis]
          };

          return set(errorPatternRef, updatedErrorPattern);
        }).catch(error => {
          console.error('Error saving error pattern:', error);
        });
      }

      // Update user data
      const userRef = ref(db, `userdata/${email}`);
      
      try {
        const snapshot = await get(userRef);
        let valueget =snapshot.val();
        let correctCount = 0;
        let incorrectCount = 0;
        let timeSpent = userAnswers.q1.timeSpent + userAnswers.q2.timeSpent + userAnswers.q3.timeSpent;
        let avg=(valueget.totalTime+timeSpent)/(valueget.questionCount+3);
console.log("Average:", avg);

       // Calculate correct and incorrect answers based on userAnswers
       // Calculate correct and incorrect answers based on userAnswers
       if(userAnswers.q1.isCorrect){
        correctCount++;
       }else{
        incorrectCount++;
       }
       if(userAnswers.q2.isCorrect){
        correctCount++;
       }else{
        incorrectCount++;
       }
       
       if(userAnswers.q3.isCorrect){
        correctCount++;
       }else{
        incorrectCount++;
       }
       console.log("Correct Count:", correctCount);
        console.log("Incorrect Count:", incorrectCount);
        console.log("Levessssssl Prediction:", userAnswers);
        const userData = {
          totalPoints: valueget.totalPoints+levelPrediction.final_score,
          correctCount: valueget.correctCount+correctCount,
          incorrectCount: valueget.incorrectCount+incorrectCount,
          questionCount: valueget.incorrectCount+incorrectCount+correctCount,
          averageTime: avg,
          level:2,
          totalTime: valueget.totalTime+timeSpent,
          lastAttempt: new Date().toISOString()
        };      
      
        if (snapshot.exists()) {
          await update(userRef, userData);
          console.log("User updated successfully");
        } else {
          await set(userRef, userData);
          console.log("New user created successfully");
        }
      
      } catch (error) {
        console.error("Error accessing Firebase:", error);
      }
    } catch (error) {
      console.error("Error analyzing emotions with Gemini:", error);
    }
  };
  const nextRoundDecider = () => {
    console.log("Round Score:", roundScore);
    if (roundScore < 2) {
      navigate('/paragraph')
    }else{
      navigate('/mcq4')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-indigo-50 p-6 flex items-center justify-center">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-8 text-center">
          <h1 className="text-3xl font-bold text-indigo-700 mb-6">Loading Questions...</h1>
          <p className="text-gray-600">Please wait while we generate personalized questions for you.</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-indigo-50 p-6 flex items-center justify-center">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-8 text-center">
          <h1 className="text-3xl font-bold text-indigo-700 mb-6">Error Loading Questions</h1>
          <p className="text-gray-600">We couldn't generate questions for your assessment. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-indigo-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-8">
          <h1 className="text-3xl font-bold text-indigo-700 mb-6">
            {assessmentComplete ? "Assessment Complete" : "Reading Assessment"}
          </h1>

          {!assessmentComplete ? (
            <div className="space-y-6">
              <EmotionCapture
                onCapture={handleEmotionCapture}
                interval={5000}
              />

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-500">
                    Question {currentQuestion + 1} of {questions.length}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-indigo-600 h-2.5 rounded-full"
                    style={{
                      width: `${((currentQuestion + 1) / questions.length) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Reading Section */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Reading Passage
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  {questions[currentQuestion].paragraph}
                </p>
              </div>

              {/* Question Section */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  {questions[currentQuestion].question}
                </h2>
                <div className="space-y-3">
                  {questions[currentQuestion].options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      className={`w-full p-4 text-left rounded-lg transition-colors ${
                        userAnswers[questions[currentQuestion].id]?.selectedOption === index
                          ? "bg-indigo-100 border-2 border-indigo-500"
                          : "bg-white border-2 border-gray-200 hover:border-indigo-200"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={nextQuestion}
                  disabled={
                    userAnswers[questions[currentQuestion].id]?.selectedOption === undefined
                  }
                  className={`w-full py-3 px-6 rounded-lg font-medium text-lg ${
                    userAnswers[questions[currentQuestion].id]?.selectedOption !== undefined
                      ? "bg-indigo-600 text-white hover:bg-indigo-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {currentQuestion === questions.length - 1
                    ? "Complete Assessment"
                    : "Next Question"}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-6">
              <div className="bg-indigo-50 p-8 rounded-lg border border-indigo-200">
                <h2 className="text-2xl font-bold text-indigo-700 mb-4">
                  Assessment Complete
                </h2>
                <p className="text-gray-600">
                  Your responses have been recorded. The system will analyze
                  your performance.
                </p>
              </div>
              <button
                onClick={nextRoundDecider}
                className="bg-indigo-600 text-white py-3 px-6 rounded-lg font-medium text-lg hover:bg-indigo-700"
              >
                Go Back to Reading
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MCQAssessment3;