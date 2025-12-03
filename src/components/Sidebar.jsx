import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import NotificationBell from './NotificationBell';
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
  GraduationCap  // ADD THIS
} from 'lucide-react';

function Sidebar() {
  const { currentUser, logout } = useAuth();
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
];

  return (
    <div style={styles.sidebar}>
      <div style={styles.header}>
        <h2 style={styles.title}>DataChamps</h2>
        <p style={styles.subtitle}>Hangout</p>
      </div>

      <div style={styles.userInfo}>
        <div style={styles.avatar}>
          <User size={20} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={styles.userName}>{currentUser?.email?.split('@')[0]}</div>
          <div style={styles.userEmail}>{currentUser?.email}</div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <NotificationBell />
          <button
            onClick={() => {
              document.body.classList.toggle('dark-mode');
            }}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              border: 'none',
              background: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s',
            }}
            title="Toggle Dark Mode"
          >
            🌙
          </button>
        </div>
      </div>

      <nav style={styles.nav}>
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            style={({ isActive }) => ({
              ...styles.navLink,
              ...(isActive ? styles.navLinkActive : {})
            })}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <button onClick={handleLogout} style={styles.logoutBtn}>
        <LogOut size={20} />
        <span>Logout</span>
      </button>
    </div>
  );
}

const styles = {
  sidebar: {
    width: '250px',
    height: '100vh',
    background: 'linear-gradient(180deg, #4f46e5 0%, #6366f1 100%)',
    color: 'white',
    position: 'fixed',
    left: 0,
    top: 0,
    display: 'flex',
    flexDirection: 'column',
    padding: '20px',
    boxShadow: '4px 0 12px rgba(0, 0, 0, 0.1)',
  },
  header: {
    marginBottom: '30px',
    paddingBottom: '20px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    margin: 0,
  },
  subtitle: {
    fontSize: '14px',
    opacity: 0.9,
    margin: '4px 0 0 0',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    marginBottom: '24px',
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontSize: '14px',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  userEmail: {
    fontSize: '12px',
    opacity: 0.8,
    marginTop: '2px',
  },
  nav: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '8px',
    color: 'white',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s',
    opacity: 0.8,
  },
  navLinkActive: {
    background: 'rgba(255, 255, 255, 0.2)',
    opacity: 1,
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    background: 'rgba(255, 255, 255, 0.1)',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    marginTop: 'auto',
    transition: 'all 0.2s',
  },
};

export default Sidebar;