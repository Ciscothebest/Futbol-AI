const fs = require('fs');
const path = require('path');

function applyFullCalendars() {
  const jsonPath = path.join(__dirname, 'tm_full_calendars_2026.json');
  let tmData = {};
  if (fs.existsSync(jsonPath)) {
    tmData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    console.log(`Loaded ${Object.keys(tmData).length} clubs with extracted full Transfermarkt calendars.`);
  } else {
    console.log("tm_full_calendars_2026.json not ready yet. Using existing calendar dictionary.");
  }
  
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

  const newCalendarDict = `  const REAL_2026_27_FIXTURES = {\n${lines.join('\n')}\n  };`;

  const helperFunctionsCode = `
function getFullSeasonFixtures(clubName) {
  if (!clubName) return null;
  const isEs = currentLang === 'es';
  let rawList = REAL_2026_27_FIXTURES[clubName];
  if (!rawList) {
    const norm = clubName.toLowerCase().replace(/[^a-z0-9]/g, '');
    for (const k of Object.keys(REAL_2026_27_FIXTURES)) {
      const kNorm = k.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (norm.length >= 4 && (norm === kNorm || norm.includes(kNorm) || kNorm.includes(norm))) {
        rawList = REAL_2026_27_FIXTURES[k];
        break;
      }
    }
  }
  if (!rawList) return null;

  return rawList.map(f => ({
    ...f,
    parsedDate: parseFixtureDate(f.date)
  })).sort((a, b) => a.parsedDate - b.parsedDate);
}

function openFullCalendarModal(clubName) {
  const isEs = currentLang === 'es';
  const allMatches = getFullSeasonFixtures(clubName);
  
  if (!allMatches || allMatches.length === 0) {
    showNotification(isEs ? 'No hay calendario disponible para este club.' : 'No calendar available for this club.', 'warning');
    return;
  }

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);

  const pastCount = allMatches.filter(m => m.parsedDate < todayStart).length;
  const pendingCount = allMatches.filter(m => m.parsedDate >= todayStart).length;

  const existingModal = document.getElementById('full-calendar-modal');
  if (existingModal) existingModal.remove();

  const modalBackdrop = document.createElement('div');
  modalBackdrop.className = 'calendar-modal-backdrop';
  modalBackdrop.id = 'full-calendar-modal';

  modalBackdrop.innerHTML = \`
    <div class="calendar-modal-content">
      <div class="calendar-modal-header">
        <div class="calendar-modal-title">
          <span>📅</span>
          <span>\${isEs ? 'CALENDARIO COMPLETO 2026/27' : 'FULL 2026/27 CALENDAR'} — \${clubName}</span>
        </div>
        <button class="calendar-modal-close" onclick="closeFullCalendarModal()">&times;</button>
      </div>
      <div class="calendar-modal-tabs">
        <button class="calendar-tab-btn active" onclick="filterCalendarTab(this, 'all')">\${isEs ? 'Todos' : 'All'} (\${allMatches.length})</button>
        <button class="calendar-tab-btn" onclick="filterCalendarTab(this, 'pending')">\${isEs ? 'Pendientes' : 'Pending'} (\${pendingCount})</button>
        <button class="calendar-tab-btn" onclick="filterCalendarTab(this, 'played')">\${isEs ? 'Jugados' : 'Played'} (\${pastCount})</button>
      </div>
      <div class="calendar-modal-body" id="calendar-matches-list">
        \${renderCalendarMatchRows(allMatches, clubName, todayStart, isEs)}
      </div>
    </div>
  \`;

  document.body.appendChild(modalBackdrop);

  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) closeFullCalendarModal();
  });
}

function renderCalendarMatchRows(matches, clubName, todayStart, isEs) {
  const clubTheme = getClubTheme(clubName);
  
  return matches.map(m => {
    const oppTheme = getClubTheme(m.opponent);
    const homeTheme = m.home ? clubTheme : oppTheme;
    const awayTheme = m.home ? oppTheme : clubTheme;
    const homeText = m.home ? clubName : m.opponent;
    const awayText = m.home ? m.opponent : clubName;
    
    const isPlayed = m.parsedDate < todayStart;
    const statusBadge = isPlayed 
      ? \`<span class="badge-match-status played">\${isEs ? 'JUGADO' : 'PLAYED'}</span>\`
      : \`<span class="badge-match-status pending">\${isEs ? 'PENDIENTE' : 'PENDING'}</span>\`;

    return \`
      <div class="calendar-match-row \${isPlayed ? 'is-played' : 'is-pending'}">
        <div class="calendar-match-teams">
          <div class="db-match-shield" style="background: linear-gradient(135deg, \${homeTheme.colors[0]}, \${homeTheme.colors[1]}); border-color: \${homeTheme.colors[0]}; width: 24px; height: 24px; font-size: 9px;">\${homeTheme.short}</div>
          <div style="font-weight: 600; font-size: 13px; color: #fff;">
            <span>\${getShortTeamName(homeText)}</span>
            <span style="color: #00e5ff; font-weight: normal; margin: 0 4px;">vs</span>
            <span>\${getShortTeamName(awayText)}</span>
          </div>
          <div class="db-match-shield" style="background: linear-gradient(135deg, \${awayTheme.colors[0]}, \${awayTheme.colors[1]}); border-color: \${awayTheme.colors[0]}; width: 24px; height: 24px; font-size: 9px;">\${awayTheme.short}</div>
        </div>
        <div style="display: flex; align-items: center; gap: 12px; text-align: right;">
          <div style="display: flex; flex-direction: column;">
            <span style="font-size: 12px; font-weight: 700; color: #00e5ff;">\${m.date}</span>
            <span style="font-size: 10px; color: rgba(255,255,255,0.5);">\${m.competition}</span>
          </div>
          \${statusBadge}
        </div>
      </div>
    \`;
  }).join('');
}

function filterCalendarTab(btn, filter) {
  document.querySelectorAll('.calendar-tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  const rows = document.querySelectorAll('.calendar-match-row');
  rows.forEach(r => {
    if (filter === 'all') {
      r.style.display = 'flex';
    } else if (filter === 'played') {
      r.style.display = r.classList.contains('is-played') ? 'flex' : 'none';
    } else if (filter === 'pending') {
      r.style.display = r.classList.contains('is-pending') ? 'flex' : 'none';
    }
  });
}

function closeFullCalendarModal() {
  const modal = document.getElementById('full-calendar-modal');
  if (modal) modal.remove();
}

window.openFullCalendarModal = openFullCalendarModal;
window.closeFullCalendarModal = closeFullCalendarModal;
window.filterCalendarTab = filterCalendarTab;
`;

  const newRenderMyClubMatches = `async function renderMyClubMatches(clubName, countryName) {
  const container = document.getElementById('db-matches-list');
  if (!container) return;
  injectSeasonStyles();
  
  const isEs = currentLang === 'es';
  const realFixtures = getReal202425Fixtures(clubName);

  if (!realFixtures || realFixtures.length === 0) {
    console.log(\`[FutbolAI Match Engine] No verified fixtures found for "\${clubName}". Showing 'Announced Later'.\`);
    container.innerHTML = \`
      <div class="db-no-matches-container">
        <div class="db-no-matches-icon">📅</div>
        <div class="db-no-matches-text">
          <h4>\${isEs ? 'No hay partidos por ahora' : 'No matches for now'}</h4>
          <p>\${isEs ? 'No se han encontrado partidos oficiales programados para este club en la temporada 2026/27.' : 'No verified official matches were found for this club in the 2026/27 season.'}</p>
        </div>
      </div>
    \`;
    return;
  }

  // Top 3 upcoming matches for the main view
  const upcoming3 = realFixtures.slice(0, 3);
  const matchesData = upcoming3.map(f => ({
    opponent: f.opponent,
    theme: getClubTheme(f.opponent),
    date: f.date,
    competition: f.competition,
    home: f.home
  }));

  const badgeHtml = \`
    <div class="db-season-badge-container">
      <div class="db-season-badge current">
        <span>📅 \${isEs ? 'Temporada 2026/27 · Partidos Verificados' : '2026/27 Season · Verified Fixtures'}</span>
      </div>
    </div>
  \`;
  
  const matchesHtml = matchesData.map(m => {
    const clubTheme = getClubTheme(clubName);
    const homeTheme = m.home ? clubTheme : m.theme;
    const awayTheme = m.home ? m.theme : clubTheme;
    const homeText = m.home ? clubName : m.opponent;
    const awayText = m.home ? m.opponent : clubName;
    
    return \`
      <div class="db-match-row">
        <div style="display: flex; align-items: center; gap: 8px;">
          <div class="db-match-shield" style="background: linear-gradient(135deg, \${homeTheme.colors[0]}, \${homeTheme.colors[1]}); border-color: \${homeTheme.colors[0]}">\${homeTheme.short}</div>
          <div class="db-match-teams">
            <span>\${getShortTeamName(homeText)}</span>
            <span class="db-match-vs">vs</span>
            <span>\${getShortTeamName(awayText)}</span>
          </div>
          <div class="db-match-shield" style="background: linear-gradient(135deg, \${awayTheme.colors[0]}, \${awayTheme.colors[1]}); border-color: \${awayTheme.colors[0]}">\${awayTheme.short}</div>
        </div>
        <div class="db-match-meta">
          <span class="db-match-date">\${m.date}</span>
          <span class="db-match-competition">\${m.competition}</span>
        </div>
      </div>
    \`;
  }).join('');
  
  const safeClubName = clubName.replace(/'/g, "\\\\'");
  const btnHtml = \`
    <div style="text-align: center; margin-top: 14px;">
      <button class="btn-view-full-calendar" onclick="openFullCalendarModal('\${safeClubName}')">
        <span>📅 \${isEs ? 'Ver calendario' : 'View calendar'}</span>
      </button>
    </div>
  \`;
  
  container.innerHTML = badgeHtml + matchesHtml + btnHtml;
}`;

  [frontendAppJs, androidAppJs].forEach(filePath => {
    if (!fs.existsSync(filePath)) return;
    let code = fs.readFileSync(filePath, 'utf-8');

    // Replace REAL_2026_27_FIXTURES if tmData has data
    if (Object.keys(tmData).length > 0) {
      code = code.replace(/const REAL_2026_27_FIXTURES = \{[\s\S]*?\n  \};/g, newCalendarDict);
    }

    // Replace or add helper functions
    if (!code.includes('function getFullSeasonFixtures')) {
      code = code.replace(/function getReal202425Fixtures\(clubName\) \{/, `${helperFunctionsCode}\nfunction getReal202425Fixtures(clubName) {`);
    }

    // Replace renderMyClubMatches
    code = code.replace(/async function renderMyClubMatches\(clubName, countryName\) \{[\s\S]*?\n\}/g, newRenderMyClubMatches);

    fs.writeFileSync(filePath, code, 'utf-8');
    console.log(`Successfully updated ${filePath}`);
  });

  // Sync to Desktop Local Folder per User Rules
  const desktopAppJs = 'C:\\Users\\franc\\OneDrive\\Escritorio\\Futbol AI Local\\frontend\\app.js';
  const desktopCss = 'C:\\Users\\franc\\OneDrive\\Escritorio\\Futbol AI Local\\frontend\\styles.css';
  if (fs.existsSync('C:\\Users\\franc\\OneDrive\\Escritorio\\Futbol AI Local\\frontend')) {
    fs.copyFileSync(frontendAppJs, desktopAppJs);
    fs.copyFileSync(path.join(__dirname, '../frontend/styles.css'), desktopCss);
    console.log(`✔ Synced to Desktop local folder: ${desktopAppJs}`);
  }
}

applyFullCalendars();
