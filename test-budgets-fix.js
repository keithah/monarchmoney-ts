#!/usr/bin/env node

// Test fixed budgets API with Python schema
const { MonarchClient } = require('./dist/cjs/index.js')
require('dotenv/config')

async function testBudgetsFix() {
  console.log('💰 Testing FIXED Budgets API...')
  
  if (!process.env.MONARCH_EMAIL || !process.env.MONARCH_PASSWORD || !process.env.MONARCH_MFA_SECRET) {
    console.error('❌ Missing credentials in .env file')
    process.exit(1)
  }

  const client = new MonarchClient({
    baseURL: 'https://api.monarchmoney.com',
    timeout: 30000,
    retries: 1
  })

  try {
    console.log('🔑 Authenticating...')
    
    await client.directLogin({
      email: process.env.MONARCH_EMAIL,
      password: process.env.MONARCH_PASSWORD,
      mfaSecretKey: process.env.MONARCH_MFA_SECRET,
      saveSession: false
    })

    console.log('✅ Authentication successful!')
    
    // Test FIXED budget query from Python monarchmoney.py (Common_GetJointPlanningData)
    console.log('\n💰 Testing FIXED budget query (Common_GetJointPlanningData)...')
    try {
      // Get current date range (current month)
      const now = new Date()
      const startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
      const endDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()}`
      
      const result = await client.gqlCall('Common_GetJointPlanningData', `
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
              __typename
            }
            categoryGroups {
              id
              name
              order
              type
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
      `, { startDate, endDate })
      
      console.log('✅ Budget query successful!')
      console.log(`Budget System: ${result.budgetSystem || 'Not specified'}`)
      console.log(`Category Groups: ${result.categoryGroups?.length || 0}`)
      console.log(`Goals V2: ${result.goalsV2?.length || 0}`)
      
      if (result.budgetData) {
        const categories = result.budgetData.categories?.length || 0
        const monthlyAmounts = result.budgetData.monthlyAmounts?.length || 0
        console.log(`Budget Categories: ${categories}`)
        console.log(`Monthly Amounts: ${monthlyAmounts}`)
        
        if (result.budgetData.categories?.length > 0) {
          console.log('💰 First few budget categories:')
          result.budgetData.categories.slice(0, 3).forEach((category, index) => {
            const monthlyAmount = category.monthlyAmounts?.[0]
            console.log(`  ${index + 1}. ${category.name}`)
            console.log(`     - ID: ${category.id}`)
            console.log(`     - Group ID: ${category.groupId || 'None'}`)
            if (monthlyAmount) {
              console.log(`     - Planned: $${monthlyAmount.plannedCashFlowAmount || 0}`)
              console.log(`     - Actual: $${monthlyAmount.actualAmount || 0}`)
              console.log(`     - Remaining: $${monthlyAmount.remainingAmount || 0}`)
            }
          })
        }
      }
    } catch (error) {
      console.log('❌ Budget query failed:', error.message)
      console.log('Error details:', error)
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.error('Error code:', error.code)
    console.error('Error type:', error.constructor.name)
    process.exit(1)
  }
}

testBudgetsFix().then(() => {
  console.log('\n🏁 Fixed budget test completed!')
}).catch(error => {
  console.error('💥 Fixed budget test failed:', error)
  process.exit(1)
})