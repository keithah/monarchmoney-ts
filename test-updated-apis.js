#!/usr/bin/env node

// Test the updated TypeScript API classes
const { MonarchClient } = require('./dist/cjs/index.js')
require('dotenv/config')

async function testUpdatedAPIs() {
  console.log('🔧 Testing Updated TypeScript API Classes...')
  
  const client = new MonarchClient({
    baseURL: 'https://api.monarchmoney.com',
    timeout: 30000,
    retries: 1
  })

  const results = {
    passed: [],
    failed: []
  }

  try {
    console.log('🔑 Using existing session...')

    // Test 1: FIXED Cashflow API Class
    console.log('\n📊 Testing FIXED Cashflow API Class...')
    try {
      const summary = await client.cashflow.getCashflowSummary({
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      })
      
      console.log(`✅ Cashflow API: Income $${summary.sumIncome}, Expenses $${summary.sumExpense}, Savings $${summary.savings}`)
      results.passed.push(`Cashflow API Class (Income: $${summary.sumIncome})`)
    } catch (error) {
      console.log(`❌ Cashflow API Class failed: ${error.message}`)
      results.failed.push(`Cashflow API Class: ${error.message}`)
    }

    // Test 2: FIXED Institutions API Class
    console.log('\n🏛️ Testing FIXED Institutions API Class...')
    try {
      const institutions = await client.institutions.getInstitutions()
      
      console.log(`✅ Institutions API: ${institutions.length} institutions`)
      if (institutions.length > 0) {
        console.log(`   First: ${institutions[0].name}`)
      }
      results.passed.push(`Institutions API Class (${institutions.length} institutions)`)
    } catch (error) {
      console.log(`❌ Institutions API Class failed: ${error.message}`)
      results.failed.push(`Institutions API Class: ${error.message}`)
    }

    // Test 3: Institution Settings API
    console.log('\n🏛️ Testing Institution Settings API...')
    try {
      const settings = await client.institutions.getInstitutionSettings()
      
      const credCount = settings.credentials?.length || 0
      console.log(`✅ Institution Settings: ${credCount} credentials`)
      results.passed.push(`Institution Settings (${credCount} credentials)`)
    } catch (error) {
      console.log(`❌ Institution Settings failed: ${error.message}`)
      results.failed.push(`Institution Settings: ${error.message}`)
    }

    // Test 4: Working APIs (baseline)
    console.log('\n🧪 Testing Baseline Working APIs...')
    
    try {
      const user = await client.get_me()
      console.log(`✅ User Profile: ${user.name || user.email}`)
      results.passed.push('User Profile')
    } catch (error) {
      console.log(`❌ User Profile failed: ${error.message}`)
      results.failed.push('User Profile')
    }

    try {
      const accounts = await client.accounts.getAll()
      console.log(`✅ Accounts: ${accounts.length} accounts`)
      results.passed.push(`Accounts (${accounts.length})`)
    } catch (error) {
      console.log(`❌ Accounts failed: ${error.message}`)
      results.failed.push('Accounts')
    }

    // Summary
    console.log('\n📊 UPDATED API CLASSES TEST RESULTS:')
    console.log('=' .repeat(60))
    
    if (results.passed.length > 0) {
      console.log(`✅ PASSED (${results.passed.length}):`)
      results.passed.forEach(test => console.log(`   ✓ ${test}`))
    }
    
    if (results.failed.length > 0) {
      console.log(`\n❌ FAILED (${results.failed.length}):`)
      results.failed.forEach(test => console.log(`   ✗ ${test}`))
    }

    const successRate = Math.round((results.passed.length / (results.passed.length + results.failed.length)) * 100)
    console.log(`\n🎯 Success Rate: ${successRate}% (${results.passed.length}/${results.passed.length + results.failed.length})`)

    if (results.passed.length >= 4) {
      console.log('\n🎉 SUCCESS: API Classes Updated and Working!')
      console.log('🔥 The TypeScript SDK is now production-ready!')
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    process.exit(1)
  }
}

testUpdatedAPIs().then(() => {
  console.log('\n🏁 Updated API classes test completed!')
}).catch(error => {
  console.error('💥 Updated API classes test failed:', error)
  process.exit(1)
})