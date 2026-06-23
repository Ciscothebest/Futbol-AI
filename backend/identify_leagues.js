const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Load environment variables from backend/.env
require('dotenv').config({ path: path.join(__dirname, '.env') });

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("GEMINI_API_KEY not found in environment variables!");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';

function fileToGenerativePart(filePath, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(filePath)).toString("base64"),
      mimeType
    },
  };
}

async function run() {
  const dirPath = 'C:/Users/franc/OneDrive/Escritorio/logos_api/ligas';
  if (!fs.existsSync(dirPath)) {
    console.error(`Directory ${dirPath} does not exist!`);
    process.exit(1);
  }

  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.png'));
  console.log(`Found ${files.length} logo files.`);

  // Group by MD5 hash to avoid duplicate API calls
  const hashToFiles = {};
  const fileToHash = {};
  files.forEach(f => {
    const fullPath = path.join(dirPath, f);
    const hash = crypto.createHash('md5').update(fs.readFileSync(fullPath)).digest('hex');
    hashToFiles[hash] = hashToFiles[hash] || [];
    hashToFiles[hash].push(f);
    fileToHash[f] = hash;
  });

  const uniqueHashes = Object.keys(hashToFiles);
  console.log(`Found ${uniqueHashes.length} unique images out of ${files.length} files.`);

  const hashToLeague = {};

  const model = genAI.getGenerativeModel({ model: modelName });

  for (let i = 0; i < uniqueHashes.length; i++) {
    const hash = uniqueHashes[i];
    const sampleFile = hashToFiles[hash][0];
    const fullPath = path.join(dirPath, sampleFile);

    console.log(`[${i+1}/${uniqueHashes.length}] Analyzing sample ${sampleFile} (shared by ${hashToFiles[hash].length} files)...`);
    
    try {
      const imagePart = fileToGenerativePart(fullPath, "image/png");
      const prompt = "What football/soccer league logo is this? Give me the exact name of the league (e.g. 'Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1', 'Primeira Liga', 'Eredivisie', 'Brasileirão', 'Liga Profesional', 'Liga MX', etc.). Respond with ONLY the name of the league, or 'Unknown' if you cannot identify it.";

      const result = await model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text().trim();
      console.log(`   -> Identified: "${text}"`);
      hashToLeague[hash] = text;
    } catch (err) {
      console.error(`   -> Error identifying ${sampleFile}:`, err.message);
      hashToLeague[hash] = "Error";
    }

    // Small delay to prevent rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Map each file to its league
  const fileToLeague = {};
  files.forEach(f => {
    const hash = fileToHash[f];
    fileToLeague[f] = hashToLeague[hash] || "Unknown";
  });

  // Output the complete map
  const outputPath = path.join(__dirname, 'league_identities.json');
  fs.writeFileSync(outputPath, JSON.stringify(fileToLeague, null, 2));
  console.log(`Complete map written to ${outputPath}`);
}

run().catch(console.error);
