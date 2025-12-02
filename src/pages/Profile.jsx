// src/pages/Profile.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { User, Mail, Briefcase, Calendar, Shield, Edit2, Save, X, Camera } from 'lucide-react';

function Profile() {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, [currentUser]);

  const fetchUserData = async () => {
    if (!currentUser) return;
    
    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.email.toLowerCase()));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserData(data);
        setEditedData(data);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size should be less than 5MB');
      return;
    }

    setUploadingPhoto(true);
    try {
      const photoRef = ref(storage, `profile-photos/${currentUser.email}`);
      await uploadBytes(photoRef, file);
      const photoURL = await getDownloadURL(photoRef);

      await updateDoc(doc(db, 'users', currentUser.email.toLowerCase()), {
        photoURL
      });

      setUserData(prev => ({ ...prev, photoURL }));
      setEditedData(prev => ({ ...prev, photoURL }));
      alert('✅ Photo updated!');
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', currentUser.email.toLowerCase()), {
        name: editedData.name || '',
        phone: editedData.phone || '',
        department: editedData.department || '',
        bio: editedData.bio || ''
      });

      setUserData(editedData);
      setIsEditing(false);
      alert('✅ Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedData(userData);
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  const getRoleBadgeColor = (role) => {
    switch(role) {
      case 'admin': return '#ef4444';
      case 'hr': return '#f59e0b';
      default: return '#10b981';
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '16px',
        padding: '48px 32px',
        marginBottom: '32px',
        color: 'white',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ fontSize: '36px', fontWeight: '700', margin: 0 }}>My Profile</h1>
        <p style={{ margin: '8px 0 0 0', opacity: 0.9, fontSize: '16px' }}>Manage your personal information</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px' }}>
        {/* Profile Photo Card */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '32px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          textAlign: 'center',
          height: 'fit-content'
        }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <div style={{
              width: '150px',
              height: '150px',
              borderRadius: '50%',
              background: userData?.photoURL 
                ? `url(${userData.photoURL})` 
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              fontSize: '48px',
              color: 'white',
              fontWeight: '700',
              border: '4px solid white',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
            }}>
              {!userData?.photoURL && (userData?.name?.[0] || 'U').toUpperCase()}
            </div>
            
            <label style={{
              position: 'absolute',
              bottom: '0',
              right: '0',
              background: '#667eea',
              borderRadius: '50%',
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              border: '4px solid white',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <Camera size={20} color="white" />
              <input 
                type="file" 
                accept="image/*" 
                onChange={handlePhotoUpload}
                style={{ display: 'none' }}
                disabled={uploadingPhoto}
              />
            </label>
          </div>

          {uploadingPhoto && (
            <p style={{ marginTop: '16px', color: '#666', fontSize: '14px' }}>
              Uploading...
            </p>
          )}

          <h2 style={{ 
            marginTop: '24px', 
            fontSize: '24px', 
            color: '#111',
            fontWeight: '700'
          }}>
            {userData?.name || 'User'}
          </h2>

          <div style={{
            display: 'inline-block',
            padding: '6px 16px',
            borderRadius: '20px',
            background: getRoleBadgeColor(userData?.role),
            color: 'white',
            fontSize: '13px',
            fontWeight: '600',
            marginTop: '8px',
            textTransform: 'capitalize'
          }}>
            {userData?.role || 'employee'}
          </div>

          <div style={{
            marginTop: '32px',
            padding: '20px',
            background: '#fafafa',
            borderRadius: '16px',
            textAlign: 'left'
          }}>
            <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Mail size={18} color="#667eea" />
              <span style={{ fontSize: '14px', color: '#666', wordBreak: 'break-all' }}>
                {userData?.email}
              </span>
            </div>
            {userData?.department && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Briefcase size={18} color="#667eea" />
                <span style={{ fontSize: '14px', color: '#666' }}>
                  {userData.department}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Profile Details Card */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '32px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#111' }}>
              Personal Information
            </h3>
            
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: '600',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.target.style.background = '#5568d3'}
                onMouseOut={(e) => e.target.style.background = '#667eea'}
              >
                <Edit2 size={18} />
                Edit Profile
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={handleCancel}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 24px',
                    background: '#f5f5f5',
                    color: '#666',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontSize: '15px',
                    fontWeight: '600'
                  }}
                >
                  <X size={18} />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 24px',
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    fontSize: '15px',
                    fontWeight: '600',
                    opacity: saving ? 0.7 : 1
                  }}
                >
                  <Save size={18} />
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gap: '24px' }}>
            {/* Full Name */}
            <div>
              <label style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#666',
                marginBottom: '8px'
              }}>
                <User size={16} />
                Full Name
              </label>
              <input
                type="text"
                value={editedData?.name || ''}
                onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
                disabled={!isEditing}
                style={{
                  width: '100%',
                  padding: '14px',
                  fontSize: '15px',
                  border: '2px solid #f0f0f0',
                  borderRadius: '12px',
                  background: isEditing ? 'white' : '#fafafa',
                  color: '#111',
                  cursor: isEditing ? 'text' : 'not-allowed',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => isEditing && (e.target.style.borderColor = '#667eea')}
                onBlur={(e) => e.target.style.borderColor = '#f0f0f0'}
              />
            </div>

            {/* Email (Read-only) */}
            <div>
              <label style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#666',
                marginBottom: '8px'
              }}>
                <Mail size={16} />
                Email Address
              </label>
              <input
                type="email"
                value={userData?.email || ''}
                disabled
                style={{
                  width: '100%',
                  padding: '14px',
                  fontSize: '15px',
                  border: '2px solid #f0f0f0',
                  borderRadius: '12px',
                  background: '#fafafa',
                  color: '#999',
                  cursor: 'not-allowed'
                }}
              />
            </div>

            {/* Phone */}
            <div>
              <label style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#666',
                marginBottom: '8px'
              }}>
                <Calendar size={16} />
                Phone Number
              </label>
              <input
                type="tel"
                value={editedData?.phone || ''}
                onChange={(e) => setEditedData({ ...editedData, phone: e.target.value })}
                disabled={!isEditing}
                placeholder="Enter phone number"
                style={{
                  width: '100%',
                  padding: '14px',
                  fontSize: '15px',
                  border: '2px solid #f0f0f0',
                  borderRadius: '12px',
                  background: isEditing ? 'white' : '#fafafa',
                  color: '#111',
                  cursor: isEditing ? 'text' : 'not-allowed',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => isEditing && (e.target.style.borderColor = '#667eea')}
                onBlur={(e) => e.target.style.borderColor = '#f0f0f0'}
              />
            </div>

            {/* Department */}
            <div>
              <label style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#666',
                marginBottom: '8px'
              }}>
                <Briefcase size={16} />
                Department
              </label>
              <input
                type="text"
                value={editedData?.department || ''}
                onChange={(e) => setEditedData({ ...editedData, department: e.target.value })}
                disabled={!isEditing}
                placeholder="Enter department"
                style={{
                  width: '100%',
                  padding: '14px',
                  fontSize: '15px',
                  border: '2px solid #f0f0f0',
                  borderRadius: '12px',
                  background: isEditing ? 'white' : '#fafafa',
                  color: '#111',
                  cursor: isEditing ? 'text' : 'not-allowed',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => isEditing && (e.target.style.borderColor = '#667eea')}
                onBlur={(e) => e.target.style.borderColor = '#f0f0f0'}
              />
            </div>

            {/* Bio */}
            <div>
              <label style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#666',
                marginBottom: '8px'
              }}>
                <Edit2 size={16} />
                Bio
              </label>
              <textarea
                value={editedData?.bio || ''}
                onChange={(e) => setEditedData({ ...editedData, bio: e.target.value })}
                disabled={!isEditing}
                placeholder="Tell us about yourself..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '14px',
                  fontSize: '15px',
                  border: '2px solid #f0f0f0',
                  borderRadius: '12px',
                  background: isEditing ? 'white' : '#fafafa',
                  color: '#111',
                  cursor: isEditing ? 'text' : 'not-allowed',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => isEditing && (e.target.style.borderColor = '#667eea')}
                onBlur={(e) => e.target.style.borderColor = '#f0f0f0'}
              />
            </div>

            {/* Role Badge (Read-only) */}
            <div>
              <label style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#666',
                marginBottom: '8px'
              }}>
                <Shield size={16} />
                Account Role
              </label>
              <div style={{
                padding: '14px',
                background: '#fafafa',
                borderRadius: '12px',
                fontSize: '15px',
                color: '#111',
                textTransform: 'capitalize',
                fontWeight: '600'
              }}>
                {userData?.role || 'employee'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;