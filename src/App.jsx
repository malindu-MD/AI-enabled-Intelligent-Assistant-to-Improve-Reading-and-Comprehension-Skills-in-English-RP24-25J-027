import  { useState, useRef, useEffect } from 'react';
import { Mic, RefreshCw, ArrowRight } from 'lucide-react';

const words = [
  'Elephant', 'Sunshine', 'Adventure', 'Melody', 
  'Harmony', 'Whisper', 'Journey', 'Freedom', 
  'Courage', 'Serenity', 'Passion', 'Dream', 
  'Wonder', 'Explore', 'Inspire', 'Radiant', 
  'Tranquil', 'Blossom', 'Embrace', 'Spark'
];

const WordSpeechApp = () => {
  const [currentWord, setCurrentWord] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Select a random word
  const selectRandomWord = () => {
    const randomIndex = Math.floor(Math.random() * words.length);
    setCurrentWord(words[randomIndex]);
    setAudioBlob(null);
  };

 
  useEffect(() => {
    selectRandomWord();
  }, []);

  // Start recording
  const startRecording = async () => {
    audioChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);

      // Stop recording after 5 seconds
      setTimeout(() => {
        stopRecording();
      }, 5000);
    } catch (error) {
      console.error('Error accessing microphone', error);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Play recorded audio
  const playRecording = () => {
    if (audioBlob) {
      const audioURL = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioURL);
      audio.play();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white shadow-2xl rounded-2xl p-8 text-center w-full max-w-md transform transition-all duration-300 hover:scale-105">
        {/* Word Display with Animation */}
        <h1 
          key={currentWord}
          className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-8 animate-bounce"
        >
          {currentWord}
        </h1>

        {/* Control Buttons Container */}
        <div className="flex justify-center space-x-4">
          {/* Speak Now Button */}
          {!isRecording && !audioBlob && (
            <button 
              onClick={startRecording} 
              className="bg-green-500 text-white px-6 py-3 rounded-full flex items-center space-x-2 hover:bg-green-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <Mic size={24} />
              <span>Speak Now</span>
            </button>
          )}

          {/* Recording Indicator */}
          {isRecording && (
            <div className="flex items-center space-x-2 text-red-500 animate-pulse">
              <Mic size={24} />
              <span>Recording... (5s)</span>
            </div>
          )}

          {/* Play Recording Button */}
          {audioBlob && (
            <button 
              onClick={playRecording} 
              className="bg-blue-500 text-white px-6 py-3 rounded-full flex items-center space-x-2 hover:bg-blue-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <RefreshCw size={24} />
              <span>Play Recording</span>
            </button>
          )}

          {/* Next Word Button */}
          <button 
            onClick={selectRandomWord} 
            className="bg-purple-500 text-white px-4 py-3 rounded-full hover:bg-purple-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <ArrowRight size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default WordSpeechApp;
