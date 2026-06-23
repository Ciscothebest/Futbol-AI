const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

async function main() {
  const doc = new PDFDocument({ 
    margin: 50,
    size: 'A4',
    bufferPages: true 
  });

  const outputName = 'expediente_campos_jugador.pdf';
  const outputPath = path.join(__dirname, '..', outputName);
  
  // Create write stream
  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);

  // Set colors
  const primaryColor = '#0f172a'; // slate-900
  const secondaryColor = '#0f766e'; // teal-700
  const accentColor = '#0d9488'; // teal-600
  const textColor = '#334155'; // slate-700
  const lightBg = '#f8fafc'; // slate-50
  const borderLight = '#cbd5e1'; // slate-300
  const codeColor = '#0284c7'; // sky-600

  // -------------------------------------------------------------
  // PAGE 1: TITLE & BIOGRAPHICAL DATA
  // -------------------------------------------------------------
  
  // Header logo placeholder
  doc.fillColor(primaryColor).rect(50, 45, 10, 25).fill();
  doc.fillColor(accentColor).rect(63, 45, 5, 25).fill();
  
  doc.fillColor(primaryColor)
     .font('Helvetica-Bold')
     .fontSize(14)
     .text('FutbolAI Platform', 75, 45)
     .fontSize(8)
     .font('Helvetica')
     .fillColor(textColor)
     .text('ESPECIFICACIÓN DE BASE DE DATOS', 75, 60);

  doc.strokeColor(borderLight).lineWidth(1).moveTo(50, 80).lineTo(545, 80).stroke();

  // Document Title
  doc.moveDown(1.5);
  doc.fillColor(primaryColor)
     .font('Helvetica-Bold')
     .fontSize(20)
     .text('Campos del Expediente de Jugador', { align: 'left' });
     
  doc.fontSize(11)
     .font('Helvetica-Oblique')
     .fillColor(textColor)
     .text('Estructura completa de datos para evitar fallos de renderizado en frontend y móvil.', { align: 'left' });
  
  doc.moveDown(1.5);
  doc.font('Helvetica-Bold')
     .fontSize(12)
     .fillColor(secondaryColor)
     .text('1. Introducción y Contexto');
     
  doc.font('Helvetica')
     .fontSize(9.5)
     .fillColor(textColor)
     .text('Esta especificación detalla las columnas necesarias en la tabla "Players" de la base de datos local (SQLite o SQL Server) del sistema FutbolAI. Para evitar fallas de renderizado y excepciones de conversión de tipos, se deben estructurar adecuadamente tanto las variables simples como los campos de texto serializado en JSON.', { align: 'justify' });
  
  doc.moveDown(1);
  doc.font('Helvetica-Bold')
     .fontSize(12)
     .fillColor(secondaryColor)
     .text('2. Datos Personales y Biográficos');
     
  doc.moveDown(0.5);

  // Table 1: Biographical Fields
  const headers1 = ['Campo BD', 'Tipo de Datos', 'Uso / Impacto de Fallo', 'Ejemplo (Messi)'];
  const colWidths1 = [85, 85, 185, 140];
  const rows1 = [
    ['id', 'STRING (PK)', 'ID único en kebab-case. Usado en búsquedas e indexación.', 'messi-lionel'],
    ['name', 'STRING', 'Nombre completo. Requerido para listados y vistas.', 'Lionel Messi'],
    ['nickname', 'STRING (Null)', 'Apodo popular. Opcional en el perfil.', 'La Pulga'],
    ['age', 'INTEGER', 'Edad. Requerido para cálculo de potencial y categorías.', '37'],
    ['nationality', 'STRING', 'Nacionalidad en inglés. Utilizado por la IA.', 'Argentine'],
    ['nationalityEs', 'STRING', 'Nacionalidad en español. Usado en traducciones.', 'Argentino'],
    ['flag', 'STRING', 'Emoji o código de la bandera nacional.', 'AR (Bandera)'],
    ['jerseyNumber', 'INTEGER (Null)', 'Número del dorsal actual del jugador.', '10'],
    ['bio', 'TEXT (Null)', 'Breve biografía en inglés.', 'Widely regarded...'],
    ['bioEs', 'TEXT (Null)', 'Breve biografía en español para versión ES.', 'Considerado el mejor...']
  ];

  let currentY = doc.y;
  
  // Draw table 1
  // Header background
  doc.fillColor(primaryColor).rect(50, currentY, 495, 20).fill();
  doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#ffffff');
  let tempX = 50;
  headers1.forEach((h, idx) => {
    doc.text(h, tempX + 5, currentY + 5, { width: colWidths1[idx] - 10 });
    tempX += colWidths1[idx];
  });
  
  currentY += 20;
  doc.font('Helvetica').fontSize(8).fillColor(textColor);
  
  rows1.forEach((row, rowIndex) => {
    let rHeight = 22;
    if (rowIndex % 2 === 1) {
      doc.fillColor(lightBg).rect(50, currentY, 495, rHeight).fill();
    }
    doc.strokeColor(borderLight).lineWidth(0.5).rect(50, currentY, 495, rHeight).stroke();
    
    let cellX = 50;
    row.forEach((cell, idx) => {
      doc.fillColor(idx === 0 ? primaryColor : textColor);
      doc.font(idx === 0 ? 'Helvetica-Bold' : 'Helvetica');
      doc.text(String(cell), cellX + 5, currentY + 6, { width: colWidths1[idx] - 10, height: rHeight - 8, ellipsis: true });
      cellX += colWidths1[idx];
    });
    currentY += rHeight;
  });

  // -------------------------------------------------------------
  // PAGE 2: ATHLETIC & PERFORMANCE DATA
  // -------------------------------------------------------------
  doc.addPage();
  
  // Header page 2
  doc.fillColor(primaryColor).rect(50, 45, 10, 20).fill();
  doc.fillColor(accentColor).rect(63, 45, 5, 20).fill();
  doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(11).text('FutbolAI Platform', 75, 45);
  doc.strokeColor(borderLight).lineWidth(1).moveTo(50, 70).lineTo(545, 70).stroke();
  
  doc.moveDown(1.5);
  doc.font('Helvetica-Bold')
     .fontSize(12)
     .fillColor(secondaryColor)
     .text('3. Datos Deportivos y de Rendimiento');
     
  doc.moveDown(0.5);

  const headers2 = ['Campo BD', 'Tipo de Datos', 'Uso / Impacto de Fallo', 'Ejemplo (Messi)'];
  const colWidths2 = [85, 85, 185, 140];
  const rows2 = [
    ['photoId', 'STRING', 'ID de SoFIFA (EA FC 25). Usado para armar la URL del rostro. Sin este, falla la foto.', '158023'],
    ['position', 'STRING', 'Código de la posición en inglés (ST, CF, LW, CB).', 'CF'],
    ['positionEs', 'STRING', 'Descripción de la posición en español.', 'Falso 9 / Atacante'],
    ['currentTeam', 'STRING', 'Club actual. Usado en simulación y escudos.', 'Inter Miami CF'],
    ['league', 'STRING', 'Liga a la que pertenece su club actual.', 'MLS'],
    ['country', 'STRING', 'País de la liga actual.', 'USA'],
    ['height', 'INTEGER (Null)', 'Altura del jugador en centímetros.', '170'],
    ['weight', 'INTEGER (Null)', 'Peso en kilogramos.', '67'],
    ['preferredFoot', 'STRING (Null)', 'Pie hábil ("Left" o "Right").', 'Left'],
    ['marketValue', 'BIGINT', 'Valor de mercado. El UI lo formatea como €XXM.', '35000000 (=> €35M)'],
    ['overallRating', 'FLOAT', 'Puntuación/Calificación general media.', '9.3']
  ];

  let currentY2 = doc.y;
  
  // Draw table 2
  doc.fillColor(primaryColor).rect(50, currentY2, 495, 20).fill();
  doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#ffffff');
  let tempX2 = 50;
  headers2.forEach((h, idx) => {
    doc.text(h, tempX2 + 5, currentY2 + 5, { width: colWidths2[idx] - 10 });
    tempX2 += colWidths2[idx];
  });
  
  currentY2 += 20;
  doc.font('Helvetica').fontSize(8).fillColor(textColor);
  
  rows2.forEach((row, rowIndex) => {
    let rHeight = 22;
    if (rowIndex % 2 === 1) {
      doc.fillColor(lightBg).rect(50, currentY2, 495, rHeight).fill();
    }
    doc.strokeColor(borderLight).lineWidth(0.5).rect(50, currentY2, 495, rHeight).stroke();
    
    let cellX = 50;
    row.forEach((cell, idx) => {
      doc.fillColor(idx === 0 ? primaryColor : textColor);
      doc.font(idx === 0 ? 'Helvetica-Bold' : 'Helvetica');
      doc.text(String(cell), cellX + 5, currentY2 + 6, { width: colWidths2[idx] - 10, height: rHeight - 8, ellipsis: true });
      cellX += colWidths2[idx];
    });
    currentY2 += rHeight;
  });

  doc.moveDown(2);
  doc.font('Helvetica-Bold')
     .fontSize(11)
     .fillColor(primaryColor)
     .text('Nota Crítica sobre photoId:');
  doc.font('Helvetica')
     .fontSize(9)
     .fillColor(textColor)
     .text('El campo "photoId" almacena el ID numérico de jugador de EA FC. El backend levanta este valor para resolver la ruta de la imagen usando el cdn oficial: `https://cdn.sofifa.net/players/p1/p2/year_120.png`. Si el campo está ausente o es incorrecto, el frontend no cargará la imagen de perfil del jugador y recurrirá a un avatar genérico basado en el nombre, disminuyendo la calidad estética del sitio web.', { align: 'justify' });

  // -------------------------------------------------------------
  // PAGE 3: COMPLEX FIELDS (JSON)
  // -------------------------------------------------------------
  doc.addPage();
  
  // Header page 3
  doc.fillColor(primaryColor).rect(50, 45, 10, 20).fill();
  doc.fillColor(accentColor).rect(63, 45, 5, 20).fill();
  doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(11).text('FutbolAI Platform', 75, 45);
  doc.strokeColor(borderLight).lineWidth(1).moveTo(50, 70).lineTo(545, 70).stroke();

  doc.moveDown(1.5);
  doc.font('Helvetica-Bold')
     .fontSize(12)
     .fillColor(secondaryColor)
     .text('4. Estructuras de Datos Complejas (JSON en Base de Datos)');
     
  doc.font('Helvetica')
     .fontSize(9.5)
     .fillColor(textColor)
     .text('En la base de datos SQL local, las columnas siguientes se definen como TEXT. Deben insertarse como JSON strings (por ejemplo, mediante JSON.stringify en Node) para que los getters del ORM o el código de la app cliente los deserialicen correctamente.', { align: 'justify' });
  
  doc.moveDown(1.5);

  // Render stats example
  doc.font('Helvetica-Bold').fontSize(10).fillColor(primaryColor).text('A. Campo: stats (Objeto JSON)');
  doc.font('Helvetica').fontSize(9).fillColor(textColor).text('Estadísticas básicas de la temporada vigente. Utilizado para los gráficos estadísticos rápidos.', { align: 'left' });
  doc.moveDown(0.2);
  doc.fillColor(lightBg).rect(50, doc.y, 495, 45).fill();
  doc.strokeColor(borderLight).rect(50, doc.y, 495, 45).stroke();
  doc.font('Courier').fontSize(8.5).fillColor(codeColor)
     .text('{\n  "season": "2024-25", "matches": 31, "goals": 19, "assists": 15, "yellowCards": 1\n}', 60, doc.y + 7);

  doc.y += 18; // advance manually to offset the text positioning

  // Render careerTotals example
  doc.moveDown(1.5);
  doc.font('Helvetica-Bold').fontSize(10).fillColor(primaryColor).text('B. Campo: careerTotals (Objeto JSON)');
  doc.font('Helvetica').fontSize(9).fillColor(textColor).text('Acumulados globales del jugador a lo largo de toda su trayectoria profesional.', { align: 'left' });
  doc.moveDown(0.2);
  doc.fillColor(lightBg).rect(50, doc.y, 495, 35).fill();
  doc.strokeColor(borderLight).rect(50, doc.y, 495, 35).stroke();
  doc.font('Courier').fontSize(8.5).fillColor(codeColor)
     .text('{\n  "goals": 840, "assists": 380, "matches": 1020\n}', 60, doc.y + 7);

  doc.y += 10;

  // Render trophies, transfers, strengths, tags
  doc.moveDown(1.5);
  doc.font('Helvetica-Bold').fontSize(10).fillColor(primaryColor).text('C. Campos de Arrays Simples: trophies, strengths, tags (Arrays JSON)');
  doc.font('Helvetica').fontSize(9).fillColor(textColor).text('Listados para renderizado de etiquetas e insignias tácticas en el modal del jugador.', { align: 'left' });
  doc.moveDown(0.2);
  doc.fillColor(lightBg).rect(50, doc.y, 495, 60).fill();
  doc.strokeColor(borderLight).rect(50, doc.y, 495, 60).stroke();
  doc.font('Courier').fontSize(8.5).fillColor(codeColor)
     .text('trophies:  ["World Cup 2022", "Copa America x2", "UCL x4", "La Liga x10", "Ballon d\'Or x8"]\nstrengths: ["Dribbling", "Vision", "Free kicks", "Goals", "Assists", "Leadership"]\ntags:      ["GOAT", "legend", "world-cup-winner", "dribbler", "creator"]', 60, doc.y + 7);

  doc.y += 35;

  // Render transfers example
  doc.moveDown(1.5);
  doc.font('Helvetica-Bold').fontSize(10).fillColor(primaryColor).text('D. Campo: transfers (Array de Objetos JSON)');
  doc.font('Helvetica').fontSize(9).fillColor(textColor).text('Cronología de los traspasos más importantes o recientes del jugador.', { align: 'left' });
  doc.moveDown(0.2);
  doc.fillColor(lightBg).rect(50, doc.y, 495, 45).fill();
  doc.strokeColor(borderLight).rect(50, doc.y, 495, 45).stroke();
  doc.font('Courier').fontSize(8.5).fillColor(codeColor)
     .text('[\n  { "year": 2023, "from": "PSG", "to": "Inter Miami CF", "fee": "Free" },\n  { "year": 2021, "from": "FC Barcelona", "to": "PSG", "fee": "Free" }\n]', 60, doc.y + 7);

  // -------------------------------------------------------------
  // PAGE 4: HISTORY AND SQL EXAMPLE
  // -------------------------------------------------------------
  doc.addPage();
  
  // Header page 4
  doc.fillColor(primaryColor).rect(50, 45, 10, 20).fill();
  doc.fillColor(accentColor).rect(63, 45, 5, 20).fill();
  doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(11).text('FutbolAI Platform', 75, 45);
  doc.strokeColor(borderLight).lineWidth(1).moveTo(50, 70).lineTo(545, 70).stroke();

  doc.moveDown(1.5);
  doc.font('Helvetica-Bold')
     .fontSize(10)
     .fillColor(primaryColor)
     .text('E. Campo: history (Array de Objetos JSON - Rendimiento y Parte Médico)');
  doc.font('Helvetica')
     .fontSize(9)
     .fillColor(textColor)
     .text('Define las estadísticas detalladas año por año. Si hay lesiones registradas en alguna temporada (campo "injuries" distinto de "None"), el sistema calcula si el jugador está inactivo en la vista clínica.', { align: 'justify' });
  doc.moveDown(0.2);
  doc.fillColor(lightBg).rect(50, doc.y, 495, 60).fill();
  doc.strokeColor(borderLight).rect(50, doc.y, 495, 60).stroke();
  doc.font('Courier').fontSize(8).fillColor(codeColor)
     .text('[\n  { "season": "2024/25", "team": "Inter Miami CF", "matches": 31, "goals": 19, "assists": 15, "rating": 9.3, "injuries": "None" },\n  { "season": "2023/24", "team": "Inter Miami CF", "matches": 38, "goals": 17, "assists": 13, "rating": 7.1, "injuries": "Hamstring (3 weeks)" }\n]', 60, doc.y + 5);

  doc.y += 35;

  doc.moveDown(1.5);
  doc.font('Helvetica-Bold')
     .fontSize(12)
     .fillColor(secondaryColor)
     .text('5. Ejemplo de Sentencia de Inserción SQL Directa');
     
  doc.font('Helvetica')
     .fontSize(9)
     .fillColor(textColor)
     .text('A continuación, se detalla una consulta SQL para poblar de forma directa a Lionel Messi con su estructura de datos completa:', { align: 'justify' });
  
  doc.moveDown(0.3);
  
  const sqlText = `INSERT INTO Players (
  id, name, photoId, nickname, age, nationality, nationalityEs, flag,
  position, positionEs, currentTeam, league, country, jerseyNumber, height,
  weight, preferredFoot, marketValue, overallRating, stats, careerTotals,
  trophies, transfers, bio, bioEs, strengths, tags, history, createdAt, updatedAt
) VALUES (
  'messi-lionel', 'Lionel Messi', '158023', 'La Pulga', 37, 'Argentine', 'Argentino',
  'AR', 'CF', 'Falso 9 / Atacante', 'Inter Miami CF', 'MLS', 'USA', 10, 170, 67, 'Left',
  35000000, 9.3,
  '{"season":"2024-25","matches":31,"goals":19,"assists":15,"yellowCards":1}',
  '{"goals":840,"assists":380,"matches":1020}',
  '["World Cup 2022","Copa America x2","UCL x4","La Liga x10","Ballon d''Or x8"]',
  '[{"year":2023,"from":"PSG","to":"Inter Miami CF","fee":"Free"},{"year":2021,"from":"FC Barcelona","to":"PSG","fee":"Free"}]',
  'Widely regarded as the greatest footballer of all time...',
  'Considerado el mejor futbolista de todos los tiempos...',
  '["Dribbling","Vision","Free kicks","Goals","Assists","Leadership"]',
  '["GOAT","legend","world-cup-winner","dribbler","creator"]',
  '[{"season":"2024/25","team":"Inter Miami CF","matches":31,"goals":19,"assists":15,"yellowCards":1,"rating":9.3,"injuries":"None"}]',
  datetime('now'), datetime('now')
);`;

  doc.fillColor(lightBg).rect(50, doc.y, 495, 175).fill();
  doc.strokeColor(borderLight).rect(50, doc.y, 495, 175).stroke();
  doc.font('Courier').fontSize(7.2).fillColor(codeColor)
     .text(sqlText, 55, doc.y + 6, { width: 485, lineGap: 1.5 });

  doc.y += 140;

  // -------------------------------------------------------------
  // FOOTER PAGINATOR (using bufferPages)
  // -------------------------------------------------------------
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    doc.strokeColor(borderLight).lineWidth(0.5).moveTo(50, 780).lineTo(545, 780).stroke();
    doc.fillColor(textColor)
       .font('Helvetica')
       .fontSize(8)
       .text(`Página ${i + 1} de ${range.count}`, 50, 786, { align: 'right', width: 495 });
    doc.text('FutbolAI Platform - Especificación del Expediente del Jugador © 2026', 50, 786, { align: 'left', width: 300 });
  }

  // End document
  doc.end();

  // Handle stream end
  await new Promise((resolve, reject) => {
    stream.on('finish', resolve);
    stream.on('error', reject);
  });

  console.log('PDF Generated Successfully at:', outputPath);

  // Copy to Desktop if directory exists
  const desktopDir = 'C:\\Users\\franc\\OneDrive\\Escritorio';
  if (fs.existsSync(desktopDir)) {
    const desktopPath = path.join(desktopDir, outputName);
    fs.copyFileSync(outputPath, desktopPath);
    console.log('PDF Copied to Desktop successfully at:', desktopPath);
  }
}

main().catch(e => {
  console.error('Error generating PDF:', e.message);
  process.exit(1);
});
