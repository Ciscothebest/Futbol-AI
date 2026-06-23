const API_URL = 'http://localhost:3001/api/auth/register';

const testRegistration = async (label, payload, expectedStatus, expectedErrorContain) => {
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    const data = await res.json();
    const isStatusOk = res.status === expectedStatus;
    
    let isErrorOk = true;
    if (expectedErrorContain && data.error) {
      isErrorOk = data.error.toLowerCase().includes(expectedErrorContain.toLowerCase());
    } else if (expectedErrorContain) {
      isErrorOk = false;
    }
    
    const passed = isStatusOk && isErrorOk;
    console.log(`[${passed ? 'PASS' : 'FAIL'}] ${label}`);
    console.log(`      Sent: telefono="${payload.telefono}"`);
    console.log(`      Response Status: ${res.status} (Expected: ${expectedStatus})`);
    console.log(`      Response Data:`, JSON.stringify(data));
    if (!passed) {
      console.log(`      Error verification failed. Expected error to contain: "${expectedErrorContain}"`);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`[FAIL] ${label} - Exception:`, err.message);
    return false;
  }
};

const run = async () => {
  console.log('--- STARTING LIVE API INTEGRATION TESTS ---');
  
  // Make sure we use a unique username for each successful test
  const suffix = Math.floor(Math.random() * 1000000);
  
  let allPassed = true;

  // Test 1: Valid registration with correct Spanish phone spacing
  const t1 = await testRegistration(
    'Test 1: Valid Spanish Phone (perfect format)',
    {
      username: `test_es_${suffix}`,
      password: 'password123',
      nombres: 'Juan',
      apellidos: 'Pérez',
      telefono: '+34 600 000 000',
      email: `juan.perez.${suffix}@example.com`
    },
    201,
    null
  );
  if (!t1) allPassed = false;

  // Test 2: Invalid registration with incorrect Spanish phone spacing
  const t2 = await testRegistration(
    'Test 2: Invalid Spanish Phone Spacing (rejected)',
    {
      username: `test_es_fail_${suffix}`,
      password: 'password123',
      nombres: 'Juan',
      apellidos: 'Pérez',
      telefono: '+34 600000000',
      email: `juan.perez.fail.${suffix}@example.com`
    },
    400,
    'Estructura incorrecta'
  );
  if (!t2) allPassed = false;

  // Test 3: Valid registration with correct Chilean phone spacing
  const t3 = await testRegistration(
    'Test 3: Valid Chilean Phone (perfect format)',
    {
      username: `test_cl_${suffix}`,
      password: 'password123',
      nombres: 'Andrés',
      apellidos: 'Bello',
      telefono: '+56 9 1234 1234',
      email: `andres.bello.${suffix}@example.com`
    },
    201,
    null
  );
  if (!t3) allPassed = false;

  // Test 4: Invalid registration with incorrect Chilean phone spacing
  const t4 = await testRegistration(
    'Test 4: Invalid Chilean Phone Spacing (rejected)',
    {
      username: `test_cl_fail_${suffix}`,
      password: 'password123',
      nombres: 'Andrés',
      apellidos: 'Bello',
      telefono: '+56 912341234',
      email: `andres.bello.fail.${suffix}@example.com`
    },
    400,
    'Estructura incorrecta'
  );
  if (!t4) allPassed = false;

  // Test 5: Valid registration with correct Argentine phone spacing (11 digits)
  const t5 = await testRegistration(
    'Test 5: Valid Argentine Phone 11 digits (perfect format)',
    {
      username: `test_ar_${suffix}`,
      password: 'password123',
      nombres: 'Diego',
      apellidos: 'Maradona',
      telefono: '+54 9 11 1234 5678',
      email: `diego.${suffix}@example.com`
    },
    201,
    null
  );
  if (!t5) allPassed = false;

  // Test 6: Invalid registration with incorrect Argentine phone spacing (11 digits)
  const t6 = await testRegistration(
    'Test 6: Invalid Argentine Phone Spacing (rejected)',
    {
      username: `test_ar_fail_${suffix}`,
      password: 'password123',
      nombres: 'Diego',
      apellidos: 'Maradona',
      telefono: '+54 91112345678',
      email: `diego.fail.${suffix}@example.com`
    },
    400,
    'Estructura incorrecta'
  );
  if (!t6) allPassed = false;

  console.log('\n--- LIVE API INTEGRATION TESTS SUMMARY ---');
  if (allPassed) {
    console.log('🎉 ALL LIVE API TESTS PASSED SUCCESSFULLY!');
  } else {
    console.error('❌ SOME LIVE API TESTS FAILED.');
    process.exit(1);
  }
};

run();
