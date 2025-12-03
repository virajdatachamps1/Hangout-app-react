import { CheckSquare, Users, Calendar, Award } from 'lucide-react';
import { useState, useEffect } from 'react';
import LiveActivityFeed from '../components/LiveActivityFeed';
import CelebrationCountdown from '../components/CelebrationCountdown';
function Dashboard() {
  const [loading] = useState(false);
  
  // Mock data for demonstration
  const upcomingCelebrations = {
    birthdays: [
      { name: 'Sarah Johnson', department: 'Marketing', upcomingDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) },
      { name: 'Mike Chen', department: 'Engineering', upcomingDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) }
    ],
    anniversaries: [
      { name: 'Emma Wilson', department: 'Design', upcomingDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) }
    ]
  };
  const stats = [
    { icon: CheckSquare, label: 'Pending Tasks', value: '12', color: 'blue' },
    { icon: Users, label: 'Team Members', value: '24', color: 'green' },
    { icon: Calendar, label: 'Upcoming Events', value: '5', color: 'purple' },
    { icon: Award, label: 'Kudos This Month', value: '18', color: 'orange' },
  ];

  const upcomingBirthdays = [
    { name: 'John Doe', date: 'Nov 15' },
    { name: 'Jane Smith', date: 'Nov 18' },
    { name: 'Mike Johnson', date: 'Nov 22' },
  ];

  const recentKudos = [
    { from: 'Sarah', to: 'Tom', message: 'Great job on the presentation!' },
    { from: 'Alex', to: 'Emma', message: 'Thanks for your help yesterday' },
  ];

  const recentActivity = [
    { user: 'John', action: 'completed task "Update reports"', time: '2 hours ago' },
    { user: 'Sarah', action: 'added new SOP document', time: '3 hours ago' },
    { user: 'Mike', action: 'submitted timesheet', time: '5 hours ago' },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome Back!</h1>
        <p>Here's what's happening in your team today</p>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-header">
              <div className={`stat-icon ${stat.color}`}>
                <stat.icon size={24} />
              </div>
            </div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        {/* Live Activity Feed */}
        <div style={{ gridColumn: 'span 1' }}>
          <LiveActivityFeed />
        </div>

        {/* Upcoming Celebrations with Countdowns */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Calendar size={20} />
              This Week's Celebrations
            </h3>
            <span className="card-action">View All</span>
          </div>
          
          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <div className="spinner-fancy" style={{ margin: '0 auto' }} />
            </div>
          ) : (
            <>
              {upcomingCelebrations.birthdays.slice(0, 2).map((birthday, index) => (
                <div key={index} style={{ marginBottom: '16px' }}>
                  <CelebrationCountdown
                    name={birthday.name}
                    type="birthday"
                    date={birthday.upcomingDate}
                    department={birthday.department}
                    onRemind={() => console.log('Remind me:', birthday.name)}
                  />
                </div>
              ))}
              
              {upcomingCelebrations.anniversaries.slice(0, 1).map((anniversary, index) => (
                <div key={`anniv-${index}`} style={{ marginBottom: '16px' }}>
                  <CelebrationCountdown
                    name={anniversary.name}
                    type="anniversary"
                    date={anniversary.upcomingDate}
                    department={anniversary.department}
                    onRemind={() => console.log('Remind me:', anniversary.name)}
                  />
                </div>
              ))}
              
              {upcomingCelebrations.birthdays.length === 0 && upcomingCelebrations.anniversaries.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }}>
                  <Calendar size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
                  <p>No upcoming celebrations this week</p>
                </div>
              )}
            </>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Award size={20} />
              Recent Kudos
            </h3>
            <span className="card-action">View All</span>
          </div>
          {recentKudos.map((kudo, index) => (
            <div key={index} className="list-item">
              <div className="avatar">{kudo.from.charAt(0)}</div>
              <div className="list-content">
                <div className="list-title">{kudo.from} → {kudo.to}</div>
                <div className="list-subtitle">{kudo.message}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Users size={20} />
              Recent Activity
            </h3>
          </div>
          {recentActivity.map((activity, index) => (
            <div key={index} className="list-item">
              <div className="avatar">{activity.user.charAt(0)}</div>
              <div className="list-content">
                <div className="list-title">{activity.user}</div>
                <div className="list-subtitle">
                  {activity.action} • {activity.time}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;