const fs = require('fs');

const filePath = 'frontend/app.js';
if (!fs.existsSync(filePath)) {
  console.error("File frontend/app.js not found!");
  process.exit(1);
}

let content = fs.readFileSync(filePath, 'utf8');

// Replacement 1: Fix createPlayerCard, normalizeString, and setupFilters start
const target1 = `<span>\${Number(p.overall        case 'salary_desc':`;
const replacement1 = `<span>\${Number(p.overallRating).toFixed(1)}</span>
      </div>
    </div>
    
    <button class="btn-expediente">EXPEDIENTE</button>
  \`;

  const img = card.querySelector('.player-photo');
  if (img) img.onerror = () => onAvatarError(img, p);

  card.addEventListener('click', () => openPlayerModal(p));
  return card;
}

function normalizeString(str) {
  if (!str) return '';
  return str.normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").replace(/[^a-z0-9 ]/g, "").toLowerCase().trim();
}

function setupFilters() {
  const search = document.getElementById('search-input');
  const chips = document.querySelectorAll('.filter-chips .chip');
  const sortSelect = document.getElementById('sort-players');
  const leagueSelect = document.getElementById('filter-league');
  const teamSelect = document.getElementById('filter-team');

  const applyFilters = () => {
    const query = search ? search.value.toLowerCase() : '';
    const activeChip = document.querySelector('.chip.active');
    const pos = activeChip ? activeChip.dataset.pos : '';
    const leagueFilter = leagueSelect ? leagueSelect.value : '';
    const teamFilter = teamSelect ? teamSelect.value : '';

    const normalizedQuery = normalizeString(query);
    console.log(\`🔎 Filtering: query="\${query}", normalized="\${normalizedQuery}", total=\${allPlayers.length}\`);
    let filtered = allPlayers.filter(p => {
      const matchSearch = !normalizedQuery || 
        normalizeString(p.name).includes(normalizedQuery) || 
        normalizeString(p.currentTeam).includes(normalizedQuery) || 
        normalizeString(p.nationality || '').includes(normalizedQuery) ||
        normalizeString(p.nationalityEs || '').includes(normalizedQuery) ||
        (p.flag && p.flag.includes(normalizedQuery));
      const matchPos = !pos || p.position === pos;
      const matchLeague = !leagueFilter || p.league === leagueFilter;
      const matchTeam = !teamFilter || p.currentTeam === teamFilter;
      return matchSearch && matchPos && matchLeague && matchTeam;
    });

    // Sorting
    const sortVal = sortSelect ? sortSelect.value : 'default';
    filtered.sort((a, b) => {
      switch (sortVal) {
        case 'name_asc': return a.name.localeCompare(b.name);
        case 'name_desc': return b.name.localeCompare(a.name);
        case 'salary_desc':`;

if (!content.includes(target1)) {
  console.error("Target 1 not found in app.js!");
  process.exit(1);
}

content = content.replace(target1, replacement1);
console.log("Successfully replaced Target 1!");

// Replacement 2: Clean up duplicated/corrupted global pane in openPlayerModal
// We search for the first occurrence of ``;ection">`` and replace everything up to `// Bind smart fallback to modal photo`
const target2Start = `\n  \`;ection">`;
const target2End = `  // Bind smart fallback to modal photo`;

const startIdx = content.indexOf(target2Start);
const endIdx = content.indexOf(target2End);

if (startIdx === -1 || endIdx === -1 || startIdx >= endIdx) {
  console.error("Target 2 boundaries not found or invalid!");
  console.log("startIdx:", startIdx, "endIdx:", endIdx);
  process.exit(1);
}

const target2Full = content.substring(startIdx, endIdx);
const replacement2 = `
  \`;

`;

content = content.replace(target2Full, replacement2);
console.log("Successfully cleaned up Target 2!");

// Write back to file
fs.writeFileSync(filePath, content, 'utf8');
console.log("frontend/app.js successfully updated!");
