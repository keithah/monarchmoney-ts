#!/usr/bin/env node

// Test fixed transactions API with Web_GetTransactionsList pattern
const { MonarchClient } = require('./dist/cjs/index.js')
require('dotenv/config')

async function testTransactionsFixV2() {
  console.log('💳 Testing FIXED Transactions API (v2 - Web pattern)...')
  
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
    
    // Test FIXED transactions query using Web_GetTransactionsList pattern with filters
    console.log('\n💳 Testing FIXED transactions query (Web_GetTransactionsList pattern)...')
    try {
      const result = await client.gqlCall('Web_GetTransactionsList', `
        query Web_GetTransactionsList(
          $offset: Int,
          $limit: Int,
          $filters: TransactionFilterInput,
          $orderBy: TransactionOrdering
        ) {
          allTransactions(filters: $filters) {
            totalCount
            totalSelectableCount
            results(offset: $offset, limit: $limit, orderBy: $orderBy) {
              id
              amount
              pending
              date
              hideFromReports
              hiddenByAccount
              plaidName
              notes
              isRecurring
              reviewStatus
              needsReview
              attachments {
                id
                __typename
              }
              isSplitTransaction
              createdAt
              updatedAt
              category {
                id
                name
                __typename
              }
              merchant {
                name
                id
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
          transactionRules {
            id
            __typename
          }
        }
      `, { 
        offset: 0, 
        limit: 10,
        filters: {},
        orderBy: null
      })
      
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
          console.log(`     - Pending: ${tx.pending}`)
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

testTransactionsFixV2().then(() => {
  console.log('\n🏁 Fixed transactions test v2 completed!')
}).catch(error => {
  console.error('💥 Fixed transactions test v2 failed:', error)
  process.exit(1)
})