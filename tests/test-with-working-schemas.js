#!/usr/bin/env node

// Test new APIs with properly working schemas + session reuse
const { MonarchClient } = require('./dist/cjs/index.js')
require('dotenv/config')

async function testWorkingSchemas() {
  console.log('🔧 Testing with Working Schemas + Session Reuse...')
  
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
    console.log('🔑 Using existing session (no re-auth)...')
    
    // Test 1: Categories with direct GraphQL (known working pattern)
    console.log('\n🏷️ Testing Categories with direct working query...')
    try {
      const categories = await client.gqlCall('GetCategories', `
        query GetCategories {
          categories {
            id
            name
            order
            icon
            isSystemCategory
            isDisabled
            group {
              id
              name
              type
              __typename
            }
            __typename
          }
        }
      `)
      console.log(`✅ Categories (direct): ${categories.categories?.length || 0} categories`)
      results.passed.push(`Categories API (${categories.categories?.length || 0})`)
    } catch (error) {
      console.log(`❌ Categories failed: ${error.message}`)
      results.failed.push('Categories API')
    }

    // Test 2: Institutions with simplified query
    console.log('\n🏛️ Testing Institutions with simple query...')
    try {
      const institutions = await client.gqlCall('GetInstitutions', `
        query GetInstitutions {
          institutions {
            id
            name
            url
            logoUrl
            primaryColor
            __typename
          }
        }
      `)
      console.log(`✅ Institutions (simple): ${institutions.institutions?.length || 0} institutions`)
      results.passed.push(`Institutions API (${institutions.institutions?.length || 0})`)
    } catch (error) {
      console.log(`❌ Institutions failed: ${error.message}`)
      results.failed.push('Institutions API')
    }

    // Test 3: Cashflow (new API)
    console.log('\n📊 Testing Cashflow API...')
    try {
      const cashflow = await client.gqlCall('Web_GetCashFlowPage', `
        query Web_GetCashFlowPage($filters: TransactionFilterInput) {
          summary: aggregates(filters: $filters, fillEmptyValues: true) {
            summary {
              sumIncome
              sumExpense
              savings
              savingsRate
              __typename
            }
            __typename
          }
        }
      `, {
        filters: {
          search: "",
          categories: [],
          accounts: [],
          tags: [],
          startDate: "2024-01-01",
          endDate: "2024-01-31"
        }
      })
      
      const summary = cashflow.summary.summary
      console.log(`✅ Cashflow: Income $${summary.sumIncome}, Expenses $${summary.sumExpense}`)
      results.passed.push(`Cashflow API (Income: $${summary.sumIncome})`)
    } catch (error) {
      console.log(`❌ Cashflow failed: ${error.message}`)
      results.failed.push('Cashflow API')
    }

    // Test 4: Budgets (working pattern)
    console.log('\n💰 Testing Budgets API...')
    try {
      const budgets = await client.gqlCall('Common_GetJointPlanningData', `
        query Common_GetJointPlanningData($startDate: Date!, $endDate: Date!) {
          budgetSystem
          categoryGroups {
            id
            name
            type
            order
            __typename
          }
          goalsV2 {
            id
            name
            targetAmount
            targetDate
            completed
            archived
            __typename
          }
        }
      `, {
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      })
      
      const groupCount = budgets.categoryGroups?.length || 0
      const goalCount = budgets.goalsV2?.length || 0
      console.log(`✅ Budgets: ${groupCount} groups, ${goalCount} goals, system: ${budgets.budgetSystem}`)
      results.passed.push(`Budgets API (${groupCount} groups, ${goalCount} goals)`)
    } catch (error) {
      console.log(`❌ Budgets failed: ${error.message}`)
      results.failed.push('Budgets API')
    }

    // Summary
    console.log('\n📊 WORKING SCHEMAS TEST RESULTS:')
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

    if (results.passed.length >= 3) {
      console.log('\n🎉 SUCCESS: Multiple new APIs working with session reuse!')
      console.log('💡 Key lessons:')
      console.log('   1. Session reuse prevents CAPTCHA (like Python library)')
      console.log('   2. Working GraphQL schemas are critical')
      console.log('   3. Direct gqlCall works better than wrapper APIs for new endpoints')
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    process.exit(1)
  }
}

testWorkingSchemas().then(() => {
  console.log('\n🏁 Working schemas test completed!')
}).catch(error => {
  console.error('💥 Working schemas test failed:', error)
  process.exit(1)
})