const API = 'http://localhost:3001/api';

async function runTests() {
  const username = 'testscout_' + Math.random().toString(36).substr(2, 5);
  const password = 'Password123!';
  let token = '';
  let user = null;

  console.log('🏃 Starting automated API validation flow...');

  // 1. Health check
  try {
    const res = await fetch(`${API}/health`);
    const health = await res.json();
    console.log('💚 Health Check:', health);
  } catch (err) {
    console.error('❌ Health check failed:', err.message);
    process.exit(1);
  }

  // 2. Register
  try {
    const res = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    console.log('👤 Register User:', data);
  } catch (err) {
    console.error('❌ Registration failed:', err.message);
    process.exit(1);
  }

  // 3. Login
  try {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    console.log('🔑 Login User:', data.success !== false ? 'SUCCESS' : 'FAILED', data.user ? `(ID: ${data.user.id})` : '');
    token = data.token;
    user = data.user;
  } catch (err) {
    console.error('❌ Login failed:', err.message);
    process.exit(1);
  }

  if (!token) {
    console.error('❌ No token retrieved, aborting remaining tests.');
    process.exit(1);
  }

  // 4. Onboarding
  try {
    const res = await fetch(`${API}/auth/onboarding`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        selectedCountries: 'España, Inglaterra',
        selectedClub: 'Real Madrid',
        preferredFormation: '4-3-3',
        preferredStyle: 'Tiki-Taka',
        selectedTier: 'Gratis'
      })
    });
    const data = await res.json();
    console.log('📋 Onboarding PATCH:', data.success ? 'SUCCESS' : 'FAILED', data.user ? `(Tier: ${data.user.selectedTier})` : '');
  } catch (err) {
    console.error('❌ Onboarding failed:', err.message);
  }

  // 5. Payment checkout
  try {
    const res = await fetch(`${API}/payments/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        tier: 'Plus',
        cardholderName: 'Lionel Messi',
        cardNumber: '4152 4812 3456 7890',
        amount: 19.99
      })
    });
    const data = await res.json();
    console.log('💳 Checkout POST:', data.success ? 'SUCCESS' : 'FAILED', data.transaction ? `(TxnId: ${data.transaction.transactionId})` : '');
  } catch (err) {
    console.error('❌ Payment Checkout failed:', err.message);
  }

  // 6. Get profile stats
  try {
    const res = await fetch(`${API}/profile/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    console.log('📊 Profile Stats:', data);
  } catch (err) {
    console.error('❌ Profile stats failed:', err.message);
  }

  // 7. Get players
  try {
    const res = await fetch(`${API}/players?limit=2`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    console.log('⚽ Players list (first 2):', data.players?.map(p => `${p.name} (${p.currentTeam})`));
  } catch (err) {
    console.error('❌ Player list failed:', err.message);
  }

  // 8. Test chat response
  try {
    const res = await fetch(`${API}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ message: 'Hola FutbolAI, ¿quién es Lamine Yamal?' })
    });
    const data = await res.json();
    console.log('🤖 Chat response:', data.reply ? 'SUCCESS' : 'FAILED', '\nSnippet:', data.reply?.substring(0, 150) + '...');
  } catch (err) {
    console.error('❌ Chat response failed:', err.message);
  }

  console.log('🏁 Verification flow finished.');
}

runTests();
