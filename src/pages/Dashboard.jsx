import { CheckSquare, Users, Calendar, Award } from 'lucide-react';

function Dashboard() {
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
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Calendar size={20} />
              Upcoming Birthdays
            </h3>
            <span className="card-action">View All</span>
          </div>
          {upcomingBirthdays.map((birthday, index) => (
            <div key={index} className="list-item">
              <div className="avatar">{birthday.name.charAt(0)}</div>
              <div className="list-content">
                <div className="list-title">{birthday.name}</div>
                <div className="list-subtitle">{birthday.date}</div>
              </div>
              <span className="badge success">🎂</span>
            </div>
          ))}
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