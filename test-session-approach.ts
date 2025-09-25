#!/usr/bin/env node

import * as dotenv from 'dotenv'

dotenv.config()

async function testSessionApproach() {
  console.log('🔄 Alternative Session-Based Approach')
  console.log('====================================')
  
  console.log('💡 Since you can login to the website fine, here are alternative approaches:')
  console.log('')
  
  console.log('🌐 Option 1: Extract Session Token from Website')
  console.log('1. Login to https://app.monarchmoney.com in your browser')
  console.log('2. Open Developer Tools (F12)')
  console.log('3. Go to Network tab')
  console.log('4. Look for any GraphQL request')
  console.log('5. Find the Authorization header like "Token abc123..."')
  console.log('6. Copy that token value')
  console.log('7. Set MONARCH_SESSION_TOKEN=abc123... in .env file')
  console.log('')
  
  console.log('🔧 Option 2: Test with Session Token')
  console.log('If you provide a session token, we can test the API calls directly:')
  
  const sessionToken = process.env.MONARCH_SESSION_TOKEN
  
  if (sessionToken) {
    console.log('✅ Session token found in environment!')
    
    try {
      const { MonarchClient } = await import('./dist/cjs/index.js')
      
      const client = new MonarchClient({
        baseURL: 'https://api.monarchmoney.com',
        timeout: 30000
      })
      
      // Manually set the session token
      console.log('🔑 Setting session token manually...')
      
      // Access the private auth service to set the token
      const authService = (client as any).auth
      authService.sessionStorage.saveSession(sessionToken, {
        email: process.env.MONARCH_EMAIL!,
        deviceUuid: 'manual-session',
        expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
      })
      
      console.log('📊 Testing API calls with session token...')
      
      // Test accounts API
      const accounts = await client.accounts.getAll()
      console.log(`✅ Retrieved ${accounts.length} accounts successfully!`)
      
      accounts.slice(0, 3).forEach(account => {
        console.log(`  - ${account.displayName}: $${account.currentBalance?.toFixed(2)} (${account.type.name})`)
      })
      
      // Test transactions API
      const transactions = await client.transactions.getTransactions({ limit: 5 })
      console.log(`✅ Retrieved ${transactions.transactions.length} transactions successfully!`)
      
      console.log('🎉 API integration confirmed working with valid session token!')
      
    } catch (error) {
      console.log('❌ Session token test failed:', error.message)
    }
    
  } else {
    console.log('⚠️  No MONARCH_SESSION_TOKEN found in environment')
    console.log('')
    console.log('📝 To test this approach:')
    console.log('1. Login to MonarchMoney website')
    console.log('2. Extract session token from browser')
    console.log('3. Add MONARCH_SESSION_TOKEN=your-token to .env')
    console.log('4. Run this test again')
  }
  
  console.log('')
  console.log('🔍 Why This Approach Works:')
  console.log('• Bypasses authentication rate limiting')
  console.log('• Uses the exact same session format as website')
  console.log('• Confirms our API integration is correct')
  console.log('• Shows the issue is only with the login flow, not the API calls')
}

testSessionApproach().catch(console.error)