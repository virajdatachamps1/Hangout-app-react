// src/pages/Celebrations.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, getDocs, addDoc, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Cake, Gift, Calendar, Sparkles, Heart, Send, X } from 'lucide-react';

function Celebrations() {
  const { userData } = useAuth();
  const [allCelebrations, setAllCelebrations] = useState([]);
  const [wishes, setWishes] = useState({});
  const [loading, setLoading] = useState(true);
  const [wishText, setWishText] = useState({});
  const [activeWishId, setActiveWishId] = useState(null);
  const [sendingWish, setSendingWish] = useState(false);

  useEffect(() => {
    fetchCelebrations();
    fetchAllWishes();
  }, []);

  const fetchCelebrations = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const celebrations = [];

      usersSnapshot.docs.forEach(doc => {
        const user = doc.data();
        
        if (user.birthday) {
          celebrations.push({
            id: `birthday-${doc.id}`,
            userEmail: user.email,
            name: user.name,
            email: user.email,
            department: user.department,
            date: new Date(user.birthday),
            type: 'birthday'
          });
        }
        
        if (user.workAnniversary) {
          const annivDate = new Date(user.workAnniversary);
          const years = new Date().getFullYear() - annivDate.getFullYear();
          
          celebrations.push({
            id: `anniversary-${doc.id}`,
            userEmail: user.email,
            name: user.name,
            email: user.email,
            department: user.department,
            date: annivDate,
            type: 'anniversary',
            years: years > 0 ? years : 1
          });
        }
      });

      setAllCelebrations(celebrations);
    } catch (error) {
      console.error('Error fetching celebrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllWishes = async () => {
    try {
      const wishesSnapshot = await getDocs(collection(db, 'celebration-wishes'));
      const wishesData = {};
      
      wishesSnapshot.docs.forEach(doc => {
        const wish = doc.data();
        if (!wishesData[wish.celebrationId]) {
          wishesData[wish.celebrationId] = [];
        }
        wishesData[wish.celebrationId].push({
          id: doc.id,
          ...wish
        });
      });
      
      setWishes(wishesData);
    } catch (error) {
      console.error('Error fetching wishes:', error);
    }
  };

  const getTodayCelebrations = () => {
    const today = new Date();
    return allCelebrations.filter(c => {
      const cDate = new Date(c.date);
      return cDate.getMonth() === today.getMonth() && cDate.getDate() === today.getDate();
    });
  };

  const getUpcomingCelebrations = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const upcoming = allCelebrations.filter(c => {
      const cDate = new Date(c.date);
      const thisYearDate = new Date(today.getFullYear(), cDate.getMonth(), cDate.getDate());
      const nextYearDate = new Date(today.getFullYear() + 1, cDate.getMonth(), cDate.getDate());
      
      const daysUntilThisYear = Math.ceil((thisYearDate - today) / (1000 * 60 * 60 * 24));
      const daysUntilNextYear = Math.ceil((nextYearDate - today) / (1000 * 60 * 60 * 24));
      
      // Exclude today (daysUntil === 0) and include next 30 days
      return (daysUntilThisYear > 0 && daysUntilThisYear <= 30) || 
             (daysUntilNextYear > 0 && daysUntilNextYear <= 30);
    }).map(c => {
      const cDate = new Date(c.date);
      const today = new Date();
      const thisYearDate = new Date(today.getFullYear(), cDate.getMonth(), cDate.getDate());
      const nextYearDate = new Date(today.getFullYear() + 1, cDate.getMonth(), cDate.getDate());
      
      const daysUntilThisYear = Math.ceil((thisYearDate - today) / (1000 * 60 * 60 * 24));
      const daysUntilNextYear = Math.ceil((nextYearDate - today) / (1000 * 60 * 60 * 24));
      
      const daysUntil = daysUntilThisYear > 0 ? daysUntilThisYear : daysUntilNextYear;
      const upcomingDate = daysUntilThisYear > 0 ? thisYearDate : nextYearDate;
      
      return {
        ...c,
        daysUntil,
        upcomingDate
      };
    }).sort((a, b) => a.daysUntil - b.daysUntil);

    return upcoming;
  };

  const handleSendWish = async (celebration) => {
    const message = wishText[celebration.id];
    if (!message || !message.trim()) {
      alert('Please write a message');
      return;
    }

    setSendingWish(true);
    try {
      await addDoc(collection(db, 'celebration-wishes'), {
        celebrationId: celebration.id,
        celebrationType: celebration.type,
        toEmail: celebration.userEmail,
        toName: celebration.name,
        fromEmail: userData.email,
        fromName: userData.name,
        message: message.trim(),
        createdAt: Timestamp.now()
      });

      alert('✅ Wish sent successfully!');
      setWishText({ ...wishText, [celebration.id]: '' });
      setActiveWishId(null);
      fetchAllWishes(); // Refresh wishes
    } catch (error) {
      console.error('Error sending wish:', error);
      alert('Failed to send wish');
    } finally {
      setSendingWish(false);
    }
  };

  const getTypeConfig = (type) => {
    return type === 'birthday' 
      ? { icon: Cake, color: '#ec4899', emoji: '🎂', label: 'Birthday' }
      : { icon: Gift, color: '#8b5cf6', emoji: '🎁', label: 'Work Anniversary' };
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  const todayCelebrations = getTodayCelebrations();
  const upcomingCelebrations = getUpcomingCelebrations();

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
        padding: '48px 32px',
        borderRadius: '24px',
        marginBottom: '32px',
        color: 'white',
        boxShadow: '0 20px 60px rgba(236, 72, 153, 0.3)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-20px',
          right: '-20px',
          fontSize: '120px',
          opacity: 0.1
        }}>
          🎉
        </div>
        <h1 style={{ fontSize: '36px', marginBottom: '8px', fontWeight: '700', position: 'relative' }}>
          Celebrations
        </h1>
        <p style={{ fontSize: '16px', opacity: 0.95, position: 'relative' }}>
          Celebrate special moments with your team
        </p>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '20px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: '#ec489915',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <Cake size={24} color="#ec4899" />
          </div>
          <div style={{ fontSize: '32px', fontWeight: '800', marginBottom: '4px', color: '#ec4899' }}>
            {todayCelebrations.length}
          </div>
          <div style={{ fontSize: '14px', color: '#666', fontWeight: '500' }}>
            Today's Celebrations
          </div>
        </div>

        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '20px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: '#8b5cf615',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <Calendar size={24} color="#8b5cf6" />
          </div>
          <div style={{ fontSize: '32px', fontWeight: '800', marginBottom: '4px', color: '#8b5cf6' }}>
            {upcomingCelebrations.length}
          </div>
          <div style={{ fontSize: '14px', color: '#666', fontWeight: '500' }}>
            Upcoming (30 days)
          </div>
        </div>

        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '20px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: '#10b98115',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <Sparkles size={24} color="#10b981" />
          </div>
          <div style={{ fontSize: '32px', fontWeight: '800', marginBottom: '4px', color: '#10b981' }}>
            {allCelebrations.length}
          </div>
          <div style={{ fontSize: '14px', color: '#666', fontWeight: '500' }}>
            Total Events
          </div>
        </div>
      </div>

      {/* Today's Celebrations */}
      {todayCelebrations.length > 0 && (
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <Sparkles size={24} color="#ec4899" />
            <h2 style={{ fontSize: '24px', fontWeight: '700' }}>
              Today's Celebrations 🎊
            </h2>
          </div>

          <div style={{ display: 'grid', gap: '24px' }}>
            {todayCelebrations.map(celebration => {
              const config = getTypeConfig(celebration.type);
              const TypeIcon = config.icon;
              const isWishing = activeWishId === celebration.id;
              const celebrationWishes = wishes[celebration.id] || [];

              return (
                <div 
                  key={celebration.id}
                  style={{
                    background: 'white',
                    padding: '32px',
                    borderRadius: '24px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                    border: `3px solid ${config.color}20`,
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: '-40px',
                    right: '-40px',
                    fontSize: '140px',
                    opacity: 0.05
                  }}>
                    {config.emoji}
                  </div>

                  <div style={{ position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'start', gap: '24px', marginBottom: '24px' }}>
                      <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${config.color}, ${config.color}dd)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '32px',
                        fontWeight: '700',
                        flexShrink: 0,
                        boxShadow: `0 8px 24px ${config.color}40`
                      }}>
                        {getInitials(celebration.name)}
                      </div>

                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>
                          {celebration.name}
                        </h3>
                        {celebration.department && (
                          <div style={{ fontSize: '15px', color: '#666', marginBottom: '12px' }}>
                            {celebration.department}
                          </div>
                        )}
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '10px 20px',
                          background: `${config.color}15`,
                          borderRadius: '12px'
                        }}>
                          <TypeIcon size={20} color={config.color} />
                          <span style={{ fontSize: '16px', fontWeight: '700', color: config.color }}>
                            {celebration.type === 'birthday' 
                              ? config.label
                              : `${celebration.years} ${celebration.years === 1 ? 'Year' : 'Years'} Anniversary`
                            }
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Wishes Section */}
                    {celebrationWishes.length > 0 && (
                      <div style={{
                        background: '#fafafa',
                        padding: '24px',
                        borderRadius: '16px',
                        marginBottom: '20px'
                      }}>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          marginBottom: '16px'
                        }}>
                          <span style={{ fontSize: '15px', fontWeight: '600', color: '#666' }}>
                            💬 {celebrationWishes.length} {celebrationWishes.length === 1 ? 'wish' : 'wishes'}
                          </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '200px', overflowY: 'auto' }}>
                          {celebrationWishes.map((wish) => (
                            <div key={wish.id} style={{
                              background: 'white',
                              padding: '14px 16px',
                              borderRadius: '12px',
                              borderLeft: `3px solid ${config.color}`
                            }}>
                              <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
                                {wish.fromName}
                              </div>
                              <div style={{ fontSize: '14px', color: '#444', lineHeight: '1.5' }}>
                                {wish.message}
                              </div>
                              <div style={{ fontSize: '12px', color: '#999', marginTop: '6px' }}>
                                {wish.createdAt?.toDate().toLocaleDateString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Write Wish Section */}
                    {!isWishing ? (
                      <button
                        onClick={() => setActiveWishId(celebration.id)}
                        style={{
                          width: '100%',
                          padding: '16px',
                          background: `linear-gradient(135deg, ${config.color}, ${config.color}dd)`,
                          border: 'none',
                          borderRadius: '14px',
                          fontSize: '16px',
                          fontWeight: '600',
                          color: 'white',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '10px',
                          boxShadow: `0 4px 16px ${config.color}40`,
                          transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                        onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                      >
                        <Heart size={20} />
                        Send Your Wishes
                      </button>
                    ) : (
                      <div style={{
                        padding: '20px',
                        background: 'white',
                        border: `2px solid ${config.color}30`,
                        borderRadius: '14px'
                      }}>
                        <textarea
                          placeholder="Write your wishes here..."
                          value={wishText[celebration.id] || ''}
                          onChange={(e) => setWishText({ ...wishText, [celebration.id]: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '14px',
                            border: '2px solid #f0f0f0',
                            borderRadius: '10px',
                            fontSize: '15px',
                            fontFamily: 'inherit',
                            resize: 'vertical',
                            minHeight: '80px',
                            marginBottom: '12px'
                          }}
                          autoFocus
                        />
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => {
                              setActiveWishId(null);
                              setWishText({ ...wishText, [celebration.id]: '' });
                            }}
                            disabled={sendingWish}
                            style={{
                              padding: '10px 20px',
                              background: '#f5f5f5',
                              border: 'none',
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
                            onClick={() => handleSendWish(celebration)}
                            disabled={sendingWish}
                            style={{
                              padding: '10px 20px',
                              background: `linear-gradient(135deg, ${config.color}, ${config.color}dd)`,
                              border: 'none',
                              borderRadius: '10px',
                              fontSize: '14px',
                              fontWeight: '600',
                              cursor: sendingWish ? 'not-allowed' : 'pointer',
                              color: 'white',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              opacity: sendingWish ? 0.7 : 1
                            }}
                          >
                            <Send size={16} />
                            {sendingWish ? 'Sending...' : 'Send'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Upcoming Celebrations */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <Calendar size={24} color="#8b5cf6" />
          <h2 style={{ fontSize: '24px', fontWeight: '700' }}>
            Upcoming Celebrations
          </h2>
        </div>

        {upcomingCelebrations.length === 0 ? (
          <div style={{
            background: 'white',
            padding: '60px',
            borderRadius: '20px',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)'
          }}>
            <Calendar size={64} color="#ddd" style={{ marginBottom: '16px' }} />
            <p style={{ fontSize: '16px', color: '#666' }}>
              No upcoming celebrations in the next 30 days
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {upcomingCelebrations.map(celebration => {
              const config = getTypeConfig(celebration.type);
              const TypeIcon = config.icon;

              return (
                <div 
                  key={celebration.id}
                  style={{
                    background: 'white',
                    padding: '24px',
                    borderRadius: '20px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
                    border: '1px solid rgba(0, 0, 0, 0.04)',
                    transition: 'all 0.2s',
                    cursor: 'pointer'
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                    <div style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      background: `${config.color}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: config.color,
                      fontSize: '24px',
                      fontWeight: '700',
                      flexShrink: 0
                    }}>
                      {getInitials(celebration.name)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px' }}>
                        {celebration.name}
                      </h4>
                      {celebration.department && (
                        <div style={{ fontSize: '13px', color: '#666' }}>
                          {celebration.department}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{
                    padding: '14px',
                    background: `${config.color}10`,
                    borderRadius: '12px',
                    marginBottom: '12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <TypeIcon size={18} color={config.color} />
                      <span style={{ fontSize: '14px', fontWeight: '600', color: config.color }}>
                        {celebration.type === 'birthday' 
                          ? config.label
                          : `${celebration.years} ${celebration.years === 1 ? 'Year' : 'Years'} Anniversary`
                        }
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#666' }}>
                      📅 {celebration.upcomingDate.toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })} • In {celebration.daysUntil} {celebration.daysUntil === 1 ? 'day' : 'days'}
                    </div>
                  </div>

                  <div style={{
                    padding: '10px',
                    background: '#fafafa',
                    borderRadius: '10px',
                    textAlign: 'center',
                    fontSize: '13px',
                    color: '#666',
                    fontWeight: '500'
                  }}>
                    🔔 Set a reminder
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Celebrations;