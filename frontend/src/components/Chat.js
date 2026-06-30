import React, { useState, useRef, useEffect, useCallback } from 'react';
import { textToSpeech } from '../utils/ttsService';
import './Chat.css';

const Chat = ({ externalText = null, onExternalTextProcessed = null }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [autoRead, setAutoRead] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isMicrophoneSupported, setIsMicrophoneSupported] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [translation, setTranslation] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState('es'); // Default to Spanish
  const [showLanguagePanel, setShowLanguagePanel] = useState(false);
  const [recentLanguages, setRecentLanguages] = useState(['es', 'hi', 'te']); // Recently used languages
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsMicrophoneSupported(true);
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          }
        }

        if (finalTranscript) {
          setInputText(prev => prev + finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const speakMessage = useCallback(async (text, language = targetLanguage) => {
    try {
      setIsSpeaking(true);
      await textToSpeech(text, language);
    } catch (error) {
      console.error('Error in text-to-speech:', error);
    } finally {
      setIsSpeaking(false);
    }
  }, [targetLanguage]);

  // Handle external text from sign language detection
  useEffect(() => {
    const processExternalText = async () => {
      if (externalText && externalText.trim()) {
        const signLanguageMessage = {
          id: Date.now(),
          text: externalText,
          sender: 'user',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          source: 'sign-language' // Add source identifier
        };
        
        setMessages(prev => [...prev, signLanguageMessage]);
        
        // Speak the message if auto-read is enabled
        if (autoRead) {
          await speakMessage(externalText, targetLanguage); // Use selected language
        }
        
        // Notify parent that text was processed
        if (onExternalTextProcessed) {
          onExternalTextProcessed(externalText);
        }
      }
    };
    
    processExternalText();
  }, [externalText, autoRead, speakMessage, onExternalTextProcessed, targetLanguage]);

  const handleSendMessage = async () => {
    if (inputText.trim()) {
      const userMessageText = inputText;
      const newMessage = {
        id: Date.now(),
        text: userMessageText,
        sender: 'user',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'text' // Add source identifier for typed messages
      };
      
      setMessages(prev => [...prev, newMessage]);
      setInputText('');
      
      // Speak the message if auto-read is enabled
      if (autoRead) {
        await speakMessage(userMessageText, 'en'); // Original message in English
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  // Toggle speech recognition
  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // Translate message using Google Translate API (free alternative)
  const translateMessage = async (messageText, messageId) => {
    if (isTranslating || !messageText.trim()) return;
    
    setIsTranslating(true);
    setSelectedMessage(messageId);
    setTranslation('');

    try {
      // Using Google Translate API via MyMemory API (free)
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(messageText)}&langpair=en|${targetLanguage}`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.responseStatus === 200 && data.responseData.translatedText) {
          setTranslation(data.responseData.translatedText);
        } else {
          setTranslation('Translation not available');
        }
      } else {
        // Fallback to a simple translation simulation
        setTranslation(`[Translated to ${getLanguageName(targetLanguage)}]: ${messageText}`);
      }
    } catch (error) {
      console.error('Translation error:', error);
      // Fallback translation
      setTranslation(`[Translated to ${getLanguageName(targetLanguage)}]: ${messageText}`);
    } finally {
      setIsTranslating(false);
    }
  };

  // Get language name from code
  const getLanguageName = (code) => {
    const languages = {
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German',
      'zh': 'Chinese',
      'ja': 'Japanese',
      'ko': 'Korean',
      'hi': 'Hindi',
      'te': 'Telugu',
      'ta': 'Tamil'
    };
    return languages[code] || code;
  };

  // Close translation
  const closeTranslation = () => {
    setSelectedMessage(null);
    setTranslation('');
  };

  // Handle message click
  const handleMessageClick = (message) => {
    if (selectedMessage === message.id) {
      closeTranslation();
    } else {
      translateMessage(message.text, message.id);
    }
  };

  // Handle language selection
  const handleLanguageSelect = (langCode) => {
    setTargetLanguage(langCode);
    
    // Update recent languages (keep most recent 3)
    const updatedRecent = [langCode, ...recentLanguages.filter(l => l !== langCode)].slice(0, 3);
    setRecentLanguages(updatedRecent);
    setShowLanguagePanel(false);
    
    // If there's a selected message, re-translate with new language
    if (selectedMessage) {
      const message = messages.find(m => m.id === selectedMessage);
      if (message) {
        translateMessage(message.text, message.id);
      }
    }
  };

  // Get all available languages with flags
  const getAllLanguages = () => {
    return [
      { code: 'es', name: 'Spanish', flag: '🇪🇸' },
      { code: 'fr', name: 'French', flag: '🇫🇷' },
      { code: 'de', name: 'German', flag: '🇩🇪' },
      { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
      { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
      { code: 'ko', name: 'Korean', flag: '🇰🇷' },
      { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
      { code: 'te', name: 'Telugu', flag: '🇮🇳' },
      { code: 'ta', name: 'Tamil', flag: '🇮🇳' }
    ];
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="header-left">
          <div className="auto-read-toggle">
            <label className="switch">
              <input 
                type="checkbox" 
                checked={autoRead}
                onChange={() => setAutoRead(!autoRead)}
              />
              <span className="slider round"></span>
            </label>
            <span className="auto-read-label">Auto-read</span>
          </div>
          
          {/* Enhanced Language Selector */}
          <div className="language-selector-enhanced">
            <div className="current-language" onClick={() => setShowLanguagePanel(!showLanguagePanel)}>
              <span className="language-flag">
                {getAllLanguages().find(l => l.code === targetLanguage)?.flag || '🌐'}
              </span>
              <span className="language-name">
                {getLanguageName(targetLanguage)}
              </span>
              <span className="dropdown-arrow">▼</span>
            </div>
            
            {showLanguagePanel && (
              <div className="language-panel">
                <div className="language-panel-header">
                  <h4>Choose Language</h4>
                  <button 
                    className="close-panel"
                    onClick={() => setShowLanguagePanel(false)}
                  >
                    ✕
                  </button>
                </div>
                
                {/* Recent Languages */}
                <div className="recent-languages">
                  <h5>Recent</h5>
                  <div className="recent-lang-list">
                    {recentLanguages.map(langCode => {
                      const lang = getAllLanguages().find(l => l.code === langCode);
                      return (
                        <button
                          key={langCode}
                          className="recent-lang-item"
                          onClick={() => handleLanguageSelect(langCode)}
                        >
                          <span className="lang-flag">{lang?.flag}</span>
                          <span className="lang-name">{lang?.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                {/* All Languages */}
                <div className="all-languages">
                  <h5>All Languages</h5>
                  <div className="all-lang-grid">
                    {getAllLanguages().map(lang => (
                      <button
                        key={lang.code}
                        className={`lang-item ${lang.code === targetLanguage ? 'active' : ''}`}
                        onClick={() => handleLanguageSelect(lang.code)}
                      >
                        <span className="lang-flag">{lang.flag}</span>
                        <span className="lang-name">{lang.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Enhanced Audio Controls */}
        <div className="audio-controls">
          {isMicrophoneSupported && (
            <div className="mic-control">
              {isListening ? (
                <span className="listening-indicator">
                  <span className="mic-icon">🎤</span>
                  <span className="listening-text">Listening...</span>
                </span>
              ) : (
                <span className="mic-ready">
                  <span className="mic-icon">🎤</span>
                  <span className="ready-text">Ready</span>
                </span>
              )}
            </div>
          )}
          
          {isSpeaking && (
            <div className="speaking-indicator">
              <span className="speaker-icon">🔊</span>
              <span className="speaking-text">Speaking...</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-welcome">
            <p>Start typing to send a message...</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`message ${message.sender === 'user' ? 'user-message' : 'system-message'}`}
            >
              <div 
                className="message-content"
                onClick={() => handleMessageClick(message)}
                title="Click to translate"
              >
                <p>{message.text}</p>
                <div className="message-time">{message.timestamp}</div>
                {message.source && (
                  <div className="message-source">
                    {message.source === 'sign-language' && '🤟 Sign Language'}
                    {message.source === 'voice' && '🎤 Voice'}
                  </div>
                )}
              </div>
              
              {/* Translation Display */}
              {selectedMessage === message.id && (
                <div className="translation-container">
                  <div className="translation-header">
                    <span className="translation-language">
                      Translation ({getLanguageName(targetLanguage)})
                    </span>
                    <button 
                      className="close-translation"
                      onClick={closeTranslation}
                      title="Close translation"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="translation-text">
                    {isTranslating ? (
                      <div className="translation-loading">
                        <div className="loading-spinner"></div>
                        Translating...
                      </div>
                    ) : (
                      <p>{translation}</p>
                    )}
                  </div>
                  <div className="translation-actions">
                    <button 
                      className={`speak-translation-btn ${isSpeaking ? 'speaking' : ''}`}
                      onClick={() => speakMessage(translation)}
                      title="Speak translation"
                      disabled={isSpeaking}
                    >
                      {isSpeaking ? (
                        <>
                          <span className="btn-spinner"></span>
                          Speaking...
                        </>
                      ) : (
                        <>
                          <span className="speak-icon">🔊</span>
                          Speak
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="chat-input-container">
        <div className="input-wrapper">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Type your message or click mic to speak..."
            className="chat-input"
            disabled={false}
          />
          {isMicrophoneSupported && (
            <button
              onClick={toggleListening}
              className={`mic-button ${isListening ? 'listening' : ''}`}
              title={isListening ? 'Stop listening' : 'Start voice input'}
            >
              {isListening ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="6" y="6" width="12" height="12" rx="2"></rect>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                  <line x1="12" y1="19" x2="12" y2="23"></line>
                  <line x1="8" y1="23" x2="16" y2="23"></line>
                </svg>
              )}
            </button>
          )}
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim()}
            className={`send-button ${inputText.trim() ? 'active' : 'disabled'}`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
