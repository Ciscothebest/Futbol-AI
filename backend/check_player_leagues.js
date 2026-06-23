const { Player, League } = require('./database');

async function run() {
  try {
    const playerLeagues = await Player.findAll({
      attributes: ['league'],
      group: ['league'],
      raw: true
    });
    
    const leagueNames = await League.findAll({
      attributes: ['name'],
      raw: true
    });
    
    console.log("--- Unique League Names in Players Table ---");
    console.log(playerLeagues.map(p => p.league));
    
    console.log("\n--- League Names in Leagues Table ---");
    console.log(leagueNames.map(l => l.name));
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
