const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

// Path to schema dump
const schemaPath = path.join(__dirname, 'schema_dump.json');
if (!fs.existsSync(schemaPath)) {
  console.error('schema_dump.json not found!');
  process.exit(1);
}

const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

// Target Output Paths
const desktopPath = 'C:\\Users\\franc\\OneDrive\\Escritorio\\Diccionario_Base_de_Datos_FutbolAI.pdf';
const localFolderDir = 'C:\\Users\\franc\\OneDrive\\Escritorio\\Futbol AI Local';
const localFolderPath = path.join(localFolderDir, 'Diccionario_Base_de_Datos_FutbolAI.pdf');
const workspacePath = path.join(__dirname, '..', 'Diccionario_Base_de_Datos_FutbolAI.pdf');

// Descriptions for Tables
const tableDescriptions = {
  users: 'Almacena las cuentas de usuario de la plataforma (scouts, entrenadores, administradores), credenciales de acceso, preferencias de onboarding, datos de suscripción/facturación y configuración de Passkeys.',
  players: 'Base de datos principal de jugadores profesionales globales. Incluye datos demográficos, físicos, valor de mercado, valoraciones de rendimiento (overall), estadísticas, trofeos y biografía.',
  Prospects: 'Expedientes de jugadores prospectos o canteranos registrados por los usuarios/entrenadores. Incluye fichas médicas, documentos adjuntos, áreas de mejora, notas tácticas y autorizaciones.',
  leagues: 'Catálogo oficial de ligas de fútbol integradas en la plataforma, con indicación de país y código ISO de bandera.',
  teams: 'Catálogo de clubes y equipos deportivos categorizados por liga y país.',
  payment_methods: 'Métodos de pago (tarjetas bancarias encriptadas) registrados por los usuarios para suscripciones.',
  payments: 'Historial audit transaccional de pagos de suscripción procesados en la plataforma.',
  direct_messages: 'Mensajes de chat directo en tiempo real intercambiados entre usuarios del sistema.',
  user_contacts: 'Lista de contactos y conexiones guardadas entre usuarios en la red social/scout.',
  passkeys: 'Credenciales WebAuthn / Passkeys para autenticación biométrica y acceso sin contraseña.',
  query_logs: 'Historial audit de consultas e interacciones enviadas al agente de Inteligencia Artificial (Gemini).',
  comparison_logs: 'Registro de comparaciones de rendimiento ejecutadas entre pares de jugadores.',
  favorite_logs: 'Historial de acciones sobre jugadores marcados como favoritos por los usuarios.',
  expired_registrations: 'Registro de registros incompletos o vencidos para gestión de limpieza.',
  sysdiagrams: 'Tabla interna del sistema de Microsoft SQL Server utilizada para diagramas ERD en SSMS.'
};

// Column Descriptions Helper
function getColumnDescription(tableName, colName, dataType) {
  const name = colName.toLowerCase();
  if (colName === 'id') return 'Identificador único (Primary Key).';
  if (colName === 'userId') return 'ID del usuario propietario o relacionado (FK -> users.id).';
  if (colName === 'createdAt') return 'Fecha y hora de creación del registro.';
  if (colName === 'updatedAt') return 'Fecha y hora de última actualización.';
  if (colName === 'name') return 'Nombre completo del objeto o entidad.';
  if (colName === 'country') return 'País asociado.';
  
  if (tableName === 'users') {
    if (name.includes('password')) return 'Hash encriptado de la contraseña.';
    if (name.includes('role')) return 'Rol del usuario (Scout, Entrenador, Admin, etc.).';
    if (name.includes('tier')) return 'Nivel de suscripción actual (Gratis, Pro, Elite).';
    if (name.includes('passkey')) return 'Datos de credenciales o PIN para Passkey WebAuthn.';
    if (name.includes('card')) return 'Datos de tarjeta de crédito/débito guardada.';
    if (name.includes('otp')) return 'Código de verificación temporal OTP o su expiración.';
    if (name.includes('onboarding')) return 'Indicador de flujo de bienvenida completado.';
  }
  if (tableName === 'players' || tableName === 'Prospects') {
    if (name.includes('age')) return 'Edad en años.';
    if (name.includes('position')) return 'Posición táctica en el campo.';
    if (name.includes('rating') || name.includes('overall')) return 'Calificación general (0 - 99).';
    if (name.includes('marketvalue')) return 'Valor estimado en el mercado en EUR/USD.';
    if (name.includes('jersey')) return 'Número de camiseta/dorsal.';
    if (name.includes('stats')) return 'Estadísticas detalladas (JSON string / Text).';
    if (name.includes('height')) return 'Estatura del jugador.';
    if (name.includes('weight')) return 'Peso corporal del jugador.';
    if (name.includes('preferredfoot')) return 'Pie preferido (Izquierdo / Derecho).';
    if (name.includes('photo')) return 'URL o ID de la fotografía del jugador.';
    if (name.includes('bio')) return 'Biografía e historial profesional del jugador.';
    if (name.includes('doc')) return 'Documentos de identidad/contrato adjuntos.';
  }
  if (tableName === 'payments') {
    if (name.includes('transaction')) return 'ID único de transacción del pasarela de pago.';
    if (name.includes('amount')) return 'Monto cobrado.';
    if (name.includes('status')) return 'Estado de la transacción (success, pending, failed).';
  }
  
  if (dataType.includes('int') || dataType.includes('float') || dataType.includes('bigint')) {
    return 'Valor numérico de métrica o estado.';
  }
  if (dataType.includes('bit')) return 'Indicador booleano (1 / 0).';
  if (dataType.includes('datetime')) return 'Marca temporal de fecha y hora.';
  if (dataType.includes('nvarchar') || dataType.includes('char')) return 'Cadena de texto de información.';
  return 'Campo de datos del sistema.';
}

function generatePDF() {
  const doc = new PDFDocument({
    size: 'A4',
    margin: 40,
    bufferPages: true
  });

  const stream = fs.createWriteStream(workspacePath);
  doc.pipe(stream);

  // Palette
  const colors = {
    primary: '#0F172A',      // Dark Navy Slate
    secondary: '#0D9488',    // Deep Teal
    accent: '#2563EB',       // Royal Blue
    darkText: '#1E293B',     // Slate 800
    mutedText: '#64748B',    // Slate 500
    lightBg: '#F8FAFC',      // Slate 50
    tableHeaderBg: '#1E293B',// Slate 800
    tableHeaderFont: '#FFFFFF',
    border: '#CBD5E1',       // Slate 300
    pkBg: '#FEF3C7',         // Amber 100
    pkText: '#B45309',       // Amber 700
    fkBg: '#E0E7FF',         // Indigo 100
    fkText: '#4338CA',       // Indigo 700
    nullBg: '#F1F5F9',       // Slate 100
    nullText: '#475569',      // Slate 600
    notNullBg: '#FEE2E2',    // Red 100
    notNullText: '#B91C1C'   // Red 700
  };

  // Helper Header & Cover
  function drawHeader() {
    doc.save();
    doc.rect(40, 30, 515, 45).fill(colors.primary);
    doc.fillColor('#FFFFFF')
       .fontSize(16)
       .font('Helvetica-Bold')
       .text('FUTBOL AI — PLATAFORMA DE INTELIGENCIA DEPORTIVA', 55, 42);
    
    doc.fillColor('#94A3B8')
       .fontSize(9)
       .font('Helvetica')
       .text('DICCIONARIO DE BASE DE DATOS | MOTOR: MICROSOFT SQL SERVER (DB: FutbolAI)', 55, 60);
    doc.restore();
  }

  // Draw Header on first page
  drawHeader();

  let startY = 95;

  // Document Title Section
  doc.fillColor(colors.primary)
     .fontSize(20)
     .font('Helvetica-Bold')
     .text('DOCUMENTACION TECNICA DE BASE DE DATOS', 40, startY);

  doc.fillColor(colors.mutedText)
     .fontSize(10)
     .font('Helvetica')
     .text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, 40, startY + 24);

  // Executive Summary Card
  startY += 48;
  doc.rect(40, startY, 515, 80).fillAndStroke(colors.lightBg, colors.border);
  
  doc.fillColor(colors.secondary)
     .fontSize(12)
     .font('Helvetica-Bold')
     .text('RESUMEN EJECUTIVO Y ARQUITECTURA', 55, startY + 12);

  const totalTables = Object.keys(schema.dbTables).length;
  let totalColumns = 0;
  let totalFKs = 0;
  Object.values(schema.dbTables).forEach(t => {
    totalColumns += t.columns.length;
    totalFKs += t.foreignKeys.length;
  });

  doc.fillColor(colors.darkText)
     .fontSize(9.5)
     .font('Helvetica')
     .text(`- Total de Tablas registradas: ${totalTables} (14 de aplicación + 1 de sistema MS SQL)`, 55, startY + 30)
     .text(`- Total de Campos / Columnas: ${totalColumns} columnas estructuradas`, 55, startY + 44)
     .text(`- Total de Llaves Foráneas (Relaciones FK): ${totalFKs} relaciones explicitas en el motor SQL Server`, 55, startY + 58);

  startY += 95;

  // Section: Foreign Keys Summary Matrix
  doc.fillColor(colors.primary)
     .fontSize(13)
     .font('Helvetica-Bold')
     .text('1. MATRIZ DE LLAVES FORANEAS (RELACIONES ENTRE TABLAS)', 40, startY);

  startY += 18;

  // FK Table Header
  const fkColWidths = [120, 100, 120, 100, 75];
  const fkHeaders = ['Tabla Origen', 'Columna FK', 'Tabla Referenciada', 'Columna Ref.', 'Restriccion'];

  function drawFKTableHeader(y) {
    doc.rect(40, y, 515, 18).fill(colors.primary);
    doc.fillColor('#FFFFFF').fontSize(8.5).font('Helvetica-Bold');
    let x = 45;
    fkHeaders.forEach((h, i) => {
      doc.text(h, x, y + 4, { width: fkColWidths[i], align: 'left' });
      x += fkColWidths[i];
    });
  }

  drawFKTableHeader(startY);
  startY += 18;

  let allFKs = [];
  Object.entries(schema.dbTables).forEach(([tName, tData]) => {
    tData.foreignKeys.forEach(fk => {
      allFKs.push({
        fromTable: tName,
        fromCol: fk.parent_column,
        toTable: fk.referenced_table,
        toCol: fk.referenced_column,
        name: fk.constraint_name
      });
    });
  });

  doc.font('Helvetica').fontSize(8);
  allFKs.forEach((fk, idx) => {
    if (startY > 760) {
      doc.addPage();
      drawHeader();
      startY = 90;
      drawFKTableHeader(startY);
      startY += 18;
    }

    const rowBg = idx % 2 === 0 ? colors.lightBg : '#FFFFFF';
    doc.rect(40, startY, 515, 16).fillAndStroke(rowBg, colors.border);
    
    doc.fillColor(colors.darkText);
    let x = 45;
    doc.text(fk.fromTable, x, startY + 3, { width: fkColWidths[0] }); x += fkColWidths[0];
    doc.font('Helvetica-Bold').fillColor(colors.fkText).text(fk.fromCol, x, startY + 3, { width: fkColWidths[1] }); x += fkColWidths[1];
    doc.font('Helvetica').fillColor(colors.darkText).text(fk.toTable, x, startY + 3, { width: fkColWidths[2] }); x += fkColWidths[2];
    doc.font('Helvetica-Bold').fillColor(colors.primary).text(fk.toCol, x, startY + 3, { width: fkColWidths[3] }); x += fkColWidths[3];
    doc.font('Helvetica').fillColor(colors.mutedText).text('FK Active', x, startY + 3, { width: fkColWidths[4] });

    startY += 16;
  });

  startY += 25;

  // Section: Detailed Tables Breakdown
  if (startY > 700) {
    doc.addPage();
    drawHeader();
    startY = 90;
  }

  doc.fillColor(colors.primary)
     .fontSize(14)
     .font('Helvetica-Bold')
     .text('2. DICCIONARIO DETALLADO DE TABLAS Y CAMPOS', 40, startY);

  startY += 25;

  const tableColWidths = [22, 118, 85, 80, 75, 135];
  const tableHeaders = ['#', 'Campo (Columna)', 'Tipo de Dato', 'Nulabilidad', 'Llaves / Keys', 'Descripción / Propósito'];

  function drawTableHeader(y) {
    doc.rect(40, y, 515, 18).fill(colors.tableHeaderBg);
    doc.fillColor(colors.tableHeaderFont).fontSize(8).font('Helvetica-Bold');
    let x = 43;
    tableHeaders.forEach((h, i) => {
      doc.text(h, x, y + 4, { width: tableColWidths[i], align: 'left' });
      x += tableColWidths[i];
    });
  }

  // Iterate over each table
  const tableNames = Object.keys(schema.dbTables);

  tableNames.forEach((tableName) => {
    const tableData = schema.dbTables[tableName];
    const description = tableDescriptions[tableName] || 'Tabla de almacenamiento de datos de la plataforma.';
    
    // Check page space for table header card
    if (startY > 680) {
      doc.addPage();
      drawHeader();
      startY = 90;
    }

    // Table Header Card
    doc.rect(40, startY, 515, 32).fillAndStroke('#F1F5F9', colors.primary);
    
    doc.fillColor(colors.primary)
       .fontSize(11)
       .font('Helvetica-Bold')
       .text(`TABLA: ${tableName.toUpperCase()}`, 50, startY + 6);

    doc.fillColor(colors.mutedText)
       .fontSize(8)
       .font('Helvetica')
       .text(`Columnas: ${tableData.columns.length}  |  Llaves Foráneas: ${tableData.foreignKeys.length}`, 360, startY + 6, { align: 'right' });

    doc.fillColor(colors.darkText)
       .fontSize(8)
       .font('Helvetica-Oblique')
       .text(`Descripción: ${description}`, 50, startY + 18, { width: 495 });

    startY += 36;

    // Draw Table Columns Header
    drawTableHeader(startY);
    startY += 18;

    // Draw Columns Rows
    tableData.columns.forEach((col, index) => {
      if (startY > 780) {
        doc.addPage();
        drawHeader();
        startY = 90;
        
        // Repeat mini header for context
        doc.rect(40, startY, 515, 16).fill(colors.lightBg);
        doc.fillColor(colors.primary).fontSize(8.5).font('Helvetica-Bold')
           .text(`Continuación de Tabla: ${tableName}`, 45, startY + 3);
        startY += 16;

        drawTableHeader(startY);
        startY += 18;
      }

      const rowBg = index % 2 === 0 ? '#FFFFFF' : '#F8FAFC';
      const isPk = !!col.IS_PRIMARY_KEY;
      
      // Find if col is FK
      const fkInfo = tableData.foreignKeys.find(fk => fk.parent_column === col.COLUMN_NAME);
      const isFk = !!fkInfo;
      const isNullable = col.IS_NULLABLE === 'YES';

      const typeStr = col.DATA_TYPE + (col.CHARACTER_MAXIMUM_LENGTH ? `(${col.CHARACTER_MAXIMUM_LENGTH === -1 ? 'MAX' : col.CHARACTER_MAXIMUM_LENGTH})` : '');
      const colDesc = getColumnDescription(tableName, col.COLUMN_NAME, col.DATA_TYPE);

      doc.rect(40, startY, 515, 16).fillAndStroke(rowBg, colors.border);

      let x = 43;
      doc.fillColor(colors.mutedText).font('Helvetica').fontSize(7.5)
         .text(`${index + 1}`, x, startY + 4, { width: tableColWidths[0] });
      x += tableColWidths[0];

      // Column Name
      doc.fillColor(colors.darkText).font('Helvetica-Bold').fontSize(8)
         .text(col.COLUMN_NAME, x, startY + 4, { width: tableColWidths[1] });
      x += tableColWidths[1];

      // Type
      doc.fillColor('#334155').font('Helvetica').fontSize(7.5)
         .text(typeStr, x, startY + 4, { width: tableColWidths[2] });
      x += tableColWidths[2];

      // Nullability badge
      if (isNullable) {
        doc.rect(x, startY + 2, 45, 11).fill(colors.nullBg);
        doc.fillColor(colors.nullText).font('Helvetica-Bold').fontSize(7)
           .text('NULL', x + 10, startY + 3);
      } else {
        doc.rect(x, startY + 2, 55, 11).fill(colors.notNullBg);
        doc.fillColor(colors.notNullText).font('Helvetica-Bold').fontSize(7)
           .text('NOT NULL', x + 5, startY + 3);
      }
      x += tableColWidths[3];

      // Keys badges (PK / FK)
      if (isPk) {
        doc.rect(x, startY + 2, 22, 11).fill(colors.pkBg);
        doc.fillColor(colors.pkText).font('Helvetica-Bold').fontSize(7)
           .text('PK', x + 5, startY + 3);
      }
      if (isFk) {
        const fkX = isPk ? x + 25 : x;
        doc.rect(fkX, startY + 2, 45, 11).fill(colors.fkBg);
        doc.fillColor(colors.fkText).font('Helvetica-Bold').fontSize(6.5)
           .text(`FK->${fkInfo.referenced_table}`, fkX + 3, startY + 3);
      }
      if (!isPk && !isFk) {
        doc.fillColor(colors.mutedText).font('Helvetica').fontSize(7.5).text('-', x + 10, startY + 4);
      }
      x += tableColWidths[4];

      // Description / Default
      let extra = col.COLUMN_DEFAULT ? ` [Def: ${col.COLUMN_DEFAULT}]` : '';
      doc.fillColor(colors.darkText).font('Helvetica').fontSize(7)
         .text(`${colDesc}${extra}`, x, startY + 3, { width: tableColWidths[5], height: 12, lineBreak: false });

      startY += 16;
    });

    startY += 15; // Space between tables
  });

  // Footer and Page Numbering Pass
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    doc.save();
    
    // Bottom border line
    doc.lineWidth(0.5).strokeColor(colors.border).moveTo(40, 805).lineTo(555, 805).stroke();
    
    doc.fillColor(colors.mutedText)
       .fontSize(8)
       .font('Helvetica')
       .text('FutbolAI Platform — Documento confidencial de estructura de Base de Datos', 40, 812);
    
    doc.text(`Página ${i + 1} de ${range.count}`, 450, 812, { align: 'right', width: 105 });
    doc.restore();
  }

  doc.end();

  stream.on('finish', () => {
    console.log(`PDF created successfully at: ${workspacePath}`);
    
    // Copy to Desktop
    try {
      fs.copyFileSync(workspacePath, desktopPath);
      console.log(`Copied PDF to Desktop: ${desktopPath}`);
    } catch (e) {
      console.error('Failed to copy to Desktop:', e.message);
    }

    // Copy to Futbol AI Local folder
    try {
      if (!fs.existsSync(localFolderDir)) {
        fs.mkdirSync(localFolderDir, { recursive: true });
      }
      fs.copyFileSync(workspacePath, localFolderPath);
      console.log(`Copied PDF to Futbol AI Local folder: ${localFolderPath}`);
    } catch (e) {
      console.error('Failed to copy to Futbol AI Local folder:', e.message);
    }
  });
}

generatePDF();
