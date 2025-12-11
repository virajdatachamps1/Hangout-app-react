// Same proven approach from your LMS
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const EMBEDDING_MODEL = 'text-embedding-004';
const CHAT_MODEL = 'gemini-2.0-flash-exp';

// Create embedding for text
export async function createEmbedding(text) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${EMBEDDING_MODEL}:embedContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: `models/${EMBEDDING_MODEL}`,
        content: {
          parts: [{ text: text }]
        }
      })
    }
  );

  const data = await response.json();
  return data.embedding.values; // 768-dim vector
}

// Cosine similarity (dot product for normalized vectors)
function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
  }
  return dotProduct;
}

// Search relevant content
export async function searchRelevantContent(query, topK = 5) {
  // 1. Get query embedding
  const queryEmbedding = await createEmbedding(query);

  // 2. Get all embeddings from Firestore
  const { collection, getDocs } = await import('firebase/firestore');
  const { db } = await import('../firebase');

  const snapshot = await getDocs(collection(db, 'policy_embeddings'));
  
  // 3. Calculate similarities
  const results = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    const similarity = cosineSimilarity(queryEmbedding, data.embedding);
    
    results.push({
      id: doc.id,
      content: data.content,
      source: data.source,
      similarity: similarity
    });
  });

  // 4. Sort and return top K
  results.sort((a, b) => b.similarity - a.similarity);
  return results.slice(0, topK);
}

// Chat with context
export async function chatWithContext(question, context) {
  const prompt = `You are a helpful HR assistant for DataChamps company.

Context from policy documents:
${context}

Question: ${question}

Instructions:
- Answer based ONLY on the context above
- Be clear and professional
- If info is not in context, say "I don't have information about that in the policies"
- Keep answer under 200 words

Answer:`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${CHAT_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Gemini API Error:', errorText);
    throw new Error(`Gemini API Error (${response.status}): ${errorText}`);
  }
  
  const data = await response.json();
  
  if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
    console.error('Invalid Gemini response:', JSON.stringify(data, null, 2));
    throw new Error('Failed to get response from Gemini. The API response was invalid or empty.');
  }
  
  return data.candidates[0].content.parts[0].text;
}