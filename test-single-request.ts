#!/usr/bin/env node

import * as dotenv from 'dotenv'

dotenv.config()

async function testSingleRequestAuth() {
  console.log('🔑 CRITICAL FIX: Single Request Authentication (Like Python)')
  console.log('=======================================================')

  try {
    const { MonarchClient } = await import('./dist/cjs/index.js')
    
    const client = new MonarchClient({
      baseURL: 'https://api.monarchmoney.com',
      timeout: 30000,
      retries: 1
    })

    console.log('✅ MonarchClient initialized')

    console.log('\n🎯 THE CRITICAL FIX:')
    console.log('✅ Send MFA code in FIRST request (not after 403)')
    console.log('✅ Python library includes totp in initial login body')
    console.log('✅ No separate MFA request needed!')
    
    console.log('\n📋 Request details:')
    console.log('• URL: https://api.monarchmoney.com/auth/login/')
    console.log('• Headers: Client-Platform, x-cio-*, etc.')
    console.log('• Body: { username, password, totp: [generated_code] }')

    console.log('\n🔐 Testing single-request authentication...')
    
    const startTime = Date.now()
    
    await client.login({
      email: process.env.MONARCH_EMAIL!,
      password: process.env.MONARCH_PASSWORD!,
      mfaSecretKey: process.env.MONARCH_MFA_SECRET!,
      useSavedSession: false,
      saveSession: true
    })

    const endTime = Date.now()
    console.log(`🎉 AUTHENTICATION SUCCESSFUL! (${endTime - startTime}ms)`)
    
    // Test API functionality
    console.log('\n📊 Testing API calls...')
    const accounts = await client.accounts.getAll()
    console.log(`✅ Retrieved ${accounts.length} accounts successfully!`)
    
    if (accounts.length > 0) {
      console.log('\n💰 Sample accounts:')
      accounts.slice(0, 3).forEach(account => {
        console.log(`  - ${account.displayName}: $${account.currentBalance?.toFixed(2)} (${account.type.name})`)
      })
    }

    console.log('\n🚀 COMPLETE SUCCESS!')
    console.log('🎊 MonarchMoney TypeScript library is fully working!')
    console.log('💡 The key was sending MFA code in the initial request, not after 403!')

  } catch (error) {
    console.log('\n❌ Authentication failed:', error.message)
    
    if (error.message?.includes('Forbidden')) {
      console.log('\n🔍 Still 403 Forbidden. Debugging details:')
      console.log('• Are we using the correct endpoint?')
      console.log('• Are headers exactly matching Python?') 
      console.log('• Is the TOTP code generation correct?')
      console.log('• Is the request body format exactly right?')
    } else if (error.message?.includes('Rate limit') || error.message?.includes('Too Many')) {
      console.log('\n⏰ Rate limited - wait 15-30 minutes')
    } else {
      console.log('\n🔍 Unexpected error:', error)
      if (error.stack) {
        console.log('Stack trace:')
        console.log(error.stack)
      }
    }
  }
}

testSingleRequestAuth().catch(console.error)