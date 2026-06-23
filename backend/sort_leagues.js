const { League } = require('./database');

async function run() {
  try {
    const leagues = await League.findAll();
    
    console.log("--- SORTED BY LEAGUE NAME ---");
    const sortedByName = [...leagues].sort((a, b) => a.name.localeCompare(b.name));
    sortedByName.forEach((l, idx) => {
      console.log(`${idx + 1}: ${l.name} (${l.country}) [DB ID: ${l.id}]`);
    });

    console.log("\n--- SORTED BY COUNTRY ---");
    const sortedByCountry = [...leagues].sort((a, b) => a.country.localeCompare(b.country));
    sortedByCountry.forEach((l, idx) => {
      console.log(`${idx + 1}: ${l.name} (${l.country}) [DB ID: ${l.id}]`);
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
