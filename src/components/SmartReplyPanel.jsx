import { useState, useEffect } from 'react';
import { Send, Sparkles, RefreshCw, Loader } from 'lucide-react';
import { generateKudosReplies } from '../utils/aiService';

function SmartReplyPanel({ kudosData, onSendReply, onClose }) {
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customReply, setCustomReply] = useState('');
  const [selectedReply, setSelectedReply] = useState(null);
  const [sending, setSending] = useState(false);

  // Generate replies on mount
  useEffect(() => {
    loadReplies();
  }, []);

  const loadReplies = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const generatedReplies = await generateKudosReplies(kudosData);
      setReplies(generatedReplies);
    } catch (err) {
      console.error('Error loading AI replies:', err);
      setError(err.message);
      
      // Use fallback replies
      setReplies([
        `Thank you so much, ${kudosData.from}! This really means a lot! 🙏`,
        `I appreciate the recognition! Couldn't have done it without the team! 💪`,
        `Thanks ${kudosData.from}! Always happy to help and contribute! ⭐`
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async () => {
    const message = customReply || selectedReply;
    
    if (!message || !message.trim()) {
      return;
    }
    
    setSending(true);
    
    try {
      await onSendReply(message);
      onClose();
    } catch (err) {
      console.error('Error sending reply:', err);
      setError('Failed to send reply. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '420px',
      maxHeight: '600px',
      background: 'white',
      borderRadius: '20px',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
      border: '1px solid rgba(0, 0, 0, 0.1)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 24px',
        borderBottom: '1px solid #f0f0f0',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={20} />
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '2px' }}>
                Smart Replies
              </h3>
              <p style={{ fontSize: '12px', opacity: 0.9 }}>
                AI-powered responses
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: 'none',
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              cursor: 'pointer',
              fontSize: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>
      </div>

      {/* Original Kudos */}
      <div style={{
        padding: '20px 24px',
        background: '#fafafa',
        borderBottom: '1px solid #f0f0f0'
      }}>
        <div style={{ fontSize: '12px', color: '#999', marginBottom: '8px' }}>
          Replying to:
        </div>
        <div style={{
          padding: '12px 16px',
          background: 'white',
          borderRadius: '12px',
          borderLeft: '3px solid #667eea'
        }}>
          <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>
            {kudosData.from}
          </div>
          <div style={{ fontSize: '13px', color: '#666', lineHeight: '1.5' }}>
            "{kudosData.message}"
          </div>
          <div style={{
            display: 'inline-block',
            marginTop: '8px',
            padding: '4px 10px',
            background: '#667eea15',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: '600',
            color: '#667eea'
          }}>
            {kudosData.badge}
          </div>
        </div>
      </div>

      {/* AI Suggested Replies */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px 24px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px'
        }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>
            Suggested Replies
          </div>
          <button
            onClick={loadReplies}
            disabled={loading}
            style={{
              padding: '6px 12px',
              background: '#f5f5f5',
              border: 'none',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#666'
            }}
            title="Generate new replies"
          >
            <RefreshCw size={14} style={{
              animation: loading ? 'spin 1s linear infinite' : 'none'
            }} />
            Refresh
          </button>
        </div>

        {loading ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: '#999'
          }}>
            <Loader size={32} style={{
              animation: 'spin 1s linear infinite',
              marginBottom: '12px'
            }} />
            <div style={{ fontSize: '14px' }}>Generating replies...</div>
          </div>
        ) : error ? (
          <div style={{
            padding: '16px',
            background: '#fee2e2',
            borderRadius: '12px',
            color: '#dc2626',
            fontSize: '13px',
            marginBottom: '16px'
          }}>
            {error}
          </div>
        ) : null}

        {/* Reply Options */}
        {!loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {replies.map((reply, index) => (
              <div
                key={index}
                onClick={() => {
                  setSelectedReply(reply);
                  setCustomReply('');
                }}
                style={{
                  padding: '14px 16px',
                  background: selectedReply === reply ? '#f0f0ff' : 'white',
                  border: `2px solid ${selectedReply === reply ? '#667eea' : '#f0f0f0'}`,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  color: '#333'
                }}
                onMouseOver={(e) => {
                  if (selectedReply !== reply) {
                    e.currentTarget.style.background = '#fafafa';
                    e.currentTarget.style.borderColor = '#e0e0e0';
                  }
                }}
                onMouseOut={(e) => {
                  if (selectedReply !== reply) {
                    e.currentTarget.style.background = 'white';
                    e.currentTarget.style.borderColor = '#f0f0f0';
                  }
                }}
              >
                {reply}
              </div>
            ))}
          </div>
        )}

        {/* Custom Reply */}
        <div style={{ marginTop: '20px' }}>
          <div style={{
            fontSize: '14px',
            fontWeight: '600',
            marginBottom: '12px',
            color: '#333'
          }}>
            Or write your own
          </div>
          <textarea
            value={customReply}
            onChange={(e) => {
              setCustomReply(e.target.value);
              setSelectedReply(null);
            }}
            placeholder="Type your custom reply..."
            style={{
              width: '100%',
              minHeight: '80px',
              padding: '12px 14px',
              border: '2px solid',
              borderColor: customReply ? '#667eea' : '#f0f0f0',
              borderRadius: '12px',
              fontSize: '14px',
              fontFamily: 'inherit',
              resize: 'vertical',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#667eea'}
            onBlur={(e) => {
              if (!customReply) {
                e.target.style.borderColor = '#f0f0f0';
              }
            }}
          />
        </div>
      </div>

      {/* Footer Actions */}
      <div style={{
        padding: '16px 24px',
        borderTop: '1px solid #f0f0f0',
        background: '#fafafa',
        display: 'flex',
        gap: '12px'
      }}>
        <button
          onClick={onClose}
          style={{
            flex: 1,
            padding: '12px',
            background: 'white',
            border: '2px solid #f0f0f0',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            color: '#666'
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleSendReply}
          disabled={(!selectedReply && !customReply) || sending}
          style={{
            flex: 2,
            padding: '12px',
            background: (!selectedReply && !customReply) || sending 
              ? '#e0e0e0' 
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: (!selectedReply && !customReply) || sending ? 'not-allowed' : 'pointer',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            opacity: (!selectedReply && !customReply) || sending ? 0.6 : 1
          }}
        >
          {sending ? (
            <>
              <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
              Sending...
            </>
          ) : (
            <>
              <Send size={16} />
              Send Reply
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default SmartReplyPanel;