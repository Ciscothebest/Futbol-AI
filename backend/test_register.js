const { sequelize, User } = require('./database');

async function run() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database.');

    const username = 'testuser_' + Date.now();
    console.log(`Attempting to register: ${username}`);

    const user = await User.create({
      username: username,
      passwordHash: 'SuperSecretPassword123!',
      nombres: 'Franco',
      apellidos: 'Jimenez',
      telefono: '+33 4 58 96 54 75',
      email: 'franco@gmail.com',
      avatarUrl: `https://api.dicebear.com/9.x/notionists/svg?seed=${username}`
    });

    console.log('✅ User registered successfully:', user.toJSON());
    process.exit(0);
  } catch (err) {
    console.error('❌ Registration test failed!');
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    if (err.parent) {
      console.error('Parent error:', err.parent.message);
    }
    process.exit(1);
  }
}

run();
