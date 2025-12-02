import { Calendar, ExternalLink, Clock, Users, BookOpen, Video, ArrowRight } from 'lucide-react';
import { useState } from 'react';

function Training() {
  // Google Sheets URL - Replace with your actual sheet URL
  const TRAINING_SHEET_URL = 'https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit';

  // Mock upcoming sessions for quick preview
  const upcomingSessions = [
    {
      id: 1,
      title: 'Advanced Excel Formulas',
      instructor: 'Sarah Johnson',
      date: 'Nov 15, 2024',
      time: '10:00 AM - 12:00 PM',
      type: 'Workshop',
      duration: '2 hours',
      enrolled: 12,
      capacity: 20
    },
    {
      id: 2,
      title: 'Customer Service Excellence',
      instructor: 'Michael Chen',
      date: 'Nov 18, 2024',
      time: '2:00 PM - 4:00 PM',
      type: 'Seminar',
      duration: '2 hours',
      enrolled: 8,
      capacity: 15
    },
    {
      id: 3,
      title: 'Data Analytics Workshop',
      instructor: 'Emily Rodriguez',
      date: 'Nov 22, 2024',
      time: '9:00 AM - 5:00 PM',
      type: 'Full-day',
      duration: '8 hours',
      enrolled: 15,
      capacity: 15
    }
  ];

  const getTypeColor = (type) => {
    const colors = {
      'Workshop': '#667eea',
      'Seminar': '#f093fb',
      'Full-day': '#4facfe',
      'Webinar': '#10b981'
    };
    return colors[type] || '#667eea';
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '48px 32px',
        borderRadius: '24px',
        marginBottom: '32px',
        color: 'white',
        boxShadow: '0 20px 60px rgba(102, 126, 234, 0.3)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-30px',
          right: '-30px',
          fontSize: '140px',
          opacity: 0.1
        }}>
          📚
        </div>

        <div style={{ position: 'relative' }}>
          <h1 style={{ fontSize: '36px', marginBottom: '12px', fontWeight: '700' }}>
            Training Calendar
          </h1>
          <p style={{ fontSize: '16px', opacity: 0.95, marginBottom: '28px' }}>
            Access training schedules and development programs
          </p>

          {/* CTA Button */}
          <a
            href={TRAINING_SHEET_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px 32px',
              background: 'white',
              color: '#667eea',
              borderRadius: '14px',
              fontSize: '16px',
              fontWeight: '700',
              textDecoration: 'none',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
              transition: 'all 0.3s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.25)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)';
            }}
          >
            <Calendar size={24} />
            View Full Training Calendar
            <ExternalLink size={20} />
          </a>
        </div>
      </div>

      {/* Quick Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '20px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
          border: '1px solid rgba(0, 0, 0, 0.04)'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: '#667eea15',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <BookOpen size={24} color="#667eea" />
          </div>
          <div style={{ fontSize: '32px', fontWeight: '800', marginBottom: '4px', color: '#667eea' }}>
            {upcomingSessions.length}
          </div>
          <div style={{ fontSize: '14px', color: '#666', fontWeight: '500' }}>
            Upcoming Sessions
          </div>
        </div>

        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '20px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
          border: '1px solid rgba(0, 0, 0, 0.04)'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: '#f093fb15',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <Users size={24} color="#f093fb" />
          </div>
          <div style={{ fontSize: '32px', fontWeight: '800', marginBottom: '4px', color: '#f093fb' }}>
            {upcomingSessions.reduce((sum, s) => sum + s.enrolled, 0)}
          </div>
          <div style={{ fontSize: '14px', color: '#666', fontWeight: '500' }}>
            Total Enrollments
          </div>
        </div>

        <div style={{
          background: 'white',
          padding: '24px',
          borderRadius: '20px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
          border: '1px solid rgba(0, 0, 0, 0.04)'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            background: '#4facfe15',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}>
            <Clock size={24} color="#4facfe" />
          </div>
          <div style={{ fontSize: '32px', fontWeight: '800', marginBottom: '4px', color: '#4facfe' }}>
            {upcomingSessions.reduce((sum, s) => sum + parseInt(s.duration), 0)}
          </div>
          <div style={{ fontSize: '14px', color: '#666', fontWeight: '500' }}>
            Total Hours
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div style={{
        background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
        padding: '24px 28px',
        borderRadius: '16px',
        marginBottom: '32px',
        border: '2px solid #fbbf24',
        display: 'flex',
        alignItems: 'start',
        gap: '16px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          background: '#f59e0b',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <Video size={22} color="white" />
        </div>
        <div>
          <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '6px', color: '#92400e' }}>
            Access Full Training Calendar
          </h4>
          <p style={{ fontSize: '14px', color: '#78350f', lineHeight: '1.6', marginBottom: '12px' }}>
            View the complete training schedule, enroll in sessions, and access training materials in the Google Sheet.
          </p>

          <a
            href={TRAINING_SHEET_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: '#f59e0b',
              fontSize: '14px',
              fontWeight: '700',
              textDecoration: 'none'
            }}
          >
            Open Training Sheet
            <ArrowRight size={16} />
          </a>
        </div>
      </div>

      {/* Next 3 Sessions Preview */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '20px' }}>
          Next 3 Sessions
        </h2>

        <div style={{ display: 'grid', gap: '20px' }}>
          {upcomingSessions.map(session => {
            const typeColor = getTypeColor(session.type);
            const enrollmentPercent = Math.round((session.enrolled / session.capacity) * 100);
            const isFull = session.enrolled >= session.capacity;

            return (
              <div
                key={session.id}
                style={{
                  background: 'white',
                  padding: '28px',
                  borderRadius: '20px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
                  border: '1px solid rgba(0, 0, 0, 0.04)',
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  gap: '24px',
                  alignItems: 'start',
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
                {/* Main Info */}
                <div>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                    <span style={{
                      padding: '6px 14px',
                      background: `${typeColor}15`,
                      color: typeColor,
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '700'
                    }}>
                      {session.type}
                    </span>
                    {isFull && (
                      <span style={{
                        padding: '6px 14px',
                        background: '#fee2e2',
                        color: '#ef4444',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: '700'
                      }}>
                        Full
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '12px' }}>
                    {session.title}
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#666' }}>
                      <Calendar size={18} />
                      <span>{session.date}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#666' }}>
                      <Clock size={18} />
                      <span>{session.time} ({session.duration})</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: '#666' }}>
                      <Users size={18} />
                      <span>{session.instructor}</span>
                    </div>
                  </div>

                  {/* Enrollment Progress */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                      <span style={{ color: '#666', fontWeight: '600' }}>Enrollment</span>
                      <span style={{ fontWeight: '700' }}>
                        {session.enrolled}/{session.capacity} ({enrollmentPercent}%)
                      </span>
                    </div>
                    <div style={{
                      height: '8px',
                      background: '#f0f0f0',
                      borderRadius: '10px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%',
                        width: `${enrollmentPercent}%`,
                        background: isFull ? '#ef4444' : typeColor,
                        borderRadius: '10px',
                        transition: 'width 0.5s'
                      }} />
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '180px' }}>
                  <button
                    disabled={isFull}
                    style={{
                      padding: '14px 24px',
                      background: isFull ? '#f5f5f5' : `linear-gradient(135deg, ${typeColor}, ${typeColor}dd)`,
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '15px',
                      fontWeight: '700',
                      color: isFull ? '#999' : 'white',
                      cursor: isFull ? 'not-allowed' : 'pointer',
                      whiteSpace: 'nowrap',
                      opacity: isFull ? 0.6 : 1
                    }}
                  >
                    {isFull ? 'Session Full' : 'Enroll Now'}
                  </button>
                  <button style={{
                    padding: '14px 24px',
                    background: 'white',
                    border: '2px solid #f0f0f0',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#666',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}>
                    View Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer CTA */}
      <div style={{
        background: 'white',
        padding: '32px',
        borderRadius: '20px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
        border: '1px solid rgba(0, 0, 0, 0.04)',
        textAlign: 'center'
      }}>
        <h3 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '12px' }}>
          Need More Information?
        </h3>
        <p style={{ fontSize: '15px', color: '#666', marginBottom: '24px', maxWidth: '600px', margin: '0 auto 24px' }}>
          Access the complete training calendar with detailed session information, enrollment options, and training materials.
        </p>

        <a
          href={TRAINING_SHEET_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            padding: '16px 32px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            borderRadius: '14px',
            fontSize: '16px',
            fontWeight: '700',
            color: 'white',
            textDecoration: 'none',
            boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3)',
            transition: 'all 0.3s'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <Calendar size={20} />
          Open Full Calendar
          <ExternalLink size={18} />
        </a>
      </div>
    </div>
  );
}

export default Training;
