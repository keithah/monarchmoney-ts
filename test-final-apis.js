#!/usr/bin/env node

// Final comprehensive test of ALL API methods with corrected schemas
const { MonarchClient } = require('./dist/cjs/index.js')
require('dotenv/config')

async function testAllAPIs() {
  console.log('🎯 FINAL COMPREHENSIVE API TEST')
  console.log('Testing ALL APIs with corrected Python library schemas...')
  
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
    console.log('🔑 Using existing session...\n')

    // Test 1: User Profile API
    console.log('👤 Testing User Profile API...')
    try {
      const user = await client.get_me()
      console.log(`✅ User Profile: ${user.name || user.email}`)
      results.passed.push('User Profile API')
    } catch (error) {
      console.log(`❌ User Profile failed: ${error.message}`)
      results.failed.push('User Profile API')
    }

    // Test 2: Accounts API
    console.log('\n💰 Testing Accounts API...')
    try {
      const accounts = await client.accounts.getAll()
      console.log(`✅ Accounts API: ${accounts.length} accounts`)
      results.passed.push(`Accounts API (${accounts.length} accounts)`)
    } catch (error) {
      console.log(`❌ Accounts API failed: ${error.message}`)
      results.failed.push('Accounts API')
    }

    // Test 3: Transactions API
    console.log('\n📈 Testing Transactions API...')
    try {
      const transactions = await client.transactions.getTransactions({
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        limit: 10
      })
      console.log(`✅ Transactions API: ${transactions.transactions.length} transactions`)
      results.passed.push(`Transactions API (${transactions.transactions.length} transactions)`)
    } catch (error) {
      console.log(`❌ Transactions API failed: ${error.message}`)
      results.failed.push('Transactions API')
    }

    // Test 4: Categories API  
    console.log('\n🏷️ Testing Categories API...')
    try {
      const categories = await client.categories.getCategories()
      console.log(`✅ Categories API: ${categories.length} categories`)
      results.passed.push(`Categories API (${categories.length} categories)`)
    } catch (error) {
      console.log(`❌ Categories API failed: ${error.message}`)
      results.failed.push('Categories API')
    }

    // Test 5: FIXED Cashflow API
    console.log('\n📊 Testing FIXED Cashflow API...')
    try {
      const summary = await client.cashflow.getCashflowSummary({
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      })
      console.log(`✅ Cashflow API: Income $${summary.sumIncome}, Expenses $${summary.sumExpense}, Savings $${summary.savings}`)
      results.passed.push(`Cashflow API (Income: $${summary.sumIncome})`)
    } catch (error) {
      console.log(`❌ Cashflow API failed: ${error.message}`)
      results.failed.push('Cashflow API')
    }

    // Test 6: FIXED Institutions API
    console.log('\n🏛️ Testing FIXED Institutions API...')
    try {
      const institutions = await client.institutions.getInstitutions()
      console.log(`✅ Institutions API: ${institutions.length} institutions`)
      results.passed.push(`Institutions API (${institutions.length} institutions)`)
    } catch (error) {
      console.log(`❌ Institutions API failed: ${error.message}`)
      results.failed.push('Institutions API')
    }

    // Test 7: FIXED Institution Settings API
    console.log('\n🏛️ Testing FIXED Institution Settings API...')
    try {
      const settings = await client.institutions.getInstitutionSettings()
      const credCount = settings.credentials?.length || 0
      console.log(`✅ Institution Settings: ${credCount} credentials`)
      results.passed.push(`Institution Settings (${credCount} credentials)`)
    } catch (error) {
      console.log(`❌ Institution Settings failed: ${error.message}`)
      results.failed.push('Institution Settings')
    }

    // Test 8: NEW FIXED Budgets API
    console.log('\n💳 Testing FIXED Budgets API (Python schema)...')
    try {
      const budgets = await client.budgets.getBudgets({
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      })
      
      const categoryCount = budgets.budgetData.monthlyAmountsByCategory?.length || 0
      const groupCount = budgets.categoryGroups?.length || 0
      const goalsCount = budgets.goalsV2?.length || 0
      
      console.log(`✅ Budgets API: ${budgets.budgetSystem} system`)
      console.log(`   Categories: ${categoryCount}, Groups: ${groupCount}, Goals: ${goalsCount}`)
      results.passed.push(`Budgets API (${categoryCount} categories, ${groupCount} groups)`)
    } catch (error) {
      console.log(`❌ Budgets API failed: ${error.message}`)
      results.failed.push('Budgets API')
    }

    // Test 9: Recurring Transactions API
    console.log('\n🔄 Testing Recurring Transactions API...')
    try {
      const recurring = await client.recurring.getRecurringStreams()
      console.log(`✅ Recurring API: ${recurring.length} recurring streams`)
      results.passed.push(`Recurring API (${recurring.length} items)`)
    } catch (error) {
      console.log(`❌ Recurring API failed: ${error.message}`)
      results.failed.push('Recurring API')
    }

    // Final Results Summary
    console.log('\n' + '='.repeat(80))
    console.log('🎯 FINAL COMPREHENSIVE TEST RESULTS')
    console.log('='.repeat(80))
    
    if (results.passed.length > 0) {
      console.log(`✅ PASSED (${results.passed.length}):`)
      results.passed.forEach(test => console.log(`   ✓ ${test}`))
    }
    
    if (results.failed.length > 0) {
      console.log(`\n❌ FAILED (${results.failed.length}):`)
      results.failed.forEach(test => console.log(`   ✗ ${test}`))
    }

    const successRate = Math.round((results.passed.length / (results.passed.length + results.failed.length)) * 100)
    console.log(`\n🎯 SUCCESS RATE: ${successRate}% (${results.passed.length}/${results.passed.length + results.failed.length})`)

    if (successRate >= 90) {
      console.log('\n🎉 EXCEPTIONAL SUCCESS! 🚀')
      console.log('🔥 MonarchMoney TypeScript SDK is PRODUCTION READY!')
      console.log('🌟 All major APIs working with Python library schemas!')
    } else if (successRate >= 80) {
      console.log('\n✨ GREAT SUCCESS!')
      console.log('🔥 MonarchMoney TypeScript SDK is nearly production ready!')
    } else {
      console.log('\n⚠️ More work needed to reach production readiness')
    }

  } catch (error) {
    console.error('❌ Final test failed:', error.message)
    process.exit(1)
  }
}

testAllAPIs().then(() => {
  console.log('\n🏁 Final comprehensive API test completed!')
}).catch(error => {
  console.error('💥 Final test failed:', error)
  process.exit(1)
})