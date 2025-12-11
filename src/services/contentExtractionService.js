const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Extract text from PDF using Gemini Vision
export async function extractTextFromPDF(file) {
  // Convert PDF to base64
  const base64 = await fileToBase64(file);
  
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: 'Extract all text from this PDF document. Return only the extracted text, no additional comments.' },
            {
              inline_data: {
                mime_type: 'application/pdf',
                data: base64
              }
            }
          ]
        }]
      })
    }
  );

  // Check for errors in response
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Gemini API Error:', errorText);
    throw new Error(`Gemini API Error (${response.status}): ${errorText}`);
  }
  
  const data = await response.json();
  
  if (data.error) {
    throw new Error(`Gemini API Error: ${data.error.message}`);
  }
  
  // Validate response structure
  if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
    console.error('Invalid Gemini response:', JSON.stringify(data, null, 2));
    throw new Error('Failed to extract text from PDF. The API response was invalid or empty.');
  }
  
  return data.candidates[0].content.parts[0].text;
}

// Split text into chunks
export function chunkText(text, chunkSize = 1000, overlap = 200) {
  const chunks = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    const chunk = text.slice(start, end).trim();
    
    if (chunk.length > 100) { // Skip very small chunks
      chunks.push(chunk);
    }
    
    start += chunkSize - overlap; // Overlap for context
  }

  return chunks;
}

// Helper
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}