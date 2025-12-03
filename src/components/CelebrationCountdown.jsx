import { useState, useEffect } from 'react';
import { Cake, Gift, Calendar, Bell } from 'lucide-react';

function CelebrationCountdown({ name = "John Doe", type = "birthday", date, department = "Engineering", onRemind }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    // If no date provided, use a mock date (3 days from now)
    const targetDate = date ? new Date(date) : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = targetDate - now;
      
      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        
        setTimeLeft({ days, hours, minutes, seconds });
      }
    };
    
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    
    return () => clearInterval(timer);
  }, [date]);

  const isTypeColor = type === 'birthday' ? '#ec4899' : '#8b5cf6';
  const Icon = type === 'birthday' ? Cake : Gift;
  const label = type === 'birthday' ? 'Birthday' : 'Work Anniversary';
  
  const isToday = timeLeft.days === 0 && timeLeft.hours < 24;
  const isThisWeek = timeLeft.days <= 7;

  return (
    <div style={{
      background: isToday ? `linear-gradient(135deg, ${isTypeColor}15, ${isTypeColor}08)` : 'white',
      padding: '20px',
      borderRadius: '16px',
      border: `2px solid ${isToday ? isTypeColor : '#f0f0f0'}`,
      boxShadow: isToday ? `0 4px 16px ${isTypeColor}30` : '0 2px 12px rgba(0,0,0,0.04)',
      transition: 'all 0.3s',
      animation: isToday ? 'pulse 2s infinite' : 'none'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          background: `${isTypeColor}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Icon size={22} color={isTypeColor} />
        </div>
        <div style={{ flex: 1 }}>
          <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px' }}>
            {name}
          </h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontSize: '12px',
              fontWeight: '600',
              color: isTypeColor,
              padding: '3px 8px',
              background: `${isTypeColor}15`,
              borderRadius: '6px'
            }}>
              {label}
            </span>
            {department && (
              <span style={{ fontSize: '12px', color: '#999' }}>
                {department}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Countdown Display */}
      <div style={{
        padding: '16px',
        background: isToday ? 'white' : '#fafafa',
        borderRadius: '12px',
        marginBottom: '12px'
      }}>
        {timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '20px',
            background: `linear-gradient(135deg, ${isTypeColor}, ${isTypeColor}dd)`,
            borderRadius: '10px',
            color: 'white'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎉</div>
            <div style={{ fontSize: '18px', fontWeight: '700' }}>
              It's Today!
            </div>
          </div>
        ) : (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '12px',
              marginBottom: '10px'
            }}>
              {[
                { value: timeLeft.days, label: 'Days' },
                { value: timeLeft.hours, label: 'Hours' },
                { value: timeLeft.minutes, label: 'Mins' },
                { value: timeLeft.seconds, label: 'Secs' }
              ].map((item, index) => (
                <div key={index} style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: '24px',
                    fontWeight: '800',
                    color: isTypeColor,
                    marginBottom: '4px',
                    fontFamily: 'monospace'
                  }}>
                    {String(item.value).padStart(2, '0')}
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: '#999',
                    fontWeight: '600',
                    textTransform: 'uppercase'
                  }}>
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Date Display */}
            <div style={{
              textAlign: 'center',
              fontSize: '13px',
              color: '#666',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}>
              <Calendar size={14} />
              Coming Soon!
            </div>
          </>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {isThisWeek && (
          <button
            onClick={() => onRemind && onRemind()}
            style={{
              flex: 1,
              padding: '10px',
              background: `${isTypeColor}15`,
              border: 'none',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: '600',
              color: isTypeColor,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.target.style.background = `${isTypeColor}25`}
            onMouseOut={(e) => e.target.style.background = `${isTypeColor}15`}
          >
            <Bell size={14} />
            Remind Me
          </button>
        )}
        
        <button
          style={{
            flex: 1,
            padding: '10px',
            background: `linear-gradient(135deg, ${isTypeColor}, ${isTypeColor}dd)`,
            border: 'none',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: '600',
            color: 'white',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'}
          onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
        >
          {isToday ? 'Send Wishes Now' : 'View Details'}
        </button>
      </div>

      {/* Status Badge */}
      {isToday && (
        <div style={{
          marginTop: '12px',
          padding: '8px',
          background: `linear-gradient(135deg, ${isTypeColor}15, ${isTypeColor}08)`,
          borderRadius: '8px',
          textAlign: 'center',
          fontSize: '12px',
          fontWeight: '600',
          color: isTypeColor
        }}>
          🎊 Happening Today - Don't Miss It!
        </div>
      )}
    </div>
  );
}

export default CelebrationCountdown;