const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const sequelize = new Sequelize(
  process.env.DB_NAME || 'FutbolAI',
  process.env.DB_USER || 'football_user',
  process.env.DB_PASSWORD || 'FootballPassword123!',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '1433'),
    dialect: 'mssql',
    dialectOptions: {
      options: {
        encrypt: false,
        trustServerCertificate: true
      }
    },
    logging: console.log
  }
);

async function healAllTables() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a SQL Server (MSSQL)');

    // 1. Tabla users
    const userQueries = [
      "IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'hasPasskey') ALTER TABLE users ADD hasPasskey BIT NULL DEFAULT 0",
      "IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'passkeyCredentialId') ALTER TABLE users ADD passkeyCredentialId NVARCHAR(MAX) NULL",
      "IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'passkeyPublicKey') ALTER TABLE users ADD passkeyPublicKey NVARCHAR(MAX) NULL",
      "IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'passkeyCounter') ALTER TABLE users ADD passkeyCounter INT NULL DEFAULT 0",
      "IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'passkeyPinHash') ALTER TABLE users ADD passkeyPinHash NVARCHAR(255) NULL",
      "IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'passkeyChallenge') ALTER TABLE users ADD passkeyChallenge NVARCHAR(255) NULL",
      "IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'passkeyDeviceInfo') ALTER TABLE users ADD passkeyDeviceInfo NVARCHAR(MAX) NULL",
      "IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'passkeyWebAuthnDevice') ALTER TABLE users ADD passkeyWebAuthnDevice NVARCHAR(MAX) NULL",
      "IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'passkeyPinDevice') ALTER TABLE users ADD passkeyPinDevice NVARCHAR(MAX) NULL",
      "IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'securityQuestions') ALTER TABLE users ADD securityQuestions NVARCHAR(MAX) NULL",
      "IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'featureSettings') ALTER TABLE users ADD featureSettings NVARCHAR(MAX) NULL",
      "IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'billingCycleStart') ALTER TABLE users ADD billingCycleStart DATETIME NULL",
      "IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'billingCycleEnd') ALTER TABLE users ADD billingCycleEnd DATETIME NULL",
      "IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'autoRenew') ALTER TABLE users ADD autoRenew BIT NULL DEFAULT 1",
      "IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'maxPaidTierInCycle') ALTER TABLE users ADD maxPaidTierInCycle NVARCHAR(50) NULL DEFAULT 'Gratis'",
      "IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'maxPaidTier') ALTER TABLE users ADD maxPaidTier NVARCHAR(50) NULL DEFAULT 'Gratis'",
      "IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'localCoachData') ALTER TABLE users ADD localCoachData NVARCHAR(MAX) NULL",
      "IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'dailyComparisonsCount') ALTER TABLE users ADD dailyComparisonsCount INT NULL DEFAULT 0",
      "IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'dailyAiMessagesCount') ALTER TABLE users ADD dailyAiMessagesCount INT NULL DEFAULT 0",
      "IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'lastDailyResetDate') ALTER TABLE users ADD lastDailyResetDate NVARCHAR(10) NULL",
      "IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'weeklyComparisonsCount') ALTER TABLE users ADD weeklyComparisonsCount INT NULL DEFAULT 0",
      "IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'weeklyAiMessagesCount') ALTER TABLE users ADD weeklyAiMessagesCount INT NULL DEFAULT 0",
      "IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'monthlySimulationsCount') ALTER TABLE users ADD monthlySimulationsCount INT NULL DEFAULT 0",
      "IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'monthlyComparisonsCount') ALTER TABLE users ADD monthlyComparisonsCount INT NULL DEFAULT 0",
      "IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'firstDailyComparisonAt') ALTER TABLE users ADD firstDailyComparisonAt DATETIME2 NULL",
      "IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'firstDailyAiMessageAt') ALTER TABLE users ADD firstDailyAiMessageAt DATETIME2 NULL",
      "IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'firstWeeklyComparisonAt') ALTER TABLE users ADD firstWeeklyComparisonAt DATETIME2 NULL",
      "IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'firstWeeklyAiMessageAt') ALTER TABLE users ADD firstWeeklyAiMessageAt DATETIME2 NULL",
      "IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'firstMonthlySimulationAt') ALTER TABLE users ADD firstMonthlySimulationAt DATETIME2 NULL",
      "IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'firstMonthlyComparisonAt') ALTER TABLE users ADD firstMonthlyComparisonAt DATETIME2 NULL",
      "IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'lastWeeklyResetDate') ALTER TABLE users ADD lastWeeklyResetDate NVARCHAR(15) NULL",
      "IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'lastMonthlyResetDate') ALTER TABLE users ADD lastMonthlyResetDate NVARCHAR(10) NULL"
    ];

    for (const q of userQueries) {
      await sequelize.query(q).catch(e => console.warn('User query note:', e.message));
    }
    console.log('✅ Tabla [users] actualizada.');

    // 2. Tabla payments
    await sequelize.query(`
      IF OBJECT_ID('payments', 'U') IS NULL
      CREATE TABLE payments (
        id NVARCHAR(255) NOT NULL PRIMARY KEY,
        userId NVARCHAR(255) NULL,
        userAccount NVARCHAR(100) NULL,
        userEmail NVARCHAR(255) NULL,
        planId NVARCHAR(50) NOT NULL,
        planName NVARCHAR(100) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        currency NVARCHAR(10) NOT NULL DEFAULT 'USD',
        billingCycle NVARCHAR(20) NOT NULL DEFAULT 'monthly',
        status NVARCHAR(20) NOT NULL DEFAULT 'completed',
        paymentMethod NVARCHAR(50) NOT NULL DEFAULT 'card',
        last4 NVARCHAR(4) NULL,
        cardBrand NVARCHAR(20) NULL,
        transactionId NVARCHAR(100) NOT NULL,
        invoiceNumber NVARCHAR(100) NOT NULL,
        pdfUrl NVARCHAR(500) NULL,
        createdAt DATETIMEOFFSET NOT NULL DEFAULT GETDATE(),
        updatedAt DATETIMEOFFSET NOT NULL DEFAULT GETDATE()
      );
    `).catch(e => console.warn('Payments table note:', e.message));

    const paymentQueries = [
      "IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'payments' AND COLUMN_NAME = 'userAccount') ALTER TABLE payments ADD userAccount NVARCHAR(100) NULL",
      "IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'payments' AND COLUMN_NAME = 'userEmail') ALTER TABLE payments ADD userEmail NVARCHAR(255) NULL",
      "IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'payments' AND COLUMN_NAME = 'pdfUrl') ALTER TABLE payments ADD pdfUrl NVARCHAR(500) NULL"
    ];
    for (const q of paymentQueries) {
      await sequelize.query(q).catch(e => console.warn('Payment query note:', e.message));
    }
    console.log('✅ Tabla [payments] actualizada.');

    // 3. Tabla payment_methods
    await sequelize.query(`
      IF OBJECT_ID('payment_methods', 'U') IS NULL
      CREATE TABLE payment_methods (
        id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
        userId NVARCHAR(255) NOT NULL,
        cardholderName NVARCHAR(255) NOT NULL,
        cardBrand NVARCHAR(50) NOT NULL DEFAULT 'Visa',
        last4 NVARCHAR(4) NOT NULL,
        expMonth NVARCHAR(2) NOT NULL,
        expYear NVARCHAR(4) NOT NULL,
        encryptedCardDetails NVARCHAR(MAX) NOT NULL,
        isDefault BIT NULL DEFAULT 0,
        userAccount NVARCHAR(100) NULL,
        createdAt DATETIMEOFFSET NOT NULL DEFAULT GETDATE(),
        updatedAt DATETIMEOFFSET NOT NULL DEFAULT GETDATE()
      );
    `).catch(e => console.warn('Payment_methods table note:', e.message));

    const paymentMethodQueries = [
      "IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'payment_methods' AND COLUMN_NAME = 'userAccount') ALTER TABLE payment_methods ADD userAccount NVARCHAR(100) NULL",
      "IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'payment_methods' AND COLUMN_NAME = 'isDefault') ALTER TABLE payment_methods ADD isDefault BIT NULL DEFAULT 0"
    ];
    for (const q of paymentMethodQueries) {
      await sequelize.query(q).catch(e => console.warn('PaymentMethod query note:', e.message));
    }
    console.log('✅ Tabla [payment_methods] actualizada.');

    // 4. Tabla direct_messages
    await sequelize.query(`
      IF OBJECT_ID('direct_messages', 'U') IS NULL
      CREATE TABLE direct_messages (
        id NVARCHAR(255) NOT NULL PRIMARY KEY,
        senderId NVARCHAR(255) NOT NULL,
        receiverId NVARCHAR(255) NOT NULL,
        content NVARCHAR(MAX) NOT NULL,
        isRead BIT NULL DEFAULT 0,
        createdAt DATETIMEOFFSET NOT NULL DEFAULT GETDATE(),
        updatedAt DATETIMEOFFSET NOT NULL DEFAULT GETDATE()
      );
    `).catch(e => console.warn('Direct_messages table note:', e.message));
    console.log('✅ Tabla [direct_messages] actualizada.');

    // 5. Tabla user_contacts
    await sequelize.query(`
      IF OBJECT_ID('user_contacts', 'U') IS NULL
      CREATE TABLE user_contacts (
        id NVARCHAR(255) NOT NULL PRIMARY KEY,
        userId NVARCHAR(255) NOT NULL,
        contactUserId NVARCHAR(255) NOT NULL,
        nickname NVARCHAR(255) NULL,
        createdAt DATETIMEOFFSET NOT NULL DEFAULT GETDATE(),
        updatedAt DATETIMEOFFSET NOT NULL DEFAULT GETDATE()
      );
    `).catch(e => console.warn('User_contacts table note:', e.message));
    console.log('✅ Tabla [user_contacts] actualizada.');

    // 6. Tabla Players
    const playerQueries = [
      "IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Players' AND COLUMN_NAME = 'userId') ALTER TABLE Players ADD userId NVARCHAR(255) NULL",
      "IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Players' AND COLUMN_NAME = 'nationalityEs') ALTER TABLE Players ADD nationalityEs NVARCHAR(255) NULL",
      "IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Players' AND COLUMN_NAME = 'positionEs') ALTER TABLE Players ADD positionEs NVARCHAR(255) NULL",
      "IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Players' AND COLUMN_NAME = 'careerTotals') ALTER TABLE Players ADD careerTotals NVARCHAR(MAX) NULL",
      "IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Players' AND COLUMN_NAME = 'trophies') ALTER TABLE Players ADD trophies NVARCHAR(MAX) NULL",
      "IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Players' AND COLUMN_NAME = 'transfers') ALTER TABLE Players ADD transfers NVARCHAR(MAX) NULL",
      "IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Players' AND COLUMN_NAME = 'strengths') ALTER TABLE Players ADD strengths NVARCHAR(MAX) NULL",
      "IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Players' AND COLUMN_NAME = 'tags') ALTER TABLE Players ADD tags NVARCHAR(MAX) NULL",
      "IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Players' AND COLUMN_NAME = 'history') ALTER TABLE Players ADD history NVARCHAR(MAX) NULL"
    ];
    for (const q of playerQueries) {
      await sequelize.query(q).catch(e => console.warn('Player query note:', e.message));
    }
    console.log('✅ Tabla [Players] actualizada.');

    console.log('🎉 TODAS LAS TABLAS Y CAMPOS DE SQL SERVER ESTÁN 100% ACTUALIZADOS Y SINCRONIZADOS!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error actualizando tablas de SQL Server:', err);
    process.exit(1);
  }
}

healAllTables();
