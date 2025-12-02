import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { ExternalLink, Save, Settings } from 'lucide-react';

function TimesheetLink() {
  const { currentUser } = useAuth();
  const [timesheetLink, setTimesheetLink] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadTimesheetLink();
  }, [currentUser]);

  const loadTimesheetLink = async () => {
    if (!currentUser?.email) return;
    try {
      const docRef = doc(db, 'user_timesheets', currentUser.email);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setTimesheetLink(docSnap.data().link || '');
      }
    } catch (error) {
      console.error('Error loading timesheet link:', error);
    }
  };

  const saveTimesheetLink = async () => {
    if (!timesheetLink.trim()) return;
    setSaving(true);
    try {
      const docRef = doc(db, 'user_timesheets', currentUser.email);
      await setDoc(docRef, {
        email: currentUser.email,
        link: timesheetLink,
        updatedAt: new Date()
      });
      alert('✅ Timesheet link saved!');
    } catch (error) {
      alert('Error saving link: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px' }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ fontSize: '28px', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Settings size={32} color="#4f46e5" />
          My Timesheet Link
        </h1>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            Timesheet URL
          </label>
          <input
            type="url"
            placeholder="https://your-timesheet-url.com"
            value={timesheetLink}
            onChange={(e) => setTimesheetLink(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              marginBottom: '20px'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '30px' }}>
          <button
            onClick={saveTimesheetLink}
            disabled={saving || !timesheetLink.trim()}
            style={{
              flex: 1,
              padding: '14px',
              background: '#4f46e5',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <Save size={20} />
            {saving ? 'Saving...' : 'Save Link'}
          </button>
          
          {timesheetLink && (
            <a
              href={timesheetLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                flex: 1,
                padding: '14px',
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                textDecoration: 'none'
              }}
            >
              <ExternalLink size={20} />
              Open Timesheet
            </a>
          )}
        </div>

        <div style={{ 
          padding: '20px', 
          background: '#f0f9ff', 
          borderRadius: '8px',
          fontSize: '14px',
          color: '#0369a1'
        }}>
          <strong>💡 Tip:</strong> Add your Google Sheets, Excel Online, or any timesheet tool URL here for quick access.
        </div>
      </div>
    </div>
  );
}

export default TimesheetLink;