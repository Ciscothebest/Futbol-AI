const { execSync } = require('child_process');
const path = require('path');

console.log("=================================================");
console.log("1. SEEDING SQL SERVER (MSSQL)...");
console.log("=================================================");
delete process.env.DB_DIALECT;
try {
  execSync('node backend/seed-db-onboarding.js', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
} catch (e) {
  console.error("Error seeding MSSQL:", e.message);
}

console.log("\n=================================================");
console.log("2. SEEDING SQLITE (database.sqlite)...");
console.log("=================================================");
try {
  execSync('node backend/seed-db-onboarding.js', {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'),
    env: { ...process.env, DB_DIALECT: 'sqlite' }
  });
} catch (e) {
  console.error("Error seeding SQLite:", e.message);
}

console.log("\n=================================================");
console.log("3. VERIFYING BOTH DATABASES...");
console.log("=================================================");

async function verifyMSSQL() {
  delete require.cache[require.resolve('./database')];
  delete process.env.DB_DIALECT;
  const { League, Team } = require('./database');
  const lCount = await League.count();
  const tCount = await Team.count();
  console.log(`✅ MSSQL (SQL Server) -> Leagues: ${lCount} | Teams: ${tCount}`);
}

async function verifySQLite() {
  delete require.cache[require.resolve('./database')];
  process.env.DB_DIALECT = 'sqlite';
  const { League, Team } = require('./database');
  const lCount = await League.count();
  const tCount = await Team.count();
  console.log(`✅ SQLite (database.sqlite) -> Leagues: ${lCount} | Teams: ${tCount}`);
}

async function runVerification() {
  await verifyMSSQL();
  await verifySQLite();
  console.log("=================================================");
  console.log("VERIFICATION COMPLETED SUCCESSFULLY!");
}

runVerification();
