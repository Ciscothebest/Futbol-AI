const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const { League, Team, sequelize } = require('./database');

async function generatePDFReport() {
  await sequelize.authenticate();
  console.log("Connected to database. Fetching leagues and teams...");

  const leagues = await League.findAll({
    order: [['country', 'ASC']],
    raw: true
  });

  const teams = await Team.findAll({
    order: [['leagueName', 'ASC'], ['position', 'ASC'], ['name', 'ASC']],
    raw: true
  });

  console.log(`Fetched ${leagues.length} leagues and ${teams.length} teams.`);

  const desktopPath = 'C:\\Users\\franc\\OneDrive\\Escritorio\\Informe_Ligas_y_Equipos_FutbolAI.pdf';
  const localMirrorPath = 'C:\\Users\\franc\\OneDrive\\Escritorio\\Futbol AI Local\\Informe_Ligas_y_Equipos_FutbolAI.pdf';

  const doc = new PDFDocument({
    margin: 36,
    size: 'LETTER',
    bufferPages: true
  });

  const writeStream = fs.createWriteStream(desktopPath);
  doc.pipe(writeStream);

  // Styling palette
  const PRIMARY = '#0284C7';
  const DARK = '#0F172A';
  const LIGHT_BG = '#F8FAFC';
  const BORDER_COLOR = '#CBD5E1';
  const TEXT_DARK = '#1E293B';
  const TEXT_MUTED = '#64748B';

  // Title Banner
  doc.fillColor(DARK).fontSize(18).font('Helvetica-Bold').text('INFORME OFICIAL DE LIGAS Y EQUIPOS', 36, 36);
  doc.fillColor(TEXT_MUTED).fontSize(9).font('Helvetica').text('Inventario completo con identificadores únicos de base de datos (ID), conteos y estadísticas', 36, 58);
  
  doc.moveTo(36, 72).lineTo(576, 72).lineWidth(2).strokeColor(PRIMARY).stroke();

  // Executive Summary Box
  const activeLeaguesCount = leagues.filter(l => teams.some(t => t.country === l.country || t.leagueName === l.name)).length;
  const inactiveLeaguesCount = leagues.length - activeLeaguesCount;

  doc.rect(36, 82, 540, 45).fillAndStroke('#F1F5F9', BORDER_COLOR);

  doc.fillColor(TEXT_DARK).fontSize(8).font('Helvetica-Bold');
  doc.text('TOTAL DE LIGAS', 45, 88, { width: 120, align: 'center' });
  doc.text('LIGAS ACTIVAS', 175, 88, { width: 120, align: 'center' });
  doc.text('SIN EQUIPOS', 305, 88, { width: 120, align: 'center' });
  doc.text('TOTAL DE EQUIPOS', 435, 88, { width: 120, align: 'center' });

  doc.font('Helvetica-Bold').fontSize(12);
  doc.fillColor(PRIMARY).text(`${leagues.length}`, 45, 104, { width: 120, align: 'center' });
  doc.fillColor('#16A34A').text(`${activeLeaguesCount}`, 175, 104, { width: 120, align: 'center' });
  doc.fillColor('#DC2626').text(`${inactiveLeaguesCount} (Pakistán)`, 305, 104, { width: 120, align: 'center' });
  doc.fillColor(PRIMARY).text(`${teams.length}`, 435, 104, { width: 120, align: 'center' });

  let y = 140;

  function checkPageBreak(neededHeight) {
    if (y + neededHeight > 730) {
      doc.addPage();
      y = 45;
    }
  }

  for (let i = 0; i < leagues.length; i++) {
    const l = leagues[i];
    const lTeams = teams.filter(t => t.country === l.country || t.leagueName === l.name);

    checkPageBreak(50);

    // League Header Box
    doc.rect(36, y, 540, 20).fillAndStroke('#E2E8F0', '#94A3B8');
    doc.fillColor(TEXT_DARK).fontSize(9).font('Helvetica-Bold');
    doc.text(`#${i + 1}. ID Liga: `, 42, y + 5, { continued: true });
    doc.fillColor(PRIMARY).text(`${l.id}`, { continued: true });
    doc.fillColor(TEXT_DARK).text(` | ${l.name} (${l.country})  `, { continued: true });
    doc.fillColor(TEXT_MUTED).fontSize(8).font('Helvetica').text(`[Flag: ${l.flagIso || 'N/A'} | Equipos: ${lTeams.length}]`);

    y += 24;

    if (lTeams.length === 0) {
      doc.fillColor(TEXT_MUTED).fontSize(8).font('Helvetica-Oblique').text('* Liga registrada sin equipos activos (Estado: Liga Inexistente).', 42, y);
      y += 18;
      continue;
    }

    // Table Column Headers
    checkPageBreak(35);
    doc.rect(36, y, 540, 16).fill('#1E293B');
    doc.fillColor('#FFFFFF').fontSize(7.5).font('Helvetica-Bold');
    
    doc.text('ID Equipo', 40, y + 4, { width: 70, align: 'left' });
    doc.text('Pos.', 115, y + 4, { width: 25, align: 'center' });
    doc.text('Nombre del Equipo', 145, y + 4, { width: 200, align: 'left' });
    doc.text('PJ', 350, y + 4, { width: 25, align: 'center' });
    doc.text('G', 380, y + 4, { width: 25, align: 'center' });
    doc.text('E', 410, y + 4, { width: 25, align: 'center' });
    doc.text('P', 440, y + 4, { width: 25, align: 'center' });
    doc.text('GF', 470, y + 4, { width: 30, align: 'center' });
    doc.text('GC', 505, y + 4, { width: 30, align: 'center' });
    doc.text('PTS', 540, y + 4, { width: 32, align: 'center' });

    y += 16;

    // Team Rows
    for (let j = 0; j < lTeams.length; j++) {
      const t = lTeams[j];
      checkPageBreak(16);

      const rowBg = j % 2 === 0 ? '#FFFFFF' : LIGHT_BG;
      doc.rect(36, y, 540, 14).fillAndStroke(rowBg, '#E2E8F0');

      doc.fillColor(PRIMARY).fontSize(7.5).font('Helvetica-Bold').text(`${t.id}`, 40, y + 3, { width: 70, align: 'left' });
      doc.fillColor(TEXT_DARK).font('Helvetica').text(t.position && t.position > 0 ? `${t.position}` : '-', 115, y + 3, { width: 25, align: 'center' });
      doc.font('Helvetica-Bold').text(`${t.name}`, 145, y + 3, { width: 200, align: 'left' });
      doc.font('Helvetica').text(t.pj !== null ? `${t.pj}` : '-', 350, y + 3, { width: 25, align: 'center' });
      doc.text(t.g !== null ? `${t.g}` : '-', 380, y + 3, { width: 25, align: 'center' });
      doc.text(t.e !== null ? `${t.e}` : '-', 410, y + 3, { width: 25, align: 'center' });
      doc.text(t.p !== null ? `${t.p}` : '-', 440, y + 3, { width: 25, align: 'center' });
      doc.text(t.gf !== null ? `${t.gf}` : '-', 470, y + 3, { width: 30, align: 'center' });
      doc.text(t.gc !== null ? `${t.gc}` : '-', 505, y + 3, { width: 30, align: 'center' });
      doc.font('Helvetica-Bold').text(t.pts !== null ? `${t.pts}` : '-', 540, y + 3, { width: 32, align: 'center' });

      y += 14;
    }

    y += 12;
  }

  // Footer & Page Numbers
  const pages = doc.bufferedPageRange();
  for (let i = 0; i < pages.count; i++) {
    doc.switchToPage(i);
    doc.fillColor(TEXT_MUTED).fontSize(8).font('Helvetica');
    doc.text('FutbolAI Platform — Base de Datos Oficial (MSSQL / SQLite)', 36, 755, { align: 'left' });
    doc.text(`Página ${i + 1} de ${pages.count}`, 476, 755, { width: 100, align: 'right' });
    doc.moveTo(36, 748).lineTo(576, 748).lineWidth(0.5).strokeColor(BORDER_COLOR).stroke();
  }

  doc.end();

  writeStream.on('finish', () => {
    console.log(`✅ PDF generated successfully at: ${desktopPath}`);
    fs.copyFileSync(desktopPath, localMirrorPath);
    console.log(`✅ PDF copied to local Desktop folder: ${localMirrorPath}`);
    process.exit(0);
  });
}

generatePDFReport().catch(err => {
  console.error("❌ Error generating PDF report:", err);
  process.exit(1);
});
