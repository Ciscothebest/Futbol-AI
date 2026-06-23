require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function list() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return console.error('No API Key');
  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    // Note: The SDK itself doesn't have a direct listModels, 
    // it's usually done via the REST API or Vertex AI.
    // However, we can try to hit the v1 endpoint directly for a list.
    const url = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    console.log('Available Models:');
    if (data.models) {
      data.models.forEach(m => console.log(` - ${m.name} (methods: ${m.supportedGenerationMethods})`));
    } else {
      console.log('Unexpected response:', JSON.stringify(data));
    }
  } catch (err) {
    console.error('List Failed:', err.message);
  }
}

list();
