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
  border: '#CBD5E1',       // Slate 300
  
  // Modules / Domains
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

const relationshipsList = [
  { fromTable: 'passkeys', fromCol: 'userId', toTable: 'users', toCol: 'id', desc: 'Credencial Passkey ──► Usuario Propietario', color: '#2563EB' },
  { fromTable: 'players', fromCol: 'userId', toTable: 'users', toCol: 'id', desc: 'Jugador Creado/Asignado ──► Usuario Scout', color: '#059669' },
  { fromTable: 'Prospects', fromCol: 'userId', toTable: 'users', toCol: 'id', desc: 'Expediente Canterano ──► Entrenador / Scout', color: '#D97706' },
  { fromTable: 'payment_methods', fromCol: 'userId', toTable: 'users', toCol: 'id', desc: 'Método de Pago ──► Usuario Titular', color: '#7C3AED' },
  { fromTable: 'payments', fromCol: 'userId', toTable: 'users', toCol: 'id', desc: 'Pago Registrado ──► Usuario Cliente', color: '#DB2777' },
  { fromTable: 'direct_messages', fromCol: 'senderId', toTable: 'users', toCol: 'id', desc: 'Mensaje Directo ──► Usuario Emisor', color: '#0891B2' },
  { fromTable: 'direct_messages', fromCol: 'receiverId', toTable: 'users', toCol: 'id', desc: 'Mensaje Directo ──► Usuario Receptor', color: '#DC2626' },
  { fromTable: 'user_contacts', fromCol: 'userId', toTable: 'users', toCol: 'id', desc: 'Contacto Guardado ──► Usuario Propietario', color: '#4F46E5' },
  { fromTable: 'user_contacts', fromCol: 'contactUserId', toTable: 'users', toCol: 'id', desc: 'Contacto Guardado ──► Usuario Destino', color: '#65A30D' },
  { fromTable: 'query_logs', fromCol: 'userId', toTable: 'users', toCol: 'id', desc: 'Consulta IA ──► Usuario Solicitante', color: '#9333EA' },
  { fromTable: 'comparison_logs', fromCol: 'userId', toTable: 'users', toCol: 'id', desc: 'Comparativa Ejecutada ──► Usuario Analista', color: '#2563EB' },
  { fromTable: 'favorite_logs', fromCol: 'userId', toTable: 'users', toCol: 'id', desc: 'Acción Favorito ──► Usuario Registrador', color: '#059669' }
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
  // PAGE 1: PORTADA & MATRIZ EXPLICITA DE ENLACES (A4 Portrait)
  // =========================================================================
  doc.addPage({ size: 'A4', margin: 40 });

  // Header Banner
  doc.rect(40, 30, 515, 60).fill(colors.primary);
  doc.fillColor('#FFFFFF').fontSize(18).font('Helvetica-Bold').text('FUTBOL AI PLATFORM', 55, 45);
  doc.fillColor('#94A3B8').fontSize(9.5).font('Helvetica').text('DOCUMENTACIÓN ARQUITECTÓNICA DE BASE DE DATOS Y RELACIONES', 55, 66);

  let y = 105;
  doc.fillColor(colors.primary).fontSize(18).font('Helvetica-Bold').text('DIAGRAMA E-R — LECTURA LIMPIA POR MÓDULOS', 40, y);
  doc.fillColor(colors.mutedText).fontSize(9).font('Helvetica').text(`Generado el: ${new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, 40, y + 22);

  y += 45;
  // Explanatory Banner
  doc.rect(40, y, 515, 75).fillAndStroke('#F1F5F9', colors.border);
  doc.fillColor(colors.secondary).fontSize(10.5).font('Helvetica-Bold').text('ESTRATEGIA DE DIAGRAMACIÓN SIN CONVERGENCIA NI SOBREPOSICIÓN:', 50, y + 10);
  doc.fillColor(colors.darkText).fontSize(8.5).font('Helvetica')
     .text('Para garantizar una legibilidad perfecta al 100% y eliminar el cúmulo de líneas sobrepuestas sobre la entidad central (users):', 50, y + 26, { width: 495 })
     .text('1. Vistas por Módulo (Páginas 2 a 7): Cada relación se despliega de forma aislada y limpia entre pares/tríos de tablas con flechas directas entre el campo FK y el campo PK.', 50, y + 42, { width: 495 })
     .text('2. Mapa Master Panorámico (Página 8): Organizado por bloques de dominio con insignias explícitas [FK -> users.id] y conectores de amplio margen.', 50, y + 58, { width: 495 });

  y += 90;
  // Inventory Table
  doc.fillColor(colors.primary).fontSize(12).font('Helvetica-Bold').text('INVENTARIO OFICIAL DE RELACIONES DE LA BASE DE DATOS', 40, y);
  y += 18;

  const relWidths = [20, 95, 95, 80, 75, 150];
  const relHeaders = ['#', 'Tabla Origen', 'Campo FK', 'Tabla Target', 'Campo PK', 'Descripción / Propósito'];

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
    doc.rect(rx, y + 2, 75, 13).fill('#E0E7FF');
    doc.fillColor('#3730A3').fontSize(7.5).font('Helvetica-Bold').text(`[FK] ${rel.fromCol}`, rx + 3, y + 4); rx += relWidths[2];

    doc.fillColor(colors.darkText).fontSize(8).font('Helvetica-Bold').text(rel.toTable, rx, y + 4, { width: relWidths[3] }); rx += relWidths[3];

    // Target Field Badge
    doc.rect(rx, y + 2, 60, 13).fill('#FEF3C7');
    doc.fillColor('#B45309').fontSize(7.5).font('Helvetica-Bold').text(`[PK] ${rel.toCol}`, rx + 3, y + 4); rx += relWidths[4];

    doc.fillColor(rel.color).fontSize(7.5).font('Helvetica-Bold').text(rel.desc, rx, y + 4, { width: relWidths[5], lineBreak: false });

    y += 17;
  });


  // Helper Function to Draw Table Box (Renders 100% of fields)
  function drawCleanBox(tableName, x, y, width = 340) {
    const tableInfo = dbTables[tableName];
    if (!tableInfo) return { x, y, w: width, h: 50 };

    const meta = domainMeta[tableName] || { name: tableName, color: colors.primary, tag: 'DB' };
    const headerHeight = 22;
    const rowHeight = 11.5;
    const padding = 6;
    const totalHeight = headerHeight + (tableInfo.columns.length * rowHeight) + padding;

    // Card Body
    doc.rect(x, y, width, totalHeight).fillAndStroke('#FFFFFF', colors.border);

    // Header
    doc.rect(x, y, width, headerHeight).fill(meta.color);
    doc.fillColor('#FFFFFF').fontSize(9.5).font('Helvetica-Bold').text(`TABLA: ${tableName.toUpperCase()}`, x + 8, y + 5);
    doc.fillColor('#E2E8F0').fontSize(8).font('Helvetica').text(`(${tableInfo.columns.length} campos)`, x + width - 85, y + 6, { align: 'right', width: 75 });

    // Render 100% of Columns
    let cy = y + headerHeight + 3;
    tableInfo.columns.forEach((col, idx) => {
      const isPk = !!col.IS_PRIMARY_KEY;
      const fkInfo = tableInfo.foreignKeys.find(f => f.parent_column === col.COLUMN_NAME);
      const isFk = !!fkInfo;
      const isNullable = col.IS_NULLABLE === 'YES';

      const typeStr = col.DATA_TYPE + (col.CHARACTER_MAXIMUM_LENGTH ? `(${col.CHARACTER_MAXIMUM_LENGTH === -1 ? 'MAX' : col.CHARACTER_MAXIMUM_LENGTH})` : '');
      const bgRow = idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC';

      doc.rect(x + 2, cy - 1, width - 4, rowRow = rowHeight).fill(bgRow);

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
      const colColor = isPk ? '#B45309' : (isFk ? '#2563EB' : colors.darkText);

      doc.fillColor(colColor).fontSize(7.5).font(colFont).text(col.COLUMN_NAME, badgeX, cy + 1, { width: 130, lineBreak: false });
      doc.fillColor('#475569').fontSize(7).font('Helvetica').text(typeStr, x + width - 130, cy + 1, { width: 75, align: 'left', lineBreak: false });

      if (isNullable) {
        doc.fillColor(colors.mutedText).fontSize(6.5).font('Helvetica').text('NULL', x + width - 50, cy + 1, { width: 45, align: 'right' });
      } else {
        doc.fillColor('#B91C1C').fontSize(6.5).font('Helvetica-Bold').text('NOT NULL', x + width - 50, cy + 1, { width: 45, align: 'right' });
      }

      cy += rowHeight;
    });

    return { x, y, w: width, h: totalHeight };
  }

  // Draw Isolated Field-to-Field Arrow Function for Sub-Diagram Pages
  function drawIsolatedArrow(fromTable, fromCol, toTable, toCol, fromBox, toBox, label, color = '#2563EB') {
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

    doc.lineWidth(2.5).strokeColor(color);

    // Direct Orthogonal path
    doc.moveTo(x1, yFrom)
       .lineTo(midX, yFrom)
       .lineTo(midX, yTo)
       .lineTo(x2, yTo)
       .stroke();

    // Circle Pin Origin
    doc.circle(x1, yFrom, 4.5).fill(color);

    // Arrowhead Target
    if (x1 < x2) {
      doc.polygon([x2, yTo], [x2 - 9, yTo - 5], [x2 - 9, yTo + 5]).fill(color);
    } else {
      doc.polygon([x2, yTo], [x2 + 9, yTo - 5], [x2 + 9, yTo + 5]).fill(color);
    }

    // Callout Label Box
    const badgeY = (yFrom + yTo) / 2;
    doc.rect(midX - 70, badgeY - 9, 140, 18).fillAndStroke('#FFFFFF', color);
    doc.fontSize(8).font('Helvetica-Bold').fillColor(color)
       .text(label, midX - 70, badgeY - 5, { width: 140, align: 'center', lineBreak: false });

    doc.restore();
  }

  function drawModulePageHeader(title, subtitle) {
    doc.rect(40, 25, 762, 42).fill(colors.primary);
    doc.fillColor('#FFFFFF').fontSize(14).font('Helvetica-Bold').text(title, 55, 35);
    doc.fillColor('#94A3B8').fontSize(9).font('Helvetica').text(subtitle, 55, 52);
  }


  // =========================================================================
  // PAGES 2 to 7: SUB-DIAGRAMAS MODULARES CON LECTURA 100% LIMPIA (A4 Landscape)
  // =========================================================================

  // --- PAGE 2: MODULE 1 - USERS & AUTHENTICATION ---
  doc.addPage({ size: 'A4', layout: 'landscape', margin: 40 });
  drawModulePageHeader('MÓDULO 1: USUARIOS Y AUTENTICACIÓN BIOMÉTRICA (PASSKEYS)', 'Diagrama limpio entre users (46 campos), passkeys (8 campos) y expired_registrations (2 campos)');

  const p2_passkeys = drawCleanBox('passkeys', 40, 80, 310);
  const p2_users = drawCleanBox('users', 490, 80, 310);
  const p2_expired = drawCleanBox('expired_registrations', 40, 240, 310);

  drawIsolatedArrow('passkeys', 'userId', 'users', 'id', p2_passkeys, p2_users, 'passkeys.userId ──► users.id (1:N)', '#2563EB');


  // --- PAGE 3: MODULE 2 - SCOUTING & PROSPECTS ---
  doc.addPage({ size: 'A4', layout: 'landscape', margin: 40 });
  drawModulePageHeader('MÓDULO 2: SCOUTING PROFESIONAL Y EXPEDIENTES DE CANTERANOS', 'Diagrama limpio entre players (29 campos), Prospects (36 campos) y users (46 campos)');

  const p3_players = drawCleanBox('players', 40, 80, 230);
  const p3_users = drawCleanBox('users', 310, 80, 220);
  const p3_prospects = drawCleanBox('Prospects', 570, 80, 230);

  drawIsolatedArrow('players', 'userId', 'users', 'id', p3_players, p3_users, 'players.userId ──► users.id', '#059669');
  drawIsolatedArrow('Prospects', 'userId', 'users', 'id', p3_prospects, p3_users, 'Prospects.userId ──► users.id', '#D97706');


  // --- PAGE 4: MODULE 3 - FINANCES & PAYMENTS ---
  doc.addPage({ size: 'A4', layout: 'landscape', margin: 40 });
  drawModulePageHeader('MÓDULO 3: FINANZAS, MÉTODOS DE PAGO Y SUSCRIPCIONES', 'Diagrama limpio entre payment_methods (12 campos), payments (10 campos) y users (46 campos)');

  const p4_methods = drawCleanBox('payment_methods', 40, 80, 320);
  const p4_users = drawCleanBox('users', 480, 80, 320);
  const p4_payments = drawCleanBox('payments', 40, 280, 320);

  drawIsolatedArrow('payment_methods', 'userId', 'users', 'id', p4_methods, p4_users, 'payment_methods.userId ──► users.id', '#7C3AED');
  drawIsolatedArrow('payments', 'userId', 'users', 'id', p4_payments, p4_users, 'payments.userId ──► users.id', '#DB2777');


  // --- PAGE 5: MODULE 4 - SOCIAL & MESSAGING ---
  doc.addPage({ size: 'A4', layout: 'landscape', margin: 40 });
  drawModulePageHeader('MÓDULO 4: COMUNICACIÓN DIRECTA Y CONTACTOS SOCIALES', 'Diagrama limpio entre direct_messages (7 campos), user_contacts (6 campos) y users (46 campos)');

  const p5_dm = drawCleanBox('direct_messages', 40, 80, 320);
  const p5_users = drawCleanBox('users', 480, 80, 320);
  const p5_contacts = drawCleanBox('user_contacts', 40, 230, 320);

  drawIsolatedArrow('direct_messages', 'senderId', 'users', 'id', p5_dm, p5_users, 'direct_messages.senderId ──► users.id', '#0891B2');
  drawIsolatedArrow('user_contacts', 'userId', 'users', 'id', p5_contacts, p5_users, 'user_contacts.userId ──► users.id', '#4F46E5');


  // --- PAGE 6: MODULE 5 - AUDIT LOGS ---
  doc.addPage({ size: 'A4', layout: 'landscape', margin: 40 });
  drawModulePageHeader('MÓDULO 5: TRAZABILIDAD, AUDIT LOGS Y CONSULTAS IA', 'Diagrama limpio entre query_logs, comparison_logs, favorite_logs y users');

  const p6_qlog = drawCleanBox('query_logs', 40, 80, 320);
  const p6_users = drawCleanBox('users', 480, 80, 320);
  const p6_clog = drawCleanBox('comparison_logs', 40, 200, 320);
  const p6_flog = drawCleanBox('favorite_logs', 40, 330, 320);

  drawIsolatedArrow('query_logs', 'userId', 'users', 'id', p6_qlog, p6_users, 'query_logs.userId ──► users.id', '#9333EA');
  drawIsolatedArrow('comparison_logs', 'userId', 'users', 'id', p6_clog, p6_users, 'comparison_logs.userId ──► users.id', '#2563EB');
  drawIsolatedArrow('favorite_logs', 'userId', 'users', 'id', p6_flog, p6_users, 'favorite_logs.userId ──► users.id', '#059669');


  // --- PAGE 7: MODULE 6 - COMPETITIONS & SYSTEM ---
  doc.addPage({ size: 'A4', layout: 'landscape', margin: 40 });
  drawModulePageHeader('MÓDULO 6: COMPETICIONES (LIGAS/EQUIPOS) Y SISTEMA SQL', 'Estructura de tablas leagues (4 campos), teams (4 campos) y sysdiagrams (5 campos)');

  const p7_leagues = drawCleanBox('leagues', 40, 80, 340);
  const p7_teams = drawCleanBox('teams', 440, 80, 340);
  const p7_sys = drawCleanBox('sysdiagrams', 40, 200, 340);

  // Conceptual Link between teams and leagues
  drawIsolatedArrow('teams', 'leagueName', 'leagues', 'name', p7_teams, p7_leagues, 'teams.leagueName ──► leagues.name', '#581C87');


  // =========================================================================
  // PAGE 8: MAPA PANORÁMICO GLOBAL A2 (CON ETIQUETAS Y RUTA ESPACIADA)
  // =========================================================================
  doc.addPage({ size: 'A2', layout: 'landscape', margin: 30 });

  doc.rect(30, 20, 1624, 45).fill(colors.primary);
  doc.fillColor('#FFFFFF').fontSize(18).font('Helvetica-Bold').text('FUTBOL AI — MAPA ERD MASTER GLOBAL (ESTRUCTURA DE DOMINIOS Y TABLAS)', 45, 33);
  doc.fillColor('#94A3B8').fontSize(9.5).font('Helvetica').text('FORMATO PANORÁMICO CON INSIGNIAS DE ENLACE DIRECTO [FK -> users.id] Y 100% DE CAMPOS MOSTRADOS', 1634, 35, { align: 'right' });

  const mPos = {};
  mPos.expired_registrations = drawCleanBox('expired_registrations', 40, 85, 340);
  mPos.passkeys = drawCleanBox('passkeys', 40, 160, 340);
  mPos.direct_messages = drawCleanBox('direct_messages', 40, 310, 340);
  mPos.user_contacts = drawCleanBox('user_contacts', 40, 445, 340);
  mPos.query_logs = drawCleanBox('query_logs', 40, 565, 340);
  mPos.comparison_logs = drawCleanBox('comparison_logs', 40, 675, 340);
  mPos.favorite_logs = drawCleanBox('favorite_logs', 40, 795, 340);

  mPos.users = drawCleanBox('users', 430, 85, 380);
  mPos.leagues = drawCleanBox('leagues', 430, 680, 380);
  mPos.teams = drawCleanBox('teams', 430, 780, 380);
  mPos.sysdiagrams = drawCleanBox('sysdiagrams', 430, 880, 380);

  mPos.players = drawCleanBox('players', 860, 85, 370);
  mPos.payment_methods = drawCleanBox('payment_methods', 860, 460, 370);
  mPos.payments = drawCleanBox('payments', 860, 640, 370);

  mPos.Prospects = drawCleanBox('Prospects', 1270, 85, 380);

  // Footer Pass across all Pages
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    doc.save();

    let pWidth = 515;
    let pFooterY = 805;

    if (i === 7) { // Page 8 A2 Landscape (1684 x 1190)
      pWidth = 1624;
      pFooterY = 1150;
    } else if (i >= 1 && i <= 6) { // Pages 2-7 A4 Landscape (842 x 595)
      pWidth = 762;
      pFooterY = 560;
    }

    doc.lineWidth(0.5).strokeColor(colors.border).moveTo(40, pFooterY).lineTo(40 + pWidth, pFooterY).stroke();

    doc.fillColor(colors.mutedText).fontSize(8).font('Helvetica')
       .text('FutbolAI Platform — Documentación de Arquitectura de Base de Datos y Diagrama ERD (Formato Cero-Convergencia)', 40, pFooterY + 6);

    doc.text(`Página ${i + 1} de ${range.count}`, 40 + pWidth - 100, pFooterY + 6, { align: 'right', width: 100 });
    doc.restore();
  }

  doc.end();

  stream.on('finish', () => {
    console.log(`Clean Readable ERD PDF created successfully at: ${workspacePath}`);

    // Copy to Desktop
    try {
      fs.copyFileSync(workspacePath, desktopPath);
      console.log(`Copied Clean Readable ERD PDF to Desktop: ${desktopPath}`);
    } catch (e) {
      console.error('Failed to copy to Desktop:', e.message);
    }

    // Copy to Futbol AI Local folder
    try {
      if (!fs.existsSync(localFolderDir)) {
        fs.mkdirSync(localFolderDir, { recursive: true });
      }
      fs.copyFileSync(workspacePath, localFolderPath);
      console.log(`Copied Clean Readable ERD PDF to Futbol AI Local folder: ${localFolderPath}`);
    } catch (e) {
      console.error('Failed to copy to Futbol AI Local folder:', e.message);
    }
  });
}

generatePDF();
