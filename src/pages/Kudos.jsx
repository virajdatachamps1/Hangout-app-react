// src/pages/Kudos.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Heart, Send, Star, Award, Zap, ThumbsUp, Sparkles, X, Search } from 'lucide-react';

function Kudos() {
  const { userData } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [kudosData, setKudosData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Form state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);

  // Preset kudos templates
  const presetKudos = [
    {
      id: 1,
      icon: Star,
      color: '#f59e0b',
      title: 'Great Work!',
      message: 'Amazing job on the recent project! Your dedication and hard work really made a difference. Keep up the excellent work! 🌟'
    },
    {
      id: 2,
      icon: ThumbsUp,
      color: '#10b981',
      title: 'Team Player',
      message: 'Thank you for always being there to help the team! Your collaborative spirit makes our workplace better every day. 🤝'
    },
    {
      id: 3,
      icon: Zap,
      color: '#3b82f6',
      title: 'Problem Solver',
      message: 'Your quick thinking and problem-solving skills saved the day! Thank you for going above and beyond. ⚡'
    },
    {
      id: 4,
      icon: Sparkles,
      color: '#ec4899',
      title: 'Innovative Idea',
      message: 'Your creative ideas and innovative approach are truly inspiring! Thanks for pushing boundaries and thinking outside the box. 💡'
    }
  ];

  useEffect(() => {
    fetchKudos();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = allUsers.filter(user => 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers([]);
    }
  }, [searchQuery, allUsers]);

  const fetchKudos = async () => {
    try {
      const q = query(collection(db, 'kudos'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const kudos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setKudosData(kudos);
    } catch (error) {
      console.error('Error fetching kudos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      const users = snapshot.docs.map(doc => ({
        email: doc.id,
        ...doc.data()
      }));
      setAllUsers(users);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleSendKudos = async (presetMessage = null) => {
    if (!selectedUser) {
      alert('Please select a recipient');
      return;
    }

    const finalMessage = presetMessage || message;
    if (!finalMessage.trim()) {
      alert('Please write a message');
      return;
    }

    setSending(true);
    try {
      await addDoc(collection(db, 'kudos'), {
        from: userData.email,
        fromName: userData.name,
        to: selectedUser.email,
        toName: selectedUser.name,
        message: finalMessage,
        createdAt: Timestamp.now(),
        likes: 0
      });

      alert('✅ Kudos sent successfully!');
      setShowForm(false);
      setSelectedUser(null);
      setSearchQuery('');
      setMessage('');
      fetchKudos();
    } catch (error) {
      console.error('Error sending kudos:', error);
      alert('Failed to send kudos');
    } finally {
      setSending(false);
    }
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setSearchQuery(user.name);
    setFilteredUsers([]);
  };

  const handleUsePreset = (preset) => {
    if (!selectedUser) {
      alert('Please select a recipient first');
      return;
    }
    handleSendKudos(preset.message);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '48px 32px',
        borderRadius: '24px',
        marginBottom: '32px',
        color: 'white',
        boxShadow: '0 20px 60px rgba(102, 126, 234, 0.3)'
      }}>
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
            onClick={() => setShowForm(!showForm)}
            style={{
              padding: '14px 28px',
              background: 'white',
              color: '#667eea',
              border: 'none',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
          >
            <Send size={18} />
            Give Kudos
          </button>
        </div>
      </div>

      {/* Give Kudos Form */}
      {showForm && (
        <div style={{
          background: 'white',
          padding: '32px',
          borderRadius: '20px',
          marginBottom: '32px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600' }}>
              Send Recognition
            </h3>
            <button
              onClick={() => setShowForm(false)}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: 'none',
                background: '#f5f5f5',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Search User */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
              To
            </label>
            <div style={{ position: 'relative' }}>
              <Search size={20} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
              <input
                type="text"
                placeholder="Search for a team member..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 14px 14px 46px',
                  border: '2px solid #f0f0f0',
                  borderRadius: '12px',
                  fontSize: '15px',
                  transition: 'border 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => setTimeout(() => e.target.style.borderColor = '#f0f0f0', 200)}
              />
              
              {/* Dropdown suggestions */}
              {filteredUsers.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  background: 'white',
                  border: '2px solid #f0f0f0',
                  borderRadius: '12px',
                  marginTop: '4px',
                  maxHeight: '200px',
                  overflowY: 'auto',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  zIndex: 10
                }}>
                  {filteredUsers.map(user => (
                    <div
                      key={user.email}
                      onClick={() => handleSelectUser(user)}
                      style={{
                        padding: '12px 16px',
                        cursor: 'pointer',
                        borderBottom: '1px solid #f5f5f5',
                        transition: 'background 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = '#fafafa'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                    >
                      <div style={{ fontWeight: '600', marginBottom: '4px' }}>{user.name}</div>
                      <div style={{ fontSize: '13px', color: '#999' }}>{user.email}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Selected User Display */}
            {selectedUser && (
              <div style={{
                marginTop: '12px',
                padding: '12px',
                background: '#f0fdf4',
                border: '2px solid #10b981',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontWeight: '600', color: '#065f46' }}>{selectedUser.name}</div>
                  <div style={{ fontSize: '13px', color: '#059669' }}>{selectedUser.email}</div>
                </div>
                <button
                  onClick={() => {
                    setSelectedUser(null);
                    setSearchQuery('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#059669'
                  }}
                >
                  <X size={18} />
                </button>
              </div>
            )}
          </div>

          {/* Quick Preset Kudos */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '12px', fontSize: '14px', fontWeight: '600' }}>
              Quick Send (Presets)
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              {presetKudos.map(preset => {
                const Icon = preset.icon;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleUsePreset(preset)}
                    disabled={!selectedUser || sending}
                    style={{
                      padding: '16px',
                      background: selectedUser ? `${preset.color}10` : '#f5f5f5',
                      border: `2px solid ${selectedUser ? preset.color + '30' : '#e0e0e0'}`,
                      borderRadius: '12px',
                      cursor: selectedUser ? 'pointer' : 'not-allowed',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                      opacity: selectedUser ? 1 : 0.5
                    }}
                    onMouseOver={(e) => selectedUser && (e.currentTarget.style.transform = 'translateY(-2px)')}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <Icon size={20} color={preset.color} />
                      <span style={{ fontWeight: '600', color: preset.color }}>{preset.title}</span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#666', lineHeight: '1.4' }}>
                      {preset.message.substring(0, 60)}...
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Message */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
              Custom Message
            </label>
            <textarea
              placeholder="Write your personalized message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows="4"
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

          {/* Send Button */}
          <button
            onClick={() => handleSendKudos()}
            disabled={!selectedUser || !message.trim() || sending}
            style={{
              width: '100%',
              padding: '14px',
              background: selectedUser && message.trim() ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#e0e0e0',
              border: 'none',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: selectedUser && message.trim() ? 'pointer' : 'not-allowed',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <Send size={18} />
            {sending ? 'Sending...' : 'Send Custom Kudos'}
          </button>
        </div>
      )}

      {/* Kudos Feed */}
      {kudosData.length === 0 ? (
        <div style={{
          background: 'white',
          padding: '80px 40px',
          borderRadius: '24px',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)'
        }}>
          <Award size={64} color="#ddd" style={{ marginBottom: '20px' }} />
          <h3 style={{ fontSize: '22px', marginBottom: '12px', color: '#111' }}>
            No Kudos Yet
          </h3>
          <p style={{ color: '#666', fontSize: '16px' }}>
            Be the first to recognize your teammates!
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {kudosData.map(kudo => (
            <div 
              key={kudo.id}
              style={{
                background: 'white',
                padding: '28px',
                borderRadius: '20px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
                border: '1px solid rgba(0, 0, 0, 0.04)',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.12)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.06)';
              }}
            >
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
                  {kudo.fromName?.[0] || 'U'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '15px', fontWeight: '600', marginBottom: '4px' }}>
                    {kudo.fromName}
                    <span style={{ color: '#999', fontWeight: '400', margin: '0 8px' }}>→</span>
                    {kudo.toName}
                  </div>
                  <div style={{ fontSize: '13px', color: '#999' }}>
                    {kudo.createdAt?.toDate().toLocaleDateString()}
                  </div>
                </div>
                <Award size={24} color="#f59e0b" />
              </div>

              <p style={{
                fontSize: '15px',
                lineHeight: '1.7',
                color: '#333',
                padding: '20px',
                background: '#fafafa',
                borderRadius: '12px',
                borderLeft: '4px solid #667eea'
              }}>
                "{kudo.message}"
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '20px' }}>
                <button style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 18px',
                  background: '#fff0f0',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#e63946',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.target.style.background = '#ffe0e0'}
                onMouseOut={(e) => e.target.style.background = '#fff0f0'}
                >
                  <Heart size={16} fill="#e63946" />
                  {kudo.likes || 0}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Kudos;