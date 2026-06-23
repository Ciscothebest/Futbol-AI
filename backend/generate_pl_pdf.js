const { Player } = require('./database');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

async function main() {
  const doc = new PDFDocument({ 
    margin: 50, 
    size: 'A4', 
    bufferPages: true 
  });
  
  const outputName = 'jugadores_premier_league.pdf';
  const outputPath = path.join(__dirname, '..', outputName);
  
  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);
  
  // Set colors
  const primaryColor = '#0f172a'; // slate-900
  const secondaryColor = '#0f766e'; // teal-700
  const textColor = '#334155'; // slate-700
  const borderLight = '#e2e8f0'; // slate-200
  
  // -------------------------------------------------------------
  // HEADER
  // -------------------------------------------------------------
  doc.fillColor(primaryColor).rect(50, 45, 10, 25).fill();
  doc.fillColor(secondaryColor).rect(63, 45, 5, 25).fill();
  doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(14).text('FutbolAI Platform', 75, 45);
  doc.font('Helvetica').fontSize(8).fillColor(textColor).text('REPORTE DE BASE DE DATOS', 75, 60);
  
  doc.strokeColor(borderLight).lineWidth(1).moveTo(50, 80).lineTo(545, 80).stroke();
  
  doc.moveDown(1.5);
  doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(20).text('Jugadores de la Premier League');
  doc.fontSize(10).font('Helvetica-Oblique').fillColor(textColor).text('Listado completo de jugadores registrados en el sistema local, agrupados por club.');
  
  doc.moveDown(1.5);
  
  // -------------------------------------------------------------
  // FETCH & ORGANIZE DATA
  // -------------------------------------------------------------
  const pl = await Player.findAll({ where: { league: 'Premier League' } });
  const teams = {};
  pl.forEach(p => {
    if (!teams[p.currentTeam]) teams[p.currentTeam] = [];
    teams[p.currentTeam].push(p.name);
  });
  
  const sortedTeams = Object.keys(teams).sort();
  
  // -------------------------------------------------------------
  // MULTI-COLUMN RENDERING
  // -------------------------------------------------------------
  const leftColX = 50;
  const rightColX = 305;
  const colWidth = 240;
  let currentY = doc.y;
  let currentColumn = 0; // 0 = left, 1 = right
  const topMarginForSubsequent = 100;
  
  for (const team of sortedTeams) {
    const players = teams[team].sort();
    const blockHeight = 16 + (players.length * 13) + 15;
    
    // Check column/page overflow
    if (currentY + blockHeight > 740) {
      if (currentColumn === 0) {
        currentColumn = 1;
        currentY = topMarginForSubsequent;
      } else {
        doc.addPage();
        currentColumn = 0;
        currentY = topMarginForSubsequent;
      }
    }
    
    const xPos = currentColumn === 0 ? leftColX : rightColX;
    
    // Team Header block
    doc.fillColor('#f8fafc').rect(xPos, currentY, colWidth, 18).fill();
    doc.strokeColor(borderLight).lineWidth(0.5).rect(xPos, currentY, colWidth, 18).stroke();
    
    doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(9).text(team, xPos + 6, currentY + 5, { width: colWidth - 12 });
    
    currentY += 22;
    
    // Render player names
    doc.font('Helvetica').fontSize(8.5).fillColor(textColor);
    players.forEach(p => {
      // Clean names of non-WinAnsi characters if any
      const safeName = p.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // strip accents just in case for standard Helvetica compliance
      doc.text(`- ${safeName}`, xPos + 8, currentY, { width: colWidth - 16 });
      currentY += 13;
    });
    
    currentY += 10; // margin below team block
  }
  
  // -------------------------------------------------------------
  // FOOTERS AND EXTRA HEADERS
  // -------------------------------------------------------------
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    
    // Header for page 2 onwards
    if (i > range.start) {
      doc.fillColor(primaryColor).rect(50, 45, 10, 20).fill();
      doc.fillColor(secondaryColor).rect(63, 45, 5, 20).fill();
      doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(11).text('FutbolAI Platform', 75, 45);
      doc.strokeColor(borderLight).lineWidth(1).moveTo(50, 70).lineTo(545, 70).stroke();
    }
    
    // Footer
    doc.strokeColor(borderLight).lineWidth(0.5).moveTo(50, 775).lineTo(545, 775).stroke();
    doc.fillColor(textColor).font('Helvetica').fontSize(7.5).text(`Página ${i + 1} de ${range.count}`, 50, 780, { align: 'right', width: 495 });
    doc.text('FutbolAI Platform - Reporte de Base de Datos local', 50, 780, { align: 'left', width: 300 });
  }
  
  doc.end();
  
  await new Promise((resolve, reject) => {
    stream.on('finish', resolve);
    stream.on('error', reject);
  });
  
  console.log('PDF Generated successfully at:', outputPath);
  
  // Copy to Desktop
  const desktopDir = 'C:\\Users\\franc\\OneDrive\\Escritorio';
  if (fs.existsSync(desktopDir)) {
    const desktopPath = path.join(desktopDir, outputName);
    fs.copyFileSync(outputPath, desktopPath);
    console.log('PDF Copied to Desktop successfully!');
  }
}

main().catch(e => {
  console.error('Error generating PDF:', e.message);
  process.exit(1);
});
