const { sequelize, Payment } = require('./database');

async function check() {
  try {
    const list = await Payment.findAll();
    console.log(`FOUND ${list.length} PAYMENTS:`);
    console.log(JSON.stringify(list, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('Error fetching payments:', err);
    process.exit(1);
  }
}

check();
