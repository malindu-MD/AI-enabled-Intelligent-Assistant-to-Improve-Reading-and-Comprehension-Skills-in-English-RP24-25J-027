import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Play, Volume2, Award, TrendingUp, Lightbulb, CheckCircle, XCircle, Target, Star, Clock, RotateCcw } from 'lucide-react';

const PronunciationCoach = () => {
  const [currentLevel, setCurrentLevel] = useState('beginner');
  const [currentWord, setCurrentWord] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [result, setResult] = useState(null);
  const [showProgress, setShowProgress] = useState(false);
  const [showSimilarWords, setShowSimilarWords] = useState(false);
  const [correctWords, setCorrectWords] = useState([]);
  const [incorrectWords, setIncorrectWords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showGuidelines, setShowGuidelines] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);

  const wordLists = {
    beginner: ["elephant", "umbrella", "intelligent", "butterfly", "memory", "computer", "restaurant", "university"],
    medium: ["phenomenon", "necessarily", "particularly", "entrepreneur", "sophisticated", "ambiguity", "deliberately"],
    advanced: ["phenomenon", "necessarily", "particularly", "entrepreneur", "sophisticated", "ambiguity", "deliberately"]
  };

  const similarWords = {
    "P": ["pat", "pot", "pen", "pig", "pull"],
    "F": ["fat", "fish", "fun", "fear", "fast"],
    "T": ["top", "ten", "tea", "take", "time"],
    "AH0": ["about", "comma", "sofa", "pizza", "extra"]
  };

  useEffect(() => {
    getRandomWord();
  }, [currentLevel]);

  const getRandomWord = () => {
    const words = wordLists[currentLevel];
    const randomIndex = Math.floor(Math.random() * words.length);
    setCurrentWord(words[randomIndex]);
    setResult(null);
    setAudioBlob(null);
  };

  const startCountdown = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        } 
      });
      streamRef.current = stream;
      
      setCountdown(3);
      const countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            startRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Please allow microphone access to use this feature.');
    }
  };

  const startRecording = () => {
    audioChunksRef.current = [];
    
    // Try to use WAV format if supported, otherwise fall back to webm
    const options = { mimeType: 'audio/wav' };
    if (!MediaRecorder.isTypeSupported('audio/wav')) {
      options.mimeType = 'audio/webm;codecs=opus';
    }
    
    const mediaRecorder = new MediaRecorder(streamRef.current, options);
    mediaRecorderRef.current = mediaRecorder;
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data);
      }
    };
    
    mediaRecorder.onstop = () => {
      const mimeType = mediaRecorder.mimeType || options.mimeType;
      const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
      setAudioBlob(audioBlob);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
    
    mediaRecorder.start();
    setIsRecording(true);
    
    setTimeout(() => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
      }
    }, 4000);
  };

  const checkPronunciation = async () => {
    if (!audioBlob || !currentWord) return;
    
    setIsLoading(true);
    const formData = new FormData();
    
    // Convert webm to wav if needed
    const wavBlob = await convertToWav(audioBlob);
    formData.append('audio', wavBlob, 'recording.wav');
    formData.append('expected_word', currentWord);
    
    try {
      const response = await fetch('http://127.0.0.1:8000/compare', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setResult(data);
      
      if (data.result === 'correct') {
        setCorrectWords(prev => [...prev, currentWord]);
      } else {
        setIncorrectWords(prev => [...prev, { word: currentWord, data }]);
      }
    } catch (error) {
      console.error('Error checking pronunciation:', error);
      alert('Error connecting to server. Please check if the server is running on http://127.0.0.1:8000');
    } finally {
      setIsLoading(false);
    }
  };

  const convertToWav = async (blob) => {
    return new Promise((resolve) => {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const fileReader = new FileReader();
      
      fileReader.onload = async (e) => {
        try {
          const arrayBuffer = e.target.result;
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          
          // Convert to WAV
          const wavBuffer = audioBufferToWav(audioBuffer);
          const wavBlob = new Blob([wavBuffer], { type: 'audio/wav' });
          resolve(wavBlob);
        } catch (error) {
          console.log('Using original blob format');
          resolve(blob);
        }
      };
      
      fileReader.readAsArrayBuffer(blob);
    });
  };

  const audioBufferToWav = (buffer) => {
    const length = buffer.length;
    const arrayBuffer = new ArrayBuffer(44 + length * 2);
    const view = new DataView(arrayBuffer);
    
    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, 44100, true);
    view.setUint32(28, 44100 * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length, true);
    
    const channelData = buffer.getChannelData(0);
    let offset = 44;
    for (let i = 0; i < length; i++) {
      const sample = Math.max(-1, Math.min(1, channelData[i]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      offset += 2;
    }
    
    return arrayBuffer;
  };

  const speakWord = (word = currentWord) => {
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.rate = 0.8;
    utterance.pitch = 1;
    utterance.voice = speechSynthesis.getVoices().find(voice => voice.lang.startsWith('en')) || null;
    speechSynthesis.speak(utterance);
  };

  const renderHighlightedWord = (highlightedWord) => {
    return <div dangerouslySetInnerHTML={{ __html: highlightedWord }} />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-4">
            <Volume2 className="w-12 h-12 mr-4 animate-pulse" />
            <h1 className="text-4xl md:text-5xl font-bold">Pronunciation Coach</h1>
          </div>
          <p className="text-xl opacity-90">Master your English pronunciation with personalized feedback</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Level Selection & Navigation */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <div className="flex bg-white rounded-full p-1 shadow-lg">
            {Object.keys(wordLists).map((level) => (
              <button
                key={level}
                onClick={() => setCurrentLevel(level)}
                className={`px-6 py-2 rounded-full transition-all duration-300 capitalize ${
                  currentLevel === level
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-blue-600 hover:bg-blue-50'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => setShowGuidelines(!showGuidelines)}
            className="flex items-center gap-2 bg-yellow-500 text-white px-4 py-2 rounded-full hover:bg-yellow-600 transition-colors"
          >
            <Lightbulb className="w-4 h-4" />
            Tips & Guidelines
          </button>
          
          <button
            onClick={() => setShowProgress(!showProgress)}
            className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 transition-colors"
          >
            <TrendingUp className="w-4 h-4" />
            Progress ({correctWords.length}/{correctWords.length + incorrectWords.length})
          </button>
        </div>

        {/* Guidelines Panel */}
        {showGuidelines && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-6 rounded-lg animate-fadeIn">
            <h3 className="text-lg font-semibold text-yellow-800 mb-3">Pronunciation Tips</h3>
            <ul className="text-yellow-700 space-y-2">
              <li>• Speak clearly and at a normal pace</li>
              <li>• Ensure you're in a quiet environment</li>
              <li>• Listen to the word first, then try to mimic the pronunciation</li>
              <li>• Focus on individual sounds (phonemes) if you make mistakes</li>
              <li>• Practice regularly for better results</li>
            </ul>
          </div>
        )}

        {/* Progress Panel */}
        {showProgress && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6 animate-slideDown">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Your Progress</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="flex items-center gap-2 font-semibold text-green-800 mb-2">
                  <CheckCircle className="w-5 h-5" />
                  Correct Pronunciations ({correctWords.length})
                </h4>
                <div className="space-y-1">
                  {correctWords.map((word, index) => (
                    <div key={index} className="text-green-700 bg-green-100 px-3 py-1 rounded-full text-sm inline-block mr-2 mb-1">
                      {word}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="flex items-center gap-2 font-semibold text-red-800 mb-2">
                  <XCircle className="w-5 h-5" />
                  Needs Practice ({incorrectWords.length})
                </h4>
                <div className="space-y-1">
                  {incorrectWords.map((item, index) => (
                    <div key={index} className="text-red-700 bg-red-100 px-3 py-1 rounded-full text-sm inline-block mr-2 mb-1">
                      {item.word}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Practice Area */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="text-center mb-8">
            <div className="inline-block bg-blue-100 rounded-2xl p-8 mb-4">
              <h2 className="text-5xl font-bold text-blue-800 mb-2">{currentWord}</h2>
              {/* <button
                onClick={speakWord}
                className="flex items-center gap-2 mx-auto bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition-colors"
              >
                <Volume2 className="w-5 h-5" />
                Listen to pronunciation
              </button> */}
            </div>
          </div>

          {/* Recording Controls */}
          <div className="text-center mb-6">
            {countdown > 0 && (
              <div className="text-6xl font-bold text-blue-600 animate-pulse mb-4">
                {countdown}
              </div>
            )}
            
            {!isRecording && !audioBlob && countdown === 0 && (
              <button
                onClick={startCountdown}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-full text-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 shadow-lg"
              >
                <Mic className="w-6 h-6 inline mr-2" />
                Start Pronouncing
              </button>
            )}
            
            {isRecording && (
              <div className="flex items-center justify-center">
                <div className="bg-red-500 text-white px-6 py-4 rounded-full animate-pulse">
                  <MicOff className="w-6 h-6 inline mr-2" />
                  Recording... (4 seconds)
                </div>
              </div>
            )}
            
            {audioBlob && !result && (
              <button
                onClick={checkPronunciation}
                disabled={isLoading}
                className="bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-4 rounded-full text-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Checking...
                  </div>
                ) : (
                  'Check My Pronunciation'
                )}
              </button>
            )}
          </div>

          {/* Results */}
          {result && (
            <div className="mt-8 animate-fadeIn">
              {result.result === 'correct' ? (
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 text-center">
                  <div className="text-6xl mb-4">🎉</div>
                  <h3 className="text-2xl font-bold text-green-800 mb-2">Perfect Pronunciation!</h3>
                  <p className="text-green-700">Excellent work! You pronounced "{currentWord}" correctly.</p>
                  {result.full_transcription && (
                    <p className="text-sm text-green-600 mt-2">Full transcription: "{result.full_transcription}"</p>
                  )}
                  <div className="flex items-center justify-center mt-4">
                    <Award className="w-6 h-6 text-yellow-500 mr-2" />
                    <span className="text-green-800 font-semibold">+10 Points</span>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-red-800 mb-4 text-center">Let's Practice More!</h3>
                  
                  <div className="grid md:grid-cols-2 gap-6 mb-4">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">You said:</h4>
                      <p className="text-lg bg-red-100 p-3 rounded-lg">{result.transcribed_word}</p>
                      {result.full_transcription && (
                        <p className="text-sm text-gray-600 mt-1">Full: "{result.full_transcription}"</p>
                      )}
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Correct pronunciation:</h4>
                      <div className="text-lg bg-blue-100 p-3 rounded-lg">
                        {result.highlighted_word ? 
                          renderHighlightedWord(result.highlighted_word) : 
                          result.expected_word
                        }
                      </div>
                    </div>
                  </div>

                  {/* Phoneme Analysis */}
                  {result['Expected Phonemes'] && result['Transcribed Phonemes'] && (
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <h4 className="font-semibold text-gray-800 mb-3">Phoneme Analysis:</h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Expected Sounds:</h5>
                          <div className="flex flex-wrap gap-1">
                            {result['Expected Phonemes'].map((phoneme, index) => (
                              <span key={index} className="bg-blue-200 text-blue-800 px-2 py-1 rounded text-xs">
                                {phoneme}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Your Sounds:</h5>
                          <div className="flex flex-wrap gap-1">
                            {result['Transcribed Phonemes'].map((phoneme, index) => (
                              <span key={index} className="bg-red-200 text-red-800 px-2 py-1 rounded text-xs">
                                {phoneme}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {result.phoneme_feedback && result.phoneme_feedback.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Detailed Feedback:</h4>
                      <div className="space-y-2">
                        {result.phoneme_feedback.map((feedback, index) => (
                          <div key={index} className="bg-yellow-100 p-3 rounded-lg text-sm">
                            <strong>Position {feedback.position}:</strong> Expected sound "{feedback.expected}" but heard "{feedback.transcribed}"
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {result.missed_phonemes && result.missed_phonemes.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Sounds to Practice:</h4>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {result.missed_phonemes.map((phoneme, index) => (
                          <span key={index} className="bg-orange-200 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                            {phoneme}
                          </span>
                        ))}
                      </div>
                      
                      <button
                        onClick={() => setShowSimilarWords(!showSimilarWords)}
                        className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        {showSimilarWords ? 'Hide' : 'Show'} Practice Words
                      </button>
                      
                      {showSimilarWords && (
                        <div className="mt-4 bg-purple-50 p-4 rounded-lg">
                          <h5 className="font-semibold text-purple-800 mb-3">Practice these words for better pronunciation:</h5>
                          <div className="space-y-3">
                            {result.missed_phonemes.map((phoneme, index) => (
                              <div key={index} className="mb-2">
                                <div className="text-sm font-medium text-purple-700 mb-1">For sound "{phoneme}":</div>
                                <div className="flex flex-wrap gap-2">
                                  {(similarWords[phoneme] || ['practice more words with this sound']).map((word, wordIndex) => (
                                    <span key={wordIndex} className="bg-purple-200 text-purple-800 px-3 py-1 rounded-full text-sm cursor-pointer hover:bg-purple-300 transition-colors"
                                          onClick={() => speakWord(word)}>
                                      {word} 🔊
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {result.distance && (
                    <div className="text-center mt-4 p-3 bg-gray-100 rounded-lg">
                      <span className="text-sm text-gray-600">
                        Pronunciation Distance: <strong>{result.distance.toFixed(1)}</strong> 
                        <span className="text-xs ml-1">(lower is better)</span>
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          {result && (
            <div className="flex flex-wrap justify-center gap-4 mt-6">
              <button
                onClick={getRandomWord}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition-colors"
              >
                <RotateCcw className="w-5 h-5" />
                Next Word
              </button>
              
              <button
                onClick={() => {
                  setResult(null);
                  setAudioBlob(null);
                }}
                className="flex items-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-full hover:bg-gray-700 transition-colors"
              >
                <Target className="w-5 h-5" />
                Try Again
              </button>
            </div>
          )}
        </div>

        {/* Stats Card */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-6 text-center">
          <h3 className="text-xl font-semibold mb-2">Your Stats</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-2xl font-bold">{correctWords.length}</div>
              <div className="text-sm opacity-80">Correct</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{incorrectWords.length}</div>
              <div className="text-sm opacity-80">Practice</div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {correctWords.length + incorrectWords.length > 0 
                  ? Math.round((correctWords.length / (correctWords.length + incorrectWords.length)) * 100)
                  : 0}%
              </div>
              <div className="text-sm opacity-80">Accuracy</div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
        
        .text-red-500 {
          color: #ef4444;
          background-color: #fee2e2;
          padding: 0 4px;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
};

export default PronunciationCoach;