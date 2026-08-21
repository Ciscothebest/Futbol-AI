const fs = require('fs');

const filePath = 'C:/Users/franc/OneDrive/Escritorio/Futbol AI Local/frontend/app.js';
let content = fs.readFileSync(filePath, 'utf8');

const normalized = content.replace(/\r\n/g, '\n');

// 1. Update filterDropdownOptions
const oldFilterFunc = `function filterDropdownOptions(id, query) {
  const optionsContainer = document.getElementById(\`dropdown-options-\${id}\`);
  if (!optionsContainer) return;
  const normalizedQuery = normalizeString(query.toLowerCase());
  const options = optionsContainer.querySelectorAll('.dropdown-option');
  options.forEach(opt => {
    const text = normalizeString(opt.textContent.toLowerCase());
    if (text.includes(normalizedQuery)) {
      opt.style.display = 'block';
    } else {
      opt.style.display = 'none';
    }
  });
}`;

const newFilterFunc = `function filterDropdownOptions(id, query) {
  const optionsContainer = document.getElementById(\`dropdown-options-\${id}\`);
  if (!optionsContainer) return;
  const normalizedQuery = normalizeString(query.toLowerCase()).trim();
  const options = optionsContainer.querySelectorAll('.dropdown-option');

  options.forEach(opt => {
    if (opt.dataset.value === '') {
      opt.style.display = 'block';
      return;
    }

    const text = normalizeString(opt.textContent.toLowerCase());
    const isTop = opt.dataset.isTop !== 'false';

    if (!normalizedQuery) {
      opt.style.display = isTop ? 'block' : 'none';
    } else {
      if (text.includes(normalizedQuery)) {
        opt.style.display = 'block';
      } else {
        opt.style.display = 'none';
      }
    }
  });
}`;

// 2. Update renderCustomDropdownOptions to set opt.dataset.isTop and handle default visibility
const oldRenderFunc = `  items.forEach(item => {
    const opt = document.createElement('div');
    opt.className = 'dropdown-option';
    opt.dataset.value = item.value;
    opt.textContent = item.text;
    if (activeValue === item.value) {
      opt.classList.add('active');
      if (triggerText) triggerText.textContent = item.text;
    }
    opt.addEventListener('click', (e) => {
      e.stopPropagation();
      selectCustomDropdownOption(id, item.value, item.text);
    });
    container.appendChild(opt);
  });`;

const newRenderFunc = `  items.forEach(item => {
    const opt = document.createElement('div');
    opt.className = 'dropdown-option';
    opt.dataset.value = item.value;
    opt.dataset.isTop = item.isTop !== undefined ? String(item.isTop) : 'true';
    opt.textContent = item.text;
    
    if (item.isTop === false) {
      opt.style.display = 'none';
    }

    if (activeValue === item.value) {
      opt.classList.add('active');
      if (triggerText) triggerText.textContent = item.text;
    }
    opt.addEventListener('click', (e) => {
      e.stopPropagation();
      selectCustomDropdownOption(id, item.value, item.text);
    });
    container.appendChild(opt);
  });`;

// 3. Update populateLeagueFilter
const oldPopulateLeague = `function populateLeagueFilter() {
  const leagueSelect = document.getElementById('filter-league');
  if (!leagueSelect) return;

  const flags = {
    'Premier League': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    'Championship': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    'La Liga': '🇪🇸',
    'Bundesliga': '🇩🇪',
    '2. Bundesliga': '🇩🇪',
    'Serie A': '🇮🇹',
    'Serie B': '🇮🇹',
    'Ligue 1': '🇫🇷',
    'Ligue 2': '🇫🇷',
    'Eredivisie': '🇳🇱',
    'Keuken Kampioen Divisie (Eerste Divisie)': '🇳🇱',
    'LDF (Liga Dominicana de Fútbol)': '🇩🇴',
    'MLS': '🇺🇸',
    'Saudi Pro League': '🇸🇦'
  };

  const leagues = [...new Set(allPlayers.map(p => p.league).filter(Boolean))].sort();
  
  leagueSelect.innerHTML = \`<option value="">🌐 \${t('all_leagues')}</option>\`;
  leagues.forEach(l => {
    const opt = document.createElement('option');
    opt.value = l;
    const flag = flags[l] || '⚽';
    opt.textContent = \`\${flag} \${l}\`;
    leagueSelect.appendChild(opt);
  });

  const selectedLeague = leagueSelect.value;
  const items = leagues.map(l => {
    const flag = flags[l] || '⚽';
    return { value: l, text: \`\${flag} \${l}\` };
  });
  renderCustomDropdownOptions('league', items, \`🌐 \${t('all_leagues')}\`, selectedLeague);

  updateTeamDropdown(selectedLeague); // Populate all teams initially
}`;

const newPopulateLeague = `function populateLeagueFilter() {
  const leagueSelect = document.getElementById('filter-league');
  if (!leagueSelect) return;

  const flags = {
    'Premier League': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    'Championship': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    'La Liga': '🇪🇸',
    'Bundesliga': '🇩🇪',
    '2. Bundesliga': '🇩🇪',
    'Serie A': '🇮🇹',
    'Serie B': '🇮🇹',
    'Ligue 1': '🇫🇷',
    'Ligue 2': '🇫🇷',
    'Eredivisie': '🇳🇱',
    'Keuken Kampioen Divisie (Eerste Divisie)': '🇳🇱',
    'LDF (Liga Dominicana de Fútbol)': '🇩🇴',
    'MLS': '🇺🇸',
    'Saudi Pro League': '🇸🇦'
  };

  const leagueCounts = {};
  allPlayers.forEach(p => {
    if (p.league) {
      leagueCounts[p.league] = (leagueCounts[p.league] || 0) + 1;
    }
  });

  const leaguesByPlayerCount = Object.keys(leagueCounts).sort((a, b) => leagueCounts[b] - leagueCounts[a]);
  const top7Leagues = new Set(leaguesByPlayerCount.slice(0, 7));

  const allLeaguesAlphabetical = [...leaguesByPlayerCount].sort();
  
  leagueSelect.innerHTML = \`<option value="">🌐 \${t('all_leagues')}</option>\`;
  allLeaguesAlphabetical.forEach(l => {
    const opt = document.createElement('option');
    opt.value = l;
    const flag = flags[l] || '⚽';
    opt.textContent = \`\${flag} \${l}\`;
    leagueSelect.appendChild(opt);
  });

  const selectedLeague = leagueSelect.value;
  const items = allLeaguesAlphabetical.map(l => {
    const flag = flags[l] || '⚽';
    return { value: l, text: \`\${flag} \${l}\`, isTop: top7Leagues.has(l) };
  });
  renderCustomDropdownOptions('league', items, \`🌐 \${t('all_leagues')}\`, selectedLeague);

  updateTeamDropdown(selectedLeague);
}`;

let updated = normalized;

if (updated.includes(oldFilterFunc)) {
  updated = updated.replace(oldFilterFunc, newFilterFunc);
}

if (updated.includes(oldRenderFunc)) {
  updated = updated.replace(oldRenderFunc, newRenderFunc);
}

if (updated.includes(oldPopulateLeague)) {
  updated = updated.replace(oldPopulateLeague, newPopulateLeague);
}

fs.writeFileSync(filePath, updated, 'utf8');
console.log('SUCCESSFULLY UPDATED DROPDOWN FILTERING LOGIC IN APP.JS!');
