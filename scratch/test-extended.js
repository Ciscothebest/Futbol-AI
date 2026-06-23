const API = 'http://localhost:3001/api';

async function runExtendedTests() {
  const username = 'testscout_' + Math.random().toString(36).substr(2, 5);
  const password = 'Password123!';
  let token = '';

  console.log('🏃 Starting extended API validation flow...');

  // 1. Register & Login
  try {
    await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    token = data.token;
    console.log('🔑 Login successful.');
  } catch (err) {
    console.error('❌ Login failed:', err.message);
    process.exit(1);
  }

  // 2. Query /api/leagues
  try {
    const res = await fetch(`${API}/leagues`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.ok) {
      console.log('✅ /api/leagues SUCCESS. Found leagues:', data.leagues?.length);
    } else {
      console.error('❌ /api/leagues DATABASE ERROR:', data);
    }
  } catch (err) {
    console.error('❌ /api/leagues exception:', err.message);
  }

  // 3. Query /api/positions
  try {
    const res = await fetch(`${API}/positions`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.ok) {
      console.log('✅ /api/positions SUCCESS. Found positions:', data.positions?.length);
    } else {
      console.error('❌ /api/positions DATABASE ERROR:', data);
    }
  } catch (err) {
    console.error('❌ /api/positions exception:', err.message);
  }

  // 4. Query /api/onboarding/leagues
  try {
    const res = await fetch(`${API}/onboarding/leagues`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.ok) {
      console.log('✅ /api/onboarding/leagues SUCCESS. Found leagues:', data.leagues?.length);
    } else {
      console.error('❌ /api/onboarding/leagues DATABASE ERROR:', data);
    }
  } catch (err) {
    console.error('❌ /api/onboarding/leagues exception:', err.message);
  }

  // 5. Query /api/onboarding/teams
  try {
    const res = await fetch(`${API}/onboarding/teams?country=Spain`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.ok) {
      console.log('✅ /api/onboarding/teams SUCCESS. Found teams:', data.teams?.length);
    } else {
      console.error('❌ /api/onboarding/teams DATABASE ERROR:', data);
    }
  } catch (err) {
    console.error('❌ /api/onboarding/teams exception:', err.message);
  }

  console.log('🏁 Extended tests finished.');
}

runExtendedTests();
