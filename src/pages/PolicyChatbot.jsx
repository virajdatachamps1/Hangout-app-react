import { useState, useRef, useEffect } from 'react';
import { searchRelevantContent, chatWithContext } from '../services/vertexAIService';
import { Send, Bot, User, Loader } from 'lucide-react';

function PolicyChatbot() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '👋 Hi! I can help you find information from company policies. What would you like to know?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      // Search relevant content
      const relevantChunks = await searchRelevantContent(userMessage, 5);

      if (relevantChunks.length === 0) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: "I couldn't find relevant information. Please try rephrasing or contact HR."
        }]);
        setLoading(false);
        return;
      }

      // Build context
      const context = relevantChunks
        .map(c => `[From: ${c.source}]\n${c.content}`)
        .join('\n\n---\n\n');

      // Get answer
      const answer = await chatWithContext(userMessage, context);

      // Add response
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: answer,
        sources: [...new Set(relevantChunks.map(c => c.source))]
      }]);

    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      }]);
    }

    setLoading(false);
  };

  return (
    <div style={{
      maxWidth: '900px',
      margin: '0 auto',
      height: 'calc(100vh - 100px)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        padding: '24px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '16px 16px 0 0',
        color: 'white'
      }}>
        <h1 style={{ fontSize: '24px', marginBottom: '8px' }}>
          🤖 Policy Assistant
        </h1>
        <p style={{ opacity: 0.9, fontSize: '14px' }}>
          Ask me about company policies, SOPs, and procedures
        </p>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '24px',
        background: '#f9fafb'
      }}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              gap: '12px',
              marginBottom: '20px',
              alignItems: 'start'
            }}
          >
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: msg.role === 'user' ? '#4f46e5' : '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              {msg.role === 'user' ? <User size={20} color="white" /> : <Bot size={20} color="white" />}
            </div>

            <div style={{
              flex: 1,
              padding: '16px',
              background: 'white',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}>
              <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
              
              {msg.sources && (
                <div style={{
                  marginTop: '12px',
                  paddingTop: '12px',
                  borderTop: '1px solid #e5e7eb',
                  fontSize: '13px',
                  color: '#64748b'
                }}>
                  📚 Sources: {msg.sources.join(', ')}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Bot size={20} color="white" />
            </div>
            <div style={{ padding: '16px', background: 'white', borderRadius: '12px' }}>
              <Loader className="animate-spin" size={20} color="#64748b" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '20px',
        background: 'white',
        borderRadius: '0 0 16px 16px',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about leave policy, expenses, work from home..."
            disabled={loading}
            style={{
              flex: 1,
              padding: '14px',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '15px'
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            style={{
              padding: '14px 24px',
              background: input.trim() && !loading ? '#4f46e5' : '#cbd5e1',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default PolicyChatbot;