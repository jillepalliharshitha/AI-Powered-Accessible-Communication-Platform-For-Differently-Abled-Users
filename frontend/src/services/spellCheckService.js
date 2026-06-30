// Spell checking and dictionary service
import axios from 'axios';

// Common English words dictionary (simplified)
const COMMON_WORDS = new Set([
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'I',
  'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
  'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
  'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
  'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
  'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take',
  'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other',
  'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also',
  'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way',
  'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us',
  'is', 'was', 'are', 'been', 'has', 'had', 'were', 'said', 'did', 'getting',
  'made', 'find', 'where', 'much', 'too', 'very', 'still', 'being', 'going', 'why',
  'before', 'never', 'here', 'more', 'thing', 'long', 'without', 'through', 'same', 'another',
  'while', 'those', 'both', 'between', 'under', 'always', 'might', 'goes', 'came', 'really',
  'let', 'put', 'keep', 'something', 'life', 'tell', 'someone', 'leave', 'feel', 'right',
  'try', 'ask', 'need', 'turn', 'move', 'great', 'sound', 'every', 'few', 'hand',
  'high', 'old', 'different', 'small', 'large', 'next', 'early', 'young', 'important', 'public',
  'bad', 'same', 'able', 'last', 'late', 'best', 'better', 'sure', 'clear', 'enough',
  'kind', 'far', 'hard', 'easy', 'possible', 'real', 'second', 'minute', 'hour', 'day',
  'week', 'month', 'year', 'morning', 'afternoon', 'evening', 'night', 'today', 'tomorrow', 'yesterday',
  'hello', 'goodbye', 'please', 'thank', 'sorry', 'yes', 'no', 'help', 'water', 'food',
  'home', 'school', 'work', 'family', 'friend', 'love', 'happy', 'sad', 'angry', 'tired',
  'hungry', 'thirsty', 'cold', 'hot', 'sick', 'well', 'good', 'bad', 'right', 'wrong',
  'big', 'small', 'tall', 'short', 'fast', 'slow', 'heavy', 'light', 'dark', 'bright',
  'clean', 'dirty', 'new', 'old', 'young', 'strong', 'weak', 'rich', 'poor', 'happy',
  'sad', 'angry', 'excited', 'bored', 'scared', 'brave', 'smart', 'stupid', 'nice', 'mean',
  'kind', 'cruel', 'gentle', 'rough', 'soft', 'hard', 'smooth', 'bumpy', 'hot', 'cold',
  'warm', 'cool', 'wet', 'dry', 'sunny', 'cloudy', 'rainy', 'snowy', 'windy', 'calm'
]);

// Sign language specific vocabulary
const SIGN_LANGUAGE_WORDS = new Set([
  'help', 'please', 'thank', 'sorry', 'hello', 'goodbye', 'yes', 'no', 'water', 'food',
  'home', 'school', 'work', 'family', 'friend', 'love', 'happy', 'sad', 'angry', 'tired',
  'hungry', 'thirsty', 'cold', 'hot', 'sick', 'well', 'good', 'bad', 'right', 'wrong',
  'big', 'small', 'tall', 'short', 'fast', 'slow', 'heavy', 'light', 'dark', 'bright',
  'clean', 'dirty', 'new', 'old', 'young', 'strong', 'weak', 'rich', 'poor', 'happy',
  'morning', 'afternoon', 'evening', 'night', 'today', 'tomorrow', 'yesterday', 'time',
  'name', 'age', 'where', 'what', 'when', 'why', 'how', 'who', 'which', 'where',
  'eat', 'drink', 'sleep', 'wake', 'play', 'work', 'study', 'read', 'write', 'draw',
  'sing', 'dance', 'run', 'walk', 'jump', 'sit', 'stand', 'stop', 'go', 'come',
  'look', 'listen', 'speak', 'talk', 'say', 'tell', 'ask', 'answer', 'think', 'know',
  'understand', 'learn', 'teach', 'show', 'give', 'take', 'bring', 'carry', 'hold', 'push',
  'pull', 'open', 'close', 'start', 'finish', 'begin', 'end', 'continue', 'stop', 'wait',
  'mother', 'father', 'brother', 'sister', 'son', 'daughter', 'baby', 'child', 'man', 'woman',
  'boy', 'girl', 'person', 'people', 'teacher', 'student', 'doctor', 'nurse', 'driver', 'worker',
  'house', 'room', 'door', 'window', 'table', 'chair', 'bed', 'kitchen', 'bathroom', 'garden',
  'car', 'bus', 'train', 'plane', 'bicycle', 'boat', 'road', 'street', 'city', 'country',
  'mountain', 'hill', 'river', 'lake', 'sea', 'ocean', 'beach', 'forest', 'tree', 'flower',
  'animal', 'dog', 'cat', 'bird', 'fish', 'horse', 'cow', 'pig', 'chicken', 'duck',
  'apple', 'banana', 'orange', 'grape', 'bread', 'rice', 'meat', 'milk', 'water', 'juice',
  'book', 'pen', 'paper', 'computer', 'phone', 'television', 'radio', 'music', 'movie', 'game',
  'color', 'red', 'blue', 'green', 'yellow', 'black', 'white', 'brown', 'pink', 'purple',
  'number', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'hundred', 'thousand', 'million', 'first', 'second', 'third', 'last', 'next', 'previous',
  'up', 'down', 'left', 'right', 'forward', 'backward', 'inside', 'outside', 'above', 'below',
  'near', 'far', 'here', 'there', 'everywhere', 'nowhere', 'somewhere', 'anywhere'
]);

class SpellCheckService {
  constructor() {
    this.cache = new Map();
  }

  // Check if a word is spelled correctly
  isCorrectWord(word) {
    if (!word || word.length === 0) return true;
    
    const cleanWord = word.toLowerCase().trim();
    return COMMON_WORDS.has(cleanWord) || SIGN_LANGUAGE_WORDS.has(cleanWord);
  }

  // Get spelling suggestions for a word
  async getSpellingSuggestions(word, maxSuggestions = 5) {
    if (!word || word.length === 0) return [];
    
    const cacheKey = `spell_${word}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const suggestions = this.generateSuggestions(word, maxSuggestions);
    this.cache.set(cacheKey, suggestions);
    
    return suggestions;
  }

  // Generate spelling suggestions using Levenshtein distance
  generateSuggestions(word, maxSuggestions) {
    const cleanWord = word.toLowerCase().trim();
    const suggestions = [];
    
    // Check against common words and sign language vocabulary
    const allWords = new Set([...COMMON_WORDS, ...SIGN_LANGUAGE_WORDS]);
    
    for (const dictWord of allWords) {
      if (dictWord === cleanWord) continue;
      
      const distance = this.levenshteinDistance(cleanWord, dictWord);
      
      // Only suggest words that are reasonably close
      if (distance <= Math.max(2, Math.floor(cleanWord.length * 0.4))) {
        suggestions.push({
          word: dictWord,
          distance: distance,
          score: this.calculateSimilarityScore(cleanWord, dictWord, distance)
        });
      }
    }
    
    // Sort by similarity score and distance
    suggestions.sort((a, b) => {
      if (a.score !== b.score) return b.score - a.score;
      return a.distance - b.distance;
    });
    
    return suggestions.slice(0, maxSuggestions).map(s => s.word);
  }

  // Calculate Levenshtein distance between two strings
  levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  // Calculate similarity score for better suggestions
  calculateSimilarityScore(word1, word2, distance) {
    const maxLength = Math.max(word1.length, word2.length);
    const similarity = 1 - (distance / maxLength);
    
    // Boost score for words with similar starting letters
    const startSimilarity = this.getStartSimilarity(word1, word2);
    
    // Boost score for words with similar ending letters
    const endSimilarity = this.getEndSimilarity(word1, word2);
    
    // Boost score for sign language words
    const isSignLanguageWord = SIGN_LANGUAGE_WORDS.has(word2);
    const signLanguageBoost = isSignLanguageWord ? 0.2 : 0;
    
    return similarity + (startSimilarity * 0.3) + (endSimilarity * 0.2) + signLanguageBoost;
  }

  getStartSimilarity(word1, word2) {
    const minLength = Math.min(3, word1.length, word2.length);
    if (minLength === 0) return 0;
    
    let matches = 0;
    for (let i = 0; i < minLength; i++) {
      if (word1[i] === word2[i]) matches++;
    }
    
    return matches / minLength;
  }

  getEndSimilarity(word1, word2) {
    const minLength = Math.min(3, word1.length, word2.length);
    if (minLength === 0) return 0;
    
    let matches = 0;
    for (let i = 0; i < minLength; i++) {
      if (word1[word1.length - 1 - i] === word2[word2.length - 1 - i]) matches++;
    }
    
    return matches / minLength;
  }

  // Get contextual suggestions based on the current sentence
  async getContextualSuggestions(currentText, lastWord, maxSuggestions = 5) {
    if (!lastWord || lastWord.length === 0) return [];
    
    // Get spelling suggestions first
    const spellingSuggestions = await this.getSpellingSuggestions(lastWord, maxSuggestions);
    
    // Add contextual suggestions based on common phrases
    const contextualSuggestions = this.getContextualWords(currentText, lastWord);
    
    // Combine and deduplicate
    const allSuggestions = [...new Set([...spellingSuggestions, ...contextualSuggestions])];
    
    return allSuggestions.slice(0, maxSuggestions);
  }

  // Get contextual words based on current text
  getContextualWords(currentText, lastWord) {
    const contextualWords = [];
    
    // Common phrases and patterns
    const commonPhrases = {
      'hello': ['world', 'there', 'everyone'],
      'good': ['morning', 'afternoon', 'evening', 'night', 'bye'],
      'thank': ['you', 'very', 'much'],
      'please': ['help', 'wait', 'stop'],
      'how': ['are', 'do', 'can', 'much'],
      'what': ['is', 'are', 'do', 'did', 'time'],
      'where': ['is', 'are', 'do', 'can'],
      'when': ['is', 'are', 'do', 'did', 'can'],
      'why': ['is', 'are', 'do', 'did', 'not'],
      'can': ['you', 'i', 'we', 'help', 'please'],
      'want': ['to', 'help', 'go', 'eat', 'drink'],
      'need': ['to', 'help', 'go', 'eat', 'drink'],
      'like': ['to', 'help', 'go', 'eat', 'drink'],
      'love': ['you', 'me', 'it', 'very', 'much'],
      'help': ['me', 'you', 'please', 'now'],
      'time': ['is', 'was', 'will', 'now', 'please'],
      'name': ['is', 'was', 'my', 'your'],
      'age': ['is', 'was', 'my', 'your'],
    };
    
    const words = currentText.toLowerCase().split(' ');
    const previousWord = words.length > 1 ? words[words.length - 2] : '';
    
    if (commonPhrases[previousWord]) {
      contextualWords.push(...commonPhrases[previousWord]);
    }
    
    return contextualWords.filter(word => word !== lastWord.toLowerCase());
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }
}

export default new SpellCheckService();
