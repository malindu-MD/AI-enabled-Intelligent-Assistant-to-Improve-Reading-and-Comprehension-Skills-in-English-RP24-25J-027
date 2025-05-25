import React, { useState, useRef, useEffect } from 'react';

const MCQSection = ({ question, options, onAnswerSelect, questionId, selectedAnswer }) => {
  const [timeSpent, setTimeSpent] = useState(0);
  const [hoverCounts, setHoverCounts] = useState(Array(options.length).fill(0));
  const [firstInteraction, setFirstInteraction] = useState(null);
  const [lastInteraction, setLastInteraction] = useState(null);
  
  const timerRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeSpent(Math.round((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  const handleOptionHover = (optionIndex) => {
    if (!selectedAnswer) {
      setHoverCounts(prev => {
        const newCounts = [...prev];
        newCounts[optionIndex] += 1;
        return newCounts;
      });
      
      const currentTime = Date.now();
      if (!firstInteraction) {
        setFirstInteraction(currentTime);
      }
      setLastInteraction(currentTime);
    }
  };
  
  const handleOptionSelect = (optionIndex) => {
    if (!selectedAnswer) {
      const interactionData = {
        timeSpent,
        hoverCounts: [...hoverCounts],
        firstInteraction,
        lastInteraction: Date.now(),
        interactionTimeRange: firstInteraction ? Date.now() - firstInteraction : 0
      };
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      onAnswerSelect(questionId, optionIndex, interactionData);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{question}</h3>
        
        <div className="space-y-3">
          {options.map((option, index) => (
            <div
              key={index}
              onMouseEnter={() => handleOptionHover(index)}
              onClick={() => handleOptionSelect(index)}
              className={`p-4 rounded-lg border-2 transition-all cursor-pointer
                ${selectedAnswer === index ? 
                  'border-indigo-600 bg-indigo-50 text-indigo-700' : 
                  'border-gray-200 hover:border-indigo-200 hover:bg-indigo-50'}`}
            >
              <div className="flex justify-between items-center">
                <span className="text-gray-700">{option}</span>
                {!selectedAnswer && (
                  <span className="text-sm text-gray-500">
                    Hover count: {hoverCounts[index]}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm font-medium text-gray-500">Time Spent</div>
          <div className="mt-1 text-2xl font-semibold text-indigo-600">{timeSpent}s</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm font-medium text-gray-500">Total Hovers</div>
          <div className="mt-1 text-2xl font-semibold text-indigo-600">
            {hoverCounts.reduce((a, b) => a + b, 0)}
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm font-medium text-gray-500">Decision Time</div>
          <div className="mt-1 text-2xl font-semibold text-indigo-600">
            {firstInteraction && lastInteraction ? 
              `${Math.round((lastInteraction - firstInteraction) / 1000)}s` : 
              '0s'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MCQSection;