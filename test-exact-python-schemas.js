#!/usr/bin/env node

// Test with EXACT schemas from Python library
const { MonarchClient } = require('./dist/cjs/index.js')
require('dotenv/config')

async function testExactPythonSchemas() {
  console.log('🐍 Testing with EXACT Python Library Schemas...')
  
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
    console.log('🔑 Using existing session (Python-style)...')

    // Test 1: Cashflow Summary - EXACT Python schema
    console.log('\n📊 Testing Cashflow Summary (exact Python schema)...')
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
      console.log(`✅ Cashflow Summary: Income $${summary.sumIncome}, Expenses $${summary.sumExpense}, Savings $${summary.savings}`)
      results.passed.push(`Cashflow Summary (Income: $${summary.sumIncome}, Savings: $${summary.savings})`)
    } catch (error) {
      console.log(`❌ Cashflow Summary failed: ${error.message}`)
      results.failed.push(`Cashflow Summary: ${error.message}`)
    }

    // Test 2: Cashflow by Category - EXACT Python schema  
    console.log('\n📊 Testing Cashflow by Category (exact Python schema)...')
    try {
      const cashflow = await client.gqlCall('Web_GetCashFlowPage', `
        query Web_GetCashFlowPage($filters: TransactionFilterInput) {
          byCategory: aggregates(filters: $filters, groupBy: ["category"]) {
            groupBy {
              category {
                id
                name
                group {
                  id
                  type
                  __typename
                }
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
          search: "",
          categories: [],
          accounts: [],
          tags: [],
          startDate: "2024-01-01",
          endDate: "2024-01-31"
        }
      })
      
      const categoryCount = cashflow.byCategory?.length || 0
      console.log(`✅ Cashflow by Category: ${categoryCount} categories`)
      if (categoryCount > 0) {
        const topCategory = cashflow.byCategory[0]
        console.log(`   Top category: ${topCategory.groupBy.category.name} - $${topCategory.summary.sum}`)
      }
      results.passed.push(`Cashflow by Category (${categoryCount} categories)`)
    } catch (error) {
      console.log(`❌ Cashflow by Category failed: ${error.message}`)
      results.failed.push(`Cashflow by Category: ${error.message}`)
    }

    // Test 3: Institutions - Simple schema from settings_service.py
    console.log('\n🏛️ Testing Institutions (settings_service.py schema)...')
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
      
      const count = institutions.institutions?.length || 0
      console.log(`✅ Institutions: ${count} institutions`)
      if (count > 0) {
        console.log(`   First: ${institutions.institutions[0].name}`)
      }
      results.passed.push(`Institutions (${count} institutions)`)
    } catch (error) {
      console.log(`❌ Institutions failed: ${error.message}`)
      results.failed.push(`Institutions: ${error.message}`)
    }

    // Test 4: Budgets - EXACT Python Common_GetJointPlanningData
    console.log('\n💰 Testing Budgets (exact Python Common_GetJointPlanningData)...')
    try {
      const budgets = await client.gqlCall('Common_GetJointPlanningData', `
        query Common_GetJointPlanningData($startDate: Date!, $endDate: Date!) {
          budgetSystem
          budgetData(startMonth: $startDate, endMonth: $endDate) {
            monthlyAmounts {
              month
              plannedCashFlowAmount
              plannedSetAsideAmount
              actualAmount
              remainingAmount
              previousMonthRolloverAmount
              rolloverType
              cumulativeActualAmount
              rolloverTargetAmount
              __typename
            }
            totals {
              month
              budgetedAmount
              actualAmount
              remainingAmount
              __typename
            }
            categories {
              id
              name
              groupId
              order
              __typename
            }
            categoryGroups {
              id
              name
              order
              type
              __typename
            }
            goals {
              id
              name
              amount
              __typename
            }
            rolloverPeriod {
              startMonth
              endMonth
              __typename
            }
            __typename
          }
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
            createdAt
            updatedAt
            __typename
          }
        }
      `, {
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      })
      
      const categoryCount = budgets.budgetData?.categories?.length || 0
      const groupCount = budgets.categoryGroups?.length || 0
      const goalCount = budgets.goalsV2?.length || 0
      
      console.log(`✅ Budgets: ${categoryCount} categories, ${groupCount} groups, ${goalCount} goals`)
      console.log(`   Budget system: ${budgets.budgetSystem}`)
      results.passed.push(`Budgets (${categoryCount} categories, ${groupCount} groups, ${goalCount} goals)`)
    } catch (error) {
      console.log(`❌ Budgets failed: ${error.message}`)
      results.failed.push(`Budgets: ${error.message}`)
    }

    // Summary
    console.log('\n📊 EXACT PYTHON SCHEMAS TEST RESULTS:')
    console.log('=' .repeat(70))
    
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
      console.log('\n🎉 SUCCESS: Python schemas working!')
      console.log('🔥 Ready to update TypeScript API implementations')
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    process.exit(1)
  }
}

testExactPythonSchemas().then(() => {
  console.log('\n🏁 Python schemas test completed!')
}).catch(error => {
  console.error('💥 Python schemas test failed:', error)
  process.exit(1)
})