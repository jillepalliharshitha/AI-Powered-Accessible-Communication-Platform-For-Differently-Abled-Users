import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LightPillar from '../LightPillar';
import Chat from '../components/Chat';
import SignLanguageDetector from '../components/SignLanguageDetector';
import ResizablePanel from '../components/ResizablePanel';
import ResizableVideo from '../components/ResizableVideo';
import './CameraScreen.css';

const CameraScreen = () => {
  const videoRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [stream, setStream] = useState(null);
  const [chatInputText, setChatInputText] = useState('');
  const navigate = useNavigate();

  // Handle sign language detection results
  const handleSignDetection = (text, currentCharacter) => {
    // Send complete words or sentences to chat when space is detected or after a delay
    if (currentCharacter === ' ' || text.endsWith(' ')) {
      setChatInputText(text.trim());
      // Clear after sending to chat
      setTimeout(() => {
        setChatInputText('');
      }, 1000);
    }
  };

  // Handle sending detected text to chat
  const handleSendToChat = (text, source) => {
    setChatInputText(text);
    // Clear after a short delay to allow chat to process
    setTimeout(() => {
      setChatInputText('');
    }, 500);
  };

  // Handle when chat processes external text
  const handleExternalTextProcessed = (processedText) => {
    console.log('Chat processed sign language text:', processedText);
    setChatInputText('');
  };

  const startCamera = async () => {
    setIsLoading(true);
    setError('');
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setIsDetecting(true);
        setIsLoading(false);
      }
    } catch (err) {
      setError('Camera access denied. Please allow camera permissions.');
      setIsLoading(false);
      console.error('Camera error:', err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsDetecting(false);
  };

  const toggleDetection = () => {
    if (isDetecting) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  return (
    <div className="camera-screen">
      {/* Enhanced Light Pillar Background - Reference Image Match */}
      <div className="light-pillar-background">
        <LightPillar
          topColor="#001D4D"
          bottomColor="#FF2D4A"
          intensity={1.0}
          rotationSpeed={0.65}
          glowAmount={0.008}
          pillarWidth={4.5}
          pillarHeight={0.5}
          noiseIntensity={0.1}
          pillarRotation={35}
          interactive={false}
          mixBlendMode="screen"
        />
      </div>
      
      <div className="camera-header">
        <button onClick={() => navigate('/login')} className="back-btn">
          <span className="arrow-icon">»</span>
        </button>
        <h2>Camera View</h2>
        <button 
          onClick={toggleDetection} 
          className={`detection-btn ${isDetecting ? 'stop-btn' : 'start-btn'}`}
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : isDetecting ? 'Stop Detection' : 'Start camera'}
        </button>
      </div>
      
      <div className="main-content">
        {/* Camera and Detector Section - Left Side */}
        <div className="camera-section">
          <ResizableVideo videoRef={videoRef} isDetecting={isDetecting}>
            {isLoading && (
              <div className="camera-loading">
                <div className="loading-spinner"></div>
                <p>Accessing camera...</p>
              </div>
            )}
            
            {error && (
              <div className="camera-error">
                <p>{error}</p>
                <button onClick={() => window.location.reload()} className="retry-btn">
                  Retry
                </button>
              </div>
            )}
            
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="camera-video"
              style={{ display: isLoading || error || !isDetecting ? 'none' : 'block' }}
            />
          </ResizableVideo>
          
          {/* Sign Language Detector Component - Beside Video */}
          {isDetecting && (
            <div className="detector-section">
              <SignLanguageDetector
                videoRef={videoRef}
                isDetecting={isDetecting}
                onTextUpdate={handleSignDetection}
                onSendToChat={handleSendToChat}
              />
            </div>
          )}
        </div>
        
        {/* Chat Section - Right Side */}
        <div className="chat-section">
          <ResizablePanel defaultWidth={350} minWidth={250} maxWidth={600}>
            <Chat
              externalText={chatInputText}
              onExternalTextProcessed={handleExternalTextProcessed}
            />
          </ResizablePanel>
        </div>
      </div>
    </div>
  );
};

export default CameraScreen;
