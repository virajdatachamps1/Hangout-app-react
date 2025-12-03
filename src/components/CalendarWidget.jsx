import { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  RefreshCw,
  LogIn,
  Clock,
  MapPin,
  Users,
  Video,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { useCalendar } from '../contexts/CalendarContext';
import { suggestCalendarEvents } from '../utils/aiService';

function CalendarWidget() {
  const {
    isAuthorized,
    isLoading,
    events,
    upcomingEvents,
    signIn,
    loadEvents,
    createEvent
  } = useCalendar();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Load AI suggestions
  useEffect(() => {
    if (isAuthorized) {
      loadAISuggestions();
    }
  }, [isAuthorized]);

  const loadAISuggestions = async () => {
    setLoadingSuggestions(true);
    
    try {
      // TODO: Fetch real context from Firebase
      const context = {
        upcomingBirthdays: ['Sarah (Nov 20)', 'John (Nov 25)'],
        trainingSessions: ['React Advanced - Nov 22'],
        teamEvents: ['Q4 Planning - Nov 28']
      };
      
      const suggestions = await suggestCalendarEvents(context);
      setAiSuggestions(suggestions);
    } catch (error) {
      console.error('Error loading AI suggestions:', error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleSignIn = async () => {
    try {
      await signIn();
    } catch (error) {
      console.error('Failed to sign in:', error);
    }
  };

  const formatEventTime = (event) => {
    const start = new Date(event.start.dateTime || event.start.date);
    const end = new Date(event.end.dateTime || event.end.date);
    
    const options = {
      month: 'short',
      day: 'numeric',
      hour: event.start.dateTime ? '2-digit' : undefined,
      minute: event.start.dateTime ? '2-digit' : undefined
    };
    
    return start.toLocaleDateString('en-US', options);
  };

  const getEventColor = (event) => {
    const title = event.summary.toLowerCase();
    
    if (title.includes('birthday') || title.includes('🎂')) return '#ec4899';
    if (title.includes('training') || title.includes('📚')) return '#3b82f6';
    if (title.includes('meeting') || title.includes('1-on-1')) return '#8b5cf6';
    if (title.includes('celebration')) return '#f59e0b';
    
    return '#667eea';
  };

  // Not authorized view
  if (!isAuthorized) {
    return (
      <div style={{
        background: 'white',
        padding: '32px',
        borderRadius: '20px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
        border: '1px solid rgba(0, 0, 0, 0.04)',
        textAlign: 'center'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          margin: '0 auto 20px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <CalendarIcon size={40} color="white" />
        </div>
        
        <h3 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '12px' }}>
          Connect Your Calendar
        </h3>
        
        <p style={{
          fontSize: '15px',
          color: '#666',
          lineHeight: '1.6',
          marginBottom: '24px',
          maxWidth: '400px',
          margin: '0 auto 24px'
        }}>
          Sync with Google Calendar to see your upcoming events, create reminders for birthdays and training sessions, and never miss important moments.
        </p>
        
        <button
          onClick={handleSignIn}
          disabled={isLoading}
          style={{
            padding: '14px 32px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            borderRadius: '12px',
            fontSize: '15px',
            fontWeight: '600',
            color: 'white',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
            opacity: isLoading ? 0.6 : 1
          }}
        >
          <LogIn size={20} />
          {isLoading ? 'Connecting...' : 'Connect Google Calendar'}
        </button>
        
        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: '#f0f0ff',
          borderRadius: '12px',
          fontSize: '13px',
          color: '#666'
        }}>
          🔒 Secure OAuth authentication via Google
        </div>
      </div>
    );
  }

  // Authorized view
  return (
    <div style={{
      background: 'white',
      padding: '32px',
      borderRadius: '20px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
      border: '1px solid rgba(0, 0, 0, 0.04)'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '28px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CalendarIcon size={24} color="white" />
          </div>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>
              Your Calendar
            </h3>
            <p style={{ fontSize: '13px', color: '#999' }}>
              {upcomingEvents.length} events this week
            </p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={loadEvents}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              border: '2px solid #f0f0f0',
              background: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Refresh events"
          >
            <RefreshCw size={18} color="#666" />
          </button>
          
          <button
            onClick={() => setShowCreateForm(true)}
            style={{
              padding: '10px 20px',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              border: 'none',
              borderRadius: '10px',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            <Plus size={18} />
            New Event
          </button>
        </div>
      </div>

      {/* AI Suggestions */}
      {aiSuggestions.length > 0 && (
        <div style={{
          padding: '20px',
          background: 'linear-gradient(135deg, #f093fb15 0%, #f5576c15 100%)',
          borderRadius: '16px',
          marginBottom: '24px',
          border: '2px solid rgba(240, 147, 251, 0.2)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '16px'
          }}>
            <Sparkles size={20} color="#f093fb" />
            <span style={{ fontSize: '15px', fontWeight: '700' }}>
              AI Suggested Events
            </span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {aiSuggestions.slice(0, 3).map((suggestion, index) => (
              <div
                key={index}
                style={{
                  padding: '14px 16px',
                  background: 'white',
                  borderRadius: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
                    {suggestion.title}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {suggestion.description} • {suggestion.duration}
                  </div>
                </div>
                <button
                  style={{
                    padding: '6px 14px',
                    background: '#f093fb',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Events */}
      <div>
        <h4 style={{
          fontSize: '15px',
          fontWeight: '700',
          marginBottom: '16px',
          color: '#333'
        }}>
          Upcoming Events
        </h4>
        
        {upcomingEvents.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: '#999'
          }}>
            <CalendarIcon size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
            <p style={{ fontSize: '14px' }}>No upcoming events</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {upcomingEvents.slice(0, 5).map(event => (
              <div
                key={event.id}
                style={{
                  padding: '16px',
                  background: '#fafafa',
                  borderRadius: '14px',
                  borderLeft: `4px solid ${getEventColor(event)}`,
                  display: 'flex',
                  gap: '16px',
                  transition: 'all 0.2s',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#f5f5f5';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = '#fafafa';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
                onClick={() => window.open(event.htmlLink, '_blank')}
              >
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '12px',
                  background: `${getEventColor(event)}20`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <div style={{
                    fontSize: '18px',
                    fontWeight: '800',
                    color: getEventColor(event)
                  }}>
                    {new Date(event.start.dateTime || event.start.date).getDate()}
                  </div>
                  <div style={{
                    fontSize: '10px',
                    fontWeight: '600',
                    color: getEventColor(event),
                    textTransform: 'uppercase'
                  }}>
                    {new Date(event.start.dateTime || event.start.date).toLocaleDateString('en-US', { month: 'short' })}
                  </div>
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '15px',
                    fontWeight: '700',
                    marginBottom: '6px',
                    color: '#333'
                  }}>
                    {event.summary}
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '12px',
                    fontSize: '13px',
                    color: '#666'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={14} />
                      {formatEventTime(event)}
                    </div>
                    
                    {event.location && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MapPin size={14} />
                        {event.location.length > 20 
                          ? event.location.substring(0, 20) + '...' 
                          : event.location}
                      </div>
                    )}
                    
                    {event.attendees && event.attendees.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Users size={14} />
                        {event.attendees.length} attendees
                      </div>
                    )}
                    
                    {event.conferenceData && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Video size={14} />
                        Meet
                      </div>
                    )}
                  </div>
                </div>
                
                <ExternalLink size={16} color="#999" style={{ flexShrink: 0, marginTop: '4px' }} />
              </div>
            ))}
          </div>
        )}
        
        {upcomingEvents.length > 5 && (
          <button
            onClick={() => window.open('https://calendar.google.com', '_blank')}
            style={{
              width: '100%',
              padding: '12px',
              marginTop: '16px',
              background: '#f5f5f5',
              border: 'none',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#666',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            View all events in Google Calendar
            <ExternalLink size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

export default CalendarWidget;