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
  Image,
  Upload,
  Database
} from 'lucide-react';

function Sidebar() {
  const { currentUser, logout, isAdmin, userRole } = useAuth();
  const navigate = useNavigate();
  const isHR = userRole === 'hr';

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  /** -------------------------
   *  MERGED ROLE-BASED MENU
   *  ------------------------- */
  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard', roles: ['employee', 'hr', 'admin'] },
    { path: '/photos', icon: Image, label: 'Photos', roles: ['employee', 'hr', 'admin'] },
    { path: '/file-upload', icon: Upload, label: 'Upload Files', roles: ['employee', 'hr', 'admin'] },
    { path: '/tasks', icon: CheckSquare, label: 'Tasks', roles: ['employee', 'hr', 'admin'] },
    { path: '/timesheets', icon: Clock, label: 'Timesheets', roles: ['employee', 'hr', 'admin'] },
    { path: '/training', icon: Calendar, label: 'Training', roles: ['employee', 'hr', 'admin'] },
    { path: '/celebrations', icon: Cake, label: 'Celebrations', roles: ['employee', 'hr', 'admin'] },
    { path: '/sops', icon: FileText, label: 'SOPs & Policies', roles: ['employee', 'hr', 'admin'] },
    { path: '/kudos', icon: Award, label: 'Kudos', roles: ['employee', 'hr', 'admin'] },
    { path: '/learning', icon: GraduationCap, label: 'Learning Hub', roles: ['employee', 'hr', 'admin'] },
    { path: '/announcements', icon: Bell, label: 'Announcements', roles: ['employee', 'hr', 'admin'] },
    { path: '/timesheet-link', icon: Clock, label: 'My Timesheet', roles: ['employee', 'hr', 'admin'] },
    { path: '/profile', icon: User, label: 'Profile', roles: ['employee', 'hr', 'admin'] }
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(userRole));

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
        <div>
          <div style={styles.userName}>{currentUser?.email?.split('@')[0]}</div>
          <div style={styles.userEmail}>{currentUser?.email}</div>
        </div>
      </div>

      <nav style={styles.nav}>
        {filteredMenu.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              style={({ isActive }) => ({
                ...styles.navLink,
                ...(isActive ? styles.navLinkActive : {})
              })}
              onMouseEnter={(e) => {
                if (!e.currentTarget.classList.contains('active')) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (!e.currentTarget.classList.contains('active')) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}

        {(isAdmin || isHR) && (
          <NavLink
            to="/csv-import"
            style={({ isActive }) => ({
              ...styles.navLink,
              ...(isActive ? styles.navLinkActive : {})
            })}
          >
            <Upload size={20} />
            <span>CSV Import</span>
          </NavLink>
        )}
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
    opacity: 0.85,
    borderLeft: '4px solid transparent'
  },
  navLinkActive: {
    background: 'rgba(255, 255, 255, 0.2)',
    opacity: 1,
    borderLeft: '4px solid white'
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
