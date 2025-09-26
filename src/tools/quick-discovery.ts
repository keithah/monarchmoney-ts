// Quick Schema Discovery - Focused on key types for MCP optimization
import { MonarchClient } from '../client/MonarchClient'
import * as operations from '../client/graphql/operations'

async function quickDiscovery(): Promise<any> {
  console.log('🚀 Quick GraphQL Schema Discovery for MCP Optimization')

  const client = new MonarchClient({
    timeout: 30000,
    enablePersistentCache: false
  })

  try {
    await client.login({
      email: process.env.MONARCH_EMAIL!,
      password: process.env.MONARCH_PASSWORD!,
      mfaSecretKey: process.env.MONARCH_MFA_SECRET
    })

    // Test a few focused queries to understand response structure
    console.log('\n🔬 Testing basic queries for field discovery...')

    const testResults: Record<string, any> = {}

    // Test 1: Simple account query
    try {
      console.log('Testing accounts query...')
      const accounts = await client.gqlCall('GetAccounts', operations.GET_ACCOUNTS)
      if (accounts && Array.isArray((accounts as any).accounts)) {
        const firstAccount = (accounts as any).accounts[0]
        if (firstAccount) {
          testResults.accountFields = Object.keys(firstAccount)
          console.log(`✅ Account has ${testResults.accountFields.length} fields:`, testResults.accountFields.slice(0, 10))
        }
      }
    } catch (error: any) {
      console.log('❌ Account query failed:', error.message.substring(0, 100))
    }

    // Test 2: Simple transaction query
    try {
      console.log('Testing transactions query...')
      const transactions = await client.gqlCall('GetTransactions', `
        query GetTransactions {
          allTransactions {
            totalCount
            results(limit: 5) {
              id
              amount
              date
              pending
              notes
              category { id name }
              merchant { id name }
              account { id displayName }
            }
          }
        }
      `)

      if (transactions && (transactions as any).allTransactions?.results?.length > 0) {
        const firstTx = (transactions as any).allTransactions.results[0]
        testResults.transactionFields = Object.keys(firstTx)
        console.log(`✅ Transaction has ${testResults.transactionFields.length} fields:`, testResults.transactionFields)
      }
    } catch (error: any) {
      console.log('❌ Transaction query failed:', error.message.substring(0, 100))
    }

    // Test 3: Categories
    try {
      console.log('Testing categories query...')
      const categories = await client.gqlCall('GetCategories', operations.GET_TRANSACTION_CATEGORIES)
      if (categories && Array.isArray((categories as any).categories)) {
        const firstCategory = (categories as any).categories[0]
        if (firstCategory) {
          testResults.categoryFields = Object.keys(firstCategory)
          console.log(`✅ Category has ${testResults.categoryFields.length} fields:`, testResults.categoryFields)
        }
      }
    } catch (error: any) {
      console.log('❌ Category query failed:', error.message.substring(0, 100))
    }

    // Test 4: User info
    try {
      console.log('Testing user query...')
      const me = await client.gqlCall('GetMe', operations.GET_ME)
      if (me && (me as any).me) {
        testResults.userFields = Object.keys((me as any).me)
        console.log(`✅ User has ${testResults.userFields.length} fields:`, testResults.userFields.slice(0, 10))
      }
    } catch (error: any) {
      console.log('❌ User query failed:', error.message.substring(0, 100))
    }

    // Test some field variations on transactions
    console.log('\n🧪 Testing transaction field variations...')
    const transactionFieldTests = [
      'plaidName',
      'originalDescription',
      'reviewStatus',
      'hideFromReports',
      'isRecurring',
      'needsReview',
      'isSplitTransaction',
      'attachments',
      'tags',
      'splits',
      'location',
      'confidence',
      'merchantName',
      'categoryId',
      'accountId'
    ]

    const validTransactionFields: string[] = []

    for (const field of transactionFieldTests) {
      try {
        const testQuery = `
          query TestField {
            allTransactions {
              results(limit: 1) {
                id
                ${field}
              }
            }
          }
        `
        await client.gqlCall('TestField', testQuery)
        validTransactionFields.push(field)
        console.log(`✅ ${field}`)
      } catch (error: any) {
        const msg = error.message || ''
        if (msg.includes('Cannot query field')) {
          console.log(`❌ ${field} - not available`)
        } else {
          console.log(`⚠️  ${field} - exists but needs different structure`)
          validTransactionFields.push(field) // Might still be valid
        }
      }
    }

    // Test account field variations
    console.log('\n🧪 Testing account field variations...')
    const accountFieldTests = [
      'availableBalance',
      'mask',
      'institutionName',
      'accountNumber',
      'routingNumber',
      'dataProviderAccountId',
      'isManual',
      'transactionsCount',
      'holdingsCount',
      'logoUrl',
      'manualInvestmentsTrackingMethod',
      'order'
    ]

    const validAccountFields: string[] = []

    for (const field of accountFieldTests) {
      try {
        const testQuery = `
          query TestAccountField {
            accounts {
              id
              ${field}
            }
          }
        `
        await client.gqlCall('TestAccountField', testQuery)
        validAccountFields.push(field)
        console.log(`✅ ${field}`)
      } catch (error: any) {
        const msg = error.message || ''
        if (msg.includes('Cannot query field')) {
          console.log(`❌ ${field} - not available`)
        } else {
          console.log(`⚠️  ${field} - exists but may need args`)
          validAccountFields.push(field)
        }
      }
    }

    // Generate summary
    console.log('\n📊 Discovery Summary:')
    console.log('='.repeat(50))

    if (testResults.accountFields) {
      console.log(`🏦 Account Fields (${testResults.accountFields.length}):`, testResults.accountFields.join(', '))
    }

    if (testResults.transactionFields) {
      console.log(`💳 Transaction Fields (${testResults.transactionFields.length}):`, testResults.transactionFields.join(', '))
    }

    if (testResults.categoryFields) {
      console.log(`📂 Category Fields (${testResults.categoryFields.length}):`, testResults.categoryFields.join(', '))
    }

    console.log(`✅ Additional Transaction Fields (${validTransactionFields.length}):`, validTransactionFields.join(', '))
    console.log(`✅ Additional Account Fields (${validAccountFields.length}):`, validAccountFields.join(', '))

    // Generate optimized queries
    console.log('\n🎯 Recommended MCP-Optimized Queries:')
    console.log('='.repeat(50))

    console.log('\n📱 Ultra-Light Transaction Query (< 5KB):')
    console.log(`
query MCPTransactionsUltraLight($limit: Int = 25) {
  allTransactions {
    totalCount
    results(limit: $limit) {
      id
      amount
      date
    }
  }
}`)

    console.log('\n📊 Light Transaction Query (< 15KB):')
    console.log(`
query MCPTransactionsLight($limit: Int = 25) {
  allTransactions {
    totalCount
    results(limit: $limit) {
      id
      amount
      date
      pending
      category { id name }
      ${validTransactionFields.includes('merchantName') ? 'merchantName' : 'merchant { id name }'}
    }
  }
}`)

    console.log('\n💼 Account Summary Query:')
    console.log(`
query MCPAccountsSummary {
  accounts {
    id
    displayName
    currentBalance
    ${validAccountFields.includes('availableBalance') ? 'availableBalance' : ''}
    isHidden
    type { display }
  }
}`)

    return {
      accountFields: testResults.accountFields || [],
      transactionFields: testResults.transactionFields || [],
      categoryFields: testResults.categoryFields || [],
      additionalTransactionFields: validTransactionFields,
      additionalAccountFields: validAccountFields
    }

  } catch (error) {
    console.error('❌ Discovery failed:', error)
    return null
  } finally {
    await client.close()
  }
}

if (require.main === module) {
  quickDiscovery().catch(console.error)
}

export { quickDiscovery }