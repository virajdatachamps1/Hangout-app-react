// TestAdmin.jsx
// Simple test page to verify admin access is working
// Put this in src/pages/TestAdmin.jsx and visit /test-admin

import { useAuth } from '../contexts/AuthContext';

export default function TestAdmin() {
  const auth = useAuth();

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '24px' }}>
        🔍 Admin Access Test
      </h1>

      {/* Current Status */}
      <div style={{
        background: auth.isAdmin ? '#d1fae5' : '#fee2e2',
        border: `3px solid ${auth.isAdmin ? '#10b981' : '#ef4444'}`,
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '32px'
      }}>
        <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>
          Status: {auth.isAdmin ? '✅ ADMIN ACCESS' : '❌ NOT ADMIN'}
        </h2>
        {auth.isAdmin ? (
          <p style={{ fontSize: '16px', color: '#065f46' }}>
            Great! You have admin access. The + buttons should be visible.
          </p>
        ) : (
          <p style={{ fontSize: '16px', color: '#991b1b' }}>
            You don't have admin access. Follow the troubleshooting guide.
          </p>
        )}
      </div>

      {/* Detailed Info */}
      <div style={{
        background: 'white',
        border: '2px solid #e5e7eb',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '32px'
      }}>
        <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>
          🔐 Authentication Details
        </h3>
        
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: '12px 0', fontWeight: 'bold', width: '200px' }}>
                Email:
              </td>
              <td style={{ padding: '12px 0' }}>
                {auth.currentUser?.email || '❌ Not logged in'}
              </td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: '12px 0', fontWeight: 'bold' }}>
                User ID:
              </td>
              <td style={{ padding: '12px 0', fontFamily: 'monospace', fontSize: '14px' }}>
                {auth.currentUser?.uid || 'N/A'}
              </td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: '12px 0', fontWeight: 'bold' }}>
                Role:
              </td>
              <td style={{ padding: '12px 0' }}>
                <span style={{
                  padding: '4px 12px',
                  background: auth.userRole === 'admin' ? '#d1fae5' : '#fef3c7',
                  color: auth.userRole === 'admin' ? '#065f46' : '#92400e',
                  borderRadius: '6px',
                  fontWeight: 'bold'
                }}>
                  {auth.userRole || '❌ Not set'}
                </span>
              </td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: '12px 0', fontWeight: 'bold' }}>
                isAdmin:
              </td>
              <td style={{ padding: '12px 0' }}>
                <span style={{
                  fontSize: '20px',
                  color: auth.isAdmin ? '#10b981' : '#ef4444'
                }}>
                  {auth.isAdmin ? '✅ TRUE' : '❌ FALSE'}
                </span>
              </td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: '12px 0', fontWeight: 'bold' }}>
                isSenior:
              </td>
              <td style={{ padding: '12px 0' }}>
                <span style={{
                  fontSize: '20px',
                  color: auth.isSenior ? '#10b981' : '#ef4444'
                }}>
                  {auth.isSenior ? '✅ TRUE' : '❌ FALSE'}
                </span>
              </td>
            </tr>
            <tr>
              <td style={{ padding: '12px 0', fontWeight: 'bold' }}>
                Loading:
              </td>
              <td style={{ padding: '12px 0' }}>
                {auth.loading ? '⏳ Loading...' : '✅ Loaded'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Button Test */}
      <div style={{
        background: 'white',
        border: '2px solid #e5e7eb',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '32px'
      }}>
        <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>
          🔘 Button Visibility Test
        </h3>
        
        <p style={{ marginBottom: '16px', color: '#666' }}>
          The button below should only appear if you're an admin:
        </p>

        {auth.isAdmin ? (
          <button style={{
            padding: '14px 28px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            borderRadius: '12px',
            fontSize: '15px',
            fontWeight: '600',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            ➕ Admin Button (You can see this!)
          </button>
        ) : (
          <div style={{
            padding: '16px',
            background: '#fee2e2',
            borderRadius: '8px',
            color: '#991b1b'
          }}>
            ❌ Button is hidden because isAdmin = false
          </div>
        )}
      </div>

      {/* Firestore Instructions */}
      {!auth.isAdmin && (
        <div style={{
          background: '#fffbeb',
          border: '2px solid #fbbf24',
          borderRadius: '16px',
          padding: '24px'
        }}>
          <h3 style={{ fontSize: '20px', marginBottom: '16px', color: '#92400e' }}>
            📝 How to Fix
          </h3>
          
          <ol style={{ marginLeft: '20px', color: '#78350f', lineHeight: '1.8' }}>
            <li>
              <strong>Go to Firebase Console</strong> → Firestore Database
            </li>
            <li>
              <strong>Find or create</strong> the <code style={{ 
                background: '#fef3c7', 
                padding: '2px 6px', 
                borderRadius: '4px' 
              }}>users</code> collection
            </li>
            <li>
              <strong>Add a document with ID:</strong>
              <div style={{
                background: '#fef3c7',
                padding: '12px',
                borderRadius: '8px',
                fontFamily: 'monospace',
                fontSize: '12px',
                marginTop: '8px',
                overflowX: 'auto'
              }}>
                {auth.currentUser?.uid || 'YOUR_USER_UID'}
              </div>
            </li>
            <li>
              <strong>Add these fields:</strong>
              <ul style={{ marginTop: '8px' }}>
                <li><code>email</code> (string): {auth.currentUser?.email}</li>
                <li><code>role</code> (string): admin</li>
                <li><code>displayName</code> (string): Your Name</li>
              </ul>
            </li>
            <li>
              <strong>Save and refresh this page</strong>
            </li>
          </ol>

          <div style={{
            marginTop: '20px',
            padding: '16px',
            background: 'white',
            borderRadius: '8px',
            border: '1px solid #fbbf24'
          }}>
            <strong>Quick Copy for Firestore:</strong>
            <pre style={{
              marginTop: '8px',
              background: '#1f2937',
              color: '#10b981',
              padding: '12px',
              borderRadius: '6px',
              fontSize: '12px',
              overflowX: 'auto'
            }}>
{`{
  "email": "${auth.currentUser?.email || 'your@email.com'}",
  "role": "admin",
  "displayName": "${auth.currentUser?.displayName || 'Your Name'}",
  "createdAt": (timestamp - current date)
}`}
            </pre>
          </div>
        </div>
      )}

      {/* Success Message */}
      {auth.isAdmin && (
        <div style={{
          background: '#d1fae5',
          border: '2px solid #10b981',
          borderRadius: '16px',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎉</div>
          <h3 style={{ fontSize: '24px', marginBottom: '12px', color: '#065f46' }}>
            Success! You're an Admin!
          </h3>
          <p style={{ color: '#047857', marginBottom: '20px' }}>
            The + buttons should now be visible in:
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a 
              href="/announcements" 
              style={{
                padding: '12px 24px',
                background: '#10b981',
                color: 'white',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: '600'
              }}
            >
              Go to Announcements
            </a>
            <a 
              href="/sops" 
              style={{
                padding: '12px 24px',
                background: '#10b981',
                color: 'white',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: '600'
              }}
            >
              Go to SOPs
            </a>
          </div>
        </div>
      )}

      {/* Console Button */}
      <div style={{ marginTop: '32px', textAlign: 'center' }}>
        <button
          onClick={() => {
            console.clear();
            console.log('='.repeat(50));
            console.log('ADMIN TEST - FULL DEBUG INFO');
            console.log('='.repeat(50));
            console.table({
              'Email': auth.currentUser?.email,
              'UID': auth.currentUser?.uid,
              'Role': auth.userRole,
              'isAdmin': auth.isAdmin,
              'isSenior': auth.isSenior,
              'isEmployee': auth.isEmployee,
              'Loading': auth.loading
            });
            console.log('='.repeat(50));
            alert('Check browser console (F12) for detailed info!');
          }}
          style={{
            padding: '12px 24px',
            background: '#3b82f6',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          📊 Log Full Details to Console
        </button>
      </div>
    </div>
  );
}