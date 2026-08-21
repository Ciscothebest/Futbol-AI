const http = require('http');

console.log("=========================================================================");
console.log("TESTING PLAYER PHOTO PROXY VIA BACKEND");
console.log("=========================================================================\n");

const testPhotoId = 'https://img.a.transfermarkt.technology/portrait/big/418560-1709108116.png?lm=1';
const proxyPath = `/api/player-photo/${encodeURIComponent(testPhotoId)}`;

console.log(`📡 Fetching via proxy: http://localhost:3001${proxyPath}`);

const options = {
  hostname: 'localhost',
  port: 3001,
  path: proxyPath,
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`Response Status: ${res.statusCode}`);
  console.log(`Content-Type: ${res.headers['content-type']}`);
  console.log(`Content-Length: ${res.headers['content-length']} bytes`);
  
  let size = 0;
  res.on('data', chunk => size += chunk.length);
  res.on('end', () => {
    console.log(`✅ Successfully received ${size} image bytes through proxy!`);
    process.exit(0);
  });
});

req.on('error', (err) => {
  console.error("Proxy test error:", err.message);
  process.exit(1);
});

req.end();
