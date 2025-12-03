/* ============================================
   AI SERVICE
   Multi-provider AI integration with fallbacks
   Supports: OpenAI, Claude API, Google Gemini
   ============================================ */

// Configuration
const AI_CONFIG = {
  provider: 'openai', // 'openai' | 'claude' | 'gemini'
  
  // API Keys from environment variables
  openai: {
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    model: 'gpt-3.5-turbo', // Faster and cheaper
    endpoint: 'https://api.openai.com/v1/chat/completions'
  },
  
  claude: {
    apiKey: import.meta.env.VITE_CLAUDE_API_KEY,
    model: 'claude-3-haiku-20240307', // Fastest Claude model
    endpoint: 'https://api.anthropic.com/v1/messages'
  },
  
  gemini: {
    apiKey: import.meta.env.VITE_GEMINI_API_KEY,
    model: 'gemini-pro',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'
  }
};

// Rate limiting (to prevent abuse and control costs)
const RATE_LIMIT = {
  maxRequestsPerMinute: 10,
  maxRequestsPerHour: 100,
  requests: [],
};

function checkRateLimit() {
  const now = Date.now();
  const oneMinuteAgo = now - 60000;
  const oneHourAgo = now - 3600000;
  
  // Clean old requests
  RATE_LIMIT.requests = RATE_LIMIT.requests.filter(time => time > oneHourAgo);
  
  const recentMinute = RATE_LIMIT.requests.filter(time => time > oneMinuteAgo);
  const recentHour = RATE_LIMIT.requests.length;
  
  if (recentMinute.length >= RATE_LIMIT.maxRequestsPerMinute) {
    throw new Error('Rate limit exceeded: Too many requests per minute');
  }
  
  if (recentHour >= RATE_LIMIT.maxRequestsPerHour) {
    throw new Error('Rate limit exceeded: Too many requests per hour');
  }
  
  RATE_LIMIT.requests.push(now);
}

// ==========================================
// OPENAI PROVIDER
// ==========================================

async function callOpenAI(messages, options = {}) {
  const config = AI_CONFIG.openai;
  
  if (!config.apiKey) {
    throw new Error('OpenAI API key not configured');
  }
  
  const response = await fetch(config.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model: options.model || config.model,
      messages: messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 150,
      ...options
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
  }
  
  const data = await response.json();
  return data.choices[0].message.content;
}

// ==========================================
// CLAUDE PROVIDER
// ==========================================

async function callClaude(messages, options = {}) {
  const config = AI_CONFIG.claude;
  
  if (!config.apiKey) {
    throw new Error('Claude API key not configured');
  }
  
  // Convert OpenAI format to Claude format
  const systemMessage = messages.find(m => m.role === 'system');
  const userMessages = messages.filter(m => m.role !== 'system');
  
  const response = await fetch(config.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: options.model || config.model,
      system: systemMessage?.content || '',
      messages: userMessages,
      max_tokens: options.maxTokens || 150,
      temperature: options.temperature || 0.7
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Claude API error: ${error.error?.message || 'Unknown error'}`);
  }
  
  const data = await response.json();
  return data.content[0].text;
}

// ==========================================
// GEMINI PROVIDER
// ==========================================

async function callGemini(messages, options = {}) {
  const config = AI_CONFIG.gemini;
  
  if (!config.apiKey) {
    throw new Error('Gemini API key not configured');
  }
  
  // Convert messages to Gemini format
  const contents = messages
    .filter(m => m.role !== 'system')
    .map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));
  
  const response = await fetch(`${config.endpoint}?key=${config.apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: contents,
      generationConfig: {
        temperature: options.temperature || 0.7,
        maxOutputTokens: options.maxTokens || 150
      }
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Gemini API error: ${error.error?.message || 'Unknown error'}`);
  }
  
  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

// ==========================================
// UNIFIED AI CALL WITH FALLBACKS
// ==========================================

async function callAI(messages, options = {}) {
  checkRateLimit();
  
  const providers = [AI_CONFIG.provider, 'openai', 'claude', 'gemini'];
  const uniqueProviders = [...new Set(providers)];
  
  for (const provider of uniqueProviders) {
    try {
      switch (provider) {
        case 'openai':
          if (AI_CONFIG.openai.apiKey) {
            return await callOpenAI(messages, options);
          }
          break;
        case 'claude':
          if (AI_CONFIG.claude.apiKey) {
            return await callClaude(messages, options);
          }
          break;
        case 'gemini':
          if (AI_CONFIG.gemini.apiKey) {
            return await callGemini(messages, options);
          }
          break;
      }
    } catch (error) {
      console.warn(`${provider} failed:`, error.message);
      // Continue to next provider
    }
  }
  
  throw new Error('All AI providers failed or not configured');
}

// ==========================================
// SMART KUDOS REPLIES
// ==========================================

export async function generateKudosReplies(kudosData) {
  const { from, message, badge } = kudosData;
  
  const prompt = [
    {
      role: 'system',
      content: 'You are a helpful assistant that generates warm, professional, and genuine responses to workplace kudos/recognition. Keep responses short (1-2 sentences), authentic, and appropriate for a professional setting. Provide 3 different variations with different tones: grateful, enthusiastic, and humble.'
    },
    {
      role: 'user',
      content: `${from} gave me kudos with the message: "${message}" and badge: "${badge}". Generate 3 short reply options.`
    }
  ];
  
  try {
    const response = await callAI(prompt, {
      temperature: 0.8, // More creative
      maxTokens: 200
    });
    
    // Parse response into 3 options
    const replies = response
      .split('\n')
      .filter(line => line.trim())
      .slice(0, 3)
      .map(line => line.replace(/^\d+[\.)]\s*/, '').trim());
    
    // Fallback replies if parsing fails
    if (replies.length < 3) {
      return [
        `Thank you so much, ${from}! This really means a lot! 🙏`,
        `I appreciate the recognition! Couldn't have done it without the team! 💪`,
        `Thanks ${from}! Always happy to help and contribute! ⭐`
      ];
    }
    
    return replies;
    
  } catch (error) {
    console.error('Error generating kudos replies:', error);
    
    // Fallback to template-based replies
    return [
      `Thank you so much, ${from}! This really means a lot! 🙏`,
      `I appreciate the recognition! Couldn't have done it without the team! 💪`,
      `Thanks ${from}! Always happy to help and contribute! ⭐`
    ];
  }
}

// ==========================================
// ANALYTICS INSIGHTS
// ==========================================

export async function generateAnalyticsInsights(analyticsData) {
  const {
    kudosGiven,
    kudosReceived,
    tasksCompleted,
    timesheetAccuracy,
    collaborations,
    weekOverWeekChange
  } = analyticsData;
  
  const prompt = [
    {
      role: 'system',
      content: 'You are an AI career coach analyzing workplace performance data. Provide concise, actionable insights and encouragement. Focus on patterns, strengths, and areas for growth. Keep it positive and motivational.'
    },
    {
      role: 'user',
      content: `Analyze this week's performance:
      - Kudos Given: ${kudosGiven}
      - Kudos Received: ${kudosReceived}
      - Tasks Completed: ${tasksCompleted}
      - Timesheet Accuracy: ${timesheetAccuracy}%
      - Collaborations: ${collaborations}
      - Change from last week: ${weekOverWeekChange}%
      
      Provide 3 brief insights (1-2 sentences each): a strength, a trend, and a suggestion.`
    }
  ];
  
  try {
    const response = await callAI(prompt, {
      temperature: 0.7,
      maxTokens: 250
    });
    
    return response;
    
  } catch (error) {
    console.error('Error generating analytics insights:', error);
    
    // Fallback to rule-based insights
    const insights = [];
    
    if (kudosReceived > 5) {
      insights.push('💪 Strength: Your contributions are being recognized! You received significant kudos this week.');
    }
    
    if (weekOverWeekChange > 0) {
      insights.push(`📈 Trend: You're on an upward trajectory with ${weekOverWeekChange}% improvement!`);
    } else {
      insights.push('📊 Trend: Performance is steady. Consider new challenges to accelerate growth.');
    }
    
    if (kudosGiven < 3) {
      insights.push('💡 Suggestion: Try recognizing teammates more often. Giving kudos boosts team morale!');
    } else {
      insights.push('🌟 Keep up the great work recognizing your teammates!');
    }
    
    return insights.join('\n\n');
  }
}

// ==========================================
// CALENDAR EVENT SUGGESTIONS
// ==========================================

export async function suggestCalendarEvents(context) {
  const { upcomingBirthdays, trainingSessions, teamEvents } = context;
  
  const prompt = [
    {
      role: 'system',
      content: 'You are a helpful calendar assistant. Suggest calendar events based on workplace activities. Be specific with titles and helpful descriptions.'
    },
    {
      role: 'user',
      content: `Based on these activities, suggest calendar events:
      Birthdays: ${upcomingBirthdays.join(', ')}
      Training: ${trainingSessions.join(', ')}
      Events: ${teamEvents.join(', ')}
      
      Format each as: TITLE | DESCRIPTION | DURATION`
    }
  ];
  
  try {
    const response = await callAI(prompt, {
      temperature: 0.6,
      maxTokens: 300
    });
    
    // Parse response into structured events
    const events = response
      .split('\n')
      .filter(line => line.includes('|'))
      .map(line => {
        const [title, description, duration] = line.split('|').map(s => s.trim());
        return { title, description, duration };
      });
    
    return events;
    
  } catch (error) {
    console.error('Error suggesting calendar events:', error);
    
    // Fallback to simple templates
    return [
      {
        title: '🎂 Team Birthday Celebration',
        description: 'Celebrate upcoming team birthdays',
        duration: '30 minutes'
      }
    ];
  }
}

// ==========================================
// BIRTHDAY WISH GENERATOR
// ==========================================

export async function generateBirthdayWish(personName, relationship = 'colleague') {
  const prompt = [
    {
      role: 'system',
      content: 'Generate warm, professional birthday wishes for workplace colleagues. Keep them genuine, positive, and appropriate for professional settings.'
    },
    {
      role: 'user',
      content: `Generate a birthday message for ${personName}, my ${relationship}.`
    }
  ];
  
  try {
    const wish = await callAI(prompt, {
      temperature: 0.8,
      maxTokens: 100
    });
    
    return wish.trim();
    
  } catch (error) {
    console.error('Error generating birthday wish:', error);
    
    // Fallback template
    return `Happy Birthday ${personName}! 🎉 Wishing you an amazing day filled with joy and celebration!`;
  }
}

// ==========================================
// EXPORT ALL FUNCTIONS
// ==========================================

export default {
  generateKudosReplies,
  generateAnalyticsInsights,
  suggestCalendarEvents,
  generateBirthdayWish
};