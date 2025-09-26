#!/usr/bin/env node

// Test fixed transactions API with Python schema
const { MonarchClient } = require('./dist/cjs/index.js')
require('dotenv/config')

async function testTransactionsFix() {
  console.log('💳 Testing FIXED Transactions API...')
  
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
    
    // Test FIXED transactions query from Python transaction_service.py (first working version)
    console.log('\n💳 Testing FIXED transactions query (simple version)...')
    try {
      const result = await client.gqlCall('GetTransactionsList', `
        query GetTransactionsList(
          $limit: Int!,
          $offset: Int!,
          $startDate: String,
          $endDate: String,
          $categoryIds: [String],
          $accountIds: [String],
          $tagIds: [String],
          $merchantIds: [String],
          $search: String,
          $isCredit: Boolean,
          $minAmount: Float,
          $maxAmount: Float
        ) {
          allTransactions(
            first: $limit,
            offset: $offset,
            startDate: $startDate,
            endDate: $endDate,
            categoryIds: $categoryIds,
            accountIds: $accountIds,
            tagIds: $tagIds,
            merchantIds: $merchantIds,
            search: $search,
            isCredit: $isCredit,
            minAmount: $minAmount,
            maxAmount: $maxAmount
          ) {
            totalCount
            results {
              id
              amount
              date
              hideFromReports
              plaidName
              notes
              isRecurring
              reviewStatus
              needsReview
              pending
              dataProviderDescription
              isSplitTransaction
              createdAt
              updatedAt
              category {
                id
                name
                __typename
              }
              merchant {
                id
                name
                transactionsCount
                __typename
              }
              account {
                id
                displayName
                __typename
              }
              __typename
            }
            __typename
          }
          accounts {
            id
            displayName
            __typename
          }
        }
      `, { limit: 10, offset: 0 })
      
      console.log('✅ Transactions query successful!')
      const totalCount = result.allTransactions?.totalCount || 0
      const resultCount = result.allTransactions?.results?.length || 0
      console.log(`Found ${totalCount} total transactions (showing ${resultCount})`)
      
      if (resultCount > 0) {
        console.log('💳 First few transactions:')
        result.allTransactions.results.slice(0, 3).forEach((tx, index) => {
          console.log(`  ${index + 1}. ${tx.merchant?.name || tx.plaidName || 'Unknown'} - $${tx.amount} on ${tx.date}`)
          console.log(`     - ID: ${tx.id}`)
          console.log(`     - Account: ${tx.account?.displayName || 'Unknown'}`)
          console.log(`     - Category: ${tx.category?.name || 'None'}`)
          console.log(`     - Notes: ${tx.notes || 'None'}`)
        })
      }
    } catch (error) {
      console.log('❌ Transactions query failed:', error.message)
      console.log('Error details:', error)
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.error('Error code:', error.code)
    console.error('Error type:', error.constructor.name)
    process.exit(1)
  }
}

testTransactionsFix().then(() => {
  console.log('\n🏁 Fixed transactions test completed!')
}).catch(error => {
  console.error('💥 Fixed transactions test failed:', error)
  process.exit(1)
})