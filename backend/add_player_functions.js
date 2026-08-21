const fs = require('fs');

const filePath = 'C:/Users/franc/OneDrive/Escritorio/Futbol AI Local/frontend/app.js';
let content = fs.readFileSync(filePath, 'utf8');

const normalized = content.replace(/\r\n/g, '\n');

const targetStr = `  tbody.innerHTML = payments.map(pm => \`
    <tr>
      <td>\${pm.date || '—'}</td>
      <td>\${pm.description || pm.planName || 'Suscripción'}</td>
      <td>\${pm.amount || '—'}</td>
      <td><span class="status-badge \${pm.status === 'Completado' ? 'completed' : 'pending'}">\${pm.status || 'Completado'}</span></td>
    </tr>
  \`).join('');
};`;

const playerFunctions = `  tbody.innerHTML = payments.map(pm => \`
    <tr>
      <td>\${pm.date || '—'}</td>
      <td>\${pm.description || pm.planName || 'Suscripción'}</td>
      <td>\${pm.amount || '—'}</td>
      <td><span class="status-badge \${pm.status === 'Completado' ? 'completed' : 'pending'}">\${pm.status || 'Completado'}</span></td>
    </tr>
  \`).join('');
};

// ──────────────────────────────────────────
// PLAYERS & FEATURED MODULE FUNCTIONS
// ──────────────────────────────────────────
async function loadPlayers() {
  try {
    const res = await fetchWithAuth(\`\${API}/players?t=\${Date.now()}\`);
    if (!res.ok) throw new Error('API failed');
    const data = await res.json();
    if (Array.isArray(data?.players)) {
      allPlayers = data.players;
      window.allPlayers = allPlayers;
      localStorage.setItem('scout_ai_cached_players', JSON.stringify(allPlayers));
    }
    if (typeof populateLeagueFilter === 'function') populateLeagueFilter();
  } catch (err) {
    console.warn('loadPlayers fetch fallback error:', err);
  }
}

function renderFeaturedPlayers() {
  const top = (allPlayers || []).slice(0, 8);
  const grid = document.getElementById('featured-grid');
  if (grid) {
    grid.innerHTML = '';
    top.forEach(p => {
      if (typeof createPlayerCard === 'function') {
        grid.appendChild(createPlayerCard(p));
      }
    });
    if (typeof loadAllLogos === 'function') loadAllLogos();
  }
}

let currentPage = 1;
const PLAYERS_PER_PAGE = 24;

function renderPlayers(playersToRender) {
  const list = playersToRender || allPlayers || [];
  const grid = document.getElementById('players-grid');
  const countTag = document.getElementById('players-count-tag');
  const noResults = document.getElementById('no-results');
  const paginationControls = document.getElementById('pagination-controls');

  if (countTag) {
    countTag.textContent = \`\${list.length} \${typeof currentLang !== 'undefined' && currentLang === 'es' ? 'jugadores' : 'players'}\`;
  }

  if (!grid) return;
  grid.innerHTML = '';

  if (!list || list.length === 0) {
    if (noResults) noResults.style.display = 'block';
    if (paginationControls) paginationControls.style.display = 'none';
    return;
  }

  if (noResults) noResults.style.display = 'none';

  const totalPages = Math.ceil(list.length / PLAYERS_PER_PAGE) || 1;
  if (currentPage > totalPages) currentPage = totalPages;
  if (currentPage < 1) currentPage = 1;

  const start = (currentPage - 1) * PLAYERS_PER_PAGE;
  const end = start + PLAYERS_PER_PAGE;
  const pagePlayers = list.slice(start, end);

  pagePlayers.forEach(p => {
    if (typeof createPlayerCard === 'function') {
      grid.appendChild(createPlayerCard(p));
    }
  });

  if (paginationControls) {
    if (totalPages > 1) {
      paginationControls.style.display = 'flex';
      const pageInfo = document.getElementById('page-info');
      if (pageInfo) {
        pageInfo.textContent = \`\${typeof currentLang !== 'undefined' && currentLang === 'es' ? 'Página' : 'Page'} \${currentPage} / \${totalPages}\`;
      }
      const prevBtn = document.getElementById('prev-page-btn');
      const nextBtn = document.getElementById('next-page-btn');
      if (prevBtn) prevBtn.disabled = currentPage === 1;
      if (nextBtn) nextBtn.disabled = currentPage === totalPages;
    } else {
      paginationControls.style.display = 'none';
    }
  }

  if (typeof loadAllLogos === 'function') {
    loadAllLogos();
  }
}

function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    if (typeof window.applyAppFilters === 'function') {
      window.applyAppFilters();
    } else {
      renderPlayers();
    }
  }
}

function nextPage() {
  currentPage++;
  if (typeof window.applyAppFilters === 'function') {
    window.applyAppFilters();
  } else {
    renderPlayers();
  }
}`;

if (normalized.includes(targetStr)) {
  const fixed = normalized.replace(targetStr, playerFunctions);
  fs.writeFileSync(filePath, fixed, 'utf8');
  console.log('SUCCESSFULLY INSERTED PLAYER & FEATURED FUNCTIONS IN APP.JS!');
} else {
  console.log('TARGET STR NOT FOUND');
}
