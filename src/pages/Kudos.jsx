import { Heart, TrendingUp, Award, Send, Star, Users, Mic, X, Volume2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import VoiceNoteRecorder from '../components/VoiceNoteRecorder';
import Confetti from '../components/Confetti';
import { useToast, ToastContainer } from '../components/Toast';
import {
  subscribeToKudos,
  createKudos,
  addKudosReaction,
  removeKudosReaction,
  uploadVoiceNote
} from '../utils/firebaseUtils';


function Kudos() {
  const { currentUser } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [kudosData, setKudosData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const { toasts, showToast, removeToast } = useToast();
  
  // Form state
  const [kudosTo, setKudosTo] = useState('');
  const [kudosMessage, setKudosMessage] = useState('');
  const [selectedBadge, setSelectedBadge] = useState('Team Player');
  const [sending, setSending] = useState(false);

  // Available reaction emojis
  const reactionEmojis = ['❤️', '🔥', '👏', '💯', '🎉', '⭐'];
  const badges = ['Team Player', 'Excellence', 'Innovation', 'Helpful', 'Leadership'];

  // Subscribe to real-time kudos
  useEffect(() => {
    const unsubscribe = subscribeToKudos((newKudos) => {
      setKudosData(newKudos);
      setLoading(false);
    }, 20);

    return () => unsubscribe();
  }, []);

  // Send kudos (text or voice)
  const handleSendKudos = async (voiceBlob = null) => {
    if (!kudosTo || (!kudosMessage && !voiceBlob)) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    setSending(true);
    try {
      let voiceNoteUrl = null;
      
      // Upload voice note if present
      if (voiceBlob) {
        voiceNoteUrl = await uploadVoiceNote(voiceBlob, currentUser.uid);
      }

      // Create kudos
      await createKudos(
        currentUser.uid,
        currentUser.email?.split('@')[0] || 'Anonymous',
        kudosTo,
        kudosMessage || '🎤 Sent a voice kudos',
        selectedBadge,
        voiceNoteUrl
      );

      // Show success
      showToast('Kudos sent successfully! 🎉', 'success');
      setShowConfetti(true);
      
      // Reset form
      setKudosTo('');
      setKudosMessage('');
      setSelectedBadge('Team Player');
      setShowForm(false);
      setShowVoiceRecorder(false);
      
    } catch (error) {
      console.error('Error sending kudos:', error);
      showToast('Failed to send kudos. Please try again.', 'error');
    } finally {
      setSending(false);
    }
  };

  // Handle voice recording complete
  const handleVoiceComplete = (audioBlob) => {
    handleSendKudos(audioBlob);
  };

  // Toggle reaction
  const handleReaction = async (kudosId, emoji) => {
    if (!currentUser) return;
    
    try {
      const kudos = kudosData.find(k => k.id === kudosId);
      const reactions = kudos?.reactions || {};
      const userReacted = reactions[emoji]?.includes(currentUser.uid);
      
      if (userReacted) {
        await removeKudosReaction(kudosId, currentUser.uid, emoji);
      } else {
        await addKudosReaction(kudosId, currentUser.uid, emoji);
      }
    } catch (error) {
      console.error('Error toggling reaction:', error);
      showToast('Failed to add reaction', 'error');
    }
  };

  // Get reaction count
  const getReactionCount = (kudos, emoji) => {
    return kudos?.reactions?.[emoji]?.length || 0;
  };

  // Check if user reacted
  const userReacted = (kudos, emoji) => {
    return kudos?.reactions?.[emoji]?.includes(currentUser?.uid);
  };

  // Calculate top recipients from kudosData
  const calculateTopRecipients = () => {
    const recipientCounts = {};
    kudosData.forEach(k => {
      if (k.to) {
        recipientCounts[k.to] = (recipientCounts[k.to] || 0) + 1;
      }
    });
    
    return Object.entries(recipientCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([name, count]) => ({
        name,
        avatar: name.split(' ').map(n => n[0]).join(''),
        count,
        trend: '+' + Math.floor(Math.random() * 5)
      }));
  };

  const topRecipients = calculateTopRecipients();

  const badgeColors = {
    'Team Player': '#3b82f6',
    'Excellence': '#8b5cf6',
    'Innovation': '#10b981',
    'Helpful': '#f59e0b',
    'Leadership': '#ef4444'
  };

  if (loading) {
    return (
      <div className="loading" style={{ minHeight: '400px' }}>
        <div className="spinner-fancy" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Confetti Effect */}
      {showConfetti && <Confetti onComplete={() => setShowConfetti(false)} />}
      
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Header Section */}
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '48px 32px',
        borderRadius: '24px',
        marginBottom: '32px',
        color: 'white',
        boxShadow: '0 20px 60px rgba(102, 126, 234, 0.3)'
      }}
      className="card-transition">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h1 style={{ fontSize: '36px', marginBottom: '8px', fontWeight: '700' }}>
              Kudos Board
            </h1>
            <p style={{ fontSize: '16px', opacity: 0.95 }}>
              Celebrate your teammates and spread positivity ✨
            </p>
          </div>
          <button 
            onClick={() => {
              setShowForm(!showForm);
              setShowVoiceRecorder(false);
            }}
            disabled={sending}
            style={{
              padding: '14px 28px',
              background: 'white',
              color: '#667eea',
              border: 'none',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: sending ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              transition: 'transform 0.2s',
              opacity: sending ? 0.6 : 1
            }}
            className="hover-scale"
          >
            <Send size={18} />
            Give Kudos
          </button>
        </div>
      </div>

      {/* Give Kudos Form */}
      {showForm && !showVoiceRecorder && (
        <div style={{
          background: 'white',
          padding: '32px',
          borderRadius: '20px',
          marginBottom: '32px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(0, 0, 0, 0.05)'
        }}
        className="animate-slide-down">
          <h3 style={{ fontSize: '20px', marginBottom: '24px', fontWeight: '600' }}>
            Send Recognition
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                To
              </label>
              <input
                type="text"
                placeholder="Enter team member name..."
                value={kudosTo}
                onChange={(e) => setKudosTo(e.target.value)}
                disabled={sending}
                style={{
                  width: '100%',
                  padding: '14px',
                  border: '2px solid #f0f0f0',
                  borderRadius: '12px',
                  fontSize: '15px',
                  transition: 'border 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#f0f0f0'}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                Badge Type
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {badges.map(badge => (
                  <button
                    key={badge}
                    onClick={() => setSelectedBadge(badge)}
                    disabled={sending}
                    style={{
                      padding: '8px 16px',
                      background: selectedBadge === badge ? badgeColors[badge] : '#f5f5f5',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: selectedBadge === badge ? 'white' : '#666',
                      cursor: sending ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s'
                    }}
                    className="hover-scale"
                  >
                    {badge}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                Your Message
              </label>
              <textarea
                placeholder="Share what they did great..."
                rows="4"
                value={kudosMessage}
                onChange={(e) => setKudosMessage(e.target.value)}
                disabled={sending}
                style={{
                  width: '100%',
                  padding: '14px',
                  border: '2px solid #f0f0f0',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  transition: 'border 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#f0f0f0'}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowForm(false)}
                disabled={sending}
                style={{
                  padding: '12px 24px',
                  background: '#f5f5f5',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: sending ? 'not-allowed' : 'pointer',
                  color: '#666'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => setShowVoiceRecorder(true)}
                disabled={sending}
                style={{
                  padding: '12px 24px',
                  background: '#f59e0b',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: sending ? 'not-allowed' : 'pointer',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                className="hover-scale"
              >
                <Mic size={16} />
                Voice Kudos
              </button>
              <button
                onClick={() => handleSendKudos()}
                disabled={sending}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: sending ? 'not-allowed' : 'pointer',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  opacity: sending ? 0.6 : 1
                }}
                className="hover-scale"
              >
                <Send size={16} />
                {sending ? 'Sending...' : 'Send Kudos'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Voice Recorder */}
      {showVoiceRecorder && (
        <div style={{ marginBottom: '32px' }} className="animate-slide-down">
          <VoiceNoteRecorder
            onRecordComplete={handleVoiceComplete}
            onCancel={() => setShowVoiceRecorder(false)}
          />
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '32px', alignItems: 'start' }}>
        {/* Kudos Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {kudosData.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              background: 'white',
              borderRadius: '20px',
              color: '#999'
            }}>
              <Award size={64} style={{ opacity: 0.3, marginBottom: '16px' }} />
              <p style={{ fontSize: '16px' }}>No kudos yet. Be the first to spread positivity!</p>
            </div>
          ) : (
            kudosData.map(kudo => {
              const config = badgeColors[kudo.badge] || '#667eea';
              
              return (
                <div 
                  key={kudo.id}
                  style={{
                    background: 'white',
                    padding: '28px',
                    borderRadius: '20px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
                    border: '1px solid rgba(0, 0, 0, 0.04)'
                  }}
                  className="card-transition animate-fade-in"
                >
                  {/* Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '16px',
                      fontWeight: '600'
                    }}>
                      {kudo.from?.charAt(0) || 'A'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '15px', fontWeight: '600', marginBottom: '4px' }}>
                        {kudo.from}
                        <span style={{ color: '#999', fontWeight: '400', margin: '0 8px' }}>→</span>
                        {kudo.to}
                      </div>
                      <div style={{ fontSize: '13px', color: '#999' }}>
                        {new Date(kudo.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{
                      padding: '6px 14px',
                      background: `${config}15`,
                      color: config,
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <Star size={12} fill={config} />
                      {kudo.badge}
                    </div>
                  </div>

                  {/* Message */}
                  <p style={{
                    fontSize: '15px',
                    lineHeight: '1.7',
                    color: '#333',
                    marginBottom: '20px',
                    padding: '20px',
                    background: '#fafafa',
                    borderRadius: '12px',
                    borderLeft: `4px solid ${config}`
                  }}>
                    "{kudo.message}"
                  </p>

                  {/* Voice Note */}
                  {kudo.voiceNoteUrl && (
                    <div style={{
                      marginBottom: '20px',
                      padding: '12px 16px',
                      background: '#f0f0f0',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <Volume2 size={20} color="#667eea" />
                      <audio controls src={kudo.voiceNoteUrl} style={{ flex: 1, height: '30px' }} />
                    </div>
                  )}

                  {/* Reactions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    {reactionEmojis.map(emoji => {
                      const count = getReactionCount(kudo, emoji);
                      const reacted = userReacted(kudo, emoji);
                      
                      return (
                        <button
                          key={emoji}
                          onClick={() => handleReaction(kudo.id, emoji)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 14px',
                            background: reacted ? '#667eea15' : '#f5f5f5',
                            border: reacted ? '2px solid #667eea' : '2px solid transparent',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: '600',
                            color: reacted ? '#667eea' : '#666',
                            transition: 'all 0.2s'
                          }}
                          className="hover-scale"
                        >
                          <span>{emoji}</span>
                          {count > 0 && <span style={{ fontSize: '14px' }}>{count}</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Sidebar - Top Recipients */}
        <div style={{ position: 'sticky', top: '24px' }}>
          <div style={{
            background: 'white',
            padding: '28px',
            borderRadius: '20px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
            border: '1px solid rgba(0, 0, 0, 0.04)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <TrendingUp size={20} color="white" />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Top Recipients</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {topRecipients.map((recipient, index) => (
                <div 
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px',
                    background: index === 0 ? 'linear-gradient(135deg, #fff5e6 0%, #ffe8cc 100%)' : '#fafafa',
                    borderRadius: '14px',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  className="card-transition"
                >
                  {index === 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      fontSize: '20px'
                    }}>
                      👑
                    </div>
                  )}
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: index === 0 ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' : '#ddd',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '600',
                    flexShrink: 0
                  }}>
                    {recipient.avatar}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '15px', fontWeight: '600', marginBottom: '4px' }}>
                      {recipient.name}
                    </div>
                    <div style={{ fontSize: '13px', color: '#666', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Award size={14} />
                      {recipient.count} kudos
                      <span style={{ 
                        color: '#10b981', 
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {recipient.trend}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div style={{
              marginTop: '24px',
              padding: '20px',
              background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
              borderRadius: '14px'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#667eea', marginBottom: '4px' }}>
                  {kudosData.length}
                </div>
                <div style={{ fontSize: '14px', color: '#666', fontWeight: '500' }}>
                  Kudos This Month
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Kudos;