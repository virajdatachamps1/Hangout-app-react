import { FileText, Upload, Download, Eye, Search, Plus, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import firestoreService from '../utils/firestoreService';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

function SOPs() {
  const { currentUser, isAdmin, isSenior } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [newSOP, setNewSOP] = useState({
    title: '',
    category: 'Operational SOPs & Work Guidelines',
    description: '',
    version: '1.0',
    file: null
  });

  const canUpload = isAdmin || isSenior;
  const categories = ['all', 'Operational SOPs & Work Guidelines', 'HR Policies & People Guidelines', 'Compliance, Security & Legal Policies'];

  useEffect(() => {
    loadSOPs();
  }, []);

  const loadSOPs = async () => {
    try {
      setLoading(true);
      const data = await firestoreService.sops.getAll();
      setDocuments(data);
    } catch (error) {
      console.error('Error loading SOPs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        alert('Only PDF and DOCX files are allowed');
        return;
      }
      
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      
      setNewSOP({...newSOP, file});
    }
  };

  const handleUpload = async () => {
    if (!newSOP.title || !newSOP.description || !newSOP.file) {
      alert('Please fill in all fields and select a file');
      return;
    }

    try {
      setUploading(true);

      // Upload file to Firebase Storage
      const fileExtension = newSOP.file.name.split('.').pop();
      const fileName = `sops/${Date.now()}_${newSOP.title.replace(/[^a-z0-9]/gi, '_')}.${fileExtension}`;
      const storageRef = ref(storage, fileName);
      
      await uploadBytes(storageRef, newSOP.file);
      const fileURL = await getDownloadURL(storageRef);

      // Get file size
      const fileSize = (newSOP.file.size / (1024 * 1024)).toFixed(2) + ' MB';

      // Create SOP document in Firestore
      await firestoreService.sops.create({
        title: newSOP.title,
        category: newSOP.category,
        description: newSOP.description,
        version: newSOP.version,
        fileURL: fileURL,
        fileName: newSOP.file.name,
        fileSize: fileSize,
        author: currentUser.displayName || currentUser.email,
        authorEmail: currentUser.email
      });

      // Reset form and close modal
      setNewSOP({
        title: '',
        category: 'HR',
        description: '',
        version: '1.0',
        file: null
      });
      setShowUploadModal(false);
      
      // Reload SOPs
      loadSOPs();
    } catch (error) {
      console.error('Error uploading SOP:', error);
      alert('Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const handleView = async (doc) => {
    try {
      // Increment view count
      await firestoreService.sops.incrementViews(doc.id);
      // Open document in new tab
      window.open(doc.fileURL, '_blank');
    } catch (error) {
      console.error('Error viewing document:', error);
    }
  };

  const handleDownload = async (doc) => {
    try {
      const link = document.createElement('a');
      link.href = doc.fileURL;
      link.download = doc.fileName;
      link.click();
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category) => {
    const colors = {
      'Operational SOPs & Work Guidelines': '#10b981',
      'HR Policies & People Guidelines': '#ec4899',
      'Compliance, Security & Legal Policies': '#3b82f6'
    };
    return colors[category] || '#6b7280';
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        background: 'white',
        padding: '32px',
        borderRadius: '24px',
        marginBottom: '32px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
        border: '1px solid rgba(0, 0, 0, 0.04)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h1 style={{ fontSize: '32px', marginBottom: '8px', fontWeight: '700' }}>
              📚 SOPs & Policies
            </h1>
            <p style={{ fontSize: '16px', color: '#666' }}>
              Access and manage standard operating procedures
            </p>
          </div>
          {canUpload && (
            <button
              onClick={() => setShowUploadModal(true)}
              style={{
                padding: '14px 28px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
              }}
            >
              <Upload size={20} />
              Upload Document
            </button>
          )}
        </div>
      </div>

      {/* Search and Filter */}
      <div style={{
        background: 'white',
        padding: '24px',
        borderRadius: '20px',
        marginBottom: '24px',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
        display: 'flex',
        gap: '16px',
        flexWrap: 'wrap'
      }}>
        <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
          <Search 
            size={20} 
            style={{ 
              position: 'absolute', 
              left: '14px', 
              top: '50%', 
              transform: 'translateY(-50%)',
              color: '#999'
            }} 
          />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 14px 14px 46px',
              border: '2px solid #f0f0f0',
              borderRadius: '12px',
              fontSize: '15px',
              transition: 'border 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#667eea'}
            onBlur={(e) => e.target.style.borderColor = '#f0f0f0'}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              style={{
                padding: '12px 20px',
                background: selectedCategory === category ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f5f5f5',
                border: 'none',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                color: selectedCategory === category ? 'white' : '#666',
                transition: 'all 0.2s',
                textTransform: 'capitalize'
              }}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
        {filteredDocuments.length === 0 ? (
          <div style={{
            gridColumn: '1 / -1',
            textAlign: 'center',
            padding: '60px 20px',
            color: '#999'
          }}>
            <FileText size={64} style={{ opacity: 0.3, marginBottom: '16px' }} />
            <p style={{ fontSize: '16px' }}>No documents found</p>
          </div>
        ) : (
          filteredDocuments.map(doc => (
            <div 
              key={doc.id}
              style={{
                background: 'white',
                padding: '28px',
                borderRadius: '20px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
                border: '1px solid rgba(0, 0, 0, 0.04)',
                transition: 'all 0.2s',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.12)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.06)';
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'start', gap: '16px', marginBottom: '20px' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  background: `${getCategoryColor(doc.category)}15`,
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <FileText size={28} color={getCategoryColor(doc.category)} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    background: `${getCategoryColor(doc.category)}15`,
                    color: getCategoryColor(doc.category),
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '700',
                    marginBottom: '10px'
                  }}>
                    {doc.category}
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px', lineHeight: '1.3' }}>
                    {doc.title}
                  </h3>
                </div>
              </div>

              {/* Description */}
              <p style={{
                fontSize: '14px',
                color: '#666',
                lineHeight: '1.6',
                marginBottom: '20px',
                minHeight: '40px'
              }}>
                {doc.description}
              </p>

              {/* Metadata */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                padding: '16px',
                background: '#fafafa',
                borderRadius: '12px',
                marginBottom: '16px',
                fontSize: '13px'
              }}>
                <div>
                  <div style={{ color: '#999', marginBottom: '4px' }}>Version</div>
                  <div style={{ fontWeight: '700' }}>v{doc.version}</div>
                </div>
                <div>
                  <div style={{ color: '#999', marginBottom: '4px' }}>Size</div>
                  <div style={{ fontWeight: '700' }}>{doc.fileSize}</div>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={{ color: '#999', marginBottom: '4px' }}>Last Updated</div>
                  <div style={{ fontWeight: '700' }}>
                    {firestoreService.formatDate(doc.lastUpdated)}
                  </div>
                </div>
                {doc.views > 0 && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <div style={{ color: '#999', marginBottom: '4px' }}>Views</div>
                    <div style={{ fontWeight: '700' }}>{doc.views}</div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={() => handleView(doc)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: `linear-gradient(135deg, ${getCategoryColor(doc.category)}, ${getCategoryColor(doc.category)}dd)`,
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <Eye size={16} />
                  View
                </button>
                <button 
                  onClick={() => handleDownload(doc)}
                  style={{
                    padding: '12px',
                    background: '#f5f5f5',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Download size={18} color="#666" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}
        onClick={() => !uploading && setShowUploadModal(false)}
        >
          <div 
            style={{
              background: 'white',
              borderRadius: '24px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              padding: '28px 32px',
              borderBottom: '1px solid #f0f0f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{ fontSize: '24px', fontWeight: '700' }}>
                Upload Document
              </h2>
              <button
                onClick={() => !uploading && setShowUploadModal(false)}
                disabled={uploading}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  border: 'none',
                  background: '#f5f5f5',
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: uploading ? 0.5 : 1
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '32px' }}>
              {/* File Upload */}
              <div style={{
                border: `3px dashed ${newSOP.file ? '#667eea' : '#e0e0e0'}`,
                borderRadius: '16px',
                padding: '48px 32px',
                textAlign: 'center',
                marginBottom: '24px',
                background: newSOP.file ? '#667eea10' : '#fafafa',
                cursor: 'pointer'
              }}
              onClick={() => document.getElementById('sopFileInput').click()}
              >
                <Upload size={48} color={newSOP.file ? '#667eea' : '#999'} style={{ marginBottom: '16px' }} />
                <p style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                  {newSOP.file ? newSOP.file.name : 'Click to upload file'}
                </p>
                <p style={{ fontSize: '14px', color: '#999' }}>
                  Supports PDF, DOCX (Max 10MB)
                </p>
                <input
                  id="sopFileInput"
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  disabled={uploading}
                />
              </div>

              {/* Form Fields */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                    Document Title
                  </label>
                  <input
                    type="text"
                    placeholder="Enter document title..."
                    value={newSOP.title}
                    onChange={(e) => setNewSOP({...newSOP, title: e.target.value})}
                    disabled={uploading}
                    style={{
                      width: '100%',
                      padding: '14px',
                      border: '2px solid #f0f0f0',
                      borderRadius: '12px',
                      fontSize: '15px'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                    Category
                  </label>
                  <select 
                    value={newSOP.category}
                    onChange={(e) => setNewSOP({...newSOP, category: e.target.value})}
                    disabled={uploading}
                    style={{
                      width: '100%',
                      padding: '14px',
                      border: '2px solid #f0f0f0',
                      borderRadius: '12px',
                      fontSize: '15px',
                      cursor: 'pointer'
                    }}
                  >
                    {categories.slice(1).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                    Description
                  </label>
                  <textarea
                    placeholder="Brief description of the document..."
                    value={newSOP.description}
                    onChange={(e) => setNewSOP({...newSOP, description: e.target.value})}
                    disabled={uploading}
                    rows="4"
                    style={{
                      width: '100%',
                      padding: '14px',
                      border: '2px solid #f0f0f0',
                      borderRadius: '12px',
                      fontSize: '15px',
                      fontFamily: 'inherit',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>
                    Version
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 1.0"
                    value={newSOP.version}
                    onChange={(e) => setNewSOP({...newSOP, version: e.target.value})}
                    disabled={uploading}
                    style={{
                      width: '100%',
                      padding: '14px',
                      border: '2px solid #f0f0f0',
                      borderRadius: '12px',
                      fontSize: '15px'
                    }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
                <button
                  onClick={() => setShowUploadModal(false)}
                  disabled={uploading}
                  style={{
                    flex: 1,
                    padding: '14px',
                    background: '#f5f5f5',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: uploading ? 'not-allowed' : 'pointer',
                    color: '#666',
                    opacity: uploading ? 0.5 : 1
                  }}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleUpload}
                  disabled={uploading}
                  style={{
                    flex: 1,
                    padding: '14px',
                    background: uploading ? '#999' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: uploading ? 'not-allowed' : 'pointer',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  {uploading ? (
                    <>
                      <div className="spinner" style={{ width: '18px', height: '18px' }}></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload size={18} />
                      Upload Document
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SOPs;