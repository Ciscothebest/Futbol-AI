const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { League } = require('./database');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '.env') });

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("GEMINI_API_KEY not found!");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
// Using gemini-3.1-flash-lite which is available
const modelName = 'gemini-3.1-flash-lite'; 

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

  // Load the 81 leagues from the database to present as options
  const dbLeagues = await League.findAll({ order: [['name', 'ASC']] });
  const leagueOptions = dbLeagues.map(l => `- "${l.name}" (Country: ${l.country}, ID: ${l.id})`).join('\n');

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

  // Load existing progress if available
  const progressPath = path.join(__dirname, 'league_identities_progress.json');
  let hashToLeague = {};
  if (fs.existsSync(progressPath)) {
    try {
      hashToLeague = JSON.parse(fs.readFileSync(progressPath, 'utf8'));
      console.log(`Loaded existing progress with ${Object.keys(hashToLeague).length} identified hashes.`);
    } catch (e) {
      console.log("Could not load progress file, starting fresh.");
    }
  }

  const model = genAI.getGenerativeModel({ model: modelName });

  for (let i = 0; i < uniqueHashes.length; i++) {
    const hash = uniqueHashes[i];
    
    // Skip if already successfully identified
    if (hashToLeague[hash] && hashToLeague[hash] !== "Error" && hashToLeague[hash] !== "Unknown") {
      console.log(`[${i+1}/${uniqueHashes.length}] Skipping already identified hash (sample: ${hashToFiles[hash][0]}) -> ${hashToLeague[hash]}`);
      continue;
    }

    const sampleFile = hashToFiles[hash][0];
    const fullPath = path.join(dirPath, sampleFile);

    console.log(`[${i+1}/${uniqueHashes.length}] Analyzing sample ${sampleFile} (shared by ${hashToFiles[hash].length} files)...`);
    
    let attempts = 0;
    let success = false;
    
    while (attempts < 3 && !success) {
      try {
        const imagePart = fileToGenerativePart(fullPath, "image/png");
        const prompt = `Identify this football/soccer league logo. Choose the most matching league from the list of options below.

Options:
${leagueOptions}

Respond with ONLY the exact name of the matched league in double quotes (e.g. "La Liga" or "Premier League / Championship"). If you cannot identify it, respond with "Unknown". Do not add any explanation or other text.`;

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        let text = response.text().trim();
        
        // Extract content inside quotes if the model added them
        const match = text.match(/"([^"]+)"/);
        if (match) {
          text = match[1];
        }
        
        console.log(`   -> Identified: "${text}"`);
        hashToLeague[hash] = text;
        success = true;
      } catch (err) {
        attempts++;
        console.error(`   -> Attempt ${attempts} failed for ${sampleFile}:`, err.message);
        if (err.message.includes('429') || err.message.includes('quota')) {
          console.log("Quota issue encountered, waiting 15 seconds before retry...");
          await new Promise(resolve => setTimeout(resolve, 15000));
        } else {
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }
    }
    
    if (!success) {
      hashToLeague[hash] = "Error";
    }

    // Save progress after each sample
    fs.writeFileSync(progressPath, JSON.stringify(hashToLeague, null, 2));

    // Wait 10 seconds to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 10000));
  }

  // Create the final mapping from file to league name and save it
  const fileToLeague = {};
  files.forEach(f => {
    const hash = fileToHash[f];
    fileToLeague[f] = hashToLeague[hash] || "Unknown";
  });

  const finalOutputPath = path.join(__dirname, 'league_identities.json');
  fs.writeFileSync(finalOutputPath, JSON.stringify(fileToLeague, null, 2));
  console.log(`Success! Complete map written to ${finalOutputPath}`);
  process.exit(0);
}

run().catch(console.error);
