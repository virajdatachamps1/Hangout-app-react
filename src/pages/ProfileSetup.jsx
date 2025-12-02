// src/pages/ProfileSetup.jsx
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate } from 'react-router-dom';

function ProfileSetup() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('employee');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userRef = doc(db, 'users', currentUser.email);
      await updateDoc(userRef, {
        role: role,
        profileCompleted: true
      });
      
      navigate('/');
    } catch (error) {
      alert('Error updating profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '16px',
        maxWidth: '400px',
        width: '100%'
      }}>
        <h2 style={{ marginBottom: '20px' }}>Complete Your Profile</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              Your Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            >
              <option value="employee">Employee</option>
              <option value="hr">HR</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              background: '#4f46e5',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            {loading ? 'Saving...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ProfileSetup;