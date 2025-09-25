#!/usr/bin/env node

// Debug the library authentication flow
const { MonarchClient } = require('./dist/cjs/index.js')
require('dotenv/config')

async function debugLibraryAuth() {
  console.log('🔍 Debugging MonarchMoney library authentication flow...')
  
  if (!process.env.MONARCH_EMAIL || !process.env.MONARCH_PASSWORD || !process.env.MONARCH_MFA_SECRET) {
    console.error('❌ Missing credentials in .env file')
    process.exit(1)
  }

  const client = new MonarchClient({
    baseURL: 'https://api.monarchmoney.com',
    timeout: 30000,
    retries: 1
  })

  // Enable debug logging
  process.env.LOG_LEVEL = 'debug'

  try {
    console.log('📧 Attempting login with debug logging enabled...')
    console.log('Email:', process.env.MONARCH_EMAIL)
    console.log('Has MFA Secret:', !!process.env.MONARCH_MFA_SECRET)
    
    await client.login({
      email: process.env.MONARCH_EMAIL,
      password: process.env.MONARCH_PASSWORD,
      mfaSecretKey: process.env.MONARCH_MFA_SECRET,
      useSavedSession: false,
      saveSession: false
    })

    console.log('✅ Library authentication successful!')
    
    const sessionInfo = client.getSessionInfo()
    console.log('📊 Session info:', sessionInfo)

    // Test API call
    const accounts = await client.accounts.getAll()
    console.log(`✅ Retrieved ${accounts.length} accounts`)

  } catch (error) {
    console.error('❌ Library authentication failed')
    console.error('Error type:', error.constructor.name)
    console.error('Error code:', error.code)
    console.error('Error message:', error.message)
    console.error('Stack trace:')
    console.error(error.stack)

    // Check if we can determine what went wrong
    if (error.message.includes('Forbidden')) {
      console.log('\n🔍 This suggests the library is not using the single-step authentication correctly.')
      console.log('The raw API calls work fine, but the library has an issue.')
    }
  }
}

debugLibraryAuth().catch(console.error)