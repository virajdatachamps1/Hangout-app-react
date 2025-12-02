import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';
import { storage, db } from '../firebase';
import { Upload, FileText } from 'lucide-react';

function FileUpload() {
  const { currentUser } = useAuth();
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !title || !category) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `sops/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const fileUrl = await getDownloadURL(storageRef);

      await addDoc(collection(db, 'sops'), {
        title,
        category,
        fileUrl,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        uploadedBy: currentUser.email,
        uploadedAt: new Date()
      });

      alert('✅ File uploaded!');
      setFile(null);
      setTitle('');
      setCategory('');
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px' }}>
      <h1 style={{ marginBottom: '30px' }}>📁 Upload SOPs & Policies</h1>
      
      <form onSubmit={handleUpload} style={{ background: 'white', padding: '30px', borderRadius: '12px' }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ width: '100%', padding: '12px', border: '2px solid #e0e0e0', borderRadius: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            style={{ width: '100%', padding: '12px', border: '2px solid #e0e0e0', borderRadius: '8px' }}
          >
            <option value="">Select category</option>
            <option value="HR">HR</option>
            <option value="IT">IT</option>
            <option value="Operations">Operations</option>
            <option value="Finance">Finance</option>
          </select>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>File</label>
          <input
            type="file"
            accept=".pdf,.docx,.xlsx"
            onChange={(e) => setFile(e.target.files[0])}
            required
            style={{ width: '100%', padding: '12px', border: '2px solid #e0e0e0', borderRadius: '8px' }}
          />
        </div>

        <button
          type="submit"
          disabled={uploading || !file || !title || !category}
          style={{
            width: '100%',
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
          <Upload size={20} />
          {uploading ? 'Uploading...' : 'Upload File'}
        </button>
      </form>
    </div>
  );
}

export default FileUpload;