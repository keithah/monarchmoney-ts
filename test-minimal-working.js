#!/usr/bin/env node

// Test minimal working queries to find the actual issues
const { MonarchClient } = require('./dist/cjs/index.js')
require('dotenv/config')

async function testMinimalWorking() {
  console.log('🔬 Testing Minimal Working Queries...')
  
  const client = new MonarchClient({
    baseURL: 'https://api.monarchmoney.com',
    timeout: 30000,
    retries: 1
  })

  try {
    console.log('🔑 Using existing session...')

    // Test 1: Debug cashflow summary response structure
    console.log('\n📊 Debug: Cashflow Summary Response...')
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
      
      console.log('Raw response:', JSON.stringify(cashflow, null, 2))
      
      if (cashflow.summary && cashflow.summary.summary) {
        const summary = cashflow.summary.summary
        console.log(`✅ Cashflow Summary parsed: Income $${summary.sumIncome}`)
      } else {
        console.log('❌ Unexpected response structure')
      }
    } catch (error) {
      console.log(`❌ Cashflow Summary failed: ${error.message}`)
    }

    // Test 2: Try simpler institutions query
    console.log('\n🏛️ Debug: Simple Institutions Query...')
    try {
      // Try a super minimal institutions query first
      const simple = await client.gqlCall('TestInstitutions', `
        query TestInstitutions {
          __schema {
            types {
              name
            }
          }
        }
      `)
      console.log('Schema types available')
      
      // Now try the actual institutions query
      const institutions = await client.gqlCall('GetInstitutions', `
        query GetInstitutions {
          institutions {
            id
            name
            __typename
          }
        }
      `)
      
      console.log(`✅ Institutions: ${institutions.institutions?.length || 0}`)
    } catch (error) {
      console.log(`❌ Institutions failed: ${error.message}`)
      console.log('Maybe institutions query doesn\'t exist?')
    }

    // Test 3: Try minimal budget query
    console.log('\n💰 Debug: Minimal Budget Query...')
    try {
      const budgets = await client.gqlCall('GetBudgetMinimal', `
        query GetBudgetMinimal {
          budgetSystem
        }
      `)
      
      console.log(`✅ Minimal Budget: ${budgets.budgetSystem}`)
    } catch (error) {
      console.log(`❌ Minimal Budget failed: ${error.message}`)
      
      // Try different budget query
      try {
        const budgets2 = await client.gqlCall('GetCategoryGroups', `
          query GetCategoryGroups {
            categoryGroups {
              id
              name
              type
              __typename
            }
          }
        `)
        
        console.log(`✅ Category Groups: ${budgets2.categoryGroups?.length || 0}`)
      } catch (error2) {
        console.log(`❌ Category Groups also failed: ${error2.message}`)
      }
    }

    console.log('\n🔍 DIAGNOSIS:')
    console.log('1. Some queries work, others return 400 Bad Request')
    console.log('2. This suggests schema/parameter mismatches')
    console.log('3. May need to use exact Python variable structures')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    process.exit(1)
  }
}

testMinimalWorking().then(() => {
  console.log('\n🏁 Minimal working test completed!')
}).catch(error => {
  console.error('💥 Minimal working test failed:', error)
  process.exit(1)
})