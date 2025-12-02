// src/pages/Announcements.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Bell, Pin, AlertCircle, Info, CheckCircle, Calendar as CalendarIcon, Award, Plus, X } from 'lucide-react';

function Announcements() {
  const { userData } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState('all');

  // Form state
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('general');
  const [isPinned, setIsPinned] = useState(false);

  const announcementTypes = {
    general: { 
      icon: Info, 
      color: '#3b82f6', 
      bg: '#dbeafe', 
      label: 'General' 
    },
    important: { 
      icon: AlertCircle, 
      color: '#ef4444', 
      bg: '#fee2e2', 
      label: 'Important' 
    },
    success: { 
      icon: CheckCircle, 
      color: '#10b981', 
      bg: '#d1fae5', 
      label: 'Success' 
    },
    holiday: { 
      icon: CalendarIcon, 
      color: '#f59e0b', 
      bg: '#fef3c7', 
      label: 'Holiday' 
    },
    certificate: { 
      icon: Award, 
      color: '#8b5cf6', 
      bg: '#ede9fe', 
      label: 'Certificate' 
    },
    event: { 
      icon: CalendarIcon, 
      color: '#ec4899', 
      bg: '#fce7f3', 
      label: 'Event' 
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAnnouncements(data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim() || !message.trim()) {
      alert('Please fill in all fields');
      return;
    }

    setSending(true);
    try {
      await addDoc(collection(db, 'announcements'), {
        title: title.trim(),
        message: message.trim(),
        type,
        isPinned,
        author: userData.name,
        authorEmail: userData.email,
        createdAt: Timestamp.now(),
        readBy: []
      });

      alert('✅ Announcement posted!');
      setShowForm(false);
      setTitle('');
      setMessage('');
      setType('general');
      setIsPinned(false);
      fetchAnnouncements();
    } catch (error) {
      console.error('Error creating announcement:', error);
      alert('Failed to post announcement');
    } finally {
      setSending(false);
    }
  };

  const canPost = userData?.role === 'admin' || userData?.role === 'hr';

  const filteredAnnouncements = filter === 'all' 
    ? announcements 
    : announcements.filter(a => a.type === filter);

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
        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        padding: '48px 32px',
        borderRadius: '24px',
        marginBottom: '32px',
        color: 'white',
        boxShadow: '0 20px 60px rgba(79, 172, 254, 0.3)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h1 style={{ fontSize: '36px', marginBottom: '8px', fontWeight: '700' }}>
              Announcements
            </h1>
            <p style={{ fontSize: '16px', opacity: 0.95 }}>
              Stay updated with company news and updates
            </p>
          </div>
          {canPost && (
            <button
              onClick={() => setShowForm(!showForm)}
              style={{
                padding: '14px 28px',
                background: 'white',
                color: '#4facfe',
                border: 'none',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
              }}
            >
              <Plus size={18} />
              New Announcement
            </button>
          )}
        </div>
      </div>

      {/* Create Announcement Form */}
      {showForm && canPost && (
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
              Create Announcement
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

          <form onSubmit={handleSubmit}>
            {/* Title */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter announcement title..."
                required
                style={{
                  width: '100%',
                  padding: '14px',
                  border: '2px solid #f0f0f0',
                  borderRadius: '12px',
                  fontSize: '15px',
                  transition: 'border 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#4facfe'}
                onBlur={(e) => e.target.style.borderColor = '#f0f0f0'}
              />
            </div>

            {/* Type Selection */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '12px', fontSize: '14px', fontWeight: '600' }}>
                Type
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                {Object.entries(announcementTypes).map(([key, config]) => {
                  const Icon = config.icon;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setType(key)}
                      style={{
                        padding: '14px',
                        background: type === key ? config.bg : '#f5f5f5',
                        border: `2px solid ${type === key ? config.color : '#e0e0e0'}`,
                        borderRadius: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: type === key ? config.color : '#666'
                      }}
                    >
                      <Icon size={18} />
                      {config.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Message */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your announcement message..."
                required
                rows="6"
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
                onFocus={(e) => e.target.style.borderColor = '#4facfe'}
                onBlur={(e) => e.target.style.borderColor = '#f0f0f0'}
              />
            </div>

            {/* Pin Option */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <Pin size={16} />
                Pin this announcement to the top
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={sending}
              style={{
                width: '100%',
                padding: '14px',
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                border: 'none',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: sending ? 'not-allowed' : 'pointer',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                opacity: sending ? 0.7 : 1
              }}
            >
              <Bell size={18} />
              {sending ? 'Posting...' : 'Post Announcement'}
            </button>
          </form>
        </div>
      )}

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        {Object.entries(announcementTypes).map(([key, config]) => {
          const count = announcements.filter(a => a.type === key).length;
          const Icon = config.icon;
          return (
            <div 
              key={key}
              style={{
                background: 'white',
                padding: '20px',
                borderRadius: '16px',
                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                border: filter === key ? `2px solid ${config.color}` : '2px solid transparent'
              }}
              onClick={() => setFilter(filter === key ? 'all' : key)}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  background: config.bg,
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Icon size={20} color={config.color} />
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '4px' }}>
                    {count}
                  </div>
                  <div style={{ fontSize: '13px', color: '#666', fontWeight: '500' }}>
                    {config.label}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Announcements Feed */}
      {filteredAnnouncements.length === 0 ? (
        <div style={{
          background: 'white',
          padding: '80px 40px',
          borderRadius: '24px',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)'
        }}>
          <Bell size={64} color="#ddd" style={{ marginBottom: '20px' }} />
          <h3 style={{ fontSize: '22px', marginBottom: '12px', color: '#111' }}>
            No Announcements
          </h3>
          <p style={{ color: '#666', fontSize: '16px' }}>
            {filter === 'all' ? 'Check back later for updates' : `No ${announcementTypes[filter]?.label.toLowerCase()} announcements`}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredAnnouncements.map(announcement => {
            const config = announcementTypes[announcement.type];
            const Icon = config.icon;
            
            return (
              <div 
                key={announcement.id}
                style={{
                  background: 'white',
                  padding: '28px',
                  borderRadius: '20px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
                  border: '1px solid rgba(0, 0, 0, 0.04)',
                  position: 'relative',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateX(4px)';
                  e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.12)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateX(0)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.06)';
                }}
              >
                {announcement.isPinned && (
                  <div style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    width: '32px',
                    height: '32px',
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Pin size={16} color="white" />
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'start', gap: '16px', marginBottom: '16px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    background: config.bg,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Icon size={24} color={config.color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>
                        {announcement.title}
                      </h3>
                      <span style={{
                        padding: '4px 12px',
                        background: config.bg,
                        color: config.color,
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {config.label}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px', color: '#999' }}>
                      <span style={{ fontWeight: '600' }}>{announcement.author}</span>
                      <span>•</span>
                      <span>{announcement.createdAt?.toDate().toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <p style={{
                  fontSize: '15px',
                  lineHeight: '1.7',
                  color: '#444',
                  margin: '0 0 20px 64px',
                  padding: '20px',
                  background: '#fafafa',
                  borderRadius: '12px',
                  borderLeft: `4px solid ${config.color}`
                }}>
                  {announcement.message}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Announcements;