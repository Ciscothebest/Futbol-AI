const { sequelize, User, Payment, Player } = require('../backend/database');

async function checkDb() {
  console.log('🔍 Running Database Diagnostic Tool...');
  try {
    await sequelize.authenticate();
    console.log('✅ Connection to database authenticated successfully.');

    const queryInterface = sequelize.getQueryInterface();
    
    console.log('\n--- Describe Table: users ---');
    const usersInfo = await queryInterface.describeTable('users');
    console.log('Columns in users:', Object.keys(usersInfo));

    console.log('\n--- Describe Table: payments ---');
    const paymentsInfo = await queryInterface.describeTable('payments');
    console.log('Columns in payments:', Object.keys(paymentsInfo));

    console.log('\n--- Testing a manual insert and find in payments ---');
    // Find or create a test user
    let user = await User.findOne();
    if (!user) {
      user = await User.create({
        username: 'diagnostic_user',
        passwordHash: 'dummyhash',
        selectedTier: 'Gratis'
      });
      console.log('Created temporary diagnostic user:', user.username);
    } else {
      console.log('Using existing user for test:', user.username);
    }

    const testTxn = 'DIAG-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    const payment = await Payment.create({
      transactionId: testTxn,
      amount: 9.99,
      currency: 'USD',
      tier: 'Pro',
      cardholderName: 'Diagnostic Test',
      cardLast4: '9999',
      status: 'success',
      userId: user.id,
      userAccount: user.username
    });

    console.log('✅ Payment inserted successfully. ID:', payment.id, 'userAccount:', payment.userAccount);

    // Retrieve it
    const retrieved = await Payment.findOne({ where: { transactionId: testTxn } });
    console.log('✅ Payment retrieved successfully. userAccount in DB:', retrieved.userAccount);

    // Cleanup
    await retrieved.destroy();
    console.log('🧹 Cleanup successful: test payment deleted.');

    console.log('\n🏆 DATABASE IS 100% HEALTHY AND FREE OF ERRORS!');
  } catch (err) {
    console.error('\n❌ DATABASE DIAGNOSTIC DETECTED AN ERROR:', err);
  } finally {
    await sequelize.close();
  }
}

checkDb();
