#!/usr/bin/env node

// Simple authentication test script
const { MonarchClient } = require('./dist/cjs/index.js')
require('dotenv/config')

async function testAuth() {
  console.log('🔑 Testing MonarchMoney authentication...')
  
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
    console.log('📧 Logging in with email:', process.env.MONARCH_EMAIL)
    
    await client.login({
      email: process.env.MONARCH_EMAIL,
      password: process.env.MONARCH_PASSWORD,
      mfaSecretKey: process.env.MONARCH_MFA_SECRET,
      useSavedSession: false,
      saveSession: false
    })

    console.log('✅ Authentication successful!')
    
    const sessionInfo = client.getSessionInfo()
    console.log('📊 Session info:')
    console.log('  - Valid:', sessionInfo.isValid)
    console.log('  - User ID:', sessionInfo.userId || 'N/A')
    console.log('  - Expires:', sessionInfo.expiresAt ? new Date(sessionInfo.expiresAt).toISOString() : 'N/A')

    // Test a simple API call
    console.log('🔍 Testing accounts API...')
    const accounts = await client.accounts.getAll()
    console.log(`✅ Found ${accounts.length} accounts`)

    if (accounts.length > 0) {
      console.log('📋 First account:')
      console.log('  - Name:', accounts[0].displayName)
      console.log('  - Type:', accounts[0].type?.name || 'N/A')
      console.log('  - Balance:', accounts[0].currentBalance)
    }

  } catch (error) {
    console.error('❌ Authentication failed:', error.message)
    console.error('Error code:', error.code)
    console.error('Error details:', error.details)
    if (error.stack) {
      console.error('Stack trace:', error.stack)
    }
    process.exit(1)
  }
}

testAuth().then(() => {
  console.log('🎉 Test completed successfully!')
}).catch(error => {
  console.error('💥 Test failed:', error)
  process.exit(1)
})