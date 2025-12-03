import { useState } from 'react';
import { Bell } from 'lucide-react';

function NotificationBell() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount] = useState(3); // Mock data for now

  return (
    <div style={{ position: 'relative' }}>
      {/* Bell Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          border: 'none',
          background: unreadCount > 0 ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' : 'rgba(255, 255, 255, 0.2)',
          color: 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          transition: 'all 0.3s',
          boxShadow: unreadCount > 0 ? '0 4px 12px rgba(240, 147, 251, 0.4)' : '0 2px 8px rgba(0,0,0,0.1)'
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        title="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <div style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            minWidth: '20px',
            height: '20px',
            background: '#ef4444',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px',
            fontWeight: '700',
            color: 'white',
            border: '2px solid white',
            padding: '0 4px',
            animation: 'bounce 0.5s ease-in-out'
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </div>
        )}
      </button>

      {/* Simple Dropdown */}
      {showDropdown && (
        <>
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999
            }}
            onClick={() => setShowDropdown(false)}
          />
          
          <div style={{
            position: 'absolute',
            top: '56px',
            right: 0,
            width: '300px',
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.2)',
            zIndex: 1000,
            padding: '20px',
            animation: 'slideDown 0.3s ease-out'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: '#333' }}>
              Notifications
            </h3>
            <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
              <Bell size={32} style={{ opacity: 0.3, marginBottom: '12px' }} />
              <p>No new notifications</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default NotificationBell;