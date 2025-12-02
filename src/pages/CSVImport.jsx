// src/pages/CSVImport.jsx - COMPLETE REPLACEMENT

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { importCelebrationsCSV, importTimesheetsCSV } from '../utils/CSVImporter';
import { Navigate } from 'react-router-dom';
import { Upload, AlertCircle, CheckCircle, X } from 'lucide-react';
import { collection, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';

function CSVImport() {
  const { userRole, currentUser } = useAuth();
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  if (userRole !== 'admin' && userRole !== 'hr') {
    return <Navigate to="/" />;
  }

  const deleteCollection = async (collectionName) => {
    if (!window.confirm(`⚠️ Delete ALL documents in "${collectionName}" collection?`)) {
      return;
    }

    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, collectionName));
      const batch = writeBatch(db);
      let count = 0;
      
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
        count++;
      });
      
      await batch.commit();
      alert(`✅ Deleted ${count} documents from ${collectionName}`);
    } catch (error) {
      console.error('Error:', error);
      alert(`Failed to delete: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteAllUsersExceptMe = async () => {
    if (!window.confirm('⚠️ Delete all users EXCEPT yourself? This will clear employee data before fresh import.')) {
      return;
    }

    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      const batch = writeBatch(db);
      let count = 0;
      
      snapshot.docs.forEach(doc => {
        if (doc.id !== currentUser.email.toLowerCase()) {
          batch.delete(doc.ref);
          count++;
        }
      });
      
      await batch.commit();
      alert(`✅ Deleted ${count} employee records. Your admin account is safe!`);
    } catch (error) {
      console.error('Error:', error);
      alert(`Failed to delete: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const lines = text.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      const preview = lines.slice(1, 6).map(line => line.split(',').map(v => v.trim()));
      
      setPreviewData({
        type,
        headers,
        rows: preview,
        totalRows: lines.length - 1
      });
    } catch (error) {
      setStatus(`error:Failed to read file: ${error.message}`);
      return;
    }
  };

  const handleImport = async () => {
    if (!previewData) return;

    setLoading(true);
    setStatus('');

    try {
      const fileInput = document.getElementById(`${previewData.type}FileInput`);
      const file = fileInput.files[0];
      const text = await file.text();
      
      let result;
      if (previewData.type === 'celebrations') {
        result = await importCelebrationsCSV(text);
        if (result.success) {
          setStatus(`success:✅ Successfully imported ${result.imported} employees!${result.errors.length > 0 ? '\n\nWarnings:\n' + result.errors.join('\n') : ''}`);
        } else {
          setStatus(`error:❌ Import failed: ${result.error}${result.errors.length > 0 ? '\n\n' + result.errors.join('\n') : ''}`);
        }
      } else if (previewData.type === 'timesheets') {
        result = await importTimesheetsCSV(text);
        if (result.success) {
          setStatus(`success:✅ Successfully updated ${result.updated} timesheets!${result.notFound.length > 0 ? '\n\nNot Found:\n' + result.notFound.join('\n') : ''}`);
        } else {
          setStatus(`error:❌ Import failed: ${result.error}`);
        }
      }

      if (result.success) {
        setTimeout(() => {
          setPreviewData(null);
          fileInput.value = '';
        }, 3000);
      }
    } catch (error) {
      setStatus(`error:❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setPreviewData(null);
    const fileInput = document.getElementById(`${previewData.type}FileInput`);
    if (fileInput) fileInput.value = '';
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '20px' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '48px 32px',
        borderRadius: '24px',
        marginBottom: '32px',
        color: 'white',
        boxShadow: '0 20px 60px rgba(102, 126, 234, 0.3)'
      }}>
        <h1 style={{ fontSize: '36px', marginBottom: '8px', fontWeight: '700' }}>
          📥 CSV Import
        </h1>
        <p style={{ fontSize: '16px', opacity: 0.95 }}>
          Import employee data from CSV files
        </p>
      </div>

      {/* Instructions */}
      <div style={{
        background: '#fef3c7',
        border: '2px solid #f59e0b',
        padding: '24px',
        borderRadius: '16px',
        marginBottom: '32px'
      }}>
        <div style={{ display: 'flex', gap: '16px' }}>
          <AlertCircle size={24} color="#f59e0b" style={{ flexShrink: 0 }} />
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '12px', color: '#92400e' }}>
              Important Instructions
            </h3>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#92400e', lineHeight: '1.8' }}>
              <li><strong>Always import Celebrations first</strong> - This creates the user accounts</li>
              <li><strong>Then import Timesheets</strong> - This adds timesheet links to existing users</li>
              <li><strong>Date format:</strong> DD/MM/YY or DD/MM/YYYY (e.g., 20/05/90 or 15/01/2023)</li>
              <li><strong>Email is the unique identifier</strong> - Used to match users across files</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Cleanup Tools */}
      <div style={{
        background: '#fee2e2',
        border: '2px solid #ef4444',
        padding: '24px',
        borderRadius: '16px',
        marginBottom: '32px'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: '#991b1b' }}>
          🗑️ Cleanup Tools (Before Fresh Import)
        </h3>
        <p style={{ color: '#991b1b', marginBottom: '16px', fontSize: '14px' }}>
          Delete old employee data before importing new CSV files. <strong>Your admin account will NOT be deleted.</strong>
        </p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={deleteAllUsersExceptMe}
            disabled={loading}
            style={{
              padding: '12px 24px',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              opacity: loading ? 0.5 : 1
            }}
          >
            🗑️ Delete All Employees (Keep Me)
          </button>
          <button
            onClick={() => deleteCollection('celebrations')}
            disabled={loading}
            style={{
              padding: '12px 24px',
              background: '#f59e0b',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              opacity: loading ? 0.5 : 1
            }}
          >
            Delete Old Celebrations
          </button>
          <button
            onClick={() => deleteCollection('timesheets')}
            disabled={loading}
            style={{
              padding: '12px 24px',
              background: '#f59e0b',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              opacity: loading ? 0.5 : 1
            }}
          >
            Delete Old Timesheets
          </button>
        </div>
      </div>

      {/* Import Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
        {/* Celebrations Import */}
        <div style={{
          background: 'white',
          padding: '32px',
          borderRadius: '20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
        }}>
          <h2 style={{ fontSize: '22px', marginBottom: '12px', fontWeight: '700' }}>
            🎂 Celebrations Data
          </h2>
          <p style={{ color: '#666', marginBottom: '20px', fontSize: '14px' }}>
            Upload employee birthdays and work anniversaries
          </p>
          
          <div style={{
            background: '#f5f5f5',
            padding: '16px',
            borderRadius: '12px',
            marginBottom: '20px',
            fontSize: '13px'
          }}>
            <strong>Required CSV Format:</strong><br/>
            <code style={{ background: 'white', padding: '4px 8px', borderRadius: '4px' }}>
              name,email,birthday,workanniversary,department
            </code>
          </div>

          <input
            type="file"
            id="celebrationsFileInput"
            accept=".csv"
            onChange={(e) => handleFileUpload(e, 'celebrations')}
            disabled={loading}
            style={{ display: 'none' }}
          />
          <label
            htmlFor="celebrationsFileInput"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              padding: '20px',
              border: '3px dashed #e0e0e0',
              borderRadius: '16px',
              cursor: 'pointer',
              background: '#fafafa',
              transition: 'all 0.2s',
              fontSize: '15px',
              fontWeight: '600',
              color: '#666'
            }}
          >
            <Upload size={24} />
            Choose Celebrations CSV
          </label>
        </div>

        {/* Timesheets Import */}
        <div style={{
          background: 'white',
          padding: '32px',
          borderRadius: '20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
        }}>
          <h2 style={{ fontSize: '22px', marginBottom: '12px', fontWeight: '700' }}>
            ⏱️ Timesheets Data
          </h2>
          <p style={{ color: '#666', marginBottom: '20px', fontSize: '14px' }}>
            Upload timesheet links for employees
          </p>
          
          <div style={{
            background: '#f5f5f5',
            padding: '16px',
            borderRadius: '12px',
            marginBottom: '20px',
            fontSize: '13px'
          }}>
            <strong>Required CSV Format:</strong><br/>
            <code style={{ background: 'white', padding: '4px 8px', borderRadius: '4px' }}>
              name,email,link
            </code>
          </div>

          <input
            type="file"
            id="timesheetsFileInput"
            accept=".csv"
            onChange={(e) => handleFileUpload(e, 'timesheets')}
            disabled={loading}
            style={{ display: 'none' }}
          />
          <label
            htmlFor="timesheetsFileInput"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              padding: '20px',
              border: '3px dashed #e0e0e0',
              borderRadius: '16px',
              cursor: 'pointer',
              background: '#fafafa',
              transition: 'all 0.2s',
              fontSize: '15px',
              fontWeight: '600',
              color: '#666'
            }}
          >
            <Upload size={24} />
            Choose Timesheets CSV
          </label>
        </div>
      </div>

      {/* Preview Section */}
      {previewData && (
        <div style={{
          background: 'white',
          padding: '32px',
          borderRadius: '20px',
          marginBottom: '24px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
          border: '2px solid #667eea'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '700' }}>
              Preview ({previewData.totalRows} rows total)
            </h3>
            <button
              onClick={handleCancel}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: 'none',
                background: '#f5f5f5',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={18} />
            </button>
          </div>

          <div style={{ overflowX: 'auto', marginBottom: '24px' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '14px'
            }}>
              <thead>
                <tr style={{ background: '#f5f5f5' }}>
                  {previewData.headers.map((header, i) => (
                    <th key={i} style={{
                      padding: '12px',
                      textAlign: 'left',
                      fontWeight: '700',
                      borderBottom: '2px solid #e0e0e0'
                    }}>
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewData.rows.map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    {row.map((cell, j) => (
                      <td key={j} style={{ padding: '12px' }}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={handleImport}
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px',
              background: loading ? '#e0e0e0' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px'
            }}
          >
            {loading ? 'Importing...' : `Import ${previewData.totalRows} Records`}
          </button>
        </div>
      )}

      {/* Status Message */}
      {status && (
        <div style={{
          padding: '20px',
          background: status.startsWith('success') ? '#d1fae5' : '#fee2e2',
          color: status.startsWith('success') ? '#065f46' : '#991b1b',
          borderRadius: '16px',
          fontSize: '14px',
          lineHeight: '1.8',
          whiteSpace: 'pre-line',
          border: `2px solid ${status.startsWith('success') ? '#10b981' : '#ef4444'}`
        }}>
          {status.replace('success:', '').replace('error:', '')}
        </div>
      )}
    </div>
  );
}

export default CSVImport;