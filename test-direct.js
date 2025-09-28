require('dotenv').config();
const { MonarchClient } = require('./dist/cjs/index.js');

async function testDirect() {
  console.log('Testing MonarchMoney TypeScript library directly...');
  console.log('Using credentials:', {
    email: process.env.MONARCH_EMAIL ? 'Set' : 'Not set',
    password: process.env.MONARCH_PASSWORD ? 'Set' : 'Not set',
    mfa: process.env.MONARCH_MFA_SECRET ? 'Set' : 'Not set'
  });

  const client = new MonarchClient({
    baseURL: 'https://api.monarchmoney.com',
    timeout: 30000,
    saveSession: false
  });

  try {
    console.log('\n1. Testing login...');
    await client.login({
      email: process.env.MONARCH_EMAIL,
      password: process.env.MONARCH_PASSWORD,
      mfaSecretKey: process.env.MONARCH_MFA_SECRET,
      saveSession: false
    });
    console.log('✅ Login successful!');

    console.log('\n2. Testing getAccounts...');
    const accounts = await client.accounts.getAll();
    console.log(`✅ Retrieved ${accounts.length} accounts`);
    
    if (accounts.length > 0) {
      console.log('\nFirst account info:');
      const acc = accounts[0];
      console.log('- Name:', acc.displayName || acc.name);
      console.log('- Type:', acc.type?.display);
      console.log('- Balance:', acc.currentBalance);
    }

    console.log('\n3. Testing getTransactions...');
    const result = await client.transactions.getTransactions({ limit: 5 });
    console.log(`✅ Retrieved ${result.transactions?.length || 0} transactions`);

    console.log('\n✅ All tests passed! Library is working correctly.');
    
  } catch (error) {
    console.error('\n❌ Error occurred:');
    console.error('Type:', error.constructor.name);
    console.error('Message:', error.message);
    console.error('Code:', error.code);
    
    if (error.errors) {
      console.error('GraphQL errors:', JSON.stringify(error.errors, null, 2));
    }
    
    if (error.response) {
      console.error('Response status:', error.response?.status);
      console.error('Response data:', error.response?.data);
    }
  }
}

testDirect();
