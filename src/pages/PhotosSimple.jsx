// Simple Photos page for testing
import { useState } from 'react';

function PhotosSimple() {
  const [message, setMessage] = useState('Photos page loaded successfully!');

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{
        background: 'white',
        padding: '32px',
        borderRadius: '16px',
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '32px', marginBottom: '16px' }}>📸 Photos</h1>
        <p style={{ color: '#666', fontSize: '18px' }}>{message}</p>
        
        <div style={{ marginTop: '30px' }}>
          <button
            onClick={() => setMessage('Button clicked! Photos functionality is working.')}
            style={{
              padding: '12px 24px',
              background: '#4f46e5',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Test Button
          </button>
        </div>
        
        <div style={{ 
          marginTop: '30px', 
          padding: '20px', 
          background: '#f0f9ff', 
          borderRadius: '8px',
          textAlign: 'left'
        }}>
          <h3>✅ What's Working:</h3>
          <ul style={{ marginTop: '10px' }}>
            <li>✅ React component rendering</li>
            <li>✅ Routing to /photos</li>
            <li>✅ State management (useState)</li>
            <li>✅ Event handling (onClick)</li>
            <li>✅ CSS styling</li>
          </ul>
          
          <h3 style={{ marginTop: '20px' }}>🚀 Next Steps:</h3>
          <ul style={{ marginTop: '10px' }}>
            <li>Add Firebase Storage integration</li>
            <li>Add file upload functionality</li>
            <li>Add photo gallery display</li>
            <li>Add user authentication checks</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default PhotosSimple;