import { useState, useEffect } from 'react';
import { CheckSquare, Users, Calendar, Award } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import firestoreService from '../utils/firestoreService';

function Dashboard() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    employees: [],
    upcomingBirthdays: [],
    recentKudos: [],
    stats: {
      teamMembers: 0,
      upcomingEvents: 0,
      kudosThisMonth: 0
    }
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load all data in parallel
      const [employees, birthdays, kudos] = await Promise.all([
        firestoreService.employees.getAll(),
        firestoreService.employees.getUpcomingBirthdays(30),
        firestoreService.kudos.getRecent(5)
      ]);

      // Calculate stats
      const stats = {
        teamMembers: employees.length,
        upcomingEvents: birthdays.length,
        kudosThisMonth: kudos.length // This should filter by current month
      };

      setData({
        employees,
        upcomingBirthdays: birthdays.slice(0, 3), // Top 3
        recentKudos: kudos.slice(0, 2), // Top 2
        stats
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  const stats = [
    { 
      icon: Users, 
      label: 'Team Members', 
      value: data.stats.teamMembers.toString(), 
      color: 'green' 
    },
    { 
      icon: Calendar, 
      label: 'Upcoming Birthdays', 
      value: data.stats.upcomingEvents.toString(), 
      color: 'purple' 
    },
    { 
      icon: Award, 
      label: 'Kudos This Month', 
      value: data.stats.kudosThisMonth.toString(), 
      color: 'orange' 
    },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome Back, {currentUser?.displayName || currentUser?.email?.split('@')[0]}!</h1>
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
        {/* Upcoming Birthdays */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Calendar size={20} />
              Upcoming Birthdays
            </h3>
            <span className="card-action" onClick={() => window.location.href = '/celebrations'}>
              View All
            </span>
          </div>
          {data.upcomingBirthdays.length === 0 ? (
            <div className="empty-state">
              <p style={{ fontSize: '14px', color: '#999', padding: '20px' }}>
                No upcoming birthdays in the next 30 days
              </p>
            </div>
          ) : (
            data.upcomingBirthdays.map((person, index) => (
              <div key={index} className="list-item">
                <div className="avatar">
                  {person.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="list-content">
                  <div className="list-title">{person.name}</div>
                  <div className="list-subtitle">
                    {person.daysUntil === 0 
                      ? 'Today!' 
                      : person.daysUntil === 1 
                      ? 'Tomorrow' 
                      : `In ${person.daysUntil} days`}
                  </div>
                </div>
                <span className="badge success">🎂</span>
              </div>
            ))
          )}
        </div>

        {/* Recent Kudos */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Award size={20} />
              Recent Kudos
            </h3>
            <span className="card-action" onClick={() => window.location.href = '/kudos'}>
              View All
            </span>
          </div>
          {data.recentKudos.length === 0 ? (
            <div className="empty-state">
              <p style={{ fontSize: '14px', color: '#999', padding: '20px' }}>
                No kudos yet. Be the first to recognize someone!
              </p>
            </div>
          ) : (
            data.recentKudos.map((kudo, index) => (
              <div key={index} className="list-item">
                <div className="avatar">
                  {kudo.fromName?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="list-content">
                  <div className="list-title">
                    {kudo.fromName || 'Unknown'} → {kudo.toName || 'Unknown'}
                  </div>
                  <div className="list-subtitle">{kudo.message || ''}</div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <CheckSquare size={20} />
              Quick Actions
            </h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '8px 0' }}>
            <button 
              className="quick-action-btn"
              onClick={() => window.location.href = '/kudos'}
            >
              <Award size={18} />
              Give Kudos
            </button>
            <button 
              className="quick-action-btn"
              onClick={() => window.location.href = '/timesheets'}
            >
              <Calendar size={18} />
              View Timesheet
            </button>
            <button 
              className="quick-action-btn"
              onClick={() => window.location.href = '/sops'}
            >
              <CheckSquare size={18} />
              Browse SOPs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;