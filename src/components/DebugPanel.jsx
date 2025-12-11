import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import firestoreService from '../utils/firestoreService';

function DebugPanel() {
  const { currentUser, userRole, isAdmin, isSenior } = useAuth();
  const [testResults, setTestResults] = useState({});
  const [showPanel, setShowPanel] = useState(false);

  const runTests = async () => {
    const results = {};

    // Test 1: Auth Status
    results.auth = {
      loggedIn: !!currentUser,
      email: currentUser?.email,
      uid: currentUser?.uid,
      role: userRole,
      isAdmin: isAdmin,
      isSenior: isSenior
    };

    // Test 2: Firestore - Announcements
    try {
      const announcements = await firestoreService.announcements.getAll();
      results.announcements = {
        success: true,
        count: announcements.length,
        data: announcements
      };
    } catch (error) {
      results.announcements = {
        success: false,
        error: error.message
      };
    }

    // Test 3: Firestore - SOPs
    try {
      const sops = await firestoreService.sops.getAll();
      results.sops = {
        success: true,
        count: sops.length,
        data: sops
      };
    } catch (error) {
      results.sops = {
        success: false,
        error: error.message
      };
    }

    setTestResults(results);
  };

  useEffect(() => {
    if (currentUser) {
      runTests();
    }
  }, [currentUser]);

  if (!showPanel) {
    return (
      <button
        onClick={() => setShowPanel(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          padding: '12px 20px',
          background: '#ff6b6b',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: '600',
          zIndex: 9999,
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
        }}
      >
        🐛 Debug
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '400px',
      maxHeight: '600px',
      background: 'white',
      border: '2px solid #ff6b6b',
      borderRadius: '12px',
      padding: '20px',
      zIndex: 9999,
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      overflow: 'auto'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, color: '#ff6b6b' }}>🐛 Debug Panel</h3>
        <button
          onClick={() => setShowPanel(false)}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer'
          }}
        >
          ✕
        </button>
      </div>

      <button
        onClick={runTests}
        style={{
          width: '100%',
          padding: '10px',
          background: '#4facfe',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          marginBottom: '16px',
          fontWeight: '600'
        }}
      >
        🔄 Run Tests
      </button>

      <div style={{ fontSize: '13px' }}>
        {/* Auth Status */}
        <div style={{ marginBottom: '16px', padding: '12px', background: '#f8f9fa', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#333' }}>👤 Authentication</h4>
          <pre style={{ margin: 0, fontSize: '11px', overflow: 'auto' }}>
            {JSON.stringify(testResults.auth, null, 2)}
          </pre>
        </div>

        {/* Announcements Test */}
        <div style={{ 
          marginBottom: '16px', 
          padding: '12px', 
          background: testResults.announcements?.success ? '#d1fae5' : '#fee2e2',
          borderRadius: '8px' 
        }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#333' }}>
            📢 Announcements {testResults.announcements?.success ? '✅' : '❌'}
          </h4>
          <pre style={{ margin: 0, fontSize: '11px', overflow: 'auto' }}>
            {JSON.stringify(testResults.announcements, null, 2)}
          </pre>
        </div>

        {/* SOPs Test */}
        <div style={{ 
          marginBottom: '16px', 
          padding: '12px', 
          background: testResults.sops?.success ? '#d1fae5' : '#fee2e2',
          borderRadius: '8px' 
        }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#333' }}>
            📚 SOPs {testResults.sops?.success ? '✅' : '❌'}
          </h4>
          <pre style={{ margin: 0, fontSize: '11px', overflow: 'auto' }}>
            {JSON.stringify(testResults.sops, null, 2)}
          </pre>
        </div>

        {/* Quick Tips */}
        <div style={{ padding: '12px', background: '#fff3cd', borderRadius: '8px', fontSize: '12px' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#856404' }}>💡 Quick Tips</h4>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            <li>Check browser console (F12) for errors</li>
            <li>Verify isAdmin is true to see buttons</li>
            <li>Check Firebase Console for index errors</li>
            <li>Ensure Firestore rules allow read/write</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default DebugPanel;
