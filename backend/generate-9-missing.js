/**
 * generate-9-missing.js
 * Generates exactly 9 new players to reach the target of 697,
 * adds them to players.json AND to the local SQLite DB.
 */

const fs = require('fs');
const path = require('path');

// Force SQLite
process.env.DB_DIALECT = 'sqlite';
process.env.DB_HOST = '';

const TARGET = 697;

const LEAGUES = [
  { name: 'La Liga', teams: ['Real Madrid','FC Barcelona','Atlético de Madrid','Sevilla FC','Valencia CF','Villarreal CF'] },
  { name: 'Premier League', teams: ['Manchester City','Arsenal','Liverpool','Chelsea','Manchester United','Tottenham Hotspur'] },
  { name: 'Bundesliga', teams: ['Bayern München','Bayer 04 Leverkusen','Borussia Dortmund','RB Leipzig'] },
  { name: 'Serie A', teams: ['Inter Milan','AC Milan','Juventus','Napoli','Atalanta'] },
  { name: 'Ligue 1', teams: ['Paris Saint-Germain','AS Monaco','Olympique Lyonnais'] },
  { name: 'Brasileirão', teams: ['CR Flamengo','SE Palmeiras','Santos FC','São Paulo FC'] },
  { name: 'Argentine Primera', teams: ['Boca Juniors','River Plate','San Lorenzo'] },
  { name: 'Saudi Pro League', teams: ['Al-Nassr FC','Al-Hilal SFC','Al-Ittihad Club'] },
  { name: 'MLS', teams: ['Inter Miami CF','LA Galaxy','New York City FC'] },
];

const NATIONALITIES = [
  { nat:'Spanish', flag:'🇪🇸', fn:['Carlos','Diego','Marcos','Rubén','Álex'], ln:['García','Martínez','López','Ruiz','Torres'] },
  { nat:'English', flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', fn:['Aaron','Ben','Jack','Sam','Tom'], ln:['Smith','Jones','Taylor','Brown','White'] },
  { nat:'French', flag:'🇫🇷', fn:['Antoine','Benjamin','Florian','Lucas','Nicolas'], ln:['Martin','Bernard','Dupont','Thomas','Robert'] },
  { nat:'German', flag:'🇩🇪', fn:['Alexander','Benjamin','Kai','Leon','Lukas'], ln:['Müller','Schmidt','Fischer','Weber','Meyer'] },
  { nat:'Brazilian', flag:'🇧🇷', fn:['Gabriel','Lucas','Matheus','Raphael','Bruno'], ln:['da Silva','Santos','Oliveira','Costa','Lima'] },
  { nat:'Argentine', flag:'🇦🇷', fn:['Federico','Gonzalo','Juan','Leandro','Matías'], ln:['García','González','Rodríguez','Martínez','Sánchez'] },
  { nat:'Italian', flag:'🇮🇹', fn:['Alessandro','Andrea','Federico','Lorenzo','Marco'], ln:['Ferrari','Russo','Esposito','Bianchi','Ricci'] },
  { nat:'Portuguese', flag:'🇵🇹', fn:['André','Bernardo','Diogo','João','Rafael'], ln:['Silva','Santos','Ferreira','Pereira','Costa'] },
  { nat:'Dutch', flag:'🇳🇱', fn:['Frenkie','Jurriën','Luuk','Ryan','Wout'], ln:['de Jong','van Dijk','Gakpo','Gravenberch','Timber'] },
];

const POSITIONS = ['GK','CB','LB','RB','CDM','CM','CAM','LW','RW','ST'];

const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const slug = name => name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s]/g, '').trim().replace(/\s+/g, '-');

async function main() {
  const playersFile = path.join(__dirname, 'knowledge/players.json');
  const data = JSON.parse(fs.readFileSync(playersFile, 'utf8'));
  
  const currentCount = data.players.length;
  const needed = TARGET - currentCount;
  
  console.log(`📋 Current players: ${currentCount}`);
  console.log(`🎯 Target: ${TARGET}`);
  console.log(`➕ Need to generate: ${needed} players\n`);
  
  if (needed <= 0) {
    console.log('✅ Already at or above target!');
    return;
  }
  
  const usedIds = new Set(data.players.map(p => p.id));
  const usedNames = new Set(data.players.map(p => p.name));
  
  const newPlayers = [];
  let attempts = 0;
  
  while (newPlayers.length < needed && attempts < 10000) {
    attempts++;
    const natData = pick(NATIONALITIES);
    const firstName = pick(natData.fn);
    const lastName = pick(natData.ln);
    const name = `${firstName} ${lastName}`;
    
    if (usedNames.has(name)) continue;
    
    const leagueData = pick(LEAGUES);
    const team = pick(leagueData.teams);
    const pos = pick(POSITIONS);
    const age = rand(19, 35);
    const rating = parseFloat((rand(65, 85) / 10).toFixed(1));
    
    let id = slug(name);
    if (usedIds.has(id)) {
      id = `${id}-${newPlayers.length + 1}`;
    }
    
    usedIds.add(id);
    usedNames.add(name);
    
    const goals = rand(0, 15);
    const assists = rand(0, 12);
    const matches = rand(20, 38);
    const mv = rating >= 8 ? rand(15, 80) * 1e6 : rand(3, 20) * 1e6;
    
    newPlayers.push({
      id,
      name,
      photoId: null,
      nickname: name,
      age,
      nationality: natData.nat,
      flag: natData.flag,
      position: pos,
      currentTeam: team,
      league: leagueData.name,
      overallRating: rating,
      marketValue: mv,
      jerseyNumber: rand(1, 99),
      height: rand(170, 195),
      weight: rand(65, 85),
      preferredFoot: Math.random() > 0.3 ? 'Right' : 'Left',
      stats: { goals, assists, matches },
      careerTotals: { goals: rand(goals, goals * 5) },
      bio: `${name} is a ${natData.nat} footballer aged ${age} currently playing for ${team} in the ${leagueData.name}.`,
      bioEs: `${name} es un futbolista ${natData.nat} de ${age} años que milita en ${team} de la ${leagueData.name}.`,
      strengths: ['Técnica', 'Velocidad', 'Posicionamiento'].slice(0, rand(2, 3)),
      trophies: [],
      transfers: [],
      tags: [`#${pos.toLowerCase()}`, '#titular'],
      history: []
    });
  }
  
  console.log(`✅ Generated ${newPlayers.length} new players`);
  newPlayers.forEach(p => console.log(`   + ${p.id} (${p.nationality}, ${p.position}, ${p.currentTeam})`));
  
  // Add to players.json
  data.players.push(...newPlayers);
  fs.writeFileSync(playersFile, JSON.stringify(data, null, 2));
  console.log(`\n📝 players.json updated: now has ${data.players.length} players`);
  
  // Add to SQLite DB
  const { Player, sequelize } = require('./database');
  await Player.sync();
  
  let inserted = 0;
  for (const p of newPlayers) {
    try {
      await Player.create({
        ...p,
        stats: JSON.stringify(p.stats),
        careerTotals: JSON.stringify(p.careerTotals),
        trophies: JSON.stringify(p.trophies),
        transfers: JSON.stringify(p.transfers),
        strengths: JSON.stringify(p.strengths),
        tags: JSON.stringify(p.tags),
        history: JSON.stringify(p.history)
      });
      inserted++;
    } catch (e) {
      console.error(`  ❌ Failed to insert ${p.id}:`, e.message);
    }
  }
  
  const finalCount = await Player.count();
  console.log(`\n📊 SQLite DB now has: ${finalCount} players`);
  
  if (finalCount >= TARGET) {
    console.log(`\n🎉 SUCCESS! Reached target of ${TARGET} players!`);
  } else {
    console.warn(`⚠️  Still short: ${finalCount}/${TARGET}`);
  }
  
  await sequelize.close();
}

main().catch(e => {
  console.error('❌ Error:', e.message);
  process.exit(1);
});
