const { Player } = require('./database');
const https = require('https');

function fetchTM(pathUrl) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'www.transfermarkt.com',
      path: pathUrl,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    };
    https.get(options, (res) => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    }).on('error', (err) => resolve({ status: 500, error: err.message, body: '' }));
  });
}

async function run() {
  const players = await Player.findAll({ where: { league: 'La Liga' } });
  console.log(`Checking ${players.length} La Liga players...`);

  const emptyInjuries = [];
  players.forEach(p => {
    const injs = typeof p.injuries === 'string' ? JSON.parse(p.injuries || '[]') : (p.injuries || []);
    if (!injs || injs.length === 0) {
      emptyInjuries.push(p.name);
    }
  });

  console.log(`Players with 0 injuries stored in DB: ${emptyInjuries.length}`);
  console.log('Sample of 15 players with 0 stored injuries:', emptyInjuries.slice(0, 15));
}

run();
