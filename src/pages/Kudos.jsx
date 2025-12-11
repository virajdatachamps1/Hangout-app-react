import { Heart, TrendingUp, Award, Send, Star, Users, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import firestoreService from '../utils/firestoreService';

function Kudos() {
  const { currentUser } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [kudosData, setKudosData] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [newKudos, setNewKudos] = useState({
    to: '',
    toName: '',
    message: '',
    badge: 'Team Player'
  });

  const [searchTerm, setSearchTerm] = useState('');

  const badgeColors = {
    'Team Player': '#3b82f6',
    'Excellence': '#8b5cf6',
    'Innovation': '#10b981',
    'Helpful': '#f59e0b',
    'Leadership': '#ef4444',
    'Creative': '#ec4899'
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [kudos, emps] = await Promise.all([
        firestoreService.kudos.getAll(),
        firestoreService.employees.getAll()
      ]);
      setKudosData(kudos);
      setEmployees(emps);
    } catch (error) {
      console.error('Error loading kudos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendKudos = async () => {
    if (!newKudos.to || !newKudos.message.trim()) {
      alert('Please select a recipient and write a message');
      return;
    }

    try {
      await firestoreService.kudos.create({
        from: currentUser.uid,
        fromName: currentUser.displayName || currentUser.email,
        fromEmail: currentUser.email,
        to: newKudos.to,
        toName: newKudos.toName,
        message: newKudos.message.trim(),
        badge: newKudos.badge
      });

      // Reset form
      setNewKudos({
        to: '',
        toName: '',
        message: '',
        badge: 'Team Player'
      });
      setSearchTerm('');
      setShowForm(false);
      
      // Reload kudos
      loadData();
    } catch (error) {
      console.error('Error sending kudos:', error);
      alert('Failed to send kudos');
    }
  };

  const handleLike = async (kudosId) => {
    try {
      await firestoreService.kudos.toggleLike(kudosId, currentUser.uid);
      loadData();
    } catch (error) {
      console.error('Error liking kudos:', error);
    }
  };

  const handleSelectEmployee = (emp) => {
    setNewKudos({
      ...newKudos,
      to: emp.email,
      toName: emp.name
    });
    setSearchTerm('');
  };

  // Filter employees based on search
  const filteredEmployees = employees.filter(emp => 
    emp.email !== currentUser.email && // Don't show current user
    (emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     emp.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Calculate top recipients
  const topRecipients = employees
    .map(emp => ({
      ...emp,
      count: kudosData.filter(k => k.to === emp.email).length
    }))
    .filter(emp => emp.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header Section */}
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
          <h3 style={{ fontSize: '20px', marginBottom: '24px', fontWeight: '600' }}>
            Send Recognition
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* To - Employee Search/Select */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                To
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder={newKudos.toName || "Search for a team member..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setSearchTerm('')}
                  style={{
                    width: '100%',
                    padding: '14px',
                    border: '2px solid #f0f0f0',
                    borderRadius: '12px',
                    fontSize: '15px',
                    transition: 'border 0.2s'
                  }}
                  onFocusCapture={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => {
                    // Delay to allow click on dropdown
                    setTimeout(() => {
                      e.target.style.borderColor = '#f0f0f0';
                      if (!newKudos.to) setSearchTerm('');
                    }, 200);
                  }}
                />
                
                {/* Dropdown */}
                {searchTerm && (
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
                    zIndex: 10,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}>
                    {filteredEmployees.length === 0 ? (
                      <div style={{ padding: '16px', color: '#999', textAlign: 'center' }}>
                        No employees found
                      </div>
                    ) : (
                      filteredEmployees.map(emp => (
                        <div
                          key={emp.email}
                          onClick={() => handleSelectEmployee(emp)}
                          style={{
                            padding: '12px 16px',
                            cursor: 'pointer',
                            borderBottom: '1px solid #f5f5f5',
                            transition: 'background 0.2s'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.background = '#f8f9fa'}
                          onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                        >
                          <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                            {emp.name}
                          </div>
                          <div style={{ fontSize: '13px', color: '#666' }}>
                            {emp.email} • {emp.department || 'No department'}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
                
                {/* Selected employee indicator */}
                {newKudos.to && !searchTerm && (
                  <div style={{
                    position: 'absolute',
                    right: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '13px',
                    color: '#10b981',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    ✓ Selected
                  </div>
                )}
              </div>
            </div>

            {/* Badge Selection */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                Badge
              </label>
              <select
                value={newKudos.badge}
                onChange={(e) => setNewKudos({...newKudos, badge: e.target.value})}
                style={{
                  width: '100%',
                  padding: '14px',
                  border: '2px solid #f0f0f0',
                  borderRadius: '12px',
                  fontSize: '15px',
                  cursor: 'pointer'
                }}
              >
                {Object.keys(badgeColors).map(badge => (
                  <option key={badge} value={badge}>{badge}</option>
                ))}
              </select>
            </div>

            {/* Message */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                Your Message
              </label>
              <textarea
                placeholder="Share what they did great..."
                value={newKudos.message}
                onChange={(e) => setNewKudos({...newKudos, message: e.target.value})}
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

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowForm(false);
                  setNewKudos({ to: '', toName: '', message: '', badge: 'Team Player' });
                  setSearchTerm('');
                }}
                style={{
                  padding: '12px 24px',
                  background: '#f5f5f5',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSendKudos}
                style={{
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Send size={16} />
                Send Kudos
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '32px', alignItems: 'start' }}>
        {/* Kudos Feed */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {kudosData.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🎉</div>
              <p>No kudos yet. Be the first to recognize someone!</p>
            </div>
          ) : (
            kudosData.map(kudo => (
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
                    {kudo.fromName.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '15px', fontWeight: '600', marginBottom: '4px' }}>
                      {kudo.fromName}
                      <span style={{ color: '#999', fontWeight: '400', margin: '0 8px' }}>→</span>
                      {kudo.toName}
                    </div>
                    <div style={{ fontSize: '13px', color: '#999' }}>
                      {firestoreService.timeAgo(kudo.createdAt)}
                    </div>
                  </div>
                  <div style={{
                    padding: '6px 14px',
                    background: `${badgeColors[kudo.badge]}15`,
                    color: badgeColors[kudo.badge],
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <Star size={12} fill={badgeColors[kudo.badge]} />
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
                  borderLeft: `4px solid ${badgeColors[kudo.badge]}`
                }}>
                  "{kudo.message}"
                </p>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <button 
                    onClick={() => handleLike(kudo.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 18px',
                      background: kudo.likedBy?.includes(currentUser.uid) ? '#ffe0e0' : '#fff0f0',
                      border: 'none',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#e63946',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.background = '#ffe0e0'}
                    onMouseOut={(e) => e.target.style.background = kudo.likedBy?.includes(currentUser.uid) ? '#ffe0e0' : '#fff0f0'}
                  >
                    <Heart 
                      size={16} 
                      fill={kudo.likedBy?.includes(currentUser.uid) ? "#e63946" : "none"}
                    />
                    {kudo.likes || 0}
                  </button>
                </div>
              </div>
            ))
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

            {topRecipients.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                No kudos given yet
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {topRecipients.map((recipient, index) => (
                  <div 
                    key={recipient.email}
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
                      {recipient.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '15px', fontWeight: '600', marginBottom: '4px' }}>
                        {recipient.name}
                      </div>
                      <div style={{ fontSize: '13px', color: '#666', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Award size={14} />
                        {recipient.count} kudos
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

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
                  Total Kudos Given
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