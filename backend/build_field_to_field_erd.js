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

// Output Paths
const desktopPath = 'C:\\Users\\franc\\OneDrive\\Escritorio\\diagrama_entidad_relacion_futbolai.pdf';
const localFolderDir = 'C:\\Users\\franc\\OneDrive\\Escritorio\\Futbol AI Local';
const localFolderPath = path.join(localFolderDir, 'diagrama_entidad_relacion_futbolai.pdf');
const workspacePath = path.join(__dirname, '..', 'diagrama_entidad_relacion_futbolai.pdf');

// Color Palette
const colors = {
  primary: '#0F172A',      // Slate 900
  secondary: '#0D9488',    // Teal 600
  darkText: '#1E293B',     // Slate 800
  mutedText: '#64748B',    // Slate 500
  lightBg: '#F8FAFC',      // Slate 50
  border: '#94A3B8',       // Slate 400
  
  // Specific relationship colors for visual distinction
  relColors: [
    '#2563EB', // Blue
    '#059669', // Emerald
    '#D97706', // Amber
    '#7C3AED', // Violet
    '#DB2777', // Pink
    '#0891B2', // Cyan
    '#DC2626', // Red
    '#4F46E5', // Indigo
    '#65A30D', // Lime
    '#9333EA'  // Purple
  ],

  // Domains
  usersDomain: '#1E3A8A',
  playersDomain: '#065F46',
  competitionsDomain: '#581C87',
  financeDomain: '#78350F',
  socialDomain: '#0369A1',
  logsDomain: '#9F1239',
  systemDomain: '#334155'
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

// Relationships Inventory (Explicit Origin -> Target Mapping)
const relationshipsList = [
  { fromTable: 'passkeys', fromCol: 'userId', toTable: 'users', toCol: 'id', name: 'passkeys.userId -> users.id', color: '#2563EB' },
  { fromTable: 'direct_messages', fromCol: 'senderId', toTable: 'users', toCol: 'id', name: 'direct_messages.senderId -> users.id', color: '#059669' },
  { fromTable: 'direct_messages', fromCol: 'receiverId', toTable: 'users', toCol: 'id', name: 'direct_messages.receiverId -> users.id', color: '#D97706' },
  { fromTable: 'user_contacts', fromCol: 'userId', toTable: 'users', toCol: 'id', name: 'user_contacts.userId -> users.id', color: '#7C3AED' },
  { fromTable: 'user_contacts', fromCol: 'contactUserId', toTable: 'users', toCol: 'id', name: 'user_contacts.contactUserId -> users.id', color: '#DB2777' },
  { fromTable: 'query_logs', fromCol: 'userId', toTable: 'users', toCol: 'id', name: 'query_logs.userId -> users.id', color: '#0891B2' },
  { fromTable: 'comparison_logs', fromCol: 'userId', toTable: 'users', toCol: 'id', name: 'comparison_logs.userId -> users.id', color: '#DC2626' },
  { fromTable: 'favorite_logs', fromCol: 'userId', toTable: 'users', toCol: 'id', name: 'favorite_logs.userId -> users.id', color: '#4F46E5' },
  { fromTable: 'players', fromCol: 'userId', toTable: 'users', toCol: 'id', name: 'players.userId -> users.id', color: '#65A30D' },
  { fromTable: 'payment_methods', fromCol: 'userId', toTable: 'users', toCol: 'id', name: 'payment_methods.userId -> users.id', color: '#9333EA' },
  { fromTable: 'payments', fromCol: 'userId', toTable: 'users', toCol: 'id', name: 'payments.userId -> users.id', color: '#2563EB' },
  { fromTable: 'Prospects', fromCol: 'userId', toTable: 'users', toCol: 'id', name: 'Prospects.userId -> users.id', color: '#059669' }
];

function getColumnCenterY(tableName, colName, boxY) {
  const tableInfo = dbTables[tableName];
  if (!tableInfo) return boxY + 30;
  const colIndex = tableInfo.columns.findIndex(c => c.COLUMN_NAME === colName);
  const idx = colIndex >= 0 ? colIndex : 0;
  const headerHeight = 24;
  const rowHeight = 11.5;
  return boxY + headerHeight + (idx * rowHeight) + (rowHeight / 2);
}

function generatePDF() {
  const doc = new PDFDocument({
    autoFirstPage: false,
    bufferPages: true
  });

  const stream = fs.createWriteStream(workspacePath);
  doc.pipe(stream);

  // =========================================================================
  // PAGE 1: PORTADA & MATRIZ DE ORIGEN Y DESTINO DE CONEXIONES (A4 Portrait)
  // =========================================================================
  doc.addPage({ size: 'A4', margin: 40 });

  // Header Banner
  doc.rect(40, 30, 515, 60).fill(colors.primary);
  doc.fillColor('#FFFFFF').fontSize(18).font('Helvetica-Bold').text('FUTBOL AI PLATFORM', 55, 45);
  doc.fillColor('#94A3B8').fontSize(9.5).font('Helvetica').text('DIAGRAMA E-R | MAPEO CAMPO-A-CAMPO DE ORIGEN Y DESTINO', 55, 66);

  let y = 105;
  doc.fillColor(colors.primary).fontSize(18).font('Helvetica-Bold').text('INVENTARIO DE CONEXIONES DE LLAVES FORÁNEAS', 40, y);
  doc.fillColor(colors.mutedText).fontSize(9).font('Helvetica').text(`Generado el: ${new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, 40, y + 22);

  y += 45;
  // Relationship Matrix Table Header
  const relWidths = [22, 110, 110, 110, 80, 83];
  const relHeaders = ['#', 'Tabla Origen (FK)', 'Campo Origen', 'Tabla Destino (PK)', 'Campo Destino', 'Tipo Relación'];

  doc.rect(40, y, 515, 18).fill(colors.primary);
  doc.fillColor('#FFFFFF').fontSize(8).font('Helvetica-Bold');
  let rx = 43;
  relHeaders.forEach((h, i) => {
    doc.text(h, rx, y + 4, { width: relWidths[i], align: 'left' });
    rx += relWidths[i];
  });

  y += 18;
  relationshipsList.forEach((rel, idx) => {
    const bg = idx % 2 === 0 ? colors.lightBg : '#FFFFFF';
    doc.rect(40, y, 515, 17).fillAndStroke(bg, colors.border);

    let rx = 43;
    doc.fillColor(colors.mutedText).fontSize(7.5).font('Helvetica').text(`${idx + 1}`, rx, y + 4, { width: relWidths[0] }); rx += relWidths[0];
    doc.fillColor(colors.darkText).fontSize(8).font('Helvetica-Bold').text(rel.fromTable, rx, y + 4, { width: relWidths[1] }); rx += relWidths[1];
    
    // Origin Field Badge
    doc.rect(rx, y + 2, 85, 13).fill('#E0E7FF');
    doc.fillColor('#3730A3').fontSize(7.5).font('Helvetica-Bold').text(`[FK] ${rel.fromCol}`, rx + 4, y + 4); rx += relWidths[2];

    doc.fillColor(colors.darkText).fontSize(8).font('Helvetica-Bold').text(rel.toTable, rx, y + 4, { width: relWidths[3] }); rx += relWidths[3];

    // Target Field Badge
    doc.rect(rx, y + 2, 70, 13).fill('#FEF3C7');
    doc.fillColor('#B45309').fontSize(7.5).font('Helvetica-Bold').text(`[PK] ${rel.toCol}`, rx + 4, y + 4); rx += relWidths[4];

    doc.fillColor(rel.color).fontSize(7.5).font('Helvetica-Bold').text('1 : N (Foreign Key)', rx, y + 4, { width: relWidths[5] });

    y += 17;
  });

  y += 25;
  // Explanatory Box
  doc.rect(40, y, 515, 65).fillAndStroke('#F1F5F9', colors.border);
  doc.fillColor(colors.secondary).fontSize(10).font('Helvetica-Bold').text('INDICACIONES DE LECTURA DE CONEXIONES EN LAS SIGUIENTES PÁGINAS:', 50, y + 10);
  doc.fillColor(colors.darkText).fontSize(8.5).font('Helvetica')
     .text('• Página 2 (A2 Panorámico Master): Cada línea nace exactamente en el campo FK origen y muere en el campo PK de usuarios (users.id) utilizando sub-canales verticales independientes.', 50, y + 26, { width: 495 })
     .text('• Páginas 3 a 7 (Vistas por Módulo A4): Flechas directas campo-a-campo conectando la casilla del origen con la casilla de destino.', 50, y + 48, { width: 495 });


  // =========================================================================
  // PAGE 2: MAPA ERD MASTER CON RUTEO PRECISO CAMPO-A-CAMPO (A2 Landscape)
  // =========================================================================
  doc.addPage({ size: 'A2', layout: 'landscape', margin: 30 });

  // Header Banner A2
  doc.rect(30, 20, 1624, 45).fill(colors.primary);
  doc.fillColor('#FFFFFF').fontSize(18).font('Helvetica-Bold').text('FUTBOL AI — MAPA ERD MASTER CAMPO-A-CAMPO (100% CAMPOS Y CONEXIONES CON ORIGEN Y DESTINO VISIBLE)', 45, 33);
  doc.fillColor('#94A3B8').fontSize(9.5).font('Helvetica').text('INSTANCIA: FutbolAI | 186 CAMPOS | CADA LÍNEA CONECTA EL CAMPO FK EXACTO CON EL CAMPO PK TARGET', 1634, 35, { align: 'right' });

  // Draw Master Entity Box Function
  function drawMasterBox(tableName, x, y, width = 360) {
    const tableInfo = dbTables[tableName];
    const meta = domainMeta[tableName] || { name: tableName, color: colors.primary, tag: 'DB' };

    const headerHeight = 24;
    const rowHeight = 11.5;
    const padding = 8;
    const totalHeight = headerHeight + (tableInfo.columns.length * rowHeight) + padding;

    doc.rect(x, y, width, totalHeight).fillAndStroke('#FFFFFF', colors.border);

    // Header
    doc.rect(x, y, width, headerHeight).fill(meta.color);
    doc.fillColor('#FFFFFF').fontSize(10).font('Helvetica-Bold').text(`TABLA: ${tableName.toUpperCase()}`, x + 10, y + 6);
    doc.fillColor('#E2E8F0').fontSize(8).font('Helvetica').text(`(${tableInfo.columns.length} campos)`, x + width - 90, y + 7, { align: 'right', width: 80 });

    // Render Columns
    let cy = y + headerHeight + 4;
    tableInfo.columns.forEach((col, idx) => {
      const isPk = !!col.IS_PRIMARY_KEY;
      const fkInfo = tableInfo.foreignKeys.find(f => f.parent_column === col.COLUMN_NAME);
      const isFk = !!fkInfo;
      const isNullable = col.IS_NULLABLE === 'YES';

      const typeStr = col.DATA_TYPE + (col.CHARACTER_MAXIMUM_LENGTH ? `(${col.CHARACTER_MAXIMUM_LENGTH === -1 ? 'MAX' : col.CHARACTER_MAXIMUM_LENGTH})` : '');
      const bgRow = idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC';

      doc.rect(x + 2, cy - 1, width - 4, rowHeight).fill(bgRow);

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

      const colFont = (isPk || isFk) ? 'Helvetica-Bold' : 'Helvetica';
      const colColor = isPk ? '#B45309' : (isFk ? colors.lineColor : colors.darkText);

      doc.fillColor(colColor).fontSize(7.5).font(colFont).text(col.COLUMN_NAME, badgeX, cy + 1, { width: 145, lineBreak: false });
      doc.fillColor('#475569').fontSize(7).font('Helvetica').text(typeStr, x + width - 135, cy + 1, { width: 75, align: 'left', lineBreak: false });

      if (isNullable) {
        doc.fillColor(colors.mutedText).fontSize(6.5).font('Helvetica').text('NULL', x + width - 50, cy + 1, { width: 45, align: 'right' });
      } else {
        doc.fillColor('#B91C1C').fontSize(6.5).font('Helvetica-Bold').text('NOT NULL', x + width - 50, cy + 1, { width: 45, align: 'right' });
      }

      cy += rowHeight;
    });

    return { x, y, w: width, h: totalHeight };
  }

  // Layout Positions Grid
  const pos = {};

  // Col 1 (x: 40, width: 340)
  pos.expired_registrations = drawMasterBox('expired_registrations', 40, 85, 340);
  pos.passkeys = drawMasterBox('passkeys', 40, 160, 340);
  pos.direct_messages = drawMasterBox('direct_messages', 40, 310, 340);
  pos.user_contacts = drawMasterBox('user_contacts', 40, 445, 340);
  pos.query_logs = drawMasterBox('query_logs', 40, 565, 340);
  pos.comparison_logs = drawMasterBox('comparison_logs', 40, 675, 340);
  pos.favorite_logs = drawMasterBox('favorite_logs', 40, 795, 340);

  // Col 2 (x: 430, width: 380) — users
  pos.users = drawMasterBox('users', 430, 85, 380);
  pos.leagues = drawMasterBox('leagues', 430, 680, 380);
  pos.teams = drawMasterBox('teams', 430, 780, 380);
  pos.sysdiagrams = drawMasterBox('sysdiagrams', 430, 880, 380);

  // Col 3 (x: 860, width: 370)
  pos.players = drawMasterBox('players', 860, 85, 370);
  pos.payment_methods = drawMasterBox('payment_methods', 860, 460, 370);
  pos.payments = drawMasterBox('payments', 860, 640, 370);

  // Col 4 (x: 1270, width: 380)
  pos.Prospects = drawMasterBox('Prospects', 1270, 85, 380);

  // Precise Field-to-Field Connection Line Router Function
  function drawFieldToFieldLine(fromTable, fromCol, toTable, toCol, channelX, subChanOffset, targetYOffset, color) {
    doc.save();

    const fromBox = pos[fromTable];
    const toBox = pos[toTable];

    const yOrigin = getColumnCenterY(fromTable, fromCol, fromBox.y);
    const yTargetBase = getColumnCenterY(toTable, toCol, toBox.y);
    const yTarget = yTargetBase + targetYOffset; // Small offset so multiple lines into users.id don't stack completely

    let x1, x2;
    if (fromBox.x < channelX) {
      x1 = fromBox.x + fromBox.w; // Right side of source table
    } else {
      x1 = fromBox.x;             // Left side of source table
    }

    if (toBox.x < channelX) {
      x2 = toBox.x + toBox.w;
    } else {
      x2 = toBox.x;
    }

    const actualChannelX = channelX + subChanOffset;

    doc.lineWidth(1.5).strokeColor(color).dash(4, { space: 2 });

    // Orthogonal path: (x1, yOrigin) -> (actualChannelX, yOrigin) -> (actualChannelX, yTarget) -> (x2, yTarget)
    doc.moveTo(x1, yOrigin)
       .lineTo(actualChannelX, yOrigin)
       .lineTo(actualChannelX, yTarget)
       .lineTo(x2, yTarget)
       .stroke();

    // Origin Circle Pin right at the exact FK field
    doc.circle(x1, yOrigin, 3.5).fill(color);

    // Target Arrow/Square Pin right at the exact PK field
    doc.rect(x2 - 3.5, yTarget - 3.5, 7, 7).fill(color);

    // Relationship Label Badge on the channel line
    const labelY = (yOrigin + yTarget) / 2;
    doc.rect(actualChannelX - 45, labelY - 6, 90, 13).fillAndStroke('#FFFFFF', color);
    doc.fontSize(6.5).font('Helvetica-Bold').fillColor(color)
       .text(`${fromTable}.${fromCol} ──► ${toTable}.${toCol}`, actualChannelX - 45, labelY - 4, { width: 90, align: 'center', lineBreak: false });

    doc.restore();
  }

  // Draw Field-to-Field Connections in Channel 1 (between Col 1 & Col 2: Channel Center x = 405)
  // Sub-channels range: x = 390 to x = 422
  drawFieldToFieldLine('passkeys', 'userId', 'users', 'id', 405, -12, -4, '#2563EB');
  drawFieldToFieldLine('direct_messages', 'senderId', 'users', 'id', 405, -8, -2, '#059669');
  drawFieldToFieldLine('direct_messages', 'receiverId', 'users', 'id', 405, -4, 0, '#D97706');
  drawFieldToFieldLine('user_contacts', 'userId', 'users', 'id', 405, 0, 2, '#7C3AED');
  drawFieldToFieldLine('user_contacts', 'contactUserId', 'users', 'id', 405, 4, 4, '#DB2777');
  drawFieldToFieldLine('query_logs', 'userId', 'users', 'id', 405, 8, 6, '#0891B2');
  drawFieldToFieldLine('comparison_logs', 'userId', 'users', 'id', 405, 12, 8, '#DC2626');
  drawFieldToFieldLine('favorite_logs', 'userId', 'users', 'id', 405, 16, 10, '#4F46E5');

  // Draw Field-to-Field Connections in Channel 2 (between Col 2 & Col 3: Channel Center x = 835)
  drawFieldToFieldLine('players', 'userId', 'users', 'id', 835, -8, -3, '#65A30D');
  drawFieldToFieldLine('payment_methods', 'userId', 'users', 'id', 835, 0, 0, '#9333EA');
  drawFieldToFieldLine('payments', 'userId', 'users', 'id', 835, 8, 3, '#2563EB');

  // Draw Prospects connection around top channel into users.id
  doc.save();
  const prYOrigin = getColumnCenterY('Prospects', 'userId', pos.Prospects.y);
  const uYTarget = getColumnCenterY('users', 'id', pos.users.y) - 6;
  const prX1 = pos.Prospects.x;
  const uX2 = pos.users.x + pos.users.w;

  doc.lineWidth(1.5).strokeColor('#059669').dash(4, { space: 2 });
  doc.moveTo(prX1, prYOrigin)
     .lineTo(1245, prYOrigin)
     .lineTo(1245, 68)
     .lineTo(825, 68)
     .lineTo(825, uYTarget)
     .lineTo(uX2, uYTarget)
     .stroke();

  doc.circle(prX1, prYOrigin, 3.5).fill('#059669');
  doc.rect(uX2 - 3.5, uYTarget - 3.5, 7, 7).fill('#059669');

  doc.rect(1020, 61, 130, 14).fillAndStroke('#FFFFFF', '#059669');
  doc.fontSize(6.5).font('Helvetica-Bold').fillColor('#059669')
     .text('Prospects.userId ──► users.id', 1020, 64, { width: 130, align: 'center' });
  doc.restore();


  // =========================================================================
  // PAGES 3 to 7: ZOOM DETALLADO POR MÓDULOS CON FLECHAS DIRECTAS CAMPO A CAMPO (A4 Landscape)
  // =========================================================================

  function drawModulePageHeader(title, subtitle) {
    doc.rect(40, 25, 762, 45).fill(colors.primary);
    doc.fillColor('#FFFFFF').fontSize(15).font('Helvetica-Bold').text(title, 55, 36);
    doc.fillColor('#94A3B8').fontSize(9).font('Helvetica').text(subtitle, 55, 53);
  }

  // Draw Field-to-Field Direct Thick Arrow for Module Pages
  function drawDirectModuleArrow(fromTable, fromCol, toTable, toCol, fromBox, toBox, label, color = '#2563EB') {
    doc.save();

    const yFrom = getColumnCenterY(fromTable, fromCol, fromBox.y);
    const yTo = getColumnCenterY(toTable, toCol, toBox.y);

    let x1, x2;
    if (fromBox.x < toBox.x) {
      x1 = fromBox.x + fromBox.w;
      x2 = toBox.x;
    } else {
      x1 = fromBox.x;
      x2 = toBox.x + toBox.w;
    }

    const midX = (x1 + x2) / 2;

    doc.lineWidth(2).strokeColor(color);
    
    doc.moveTo(x1, yFrom)
       .lineTo(midX, yFrom)
       .lineTo(midX, yTo)
       .lineTo(x2, yTo)
       .stroke();

    // Pin origin
    doc.circle(x1, yFrom, 4).fill(color);

    // Arrowhead target
    if (x1 < x2) {
      doc.polygon([x2, yTo], [x2 - 8, yTo - 4], [x2 - 8, yTo + 4]).fill(color);
    } else {
      doc.polygon([x2, yTo], [x2 + 8, yTo - 4], [x2 + 8, yTo + 4]).fill(color);
    }

    // Callout badge
    const badgeY = (yFrom + yTo) / 2;
    doc.rect(midX - 60, badgeY - 8, 120, 16).fillAndStroke('#FFFFFF', color);
    doc.fontSize(7.5).font('Helvetica-Bold').fillColor(color)
       .text(label, midX - 60, badgeY - 5, { width: 120, align: 'center', lineBreak: false });

    doc.restore();
  }

  // --- PAGE 3: MODULE 1 - USERS & AUTHENTICATION ---
  doc.addPage({ size: 'A4', layout: 'landscape', margin: 40 });
  drawModulePageHeader('MÓDULO 1: USUARIOS Y SEGURIDAD BIOMÉTRICA (PASSKEYS)', 'Conexiones directas campo-a-campo entre users, passkeys y expired_registrations');
  
  const m1_users = drawMasterBox('users', 40, 85, 330);
  const m1_passkeys = drawMasterBox('passkeys', 470, 85, 330);
  const m1_expired = drawMasterBox('expired_registrations', 470, 240, 330);

  drawDirectModuleArrow('passkeys', 'userId', 'users', 'id', m1_passkeys, m1_users, 'passkeys.userId ──► users.id', '#2563EB');

  // --- PAGE 4: MODULE 2 - SCOUTING & PROSPECTS ---
  doc.addPage({ size: 'A4', layout: 'landscape', margin: 40 });
  drawModulePageHeader('MÓDULO 2: SCOUTING PROFESIONAL Y EXPEDIENTES DE CANTERANOS', 'Conexiones directas campo-a-campo entre users, players y Prospects');

  const m2_users = drawMasterBox('users', 260, 85, 320);
  const m2_players = drawMasterBox('players', 40, 85, 200);
  const m2_prospects = drawMasterBox('Prospects', 600, 85, 200);

  drawDirectModuleArrow('players', 'userId', 'users', 'id', m2_players, m2_users, 'players.userId ──► users.id', '#059669');
  drawDirectModuleArrow('Prospects', 'userId', 'users', 'id', m2_prospects, m2_users, 'Prospects.userId ──► users.id', '#D97706');

  // --- PAGE 5: MODULE 3 - FINANCES & PAYMENTS ---
  doc.addPage({ size: 'A4', layout: 'landscape', margin: 40 });
  drawModulePageHeader('MÓDULO 3: FINANZAS, MÉTODOS DE PAGO Y COBROS', 'Conexiones directas campo-a-campo entre users, payment_methods y payments');

  const m3_users = drawMasterBox('users', 40, 85, 330);
  const m3_paymethods = drawMasterBox('payment_methods', 470, 85, 330);
  const m3_payments = drawMasterBox('payments', 470, 280, 330);

  drawDirectModuleArrow('payment_methods', 'userId', 'users', 'id', m3_paymethods, m3_users, 'payment_methods.userId ──► users.id', '#7C3AED');
  drawDirectModuleArrow('payments', 'userId', 'users', 'id', m3_payments, m3_users, 'payments.userId ──► users.id', '#DB2777');

  // --- PAGE 6: MODULE 4 - SOCIAL & MESSAGING ---
  doc.addPage({ size: 'A4', layout: 'landscape', margin: 40 });
  drawModulePageHeader('MÓDULO 4: COMUNICACIÓN DIRECTA Y AGENDA SOCIAL', 'Conexiones directas campo-a-campo entre users, direct_messages y user_contacts');

  const m4_users = drawMasterBox('users', 40, 85, 330);
  const m4_dm = drawMasterBox('direct_messages', 470, 85, 330);
  const m4_contacts = drawMasterBox('user_contacts', 470, 240, 330);

  drawDirectModuleArrow('direct_messages', 'senderId', 'users', 'id', m4_dm, m4_users, 'direct_messages.senderId ──► users.id', '#0891B2');
  drawDirectModuleArrow('user_contacts', 'userId', 'users', 'id', m4_contacts, m4_users, 'user_contacts.userId ──► users.id', '#DC2626');

  // --- PAGE 7: MODULE 5 - AUDIT LOGS ---
  doc.addPage({ size: 'A4', layout: 'landscape', margin: 40 });
  drawModulePageHeader('MÓDULO 5: TRAZABILIDAD, LOGS DE AUDITORÍA Y COMPANION IA', 'Conexiones directas campo-a-campo de query_logs, comparison_logs y favorite_logs hacia users');

  const m5_users = drawMasterBox('users', 40, 85, 330);
  const m5_qlog = drawMasterBox('query_logs', 470, 85, 330);
  const m5_clog = drawMasterBox('comparison_logs', 470, 210, 330);
  const m5_flog = drawMasterBox('favorite_logs', 470, 350, 330);

  drawDirectModuleArrow('query_logs', 'userId', 'users', 'id', m5_qlog, m5_users, 'query_logs.userId ──► users.id', '#0891B2');
  drawDirectModuleArrow('comparison_logs', 'userId', 'users', 'id', m5_clog, m5_users, 'comparison_logs.userId ──► users.id', '#DC2626');
  drawDirectModuleArrow('favorite_logs', 'userId', 'users', 'id', m5_flog, m5_users, 'favorite_logs.userId ──► users.id', '#4F46E5');


  // Footer Pass across all Pages
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    doc.save();

    let pWidth = 515;
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
       .text('FutbolAI Platform — Documentación de Arquitectura de Base de Datos y Diagrama ERD (Trazado Campo-a-Campo)', 40, pFooterY + 6);

    doc.text(`Página ${i + 1} de ${range.count}`, 40 + pWidth - 100, pFooterY + 6, { align: 'right', width: 100 });
    doc.restore();
  }

  doc.end();

  stream.on('finish', () => {
    console.log(`Field-to-Field ERD PDF created successfully at: ${workspacePath}`);

    // Copy to Desktop
    try {
      fs.copyFileSync(workspacePath, desktopPath);
      console.log(`Copied Field-to-Field ERD PDF to Desktop: ${desktopPath}`);
    } catch (e) {
      console.error('Failed to copy to Desktop:', e.message);
    }

    // Copy to Futbol AI Local folder
    try {
      if (!fs.existsSync(localFolderDir)) {
        fs.mkdirSync(localFolderDir, { recursive: true });
      }
      fs.copyFileSync(workspacePath, localFolderPath);
      console.log(`Copied Field-to-Field ERD PDF to Futbol AI Local folder: ${localFolderPath}`);
    } catch (e) {
      console.error('Failed to copy to Futbol AI Local folder:', e.message);
    }
  });
}

generatePDF();
