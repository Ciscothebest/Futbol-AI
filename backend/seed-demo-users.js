const { User } = require('./database');
const bcrypt = require('bcryptjs');

async function seedDemoUsers() {
  try {
    const demoUsers = [
      {
        username: 'scout_madrid',
        passwordHash: await bcrypt.hash('Scout123!', 10),
        nombres: 'Carlos',
        apellidos: 'Mendoza',
        email: 'carlos.scout@realmadrid.com',
        role: 'Scout Profesional',
        selectedClub: 'Real Madrid',
        isActive: true
      },
      {
        username: 'scout_barca',
        passwordHash: await bcrypt.hash('Scout123!', 10),
        nombres: 'Diego',
        apellidos: 'Navarro',
        email: 'diego.scout@fcbarcelona.com',
        role: 'Scout Internacional',
        selectedClub: 'FC Barcelona',
        isActive: true
      },
      {
        username: 'dt_atletico',
        passwordHash: await bcrypt.hash('Scout123!', 10),
        nombres: 'Mateo',
        apellidos: 'García',
        email: 'mateo.dt@atleticodemadrid.com',
        role: 'Director Técnico',
        selectedClub: 'Atlético de Madrid',
        isActive: true
      }
    ];

    for (const u of demoUsers) {
      const [user, created] = await User.findOrCreate({
        where: { username: u.username },
        defaults: u
      });
      if (created) {
        console.log(`✅ Usuario demo creado: ${u.nombres} ${u.apellidos} (${u.role} - ${u.selectedClub})`);
      }
    }
  } catch (err) {
    console.error('❌ Error al sembrar usuarios demo:', err.message);
  }
}

module.exports = seedDemoUsers;

if (require.main === module) {
  seedDemoUsers().then(() => process.exit(0));
}
