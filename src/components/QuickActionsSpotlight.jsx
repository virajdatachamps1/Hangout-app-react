import { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Command, 
  CheckSquare, 
  Calendar, 
  Cake, 
  FileText, 
  Award, 
  Clock, 
  Bell,
  GraduationCap,
  Users,
  LayoutDashboard,
  Send,
  Upload,
  Download,
  Settings,
  LogOut,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function QuickActionsSpotlight({ isOpen, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [filteredActions, setFilteredActions] = useState([]);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const { logout, currentUser } = useAuth();

  // Define all available actions
  const allActions = [
    // Navigation
    { 
      id: 'nav-dashboard', 
      title: 'Go to Dashboard', 
      icon: LayoutDashboard, 
      category: 'Navigation',
      action: () => navigate('/'),
      keywords: ['home', 'dashboard', 'main']
    },
    { 
      id: 'nav-tasks', 
      title: 'View Tasks', 
      icon: CheckSquare, 
      category: 'Navigation',
      action: () => navigate('/tasks'),
      keywords: ['tasks', 'todos', 'assignments']
    },
    { 
      id: 'nav-timesheets', 
      title: 'View Timesheets', 
      icon: Clock, 
      category: 'Navigation',
      action: () => navigate('/timesheets'),
      keywords: ['timesheet', 'hours', 'time tracking']
    },
    { 
      id: 'nav-training', 
      title: 'View Training', 
      icon: Calendar, 
      category: 'Navigation',
      action: () => navigate('/training'),
      keywords: ['training', 'courses', 'learning']
    },
    { 
      id: 'nav-celebrations', 
      title: 'View Celebrations', 
      icon: Cake, 
      category: 'Navigation',
      action: () => navigate('/celebrations'),
      keywords: ['birthdays', 'celebrations', 'anniversaries']
    },
    { 
      id: 'nav-sops', 
      title: 'View SOPs & Policies', 
      icon: FileText, 
      category: 'Navigation',
      action: () => navigate('/sops'),
      keywords: ['sops', 'policies', 'documents', 'procedures']
    },
    { 
      id: 'nav-kudos', 
      title: 'View Kudos Board', 
      icon: Award, 
      category: 'Navigation',
      action: () => navigate('/kudos'),
      keywords: ['kudos', 'recognition', 'appreciation']
    },
    { 
      id: 'nav-learning', 
      title: 'Go to Learning Hub', 
      icon: GraduationCap, 
      category: 'Navigation',
      action: () => navigate('/learning'),
      keywords: ['learning', 'lms', 'courses', 'education']
    },
    { 
      id: 'nav-announcements', 
      title: 'View Announcements', 
      icon: Bell, 
      category: 'Navigation',
      action: () => navigate('/announcements'),
      keywords: ['announcements', 'news', 'updates']
    },

    // Quick Actions
    { 
      id: 'action-give-kudos', 
      title: 'Give Kudos', 
      icon: Send, 
      category: 'Quick Actions',
      action: () => {
        navigate('/kudos');
        // Trigger kudos form (you can add this via event or context)
      },
      keywords: ['give kudos', 'send kudos', 'recognize', 'appreciate']
    },
    { 
      id: 'action-fill-timesheet', 
      title: 'Fill Timesheet', 
      icon: Clock, 
      category: 'Quick Actions',
      action: () => navigate('/timesheets'),
      keywords: ['fill timesheet', 'log hours', 'time entry']
    },
    { 
      id: 'action-wish-birthday', 
      title: 'Wish Someone Happy Birthday', 
      icon: Cake, 
      category: 'Quick Actions',
      action: () => navigate('/celebrations'),
      keywords: ['birthday', 'wish', 'celebrate']
    },
    { 
      id: 'action-find-sop', 
      title: 'Find SOP Document', 
      icon: FileText, 
      category: 'Quick Actions',
      action: () => navigate('/sops'),
      keywords: ['find', 'search', 'sop', 'document']
    },

    // Account
    { 
      id: 'account-profile', 
      title: 'View My Profile', 
      icon: Users, 
      category: 'Account',
      action: () => console.log('Profile coming soon'),
      keywords: ['profile', 'account', 'me']
    },
    { 
      id: 'account-settings', 
      title: 'Settings', 
      icon: Settings, 
      category: 'Account',
      action: () => console.log('Settings coming soon'),
      keywords: ['settings', 'preferences', 'config']
    },
    { 
      id: 'account-logout', 
      title: 'Logout', 
      icon: LogOut, 
      category: 'Account',
      action: async () => {
        await logout();
        navigate('/login');
      },
      keywords: ['logout', 'sign out', 'exit']
    },
  ];

  // Fuzzy search function
  const fuzzySearch = (query, actions) => {
    if (!query.trim()) return actions;

    const lowerQuery = query.toLowerCase();
    return actions.filter(action => {
      const titleMatch = action.title.toLowerCase().includes(lowerQuery);
      const categoryMatch = action.category.toLowerCase().includes(lowerQuery);
      const keywordMatch = action.keywords.some(keyword => 
        keyword.toLowerCase().includes(lowerQuery)
      );
      
      return titleMatch || categoryMatch || keywordMatch;
    });
  };

  // Update filtered actions when search query changes
  useEffect(() => {
    const filtered = fuzzySearch(searchQuery, allActions);
    setFilteredActions(filtered);
    setSelectedIndex(0);
  }, [searchQuery]);

  // Initialize filtered actions
  useEffect(() => {
    if (isOpen) {
      setFilteredActions(allActions);
      setSearchQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < filteredActions.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredActions[selectedIndex]) {
            executeAction(filteredActions[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredActions, onClose]);

  // Execute action
  const executeAction = (action) => {
    action.action();
    onClose();
  };

  // Group actions by category
  const groupedActions = filteredActions.reduce((acc, action) => {
    if (!acc[action.category]) {
      acc[action.category] = [];
    }
    acc[action.category].push(action);
    return acc;
  }, {});

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 9998,
          animation: 'fadeIn 0.2s ease-out'
        }}
        onClick={onClose}
      />

      {/* Spotlight Modal */}
      <div style={{
        position: 'fixed',
        top: '20%',
        left: '50%',
        transform: 'translate(-50%, 0)',
        width: '90%',
        maxWidth: '640px',
        maxHeight: '60vh',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideDown 0.3s ease-out',
        overflow: 'hidden'
      }}>
        {/* Search Input */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <Search size={24} color="#667eea" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '18px',
              fontWeight: '500',
              background: 'transparent',
              color: '#333'
            }}
          />
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '6px 12px',
            background: 'rgba(102, 126, 234, 0.1)',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: '600',
            color: '#667eea'
          }}>
            <Command size={14} />
            <span>K</span>
          </div>
        </div>

        {/* Results */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '12px'
        }}>
          {filteredActions.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#999'
            }}>
              <Search size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
              <p style={{ fontSize: '16px', fontWeight: '500' }}>No actions found</p>
              <p style={{ fontSize: '14px', marginTop: '8px' }}>Try searching for something else</p>
            </div>
          ) : (
            Object.entries(groupedActions).map(([category, actions], categoryIndex) => (
              <div key={category} style={{ marginBottom: '20px' }}>
                {/* Category Header */}
                <div style={{
                  fontSize: '12px',
                  fontWeight: '700',
                  color: '#999',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '8px',
                  padding: '0 12px'
                }}>
                  {category}
                </div>

                {/* Actions in Category */}
                {actions.map((action, actionIndex) => {
                  const globalIndex = filteredActions.indexOf(action);
                  const isSelected = globalIndex === selectedIndex;
                  const Icon = action.icon;

                  return (
                    <div
                      key={action.id}
                      onClick={() => executeAction(action)}
                      style={{
                        padding: '14px 16px',
                        borderRadius: '12px',
                        marginBottom: '4px',
                        cursor: 'pointer',
                        background: isSelected ? 'linear-gradient(135deg, #667eea15, #764ba215)' : 'transparent',
                        border: `2px solid ${isSelected ? '#667eea' : 'transparent'}`,
                        transition: 'all 0.15s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px'
                      }}
                      onMouseEnter={() => setSelectedIndex(globalIndex)}
                    >
                      {/* Icon */}
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: isSelected ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'rgba(102, 126, 234, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        transition: 'all 0.15s ease'
                      }}>
                        <Icon size={20} color={isSelected ? 'white' : '#667eea'} />
                      </div>

                      {/* Title */}
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: '15px',
                          fontWeight: '600',
                          color: isSelected ? '#667eea' : '#333'
                        }}>
                          {action.title}
                        </div>
                      </div>

                      {/* Arrow */}
                      {isSelected && (
                        <ArrowRight size={18} color="#667eea" />
                      )}
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer Tips */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid rgba(0, 0, 0, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '12px',
          color: '#999'
        }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <kbd style={kbdStyle}>↑↓</kbd>
              <span>Navigate</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <kbd style={kbdStyle}>↵</kbd>
              <span>Select</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <kbd style={kbdStyle}>Esc</kbd>
              <span>Close</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Keyboard key style
const kbdStyle = {
  padding: '4px 8px',
  background: 'rgba(0, 0, 0, 0.05)',
  border: '1px solid rgba(0, 0, 0, 0.1)',
  borderRadius: '6px',
  fontSize: '11px',
  fontWeight: '600',
  fontFamily: 'monospace'
};

// Hook to control spotlight
export function useQuickActions() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd+K (Mac) or Ctrl+K (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false)
  };
}

export default QuickActionsSpotlight;