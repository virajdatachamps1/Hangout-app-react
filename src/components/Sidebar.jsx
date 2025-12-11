import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  Cake,
  FileText,
  Award,
  Clock,
  Bell,
  LogOut,
  User,
  GraduationCap,
  MessageSquare,
  Upload
} from 'lucide-react';
import '../styles/sidebar.css';

function Sidebar() {
  const { currentUser, displayName, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
    { path: '/timesheets', icon: Clock, label: 'Timesheets' },
    { path: '/training', icon: Calendar, label: 'Training' },
    { path: '/celebrations', icon: Cake, label: 'Celebrations' },
    { path: '/sops', icon: FileText, label: 'SOPs & Policies' },
    { path: '/kudos', icon: Award, label: 'Kudos' },
    { path: '/learning', icon: GraduationCap, label: 'Learning Hub' },
    { path: '/announcements', icon: Bell, label: 'Announcements' },
    { path: '/policy-chat', icon: MessageSquare, label: 'Policy Assistant' }
  ];

  // Get initials for avatar
  const getInitials = () => {
    if (displayName) {
      return displayName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return currentUser?.email?.charAt(0).toUpperCase() || 'U';
  };

  return (
    <div className="sidebar">
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <h2 className="sidebar-title">DataChamps</h2>
        <p className="sidebar-subtitle">Hangout</p>
      </div>

      {/* User Info */}
      <div className="user-info">
        <div className="user-avatar">
          {getInitials()}
        </div>
        <div className="user-details">
          <div className="user-name">
            {displayName || currentUser?.email?.split('@')[0] || 'User'}
          </div>
          <div className="user-email">
            {currentUser?.email}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => 
              `nav-link ${isActive ? 'nav-link-active' : ''}`
            }
            data-tooltip={item.label}
          >
            <span className="nav-link-icon">
              <item.icon size={20} />
            </span>
            <span className="nav-link-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout Button */}
      <button onClick={handleLogout} className="logout-btn">
        <LogOut size={20} />
        <span>Logout</span>
      </button>

      {/* Footer (Optional) */}
      <div className="sidebar-footer">
        <div className="sidebar-version">v1.0.0</div>
      </div>
    </div>
  );
}

export default Sidebar;