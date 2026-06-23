const { League, Team, sequelize } = require('./database');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Helper function to sanitize strings for Helvetica WinAnsi compliance
function sanitizeString(str) {
  if (!str) return '';
  const replacements = {
    'ł': 'l', 'Ł': 'L',
    'đ': 'd', 'Đ': 'D',
    'ħ': 'h', 'Ħ': 'H',
    'ø': 'o', 'Ø': 'O',
    'æ': 'ae', 'Æ': 'AE',
    'œ': 'oe', 'Œ': 'OE',
    'ß': 'ss',
    'ı': 'i',
    'ĸ': 'k',
    'ŉ': 'n'
  };
  let result = str;
  for (const [key, val] of Object.entries(replacements)) {
    result = result.replace(new RegExp(key, 'g'), val);
  }
  // Normalize to NFD and strip diacritical marks
  return result.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

async function main() {
  const doc = new PDFDocument({ 
    margin: 50, 
    size: 'A4', 
    bufferPages: true 
  });
  
  const outputName = 'inventario_equipos_ligas.pdf';
  const outputPath = path.join(__dirname, '..', outputName);
  
  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);
  
  // Set theme colors
  const primaryColor = '#0f172a';     // slate-900 (Deep Navy)
  const secondaryColor = '#0f766e';   // teal-700 (Dark Teal)
  const accentColor = '#0d9488';      // teal-600 (Teal Accent)
  const textColor = '#334155';        // slate-700 (Text Body)
  const mutedTextColor = '#64748b';   // slate-500 (Muted Text)
  const lightBg = '#f8fafc';          // slate-50 (Card Background)
  const borderLight = '#e2e8f0';      // slate-200 (Borders)
  
  // -------------------------------------------------------------
  // FETCH & ORGANIZE DATA
  // -------------------------------------------------------------
  console.log('Fetching data from the database...');
  const leagues = await League.findAll({ order: [['name', 'ASC']] });
  const teams = await Team.findAll({ order: [['name', 'ASC']] });
  
  const totalLeagues = leagues.length;
  const totalTeams = teams.length;
  
  // Group teams by league
  const leagueTeams = {};
  teams.forEach(t => {
    if (!leagueTeams[t.leagueName]) {
      leagueTeams[t.leagueName] = [];
    }
    leagueTeams[t.leagueName].push(t.name);
  });
  
  // -------------------------------------------------------------
  // PAGE 1: COVER PAGE
  // -------------------------------------------------------------
  console.log('Generating Cover Page...');
  
  // Background Header Block
  doc.rect(0, 0, 595, 260).fill(primaryColor);
  
  // Teal Accent Divider
  doc.rect(0, 255, 595, 8).fill(accentColor);
  
  // Cover Title & Subtitle
  doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(26).text('INVENTARIO DE LIGAS Y EQUIPOS', 50, 100, { width: 495 });
  doc.fillColor('#94a3b8').font('Helvetica-Oblique').fontSize(13).text('FutbolAI Platform - Reporte de Base de Datos Global', 50, 160);
  
  // Summary Stats Card
  const statsY = 290;
  doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(13).text('Resumen Ejecutivo del Sistema', 50, statsY);
  
  doc.fillColor(lightBg).rect(50, statsY + 18, 495, 115).fill();
  doc.strokeColor(borderLight).lineWidth(1).rect(50, statsY + 18, 495, 115).stroke();
  
  doc.fillColor(textColor).font('Helvetica-Bold').fontSize(9.5).text('Total de Ligas Registradas:', 75, statsY + 35);
  doc.font('Helvetica').fontSize(9.5).text(`${totalLeagues} ligas`, 250, statsY + 35);
  
  doc.font('Helvetica-Bold').fontSize(9.5).text('Total de Equipos Registrados:', 75, statsY + 55);
  doc.font('Helvetica').fontSize(9.5).text(`${totalTeams} equipos`, 250, statsY + 55);
  
  doc.font('Helvetica-Bold').fontSize(9.5).text('Promedio de Equipos por Liga:', 75, statsY + 75);
  doc.font('Helvetica').fontSize(9.5).text(`${(totalTeams / totalLeagues).toFixed(1)} equipos por liga`, 250, statsY + 75);
  
  doc.font('Helvetica-Bold').fontSize(9.5).text('Fecha de Generación:', 75, statsY + 95);
  doc.font('Helvetica').fontSize(9.5).text(
    new Date().toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    }), 
    250, statsY + 95
  );
  
  // About Section
  const descY = 445;
  doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(12).text('Sobre este Reporte', 50, descY);
  doc.fillColor(textColor).font('Helvetica').fontSize(9.5).text(
    'Este documento contiene el inventario completo de todas las ligas de fútbol y sus respectivos equipos cargados en la base de datos de la plataforma FutbolAI. Esta información actúa como el núcleo de referencia para los módulos de simulación de partidos, el motor de recomendación táctica y el análisis predictivo de rendimiento.',
    50, descY + 20, { width: 495, align: 'justify', lineGap: 3.5 }
  );
  
  // Footer Brand info at the bottom
  doc.fillColor(mutedTextColor).font('Helvetica').fontSize(8.5).text('FutbolAI Platform Engine v1.0.0 © 2026', 50, 740, { align: 'center', width: 495 });
  
  // -------------------------------------------------------------
  // PAGE 2: LEAGUE DIRECTORY
  // -------------------------------------------------------------
  console.log('Generating League Directory...');
  doc.addPage();
  
  doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(15).text('Directorio de Ligas', 50, 95);
  doc.fillColor(textColor).font('Helvetica-Oblique').fontSize(9).text('Acceso rápido a las 81 ligas registradas en el sistema, ordenadas alfabéticamente.', 50, 115);
  
  doc.strokeColor(borderLight).lineWidth(0.5).moveTo(50, 132).lineTo(545, 132).stroke();
  
  const dirY = 145;
  const colWidth = 155;
  const colGap = 15;
  const rowHeight = 15;
  
  for (let idx = 0; idx < leagues.length; idx++) {
    const league = leagues[idx];
    const colIdx = idx % 3;
    const rowIdx = Math.floor(idx / 3);
    
    const xPos = 50 + colIdx * (colWidth + colGap);
    const yPos = dirY + rowIdx * rowHeight;
    
    // Check if team count exists for this league
    const teamCount = leagueTeams[league.name] ? leagueTeams[league.name].length : 0;
    
    doc.fillColor(secondaryColor).font('Helvetica-Bold').fontSize(8).text('• ', xPos, yPos);
    doc.fillColor(textColor).font('Helvetica').fontSize(8).text(
      `${sanitizeString(league.name)} `, xPos + 8, yPos, { continued: true }
    );
    doc.fillColor(mutedTextColor).font('Helvetica-Oblique').fontSize(7.5).text(
      `(${sanitizeString(league.country)} - ${teamCount})`
    );
  }
  
  // -------------------------------------------------------------
  // DETAILED INVENTORY
  // -------------------------------------------------------------
  console.log('Generating Detailed Inventory pages...');
  doc.addPage();
  
  let currentY = 100;
  const topMarginForSubsequent = 100;
  
  for (let i = 0; i < leagues.length; i++) {
    const league = leagues[i];
    const leagueName = league.name;
    const lTeams = (leagueTeams[leagueName] || []).sort();
    
    // Calculate space required for this league
    // Header = 20pt + 6pt padding. Teams grid = rows * 13pt. Spacing below = 15pt.
    const teamRows = Math.ceil(lTeams.length / 3);
    const blockHeight = 26 + (teamRows * 13) + 15;
    
    // If it exceeds the page boundary, start a new page
    if (currentY + blockHeight > 740) {
      doc.addPage();
      currentY = topMarginForSubsequent;
    }
    
    // Draw League Header Card
    doc.fillColor(lightBg).rect(50, currentY, 495, 20).fill();
    doc.fillColor(accentColor).rect(50, currentY, 4, 20).fill(); // Teal left edge
    doc.strokeColor(borderLight).lineWidth(0.5).rect(50, currentY, 495, 20).stroke();
    
    doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(9).text(
      sanitizeString(leagueName), 60, currentY + 5, { continued: true }
    );
    doc.fillColor(textColor).font('Helvetica').fontSize(8).text(
      `   |   País: ${sanitizeString(league.country)}   |   ${lTeams.length} equipos`
    );
    
    currentY += 26;
    
    // Draw teams in a 3-column layout
    const teamYStart = currentY;
    for (let tIdx = 0; tIdx < lTeams.length; tIdx++) {
      const teamName = lTeams[tIdx];
      const colIdx = tIdx % 3;
      const rowIdx = Math.floor(tIdx / 3);
      
      const xPos = 55 + colIdx * (colWidth + colGap);
      const yPos = teamYStart + rowIdx * 13;
      
      doc.fillColor(mutedTextColor).font('Helvetica').fontSize(7.5).text('-', xPos, yPos);
      doc.fillColor(textColor).font('Helvetica').fontSize(8).text(
        sanitizeString(teamName), xPos + 8, yPos, { width: colWidth - 12, ellipsis: true }
      );
    }
    
    // Advance Y coordinate
    currentY += (teamRows * 13) + 12;
  }
  
  // -------------------------------------------------------------
  // FOOTERS AND PAGE HEADERS (POST-PROCESSING)
  // -------------------------------------------------------------
  console.log('Applying page headers and footers...');
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    
    // Skip cover page for header/footer
    if (i === range.start) {
      continue;
    }
    
    // Draw running page header
    doc.fillColor(primaryColor).rect(50, 45, 10, 20).fill();
    doc.fillColor(accentColor).rect(63, 45, 5, 20).fill();
    doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(11).text('FutbolAI Platform', 75, 45);
    doc.fillColor(mutedTextColor).font('Helvetica').fontSize(7.5).text('INVENTARIO DE LIGAS Y EQUIPOS', 75, 58);
    doc.strokeColor(borderLight).lineWidth(1).moveTo(50, 75).lineTo(545, 75).stroke();
    
    // Draw running page footer
    doc.strokeColor(borderLight).lineWidth(0.5).moveTo(50, 780).lineTo(545, 780).stroke();
    doc.fillColor(textColor).font('Helvetica').fontSize(7.5).text(
      `Página ${i + 1} de ${range.count}`, 50, 786, { align: 'right', width: 495 }
    );
    doc.text('FutbolAI Platform - Reporte de Inventario de Datos', 50, 786, { align: 'left', width: 300 });
  }
  
  doc.end();
  
  await new Promise((resolve, reject) => {
    stream.on('finish', resolve);
    stream.on('error', reject);
  });
  
  console.log('PDF successfully generated at:', outputPath);
  
  // Copy to Desktop if directory exists
  const desktopDir = 'C:\\Users\\franc\\OneDrive\\Escritorio';
  if (fs.existsSync(desktopDir)) {
    const desktopPath = path.join(desktopDir, outputName);
    fs.copyFileSync(outputPath, desktopPath);
    console.log('PDF Copied to Desktop successfully at:', desktopPath);
  } else {
    console.log('Desktop folder not found, skipping copy.');
  }
}

main().catch(e => {
  console.error('Error generating PDF:', e.stack || e.message);
  process.exit(1);
});
