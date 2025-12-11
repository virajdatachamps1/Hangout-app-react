import { useAuth } from '../contexts/AuthContext';

// Add this component at the TOP of any page to debug
export default function DebugAuth() {
  const { currentUser, userRole, isAdmin, isSenior, isEmployee } = useAuth();

  // Only show in development
  if (process.env.NODE_ENV === 'production') return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: '#1f2937',
      color: 'white',
      padding: '16px',
      borderRadius: '12px',
      fontSize: '12px',
      fontFamily: 'monospace',
      zIndex: 9999,
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      maxWidth: '300px'
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#60a5fa' }}>
        🔍 Debug Info
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div>
          <strong>Email:</strong> {currentUser?.email || 'Not logged in'}
        </div>
        <div>
          <strong>UID:</strong> {currentUser?.uid?.slice(0, 8) || 'N/A'}...
        </div>
        <div>
          <strong>Role:</strong> <span style={{ 
            color: userRole === 'admin' ? '#10b981' : '#f59e0b',
            fontWeight: 'bold'
          }}>
            {userRole || 'Not set'}
          </span>
        </div>
        <div>
          <strong>isAdmin:</strong> <span style={{ 
            color: isAdmin ? '#10b981' : '#ef4444',
            fontWeight: 'bold'
          }}>
            {isAdmin ? '✅ YES' : '❌ NO'}
          </span>
        </div>
        <div>
          <strong>isSenior:</strong> <span style={{ 
            color: isSenior ? '#10b981' : '#ef4444',
            fontWeight: 'bold'
          }}>
            {isSenior ? '✅ YES' : '❌ NO'}
          </span>
        </div>
      </div>
      <button
        onClick={() => console.table({ currentUser, userRole, isAdmin, isSenior, isEmployee })}
        style={{
          marginTop: '12px',
          padding: '6px 12px',
          background: '#3b82f6',
          border: 'none',
          borderRadius: '6px',
          color: 'white',
          fontSize: '11px',
          cursor: 'pointer',
          width: '100%'
        }}
      >
        Log to Console
      </button>
    </div>
  );
}