const FootballAgent = require('./agent');
const { sequelize } = require('./database');
const https = require('https');

function downloadSpeechSample(url) {
  return new Promise((resolve, reject) => {
    console.log(`Downloading speech sample from ${url}...`);
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download: ${res.statusCode}`));
        return;
      }
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        console.log(`Downloaded ${Buffer.concat(chunks).length} bytes.`);
        resolve(Buffer.concat(chunks));
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function main() {
  console.log("--- STARTING FUTBOLAI VALIDATION SCRIPT ---");
  
  // 1. Check DB Connection
  try {
    await sequelize.authenticate();
    console.log("✅ Database authenticated successfully.");
  } catch (err) {
    console.error("❌ Database authentication failed:", err.message);
    process.exit(1);
  }

  // 2. Initialize Agent
  let agent;
  try {
    agent = new FootballAgent();
    console.log("✅ FootballAgent initialized. Demo Mode:", agent.demoMode);
  } catch (err) {
    console.error("❌ FootballAgent initialization failed:", err.message);
    process.exit(1);
  }

  // 3. Prepare Audio Base64
  let audioBase64 = "";
  let mimeType = "audio/wav";
  try {
    const audioBuffer = await downloadSpeechSample("https://www.voiptroubleshooter.com/open_speech/american/OSR_us_000_0010_8k.wav");
    audioBase64 = audioBuffer.toString('base64');
    console.log("✅ Loaded real speech WAV sample.");
  } catch (err) {
    console.warn("⚠️ Failed to download real speech sample, falling back to silent WAV:", err.message);
    // Construct a silent WAV file
    const sampleRate = 8000;
    const numChannels = 1;
    const bitsPerSample = 16;
    const bytesPerSample = bitsPerSample / 8;
    const silenceBytes = 2000;
    
    const wavBuffer = Buffer.alloc(44 + silenceBytes);
    wavBuffer.write('RIFF', 0);
    wavBuffer.writeUInt32LE(36 + silenceBytes, 4);
    wavBuffer.write('WAVE', 8);
    wavBuffer.write('fmt ', 12);
    wavBuffer.writeUInt32LE(16, 16);
    wavBuffer.writeUInt16LE(1, 20);
    wavBuffer.writeUInt16LE(numChannels, 22);
    wavBuffer.writeUInt32LE(sampleRate, 24);
    wavBuffer.writeUInt32LE(sampleRate * numChannels * bytesPerSample, 28);
    wavBuffer.writeUInt16LE(numChannels * bytesPerSample, 32);
    wavBuffer.writeUInt16LE(bitsPerSample, 34);
    wavBuffer.write('data', 36);
    wavBuffer.writeUInt32LE(silenceBytes, 40);
    
    audioBase64 = wavBuffer.toString('base64');
  }

  const testSessionId = "test-validation-session-12345";

  // 3. Test Text Chat (Normal)
  console.log("\n--- TEST 1: Text Chat (Normal) ---");
  try {
    const response = await agent.chat(testSessionId, "Quién es Lionel Messi?", "es");
    console.log("Text Chat Response:\n", response);
    if (response && response.length > 0) {
      console.log("✅ Test 1 Passed!");
    } else {
      console.log("❌ Test 1 Failed: Empty response");
    }
  } catch (err) {
    console.error("❌ Test 1 Failed with error:", err.message);
  }

  // 4. Test Audio Chat (Normal)
  console.log("\n--- TEST 2: Audio Chat (Normal) ---");
  try {
    const response = await agent.chat(testSessionId, "", "es", audioBase64, mimeType);
    console.log("Audio Chat Response:\n", response);
    if (response && response.length > 0) {
      console.log("✅ Test 2 Passed!");
    } else {
      console.log("❌ Test 2 Failed: Empty response");
    }
  } catch (err) {
    console.error("❌ Test 2 Failed with error:", err.message);
  }

  // 5. Test Text Chat (Streaming)
  console.log("\n--- TEST 3: Text Chat (Streaming) ---");
  try {
    let streamText = "";
    await new Promise((resolve, reject) => {
      agent.chatStream(
        testSessionId,
        "Cómo se llama el mejor jugador del Manchester City?",
        "es",
        null,
        null,
        null,
        null,
        (chunk) => {
          streamText += chunk;
        },
        (full) => {
          console.log("Text Stream Finished:\n", full);
          resolve();
        },
        (err) => {
          reject(err);
        }
      );
    });
    if (streamText && streamText.length > 0) {
      console.log("✅ Test 3 Passed!");
    } else {
      console.log("❌ Test 3 Failed: Empty stream");
    }
  } catch (err) {
    console.error("❌ Test 3 Failed with error:", err.message);
  }

  // 6. Test Audio Chat (Streaming)
  console.log("\n--- TEST 4: Audio Chat (Streaming) ---");
  try {
    let streamText = "";
    await new Promise((resolve, reject) => {
      agent.chatStream(
        testSessionId,
        "",
        "es",
        audioBase64,
        mimeType,
        null,
        null,
        (chunk) => {
          streamText += chunk;
        },
        (full) => {
          console.log("Audio Stream Finished:\n", full);
          resolve();
        },
        (err) => {
          reject(err);
        }
      );
    });
    if (streamText && streamText.length > 0) {
      console.log("✅ Test 4 Passed!");
    } else {
      console.log("❌ Test 4 Failed: Empty stream");
    }
  } catch (err) {
    console.error("❌ Test 4 Failed with error:", err.message);
  }

  console.log("\n--- FUTBOLAI VALIDATION SCRIPT FINISHED ---");
  process.exit(0);
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
