const { sequelize, Payment } = require('./database');

async function check() {
  try {
    const desc = await sequelize.getQueryInterface().describeTable('payments');
    console.log('COLUMN DESC FOR payments:');
    console.log(JSON.stringify(desc, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('Error describing table payments:', err);
    process.exit(1);
  }
}

check();
