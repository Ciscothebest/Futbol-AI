const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

// Paths
const schemaPath = path.join(__dirname, 'schema_full.json');
if (!fs.existsSync(schemaPath)) {
  console.error('schema_full.json not found!');
  process.exit(1);
}

const dbTables = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

// Target Output Paths
const desktopPath = 'C:\\Users\\franc\\OneDrive\\Escritorio\\diagrama_entidad_relacion_futbolai.pdf';
const localFolderDir = 'C:\\Users\\franc\\OneDrive\\Escritorio\\Futbol AI Local';
const localFolderPath = path.join(localFolderDir, 'diagrama_entidad_relacion_futbolai.pdf');
const workspacePath = path.join(__dirname, '..', 'diagrama_entidad_relacion_futbolai.pdf');

// Colors
const colors = {
  primary: '#0F172A',      // Slate 900
  secondary: '#0D9488',    // Teal 600
  darkText: '#1E293B',     // Slate 800
  mutedText: '#64748B',    // Slate 500
  lightBg: '#F8FAFC',      // Slate 50
  border: '#94A3B8',       // Slate 400
  
  // Line routing colors
  lineColor: '#2563EB',    // Royal Blue
  lineBg: '#EFF6FF',      // Blue 50
  
  // Domains
  usersDomain: '#1E3A8A',     // Dark Blue
  playersDomain: '#065F46',   // Emerald / Green
  competitionsDomain: '#581C87', // Purple
  financeDomain: '#78350F',   // Amber / Brown
  socialDomain: '#0369A1',    // Sky / Cyan
  logsDomain: '#9F1239',      // Rose / Crimson
  systemDomain: '#334155'     // Slate
};

const domainMeta = {
  users: { name: 'Usuarios & Autenticación', color: colors.usersDomain, tag: 'USERS' },
  passkeys: { name: 'Seguridad Biométrica', color: colors.usersDomain, tag: 'AUTH' },
  expired_registrations: { name: 'Registros Vencidos', color: colors.usersDomain, tag: 'AUTH' },
  
  players: { name: 'Scouting Profesional', color: colors.playersDomain, tag: 'SCOUTING' },
  Prospects: { name: 'Canteranos / Prospectos', color: colors.playersDomain, tag: 'PROSPECTS' },
  
  leagues: { name: 'Ligas de Fútbol', color: colors.competitionsDomain, tag: 'COMPETITION' },
  teams: { name: 'Equipos y Clubes', color: colors.competitionsDomain, tag: 'COMPETITION' },
  
  payment_methods: { name: 'Métodos de Pago', color: colors.financeDomain, tag: 'FINANCE' },
  payments: { name: 'Transacciones', color: colors.financeDomain, tag: 'FINANCE' },
  
  direct_messages: { name: 'Mensajería Directa', color: colors.socialDomain, tag: 'SOCIAL' },
  user_contacts: { name: 'Contactos Scout', color: colors.socialDomain, tag: 'SOCIAL' },
  
  query_logs: { name: 'Logs Consultas IA', color: colors.logsDomain, tag: 'AUDIT' },
  comparison_logs: { name: 'Logs Comparativas', color: colors.logsDomain, tag: 'AUDIT' },
  favorite_logs: { name: 'Logs Favoritos', color: colors.logsDomain, tag: 'AUDIT' },
  
  sysdiagrams: { name: 'Sistema MS SQL', color: colors.systemDomain, tag: 'SYSTEM' }
};

function generatePDF() {
  const doc = new PDFDocument({
    autoFirstPage: false,
    bufferPages: true
  });

  const stream = fs.createWriteStream(workspacePath);
  doc.pipe(stream);

  // =========================================================================
  // PAGE 1: PORTADA & ARQUITECTURA GENERAL (A4 Portrait)
  // =========================================================================
  doc.addPage({ size: 'A4', margin: 40 });

  // Header Banner
  doc.rect(40, 30, 515, 60).fill(colors.primary);
  doc.fillColor('#FFFFFF').fontSize(18).font('Helvetica-Bold').text('FUTBOL AI PLATFORM', 55, 45);
  doc.fillColor('#94A3B8').fontSize(9.5).font('Helvetica').text('DIAGRAMA ENTIDAD-RELACION (ERD) COMPLETO Y DOCUMENTACION TECNICA', 55, 66);

  let y = 110;
  doc.fillColor(colors.primary).fontSize(20).font('Helvetica-Bold').text('ARQUITECTURA DE BASE DE DATOS (100% CAMPOS)', 40, y);
  doc.fillColor(colors.mutedText).fontSize(9.5).font('Helvetica').text(`Generado el: ${new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} | Instancia: FutbolAI (MS SQL Server)`, 40, y + 24);

  y += 55;
  // Summary Card
  doc.rect(40, y, 515, 105).fillAndStroke(colors.lightBg, colors.border);
  doc.fillColor(colors.secondary).fontSize(12).font('Helvetica-Bold').text('RESUMEN ESTADISTICO Y REGLAS DE TRAZADO', 55, y + 15);

  let totalCols = 0;
  let totalFKs = 0;
  Object.values(dbTables).forEach(t => {
    totalCols += t.columns.length;
    totalFKs += t.foreignKeys.length;
  });

  doc.fillColor(colors.darkText).fontSize(9.5).font('Helvetica')
     .text(`• Total de Tablas Documentadas: 15 tablas (14 de aplicación + 1 de sistema MS SQL)`, 55, y + 34)
     .text(`• Total de Campos / Columnas Mapeados: ${totalCols} columnas (100% de la Base de Datos)`, 55, y + 50)
     .text(`• Total de Relaciones (Foreign Keys): ${totalFKs} llaves foráneas explicitas`, 55, y + 66)
     .text(`• Canales de Conexión Libres: Trazado ortogonal por pasillos sin solapamiento de cajas ni texto.`, 55, y + 82);

  y += 130;

  // Domain Legend Section
  doc.fillColor(colors.primary).fontSize(13).font('Helvetica-Bold').text('DOMINIOS FUNCIONALES DE LA BASE DE DATOS', 40, y);
  y += 20;

  const legendItems = [
    { name: 'Usuarios & Autenticación', color: colors.usersDomain, count: `users (46), passkeys (8), expired_registrations (2)` },
    { name: 'Scouting & Prospectos', color: colors.playersDomain, count: `players (29), Prospects (36)` },
    { name: 'Competiciones & Clubes', color: colors.competitionsDomain, count: `leagues (4), teams (4)` },
    { name: 'Finanzas & Suscripciones', color: colors.financeDomain, count: `payment_methods (12), payments (10)` },
    { name: 'Mensajería & Social', color: colors.socialDomain, count: `direct_messages (7), user_contacts (6)` },
    { name: 'Trazabilidad & Logs IA', color: colors.logsDomain, count: `query_logs (5), comparison_logs (6), favorite_logs (6)` },
    { name: 'Sistema Database', color: colors.systemDomain, count: `sysdiagrams (5)` }
  ];

  legendItems.forEach(item => {
    doc.rect(40, y, 16, 16).fill(item.color);
    doc.fillColor(colors.darkText).fontSize(9.5).font('Helvetica-Bold').text(item.name, 65, y + 2);
    doc.fillColor(colors.mutedText).fontSize(8.5).font('Helvetica').text(`— ${item.count}`, 230, y + 2);
    y += 22;
  });

  y += 20;
  // Simbology Legend Box
  doc.fillColor(colors.primary).fontSize(13).font('Helvetica-Bold').text('LEYENDA DE ETIQUETAS Y SIMBOLOGIA', 40, y);
  y += 20;

  doc.rect(40, y, 515, 70).fillAndStroke('#F1F5F9', colors.border);
  
  // PK Badge
  doc.rect(55, y + 10, 26, 12).fill('#FEF3C7');
  doc.fillColor('#B45309').fontSize(7.5).font('Helvetica-Bold').text('[PK]', 59, y + 12);
  doc.fillColor(colors.darkText).fontSize(9).font('Helvetica').text('Primary Key (Llave Primaria única de la tabla)', 90, y + 12);

  // FK Badge
  doc.rect(55, y + 28, 26, 12).fill('#E0E7FF');
  doc.fillColor('#3730A3').fontSize(7.5).font('Helvetica-Bold').text('[FK]', 59, y + 30);
  doc.fillColor(colors.darkText).fontSize(9).font('Helvetica').text('Foreign Key (Llave Foránea referenciada)', 90, y + 30);

  // Line Connector
  doc.save();
  doc.lineWidth(1.5).strokeColor(colors.lineColor).dash(4, { space: 2 }).moveTo(55, y + 54).lineTo(80, y + 54).stroke();
  doc.restore();
  doc.fillColor(colors.darkText).fontSize(9).font('Helvetica').text('Línea de Conexión 1:N por Pasillo Libre (Sin cruzar ninguna caja ni texto)', 90, y + 50);

  // Bottom Callout
  doc.fillColor(colors.secondary).fontSize(10.5).font('Helvetica-Bold')
     .text('👉 En la Página 2 se despliega el MAPA ERD MASTER (A2 Panorámico) con el 100% de los campos.', 40, 770);


  // =========================================================================
  // PAGE 2: MAPA ERD MASTER A2 LANDSCAPE (1684 x 1190 pt) - 100% DE LOS CAMPOS
  // =========================================================================
  doc.addPage({ size: 'A2', layout: 'landscape', margin: 30 });

  // Header Banner A2
  doc.rect(30, 20, 1624, 45).fill(colors.primary);
  doc.fillColor('#FFFFFF').fontSize(18).font('Helvetica-Bold').text('FUTBOL AI — MAPA ENTIDAD - RELACION MASTER (100% CAMPOS Y TABLAS DE BASE DE DATOS)', 45, 33);
  doc.fillColor('#94A3B8').fontSize(9.5).font('Helvetica').text('MICROSOFT SQL SERVER | BASE DE DATOS: FutbolAI | TOTAL CAMPOS: 186 | CONEXIONES SIN INTERSECCION DE TEXTO', 1634, 35, { align: 'right' });

  // Draw Entity Box Function (Renders 100% of fields)
  function drawMasterBox(tableName, x, y, width = 360) {
    const tableInfo = dbTables[tableName];
    const meta = domainMeta[tableName] || { name: tableName, color: colors.primary, tag: 'DB' };

    const headerHeight = 24;
    const rowHeight = 11.5;
    const padding = 8;
    const totalHeight = headerHeight + (tableInfo.columns.length * rowHeight) + padding;

    // Background Card
    doc.rect(x, y, width, totalHeight).fillAndStroke('#FFFFFF', colors.border);

    // Header
    doc.rect(x, y, width, headerHeight).fill(meta.color);
    doc.fillColor('#FFFFFF').fontSize(10).font('Helvetica-Bold').text(`TABLA: ${tableName.toUpperCase()}`, x + 10, y + 6);
    doc.fillColor('#E2E8F0').fontSize(8).font('Helvetica').text(`(${tableInfo.columns.length} campos)`, x + width - 90, y + 7, { align: 'right', width: 80 });

    // Render 100% of Columns
    let cy = y + headerHeight + 4;
    tableInfo.columns.forEach((col, idx) => {
      const isPk = !!col.IS_PRIMARY_KEY;
      const fkInfo = tableInfo.foreignKeys.find(f => f.parent_column === col.COLUMN_NAME);
      const isFk = !!fkInfo;
      const isNullable = col.IS_NULLABLE === 'YES';

      const typeStr = col.DATA_TYPE + (col.CHARACTER_MAXIMUM_LENGTH ? `(${col.CHARACTER_MAXIMUM_LENGTH === -1 ? 'MAX' : col.CHARACTER_MAXIMUM_LENGTH})` : '');
      const bgRow = idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC';

      doc.rect(x + 2, cy - 1, width - 4, rowHeight).fill(bgRow);

      // Badge PK/FK
      let badgeX = x + 6;
      if (isPk) {
        doc.rect(badgeX, cy, 22, 9.5).fill('#FEF3C7');
        doc.fillColor('#B45309').fontSize(6.5).font('Helvetica-Bold').text('[PK]', badgeX + 3, cy + 1.5);
        badgeX += 26;
      }
      if (isFk) {
        doc.rect(badgeX, cy, 22, 9.5).fill('#E0E7FF');
        doc.fillColor('#3730A3').fontSize(6.5).font('Helvetica-Bold').text('[FK]', badgeX + 3, cy + 1.5);
        badgeX += 26;
      }
      if (!isPk && !isFk) {
        doc.fillColor(colors.mutedText).fontSize(7).font('Helvetica').text(' • ', badgeX, cy + 1);
        badgeX += 12;
      }

      // Column Name
      const colFont = (isPk || isFk) ? 'Helvetica-Bold' : 'Helvetica';
      const colColor = isPk ? '#B45309' : (isFk ? colors.lineColor : colors.darkText);

      doc.fillColor(colColor).fontSize(7.5).font(colFont).text(col.COLUMN_NAME, badgeX, cy + 1, { width: 145, lineBreak: false });

      // Data Type
      doc.fillColor('#475569').fontSize(7).font('Helvetica').text(typeStr, x + width - 135, cy + 1, { width: 75, align: 'left', lineBreak: false });

      // Nullability
      if (isNullable) {
        doc.fillColor(colors.mutedText).fontSize(6.5).font('Helvetica').text('NULL', x + width - 50, cy + 1, { width: 45, align: 'right' });
      } else {
        doc.fillColor('#B91C1C').fontSize(6.5).font('Helvetica-Bold').text('NOT NULL', x + width - 50, cy + 1, { width: 45, align: 'right' });
      }

      cy += rowHeight;
    });

    return {
      x, y, w: width, h: totalHeight,
      leftPort: { x: x, y: y + 40 },
      rightPort: { x: x + width, y: y + 40 },
      bottomPort: { x: x + width / 2, y: y + totalHeight },
      topPort: { x: x + width / 2, y: y }
    };
  }

  // Layout Positions Grid (4 Columns + Free Routing Channels)
  const pos = {};

  // Column 1 (x: 40, width: 340)
  pos.expired_registrations = drawMasterBox('expired_registrations', 40, 85, 340);
  pos.passkeys = drawMasterBox('passkeys', 40, 160, 340);
  pos.direct_messages = drawMasterBox('direct_messages', 40, 310, 340);
  pos.user_contacts = drawMasterBox('user_contacts', 40, 445, 340);
  pos.query_logs = drawMasterBox('query_logs', 40, 565, 340);
  pos.comparison_logs = drawMasterBox('comparison_logs', 40, 675, 340);
  pos.favorite_logs = drawMasterBox('favorite_logs', 40, 795, 340);

  // Column 2 (x: 430, width: 380) — Central users entity
  pos.users = drawMasterBox('users', 430, 85, 380); // Height: 46 * 11.5 + 32 = 561 pt
  pos.leagues = drawMasterBox('leagues', 430, 680, 380);
  pos.teams = drawMasterBox('teams', 430, 780, 380);
  pos.sysdiagrams = drawMasterBox('sysdiagrams', 430, 880, 380);

  // Column 3 (x: 860, width: 370)
  pos.players = drawMasterBox('players', 860, 85, 370);
  pos.payment_methods = drawMasterBox('payment_methods', 860, 460, 370);
  pos.payments = drawMasterBox('payments', 860, 640, 370);

  // Column 4 (x: 1270, width: 380)
  pos.Prospects = drawMasterBox('Prospects', 1270, 85, 380);

  // Clean Vector Connection Routing Function (Channel Routing)
  function drawChannelConnector(fromBox, toBox, label, channelX) {
    doc.save();
    doc.lineWidth(1.5).strokeColor(colors.lineColor).dash(4, { space: 2 });

    const y1 = fromBox.y + 35; // Port near top/FK field
    const y2 = toBox.y + 35;   // Port near top/PK field

    let x1, x2;
    if (fromBox.x < channelX) {
      x1 = fromBox.x + fromBox.w; // Right edge of fromBox
    } else {
      x1 = fromBox.x;             // Left edge of fromBox
    }

    if (toBox.x < channelX) {
      x2 = toBox.x + toBox.w;     // Right edge of toBox
    } else {
      x2 = toBox.x;               // Left edge of toBox
    }

    // Orthogonal path in Channel: (x1, y1) -> (channelX, y1) -> (channelX, y2) -> (x2, y2)
    doc.moveTo(x1, y1)
       .lineTo(channelX, y1)
       .lineTo(channelX, y2)
       .lineTo(x2, y2)
       .stroke();

    // Start/End Badges (1:N)
    doc.circle(x1, y1, 3).fill(colors.lineColor);
    doc.rect(x2 - 3, y2 - 3, 6, 6).fill(colors.primary);

    // Label Badge in Channel
    if (label) {
      const midY = (y1 + y2) / 2;
      doc.rect(channelX - 35, midY - 7, 70, 14).fillAndStroke(colors.lineBg, colors.lineColor);
      doc.fontSize(7).font('Helvetica-Bold').fillColor(colors.lineColor)
         .text(label, channelX - 35, midY - 4, { width: 70, align: 'center' });
    }

    doc.restore();
  }

  // Route All Relationships through Free Channels (Zero Overlap!)
  // Channel 1 (between Col 1 & Col 2): x = 405
  drawChannelConnector(pos.passkeys, pos.users, '1:N (userId)', 405);
  drawChannelConnector(pos.direct_messages, pos.users, '1:N (sender)', 405);
  drawChannelConnector(pos.user_contacts, pos.users, '1:N (userId)', 405);
  drawChannelConnector(pos.query_logs, pos.users, '1:N (userId)', 405);
  drawChannelConnector(pos.comparison_logs, pos.users, '1:N (userId)', 405);
  drawChannelConnector(pos.favorite_logs, pos.users, '1:N (userId)', 405);

  // Channel 2 (between Col 2 & Col 3): x = 835
  drawChannelConnector(pos.players, pos.users, '1:N (userId)', 835);
  drawChannelConnector(pos.payment_methods, pos.users, '1:N (userId)', 835);
  drawChannelConnector(pos.payments, pos.users, '1:N (userId)', 835);

  // Channel 3 (between Col 3 & Col 4): x = 1250 -> route to top of users
  doc.save();
  doc.lineWidth(1.5).strokeColor(colors.lineColor).dash(4, { space: 2 });
  // Prospects to users: Route around top
  const px1 = pos.Prospects.x;
  const py1 = pos.Prospects.y + 35;
  const px2 = pos.users.x + pos.users.w;
  const py2 = pos.users.y + 50;

  doc.moveTo(px1, py1)
     .lineTo(1250, py1)
     .lineTo(1250, 68)
     .lineTo(835, 68)
     .lineTo(835, py2)
     .lineTo(px2, py2)
     .stroke();

  doc.circle(px1, py1, 3).fill(colors.lineColor);
  doc.rect(px2 - 3, py2 - 3, 6, 6).fill(colors.primary);

  doc.rect(1040, 61, 80, 14).fillAndStroke(colors.lineBg, colors.lineColor);
  doc.fontSize(7).font('Helvetica-Bold').fillColor(colors.lineColor)
     .text('1:N (userId)', 1040, 64, { width: 80, align: 'center' });
  doc.restore();


  // =========================================================================
  // PAGES 3 to 7: VISTAS DETALLADAS DE MODULOS RELACIONALES (A4 Landscape)
  // =========================================================================
  
  // Helper for Module Zoom Page Header
  function drawModuleHeader(moduleTitle, subtitle) {
    doc.rect(40, 25, 762, 45).fill(colors.primary);
    doc.fillColor('#FFFFFF').fontSize(15).font('Helvetica-Bold').text(moduleTitle, 55, 36);
    doc.fillColor('#94A3B8').fontSize(9).font('Helvetica').text(subtitle, 55, 53);
  }

  // Draw Detailed Table Box for Module Pages (A4 Landscape: 842 x 595 pt)
  function drawDetailTable(tableName, x, y, width = 360) {
    const info = dbTables[tableName];
    const meta = domainMeta[tableName] || { name: tableName, color: colors.primary, tag: 'DB' };

    const headerH = 22;
    const rowH = 11;
    const totalH = headerH + (info.columns.length * rowH) + 6;

    doc.rect(x, y, width, totalH).fillAndStroke('#FFFFFF', colors.border);

    doc.rect(x, y, width, headerH).fill(meta.color);
    doc.fillColor('#FFFFFF').fontSize(9.5).font('Helvetica-Bold').text(`TABLA: ${tableName}`, x + 8, y + 5);
    doc.fillColor('#E2E8F0').fontSize(8).font('Helvetica').text(`${info.columns.length} campos`, x + width - 75, y + 6, { align: 'right', width: 65 });

    let cy = y + headerH + 3;
    info.columns.forEach((c, i) => {
      const isPk = !!c.IS_PRIMARY_KEY;
      const isFk = info.foreignKeys.some(f => f.parent_column === c.COLUMN_NAME);
      const isNull = c.IS_NULLABLE === 'YES';
      const typeStr = c.DATA_TYPE + (c.CHARACTER_MAXIMUM_LENGTH ? `(${c.CHARACTER_MAXIMUM_LENGTH === -1 ? 'MAX' : c.CHARACTER_MAXIMUM_LENGTH})` : '');

      doc.rect(x + 2, cy - 1, width - 4, rowH).fill(i % 2 === 0 ? '#FFFFFF' : '#F8FAFC');

      let bx = x + 5;
      if (isPk) {
        doc.rect(bx, cy, 22, 9).fill('#FEF3C7');
        doc.fillColor('#B45309').fontSize(6.5).font('Helvetica-Bold').text('[PK]', bx + 3, cy + 1);
        bx += 25;
      }
      if (isFk) {
        doc.rect(bx, cy, 22, 9).fill('#E0E7FF');
        doc.fillColor('#3730A3').fontSize(6.5).font('Helvetica-Bold').text('[FK]', bx + 3, cy + 1);
        bx += 25;
      }
      if (!isPk && !isFk) {
        doc.fillColor(colors.mutedText).fontSize(7).font('Helvetica').text('•', bx + 4, cy + 1);
        bx += 12;
      }

      const colFont = (isPk || isFk) ? 'Helvetica-Bold' : 'Helvetica';
      const colColor = isPk ? '#B45309' : (isFk ? colors.lineColor : colors.darkText);

      doc.fillColor(colColor).fontSize(7.5).font(colFont).text(c.COLUMN_NAME, bx, cy + 1, { width: 140, lineBreak: false });
      doc.fillColor('#475569').fontSize(7).font('Helvetica').text(typeStr, x + width - 130, cy + 1, { width: 70 });
      
      if (isNull) {
        doc.fillColor(colors.mutedText).fontSize(6.5).font('Helvetica').text('NULL', x + width - 50, cy + 1, { width: 45, align: 'right' });
      } else {
        doc.fillColor('#B91C1C').fontSize(6.5).font('Helvetica-Bold').text('NOT NULL', x + width - 50, cy + 1, { width: 45, align: 'right' });
      }

      cy += rowH;
    });

    return { x, y, w: width, h: totalH };
  }

  // --- PAGE 3: MODULE ZOOM 1 - USERS & AUTH ---
  doc.addPage({ size: 'A4', layout: 'landscape', margin: 40 });
  drawModuleHeader('MÓDULO 1: USUARIOS, AUTENTICACIÓN Y PASSKEYS', 'Desglose completo de campos de las tablas users, passkeys y expired_registrations');
  
  drawDetailTable('users', 40, 85, 370);
  drawDetailTable('passkeys', 440, 85, 360);
  drawDetailTable('expired_registrations', 440, 240, 360);

  // --- PAGE 4: MODULE ZOOM 2 - SCOUTING & PROSPECTS ---
  doc.addPage({ size: 'A4', layout: 'landscape', margin: 40 });
  drawModuleHeader('MÓDULO 2: SCOUTING PROFESIONAL Y EXPEDIENTES DE CANTERANOS', 'Desglose completo de campos de las tablas players y Prospects');
  
  drawDetailTable('players', 40, 85, 370);
  drawDetailTable('Prospects', 430, 85, 370);

  // --- PAGE 5: MODULE ZOOM 3 - FINANCES & PAYMENTS ---
  doc.addPage({ size: 'A4', layout: 'landscape', margin: 40 });
  drawModuleHeader('MÓDULO 3: FINANZAS, MÉTODOS DE PAGO Y COBROS', 'Desglose completo de campos de las tablas payment_methods y payments');
  
  drawDetailTable('payment_methods', 40, 85, 370);
  drawDetailTable('payments', 430, 85, 370);

  // --- PAGE 6: MODULE ZOOM 4 - SOCIAL & MESSAGING ---
  doc.addPage({ size: 'A4', layout: 'landscape', margin: 40 });
  drawModuleHeader('MÓDULO 4: COMUNICACIÓN DIRECTA Y CONTACTOS SOCIALES', 'Desglose completo de campos de las tablas direct_messages y user_contacts');
  
  drawDetailTable('direct_messages', 40, 85, 370);
  drawDetailTable('user_contacts', 430, 85, 370);

  // --- PAGE 7: MODULE ZOOM 5 - LOGS, COMPETITIONS & SYSTEM ---
  doc.addPage({ size: 'A4', layout: 'landscape', margin: 40 });
  drawModuleHeader('MÓDULO 5: AUDIT LOGS, COMPETICIONES Y SISTEMA SQL', 'Desglose de query_logs, comparison_logs, favorite_logs, leagues, teams y sysdiagrams');
  
  drawDetailTable('query_logs', 40, 85, 240);
  drawDetailTable('comparison_logs', 40, 210, 240);
  drawDetailTable('favorite_logs', 40, 350, 240);

  drawDetailTable('leagues', 300, 85, 240);
  drawDetailTable('teams', 300, 210, 240);

  drawDetailTable('sysdiagrams', 560, 85, 240);


  // Footer Pass across all Pages
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    doc.save();

    let pWidth = 515; // Page 1 A4 Portrait
    let pFooterY = 805;

    if (i === 1) { // Page 2 A2 Landscape (1684 x 1190)
      pWidth = 1624;
      pFooterY = 1150;
    } else if (i >= 2) { // Pages 3-7 A4 Landscape (842 x 595)
      pWidth = 762;
      pFooterY = 560;
    }

    doc.lineWidth(0.5).strokeColor(colors.border).moveTo(40, pFooterY).lineTo(40 + pWidth, pFooterY).stroke();

    doc.fillColor(colors.mutedText).fontSize(8).font('Helvetica')
       .text('FutbolAI Platform — Documentación de Arquitectura de Base de Datos y Diagrama ERD (100% Campos)', 40, pFooterY + 6);

    doc.text(`Página ${i + 1} de ${range.count}`, 40 + pWidth - 100, pFooterY + 6, { align: 'right', width: 100 });
    doc.restore();
  }

  doc.end();

  stream.on('finish', () => {
    console.log(`Perfect ERD PDF created successfully at: ${workspacePath}`);

    // Copy to Desktop
    try {
      fs.copyFileSync(workspacePath, desktopPath);
      console.log(`Copied Perfect ERD PDF to Desktop: ${desktopPath}`);
    } catch (e) {
      console.error('Failed to copy to Desktop:', e.message);
    }

    // Copy to Futbol AI Local folder
    try {
      if (!fs.existsSync(localFolderDir)) {
        fs.mkdirSync(localFolderDir, { recursive: true });
      }
      fs.copyFileSync(workspacePath, localFolderPath);
      console.log(`Copied Perfect ERD PDF to Futbol AI Local folder: ${localFolderPath}`);
    } catch (e) {
      console.error('Failed to copy to Futbol AI Local folder:', e.message);
    }
  });
}

generatePDF();
