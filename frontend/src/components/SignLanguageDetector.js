import React, { useState, useEffect, useRef, useCallback } from 'react';
import signLanguageService from '../services/signLanguageService';
import './SignLanguageDetector.css';

const SignLanguageDetector = ({ videoRef, isDetecting, onTextUpdate, onSendToChat }) => {
  const [currentCharacter, setCurrentCharacter] = useState('');
  const [detectedText, setDetectedText] = useState('');
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [suggestions, setSuggestions] = useState(['', '', '', '', '']);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [handDetected, setHandDetected] = useState(false);
  const [skeletonImage, setSkeletonImage] = useState(null);
  const lastDetectionRef = useRef(null);

  // Text-to-speech function
  const speakText = () => {
    if ('speechSynthesis' in window && detectedText) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(detectedText);
      utterance.rate = 1.2;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  // Send detected text to chat
  const sendToChat = () => {
    if (detectedText && detectedText.trim() && onSendToChat) {
      onSendToChat(detectedText, 'sign-language');
    }
  };

  // Clear all text and state
  const clearAll = async () => {
    // Clear text on backend
    await signLanguageService.clearText();

    // Clear local state
    setDetectedText('');
    setCurrentCharacter('');
    setSuggestions(['', '', '', '', '']);
    lastDetectionRef.current = null;
    if (onTextUpdate) {
      onTextUpdate('');
    }
  };

  // Apply suggestion to text
  const applySuggestion = (suggestion) => {
    if (suggestion && detectedText) {
      // Find the last word and replace it with suggestion
      const words = detectedText.trim().split(' ');
      if (words.length > 0) {
        words[words.length - 1] = suggestion.toUpperCase();
        const newText = words.join(' ');
        setDetectedText(newText);
        if (onTextUpdate) {
          onTextUpdate(newText, '');
        }
      }
    }
  };

  // Check backend connection on mount
  useEffect(() => {
    const checkBackend = async () => {
      const health = await signLanguageService.checkHealth();
      setIsBackendConnected(health.status === 'healthy');
      if (health.status !== 'healthy') {
        console.warn('Backend server not connected:', health.error);
      }
    };

    checkBackend();
    const interval = setInterval(checkBackend, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // Handle sign detection callback
  const handleDetection = useCallback((result) => {
    const { character, accumulated_text, hand_detected, skeleton_image } = result;

    // Update hand detection status
    setHandDetected(hand_detected || false);

    // Update skeleton visualization
    setSkeletonImage(skeleton_image || null);

    // Update current character
    setCurrentCharacter(character || '');

    // Use accumulated text from backend instead of local processing
    setDetectedText(accumulated_text || '');

    // Notify parent component with accumulated text
    if (onTextUpdate) {
      onTextUpdate(accumulated_text || '', character);
    }
  }, [onTextUpdate]);

  // Start/stop detection based on isDetecting prop
  useEffect(() => {
    console.log('🎬 Detection effect triggered:', { isDetecting, videoRef: !!videoRef.current, isBackendConnected });
    
    if (isDetecting && videoRef.current && isBackendConnected) {
      console.log('✅ Starting detection...');
      signLanguageService.startDetection(videoRef.current, handleDetection);
    } else {
      console.log('⏹️ Stopping detection...');
      signLanguageService.stopDetection();
    }

    return () => {
      signLanguageService.stopDetection();
    };
  }, [isDetecting, videoRef, isBackendConnected, handleDetection]);

  return (
    <div className="sign-language-detector">
      {/* Connection Status */}
      <div className="connection-status">
        <span className={`status-indicator ${isBackendConnected ? 'connected' : 'disconnected'}`}>
          {isBackendConnected ? '🟢 Connected' : '🔴 Backend Offline'}
        </span>
        <span className={`hand-detection-indicator ${handDetected ? 'detected' : 'not-detected'}`}>
          {handDetected ? '✋ Hand Detected' : '❌ No Hand Detected'}
        </span>
      </div>

      {/* Main Detection Display */}
      <div className="detection-display">
        {/* Current Character */}
        <div className="current-character">
          <h3>Character :</h3>
          <div className="character-display">
            <span className="character">{currentCharacter || ''}</span>
          </div>
        </div>

        {/* Hand Skeleton Visualization */}
        <div className="skeleton-display">
          <h3>Hand Skeleton :</h3>
          {skeletonImage ? (
            <img
              src={skeletonImage}
              alt="Hand Skeleton"
              className="skeleton-image"
              style={{
                width: '100%',
                height: 'auto',
                border: '2px solid #e2e8f0',
                borderRadius: '8px',
                backgroundColor: '#fff'
              }}
            />
          ) : (
            <div className="skeleton-placeholder">
              <span>No hand detected</span>
            </div>
          )}
        </div>
      </div>

      {/* Detected Text */}
      <div className="detected-text">
        <h3>Sentence :</h3>
        <div className="text-display">
          {detectedText || ''}
        </div>
      </div>

      {/* Control Buttons */}
      <div className="control-buttons">
        <button 
          onClick={speakText} 
          className={`control-btn speak-btn ${isSpeaking ? 'speaking' : ''}`}
          disabled={!detectedText || isSpeaking}
        >
          {isSpeaking ? 'Speaking...' : 'Speak'}
        </button>
        
        <button 
          onClick={clearAll} 
          className="control-btn clear-btn"
        >
          Clear
        </button>
        
        <button 
          onClick={sendToChat} 
          className={`control-btn send-to-chat-btn ${detectedText && detectedText.trim() ? 'active' : ''}`}
          disabled={!detectedText || !detectedText.trim()}
          title="Send detected text to chat"
        >
          <span className="arrow-icon">»</span>
        </button>
      </div>

      {/* Suggestions */}
      <div className="suggestions-section">
        <h3>Suggestions :</h3>
        <div className="suggestion-buttons">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              className="suggestion-btn"
              onClick={() => applySuggestion(suggestion)}
              disabled={!suggestion}
            >
              {suggestion || ''}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SignLanguageDetector;
