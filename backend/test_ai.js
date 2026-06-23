require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function test() {
  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash-latest';
  console.log(`Testing Gemini API with model: ${modelName}...`);

  if (!apiKey) {
    console.error('Error: GEMINI_API_KEY is not defined in .env');
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: modelName }, { apiVersion: 'v1' });

  try {
    const result = await model.generateContent('Say "AI is working!"');
    console.log('Gemini Response:', result.response.text());
    console.log('✅ AI Connection Success!');
  } catch (err) {
    console.error('❌ AI Connection Failed:', err.message);
  }
}

test();
