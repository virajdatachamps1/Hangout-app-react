// src/pages/Photos.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db, storage } from '../firebase';
import { collection, addDoc, query, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { Image, Upload, X, Trash2 } from 'lucide-react';

function Photos() {
  const { userData } = useAuth();
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState([]);

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    const q = query(collection(db, 'photos'), orderBy('uploadedAt', 'desc'));
    const snapshot = await getDocs(q);
    setPhotos(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (files.length === 0) return;

    setUploading(true);
    try {
      for (const file of files) {
        const storageRef = ref(storage, `photos/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        const imageUrl = await getDownloadURL(storageRef);

        await addDoc(collection(db, 'photos'), {
          title: title || file.name,
          description,
          imageUrl,
          fileName: file.name,
          uploadedBy: userData.email,
          uploadedByName: userData.name,
          uploadedAt: new Date()
        });
      }

      alert(`✅ ${files.length} photos uploaded!`);
      setShowUploadModal(false);
      setTitle('');
      setDescription('');
      setFiles([]);
      loadPhotos();
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (photo) => {
    if (!confirm('Delete this photo?')) return;
    
    try {
      // Delete from Storage
      const storageRef = ref(storage, photo.imageUrl);
      await deleteObject(storageRef);
      
      // Delete from Firestore
      await deleteDoc(doc(db, 'photos', photo.id));
      
      alert('✅ Photo deleted!');
      loadPhotos();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        background: 'white',
        padding: '32px',
        borderRadius: '24px',
        marginBottom: '32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>📸 Photos</h1>
          <p style={{ color: '#666' }}>Team memories and events</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          style={{
            padding: '14px 28px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            borderRadius: '12px',
            color: 'white',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Upload size={20} />
          Upload Photo
        </button>
      </div>

      {/* Photos Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px'
      }}>
        {photos.map(photo => (
          <div key={photo.id} style={{
            background: 'white',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            position: 'relative'
          }}>
            {userData?.email === photo.uploadedBy && (
              <button
                onClick={() => handleDelete(photo)}
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  background: 'rgba(239, 68, 68, 0.9)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 1
                }}
              >
                <Trash2 size={16} color="white" />
              </button>
            )}
            <img
              src={photo.imageUrl}
              alt={photo.title}
              style={{ width: '100%', height: '200px', objectFit: 'cover' }}
            />
            <div style={{ padding: '16px' }}>
              <h3 style={{ marginBottom: '8px' }}>{photo.title}</h3>
              <p style={{ fontSize: '14px', color: '#666', marginBottom: '12px' }}>
                {photo.description}
              </p>
              <div style={{ fontSize: '12px', color: '#999' }}>
                By {photo.uploadedByName}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}
        onClick={() => setShowUploadModal(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '500px',
              width: '90%'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2>Upload Photo</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleUpload}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setFiles(Array.from(e.target.files))}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px'
                  }}
                />
                {files.length > 0 && (
                  <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
                    {files.length} file(s) selected
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={uploading}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: '#4f46e5',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Photos;