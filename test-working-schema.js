#!/usr/bin/env node

// Test working GraphQL schema patterns from Python library
const { MonarchClient } = require('./dist/cjs/index.js')
require('dotenv/config')

async function testWorkingSchema() {
  console.log('🔍 Testing working GraphQL schema patterns...')
  
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
    
    // Test working accounts query (from Python library)
    console.log('\n🏦 Testing Python-style accounts query...')
    try {
      const result = await client.gqlCall('GetAccounts', `
        query GetAccounts {
          accounts {
            id
            displayName
            currentBalance
            includeInNetWorth
            isHidden
            isAsset
            mask
            createdAt
            updatedAt
          }
        }
      `)
      console.log('✅ Accounts query successful!')
      console.log(`Found ${result.accounts?.length || 0} accounts`)
      
      if (result.accounts?.length > 0) {
        const firstAccount = result.accounts[0]
        console.log(`  First account: ${firstAccount.displayName} - $${firstAccount.currentBalance}`)
      }
    } catch (error) {
      console.log('❌ Accounts query failed:', error.message)
    }
    
    // Test working me query (from Python library) 
    console.log('\n👤 Testing Python-style me query...')
    try {
      const result = await client.gqlCall('GetMe', `
        query Common_GetMe {
          me {
            id
            email
            firstName
            lastName
            timezone
          }
        }
      `)
      console.log('✅ Me query successful!')
      console.log(`User: ${result.me?.firstName} ${result.me?.lastName} (${result.me?.email})`)
    } catch (error) {
      console.log('❌ Me query failed:', error.message)
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.error('Error code:', error.code)
    console.error('Error type:', error.constructor.name)
    process.exit(1)
  }
}

testWorkingSchema().then(() => {
  console.log('\n🏁 Schema test completed!')
}).catch(error => {
  console.error('💥 Schema test failed:', error)
  process.exit(1)
})