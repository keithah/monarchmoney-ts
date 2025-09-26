#!/usr/bin/env node

// Test ALL APIs including the new ones we implemented
const { MonarchClient } = require('./dist/cjs/index.js')
require('dotenv/config')

async function testAllNewAPIs() {
  console.log('🧪 Testing ALL MonarchMoney APIs (including new implementations)...')
  
  if (!process.env.MONARCH_EMAIL || !process.env.MONARCH_PASSWORD || !process.env.MONARCH_MFA_SECRET) {
    console.error('❌ Missing credentials in .env file')
    process.exit(1)
  }

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
    console.log('🔑 Authenticating...')
    
    await client.directLogin({
      email: process.env.MONARCH_EMAIL,
      password: process.env.MONARCH_PASSWORD,
      mfaSecretKey: process.env.MONARCH_MFA_SECRET,
      saveSession: false
    })

    console.log('✅ Authentication successful!')
    
    // Test 1: Accounts API (previously working)
    console.log('\n🏦 Testing Accounts API...')
    try {
      const accounts = await client.accounts.getAll()
      console.log(`✅ Accounts API: Found ${accounts.length} accounts`)
      results.passed.push(`Accounts API (${accounts.length} accounts)`)
    } catch (error) {
      console.log(`❌ Accounts API failed: ${error.message}`)
      results.failed.push(`Accounts API: ${error.message}`)
    }

    // Test 2: Transactions API (previously working)
    console.log('\n💳 Testing Transactions API...')
    try {
      const transactions = await client.transactions.getAll({ limit: 5 })
      console.log(`✅ Transactions API: Found ${transactions.totalCount} total transactions (showing ${transactions.results.length})`)
      results.passed.push(`Transactions API (${transactions.totalCount} total)`)
    } catch (error) {
      console.log(`❌ Transactions API failed: ${error.message}`)
      results.failed.push(`Transactions API: ${error.message}`)
    }

    // Test 3: Categories API (previously working)
    console.log('\n🏷️ Testing Categories API...')
    try {
      const categories = await client.categories.getCategories()
      console.log(`✅ Categories API: Found ${categories.length} categories`)
      results.passed.push(`Categories API (${categories.length} categories)`)
    } catch (error) {
      console.log(`❌ Categories API failed: ${error.message}`)
      results.failed.push(`Categories API: ${error.message}`)
    }

    // Test 4: User Profile API (previously working)
    console.log('\n👤 Testing User Profile API...')
    try {
      const user = await client.get_me()
      console.log(`✅ User Profile API: ${user.name || user.email}`)
      results.passed.push(`User Profile API (${user.name || user.email})`)
    } catch (error) {
      console.log(`❌ User Profile API failed: ${error.message}`)
      results.failed.push(`User Profile API: ${error.message}`)
    }

    // Test 5: NEW - Cashflow API
    console.log('\n📊 Testing NEW Cashflow API...')
    try {
      const cashflowSummary = await client.cashflow.getCashflowSummary()
      console.log(`✅ Cashflow API: Income $${cashflowSummary.sumIncome}, Expenses $${cashflowSummary.sumExpense}`)
      results.passed.push(`Cashflow API (Income: $${cashflowSummary.sumIncome})`)
    } catch (error) {
      console.log(`❌ Cashflow API failed: ${error.message}`)
      results.failed.push(`Cashflow API: ${error.message}`)
    }

    // Test 6: NEW - Recurring Transactions API
    console.log('\n🔄 Testing NEW Recurring Transactions API...')
    try {
      const recurringStreams = await client.recurring.getRecurringStreams()
      console.log(`✅ Recurring API: Found ${recurringStreams.length} recurring streams`)
      results.passed.push(`Recurring API (${recurringStreams.length} streams)`)
    } catch (error) {
      console.log(`❌ Recurring API failed: ${error.message}`)
      results.failed.push(`Recurring API: ${error.message}`)
    }

    // Test 7: NEW - Institutions API
    console.log('\n🏛️ Testing NEW Institutions API...')
    try {
      const institutions = await client.institutions.getInstitutions()
      console.log(`✅ Institutions API: Found ${institutions.length} institutions`)
      results.passed.push(`Institutions API (${institutions.length} institutions)`)
    } catch (error) {
      console.log(`❌ Institutions API failed: ${error.message}`)
      results.failed.push(`Institutions API: ${error.message}`)
    }

    // Test 8: NEW - Insights API
    console.log('\n💡 Testing NEW Insights API...')
    try {
      const insights = await client.insights.getInsights()
      console.log(`✅ Insights API: Found ${insights.length} insights`)
      results.passed.push(`Insights API (${insights.length} insights)`)
    } catch (error) {
      console.log(`❌ Insights API failed: ${error.message}`)
      results.failed.push(`Insights API: ${error.message}`)
    }

    // Test 9: NEW - Budgets API (full test)
    console.log('\n💰 Testing NEW Budgets API...')
    try {
      const budgetData = await client.gqlCall('Common_GetJointPlanningData', `
        query Common_GetJointPlanningData($startDate: Date!, $endDate: Date!) {
          budgetSystem
          budgetData(startMonth: $startDate, endMonth: $endDate) {
            categories {
              id
              name
              __typename
            }
            __typename
          }
          categoryGroups {
            id
            name
            type
            __typename
          }
          __typename
        }
      `, {
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      })
      
      const categoryCount = budgetData.budgetData?.categories?.length || 0
      const groupCount = budgetData.categoryGroups?.length || 0
      console.log(`✅ Budgets API: Found ${categoryCount} budget categories, ${groupCount} groups`)
      results.passed.push(`Budgets API (${categoryCount} categories, ${groupCount} groups)`)
    } catch (error) {
      console.log(`❌ Budgets API failed: ${error.message}`)
      results.failed.push(`Budgets API: ${error.message}`)
    }

    // Summary
    console.log('\n📊 COMPREHENSIVE TEST RESULTS:')
    console.log('='.repeat(60))
    
    console.log(`✅ PASSED (${results.passed.length})`)
    results.passed.forEach(test => console.log(`   ✓ ${test}`))
    
    if (results.failed.length > 0) {
      console.log(`\n❌ FAILED (${results.failed.length})`)
      results.failed.forEach(test => console.log(`   ✗ ${test}`))
    }

    const successRate = Math.round((results.passed.length / (results.passed.length + results.failed.length)) * 100)
    console.log(`\n🎯 Overall Success Rate: ${successRate}% (${results.passed.length}/${results.passed.length + results.failed.length})`)

    // Special note about new APIs
    const newAPIs = results.passed.filter(test => 
      test.includes('Cashflow') || 
      test.includes('Recurring') || 
      test.includes('Institutions') || 
      test.includes('Insights') || 
      test.includes('Budgets')
    )
    
    if (newAPIs.length > 0) {
      console.log(`\n🚀 NEW APIs Successfully Implemented: ${newAPIs.length}`)
      newAPIs.forEach(api => console.log(`   🆕 ${api}`))
    }

  } catch (error) {
    console.error('❌ Test suite failed:', error.message)
    console.error('Error code:', error.code)
    console.error('Error type:', error.constructor.name)
    process.exit(1)
  }
}

testAllNewAPIs().then(() => {
  console.log('\n🏁 Comprehensive API test completed!')
}).catch(error => {
  console.error('💥 API test suite failed:', error)
  process.exit(1)
})