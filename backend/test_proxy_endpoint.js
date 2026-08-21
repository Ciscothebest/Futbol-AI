const http = require('http');
const https = require('https');

function testEndpoint(url) {
  return new Promise((resolve) => {
    console.log(`Testing URL: ${url}`);
    const req = (url.startsWith('https') ? https : http).get(url, (res) => {
      console.log(`  Status Code: ${res.statusCode} | Content-Type: ${res.headers['content-type']} | Location: ${res.headers['location'] || 'None'}`);
      resolve();
    });
    req.on('error', (e) => {
      console.error(`  Error: ${e.message}`);
      resolve();
    });
  });
}

async function main() {
  console.log("=================================================");
  console.log("TESTING IMAGE PROXY & REDIRECT HANDLERS");
  console.log("=================================================\n");

  // Direct test of SoFIFA CDN proxy logic
  const p1 = '239';
  const p2 = '074';
  const year = '24';
  const directSofifaUrl = `https://cdn.sofifa.net/players/${p1}/${p2}/${year}_120.png`;
  await testEndpoint(directSofifaUrl);

  // Direct test of Transfermarkt portrait CDN
  const tmUrl = 'https://img.a.transfermarkt.technology/portrait/big/418560-1709108116.png?lm=1';
  await testEndpoint(tmUrl);
}

main();
