#!/usr/bin/env node

require('dotenv').config();
const { MonarchClient } = require('./dist/cjs/index.js');

async function debugIndividualQueries() {
  console.log('🔍 Debugging individual query formats...');

  const client = new MonarchClient();

  try {
    // Login
    await client.login({
      email: process.env.MONARCH_EMAIL,
      password: process.env.MONARCH_PASSWORD,
      mfaSecretKey: process.env.MONARCH_MFA_SECRET,
      useSavedSession: true
    });

    // Get a test account ID
    const accounts = await client.accounts.getAll({ verbosity: 'ultra-light' });
    const testAccountId = accounts[0].id;
    console.log(`Using test account: ${accounts[0].displayName} (${testAccountId})\n`);

    // Test 1: Try the updated UUID parameterized format
    console.log('🧪 Test 1: Updated UUID parameterized format');
    try {
      const result = await client.accounts.getById(testAccountId);
      console.log('✅ accounts.getById() works!', {
        id: result.id,
        displayName: result.displayName,
        currentBalance: result.currentBalance
      });
    } catch (error) {
      console.log('❌ accounts.getById() failed:', error.message);
    }

    // Test 2: Try without parameters (inline)
    console.log('\n🧪 Test 2: Inline ID format');
    try {
      const result = await client.gqlCall(
        'GetAccountDetails',
        `query GetAccountDetails {
          account(id: "${testAccountId}") {
            id
            displayName
            currentBalance
          }
        }`
      );
      console.log('✅ Inline query works!', result);
    } catch (error) {
      console.log('❌ Inline query failed:', error.message);
    }

    // Test 3: Try a simpler query structure
    console.log('\n🧪 Test 3: Simplified structure');
    try {
      const result = await client.gqlCall(
        'GetAccount',
        `{
          account(id: "${testAccountId}") {
            id
            displayName
            currentBalance
          }
        }`
      );
      console.log('✅ Simplified query works!', result);
    } catch (error) {
      console.log('❌ Simplified query failed:', error.message);
    }

    // Test 4: Try filtering from accounts list (workaround)
    console.log('\n🧪 Test 4: Filter from accounts list');
    try {
      const result = await client.gqlCall(
        'GetAccountFiltered',
        `query GetAccountFiltered {
          accounts {
            id
            displayName
            currentBalance
            syncDisabled
            isHidden
            mask
          }
        }`
      );
      const filtered = result.accounts.find(acc => acc.id === testAccountId);
      console.log('✅ Filter approach works!', filtered);
    } catch (error) {
      console.log('❌ Filter approach failed:', error.message);
    }

    // Test 5: Test NetWorth history with new implementation
    console.log('\n🧪 Test 5: accounts.getNetWorthHistory()');
    try {
      const result = await client.accounts.getNetWorthHistory();
      console.log('✅ accounts.getNetWorthHistory() works!', `${result?.length || 0} records`);
      if (result && result.length > 0) {
        console.log('Sample record:', {
          date: result[0].date,
          netWorth: result[0].netWorth,
          assets: result[0].assets,
          liabilities: result[0].liabilities
        });
      }
    } catch (error) {
      console.log('❌ accounts.getNetWorthHistory() failed:', error.message);
    }

    // Test 6: Test account history
    console.log('\n🧪 Test 6: accounts.getHistory()');
    try {
      const result = await client.accounts.getHistory(testAccountId);
      console.log('✅ accounts.getHistory() works!', `${result?.length || 0} records`);
      if (result && result.length > 0) {
        console.log('Sample record:', result[0]);
      }
    } catch (error) {
      console.log('❌ accounts.getHistory() failed:', error.message);
    }

  } catch (error) {
    console.error('Setup failed:', error.message);
  }
}

debugIndividualQueries();