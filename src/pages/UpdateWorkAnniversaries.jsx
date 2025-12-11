import { useState } from 'react';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Upload, Calendar, CheckCircle, AlertCircle } from 'lucide-react';

export default function UpdateWorkAnniversaries() {
  const { isAdmin } = useAuth();
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const parseDate = (dateStr) => {
    if (!dateStr || dateStr.trim() === '') return null;
    
    try {
      // Accept both slash (/) and dash (-) as separators
      const parts = dateStr.includes('/') 
        ? dateStr.split('/') 
        : dateStr.split('-');
      
      if (parts.length !== 3) return null;
      
      const day = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1;
      let year = parseInt(parts[2]);
      
      if (year < 100) {
        year = year <= 30 ? 2000 + year : 1900 + year;
      }
      
      const date = new Date(year, month, day);
      if (isNaN(date.getTime())) return null;
      
      return Timestamp.fromDate(date);
    } catch (error) {
      return null;
    }
  };

  const parseCSV = (text) => {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = line.split(',').map(v => v.trim());
      const obj = {};
      headers.forEach((header, index) => {
        obj[header] = values[index] || '';
      });
      data.push(obj);
    }
    return data;
  };

  const handleUpdate = async () => {
    if (!file) {
      setStatus('error:Please select a CSV file');
      return;
    }

    setLoading(true);
    setStatus('');
    setResults(null);

    try {
      const text = await file.text();
      const rows = parseCSV(text);
      
      console.log('📊 Processing', rows.length, 'rows');
      
      const updated = [];
      const errors = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        
        if (!row.email) {
          errors.push(`Row ${i + 2}: Missing email`);
          continue;
        }

        const email = row.email.toLowerCase().trim();
        const workAnniversary = parseDate(row['work anniversary']);
        
        if (!workAnniversary) {
          errors.push(`Row ${i + 2}: Invalid work anniversary date for ${email}`);
          continue;
        }

        try {
          const userDocRef = doc(db, 'users', email);
          await updateDoc(userDocRef, {
            workAnniversary: workAnniversary,
            updatedAt: Timestamp.now()
          });
          
          updated.push(email);
          console.log(`✅ Updated: ${email}`);
        } catch (error) {
          errors.push(`Row ${i + 2}: Failed to update ${email} - ${error.message}`);
          console.error(`❌ Error updating ${email}:`, error);
        }
      }

      setResults({
        total: rows.length,
        updated: updated.length,
        errors: errors.length,
        errorList: errors
      });

      if (updated.length > 0) {
        setStatus(`success:✅ Updated ${updated.length} work anniversaries!`);
      }

      if (errors.length > 0 && updated.length === 0) {
        setStatus(`error:❌ Failed to update any records. Check errors below.`);
      }

    } catch (error) {
      console.error('❌ Update failed:', error);
      setStatus(`error:❌ Update failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const template = `Email,Work Anniversary
viraj.s@company.com,14/11/2022
john.doe@company.com,01/06/2020
jane.smith@company.com,15/09/2019`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'work_anniversaries_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!isAdmin) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h1>Access Denied</h1>
        <p>Only administrators can access this page.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Calendar size={36} color="#667eea" />
          Update Work Anniversaries
        </h1>
        <p style={{ fontSize: '16px', color: '#666' }}>
          Bulk update work anniversary dates for existing users
        </p>
      </div>

      {/* Instructions */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
        border: '2px solid #667eea',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '32px'
      }}>
        <h3 style={{ fontSize: '18px', marginBottom: '16px', color: '#4338ca', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle size={20} />
          CSV Format Required
        </h3>
        
        <div style={{
          background: '#1f2937',
          padding: '16px',
          borderRadius: '12px',
          marginBottom: '16px'
        }}>
          <pre style={{
            color: '#10b981',
            fontSize: '13px',
            fontFamily: 'monospace',
            margin: 0,
            overflow: 'auto'
          }}>
{`Email,Work Anniversary
viraj.s@company.com,14/11/2022
john.doe@company.com,01/06/2020
jane.smith@company.com,15/09/2019`}
          </pre>
        </div>

        <div style={{ fontSize: '14px', color: '#4338ca', lineHeight: '1.8' }}>
          <strong>Important:</strong>
          <ul style={{ marginTop: '8px', marginLeft: '20px' }}>
            <li>Date format must be <strong>DD/MM/YYYY</strong> (e.g., 14/11/2022)</li>
            <li>Only include users that need updating</li>
            <li>This will <strong>UPDATE</strong> existing users, not create new ones</li>
            <li>Other user data (name, role, etc.) will NOT be changed</li>
          </ul>
        </div>

        <button
          onClick={downloadTemplate}
          style={{
            marginTop: '16px',
            padding: '10px 20px',
            background: '#667eea',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Upload size={16} />
          Download Template
        </button>
      </div>

      {/* File Upload */}
      <div style={{
        background: 'white',
        border: '2px solid #e5e7eb',
        borderRadius: '16px',
        padding: '32px',
        marginBottom: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
      }}>
        <h2 style={{ fontSize: '20px', marginBottom: '20px' }}>Upload CSV File</h2>
        
        <div
          onClick={() => document.getElementById('csvUpload').click()}
          style={{
            border: `3px dashed ${file ? '#10b981' : '#e0e0e0'}`,
            borderRadius: '12px',
            padding: '40px',
            textAlign: 'center',
            background: file ? '#d1fae5' : '#fafafa',
            cursor: 'pointer',
            marginBottom: '20px',
            transition: 'all 0.3s'
          }}
        >
          <input
            id="csvUpload"
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files[0])}
            style={{ display: 'none' }}
          />
          <Upload size={48} color={file ? '#10b981' : '#999'} style={{ marginBottom: '12px' }} />
          <p style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
            {file ? file.name : 'Click to select CSV file'}
          </p>
          <p style={{ fontSize: '14px', color: '#999' }}>
            CSV file with Email and Work Anniversary columns
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleUpdate}
            disabled={!file || loading}
            style={{
              flex: 1,
              padding: '14px',
              background: loading ? '#999' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontSize: '15px',
              fontWeight: '600',
              cursor: loading || !file ? 'not-allowed' : 'pointer',
              opacity: !file ? 0.5 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {loading ? (
              <>
                <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div>
                Updating...
              </>
            ) : (
              <>
                <CheckCircle size={18} />
                Update Work Anniversaries
              </>
            )}
          </button>
          
          <button
            onClick={() => {
              setFile(null);
              setStatus('');
              setResults(null);
              const input = document.getElementById('csvUpload');
              if (input) input.value = '';
            }}
            disabled={loading}
            style={{
              padding: '14px 24px',
              background: '#f5f5f5',
              border: 'none',
              borderRadius: '12px',
              color: '#666',
              fontSize: '15px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Status Message */}
      {status && (
        <div style={{
          padding: '16px',
          borderRadius: '12px',
          marginBottom: '24px',
          background: status.startsWith('success') ? '#d1fae5' : '#fee2e2',
          border: `2px solid ${status.startsWith('success') ? '#10b981' : '#ef4444'}`,
          color: status.startsWith('success') ? '#065f46' : '#991b1b',
          display: 'flex',
          alignItems: 'start',
          gap: '12px'
        }}>
          {status.startsWith('success') ? (
            <CheckCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
          ) : (
            <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
          )}
          <span>{status.replace('success:', '').replace('error:', '')}</span>
        </div>
      )}

      {/* Results */}
      {results && (
        <div style={{
          background: 'white',
          border: '2px solid #e5e7eb',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Update Results</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
            <div style={{
              padding: '16px',
              background: '#dbeafe',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#2563eb', marginBottom: '4px' }}>
                {results.total}
              </div>
              <div style={{ fontSize: '13px', color: '#1e40af', fontWeight: '600' }}>
                Total Rows
              </div>
            </div>
            
            <div style={{
              padding: '16px',
              background: '#d1fae5',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#10b981', marginBottom: '4px' }}>
                {results.updated}
              </div>
              <div style={{ fontSize: '13px', color: '#065f46', fontWeight: '600' }}>
                Updated
              </div>
            </div>
            
            <div style={{
              padding: '16px',
              background: '#fee2e2',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '28px', fontWeight: '700', color: '#ef4444', marginBottom: '4px' }}>
                {results.errors}
              </div>
              <div style={{ fontSize: '13px', color: '#991b1b', fontWeight: '600' }}>
                Errors
              </div>
            </div>
          </div>

          {results.errorList.length > 0 && (
            <div style={{
              padding: '16px',
              background: '#fef3c7',
              borderRadius: '12px',
              border: '1px solid #fbbf24'
            }}>
              <div style={{ fontWeight: '600', marginBottom: '8px', color: '#92400e' }}>
                ⚠️ Errors:
              </div>
              <div style={{
                fontSize: '13px',
                color: '#78350f',
                maxHeight: '200px',
                overflowY: 'auto',
                lineHeight: '1.6'
              }}>
                {results.errorList.map((error, idx) => (
                  <div key={idx} style={{ marginBottom: '4px' }}>
                    • {error}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}