const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

// Target Output Paths
const desktopPath = 'C:\\Users\\franc\\OneDrive\\Escritorio\\diagrama_entidad_relacion_futbolai.pdf';
const localFolderDir = 'C:\\Users\\franc\\OneDrive\\Escritorio\\Futbol AI Local';
const localFolderPath = path.join(localFolderDir, 'diagrama_entidad_relacion_futbolai.pdf');
const workspacePath = path.join(__dirname, '..', 'diagrama_entidad_relacion_futbolai.pdf');

// Colors Palette
const colors = {
  primary: '#0F172A',      // Slate 900
  secondary: '#0D9488',    // Teal 600
  darkText: '#1E293B',     // Slate 800
  mutedText: '#64748B',    // Slate 500
  lightBg: '#F8FAFC',      // Slate 50
  border: '#94A3B8',       // Slate 400
  lineColor: '#475569',    // Slate 600
  lineFkColor: '#2563EB',  // Royal Blue
  
  // Domains Colors
  usersDomain: '#1E3A8A',     // Dark Blue
  playersDomain: '#065F46',   // Emerald / Green
  competitionsDomain: '#581C87', // Purple
  financeDomain: '#78350F',   // Amber / Brown
  socialDomain: '#0369A1',    // Sky / Cyan
  logsDomain: '#9F1239',      // Rose / Crimson
  systemDomain: '#334155'     // Slate
};

// Domain mapping for entities
const entityDomains = {
  users: { name: 'Núcleo de Usuarios', color: colors.usersDomain, tag: 'USERS' },
  passkeys: { name: 'Seguridad / Passkeys', color: colors.usersDomain, tag: 'AUTH' },
  expired_registrations: { name: 'Registros', color: colors.usersDomain, tag: 'AUTH' },
  
  players: { name: 'Scouting Profesional', color: colors.playersDomain, tag: 'SCOUTING' },
  Prospects: { name: 'Canteranos / Prospectos', color: colors.playersDomain, tag: 'PROSPECTS' },
  
  leagues: { name: 'Ligas de Fútbol', color: colors.competitionsDomain, tag: 'COMPETITION' },
  teams: { name: 'Equipos y Clubes', color: colors.competitionsDomain, tag: 'COMPETITION' },
  
  payment_methods: { name: 'Métodos de Pago', color: colors.financeDomain, tag: 'FINANCE' },
  payments: { name: 'Transacciones', color: colors.financeDomain, tag: 'FINANCE' },
  
  direct_messages: { name: 'Mensajería Directa', color: colors.socialDomain, tag: 'SOCIAL' },
  user_contacts: { name: 'Contactos', color: colors.socialDomain, tag: 'SOCIAL' },
  
  query_logs: { name: 'Logs Consultas IA', color: colors.logsDomain, tag: 'AUDIT' },
  comparison_logs: { name: 'Logs Comparativas', color: colors.logsDomain, tag: 'AUDIT' },
  favorite_logs: { name: 'Logs Favoritos', color: colors.logsDomain, tag: 'AUDIT' },
  
  sysdiagrams: { name: 'Sistema MS SQL', color: colors.systemDomain, tag: 'SYSTEM' }
};

// Key Schema definitions for ERD Boxes
const entitiesData = {
  users: {
    title: 'users',
    fields: [
      { name: 'id', type: 'char(36)', isPk: true },
      { name: 'username', type: 'nvarchar(100)', notNull: true },
      { name: 'passwordHash', type: 'nvarchar(255)', notNull: true },
      { name: 'role', type: 'nvarchar(150)' },
      { name: 'email', type: 'nvarchar(150)' },
      { name: 'selectedTier', type: 'nvarchar(50)' },
      { name: 'onboardingComplete', type: 'bit' },
      { name: 'createdAt', type: 'datetimeoffset', notNull: true }
    ]
  },
  passkeys: {
    title: 'passkeys',
    fields: [
      { name: 'id', type: 'char(36)', isPk: true },
      { name: 'userId', type: 'char(36)', isFk: true, ref: 'users.id' },
      { name: 'credentialId', type: 'nvarchar(512)', notNull: true },
      { name: 'publicKey', type: 'nvarchar(MAX)', notNull: true },
      { name: 'counter', type: 'bigint' }
    ]
  },
  expired_registrations: {
    title: 'expired_registrations',
    fields: [
      { name: 'username', type: 'nvarchar(255)', isPk: true },
      { name: 'expiredAt', type: 'datetimeoffset' }
    ]
  },
  players: {
    title: 'players',
    fields: [
      { name: 'id', type: 'nvarchar(255)', isPk: true },
      { name: 'name', type: 'nvarchar(255)' },
      { name: 'position', type: 'nvarchar(255)' },
      { name: 'currentTeam', type: 'nvarchar(255)' },
      { name: 'overallRating', type: 'float' },
      { name: 'marketValue', type: 'bigint' },
      { name: 'userId', type: 'char(36)', isFk: true, ref: 'users.id' }
    ]
  },
  Prospects: {
    title: 'Prospects',
    fields: [
      { name: 'id', type: 'nvarchar(255)', isPk: true },
      { name: 'userId', type: 'char(36)', isFk: true, ref: 'users.id', notNull: true },
      { name: 'name', type: 'nvarchar(255)' },
      { name: 'category', type: 'nvarchar(255)' },
      { name: 'position', type: 'nvarchar(255)' },
      { name: 'medicalStatus', type: 'nvarchar(255)' },
      { name: 'overallRating', type: 'float' }
    ]
  },
  payment_methods: {
    title: 'payment_methods',
    fields: [
      { name: 'id', type: 'int', isPk: true },
      { name: 'userId', type: 'nvarchar(255)', isFk: true, ref: 'users.id', notNull: true },
      { name: 'cardholderName', type: 'nvarchar(255)' },
      { name: 'cardBrand', type: 'nvarchar(50)' },
      { name: 'last4', type: 'nvarchar(4)' },
      { name: 'isDefault', type: 'bit' }
    ]
  },
  payments: {
    title: 'payments',
    fields: [
      { name: 'id', type: 'int', isPk: true },
      { name: 'transactionId', type: 'nvarchar(100)', notNull: true },
      { name: 'userId', type: 'char(36)', isFk: true, ref: 'users.id' },
      { name: 'amount', type: 'float', notNull: true },
      { name: 'tier', type: 'nvarchar(50)', notNull: true },
      { name: 'status', type: 'nvarchar(50)' }
    ]
  },
  direct_messages: {
    title: 'direct_messages',
    fields: [
      { name: 'id', type: 'char(36)', isPk: true },
      { name: 'senderId', type: 'char(36)', isFk: true, ref: 'users.id', notNull: true },
      { name: 'receiverId', type: 'char(36)', isFk: true, ref: 'users.id', notNull: true },
      { name: 'content', type: 'nvarchar(MAX)', notNull: true },
      { name: 'isRead', type: 'bit' }
    ]
  },
  user_contacts: {
    title: 'user_contacts',
    fields: [
      { name: 'id', type: 'char(36)', isPk: true },
      { name: 'userId', type: 'char(36)', isFk: true, ref: 'users.id', notNull: true },
      { name: 'contactUserId', type: 'char(36)', isFk: true, ref: 'users.id', notNull: true },
      { name: 'nickname', type: 'nvarchar(100)' }
    ]
  },
  query_logs: {
    title: 'query_logs',
    fields: [
      { name: 'id', type: 'int', isPk: true },
      { name: 'userId', type: 'char(36)', isFk: true, ref: 'users.id' },
      { name: 'message', type: 'nvarchar(MAX)' },
      { name: 'createdAt', type: 'datetimeoffset', notNull: true }
    ]
  },
  comparison_logs: {
    title: 'comparison_logs',
    fields: [
      { name: 'id', type: 'int', isPk: true },
      { name: 'player1Id', type: 'nvarchar(255)', notNull: true },
      { name: 'player2Id', type: 'nvarchar(255)', notNull: true },
      { name: 'userId', type: 'char(36)', isFk: true, ref: 'users.id' }
    ]
  },
  favorite_logs: {
    title: 'favorite_logs',
    fields: [
      { name: 'id', type: 'int', isPk: true },
      { name: 'playerId', type: 'nvarchar(255)', notNull: true },
      { name: 'action', type: 'nvarchar(255)', notNull: true },
      { name: 'userId', type: 'char(36)', isFk: true, ref: 'users.id' }
    ]
  },
  leagues: {
    title: 'leagues',
    fields: [
      { name: 'id', type: 'int', isPk: true },
      { name: 'name', type: 'nvarchar(255)', notNull: true },
      { name: 'country', type: 'nvarchar(255)', notNull: true },
      { name: 'flagIso', type: 'nvarchar(255)', notNull: true }
    ]
  },
  teams: {
    title: 'teams',
    fields: [
      { name: 'id', type: 'int', isPk: true },
      { name: 'name', type: 'nvarchar(255)', notNull: true },
      { name: 'leagueName', type: 'nvarchar(255)', notNull: true },
      { name: 'country', type: 'nvarchar(255)', notNull: true }
    ]
  },
  sysdiagrams: {
    title: 'sysdiagrams',
    fields: [
      { name: 'diagram_id', type: 'int', isPk: true },
      { name: 'name', type: 'nvarchar(128)', notNull: true },
      { name: 'principal_id', type: 'int', notNull: true },
      { name: 'version', type: 'int' }
    ]
  }
};

function createERDPDF() {
  const doc = new PDFDocument({
    autoFirstPage: false,
    bufferPages: true
  });

  const stream = fs.createWriteStream(workspacePath);
  doc.pipe(stream);

  // =========================================================================
  // PAGE 1: COVER & EXECUTIVE ARCHITECTURE (A4 Portrait)
  // =========================================================================
  doc.addPage({ size: 'A4', margin: 40 });

  // Header Banner
  doc.rect(40, 30, 515, 60).fill(colors.primary);
  doc.fillColor('#FFFFFF').fontSize(18).font('Helvetica-Bold').text('FUTBOL AI PLATFORM', 55, 45);
  doc.fillColor('#94A3B8').fontSize(10).font('Helvetica').text('DOCUMENTACIÓN ARQUITECTÓNICA — BASE DE DATOS Y DIAGRAMA E-R', 55, 66);

  let y = 110;
  doc.fillColor(colors.primary).fontSize(20).font('Helvetica-Bold').text('DIAGRAMA ENTIDAD - RELACIÓN (ERD)', 40, y);
  doc.fillColor(colors.mutedText).fontSize(10).font('Helvetica').text(`Generado el: ${new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, 40, y + 24);

  y += 55;
  // Summary Card
  doc.rect(40, y, 515, 110).fillAndStroke(colors.lightBg, colors.border);
  doc.fillColor(colors.secondary).fontSize(12).font('Helvetica-Bold').text('VISIÓN GENERAL DE LA ESTRUCTURA RELACIONAL', 55, y + 15);

  doc.fillColor(colors.darkText).fontSize(9.5).font('Helvetica')
     .text('El motor de base de datos Microsoft SQL Server (instancia FutbolAI) está estructurado en 6 dominios funcionales principales alrededor de la entidad central users:', 55, y + 34, { width: 485 })
     .text('• Núcleo de Usuarios y Autenticación: Gestión de cuentas, roles y biometría Passkeys.', 65, y + 54)
     .text('• Scouting & Expedientes: Jugadores globales (players) y expedientes locales (Prospects).', 65, y + 68)
     .text('• Comunicaciones & Red Social: Mensajería directa (direct_messages) y contactos.', 65, y + 82)
     .text('• Facturación & Audits: Tarjetas, cobros y logs de actividad/consultas IA.', 65, y + 96);

  y += 135;

  // Domain Legend Section
  doc.fillColor(colors.primary).fontSize(13).font('Helvetica-Bold').text('LEYENDA DE DOMINIOS FUNCIONALES', 40, y);
  y += 20;

  const legendItems = [
    { name: 'Núcleo de Usuarios (Auth/Passkeys)', color: colors.usersDomain, count: '3 tablas (users, passkeys, expired_registrations)' },
    { name: 'Scouting & Jugadores', color: colors.playersDomain, count: '2 tablas (players, Prospects)' },
    { name: 'Competiciones & Clubes', color: colors.competitionsDomain, count: '2 tablas (leagues, teams)' },
    { name: 'Finanzas & Suscripciones', color: colors.financeDomain, count: '2 tablas (payment_methods, payments)' },
    { name: 'Mensajería & Social', color: colors.socialDomain, count: '2 tablas (direct_messages, user_contacts)' },
    { name: 'Trazabilidad & Logs IA', color: colors.logsDomain, count: '3 tablas (query_logs, comparison_logs, favorite_logs)' },
    { name: 'Sistema Database', color: colors.systemDomain, count: '1 tabla (sysdiagrams)' }
  ];

  legendItems.forEach(item => {
    doc.rect(40, y, 16, 16).fill(item.color);
    doc.fillColor(colors.darkText).fontSize(9.5).font('Helvetica-Bold').text(item.name, 65, y + 2);
    doc.fillColor(colors.mutedText).fontSize(9).font('Helvetica').text(`— ${item.count}`, 270, y + 2);
    y += 22;
  });

  y += 20;
  // Notation Legend
  doc.fillColor(colors.primary).fontSize(13).font('Helvetica-Bold').text('SIMBOLOGÍA Y CONVENCIONES E-R', 40, y);
  y += 20;

  doc.rect(40, y, 515, 65).fillAndStroke('#F1F5F9', colors.border);
  doc.fillColor(colors.darkText).fontSize(9).font('Helvetica')
     .text('🔑  PK (Primary Key): Llave primaria que identifica de forma única a cada registro.', 55, y + 10)
     .text('🔗  FK (Foreign Key): Llave foránea que referencia la llave primaria de otra entidad.', 55, y + 26)
     .text('───► Relación 1:N (Uno a Muchos): Una fila del origen se conecta con múltiples en el destino.', 55, y + 42);

  // Bottom Notice
  doc.fillColor(colors.secondary).fontSize(10).font('Helvetica-Bold')
     .text('👉 En la siguiente página (Página 2) se muestra el Mapa ERD Completo en formato Panorámico.', 40, 770);


  // =========================================================================
  // PAGE 2: VISUAL ERD MAP (A3 Landscape: 1190 x 842 pt)
  // =========================================================================
  doc.addPage({ size: 'A3', layout: 'landscape', margin: 30 });

  // A3 Header Banner
  doc.rect(30, 20, 1130, 40).fill(colors.primary);
  doc.fillColor('#FFFFFF').fontSize(16).font('Helvetica-Bold').text('FUTBOL AI — MAPA ENTIDAD - RELACIÓN COMPLETO (BASE DE DATOS FutbolAI)', 45, 32);
  doc.fillColor('#94A3B8').fontSize(9).font('Helvetica').text('MICROSOFT SQL SERVER | 15 TABLAS Y RELACIONES DE LLAVES FORÁNEAS (1:N)', 820, 34, { align: 'right' });

  // Draw ERD Boxes Function
  function drawEntityBox(key, x, y, width = 160) {
    const data = entitiesData[key];
    const domain = entityDomains[key] || { color: colors.primary, tag: 'DB' };
    
    const headerHeight = 22;
    const rowHeight = 14;
    const totalHeight = headerHeight + (data.fields.length * rowHeight) + 6;

    // Outer shadow box & background
    doc.rect(x, y, width, totalHeight).fillAndStroke('#FFFFFF', colors.border);
    
    // Header
    doc.rect(x, y, width, headerHeight).fill(domain.color);
    doc.fillColor('#FFFFFF').fontSize(9.5).font('Helvetica-Bold').text(data.title, x + 8, y + 5);
    
    // Domain Tag badge
    doc.fillColor('#E2E8F0').fontSize(7).font('Helvetica').text(domain.tag, x + width - 45, y + 7, { align: 'right', width: 38 });

    // Fields list
    let fy = y + headerHeight + 4;
    data.fields.forEach(f => {
      let icon = '  ';
      let fontName = 'Helvetica';
      let textColor = colors.darkText;

      if (f.isPk) {
        icon = '🔑';
        fontName = 'Helvetica-Bold';
        textColor = '#B45309';
      } else if (f.isFk) {
        icon = '🔗';
        fontName = 'Helvetica-Bold';
        textColor = colors.lineFkColor;
      }

      doc.fillColor(textColor).fontSize(7.5).font(fontName).text(`${icon} ${f.name}`, x + 6, fy);
      doc.fillColor(colors.mutedText).fontSize(7).font('Helvetica').text(f.type, x + width - 75, fy, { align: 'right', width: 70 });
      fy += rowHeight;
    });

    return { x, y, w: width, h: totalHeight, cx: x + width / 2, cy: y + totalHeight / 2 };
  }

  // Draw Entity Positions Grid on A3 Landscape
  const pos = {};

  // Center Entity: users
  pos.users = drawEntityBox('users', 490, 280, 180);

  // Top Left: Auth
  pos.passkeys = drawEntityBox('passkeys', 190, 120, 160);
  pos.expired_registrations = drawEntityBox('expired_registrations', 40, 120, 140);

  // Top Right: Scouting
  pos.players = drawEntityBox('players', 770, 90, 170);
  pos.Prospects = drawEntityBox('Prospects', 960, 90, 180);

  // Left: Social
  pos.direct_messages = drawEntityBox('direct_messages', 190, 270, 170);
  pos.user_contacts = drawEntityBox('user_contacts', 190, 430, 170);

  // Right: Finance
  pos.payment_methods = drawEntityBox('payment_methods', 770, 330, 165);
  pos.payments = drawEntityBox('payments', 960, 330, 165);

  // Bottom Left: Logs
  pos.query_logs = drawEntityBox('query_logs', 190, 580, 160);
  pos.comparison_logs = drawEntityBox('comparison_logs', 370, 580, 160);
  pos.favorite_logs = drawEntityBox('favorite_logs', 550, 580, 160);

  // Bottom Right: Competitions & System
  pos.leagues = drawEntityBox('leagues', 770, 550, 150);
  pos.teams = drawEntityBox('teams', 950, 550, 150);
  pos.sysdiagrams = drawEntityBox('sysdiagrams', 950, 680, 150);

  // Draw Connecting Lines Helper (Orthogonal Connector)
  function drawConnector(fromBox, toBox, label, color = colors.lineFkColor) {
    doc.save();
    doc.lineWidth(1.2).strokeColor(color).dash(4, { space: 2 });
    
    // Calculate endpoints from closest borders
    let x1, y1, x2, y2;

    if (fromBox.cx < toBox.cx) {
      x1 = fromBox.x + fromBox.w;
      y1 = fromBox.cy;
      x2 = toBox.x;
      y2 = toBox.cy;
    } else if (fromBox.cx > toBox.cx) {
      x1 = fromBox.x;
      y1 = fromBox.cy;
      x2 = toBox.x + toBox.w;
      y2 = toBox.cy;
    } else {
      x1 = fromBox.cx;
      y1 = fromBox.cy < toBox.cy ? fromBox.y + fromBox.h : fromBox.y;
      x2 = toBox.cx;
      y2 = fromBox.cy < toBox.cy ? toBox.y : toBox.y + toBox.h;
    }

    const midX = (x1 + x2) / 2;
    
    // Draw Orthogonal Line
    doc.moveTo(x1, y1)
       .lineTo(midX, y1)
       .lineTo(midX, y2)
       .lineTo(x2, y2)
       .stroke();

    // Endpoint Circle (1:N marker)
    doc.circle(x1, y1, 3).fill(color);
    doc.rect(x2 - 3, y2 - 3, 6, 6).fill(colors.primary);

    // Label
    if (label) {
      doc.fontSize(6.5).font('Helvetica-Bold').fillColor(color)
         .text(label, midX - 35, (y1 + y2) / 2 - 4, { width: 70, align: 'center' });
    }
    doc.restore();
  }

  // Draw Relationships (FK -> users)
  drawConnector(pos.passkeys, pos.users, '1:N (userId)');
  drawConnector(pos.players, pos.users, '1:N (userId)');
  drawConnector(pos.Prospects, pos.users, '1:N (userId)');
  drawConnector(pos.payment_methods, pos.users, '1:N (userId)');
  drawConnector(pos.payments, pos.users, '1:N (userId)');
  drawConnector(pos.direct_messages, pos.users, '1:N (sender)');
  drawConnector(pos.user_contacts, pos.users, '1:N (userId)');
  drawConnector(pos.query_logs, pos.users, '1:N (userId)');
  drawConnector(pos.comparison_logs, pos.users, '1:N (userId)');
  drawConnector(pos.favorite_logs, pos.users, '1:N (userId)');


  // =========================================================================
  // PAGE 3: MODULE ZOOM SCHEMAS (A4 Portrait)
  // =========================================================================
  doc.addPage({ size: 'A4', margin: 40 });

  // Header Banner Page 3
  doc.rect(40, 30, 515, 45).fill(colors.primary);
  doc.fillColor('#FFFFFF').fontSize(15).font('Helvetica-Bold').text('FUTBOL AI — DETALLE DE MÓDULOS RELACIONALES', 55, 42);
  doc.fillColor('#94A3B8').fontSize(9).font('Helvetica').text('DESGLOSE DE TABLAS Y RELACIONES CLAVE POR SUB-SISTEMA', 55, 60);

  let py = 95;

  const modules = [
    {
      title: 'Módulo 1: Usuarios y Autenticación Biométrica',
      color: colors.usersDomain,
      text: '• users (PK: id): Tabla central de identidades.\n• passkeys (FK: userId -> users.id): Credenciales WebAuthn registradas.\n• expired_registrations (PK: username): Control de intentos temporales expirados.'
    },
    {
      title: 'Módulo 2: Scouting Profesional & Expedientes Canteranos',
      color: colors.playersDomain,
      text: '• players (FK: userId -> users.id): Base global de futbolistas profesionales.\n• Prospects (FK: userId -> users.id): Fichas de prospectos locales con datos médicos, notas tácticas y autorizaciones de tutores.'
    },
    {
      title: 'Módulo 3: Facturación, Métodos de Pago & Suscripciones',
      color: colors.financeDomain,
      text: '• payment_methods (FK: userId -> users.id): Tarjetas de crédito/débito guardadas.\n• payments (FK: userId -> users.id): Historial transaccional de membresías.'
    },
    {
      title: 'Módulo 4: Comunicación Directa & Red Social Scout',
      color: colors.socialDomain,
      text: '• direct_messages (FK: senderId, receiverId -> users.id): Chat en tiempo real.\n• user_contacts (FK: userId, contactUserId -> users.id): Agenda de contactos.'
    },
    {
      title: 'Módulo 5: Trazabilidad, Métricas & Consultas IA',
      color: colors.logsDomain,
      text: '• query_logs (FK: userId -> users.id): Historial de preguntas al agente Gemini.\n• comparison_logs (FK: userId -> users.id): Registros de comparativas ejecutadas.\n• favorite_logs (FK: userId -> users.id): Auditoría de seguimiento a jugadores.'
    }
  ];

  modules.forEach(m => {
    doc.rect(40, py, 515, 24).fill(m.color);
    doc.fillColor('#FFFFFF').fontSize(10.5).font('Helvetica-Bold').text(m.title, 50, py + 6);

    py += 24;
    doc.rect(40, py, 515, 55).fillAndStroke('#F8FAFC', colors.border);
    doc.fillColor(colors.darkText).fontSize(8.5).font('Helvetica').text(m.text, 50, py + 8, { width: 495 });

    py += 68;
  });


  // Footer Pass for all Pages
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    doc.save();
    
    const pWidth = i === 1 ? 1130 : 515; // Page 2 is A3 Landscape (width ~1190)
    const pFooterY = i === 1 ? 810 : 805;

    doc.lineWidth(0.5).strokeColor(colors.border).moveTo(40, pFooterY).lineTo(40 + pWidth, pFooterY).stroke();
    
    doc.fillColor(colors.mutedText)
       .fontSize(8)
       .font('Helvetica')
       .text('FutbolAI Platform — Diagrama Entidad-Relación (ERD) Oficial', 40, pFooterY + 6);
    
    doc.text(`Página ${i + 1} de ${range.count}`, 40 + pWidth - 100, pFooterY + 6, { align: 'right', width: 100 });
    doc.restore();
  }

  doc.end();

  stream.on('finish', () => {
    console.log(`ERD PDF created successfully at: ${workspacePath}`);
    
    // Copy to Desktop
    try {
      fs.copyFileSync(workspacePath, desktopPath);
      console.log(`Copied ERD PDF to Desktop: ${desktopPath}`);
    } catch (e) {
      console.error('Failed to copy to Desktop:', e.message);
    }

    // Copy to Futbol AI Local folder
    try {
      if (!fs.existsSync(localFolderDir)) {
        fs.mkdirSync(localFolderDir, { recursive: true });
      }
      fs.copyFileSync(workspacePath, localFolderPath);
      console.log(`Copied ERD PDF to Futbol AI Local folder: ${localFolderPath}`);
    } catch (e) {
      console.error('Failed to copy to Futbol AI Local folder:', e.message);
    }
  });
}

createERDPDF();
