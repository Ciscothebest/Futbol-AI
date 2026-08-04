const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const PDFDocument = require('pdfkit');

// Paths
const schemaPath = path.join(__dirname, 'schema_full.json');
if (!fs.existsSync(schemaPath)) {
  console.error('schema_full.json not found!');
  process.exit(1);
}

const dbTables = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

// Target Output Paths
const desktopPng = 'C:\\Users\\franc\\OneDrive\\Escritorio\\diagrama_entidad_relacion_futbolai.png';
const desktopPdf = 'C:\\Users\\franc\\OneDrive\\Escritorio\\diagrama_entidad_relacion_futbolai.pdf';

const localFolderDir = 'C:\\Users\\franc\\OneDrive\\Escritorio\\Futbol AI Local';
const localFolderPng = path.join(localFolderDir, 'diagrama_entidad_relacion_futbolai.png');
const localFolderPdf = path.join(localFolderDir, 'diagrama_entidad_relacion_futbolai.pdf');

const workspacePng = path.join(__dirname, '..', 'diagrama_entidad_relacion_futbolai.png');
const workspacePdf = path.join(__dirname, '..', 'diagrama_entidad_relacion_futbolai.pdf');
const htmlPath = path.join(__dirname, 'erd_visual.html');

// Browser Executable
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const domainMeta = {
  users: { name: 'Usuarios & Autenticación', color: '#1E3A8A', tag: 'USERS' },
  passkeys: { name: 'Seguridad Biométrica', color: '#1E3A8A', tag: 'AUTH' },
  expired_registrations: { name: 'Registros Vencidos', color: '#1E3A8A', tag: 'AUTH' },
  
  players: { name: 'Scouting Profesional', color: '#065F46', tag: 'SCOUTING' },
  Prospects: { name: 'Canteranos / Prospectos', color: '#065F46', tag: 'PROSPECTS' },
  
  leagues: { name: 'Ligas de Fútbol', color: '#581C87', tag: 'COMPETITION' },
  teams: { name: 'Equipos y Clubes', color: '#581C87', tag: 'COMPETITION' },
  
  payment_methods: { name: 'Métodos de Pago', color: '#78350F', tag: 'FINANCE' },
  payments: { name: 'Transacciones', color: '#78350F', tag: 'FINANCE' },
  
  direct_messages: { name: 'Mensajería Directa', color: '#0369A1', tag: 'SOCIAL' },
  user_contacts: { name: 'Contactos Scout', color: '#0369A1', tag: 'SOCIAL' },
  
  query_logs: { name: 'Logs Consultas IA', color: '#9F1239', tag: 'AUDIT' },
  comparison_logs: { name: 'Logs Comparativas', color: '#9F1239', tag: 'AUDIT' },
  favorite_logs: { name: 'Logs Favoritos', color: '#9F1239', tag: 'AUDIT' },
  
  sysdiagrams: { name: 'Sistema MS SQL', color: '#334155', tag: 'SYSTEM' }
};

// 1. Generate High Resolution HTML/CSS/SVG Document for ERD Diagram
function generateHTML() {
  let html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>FutbolAI — Diagrama Entidad-Relación Master</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;
      background-color: #0F172A;
      color: #F8FAFC;
      padding: 30px;
      width: 3200px;
      margin: 0 auto;
    }
    
    .header {
      background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%);
      border: 2px solid #334155;
      border-radius: 12px;
      padding: 24px 32px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
    }

    .title-area h1 {
      font-size: 28px;
      font-weight: 800;
      color: #FFFFFF;
      letter-spacing: 0.5px;
      margin-bottom: 6px;
    }
    .title-area p {
      font-size: 14px;
      color: #94A3B8;
    }

    .legend-bar {
      display: flex;
      gap: 16px;
      background: #1E293B;
      border: 1px solid #334155;
      border-radius: 8px;
      padding: 12px 20px;
      align-items: center;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 600;
    }
    .badge-sample {
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 700;
    }
    .badge-pk { background: #FEF3C7; color: #B45309; }
    .badge-fk { background: #E0E7FF; color: #3730A3; }
    .badge-null { background: #334155; color: #94A3B8; }
    .badge-notnull { background: #451A03; color: #F87171; border: 1px solid #7F1D1D; }

    /* Grid Layout for ERD Tables */
    .erd-grid {
      display: grid;
      grid-template-columns: 700px 750px 750px 700px;
      gap: 40px;
      position: relative;
    }

    .column-group {
      display: flex;
      flex-direction: column;
      gap: 30px;
    }

    /* Table Card */
    .table-card {
      background: #1E293B;
      border: 2px solid #334155;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 8px 20px rgba(0,0,0,0.4);
    }
    .table-card.central-hub {
      border: 3px solid #2563EB;
      box-shadow: 0 0 25px rgba(37,99,235,0.4);
    }

    .card-header {
      padding: 12px 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #FFFFFF;
      font-weight: 700;
      font-size: 15px;
    }
    .card-header .count-tag {
      font-size: 12px;
      background: rgba(255,255,255,0.2);
      padding: 2px 8px;
      border-radius: 12px;
    }

    .fields-list {
      padding: 6px 0;
      background: #0F172A;
    }
    .field-row {
      display: grid;
      grid-template-columns: 70px 1fr 140px 85px;
      align-items: center;
      padding: 6px 14px;
      font-size: 13px;
      border-bottom: 1px solid #1E293B;
    }
    .field-row:nth-child(even) {
      background: rgba(30, 41, 59, 0.4);
    }
    .field-row.is-pk {
      background: rgba(254, 243, 199, 0.08);
    }
    .field-row.is-fk {
      background: rgba(224, 231, 255, 0.08);
    }

    .col-name {
      font-family: 'Consolas', 'Courier New', monospace;
      font-weight: 600;
    }
    .field-row.is-pk .col-name { color: #F59E0B; font-weight: 700; }
    .field-row.is-fk .col-name { color: #60A5FA; font-weight: 700; }

    .col-type {
      color: #94A3B8;
      font-size: 12px;
      font-family: monospace;
    }
    .col-null {
      font-size: 11px;
      font-weight: 700;
      text-align: right;
    }
    .null-yes { color: #64748B; }
    .null-no { color: #EF4444; }

    .fk-ref-label {
      font-size: 11px;
      color: #38BDF8;
      font-weight: 600;
      margin-left: 6px;
    }
  </style>
</head>
<body>

  <div class="header">
    <div class="title-area">
      <h1>FUTBOL AI — DIAGRAMA ENTIDAD RELACIÓN MASTER (ERD COMPLETO)</h1>
      <p>MICROSOFT SQL SERVER | BASE DE DATOS: FutbolAI | 15 TABLAS | 100% CAMPOS MAPEADOS (186 CAMPOS)</p>
    </div>
    <div class="legend-bar">
      <div class="legend-item"><span class="badge-sample badge-pk">[PK]</span> Primary Key</div>
      <div class="legend-item"><span class="badge-sample badge-fk">[FK]</span> Foreign Key</div>
      <div class="legend-item"><span class="badge-sample badge-notnull">NOT NULL</span> Requerido</div>
      <div class="legend-item"><span class="badge-sample badge-null">NULL</span> Opcional</div>
    </div>
  </div>

  <div class="erd-grid">
`;

  function renderTableCard(tableName, isCentral = false) {
    const tableInfo = dbTables[tableName];
    const meta = domainMeta[tableName] || { name: tableName, color: '#1E293B', tag: 'DB' };
    
    let cardHtml = `
      <div class="table-card ${isCentral ? 'central-hub' : ''}">
        <div class="card-header" style="background-color: ${meta.color};">
          <span>TABLA: ${tableName.toUpperCase()}</span>
          <span class="count-tag">${tableInfo.columns.length} campos</span>
        </div>
        <div class="fields-list">
    `;

    tableInfo.columns.forEach(col => {
      const isPk = !!col.IS_PRIMARY_KEY;
      const fkInfo = tableInfo.foreignKeys.find(f => f.parent_column === col.COLUMN_NAME);
      const isFk = !!fkInfo;
      const isNullable = col.IS_NULLABLE === 'YES';
      const typeStr = col.DATA_TYPE + (col.CHARACTER_MAXIMUM_LENGTH ? `(${col.CHARACTER_MAXIMUM_LENGTH === -1 ? 'MAX' : col.CHARACTER_MAXIMUM_LENGTH})` : '');

      let badgeHtml = '<span></span>';
      if (isPk) badgeHtml = `<span class="badge-sample badge-pk">[PK]</span>`;
      else if (isFk) badgeHtml = `<span class="badge-sample badge-fk">[FK]</span>`;

      let fkRefHtml = isFk ? `<span class="fk-ref-label">➞ ${fkInfo.referenced_table}.${fkInfo.referenced_column}</span>` : '';

      cardHtml += `
        <div class="field-row ${isPk ? 'is-pk' : ''} ${isFk ? 'is-fk' : ''}">
          <div>${badgeHtml}</div>
          <div class="col-name">${col.COLUMN_NAME}${fkRefHtml}</div>
          <div class="col-type">${typeStr}</div>
          <div class="col-null ${isNullable ? 'null-yes' : 'null-no'}">${isNullable ? 'NULL' : 'NOT NULL'}</div>
        </div>
      `;
    });

    cardHtml += `
        </div>
      </div>
    `;
    return cardHtml;
  }

  // Column 1: Auth & Social & Logs
  html += `<div class="column-group">`;
  html += renderTableCard('expired_registrations');
  html += renderTableCard('passkeys');
  html += renderTableCard('direct_messages');
  html += renderTableCard('user_contacts');
  html += renderTableCard('query_logs');
  html += renderTableCard('comparison_logs');
  html += renderTableCard('favorite_logs');
  html += `</div>`;

  // Column 2: Central Users Hub & Competitions & System
  html += `<div class="column-group">`;
  html += renderTableCard('users', true);
  html += renderTableCard('leagues');
  html += renderTableCard('teams');
  html += renderTableCard('sysdiagrams');
  html += `</div>`;

  // Column 3: Scouting & Payments
  html += `<div class="column-group">`;
  html += renderTableCard('players');
  html += renderTableCard('payment_methods');
  html += renderTableCard('payments');
  html += `</div>`;

  // Column 4: Prospects
  html += `<div class="column-group">`;
  html += renderTableCard('Prospects');
  html += `</div>`;

  html += `
  </div>
</body>
</html>
`;

  fs.writeFileSync(htmlPath, html, 'utf8');
  console.log(`HTML generated at: ${htmlPath}`);
}

// 2. Render High Resolution Screenshot via Edge Headless
function capturePNG() {
  console.log('Capturing high-resolution PNG using Edge headless...');
  const htmlFileUrl = `file:///${htmlPath.replace(/\\/g, '/')}`;
  
  const cmd = `"${edgePath}" --headless --disable-gpu --screenshot="${workspacePng}" --window-size=3250,3800 "${htmlFileUrl}"`;
  
  execSync(cmd, { stdio: 'inherit' });
  console.log(`Captured high-res PNG at: ${workspacePng}`);
}

// 3. Generate PDF Document containing High-Res Image & Executive Cover
function buildPDF() {
  const doc = new PDFDocument({
    autoFirstPage: false,
    bufferPages: true
  });

  const stream = fs.createWriteStream(workspacePdf);
  doc.pipe(stream);

  // PAGE 1: Cover & Summary (A4 Portrait)
  doc.addPage({ size: 'A4', margin: 40 });

  doc.rect(40, 30, 515, 60).fill('#0F172A');
  doc.fillColor('#FFFFFF').fontSize(18).font('Helvetica-Bold').text('FUTBOL AI PLATFORM', 55, 45);
  doc.fillColor('#94A3B8').fontSize(9.5).font('Helvetica').text('DIAGRAMA E-R EN FORMATO IMAGEN ALTA RESOLUCIÓN Y DOCUMENTACIÓN', 55, 66);

  let y = 110;
  doc.fillColor('#0F172A').fontSize(18).font('Helvetica-Bold').text('DIAGRAMA ENTIDAD - RELACIÓN (100% CAMPOS)', 40, y);
  doc.fillColor('#64748B').fontSize(9).font('Helvetica').text(`Generado el: ${new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, 40, y + 22);

  y += 45;
  doc.rect(40, y, 515, 80).fillAndStroke('#F8FAFC', '#CBD5E1');
  doc.fillColor('#0D9488').fontSize(11).font('Helvetica-Bold').text('GARANTÍA DE LEGIBILIDAD EN FORMATO IMAGEN', 50, y + 12);
  doc.fillColor('#1E293B').fontSize(8.5).font('Helvetica')
     .text('• Se ha generado una imagen en ultra-alta resolución PNG (3250 x 3800 px) del diagrama completo.', 50, y + 28)
     .text('• Todos los 186 campos de las 15 tablas de la base de datos están renderizados con tipografía de alto contraste.', 50, y + 42)
     .text('• Cada campo foráneo incluye su insignia [FK] con la ruta explícita del enlace (ej. ➞ users.id).', 50, y + 56);

  y += 95;
  doc.fillColor('#0F172A').fontSize(12).font('Helvetica-Bold').text('ARCHIVOS GUARDADOS EN TU ESCRITORIO', 40, y);
  y += 18;

  doc.rect(40, y, 515, 55).fillAndStroke('#F1F5F9', '#94A3B8');
  doc.fillColor('#1E293B').fontSize(9).font('Helvetica-Bold')
     .text('🖼️  Imagen PNG en Alta Definición: diagrama_entidad_relacion_futbolai.png', 55, y + 12)
     .text('📄  Documento PDF Integrado: diagrama_entidad_relacion_futbolai.pdf', 55, y + 32);

  // PAGE 2: Embedded Full High-Res Image (A2 Landscape for massive clarity)
  doc.addPage({ size: 'A2', layout: 'landscape', margin: 20 });
  doc.rect(20, 15, 1644, 40).fill('#0F172A');
  doc.fillColor('#FFFFFF').fontSize(16).font('Helvetica-Bold').text('FUTBOL AI — DIAGRAMA ENTIDAD RELACIÓN MASTER (IMAGEN ALTA RESOLUCIÓN)', 35, 27);

  // Embed PNG image on full A2 canvas
  doc.image(workspacePng, 20, 60, { width: 1644 });

  doc.end();

  stream.on('finish', () => {
    console.log(`PDF successfully built at: ${workspacePdf}`);

    // Sync PNG & PDF to Desktop
    try {
      fs.copyFileSync(workspacePng, desktopPng);
      fs.copyFileSync(workspacePdf, desktopPdf);
      console.log(`Synced PNG & PDF to Desktop: ${desktopPng}`);
    } catch (e) {
      console.error('Failed to sync to Desktop:', e.message);
    }

    // Sync PNG & PDF to Futbol AI Local folder
    try {
      if (!fs.existsSync(localFolderDir)) {
        fs.mkdirSync(localFolderDir, { recursive: true });
      }
      fs.copyFileSync(workspacePng, localFolderPng);
      fs.copyFileSync(workspacePdf, localFolderPdf);
      console.log(`Synced PNG & PDF to Futbol AI Local: ${localFolderPng}`);
    } catch (e) {
      console.error('Failed to sync to Futbol AI Local:', e.message);
    }
  });
}

async function run() {
  generateHTML();
  capturePNG();
  buildPDF();
}

run();
