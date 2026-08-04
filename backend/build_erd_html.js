const fs = require('fs');
const path = require('path');

const schema = JSON.parse(fs.readFileSync(path.join(__dirname, 'schema_full.json'), 'utf8'));

// Table layout positions: {x, y} in pixels on the SVG canvas
// Canvas is ~3200 x 2800. Tables placed manually for clean routing.
const TABLE_POSITIONS = {
  // Left column
  expired_registrations: { x: 60,   y: 60   },
  passkeys:              { x: 60,   y: 240  },
  direct_messages:       { x: 60,   y: 620  },
  user_contacts:         { x: 60,   y: 920  },
  query_logs:            { x: 60,   y: 1210 },
  comparison_logs:       { x: 60,   y: 1480 },
  favorite_logs:         { x: 60,   y: 1740 },

  // Center column
  users:                 { x: 900,  y: 60   },

  // Below center
  leagues:               { x: 900,  y: 1480 },
  teams:                 { x: 900,  y: 1680 },
  sysdiagrams:           { x: 900,  y: 1900 },

  // Right-center column
  players:               { x: 1800, y: 60   },
  payment_methods:       { x: 1800, y: 1100 },
  payments:              { x: 1800, y: 1460 },

  // Far right column
  Prospects:             { x: 2700, y: 60   },
};

const TABLE_WIDTH = 480;
const HEADER_HEIGHT = 44;
const ROW_HEIGHT = 26;

const DOMAIN_COLORS = {
  users:                 { header: '#1e3a8a', light: '#dbeafe', accent: '#2563eb' },
  passkeys:              { header: '#1e3a8a', light: '#dbeafe', accent: '#2563eb' },
  expired_registrations: { header: '#1e3a8a', light: '#dbeafe', accent: '#2563eb' },
  players:               { header: '#065f46', light: '#d1fae5', accent: '#059669' },
  Prospects:             { header: '#065f46', light: '#d1fae5', accent: '#059669' },
  leagues:               { header: '#581c87', light: '#ede9fe', accent: '#7c3aed' },
  teams:                 { header: '#581c87', light: '#ede9fe', accent: '#7c3aed' },
  payment_methods:       { header: '#78350f', light: '#fef3c7', accent: '#d97706' },
  payments:              { header: '#78350f', light: '#fef3c7', accent: '#d97706' },
  direct_messages:       { header: '#0369a1', light: '#e0f2fe', accent: '#0891b2' },
  user_contacts:         { header: '#0369a1', light: '#e0f2fe', accent: '#0891b2' },
  query_logs:            { header: '#9f1239', light: '#ffe4e6', accent: '#e11d48' },
  comparison_logs:       { header: '#9f1239', light: '#ffe4e6', accent: '#e11d48' },
  favorite_logs:         { header: '#9f1239', light: '#ffe4e6', accent: '#e11d48' },
  sysdiagrams:           { header: '#374151', light: '#f3f4f6', accent: '#6b7280' },
};

// Each FK connection: { from, fromCol, to, toCol, color }
const FK_CONNECTIONS = [
  { from: 'passkeys',        fromCol: 'userId',        to: 'users', toCol: 'id', color: '#2563eb' },
  { from: 'direct_messages', fromCol: 'senderId',      to: 'users', toCol: 'id', color: '#0891b2' },
  { from: 'direct_messages', fromCol: 'receiverId',    to: 'users', toCol: 'id', color: '#06b6d4' },
  { from: 'user_contacts',   fromCol: 'userId',        to: 'users', toCol: 'id', color: '#7c3aed' },
  { from: 'user_contacts',   fromCol: 'contactUserId', to: 'users', toCol: 'id', color: '#a855f7' },
  { from: 'query_logs',      fromCol: 'userId',        to: 'users', toCol: 'id', color: '#e11d48' },
  { from: 'comparison_logs', fromCol: 'userId',        to: 'users', toCol: 'id', color: '#f43f5e' },
  { from: 'favorite_logs',   fromCol: 'userId',        to: 'users', toCol: 'id', color: '#fb7185' },
  { from: 'players',         fromCol: 'userId',        to: 'users', toCol: 'id', color: '#10b981' },
  { from: 'payment_methods', fromCol: 'userId',        to: 'users', toCol: 'id', color: '#f59e0b' },
  { from: 'payments',        fromCol: 'userId',        to: 'users', toCol: 'id', color: '#f97316' },
  { from: 'Prospects',       fromCol: 'userId',        to: 'users', toCol: 'id', color: '#22c55e' },
];

function getTableHeight(tableName) {
  const t = schema[tableName];
  if (!t) return HEADER_HEIGHT + ROW_HEIGHT;
  return HEADER_HEIGHT + t.columns.length * ROW_HEIGHT + 8;
}

// Returns the absolute Y center of a specific column row inside a table
function getFieldY(tableName, colName) {
  const t = schema[tableName];
  if (!t) return TABLE_POSITIONS[tableName].y + HEADER_HEIGHT;
  const pos = TABLE_POSITIONS[tableName];
  const idx = t.columns.findIndex(c => c.COLUMN_NAME === colName);
  const row = idx >= 0 ? idx : 0;
  return pos.y + HEADER_HEIGHT + (row * ROW_HEIGHT) + ROW_HEIGHT / 2;
}

// Build SVG connection lines between tables, routing around boxes
function buildConnectionLines() {
  let svgLines = '';

  FK_CONNECTIONS.forEach((rel, i) => {
    const fromPos = TABLE_POSITIONS[rel.from];
    const toPos   = TABLE_POSITIONS[rel.to];
    if (!fromPos || !toPos) return;

    const yFrom = getFieldY(rel.from, rel.fromCol);
    const yTo   = getFieldY(rel.to, rel.toCol);

    // Determine whether source is left or right of target
    const fromRight = fromPos.x + TABLE_WIDTH;
    const toRight   = toPos.x + TABLE_WIDTH;

    let x1, x2, path;

    if (fromPos.x < toPos.x) {
      // Source is to the LEFT of target: exit right side of source, enter left of target
      x1 = fromRight;
      x2 = toPos.x;
      // Mid point X — stagger per connection index to avoid overlap
      const midX = x1 + (x2 - x1) / 2 + (i % 6 - 3) * 14;
      path = `M ${x1} ${yFrom} C ${midX} ${yFrom}, ${midX} ${yTo}, ${x2} ${yTo}`;
    } else {
      // Source is to the RIGHT of target: exit left side of source, enter right of target
      x1 = fromPos.x;
      x2 = toRight;
      const midX = Math.min(x1, x2) - 60 - (i % 5) * 20;
      path = `M ${x1} ${yFrom} C ${midX} ${yFrom}, ${midX} ${yTo}, ${x2} ${yTo}`;
    }

    svgLines += `
      <path d="${path}" stroke="${rel.color}" stroke-width="2.5" fill="none" 
            stroke-dasharray="8,4" opacity="0.9"
            marker-end="url(#arrow-${i})"/>
      <defs>
        <marker id="arrow-${i}" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="${rel.color}" />
        </marker>
      </defs>
      <!-- Origin dot -->
      <circle cx="${x1}" cy="${yFrom}" r="5" fill="${rel.color}" />
    `;
  });

  return svgLines;
}

// Build one SVG table box
function buildTableSVG(tableName) {
  const t = schema[tableName];
  const pos = TABLE_POSITIONS[tableName];
  const dc  = DOMAIN_COLORS[tableName] || { header: '#1f2937', light: '#f9fafb', accent: '#6b7280' };
  const h   = getTableHeight(tableName);
  const cols = t ? t.columns : [];
  const fks  = t ? t.foreignKeys : [];

  let rows = '';
  cols.forEach((col, idx) => {
    const isPk = !!col.IS_PRIMARY_KEY;
    const isFk = fks.some(f => f.parent_column === col.COLUMN_NAME);
    const isNull = col.IS_NULLABLE === 'YES';
    const typeStr = col.DATA_TYPE + (col.CHARACTER_MAXIMUM_LENGTH
      ? `(${col.CHARACTER_MAXIMUM_LENGTH === -1 ? 'MAX' : col.CHARACTER_MAXIMUM_LENGTH})`
      : '');

    const rowBg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
    const ry = HEADER_HEIGHT + idx * ROW_HEIGHT;

    let badgeEl = '';
    if (isPk) {
      badgeEl = `<rect x="8" y="${ry + 4}" width="30" height="16" rx="3" fill="#fef3c7"/>
        <text x="23" y="${ry + 16}" font-size="9" font-weight="700" fill="#b45309" text-anchor="middle">PK</text>`;
    } else if (isFk) {
      badgeEl = `<rect x="8" y="${ry + 4}" width="30" height="16" rx="3" fill="#e0e7ff"/>
        <text x="23" y="${ry + 16}" font-size="9" font-weight="700" fill="#3730a3" text-anchor="middle">FK</text>`;
    }

    const colNameX  = isPk || isFk ? 44 : 14;
    const colNameFill = isPk ? '#b45309' : (isFk ? '#3730a3' : '#1e293b');
    const colNameW  = isPk ? 'bold' : (isFk ? 'bold' : 'normal');

    const nullFill  = isNull ? '#94a3b8' : '#ef4444';
    const nullLabel = isNull ? 'NULL' : 'NOT NULL';

    const fkRef = isFk ? fks.find(f => f.parent_column === col.COLUMN_NAME) : null;
    const refLabel = fkRef ? `→ ${fkRef.referenced_table}.${fkRef.referenced_column}` : '';

    rows += `
      <rect x="0" y="${ry}" width="${TABLE_WIDTH}" height="${ROW_HEIGHT}" fill="${rowBg}"/>
      <line x1="0" y1="${ry}" x2="${TABLE_WIDTH}" y2="${ry}" stroke="#e2e8f0" stroke-width="0.5"/>
      ${badgeEl}
      <text x="${colNameX}" y="${ry + 17}" font-size="12" font-weight="${colNameW}" fill="${colNameFill}" font-family="'Consolas','Courier New',monospace">${escapeXml(col.COLUMN_NAME)}</text>
      ${refLabel ? `<text x="${colNameX + 160}" y="${ry + 17}" font-size="10" fill="#60a5fa" font-style="italic">${escapeXml(refLabel)}</text>` : ''}
      <text x="${TABLE_WIDTH - 8}" y="${ry + 17}" font-size="10" fill="#64748b" text-anchor="end" font-family="monospace">${escapeXml(typeStr)}</text>
      <text x="${TABLE_WIDTH - 8}" y="${ry + 23}" font-size="8.5" fill="${nullFill}" text-anchor="end" font-weight="600">${nullLabel}</text>
    `;
  });

  // Get FK count for this table
  const fkCount = fks.length;

  return `
    <g transform="translate(${pos.x}, ${pos.y})">
      <!-- Shadow -->
      <rect x="4" y="4" width="${TABLE_WIDTH}" height="${h}" rx="8" fill="rgba(0,0,0,0.15)"/>
      <!-- Body -->
      <rect x="0" y="0" width="${TABLE_WIDTH}" height="${h}" rx="8" fill="white" stroke="${dc.accent}" stroke-width="2"/>
      <!-- Header -->
      <rect x="0" y="0" width="${TABLE_WIDTH}" height="${HEADER_HEIGHT}" rx="8" fill="${dc.header}"/>
      <rect x="0" y="${HEADER_HEIGHT - 8}" width="${TABLE_WIDTH}" height="8" fill="${dc.header}"/>
      <!-- Table Name -->
      <text x="14" y="20" font-size="14" font-weight="800" fill="white" font-family="'Segoe UI',Roboto,Helvetica,sans-serif">${escapeXml(tableName.toUpperCase())}</text>
      <!-- Column count badge -->
      <rect x="${TABLE_WIDTH - 100}" y="8" width="88" height="20" rx="10" fill="rgba(255,255,255,0.2)"/>
      <text x="${TABLE_WIDTH - 56}" y="22" font-size="10" fill="white" text-anchor="middle">${cols.length} campos · ${fkCount} FK</text>
      <!-- Rows -->
      ${rows}
      <!-- Bottom border -->
      <rect x="0" y="${h - 1}" width="${TABLE_WIDTH}" height="1" fill="${dc.accent}"/>
    </g>
  `;
}

function escapeXml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Compute total SVG canvas size
function computeCanvasSize() {
  let maxX = 0, maxY = 0;
  Object.keys(TABLE_POSITIONS).forEach(t => {
    const pos = TABLE_POSITIONS[t];
    const h = getTableHeight(t);
    if (pos.x + TABLE_WIDTH + 80 > maxX) maxX = pos.x + TABLE_WIDTH + 80;
    if (pos.y + h + 80 > maxY) maxY = pos.y + h + 80;
  });
  return { width: maxX, height: maxY };
}

function buildHTML() {
  const tableOrder = Object.keys(TABLE_POSITIONS);
  let tablesSVG = '';
  tableOrder.forEach(t => {
    if (schema[t]) tablesSVG += buildTableSVG(t);
  });

  const connectionLines = buildConnectionLines();
  const { width, height } = computeCanvasSize();

  // Build legend items for FK connections
  const legendItems = FK_CONNECTIONS.map(rel =>
    `<div class="legend-item">
      <svg width="32" height="10"><line x1="0" y1="5" x2="32" y2="5" stroke="${rel.color}" stroke-width="2.5" stroke-dasharray="6,3"/></svg>
      <span style="color:${rel.color};font-weight:700">${rel.from}.${rel.fromCol}</span>
      <span style="color:#64748b">→</span>
      <span style="color:#94a3b8">${rel.to}.${rel.toCol}</span>
    </div>`
  ).join('');

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FutbolAI — Diagrama Entidad-Relación (ERD)</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: #0f172a;
      color: #f8fafc;
      min-height: 100vh;
    }

    /* ─── TOP NAV ─── */
    .topbar {
      position: fixed;
      top: 0; left: 0; right: 0;
      height: 64px;
      background: rgba(15,23,42,0.97);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid #1e293b;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 28px;
      z-index: 1000;
      gap: 20px;
    }

    .topbar-brand {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .brand-icon {
      width: 40px; height: 40px;
      background: linear-gradient(135deg, #2563eb, #0d9488);
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      font-size: 20px;
    }
    .brand-text h1 { font-size: 16px; font-weight: 800; color: #fff; letter-spacing: 0.3px; }
    .brand-text p  { font-size: 11px; color: #64748b; margin-top: 1px; }

    .topbar-controls {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .ctrl-btn {
      background: #1e293b;
      border: 1px solid #334155;
      color: #94a3b8;
      padding: 7px 14px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;
      display: flex; align-items: center; gap: 6px;
    }
    .ctrl-btn:hover { background: #334155; color: #fff; border-color: #475569; }
    .ctrl-btn.primary { background: #2563eb; border-color: #2563eb; color: #fff; }
    .ctrl-btn.primary:hover { background: #1d4ed8; }

    .zoom-label { font-size: 13px; font-weight: 700; color: #60a5fa; min-width: 44px; text-align: center; }

    .stats-bar {
      display: flex;
      gap: 20px;
    }
    .stat { text-align: center; }
    .stat-val { font-size: 18px; font-weight: 800; color: #60a5fa; line-height: 1; }
    .stat-lbl { font-size: 10px; color: #64748b; margin-top: 2px; text-transform: uppercase; letter-spacing: 0.5px; }

    /* ─── CANVAS AREA ─── */
    .canvas-container {
      margin-top: 64px;
      overflow: auto;
      width: 100vw;
      height: calc(100vh - 64px);
      cursor: grab;
      background-image:
        radial-gradient(circle, #1e293b 1px, transparent 1px);
      background-size: 32px 32px;
    }
    .canvas-container:active { cursor: grabbing; }

    #erd-wrapper {
      transform-origin: 0 0;
      display: inline-block;
      padding: 40px;
    }

    /* ─── LEGEND PANEL ─── */
    .legend-panel {
      position: fixed;
      bottom: 24px; right: 24px;
      background: rgba(15,23,42,0.97);
      backdrop-filter: blur(12px);
      border: 1px solid #334155;
      border-radius: 14px;
      padding: 18px 20px;
      width: 400px;
      max-height: 70vh;
      overflow-y: auto;
      z-index: 999;
      box-shadow: 0 20px 60px rgba(0,0,0,0.6);
    }
    .legend-panel h3 {
      font-size: 12px; font-weight: 700; color: #94a3b8;
      text-transform: uppercase; letter-spacing: 0.8px;
      margin-bottom: 14px;
      padding-bottom: 10px;
      border-bottom: 1px solid #1e293b;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      padding: 5px 0;
      border-bottom: 1px solid #1e293b;
    }
    .legend-item:last-child { border-bottom: none; }
    .legend-badges {
      display: flex; gap: 10px; margin-bottom: 14px; flex-wrap: wrap;
    }
    .lbadge {
      padding: 3px 10px; border-radius: 5px; font-size: 11px; font-weight: 700;
    }
    .lb-pk  { background: #fef3c7; color: #b45309; }
    .lb-fk  { background: #e0e7ff; color: #3730a3; }
    .lb-null { background: #1e293b; color: #94a3b8; }
    .lb-nn  { background: #450a0a; color: #ef4444; border: 1px solid #7f1d1d; }

    /* Toggle legend */
    .legend-toggle { display: none; }
    .legend-panel.collapsed .legend-toggle + * { display: none; }
  </style>
</head>
<body>

<!-- TOP BAR -->
<div class="topbar">
  <div class="topbar-brand">
    <div class="brand-icon">⚽</div>
    <div class="brand-text">
      <h1>FUTBOL AI — DIAGRAMA ENTIDAD-RELACIÓN MASTER</h1>
      <p>Microsoft SQL Server · Base de datos: FutbolAI · Generado el ${new Date().toLocaleDateString('es-ES', {day:'2-digit',month:'long',year:'numeric'})}</p>
    </div>
  </div>

  <div class="stats-bar">
    <div class="stat"><div class="stat-val">15</div><div class="stat-lbl">Tablas</div></div>
    <div class="stat"><div class="stat-val">186</div><div class="stat-lbl">Campos</div></div>
    <div class="stat"><div class="stat-val">12</div><div class="stat-lbl">Relaciones FK</div></div>
  </div>

  <div class="topbar-controls">
    <button class="ctrl-btn" id="btn-zoom-out">− Alejar</button>
    <span class="zoom-label" id="zoom-label">100%</span>
    <button class="ctrl-btn" id="btn-zoom-in">+ Acercar</button>
    <button class="ctrl-btn primary" id="btn-fit">⊞ Ajustar</button>
    <button class="ctrl-btn" id="btn-reset">↺ Reset</button>
  </div>
</div>

<!-- CANVAS AREA -->
<div class="canvas-container" id="canvas">
  <div id="erd-wrapper">
    <svg id="erd-svg" width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"
         font-family="'Segoe UI',Roboto,Helvetica,Arial,sans-serif">

      <!-- Connection Lines (drawn first so they appear below table boxes) -->
      ${connectionLines}

      <!-- Table Boxes -->
      ${tablesSVG}

    </svg>
  </div>
</div>

<!-- LEGEND PANEL -->
<div class="legend-panel" id="legend-panel">
  <h3>📌 LEYENDA DE RELACIONES Y SÍMBOLOS</h3>

  <div class="legend-badges">
    <span class="lbadge lb-pk">PK — Primary Key</span>
    <span class="lbadge lb-fk">FK — Foreign Key</span>
    <span class="lbadge lb-nn">NOT NULL — Requerido</span>
    <span class="lbadge lb-null">NULL — Opcional</span>
  </div>

  <div style="font-size:11px;color:#64748b;margin-bottom:12px;font-weight:600;">CONEXIONES FK (campo origen → campo destino):</div>
  ${legendItems}
</div>

<script>
  // ─── ZOOM & PAN ───────────────────────────────────────────────────────────
  const canvas  = document.getElementById('canvas');
  const wrapper = document.getElementById('erd-wrapper');
  const zoomLabel = document.getElementById('zoom-label');

  let scale = 1;
  let panX = 0, panY = 0;
  let isPanning = false, startX = 0, startY = 0;

  function applyTransform() {
    wrapper.style.transform = \`translate(\${panX}px, \${panY}px) scale(\${scale})\`;
    zoomLabel.textContent = Math.round(scale * 100) + '%';
  }

  // Zoom with mouse wheel
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.08 : 0.08;
    scale = Math.min(Math.max(scale + delta, 0.2), 2.5);
    applyTransform();
  }, { passive: false });

  // Pan with mouse drag
  canvas.addEventListener('mousedown', (e) => {
    isPanning = true;
    startX = e.clientX - panX;
    startY = e.clientY - panY;
  });
  window.addEventListener('mousemove', (e) => {
    if (!isPanning) return;
    panX = e.clientX - startX;
    panY = e.clientY - startY;
    applyTransform();
  });
  window.addEventListener('mouseup', () => { isPanning = false; });

  // Buttons
  document.getElementById('btn-zoom-in').onclick  = () => { scale = Math.min(scale + 0.1, 2.5); applyTransform(); };
  document.getElementById('btn-zoom-out').onclick = () => { scale = Math.max(scale - 0.1, 0.2); applyTransform(); };
  document.getElementById('btn-reset').onclick    = () => { scale = 1; panX = 0; panY = 0; applyTransform(); };
  document.getElementById('btn-fit').onclick      = () => {
    const svgEl = document.getElementById('erd-svg');
    const svgW  = svgEl.getAttribute('width');
    const svgH  = svgEl.getAttribute('height');
    const fitScaleX = (canvas.clientWidth  - 80) / svgW;
    const fitScaleY = (canvas.clientHeight - 80) / svgH;
    scale = Math.min(fitScaleX, fitScaleY);
    panX  = (canvas.clientWidth  - svgW * scale) / 2;
    panY  = (canvas.clientHeight - svgH * scale) / 2;
    applyTransform();
  };

  // Auto fit on load
  window.addEventListener('load', () => {
    document.getElementById('btn-fit').click();
  });
</script>
</body>
</html>`;

  return html;
}

const htmlContent = buildHTML();

// Save to workspace
const workspaceHtmlPath = path.join(__dirname, '..', 'diagrama_entidad_relacion_futbolai.html');
fs.writeFileSync(workspaceHtmlPath, htmlContent, 'utf8');
console.log('HTML saved to workspace:', workspaceHtmlPath);

// Save to Desktop
const desktopPath = 'C:\\Users\\franc\\OneDrive\\Escritorio\\diagrama_entidad_relacion_futbolai.html';
fs.copyFileSync(workspaceHtmlPath, desktopPath);
console.log('Copied to Desktop:', desktopPath);

// Save to Futbol AI Local
const localDir = 'C:\\Users\\franc\\OneDrive\\Escritorio\\Futbol AI Local';
if (!fs.existsSync(localDir)) fs.mkdirSync(localDir, { recursive: true });
const localPath = path.join(localDir, 'diagrama_entidad_relacion_futbolai.html');
fs.copyFileSync(workspaceHtmlPath, localPath);
console.log('Copied to Futbol AI Local:', localPath);

const sizeKB = Math.round(fs.statSync(workspaceHtmlPath).size / 1024);
console.log(`\n✅ Done! HTML file size: ${sizeKB} KB`);
console.log('Open in browser: C:\\Users\\franc\\OneDrive\\Escritorio\\diagrama_entidad_relacion_futbolai.html');
