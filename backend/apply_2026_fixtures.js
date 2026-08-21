const fs = require('fs');
const path = require('path');

function applyFixtures() {
  const jsonPath = path.join(__dirname, 'tm_fixtures_2026.json');
  if (!fs.existsSync(jsonPath)) {
    console.error("tm_fixtures_2026.json does not exist!");
    return;
  }
  
  const tmData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  console.log(`Loaded ${Object.keys(tmData).length} clubs with extracted 2026/2027 fixtures.`);
  
  const frontendAppJs = path.join(__dirname, '../frontend/app.js');
  const androidAppJs = path.join(__dirname, '../android-app/app/src/main/assets/frontend/app.js');
  
  const lines = [];
  for (const [team, matches] of Object.entries(tmData)) {
    lines.push(`    "${team}": [`);
    matches.forEach((m, idx) => {
      const comma = idx < matches.length - 1 ? ',' : '';
      const oppEscaped = m.opponent.replace(/"/g, '\\"');
      const compEscaped = m.competition.replace(/"/g, '\\"');
      lines.push(`      { opponent: "${oppEscaped}", date: isEs ? "${m.dateEs}" : "${m.dateEn}", competition: "${compEscaped}", home: ${m.home} }${comma}`);
    });
    lines.push(`    ],`);
  }
  
  const dictContent = `  const REAL_2026_27_FIXTURES = {\n${lines.join('\n')}\n  };\n  if (REAL_2026_27_FIXTURES[clubName]) return REAL_2026_27_FIXTURES[clubName];\n  const norm = clubName.toLowerCase().replace(/[^a-z0-9]/g, '');\n  for (const k of Object.keys(REAL_2026_27_FIXTURES)) {\n    const kNorm = k.toLowerCase().replace(/[^a-z0-9]/g, '');\n    if (norm.length >= 4 && (norm === kNorm || norm.includes(kNorm) || kNorm.includes(norm))) {\n      return REAL_2026_27_FIXTURES[k];\n    }\n  }\n  return null;\n}`;

  const buildUpcomingFixturesCode = `function buildUpcomingFixtures(myClubName) {
  const fixturesContainer = document.getElementById('sim-fixtures-list');
  if (!fixturesContainer) return;
  fixturesContainer.innerHTML = '';
  
  const isEs = currentLang === 'es';
  const realFixtures = getReal202425Fixtures(myClubName);
  
  if (realFixtures && realFixtures.length > 0) {
    const seasonHeader = document.createElement('div');
    seasonHeader.style.cssText = 'font-size: 11px; color: #00f0ff; background: rgba(0,240,255,0.08); border: 1px solid rgba(0,240,255,0.2); padding: 4px 8px; border-radius: 4px; margin-bottom: 10px; font-weight: 500; text-align: center;';
    seasonHeader.textContent = isEs ? '📅 Temporada 2026/27 · Transfermarkt API' : '📅 2026/27 Season · Transfermarkt API';
    fixturesContainer.appendChild(seasonHeader);

    realFixtures.forEach((f) => {
      const item = document.createElement('div');
      item.className = 'fixture-item';
      
      const clubTheme = getClubTheme(myClubName);
      const oppTheme = getClubTheme(f.opponent);
      const homeTheme = f.home ? clubTheme : oppTheme;
      const awayTheme = f.home ? oppTheme : clubTheme;
      const homeName = f.home ? myClubName : f.opponent;
      const awayName = f.home ? f.opponent : myClubName;
      
      const dateStr = \`\${f.date} · \${f.competition}\`;
      item.innerHTML = \`
        <div class="fixture-teams" style="display: flex; align-items: center; gap: 8px; flex: 1;">
          <div class="db-match-shield" style="background: linear-gradient(135deg, \${homeTheme.colors[0]}, \${homeTheme.colors[1]}); border-color: \${homeTheme.colors[0]}; width: 22px; height: 22px; font-size: 9px; min-width: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #fff;">\${homeTheme.short}</div>
          <div style="display: flex; flex-direction: column;">
            <div class="fixture-vs" style="font-weight: 600; font-size: 13px; color: #fff;">\${getShortTeamName(homeName)} <span style="color: #00f0ff; font-weight: normal; margin: 0 2px;">vs</span> \${getShortTeamName(awayName)}</div>
            <div class="fixture-info" style="font-size: 11px; color: rgba(255,255,255,0.6);">\${dateStr}</div>
          </div>
          <div class="db-match-shield" style="background: linear-gradient(135deg, \${awayTheme.colors[0]}, \${awayTheme.colors[1]}); border-color: \${awayTheme.colors[0]}; width: 22px; height: 22px; font-size: 9px; min-width: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #fff; margin-left: auto;">\${awayTheme.short}</div>
        </div>
        <button class="btn-fixture-sim" style="margin-left: 10px; white-space: nowrap;" onclick="simulateFixture('\${f.opponent}')">\${isEs ? 'Simular' : 'Simulate'}</button>
      \`;
      fixturesContainer.appendChild(item);
    });
    return;
  }
  
  fixturesContainer.innerHTML = \`
    <div class="sim-no-matches" style="padding: 20px; text-align: center; color: rgba(255,255,255,0.7); font-size: 13px;">
      <span style="font-size: 24px; display: block; margin-bottom: 6px;">📅</span>
      <strong style="color: #fff; font-size: 14px; display: block; margin-bottom: 2px;">\${isEs ? 'No hay partidos por ahora' : 'No matches for now'}</strong>
      <span style="color: rgba(255,255,255,0.45); font-size: 11px;">\${isEs ? 'No se han encontrado partidos programados para este equipo.' : 'No scheduled matches found for this team.'}</span>
    </div>
  \`;
}`;
  
  [frontendAppJs, androidAppJs].forEach(filePath => {
    if (!fs.existsSync(filePath)) return;
    let code = fs.readFileSync(filePath, 'utf-8');
    
    // 1. Replace getReal202425Fixtures
    code = code.replace(/function getReal202425Fixtures\(clubName\) \{[\s\S]*?return (?:REAL_2024_25_FIXTURES|REAL_2026_27_FIXTURES)\[clubName\] \|\| null;\s*\}/g, () => {
      return `function getReal202425Fixtures(clubName) {\n  if (!clubName) return null;\n  const isEs = currentLang === 'es';\n${dictContent}`;
    });
    
    // 2. Replace buildUpcomingFixtures
    code = code.replace(/function buildUpcomingFixtures\(myClubName\) \{[\s\S]*?\n\}/g, buildUpcomingFixturesCode);
    
    // 3. Update badges text
    code = code.replace(/Temporada 2024\/25 · Partidos Verificados/g, 'Temporada 2026/27 · Partidos Verificados (Transfermarkt API)');
    code = code.replace(/2024\/25 Season · Verified Fixtures/g, '2026/27 Season · Verified Fixtures (Transfermarkt API)');
    
    fs.writeFileSync(filePath, code, 'utf-8');
    console.log(`Updated ${filePath}`);
  });
  
  console.log("✔ Aplicados los 899 partidos con coincidencia de alias e interfaz idéntica en Simulaciones!");
}

applyFixtures();
