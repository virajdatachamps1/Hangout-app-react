import { useState } from 'react';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { extractTextFromPDF, chunkText } from '../services/contentExtractionService';
import { createEmbedding } from '../services/vertexAIService';
import { Upload, FileText, CheckCircle, Loader } from 'lucide-react';

function PolicyUpload() {
  const [file, setFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, status: '' });
  const [success, setSuccess] = useState(false);

  const handleProcess = async () => {
    if (!file) return;

    setProcessing(true);
    setSuccess(false);
    setProgress({ current: 0, total: 0, status: 'Extracting text...' });

    try {
      // Step 1: Extract text from PDF
      const text = await extractTextFromPDF(file);
      setProgress({ current: 1, total: 4, status: 'Text extracted ✓' });

      // Step 2: Split into chunks
      const chunks = chunkText(text, 1000, 200);
      setProgress({ current: 2, total: 4, status: `Created ${chunks.length} chunks ✓` });

      // Step 3: Create embeddings
      setProgress({ current: 3, total: 4, status: 'Creating embeddings...' });
      
      const embeddings = [];
      for (let i = 0; i < chunks.length; i++) {
        const embedding = await createEmbedding(chunks[i]);
        embeddings.push({
          content: chunks[i],
          embedding: embedding,
          chunkIndex: i
        });

        // Update progress
        setProgress({
          current: 3,
          total: 4,
          status: `Processing chunk ${i + 1}/${chunks.length}...`
        });

        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Step 4: Store in Firestore
      setProgress({ current: 4, total: 4, status: 'Saving to database...' });

      const docName = file.name.replace('.pdf', '');
      const batch = [];

      for (let i = 0; i < embeddings.length; i++) {
        const docRef = doc(collection(db, 'policy_embeddings'), `${docName}_chunk_${i}`);
        batch.push(
          setDoc(docRef, {
            source: docName,
            content: embeddings[i].content,
            embedding: embeddings[i].embedding,
            chunkIndex: embeddings[i].chunkIndex,
            createdAt: serverTimestamp()
          })
        );
      }

      await Promise.all(batch);

      setSuccess(true);
      setProgress({ current: 4, total: 4, status: `✅ Processed ${chunks.length} chunks!` });
      
      // Reset after 3 seconds
      setTimeout(() => {
        setFile(null);
        setProcessing(false);
        setSuccess(false);
      }, 3000);

    } catch (error) {
      console.error('Error processing PDF:', error);
      setProgress({ current: 0, total: 0, status: `❌ Error: ${error.message}` });
      setProcessing(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '24px' }}>
        📄 Upload Policy Documents
      </h1>

      <div style={{
        background: 'white',
        padding: '40px',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
      }}>
        {/* File Input */}
        <input
          type="file"
          accept=".pdf"
          onChange={(e) => setFile(e.target.files[0])}
          disabled={processing}
          style={{ display: 'none' }}
          id="pdf-upload"
        />
        
        <label
          htmlFor="pdf-upload"
          style={{
            display: 'block',
            padding: '60px',
            border: '3px dashed #cbd5e1',
            borderRadius: '12px',
            textAlign: 'center',
            cursor: processing ? 'not-allowed' : 'pointer',
            background: file ? '#f0f9ff' : '#fafafa',
            marginBottom: '24px',
            opacity: processing ? 0.6 : 1
          }}
        >
          <FileText size={48} color="#64748b" style={{ marginBottom: '16px' }} />
          <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
            {file ? file.name : 'Click to upload PDF'}
          </div>
          <div style={{ fontSize: '14px', color: '#64748b' }}>
            SOPs, Policies, Handbooks - Max 10MB
          </div>
        </label>

        {/* Progress */}
        {processing && (
          <div style={{
            padding: '24px',
            background: '#f0f9ff',
            borderRadius: '12px',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <Loader className="animate-spin" size={20} color="#3b82f6" />
              <span style={{ fontSize: '15px', fontWeight: '600', color: '#1e40af' }}>
                {progress.status}
              </span>
            </div>
            
            <div style={{
              height: '8px',
              background: '#dbeafe',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${(progress.current / progress.total) * 100}%`,
                background: '#3b82f6',
                transition: 'width 0.5s'
              }} />
            </div>
          </div>
        )}

        {/* Success */}
        {success && (
          <div style={{
            padding: '16px',
            background: '#d1fae5',
            border: '1px solid #10b981',
            borderRadius: '8px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <CheckCircle size={20} color="#10b981" />
            <span style={{ color: '#065f46', fontWeight: '600' }}>
              Document processed and ready for chatbot!
            </span>
          </div>
        )}

        {/* Process Button */}
        <button
          onClick={handleProcess}
          disabled={!file || processing}
          style={{
            width: '100%',
            padding: '16px',
            background: file && !processing ? '#4f46e5' : '#cbd5e1',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: file && !processing ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <Upload size={20} />
          {processing ? 'Processing...' : 'Process Document'}
        </button>

        {/* Info */}
        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: '#fef3c7',
          borderRadius: '8px',
          fontSize: '14px',
          color: '#78350f'
        }}>
          💡 <strong>How it works:</strong> The PDF text is extracted, split into chunks, 
          and embedded using Gemini AI. This allows the chatbot to answer questions 
          about your policies.
        </div>
      </div>
    </div>
  );
}

export default PolicyUpload;