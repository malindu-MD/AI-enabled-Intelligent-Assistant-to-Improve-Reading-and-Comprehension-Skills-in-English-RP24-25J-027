import React from 'react';

const LevelPredictionButton = ({ userAnswers, emotionHistory, onPredictionComplete }) => {
  const predictLevel = async () => {
    const apiData = {
        "answers": [
            {
                "is_correct": false,
                "time_spent": 2421,
                "tags": [
                    "vocabulary"
                ]
            },
            {
                "is_correct": false,
                "time_spent": 1000,
                "tags": [
                    "grammar"
                ]
            },
            {
                "is_correct": true,
                "time_spent": 966,
                "tags": [
                    "grammar"
                ]
            }
        ],
        "response_times": [
            2421,
            1000,
            966
        ],
        "emotion_data": {
            "Emotions": [
                {
                    "Type": "CALM",
                    "Confidence": 53.560550689697266
                },
                {
                    "Type": "SAD",
                    "Confidence": 18.49365234375
                },
                {
                    "Type": "CONFUSED",
                    "Confidence": 5.7017011642456055
                },
                {
                    "Type": "ANGRY",
                    "Confidence": 0.05421638488769531
                },
                {
                    "Type": "DISGUSTED",
                    "Confidence": 0.021731853485107422
                },
                {
                    "Type": "SURPRISED",
                    "Confidence": 0.009842216968536377
                },
                {
                    "Type": "FEAR",
                    "Confidence": 0.0034749507904052734
                },
                {
                    "Type": "HAPPY",
                    "Confidence": 0.0013192493934184313
                }
            ]
        },
        "difficulty_level": 2
        };

    try {
      const response = await fetch('https://h8d7t2rqxi.execute-api.ap-south-1.amazonaws.com/default/levelPrediction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiData)
      });
      const result = await response.json();
      onPredictionComplete(result);
    } catch (error) {
      console.error('Error calling level prediction API:', error);
    }
  };

  return (
    <button 
      onClick={predictLevel}
      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
    >
      Predict Level
    </button>
  );
};

export default LevelPredictionButton;