import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import dataManager from '../utils/dataManager';
import './AdminUpload.css';

export default function AdminUpload() {
  const { currentUser } = useAuth();
  
  // State for celebrations upload
  const [celebrationsFile, setCelebrationsFile] = useState(null);
  const [celebrationsData, setCelebrationsData] = useState(null);
  const [celebrationsStatus, setCelebrationsStatus] = useState('');
  const [celebrationsLoading, setCelebrationsLoading] = useState(false);

  // State for timesheets upload
  const [timesheetsFile, setTimesheetsFile] = useState(null);
  const [timesheetsData, setTimesheetsData] = useState(null);
  const [timesheetsStatus, setTimesheetsStatus] = useState('');
  const [timesheetsLoading, setTimesheetsLoading] = useState(false);

  // Upload history
  const [uploadHistory, setUploadHistory] = useState({
    celebrations: null,
    timesheets: null
  });

  // Check if user is authorized (Admin or HR)
  useEffect(() => {
    if (!currentUser || (currentUser.role !== 'Admin' && currentUser.role !== 'HR')) {
      window.location.href = '/';
    }
  }, [currentUser]);

  // Load upload history on mount
  useEffect(() => {
    loadUploadHistory();
  }, []);

  const loadUploadHistory = async () => {
    try {
      const celebrationsUpload = await dataManager.getMetadata('celebrations_upload');
      const timesheetsUpload = await dataManager.getMetadata('timesheets_upload');
      
      setUploadHistory({
        celebrations: celebrationsUpload,
        timesheets: timesheetsUpload
      });
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  // ==========================================
  // CELEBRATIONS HANDLERS
  // ==========================================

  const handleCelebrationsFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setCelebrationsFile(file);
    setCelebrationsLoading(true);
    setCelebrationsStatus('');

    try {
      const text = await file.text();
      const parsed = dataManager.parseCSV(text);
      setCelebrationsData(parsed);
    } catch (error) {
      setCelebrationsStatus(`error:Failed to parse CSV: ${error.message}`);
      setCelebrationsData(null);
    } finally {
      setCelebrationsLoading(false);
    }
  };

  const handleCelebrationsUpload = async () => {
    if (!celebrationsData) return;

    setCelebrationsLoading(true);
    setCelebrationsStatus('');

    try {
      const csvText = celebrationsDataToCSV(celebrationsData);
      const result = await dataManager.importCelebrationsCSV(csvText, currentUser.email);

      if (result.success) {
        let message = `success:✅ Successfully imported ${result.imported} employees!`;
        if (result.errors.length > 0) {
          message += `\n\nWarnings:\n${result.errors.join('\n')}`;
        }
        setCelebrationsStatus(message);
        loadUploadHistory();
        
        // Clear form after 2 seconds
        setTimeout(() => {
          handleCelebrationsClear();
        }, 2000);
      } else {
        setCelebrationsStatus(`error:❌ Import failed: ${result.error}\n\n${result.errors.join('\n')}`);
      }
    } catch (error) {
      setCelebrationsStatus(`error:❌ Upload failed: ${error.message}`);
    } finally {
      setCelebrationsLoading(false);
    }
  };

  const handleCelebrationsClear = () => {
    setCelebrationsFile(null);
    setCelebrationsData(null);
    setCelebrationsStatus('');
    // Reset file input
    const fileInput = document.getElementById('celebrationsFileInput');
    if (fileInput) fileInput.value = '';
  };

  // ==========================================
  // TIMESHEETS HANDLERS
  // ==========================================

  const handleTimesheetsFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setTimesheetsFile(file);
    setTimesheetsLoading(true);
    setTimesheetsStatus('');

    try {
      const text = await file.text();
      const parsed = dataManager.parseCSV(text);
      setTimesheetsData(parsed);
    } catch (error) {
      setTimesheetsStatus(`error:Failed to parse CSV: ${error.message}`);
      setTimesheetsData(null);
    } finally {
      setTimesheetsLoading(false);
    }
  };

  const handleTimesheetsUpload = async () => {
    if (!timesheetsData) return;

    // Check if employees exist
    const hasData = await dataManager.hasData();
    if (!hasData) {
      setTimesheetsStatus('error:❌ Please upload Celebrations CSV first to create employee records!');
      return;
    }

    setTimesheetsLoading(true);
    setTimesheetsStatus('');

    try {
      const csvText = timesheetsDataToCSV(timesheetsData);
      const result = await dataManager.importTimesheetsCSV(csvText, currentUser.email);

      if (result.success) {
        let message = `success:✅ Successfully updated ${result.updated} timesheets!`;
        if (result.notFound.length > 0) {
          message += `\n\nNot Found:\n${result.notFound.join('\n')}`;
        }
        if (result.errors.length > 0) {
          message += `\n\nErrors:\n${result.errors.join('\n')}`;
        }
        setTimesheetsStatus(message);
        loadUploadHistory();
        
        // Clear form after 2 seconds
        setTimeout(() => {
          handleTimesheetsClear();
        }, 2000);
      } else {
        setTimesheetsStatus(`error:❌ Import failed: ${result.error}\n\n${result.errors.join('\n')}`);
      }
    } catch (error) {
      setTimesheetsStatus(`error:❌ Upload failed: ${error.message}`);
    } finally {
      setTimesheetsLoading(false);
    }
  };

  const handleTimesheetsClear = () => {
    setTimesheetsFile(null);
    setTimesheetsData(null);
    setTimesheetsStatus('');
    // Reset file input
    const fileInput = document.getElementById('timesheetsFileInput');
    if (fileInput) fileInput.value = '';
  };

  // ==========================================
  // HELPER FUNCTIONS
  // ==========================================

  const celebrationsDataToCSV = (data) => {
    const headers = Object.keys(data[0]);
    let csv = headers.join(',') + '\n';
    data.forEach(row => {
      csv += headers.map(h => row[h] || '').join(',') + '\n';
    });
    return csv;
  };

  const timesheetsDataToCSV = (data) => {
    const headers = Object.keys(data[0]);
    let csv = headers.join(',') + '\n';
    data.forEach(row => {
      csv += headers.map(h => row[h] || '').join(',') + '\n';
    });
    return csv;
  };

  const renderPreview = (data) => {
    if (!data || data.length === 0) return null;

    const preview = data.slice(0, 5);
    const headers = Object.keys(preview[0]);

    return (
      <div className="preview-section">
        <h3>Preview (First 5 rows)</h3>
        <div style={{ overflowX: 'auto' }}>
          <table className="preview-table">
            <thead>
              <tr>
                {headers.map(header => (
                  <th key={header}>
                    {header.charAt(0).toUpperCase() + header.slice(1)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {preview.map((row, idx) => (
                <tr key={idx}>
                  {headers.map(header => (
                    <td key={header}>{row[header] || '-'}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderStatus = (status) => {
    if (!status) return null;

    const [type, ...messageParts] = status.split(':');
    const message = messageParts.join(':');
    const className = type === 'success' ? 'alert-success' : 
                     type === 'error' ? 'alert-error' : 'alert-warning';

    return (
      <div className="status-section">
        <div className={`alert ${className}`}>
          {message.split('\n').map((line, idx) => (
            <div key={idx}>{line}</div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="admin-upload-page">
      <header className="page-header">
        <h1>📤 Data Upload</h1>
        <p>Import employee data from CSV files</p>
      </header>

      <div className="upload-container">
        {/* Celebrations Upload */}
        <div className="upload-card">
          <h2>
            <i className="fas fa-birthday-cake"></i>
            Celebrations Data
          </h2>
          <p className="description">Upload employee birthdays and work anniversaries</p>
          
          <div className="format-info">
            <strong>Required CSV Format:</strong>
            <code>Name, Email, Birthday, Work Anniversary, Department</code><br />
            <strong>Date Format:</strong> DD/MM/YY (e.g., 20/05/90, 15/01/23)
          </div>

          <div className="file-input-wrapper">
            <input
              type="file"
              id="celebrationsFileInput"
              accept=".csv"
              onChange={handleCelebrationsFileChange}
              style={{ display: 'none' }}
            />
            <label
              htmlFor="celebrationsFileInput"
              className={`file-input-label ${celebrationsFile ? 'file-selected' : ''}`}
            >
              <i className="fas fa-cloud-upload-alt"></i>
              <div>{celebrationsFile ? celebrationsFile.name : 'Click or drag to upload Celebrations CSV'}</div>
            </label>
          </div>

          {renderPreview(celebrationsData)}

          <div className="upload-actions">
            <button
              className="btn btn-primary"
              onClick={handleCelebrationsUpload}
              disabled={!celebrationsData || celebrationsLoading}
            >
              {celebrationsLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Uploading...
                </>
              ) : (
                <>
                  <i className="fas fa-upload"></i> Upload Celebrations
                </>
              )}
            </button>
            <button
              className="btn btn-secondary"
              onClick={handleCelebrationsClear}
              disabled={celebrationsLoading}
            >
              <i className="fas fa-times"></i> Clear
            </button>
          </div>

          {renderStatus(celebrationsStatus)}
        </div>

        {/* Timesheets Upload */}
        <div className="upload-card">
          <h2>
            <i className="fas fa-clock"></i>
            Timesheets Data
          </h2>
          <p className="description">Upload timesheet links for employees</p>
          
          <div className="format-info">
            <strong>Required CSV Format:</strong>
            <code>Name, Email, Timesheet Link</code><br />
            <strong>Note:</strong> Upload Celebrations CSV first to create employee records
          </div>

          <div className="file-input-wrapper">
            <input
              type="file"
              id="timesheetsFileInput"
              accept=".csv"
              onChange={handleTimesheetsFileChange}
              style={{ display: 'none' }}
            />
            <label
              htmlFor="timesheetsFileInput"
              className={`file-input-label ${timesheetsFile ? 'file-selected' : ''}`}
            >
              <i className="fas fa-cloud-upload-alt"></i>
              <div>{timesheetsFile ? timesheetsFile.name : 'Click or drag to upload Timesheets CSV'}</div>
            </label>
          </div>

          {renderPreview(timesheetsData)}

          <div className="upload-actions">
            <button
              className="btn btn-primary"
              onClick={handleTimesheetsUpload}
              disabled={!timesheetsData || timesheetsLoading}
            >
              {timesheetsLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Uploading...
                </>
              ) : (
                <>
                  <i className="fas fa-upload"></i> Upload Timesheets
                </>
              )}
            </button>
            <button
              className="btn btn-secondary"
              onClick={handleTimesheetsClear}
              disabled={timesheetsLoading}
            >
              <i className="fas fa-times"></i> Clear
            </button>
          </div>

          {renderStatus(timesheetsStatus)}
        </div>

        {/* Upload History */}
        <div className="upload-card upload-history">
          <h2>
            <i className="fas fa-history"></i>
            Upload History
          </h2>
          
          {!uploadHistory.celebrations && !uploadHistory.timesheets ? (
            <p style={{ color: '#64748b' }}>No uploads yet</p>
          ) : (
            <div>
              {uploadHistory.celebrations && (
                <div className="history-item">
                  <div className="history-info">
                    <strong>Celebrations Data</strong>
                    <span>
                      Uploaded by {uploadHistory.celebrations.uploadedBy} on{' '}
                      {new Date(uploadHistory.celebrations.uploadedAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="history-badge">{uploadHistory.celebrations.rowCount} records</div>
                </div>
              )}

              {uploadHistory.timesheets && (
                <div className="history-item">
                  <div className="history-info">
                    <strong>Timesheets Data</strong>
                    <span>
                      Uploaded by {uploadHistory.timesheets.uploadedBy} on{' '}
                      {new Date(uploadHistory.timesheets.uploadedAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="history-badge">{uploadHistory.timesheets.rowCount} records</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}