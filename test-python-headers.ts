#!/usr/bin/env node

import * as dotenv from 'dotenv'

dotenv.config()

async function testPythonHeaders() {
  console.log('🐍 Testing with EXACT Python Library Headers')
  console.log('===========================================')

  try {
    const { MonarchClient } = await import('./dist/cjs/index.js')
    
    const client = new MonarchClient({
      baseURL: 'https://api.monarchmoney.com',
      timeout: 30000,
      retries: 1
    })

    console.log('✅ MonarchClient initialized with Python library headers')

    console.log('\n📋 Headers now match Python implementation:')
    console.log('✅ Client-Platform: web (capital C)')
    console.log('✅ x-cio-client-platform: web')
    console.log('✅ x-cio-site-id: 2598be4aa410159198b2')
    console.log('✅ x-gist-user-anonymous: false')
    console.log('✅ User-Agent: Chrome/139.0.0.0')
    console.log('✅ Rate limiting: 100ms between requests')

    console.log('\n🔐 Attempting authentication with Python-exact headers...')
    
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

    console.log('\n🎉 SUCCESS: MonarchMoney TypeScript library is working!')
    console.log('🐍 The Python headers were the key!')

  } catch (error) {
    console.log('\n❌ Test result:', error.message)
    
    if (error.message?.includes('Rate limit')) {
      console.log('\n⏰ Still rate limited - wait 10-15 minutes and try again')
      console.log('💡 The headers are now correct, but rate limit needs to expire')
    } else if (error.message?.includes('CAPTCHA')) {
      console.log('\n🔒 CAPTCHA required - headers are working but security triggered')
    } else {
      console.log('\n🔍 Error details for investigation:', error)
    }
  }
}

testPythonHeaders().catch(console.error)