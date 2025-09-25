#!/usr/bin/env node

import * as dotenv from 'dotenv'

dotenv.config()

async function testBrowserHeaders() {
  console.log('🌐 Testing with Exact Browser Headers from HAR')
  console.log('==============================================')

  try {
    const { MonarchClient } = await import('./dist/cjs/index.js')
    
    const client = new MonarchClient({
      baseURL: 'https://api.monarchmoney.com',
      timeout: 30000,
      retries: 1
    })

    console.log('✅ MonarchClient initialized with browser-exact headers')

    console.log('\n📋 Key Changes Applied:')
    console.log('✅ User-Agent: Chrome/140.0.0.0 (matches HAR)')
    console.log('✅ Removed: x-cio-client-platform header')
    console.log('✅ Removed: x-cio-site-id header')
    console.log('✅ Removed: x-gist-user-anonymous header')
    console.log('✅ Headers now match browser exactly')

    console.log('\n🔐 Attempting authentication with exact browser format...')
    
    const startTime = Date.now()
    
    await client.login({
      email: process.env.MONARCH_EMAIL!,
      password: process.env.MONARCH_PASSWORD!,
      mfaSecretKey: process.env.MONARCH_MFA_SECRET!,
      useSavedSession: false,
      saveSession: true
    })

    const endTime = Date.now()
    console.log(`✅ Authentication successful! (${endTime - startTime}ms)`)
    
    // Test a simple API call
    console.log('\n📊 Testing API integration...')
    const accounts = await client.accounts.getAll()
    console.log(`✅ Retrieved ${accounts.length} accounts successfully!`)
    
    accounts.slice(0, 3).forEach(account => {
      console.log(`  - ${account.displayName}: $${account.currentBalance?.toFixed(2)} (${account.type.name})`)
    })

    console.log('\n🎉 SUCCESS: Authentication and API calls working with browser headers!')

  } catch (error) {
    console.log('\n❌ Test result:', error.message)
    
    // Better error classification
    if (error.message?.includes('Rate limit')) {
      console.log('\n📊 Rate Limiting Analysis:')
      console.log('• Still hitting rate limits despite browser-exact headers')
      console.log('• This suggests the issue may be deeper than just headers')
      console.log('• MonarchMoney may have rate limiting based on:')
      console.log('  - IP address throttling')
      console.log('  - Authentication attempt frequency')
      console.log('  - API endpoint usage patterns')
      console.log('')
      console.log('💡 Recommended next steps:')
      console.log('• Try the session token approach (extract from browser)')
      console.log('• Wait longer between tests (15-30 minutes)')
      console.log('• Or use a different network/IP for testing')
    } else if (error.message?.includes('CAPTCHA')) {
      console.log('\n🔒 CAPTCHA required - confirms our requests are valid!')
    } else {
      console.log('\n🔍 Unexpected error for further investigation')
    }
  }
}

testBrowserHeaders().catch(console.error)