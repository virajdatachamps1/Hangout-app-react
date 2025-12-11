// ============================================
// GOOGLE GEMINI AI SERVICE
// Handles all AI-related functionality
// ============================================

import { GoogleGenerativeAI } from '@google/generative-ai';

// Validate API key
if (!import.meta.env.VITE_GEMINI_API_KEY) {
  console.error('❌ Gemini API key not found in environment variables');
}

// Initialize Gemini AI
let genAI = null;
let model = null;

try {
  genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
  
  // Use gemini-pro model (best for text generation)
  model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  
  console.log('✅ Gemini AI initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize Gemini AI:', error);
}

// ==========================================
// AI CHAT FUNCTION
// ==========================================

/**
 * Send a message to Gemini AI and get response
 * @param {string} message - User message
 * @param {Array} history - Optional chat history
 * @returns {Promise<string>} AI response
 */
export async function sendMessage(message, history = []) {
  if (!model) {
    throw new Error('Gemini AI not initialized. Check API key.');
  }

  try {
    // Build conversation context if history exists
    let prompt = message;
    
    if (history.length > 0) {
      const context = history.map(msg => 
        `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
      ).join('\n');
      
      prompt = `${context}\nUser: ${message}\nAssistant:`;
    }

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text;

  } catch (error) {
    console.error('❌ Gemini AI error:', error);
    
    // Provide helpful error messages
    if (error.message.includes('API_KEY')) {
      throw new Error('Invalid Gemini API key. Please check your .env file.');
    } else if (error.message.includes('quota')) {
      throw new Error('API quota exceeded. Please try again later.');
    } else if (error.message.includes('network')) {
      throw new Error('Network error. Please check your internet connection.');
    }
    
    throw new Error('Failed to get AI response. Please try again.');
  }
}

// ==========================================
// STREAMING CHAT (For Real-time Responses)
// ==========================================

/**
 * Stream AI response in real-time
 * @param {string} message - User message
 * @param {Function} onChunk - Callback for each text chunk
 * @param {Array} history - Optional chat history
 */
export async function streamMessage(message, onChunk, history = []) {
  if (!model) {
    throw new Error('Gemini AI not initialized. Check API key.');
  }

  try {
    let prompt = message;
    
    if (history.length > 0) {
      const context = history.map(msg => 
        `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
      ).join('\n');
      
      prompt = `${context}\nUser: ${message}\nAssistant:`;
    }

    const result = await model.generateContentStream(prompt);

    // Stream the response
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      onChunk(chunkText);
    }

  } catch (error) {
    console.error('❌ Gemini streaming error:', error);
    throw new Error('Failed to stream AI response. Please try again.');
  }
}

// ==========================================
// TEXT GENERATION WITH CUSTOM PARAMETERS
// ==========================================

/**
 * Generate text with custom parameters
 * @param {string} prompt - The prompt
 * @param {Object} options - Generation options
 */
export async function generateText(prompt, options = {}) {
  if (!model) {
    throw new Error('Gemini AI not initialized. Check API key.');
  }

  const {
    temperature = 0.7,      // Creativity (0-1)
    maxOutputTokens = 2048, // Max response length
    topP = 0.8,            // Nucleus sampling
    topK = 40              // Top-k sampling
  } = options;

  try {
    const generationConfig = {
      temperature,
      maxOutputTokens,
      topP,
      topK,
    };

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig,
    });

    const response = await result.response;
    return response.text();

  } catch (error) {
    console.error('❌ Text generation error:', error);
    throw new Error('Failed to generate text. Please try again.');
  }
}

// ==========================================
// USAGE TRACKING (Optional)
// ==========================================

let requestCount = 0;
const REQUEST_LIMIT_PER_HOUR = 100; // Adjust based on your API quota

/**
 * Check if user has exceeded request limit
 */
export function checkRateLimit() {
  const now = Date.now();
  const hourAgo = now - (60 * 60 * 1000);
  
  // Get request timestamps from localStorage
  const requests = JSON.parse(localStorage.getItem('gemini_requests') || '[]');
  
  // Filter requests from last hour
  const recentRequests = requests.filter(timestamp => timestamp > hourAgo);
  
  if (recentRequests.length >= REQUEST_LIMIT_PER_HOUR) {
    throw new Error('Rate limit exceeded. Please try again in an hour.');
  }
  
  // Add current request
  recentRequests.push(now);
  localStorage.setItem('gemini_requests', JSON.stringify(recentRequests));
  
  return {
    remaining: REQUEST_LIMIT_PER_HOUR - recentRequests.length,
    resetTime: new Date(hourAgo + (60 * 60 * 1000))
  };
}

// ==========================================
// HELPER: FORMAT AI RESPONSE
// ==========================================

/**
 * Format AI response (remove markdown, clean text)
 */
export function formatResponse(text) {
  // Remove markdown code blocks
  text = text.replace(/```[\s\S]*?```/g, '');
  
  // Remove inline code
  text = text.replace(/`([^`]+)`/g, '$1');
  
  // Remove bold/italic
  text = text.replace(/\*\*([^*]+)\*\*/g, '$1');
  text = text.replace(/\*([^*]+)\*/g, '$1');
  
  // Clean up extra whitespace
  text = text.trim().replace(/\n{3,}/g, '\n\n');
  
  return text;
}

export default {
  sendMessage,
  streamMessage,
  generateText,
  checkRateLimit,
  formatResponse
};