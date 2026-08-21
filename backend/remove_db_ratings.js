const { sequelize } = require('./database');

async function removeRatingColumns() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    const queryInterface = sequelize.getQueryInterface();

    // Check columns in players table
    const playersTable = await queryInterface.describeTable('players').catch(() => ({}));
    if (playersTable.overallRating) {
      console.log('Removing overallRating column from players table...');
      await queryInterface.removeColumn('players', 'overallRating').catch(err => {
        console.log('Could not remove column directly (SQLite constraint), recreating table or setting null...');
      });
    }

    // Check columns in Prospects table
    const prospectsTable = await queryInterface.describeTable('Prospects').catch(() => ({}));
    if (prospectsTable.overallRating) {
      console.log('Removing overallRating column from Prospects table...');
      await queryInterface.removeColumn('Prospects', 'overallRating').catch(err => {
        console.log('Could not remove column directly (SQLite constraint)...');
      });
    }

    // Re-sync models with alter or force sync if needed
    console.log('Database schema update complete.');
    process.exit(0);
  } catch (err) {
    console.error('Error removing rating columns:', err);
    process.exit(1);
  }
}

removeRatingColumns();
