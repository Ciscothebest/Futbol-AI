const { Prospect, User, sequelize } = require('./database');
const { v4: uuidv4 } = require('uuid');

async function seedProspects() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión establecida con la base de datos de producción.');

    // Buscar al entrenador local principal o el primer entrenador disponible
    let coach = await User.findOne({ where: { role: 'Entrenador Local' } });
    if (!coach) {
      coach = await User.findOne({ where: { id: '19905665-79e8-45d4-a43f-8cb628f4ecec' } });
    }
    if (!coach) {
      coach = await User.findOne();
    }

    const coachId = coach.id;
    console.log(`👤 Asignando prospectos al usuario entrenador ID: ${coachId} (${coach.username || coach.email})`);

    const newProspects = [
      {
        id: `loc-player-${uuidv4()}`,
        userId: coachId,
        name: 'Mateo Rodríguez',
        nickname: 'El Rayo',
        docType: 'CEDULA_DNI',
        docNumber: '402-9847123-1',
        age: 15,
        jerseyNumber: 9,
        position: 'ST',
        positionEs: 'ST',
        category: 'Sub-15',
        preferredFoot: 'Derecho',
        height: 178,
        weight: 70,
        medicalStatus: 'Disponible',
        currentTeam: 'Academia Cibao FC',
        league: 'Liga Juvenil LDF Sub-15',
        country: 'República Dominicana',
        nationality: 'República Dominicana',
        nationalityEs: 'República Dominicana',
        marketValue: 15000,
        bio: 'Mateo es un delantero veloz de 15 años con excelente definición en el área chica, gran aceleración en los primeros metros y capacidad de desmarque continuo.',
        bioEs: 'Mateo es un delantero veloz de 15 años con excelente definición en el área chica, gran aceleración en los primeros metros y capacidad de desmarque continuo.',
        stats: JSON.stringify({
          matches: 20,
          goals: 18,
          assists: 7,
          yellowCards: 1,
          redCards: 0
        }),
        strengths: JSON.stringify([
          'Velocidad de arranque',
          'Remate de primera',
          'Desmarque entre centrales'
        ]),
        improvements: JSON.stringify([
          'Juego aéreo defensivo',
          'Manejo de la pierna inhábil'
        ]),
        weaknesses: JSON.stringify([
          'Fuerza en choque cuerpo a cuerpo',
          'Juego de espaldas al arco'
        ]),
        tacticalNotes: 'Aprovecha muy bien los espacios a las espaldas de los centrales rivales. Sumamente efectivo en transiciones ofensivas rápidas y definición al primer toque.',
        highlightUrl: 'https://www.youtube.com/watch?v=PTSx27mYHYY',
        trophies: JSON.stringify([
          { name: 'Bota de Oro Sub-15', season: '2025-2026' },
          { name: 'Campeón Torneo Apertura Sub-15', season: '2025-2026' }
        ]),
        injuries: JSON.stringify([]),
        authorizations: JSON.stringify({
          image: true,
          data: true,
          medical: true
        }),
        legalDetails: JSON.stringify({
          guardians: [
            {
              name: 'Alejandro Rodríguez',
              relationship: 'PADRE',
              docType: 'CEDULA_DNI',
              docNumber: '402-1234567-8',
              phone: '+1 809-555-0192',
              email: 'alejandro.rodriguez@gmail.com'
            }
          ],
          guardianName: 'Alejandro Rodríguez',
          guardianRelationship: 'PADRE',
          guardianDocType: 'CEDULA_DNI',
          guardianDocNumber: '402-1234567-8',
          guardianPhone: '+1 809-555-0192',
          guardianEmail: 'alejandro.rodriguez@gmail.com'
        }),
        tags: JSON.stringify(['Sub-15', 'Disponible', 'Delantero', 'Cantera']),
        history: JSON.stringify([
          {
            season: '2025-2026',
            team: 'Academia Cibao FC',
            matches: 20,
            goals: 18,
            assists: 7,
            yellowCards: 1,
            redCards: 0,
            rating: 15.2
          }
        ])
      },
      {
        id: `loc-player-${uuidv4()}`,
        userId: coachId,
        name: 'Carlos Eduardo Peralta',
        nickname: 'Carlitos',
        docType: 'CEDULA_DNI',
        docNumber: '402-8823104-5',
        age: 17,
        jerseyNumber: 10,
        position: 'CAM',
        positionEs: 'CAM',
        category: 'Sub-17',
        preferredFoot: 'Izquierdo',
        height: 173,
        weight: 65,
        medicalStatus: 'Disponible',
        currentTeam: 'Escuela Bauger FC',
        league: 'Liga Juvenil LDF Sub-17',
        country: 'República Dominicana',
        nationality: 'República Dominicana',
        nationalityEs: 'República Dominicana',
        marketValue: 25000,
        bio: 'Mediocampista creativo de 17 años dotado de una zurda prodigiosa, visión periférica superior y especialidad en el lanzamiento de faltas directas.',
        bioEs: 'Mediocampista creativo de 17 años dotado de una zurda prodigiosa, visión periférica superior y especialidad en el lanzamiento de faltas directas.',
        stats: JSON.stringify({
          matches: 24,
          goals: 10,
          assists: 19,
          yellowCards: 2,
          redCards: 0
        }),
        strengths: JSON.stringify([
          'Pase filtrado',
          'Tiro libre directo',
          'Visión periférica'
        ]),
        improvements: JSON.stringify([
          'Resistencia física en tramos finales',
          'Recuperación tras pérdida'
        ]),
        weaknesses: JSON.stringify([
          'Cobertura defensiva',
          'Fuerza física en choque'
        ]),
        tacticalNotes: 'Cerebro y organizador del juego ofensivo. Se desenvuelve como mediapunta libre con tendencia a caer a la banda izquierda para filtrar centros en diagonal.',
        highlightUrl: 'https://www.youtube.com/watch?v=PTSx27mYHYY',
        trophies: JSON.stringify([
          { name: 'Máximo Asistente Sub-17', season: '2025-2026' },
          { name: 'Mejor Mediocampista Juvenil', season: '2025-2026' }
        ]),
        injuries: JSON.stringify([]),
        authorizations: JSON.stringify({
          image: true,
          data: true,
          medical: true
        }),
        legalDetails: JSON.stringify({
          guardians: [
            {
              name: 'Carmen Peralta',
              relationship: 'MADRE',
              docType: 'CEDULA_DNI',
              docNumber: '402-3344556-9',
              phone: '+1 829-555-0843',
              email: 'carmen.peralta@gmail.com'
            }
          ],
          guardianName: 'Carmen Peralta',
          guardianRelationship: 'MADRE',
          guardianDocType: 'CEDULA_DNI',
          guardianDocNumber: '402-3344556-9',
          guardianPhone: '+1 829-555-0843',
          guardianEmail: 'carmen.peralta@gmail.com'
        }),
        tags: JSON.stringify(['Sub-17', 'Disponible', 'Volante', 'Cantera']),
        history: JSON.stringify([
          {
            season: '2025-2026',
            team: 'Escuela Bauger FC',
            matches: 24,
            goals: 10,
            assists: 19,
            yellowCards: 2,
            redCards: 0,
            rating: 16.1
          }
        ])
      },
      {
        id: `loc-player-${uuidv4()}`,
        userId: coachId,
        name: 'Diego Andrés Batista',
        nickname: 'El Muro',
        docType: 'CEDULA_DNI',
        docNumber: '402-7749201-3',
        age: 16,
        jerseyNumber: 4,
        position: 'CB',
        positionEs: 'CB',
        category: 'Sub-17',
        preferredFoot: 'Derecho',
        height: 188,
        weight: 82,
        medicalStatus: 'Disponible',
        currentTeam: 'Deportivo Pantoja Sub-17',
        league: 'Liga Juvenil LDF Sub-17',
        country: 'República Dominicana',
        nationality: 'República Dominicana',
        nationalityEs: 'República Dominicana',
        marketValue: 20000,
        bio: 'Defensor central imponente de 16 años, dominante en el juego aéreo defensivo y ofensivo, con gran vocación de mando en la zaga.',
        bioEs: 'Defensor central imponente de 16 años, dominante en el juego aéreo defensivo y ofensivo, con gran vocación de mando en la zaga.',
        stats: JSON.stringify({
          matches: 22,
          goals: 4,
          assists: 2,
          yellowCards: 4,
          redCards: 0
        }),
        strengths: JSON.stringify([
          'Juego aéreo en ambas áreas',
          'Entradas limpias',
          'Liderazgo y comunicación'
        ]),
        improvements: JSON.stringify([
          'Salida limpia con balón',
          'Giro rápido frente a atacantes de baja estatura'
        ]),
        weaknesses: JSON.stringify([
          'Velocidad de giro',
          'Precisión en pase largo'
        ]),
        tacticalNotes: 'Líder vocal del bloque defensivo. Gana la mayoría de duelos divididos en el aire y aporta contundencia en los tiros de esquina a favor.',
        highlightUrl: 'https://www.youtube.com/watch?v=PTSx27mYHYY',
        trophies: JSON.stringify([
          { name: 'Mejor Defensor Juvenil', season: '2025-2026' }
        ]),
        injuries: JSON.stringify([]),
        authorizations: JSON.stringify({
          image: true,
          data: true,
          medical: true
        }),
        legalDetails: JSON.stringify({
          guardians: [
            {
              name: 'José Batista',
              relationship: 'PADRE',
              docType: 'CEDULA_DNI',
              docNumber: '402-9988776-1',
              phone: '+1 849-555-0371',
              email: 'jose.batista@gmail.com'
            }
          ],
          guardianName: 'José Batista',
          guardianRelationship: 'PADRE',
          guardianDocType: 'CEDULA_DNI',
          guardianDocNumber: '402-9988776-1',
          guardianPhone: '+1 849-555-0371',
          guardianEmail: 'jose.batista@gmail.com'
        }),
        tags: JSON.stringify(['Sub-17', 'Disponible', 'Defensa', 'Cantera']),
        history: JSON.stringify([
          {
            season: '2025-2026',
            team: 'Deportivo Pantoja Sub-17',
            matches: 22,
            goals: 4,
            assists: 2,
            yellowCards: 4,
            redCards: 0,
            rating: 14.9
          }
        ])
      }
    ];

    for (const data of newProspects) {
      const created = await Prospect.create(data);
      console.log(`✨ Prospecto insertado con éxito: ID=${created.id} - ${created.name} (${created.position})`);
    }

    console.log('🎉 Se han registrado correctamente los 3 prospectos en producción.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error insertando prospectos:', err);
    process.exit(1);
  }
}

seedProspects();
