const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = require('../serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function exportEmbeddingsToJSONL() {
  console.log('📥 Fetching embeddings from Firestore...');
  
  const snapshot = await db.collection('policy_embeddings').get();
  
  const embeddings = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    embeddings.push({
      id: doc.id, // Unique ID for each chunk
      embedding: data.embedding, // 768-dim vector
      restricts: [
        { namespace: "source", allow: [data.source] },
        { namespace: "chunkIndex", allow: [data.chunkIndex.toString()] }
      ]
    });
  });

  console.log(`✅ Found ${embeddings.length} embeddings`);

  // Write to JSONL file (one JSON per line)
  const outputPath = path.join(__dirname, '../vertex-embeddings.jsonl');
  const stream = fs.createWriteStream(outputPath);

  embeddings.forEach(emb => {
    stream.write(JSON.stringify(emb) + '\n');
  });

  stream.end();

  console.log(`✅ Exported to ${outputPath}`);
  console.log('📤 Now upload this file to Google Cloud Storage');
}

exportEmbeddingsToJSONL();