#!/usr/bin/env node

// Test CAPTCHA handling in MonarchMoney authentication
const { MonarchClient } = require('./dist/index.js')
require('dotenv/config')

async function testCaptchaHandling() {
  console.log('🎯 Testing MonarchMoney CAPTCHA handling...')
  
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
    console.log('📧 Attempting login with email:', process.env.MONARCH_EMAIL)
    console.log('🔧 CAPTCHA handling is enabled - will guide you through web login if needed')
    
    await client.login({
      email: process.env.MONARCH_EMAIL,
      password: process.env.MONARCH_PASSWORD,
      mfaSecretKey: process.env.MONARCH_MFA_SECRET,
      useSavedSession: false,
      saveSession: false,
      interactive: true,        // Enable interactive CAPTCHA handling
      maxCaptchaRetries: 2     // Allow 2 retries after CAPTCHA resolution
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

    console.log('🎉 All tests passed!')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.error('Error code:', error.code)
    
    if (error.code === 'CAPTCHA_REQUIRED') {
      console.log('\n💡 This error indicates that CAPTCHA verification is still required.')
      console.log('   Please ensure you have completed the web login process successfully.')
      console.log('   You may need to wait a few minutes for the CAPTCHA block to clear.')
    }
    
    if (error.stack) {
      console.error('Stack trace:', error.stack)
    }
    process.exit(1)
  }
}

async function testNonInteractiveCaptcha() {
  console.log('\n🤖 Testing non-interactive CAPTCHA handling...')
  
  const client = new MonarchClient()

  try {
    await client.login({
      email: process.env.MONARCH_EMAIL,
      password: process.env.MONARCH_PASSWORD,
      mfaSecretKey: process.env.MONARCH_MFA_SECRET,
      interactive: false  // Disable interactive prompts
    })

    console.log('✅ Non-interactive login successful!')

  } catch (error) {
    if (error.code === 'CAPTCHA_REQUIRED') {
      console.log('✅ Non-interactive mode correctly rejected CAPTCHA requirement')
      console.log('   Error message:', error.message)
    } else {
      console.error('❌ Unexpected error in non-interactive mode:', error.message)
    }
  }
}

console.log('📚 MonarchMoney TypeScript SDK - CAPTCHA Handling Test')
console.log('='.repeat(60))

testCaptchaHandling()
  .then(() => testNonInteractiveCaptcha())
  .then(() => {
    console.log('\n🏁 CAPTCHA handling test completed!')
  })
  .catch(error => {
    console.error('💥 Test suite failed:', error)
    process.exit(1)
  })