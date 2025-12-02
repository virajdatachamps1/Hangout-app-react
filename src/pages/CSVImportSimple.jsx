// Simple CSV Import page for testing
import { useState } from 'react';

function CSVImportSimple() {
  const [status, setStatus] = useState('CSV Import page loaded successfully!');

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setStatus(`File selected: ${file.name} (${file.size} bytes)`);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{
        background: 'white',
        padding: '32px',
        borderRadius: '16px',
        marginBottom: '20px'
      }}>
        <h1 style={{ fontSize: '32px', marginBottom: '16px' }}>📥 CSV Import</h1>
        <p style={{ color: '#666', fontSize: '18px', marginBottom: '30px' }}>{status}</p>
        
        <div style={{
          border: '2px dashed #ccc',
          borderRadius: '8px',
          padding: '40px',
          textAlign: 'center',
          marginBottom: '20px'
        }}>
          <h3>Test File Upload</h3>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            style={{
              marginTop: '20px',
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
        </div>
        
        <div style={{ 
          padding: '20px', 
          background: '#f0f9ff', 
          borderRadius: '8px'
        }}>
          <h3>✅ CSV Import Features:</h3>
          <ul style={{ marginTop: '10px' }}>
            <li>✅ File selection working</li>
            <li>✅ CSV file type filtering</li>
            <li>✅ File info display</li>
            <li>🔄 Firebase integration (next step)</li>
            <li>🔄 Data parsing (next step)</li>
            <li>🔄 Database import (next step)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default CSVImportSimple;