import { MURF_AI_CONFIG } from '../config';

// Language mapping for TTS
const LANGUAGE_VOICES = {
  'es': 'es-ES',
  'fr': 'fr-FR', 
  'de': 'de-DE',
  'zh': 'zh-CN',
  'ja': 'ja-JP',
  'ko': 'ko-KR',
  'hi': 'hi-IN',
  'te': 'te-IN',
  'ta': 'ta-IN',
  'en': 'en-US'
};

export const textToSpeech = async (text, language = 'en') => {
  try {
    // Try Murf.ai API first
    const response = await fetch(`${MURF_AI_CONFIG.BASE_URL}/tts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MURF_AI_CONFIG.API_KEY}`,
      },
      body: JSON.stringify({
        text,
        voiceId: LANGUAGE_VOICES[language] || 'en-US',
        // Add other parameters as needed by Murf.ai API
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to convert text to speech');
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    
    return new Promise((resolve, reject) => {
      audio.onended = resolve;
      audio.onerror = reject;
      audio.play().catch(error => {
        console.error('Error playing audio:', error);
        reject(error);
      });
    });
  } catch (error) {
    console.error('Error in textToSpeech:', error);
    // Fallback to Web Speech API if Murf.ai fails
    return fallbackTextToSpeech(text, language);
  }
};

// Fallback to Web Speech API
const fallbackTextToSpeech = (text, language = 'en') => {
  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text);
    const targetLang = LANGUAGE_VOICES[language] || 'en-US';
    
    // Try to find a voice for the target language
    const voices = window.speechSynthesis.getVoices();
    utterance.voice = voices.find(voice => 
      voice.lang === targetLang
    ) || voices.find(voice => 
      voice.lang.startsWith(targetLang.split('-')[0])
    ) || voices[0];
    
    utterance.lang = targetLang;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    
    utterance.onend = resolve;
    window.speechSynthesis.speak(utterance);
  });
};
