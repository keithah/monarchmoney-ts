#!/usr/bin/env node

// Test the new direct login method
const { MonarchClient } = require('./dist/cjs/index.js')
require('dotenv/config')

async function testDirectLogin() {
  console.log('🎯 Testing MonarchMoney direct login method...')
  
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
    console.log('📧 Testing direct login with email:', process.env.MONARCH_EMAIL)
    
    await client.directLogin({
      email: process.env.MONARCH_EMAIL,
      password: process.env.MONARCH_PASSWORD,
      mfaSecretKey: process.env.MONARCH_MFA_SECRET,
      saveSession: false
    })

    console.log('✅ Direct login successful!')
    
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

    console.log('🎉 All tests passed!')

  } catch (error) {
    console.error('❌ Direct login failed:', error.message)
    console.error('Error code:', error.code)
    console.error('Error type:', error.constructor.name)
    
    if (error.stack) {
      console.error('Stack trace:', error.stack)
    }
    process.exit(1)
  }
}

testDirectLogin().then(() => {
  console.log('\n🏁 Direct login test completed successfully!')
}).catch(error => {
  console.error('💥 Direct login test failed:', error)
  process.exit(1)
})