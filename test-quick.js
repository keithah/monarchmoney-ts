#!/usr/bin/env node

require('dotenv').config();
const { MonarchClient } = require('./dist/cjs/index.js');

async function quickTest() {
  console.log('🔍 Quick test of individual query fixes...');

  const client = new MonarchClient();

  try {
    // Login with saved session
    await client.login({
      email: process.env.MONARCH_EMAIL,
      password: process.env.MONARCH_PASSWORD,
      mfaSecretKey: process.env.MONARCH_MFA_SECRET,
      useSavedSession: true
    });

    // Get a test account
    const accounts = await client.accounts.getAll({ verbosity: 'ultra-light' });
    const testAccountId = accounts[0].id;
    console.log(`Test account: ${accounts[0].displayName} (${testAccountId})`);

    // Test 1: accounts.getById()
    console.log('\n🧪 Testing accounts.getById()...');
    const account = await client.accounts.getById(testAccountId);
    console.log('✅ accounts.getById() works!', {
      id: account.id,
      displayName: account.displayName,
      currentBalance: account.currentBalance
    });

    // Test 2: accounts.getNetWorthHistory()
    console.log('\n🧪 Testing accounts.getNetWorthHistory()...');
    const netWorth = await client.accounts.getNetWorthHistory();
    console.log('✅ accounts.getNetWorthHistory() works!', `${netWorth?.length || 0} records`);

    // Test 3: accounts.getHistory()
    console.log('\n🧪 Testing accounts.getHistory()...');
    const history = await client.accounts.getHistory(testAccountId);
    console.log('✅ accounts.getHistory() works!', `${history?.length || 0} records`);

    console.log('\n🎉 All individual query fixes successful!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

quickTest();