import { Bell, Pin, AlertCircle, Info, CheckCircle, Clock, Plus, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import firestoreService from '../utils/firestoreService';

function Announcements() {
  const { currentUser, isAdmin } = useAuth();
  const [filter, setFilter] = useState('all');
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Form state
  const [newAnnouncement, setNewAnnouncement] = useState({
    type: 'info',
    title: '',
    message: '',
    isPinned: false
  });

  const typeConfig = {
    important: { icon: AlertCircle, color: '#ef4444', bg: '#fee2e2', label: 'Important' },
    update: { icon: Info, color: '#3b82f6', bg: '#dbeafe', label: 'Update' },
    success: { icon: CheckCircle, color: '#10b981', bg: '#d1fae5', label: 'Success' },
    info: { icon: Clock, color: '#f59e0b', bg: '#fef3c7', label: 'Info' }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      const data = await firestoreService.announcements.getAll();
      setAnnouncements(data);
    } catch (error) {
      console.error('Error loading announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = async () => {
    if (!newAnnouncement.title || !newAnnouncement.message) {
      alert('Please fill in all fields');
      return;
    }

    try {
      await firestoreService.announcements.create({
        ...newAnnouncement,
        author: currentUser.displayName || currentUser.email,
        authorEmail: currentUser.email,
        totalReads: 0
      });

      // Reset form and close modal
      setNewAnnouncement({
        type: 'info',
        title: '',
        message: '',
        isPinned: false
      });
      setShowAddModal(false);
      
      // Reload announcements
      loadAnnouncements();
    } catch (error) {
      console.error('Error creating announcement:', error);
      alert('Failed to create announcement');
    }
  };

  const handleMarkAsRead = async (announcementId) => {
    try {
      await firestoreService.announcements.markAsRead(announcementId, currentUser.uid);
      loadAnnouncements();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleTogglePin = async (announcementId) => {
    try {
      await firestoreService.announcements.togglePin(announcementId);
      loadAnnouncements();
    } catch (error) {
      console.error('Error toggling pin:', error);
    }
  };

  const filteredAnnouncements = filter === 'all' 
    ? announcements 
    : announcements.filter(a => a.type === filter);

  if (loading) {
    return (
      <div className="loading">
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
          
          {isAdmin && (
            <button 
              onClick={() => setShowAddModal(true)}
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

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        {Object.entries(typeConfig).map(([type, config]) => {
          const count = announcements.filter(a => a.type === type).length;
          return (
            <div 
              key={type}
              style={{
                background: 'white',
                padding: '20px',
                borderRadius: '16px',
                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                border: filter === type ? `2px solid ${config.color}` : '2px solid transparent'
              }}
              onClick={() => setFilter(filter === type ? 'all' : type)}
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
                  <config.icon size={20} color={config.color} />
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredAnnouncements.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📢</div>
            <p>No announcements found</p>
          </div>
        ) : (
          filteredAnnouncements.map(announcement => {
            const config = typeConfig[announcement.type];
            const StatusIcon = config.icon;
            const hasRead = announcement.readBy?.includes(currentUser.uid);
            
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
                {/* Pin indicator */}
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
                    justifyContent: 'center',
                    cursor: isAdmin ? 'pointer' : 'default'
                  }}
                  onClick={() => isAdmin && handleTogglePin(announcement.id)}
                  title={isAdmin ? "Click to unpin" : "Pinned"}
                  >
                    <Pin size={16} color="white" />
                  </div>
                )}

                {/* Header */}
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
                    <StatusIcon size={24} color={config.color} />
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
                      <span>{firestoreService.timeAgo(announcement.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Message */}
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

                {/* Footer */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginLeft: '64px',
                  paddingTop: '16px',
                  borderTop: '1px solid #f0f0f0'
                }}>
                  <div style={{ fontSize: '13px', color: '#666', fontWeight: '500' }}>
                    {announcement.readBy?.length || 0} people read
                  </div>
                  {!hasRead && (
                    <button 
                      onClick={() => handleMarkAsRead(announcement.id)}
                      style={{
                        padding: '8px 16px',
                        background: config.bg,
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: '600',
                        color: config.color,
                        cursor: 'pointer'
                      }}
                    >
                      Mark as Read
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Announcement Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}
        onClick={() => setShowAddModal(false)}
        >
          <div 
            style={{
              background: 'white',
              borderRadius: '24px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              padding: '28px 32px',
              borderBottom: '1px solid #f0f0f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{ fontSize: '24px', fontWeight: '700' }}>
                New Announcement
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  border: 'none',
                  background: '#f5f5f5',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '32px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Type Selection */}
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                    Type
                  </label>
                  <select 
                    value={newAnnouncement.type}
                    onChange={(e) => setNewAnnouncement({...newAnnouncement, type: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '14px',
                      border: '2px solid #f0f0f0',
                      borderRadius: '12px',
                      fontSize: '15px',
                      cursor: 'pointer'
                    }}
                  >
                    {Object.entries(typeConfig).map(([key, config]) => (
                      <option key={key} value={key}>{config.label}</option>
                    ))}
                  </select>
                </div>

                {/* Title */}
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                    Title
                  </label>
                  <input
                    type="text"
                    placeholder="Enter announcement title..."
                    value={newAnnouncement.title}
                    onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '14px',
                      border: '2px solid #f0f0f0',
                      borderRadius: '12px',
                      fontSize: '15px'
                    }}
                  />
                </div>

                {/* Message */}
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                    Message
                  </label>
                  <textarea
                    placeholder="Enter announcement message..."
                    value={newAnnouncement.message}
                    onChange={(e) => setNewAnnouncement({...newAnnouncement, message: e.target.value})}
                    rows="6"
                    style={{
                      width: '100%',
                      padding: '14px',
                      border: '2px solid #f0f0f0',
                      borderRadius: '12px',
                      fontSize: '15px',
                      fontFamily: 'inherit',
                      resize: 'vertical'
                    }}
                  />
                </div>

                {/* Pin Option */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input
                    type="checkbox"
                    id="pinCheckbox"
                    checked={newAnnouncement.isPinned}
                    onChange={(e) => setNewAnnouncement({...newAnnouncement, isPinned: e.target.checked})}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                  <label htmlFor="pinCheckbox" style={{ fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                    Pin this announcement
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                <button
                  onClick={() => setShowAddModal(false)}
                  style={{
                    flex: 1,
                    padding: '14px',
                    background: '#f5f5f5',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    color: '#666'
                  }}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreateAnnouncement}
                  style={{
                    flex: 1,
                    padding: '14px',
                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <Plus size={18} />
                  Create Announcement
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Announcements;