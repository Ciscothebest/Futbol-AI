const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", generationConfig: { responseMimeType: "application/json" } });

const names = [
  "Nico Schlotterbeck", "Xavi Simons", "Abdelkabir Abqar", "Andoni Gorosabel",
  "Antonio Blanco", "Antonio Sivera", "Luis Rioja", "Rubén Duarte", "Ronald Araújo",
  "Randal Kolo Muani", "Warren Zaïre-Emery", "Ben White", "Gabriel Magalhães",
  "Gabriel Martinelli", "Boubacar Kamara", "Diego Carlos", "Douglas Luiz",
  "Emiliano Martínez", "Ezri Konsa", "Lucas Digne", "Ollie Watkins", "Dušan Vlahović",
  "Federico Dimarco", "Gleison Bremer", "Piotr Zieliński"
];

async function run() {
  const prompt = `Return a JSON object where the keys are these football player names, and the values are their exact official EA Sports FC 24 / FC 25 (SoFIFA) Player IDs (an integer). If you don't know, search your knowledge base.
Names: ${JSON.stringify(names)}`;
  
  try {
    const result = await model.generateContent(prompt);
    console.log(result.response.text());
  } catch(e) {
    console.log("Error:", e);
  }
}

run();
