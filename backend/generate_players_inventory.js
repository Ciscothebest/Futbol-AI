const { League, Team, Player, sequelize } = require('./database');
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

// Map Player table league names to DB League names where they differ
const playerToDbLeagueMap = {
  'Premier League': 'Premier League / Championship'
};

function normalizeLeagueName(lName) {
  return playerToDbLeagueMap[lName] || lName;
}

async function main() {
  const doc = new PDFDocument({ 
    margin: 50, 
    size: 'A4', 
    bufferPages: true 
  });
  
  const outputName = 'inventario_jugadores.pdf';
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
  await sequelize.authenticate();
  
  const allLeagues = await League.findAll({ order: [['name', 'ASC']] });
  const allTeams = await Team.findAll({ order: [['name', 'ASC']] });
  const dbPlayers = await Player.findAll({
    attributes: ['id', 'name', 'currentTeam', 'league', 'country']
  });
  
  const totalLeagues = allLeagues.length;
  const totalTeams = allTeams.length;
  const totalPlayers = dbPlayers.length;
  
  // Group players for detailed sections (only for leagues that have players)
  const activeLeagues = {};
  dbPlayers.forEach(p => {
    const dbLName = normalizeLeagueName(p.league) || 'Otros';
    const tName = p.currentTeam || 'Sin Equipo';
    
    if (!activeLeagues[dbLName]) {
      const dbLeague = allLeagues.find(l => l.name === dbLName);
      activeLeagues[dbLName] = {
        name: dbLName,
        country: dbLeague ? dbLeague.country : (p.country || 'Internacional'),
        teams: {}
      };
    }
    
    if (!activeLeagues[dbLName].teams[tName]) {
      activeLeagues[dbLName].teams[tName] = [];
    }
    
    activeLeagues[dbLName].teams[tName].push(p);
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
  doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(24).text('INVENTARIO DE PLANTILLAS Y JUGADORES', 50, 100, { width: 495 });
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
  
  doc.font('Helvetica-Bold').fontSize(9.5).text('Total de Jugadores Almacenados:', 75, statsY + 75);
  doc.font('Helvetica').fontSize(9.5).text(`${totalPlayers} jugadores`, 250, statsY + 75);
  
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
    'Este documento contiene el inventario completo de todos los jugadores de fútbol almacenados en la base de datos de la plataforma FutbolAI. La información se encuentra organizada jerárquicamente por la liga de origen y el equipo actual al que pertenecen. Dentro de cada equipo, los jugadores están ordenados alfabéticamente.',
    50, descY + 20, { width: 495, align: 'justify', lineGap: 3.5 }
  );
  
  // Footer Brand info at the bottom of cover page
  doc.fillColor(mutedTextColor).font('Helvetica').fontSize(8.5).text('FutbolAI Platform Engine v1.0.0 © 2026', 50, 740, { align: 'center', width: 495 });
  
  // -------------------------------------------------------------
  // PAGE 2+: SUMMARY DASHBOARD / DIRECTORY (ALL 81 LEAGUES)
  // -------------------------------------------------------------
  console.log('Generating League Summary Dashboard...');
  doc.addPage();
  
  doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(15).text('Resumen de Datos por Liga', 50, 95);
  doc.fillColor(textColor).font('Helvetica-Oblique').fontSize(9).text('Vista consolidada de las 81 ligas del sistema, incluyendo equipos y jugadores registrados.', 50, 115);
  doc.strokeColor(borderLight).lineWidth(0.5).moveTo(50, 132).lineTo(545, 132).stroke();
  
  // Table settings
  const headers = ['Liga', 'País de Origen', 'Nº de Equipos', 'Nº de Jugadores'];
  const colWidths = [180, 130, 90, 95];
  let currentY = 150;
  const rowHeight = 20;
  const bottomTableMargin = 740;
  
  function drawTableHeader(y) {
    doc.fillColor(primaryColor).rect(50, y, 495, 22).fill();
    doc.font('Helvetica-Bold').fontSize(9).fillColor('#ffffff');
    let tempX = 50;
    headers.forEach((h, idx) => {
      doc.text(h, tempX + 8, y + 6, { width: colWidths[idx] - 16 });
      tempX += colWidths[idx];
    });
    return y + 22;
  }
  
  currentY = drawTableHeader(currentY);
  doc.font('Helvetica').fontSize(8.5).fillColor(textColor);
  
  allLeagues.forEach((league, index) => {
    // Check overflow
    if (currentY + rowHeight > bottomTableMargin) {
      doc.addPage();
      currentY = 100; // start top of new page
      currentY = drawTableHeader(currentY);
      doc.font('Helvetica').fontSize(8.5).fillColor(textColor);
    }
    
    // Count teams in Team table
    const teamsInLeague = allTeams.filter(t => t.leagueName === league.name).length;
    
    // Count players in Player table
    const playersInLeague = dbPlayers.filter(p => normalizeLeagueName(p.league) === league.name).length;
    
    // Alternating rows background
    if (index % 2 === 1) {
      doc.fillColor(lightBg).rect(50, currentY, 495, rowHeight).fill();
    }
    
    doc.strokeColor(borderLight).lineWidth(0.5).rect(50, currentY, 495, rowHeight).stroke();
    
    let cellX = 50;
    const cells = [
      sanitizeString(league.name),
      sanitizeString(league.country),
      `${teamsInLeague} equipos`,
      `${playersInLeague} jugadores`
    ];
    
    cells.forEach((cell, idx) => {
      doc.fillColor(idx === 0 ? primaryColor : textColor);
      doc.font(idx === 0 ? 'Helvetica-Bold' : 'Helvetica');
      doc.text(cell, cellX + 8, currentY + 5, { width: colWidths[idx] - 16, ellipsis: true });
      cellX += colWidths[idx];
    });
    
    currentY += rowHeight;
  });
  
  // -------------------------------------------------------------
  // DETAILED INVENTORY PAGES (Active Leagues Only)
  // -------------------------------------------------------------
  console.log('Generating Detailed Inventory pages...');
  
  const colWidth = 155;
  const colGap = 15;
  const xPositions = [50, 220, 390];
  const topMarginForSubsequent = 100;
  const bottomMargin = 730;
  
  const sortedActiveLeagueNames = Object.keys(activeLeagues).sort();
  
  for (const lName of sortedActiveLeagueNames) {
    const leagueData = activeLeagues[lName];
    const sortedTeamNames = Object.keys(leagueData.teams).sort();
    
    // Add page for new league
    doc.addPage();
    let isFirstPageOfLeague = true;
    
    // Count players in league
    let totalPlayersInLeague = 0;
    sortedTeamNames.forEach(tName => {
      totalPlayersInLeague += leagueData.teams[tName].length;
    });
    
    // Draw League Header Card
    doc.fillColor(primaryColor).rect(50, 85, 495, 30).fill();
    doc.fillColor(accentColor).rect(50, 85, 5, 30).fill(); // Teal left edge
    doc.strokeColor(borderLight).lineWidth(0.5).rect(50, 85, 495, 30).stroke();
    
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(11).text(
      sanitizeString(lName.toUpperCase()), 65, 96, { continued: true }
    );
    doc.fillColor('#94a3b8').font('Helvetica').fontSize(9).text(
      `   |   País: ${sanitizeString(leagueData.country)}   |   ${totalPlayersInLeague} jugadores`
    );
    
    let currentColumn = 0;
    let currentY = 130;
    
    for (const tName of sortedTeamNames) {
      const teamPlayers = leagueData.teams[tName];
      
      // Sort players alphabetically
      const sortedPlayers = teamPlayers.sort((a, b) => a.name.localeCompare(b.name));
      
      // Calculate block height
      // Header: 18 pt. Player rows: length * 12 pt. Spacing below: 10 pt.
      const blockHeight = 18 + (sortedPlayers.length * 12) + 10;
      
      // Check column overflow
      if (currentY + blockHeight > bottomMargin) {
        if (currentColumn < 2) {
          currentColumn++;
          // If we are still on the league first page, start under league banner (y=130)
          // Otherwise, start at top margin (y=100)
          currentY = isFirstPageOfLeague ? 130 : topMarginForSubsequent;
        } else {
          // Add page for overflow in the same league
          doc.addPage();
          isFirstPageOfLeague = false;
          currentColumn = 0;
          currentY = topMarginForSubsequent;
        }
      }
      
      const xPos = xPositions[currentColumn];
      
      // Draw Team Header Block
      doc.fillColor('#f1f5f9').rect(xPos, currentY, colWidth, 16).fill();
      doc.strokeColor(borderLight).lineWidth(0.5).rect(xPos, currentY, colWidth, 16).stroke();
      
      doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(8).text(
        `${sanitizeString(tName)} (${sortedPlayers.length})`, 
        xPos + 6, 
        currentY + 4, 
        { width: colWidth - 12, ellipsis: true }
      );
      
      currentY += 20;
      
      // Draw Player List (without rating/position, just names)
      doc.font('Helvetica').fontSize(7.5).fillColor(textColor);
      for (const p of sortedPlayers) {
        const pName = sanitizeString(p.name);
        const playerLabel = `• ${pName}`;
        
        doc.text(playerLabel, xPos + 4, currentY, { width: colWidth - 8, ellipsis: true });
        currentY += 12;
      }
      
      currentY += 8; // Margin below team block
    }
  }
  
  // -------------------------------------------------------------
  // FOOTERS AND PAGE HEADERS (POST-PROCESSING)
  // -------------------------------------------------------------
  console.log('Applying page headers and footers...');
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    
    // Skip cover page
    if (i === range.start) {
      continue;
    }
    
    // Temporarily disable bottom margin page breaks during header/footer writing
    doc.page.margins.bottom = 0;
    
    // Draw running page header
    doc.fillColor(primaryColor).rect(50, 45, 10, 20).fill();
    doc.fillColor(accentColor).rect(63, 45, 5, 20).fill();
    doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(11).text('FutbolAI Platform', 75, 45);
    doc.fillColor(mutedTextColor).font('Helvetica').fontSize(7.5).text('INVENTARIO GLOBAL DE JUGADORES', 75, 58);
    doc.strokeColor(borderLight).lineWidth(1).moveTo(50, 75).lineTo(545, 75).stroke();
    
    // Draw running page footer
    doc.strokeColor(borderLight).lineWidth(0.5).moveTo(50, 780).lineTo(545, 780).stroke();
    doc.fillColor(textColor).font('Helvetica').fontSize(7.5).text(
      `Página ${i + 1} de ${range.count}`, 50, 786, { align: 'right', width: 495 }
    );
    doc.text('FutbolAI Platform - Reporte de Inventario de Jugadores', 50, 786, { align: 'left', width: 300 });
  }
  
  console.log('Total pages in document:', doc.bufferedPageRange().count);
  doc.end();
  
  await new Promise((resolve, reject) => {
    stream.on('finish', resolve);
    stream.on('error', reject);
  });
  
  console.log('PDF successfully generated at:', outputPath);
  
  // Copy to Desktop
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
