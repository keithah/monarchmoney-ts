#!/usr/bin/env node

// Test simple GraphQL queries to debug the 400 errors
const { MonarchClient } = require('./dist/cjs/index.js')
require('dotenv/config')

async function testSimpleGraphQL() {
  console.log('🔍 Testing simple GraphQL queries...')
  
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
    
    // Test the simplest possible GraphQL query first
    console.log('\n🔍 Testing simple me query...')
    try {
      const meResult = await client.get_me()
      console.log('✅ me query successful:', meResult)
    } catch (error) {
      console.log('❌ me query failed:', error.message)
      console.log('Error details:', error)
    }
    
    // Test a very basic GraphQL query manually
    console.log('\n🔍 Testing manual GraphQL query...')
    try {
      const result = await client.gqlCall('test', 'query { __typename }')
      console.log('✅ Basic GraphQL query successful:', result)
    } catch (error) {
      console.log('❌ Basic GraphQL query failed:', error.message)
      console.log('Error details:', error)
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.error('Error code:', error.code)
    console.error('Error type:', error.constructor.name)
    process.exit(1)
  }
}

testSimpleGraphQL().then(() => {
  console.log('\n🏁 Simple GraphQL test completed!')
}).catch(error => {
  console.error('💥 Simple GraphQL test failed:', error)
  process.exit(1)
})