#!/usr/bin/env node

// Test with FIXED schemas based on diagnosis
const { MonarchClient } = require('./dist/cjs/index.js')
require('dotenv/config')

async function testFixedFinal() {
  console.log('🔧 Testing with FIXED Schemas (final)...')
  
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

    // Test 1: FIXED Cashflow Summary - correct parsing
    console.log('\n📊 Testing FIXED Cashflow Summary...')
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
      
      // FIXED: Handle array response structure
      const summary = cashflow.summary[0].summary
      console.log(`✅ Cashflow Summary: Income $${summary.sumIncome}, Expenses $${summary.sumExpense}, Savings $${summary.savings}`)
      results.passed.push(`Cashflow Summary (Income: $${summary.sumIncome})`)
    } catch (error) {
      console.log(`❌ Cashflow Summary failed: ${error.message}`)
      results.failed.push(`Cashflow Summary: ${error.message}`)
    }

    // Test 2: FIXED Institutions - use Web_GetInstitutionSettings
    console.log('\n🏛️ Testing FIXED Institutions (Web_GetInstitutionSettings)...')
    try {
      const institutions = await client.gqlCall('Web_GetInstitutionSettings', `
        query Web_GetInstitutionSettings {
          credentials {
            id
            institution {
              id
              name
              url
              __typename
            }
            __typename
          }
        }
      `)
      
      const credentialCount = institutions.credentials?.length || 0
      console.log(`✅ Institution Settings: ${credentialCount} credentials`)
      if (credentialCount > 0) {
        const firstInstitution = institutions.credentials[0].institution
        console.log(`   First institution: ${firstInstitution.name}`)
      }
      results.passed.push(`Institution Settings (${credentialCount} credentials)`)
    } catch (error) {
      console.log(`❌ Institution Settings failed: ${error.message}`)
      results.failed.push(`Institution Settings: ${error.message}`)
    }

    // Test 3: FIXED Budgets - simplified Common_GetJointPlanningData
    console.log('\n💰 Testing FIXED Budgets (simplified)...')
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
            completed
            __typename
          }
        }
      `, {
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      })
      
      const groupCount = budgets.categoryGroups?.length || 0
      const goalCount = budgets.goalsV2?.length || 0
      
      console.log(`✅ Budgets: System=${budgets.budgetSystem}, ${groupCount} groups, ${goalCount} goals`)
      results.passed.push(`Budgets (${groupCount} groups, ${goalCount} goals)`)
    } catch (error) {
      console.log(`❌ Budgets failed: ${error.message}`)
      results.failed.push(`Budgets: ${error.message}`)
    }

    // Test 4: Cashflow by Category (already working)
    console.log('\n📊 Testing Cashflow by Category (working)...')
    try {
      const cashflow = await client.gqlCall('Web_GetCashFlowPage', `
        query Web_GetCashFlowPage($filters: TransactionFilterInput) {
          byCategory: aggregates(filters: $filters, groupBy: ["category"]) {
            groupBy {
              category {
                id
                name
                __typename
              }
              __typename
            }
            summary {
              sum
              __typename
            }
            __typename
          }
        }
      `, {
        filters: {
          startDate: "2024-01-01",
          endDate: "2024-01-31"
        }
      })
      
      const categoryCount = cashflow.byCategory?.length || 0
      console.log(`✅ Cashflow by Category: ${categoryCount} categories`)
      results.passed.push(`Cashflow by Category (${categoryCount})`)
    } catch (error) {
      console.log(`❌ Cashflow by Category failed: ${error.message}`)
      results.failed.push(`Cashflow by Category: ${error.message}`)
    }

    // Summary
    console.log('\n📊 FIXED FINAL TEST RESULTS:')
    console.log('=' .repeat(50))
    
    if (results.passed.length > 0) {
      console.log(`✅ PASSED (${results.passed.length}):`)
      results.passed.forEach(test => console.log(`   ✓ ${test}`))
    }
    
    if (results.failed.length > 0) {
      console.log(`\n❌ FAILED (${results.failed.length}):`)
      results.failed.forEach(test => console.log(`   ✗ ${test}`))
    }

    const successRate = Math.round((results.passed.length / (results.passed.length + results.failed.length)) * 100)
    console.log(`\n🎯 Final Success Rate: ${successRate}% (${results.passed.length}/${results.passed.length + results.failed.length})`)

    if (results.passed.length >= 3) {
      console.log('\n🎉 SUCCESS: All major schema issues FIXED!')
      console.log('🔥 Ready to update the TypeScript API classes')
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    process.exit(1)
  }
}

testFixedFinal().then(() => {
  console.log('\n🏁 Fixed final test completed!')
}).catch(error => {
  console.error('💥 Fixed final test failed:', error)
  process.exit(1)
})