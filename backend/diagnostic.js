require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testAll() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return console.error('No API Key');
  const genAI = new GoogleGenerativeAI(apiKey);

  // List of possible model names
  const models = [
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-1.0-pro",
    "gemini-2.0-flash-exp"
  ];

  for (const modelName of models) {
    console.log(`--- Testing ${modelName} ---`);
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Say 'OK'");
      console.log(`✅ Success for ${modelName}: ${result.response.text()}`);
      break; // Stop at first success
    } catch (e) {
      console.log(`❌ Fail for ${modelName}: ${e.message.substring(0, 100)}`);
    }
  }
}

testAll();
