// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { VertexAI } = require('@google-cloud/vertexai');
const { Storage } = require('@google-cloud/storage');
const pdf = require('pdf-parse');

admin.initializeApp();
const storage = new Storage();
const vertexAI = new VertexAI({
  project: 'YOUR_PROJECT_ID',
  location: 'us-central1'
});

// 1️⃣ TRIGGER: When PDF uploaded to Storage
exports.processPDF = functions.storage.object().onFinalize(async (object) => {
  const filePath = object.name;
  
  // Only process PDFs in 'policies/' folder
  if (!filePath.startsWith('policies/') || !filePath.endsWith('.pdf')) {
    return null;
  }

  console.log(`Processing PDF: ${filePath}`);

  try {
    // Download PDF from Storage
    const bucket = storage.bucket(object.bucket);
    const file = bucket.file(filePath);
    const [buffer] = await file.download();

    // Extract text from PDF
    const pdfData = await pdf(buffer);
    const text = pdfData.text;

    // Split into chunks (Vertex AI has token limits)
    const chunks = splitIntoChunks(text, 1000); // ~1000 words per chunk

    // Create embeddings for each chunk
    const model = vertexAI.preview.getGenerativeModel({
      model: 'textembedding-gecko@003'
    });

    const embeddings = [];
    for (let i = 0; i < chunks.length; i++) {
      const result = await model.embedContent({
        content: { role: 'user', parts: [{ text: chunks[i] }] }
      });
      
      embeddings.push({
        chunk: chunks[i],
        embedding: result.embeddings.values,
        chunkIndex: i
      });
    }

    // Store in Firestore
    const docName = filePath.split('/').pop().replace('.pdf', '');
    await admin.firestore().collection('policy_embeddings').doc(docName).set({
      fileName: docName,
      filePath: filePath,
      uploadedAt: admin.firestore.FieldValue.serverTimestamp(),
      chunks: embeddings.length,
      embeddings: embeddings
    });

    console.log(`✅ Processed ${chunks.length} chunks for ${docName}`);
    return { success: true, chunks: chunks.length };

  } catch (error) {
    console.error('Error processing PDF:', error);
    throw error;
  }
});

// Helper function to split text
function splitIntoChunks(text, chunkSize) {
  const words = text.split(' ');
  const chunks = [];
  
  for (let i = 0; i < words.length; i += chunkSize) {
    chunks.push(words.slice(i, i + chunkSize).join(' '));
  }
  
  return chunks;
}

// 2️⃣ API: Search similar documents
exports.searchPolicies = functions.https.onCall(async (data, context) => {
  const { query } = data;

  // Get query embedding
  const model = vertexAI.preview.getGenerativeModel({
    model: 'textembedding-gecko@003'
  });

  const queryResult = await model.embedContent({
    content: { role: 'user', parts: [{ text: query }] }
  });

  const queryEmbedding = queryResult.embeddings.values;

  // Search similar embeddings
  const docsSnapshot = await admin.firestore()
    .collection('policy_embeddings')
    .get();

  let bestMatches = [];

  docsSnapshot.forEach(doc => {
    const data = doc.data();
    
    data.embeddings.forEach(item => {
      const similarity = cosineSimilarity(queryEmbedding, item.embedding);
      
      if (similarity > 0.7) { // Threshold for relevance
        bestMatches.push({
          fileName: data.fileName,
          chunk: item.chunk,
          similarity: similarity
        });
      }
    });
  });

  // Sort by similarity
  bestMatches.sort((a, b) => b.similarity - a.similarity);
  
  return bestMatches.slice(0, 3); // Return top 3 matches
});

// Helper: Calculate cosine similarity
function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// 3️⃣ API: Get answer from Gemini
exports.askPolicyQuestion = functions.https.onCall(async (data, context) => {
  const { question, context: relevantChunks } = data;

  const model = vertexAI.preview.getGenerativeModel({
    model: 'gemini-1.5-flash'
  });

  const prompt = `You are a helpful HR assistant. Answer the following question based ONLY on the provided policy documents.

Context from policy documents:
${relevantChunks.map(c => c.chunk).join('\n\n')}

Question: ${question}

Answer (if the information is not in the context, say "I don't have information about that in the policies"):`;

  const result = await model.generateContent(prompt);
  const response = result.response.text();

  return {
    answer: response,
    sources: relevantChunks.map(c => c.fileName)
  };
});