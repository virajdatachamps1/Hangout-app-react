// src/pages/Timesheets.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Clock, Calendar, ExternalLink, AlertCircle } from 'lucide-react';

function Timesheets() {
  const { currentUser, userData } = useAuth();
  const [timesheetLink, setTimesheetLink] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimesheetLink();
  }, [currentUser]);

  const fetchTimesheetLink = async () => {
    if (!currentUser) return;
    
    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.email.toLowerCase()));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setTimesheetLink(data.timesheetLink || null);
      }
    } catch (error) {
      console.error('Error fetching timesheet:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '48px 32px',
        borderRadius: '24px',
        marginBottom: '32px',
        color: 'white',
        boxShadow: '0 20px 60px rgba(102, 126, 234, 0.3)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          fontSize: '180px',
          opacity: 0.08
        }}>
          ⏱️
        </div>

        <div style={{ position: 'relative' }}>
          <h1 style={{ fontSize: '36px', marginBottom: '12px', fontWeight: '700' }}>
            My Timesheet
          </h1>
          <p style={{ fontSize: '16px', opacity: 0.95 }}>
            Track your work hours and activities
          </p>
        </div>
      </div>
    
      {/* Main Content */}
      {!timesheetLink ? (
        <div style={{
          background: 'white',
          padding: '60px 40px',
          borderRadius: '24px',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)'
        }}>
          <AlertCircle size={64} color="#f59e0b" style={{ marginBottom: '24px' }} />
          <h2 style={{ fontSize: '24px', marginBottom: '12px', fontWeight: '600' }}>
            No Timesheet Link Available
          </h2>
          <p style={{ color: '#666', fontSize: '16px', marginBottom: '24px' }}>
            Your timesheet link hasn't been set up yet. Please contact HR or Admin.
          </p>
          <div style={{
            display: 'inline-block',
            padding: '16px 24px',
            background: '#fef3c7',
            borderRadius: '12px',
            fontSize: '14px',
            color: '#92400e'
          }}>
            <strong>Note:</strong> Once your timesheet is configured, you'll be able to access it directly from here.
          </div>
        </div>
      ) : (
        <div style={{
          background: 'white',
          padding: '40px',
          borderRadius: '24px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)'
        }}>
          {/* Info Card */}
          <div style={{
            background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)',
            padding: '32px',
            borderRadius: '20px',
            marginBottom: '32px',
            display: 'flex',
            alignItems: 'center',
            gap: '24px'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Clock size={40} color="white" />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '8px' }}>
                Your Timesheet
              </h3>
              <p style={{ fontSize: '15px', color: '#666', lineHeight: '1.6' }}>
                Click the button below to access your personal timesheet. Make sure to log your hours regularly to keep track of your work activities.
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '20px',
            marginBottom: '32px'
          }}>
            <div style={{
              padding: '24px',
              background: '#f0fdf4',
              borderRadius: '16px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', fontWeight: '800', color: '#10b981', marginBottom: '8px' }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
              </div>
              <div style={{ fontSize: '14px', color: '#666', fontWeight: '600' }}>
                Today
              </div>
            </div>

            <div style={{
              padding: '24px',
              background: '#eff6ff',
              borderRadius: '16px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', fontWeight: '800', color: '#3b82f6', marginBottom: '8px' }}>
                {new Date().toLocaleDateString('en-US', { month: 'short' })}
              </div>
              <div style={{ fontSize: '14px', color: '#666', fontWeight: '600' }}>
                Current Month
              </div>
            </div>

            <div style={{
              padding: '24px',
              background: '#fef3c7',
              borderRadius: '16px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', fontWeight: '800', color: '#f59e0b', marginBottom: '8px' }}>
                {userData?.name?.split(' ')[0] || 'User'}
              </div>
              <div style={{ fontSize: '14px', color: '#666', fontWeight: '600' }}>
                Your Account
              </div>
            </div>
          </div>

          {/* Access Button */}
          <div style={{ textAlign: 'center' }}>
            <a
              href={timesheetLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                padding: '18px 40px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                borderRadius: '14px',
                fontSize: '18px',
                fontWeight: '700',
                textDecoration: 'none',
                boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
                transition: 'all 0.3s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(102, 126, 234, 0.5)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(102, 126, 234, 0.4)';
              }}
            >
              <Clock size={24} />
              Open My Timesheet
              <ExternalLink size={20} />
            </a>
          </div>

          {/* Help Section */}
          <div style={{
            marginTop: '32px',
            padding: '24px',
            background: '#fafafa',
            borderRadius: '16px',
            border: '2px solid #f0f0f0'
          }}>
            <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={20} color="#667eea" />
              Quick Tips
            </h4>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#666', fontSize: '14px', lineHeight: '2' }}>
              <li>Log your hours daily for accurate tracking</li>
              <li>Include detailed descriptions of your tasks</li>
              <li>Submit your timesheet by the end of each week</li>
              <li>Contact HR if you need to make corrections</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default Timesheets;