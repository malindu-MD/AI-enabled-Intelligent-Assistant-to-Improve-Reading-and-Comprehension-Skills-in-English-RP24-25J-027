import React, { useState, useRef, useEffect } from 'react';

const EmotionCapture = ({ onCapture, interval = 5000 }) => {
  const [stream, setStream] = useState(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [debugInfo, setDebugInfo] = useState('');
  const videoRef = useRef(null);

  // Initialize webcam
  useEffect(() => {
    let isMounted = true;
    setDebugInfo('Initializing webcam...');
    
    const initWebcam = async () => {
      try {
        setDebugInfo('Requesting camera access...');
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: 'user' // Explicitly request front camera
          } 
        });
        
        if (isMounted) {
          setStream(mediaStream);
          setDebugInfo('Camera access granted, setting video source...');
          
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
        }
      } catch (error) {
        if (isMounted) {
          setDebugInfo(`Error: ${error.message}`);
          console.error('Error accessing webcam:', error);
        }
      }
    };

    initWebcam();

    return () => {
      isMounted = false;
      if (stream) {
        setDebugInfo('Cleaning up stream...');
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Handle video ready state
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) return;

    const handleCanPlay = () => {
      setDebugInfo(`Video ready. Dimensions: ${video.videoWidth}x${video.videoHeight}`);
      setIsVideoReady(true);
    };

    video.addEventListener('canplay', handleCanPlay);
    return () => {
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, [stream]);

  // Capture and analyze images
  useEffect(() => {
    let intervalId;

    if (stream && isVideoReady) {
      setDebugInfo('Starting capture interval...');
      
      intervalId = setInterval(() => {
        try {
          const video = videoRef.current;
          if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
            setDebugInfo('Video not ready for capture');
            return;
          }

          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          const context = canvas.getContext('2d');
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          // Verify canvas has content
          const pixelData = context.getImageData(0, 0, 1, 1).data;
          if (pixelData[0] === 0 && pixelData[1] === 0 && pixelData[2] === 0) {
            setDebugInfo('Warning: Canvas appears blank');
          } else {
            setDebugInfo(`Captured image (${canvas.width}x${canvas.height})`);
          }

          const imageDataURL = canvas.toDataURL('image/jpeg', 0.8);
          const base64Data = imageDataURL.split(',')[1];
          onCapture(base64Data);

        } catch (error) {
          setDebugInfo(`Capture error: ${error.message}`);
          console.error('Error capturing image:', error);
        }
      }, interval);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
        setDebugInfo('Capture interval cleared');
      }
    };
  }, [stream, interval, onCapture, isVideoReady]);

  return (
    <div style={{ border: '1px solid #ccc', padding: '10px', margin: '10px' }}>
      <h3>Camera Debug</h3>
      <div>Status: {debugInfo}</div>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ 
          width: '320px', 
          height: '240px',
          border: '2px solid red',  // Make it very visible
          backgroundColor: '#eee'   // Shows if video not loading
        }}
      />
    </div>
  );
};

export default EmotionCapture;