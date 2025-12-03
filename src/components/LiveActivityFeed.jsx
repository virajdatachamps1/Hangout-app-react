import { Activity, TrendingUp } from 'lucide-react';

function LiveActivityFeed() {
  // Mock data for demonstration
  const activities = [
    { id: 1, type: 'kudos_given', user: 'Sarah', action: 'gave kudos to Tom', time: '2 min ago', icon: '❤️' },
    { id: 2, type: 'birthday_wish', user: 'Mike', action: 'wished Alex Happy Birthday', time: '15 min ago', icon: '🎂' },
    { id: 3, type: 'task_complete', user: 'Emma', action: 'completed project review', time: '1 hour ago', icon: '✅' },
    { id: 4, type: 'timesheet_filled', user: 'John', action: 'submitted timesheet', time: '2 hours ago', icon: '⏰' },
  ];

  return (
    <div style={{
      background: 'white',
      borderRadius: '20px',
      padding: '24px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
      border: '1px solid rgba(0, 0, 0, 0.04)',
      height: 'fit-content',
      maxHeight: '600px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px', 
        marginBottom: '20px',
        paddingBottom: '16px',
        borderBottom: '2px solid #f0f0f0'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}>
          <Activity size={20} color="white" />
          {/* Live indicator */}
          <div style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            width: '12px',
            height: '12px',
            background: '#10b981',
            borderRadius: '50%',
            border: '2px solid white',
            animation: 'pulse 2s infinite'
          }} />
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '2px' }}>
            Live Feed
          </h3>
          <p style={{ fontSize: '12px', color: '#999' }}>
            🔴 Real-time updates
          </p>
        </div>
      </div>

      {/* Activity List */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        paddingRight: '4px'
      }}>
        {activities.map((activity, index) => (
          <div
            key={activity.id}
            style={{
              padding: '14px 16px',
              background: index === 0 ? 'linear-gradient(135deg, #f093fb10, #f5576c10)' : '#fafafa',
              borderRadius: '12px',
              borderLeft: `3px solid ${index === 0 ? '#f093fb' : '#e0e0e0'}`,
              animation: index === 0 ? 'slideInRight 0.5s ease-out' : 'none',
              transition: 'all 0.3s'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
              <div style={{
                fontSize: '20px',
                flexShrink: 0,
                marginTop: '2px'
              }}>
                {activity.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  lineHeight: '1.5',
                  marginBottom: '4px',
                  color: '#333'
                }}>
                  <strong>{activity.user}</strong> {activity.action}
                </p>
                <span style={{
                  fontSize: '12px',
                  color: '#999'
                }}>
                  {activity.time}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Stats */}
      <div style={{
        marginTop: '16px',
        paddingTop: '16px',
        borderTop: '2px solid #f0f0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px'
      }}>
        <TrendingUp size={16} color="#10b981" />
        <span style={{ fontSize: '13px', color: '#666', fontWeight: '600' }}>
          {activities.length} activities today
        </span>
      </div>
    </div>
  );
}

export default LiveActivityFeed;