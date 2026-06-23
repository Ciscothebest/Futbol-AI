const { League } = require('./database');

async function run() {
  try {
    const leagues = await League.findAll({ order: [['id', 'ASC']] });
    console.log(JSON.stringify(leagues.map(l => ({ id: l.id, name: l.name, country: l.country, flagIso: l.flagIso })), null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
