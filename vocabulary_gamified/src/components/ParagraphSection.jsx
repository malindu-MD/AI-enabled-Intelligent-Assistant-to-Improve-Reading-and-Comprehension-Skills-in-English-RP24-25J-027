import React, { useState, useRef, useEffect } from 'react';

const ParagraphSection = ({ paragraph, level }) => {
  const [scrollDepth, setScrollDepth] = useState(0);
  const [totalScrolls, setTotalScrolls] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [isReading, setIsReading] = useState(false);
  
  const containerRef = useRef(null);
  const timerRef = useRef(null);
  const scrollCountRef = useRef(0);
  
  useEffect(() => {
    let startTime = Date.now();
    
    const handleScroll = (e) => {
      const container = containerRef.current;
      if (!container) return;
      
      const { scrollTop, scrollHeight, clientHeight } = container;
      const newScrollDepth = (scrollTop / (scrollHeight - clientHeight)) * 100;
      
      setScrollDepth(Math.min(100, Math.max(0, newScrollDepth)));
      scrollCountRef.current += 1;
      setTotalScrolls(scrollCountRef.current);
      
      // Reset timer when user scrolls
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      
      timerRef.current = setTimeout(() => {
        const currentTime = Date.now();
        setReadingTime(Math.round((currentTime - startTime) / 1000));
      }, 1000);
    };
    
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }
    
    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);
  
  useEffect(() => {
    // Reset metrics when paragraph changes
    setScrollDepth(0);
    setTotalScrolls(0);
    setReadingTime(0);
    scrollCountRef.current = 0;
  }, [paragraph]);
  
  return (
    <div className="space-y-4">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Reading Section - Level {level}</h2>
        <div 
          ref={containerRef}
          className="max-h-60 overflow-y-auto prose prose-indigo"
          style={{ scrollBehavior: 'smooth' }}
        >
          {paragraph.split('\n').map((para, index) => (
            <p key={index} className="mb-4 text-gray-700">{para}</p>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm font-medium text-gray-500">Scroll Depth</div>
          <div className="mt-1 text-2xl font-semibold text-indigo-600">{Math.round(scrollDepth)}%</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm font-medium text-gray-500">Total Scrolls</div>
          <div className="mt-1 text-2xl font-semibold text-indigo-600">{totalScrolls}</div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm font-medium text-gray-500">Reading Time</div>
          <div className="mt-1 text-2xl font-semibold text-indigo-600">{readingTime}s</div>
        </div>
      </div>
    </div>
  );
};

export default ParagraphSection;