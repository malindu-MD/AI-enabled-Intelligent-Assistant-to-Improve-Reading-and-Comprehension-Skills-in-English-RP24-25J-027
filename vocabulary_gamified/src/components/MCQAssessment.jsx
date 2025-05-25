import React, { useState, useEffect } from "react";
import { ref,get, set, update } from "firebase/database";
import { initializeRealtimeDB } from "../config/firebaseConfig";
import EmotionCapture from "./EmotionCapture";
const MCQAssessment = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [assessmentComplete, setAssessmentComplete] = useState(false);
  const [emotionHistory, setEmotionHistory] = useState([]);
  const [finalEmotion, setFinalEmotion] = useState([]);

  const questions = [
    {
      id: "q1",
      question: "What is the main topic of this paragraph?",
      paragraph:
        "Environmental protection has become a major concern in recent years. Many countries are implementing policies to reduce pollution and conserve natural resources. Recycling programs have been established in cities around the world.",
      options: [
        "Global warming",
        "Environmental protection",
        "Renewable energy",
      ],
      correctAnswer: 1,
      tags: ["vocabulary"],
    },
    {
      id: "q2",
      question:
        "What are some examples of renewable energy mentioned in the text?",
      paragraph:
        "Some governments are promoting renewable energy sources like solar and wind power. These sustainable solutions help reduce our dependence on fossil fuels and combat climate change.",
      options: [
        "Coal and natural gas",
        "Solar and wind power",
        "Nuclear and hydroelectric",
      ],
      correctAnswer: 1,
      tags: ["grammar"],
    },
    {
      id: "q3",
      question: "How can individuals help protect the environment?",
      paragraph:
        "Individuals can contribute to environmental protection in many ways. Using less plastic, saving water, and choosing public transportation over private cars are effective methods to reduce our environmental impact.",
      options: [
        "By voting for green parties",
        "By donating to organizations",
        "By reducing plastic use and saving water",
      ],
      correctAnswer: 2,
      tags: ["grammar"],
    },
  ];

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
                    text: `Analyze this raw emotion data and return a complete emotion profile with all emotion types and their confidence levels:

Raw Emotion Input:
{{
  "Emotions": [
    {{
      "Type": "SAD", 
      "Confidence": 80.0
    }}
  ]
}}

Required Output Format:
{{
  "Emotions": [
    {{
      "Type": "HAPPY",
      "Confidence": number
    }},
    {{
      "Type": "CALM", 
      "Confidence": number
    }},
    // Include all 8 emotion types
  ]
}}`,
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
        console.log("Level Prediction:", result);
       
      } else {
        console.warn('No valid emotion data found');
      }
      console.log("Emotion final:", finalEmotion);
    setAssessmentComplete(true);
      const email='testmail';
    // Calculate total time and average time
    const db = initializeRealtimeDB(); 
    const userRef = ref(db, `userdata/${email}`);
    
    try {
      const snapshot = await get(userRef);
    
      const userData = {
        totalPoints: 12,
        level: 2,
        correctCount: 12,
        incorrectCount: 12,
        questionCount: 15,
        averageTime: 12,
        totalTime: 12,
        lastAttempt: new Date().toISOString()
      };
    
      if (snapshot.exists()) {
        // ✅ Update existing user
        await update(userRef, userData);
        console.log("User updated successfully");
      } else {
        // ✅ Create new user
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

  
  useEffect(() => {
    // Set start time for first question
    setUserAnswers({
      [questions[0].id]: {
        startTime: new Date(),
      },
    });
  }, []);

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
                      width: `${
                        ((currentQuestion + 1) / questions.length) * 100
                      }%`,
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
                        userAnswers[questions[currentQuestion].id]
                          ?.selectedOption === index
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
                    userAnswers[questions[currentQuestion].id]
                      ?.selectedOption === undefined
                  }
                  className={`w-full py-3 px-6 rounded-lg font-medium text-lg ${
                    userAnswers[questions[currentQuestion].id]
                      ?.selectedOption !== undefined
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MCQAssessment;
