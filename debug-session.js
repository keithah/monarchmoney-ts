#!/usr/bin/env node

// Debug session sharing between auth services
const { MonarchClient } = require('./dist/cjs/index.js')
require('dotenv/config')

async function debugSession() {
  console.log('🔍 Debugging session sharing...')
  
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
    console.log('📊 Initial session state:')
    const initialSession = client.getSessionInfo()
    console.log('  - Valid:', initialSession.isValid)
    console.log('  - Main auth token:', client.auth.getToken() ? 'Present' : 'None')
    console.log('  - Direct auth token:', client.directAuth.getToken() ? 'Present' : 'None')
    
    console.log('\n🔑 Attempting direct login...')
    await client.directLogin({
      email: process.env.MONARCH_EMAIL,
      password: process.env.MONARCH_PASSWORD,
      mfaSecretKey: process.env.MONARCH_MFA_SECRET,
      saveSession: true
    })
    
    console.log('✅ Direct login completed')
    
    console.log('\n📊 After direct login session state:')
    const afterSession = client.getSessionInfo()
    console.log('  - Valid:', afterSession.isValid)
    console.log('  - User ID:', afterSession.userId || 'N/A')
    console.log('  - Main auth token:', client.auth.getToken() ? 'Present' : 'None')
    console.log('  - Direct auth token:', client.directAuth.getToken() ? 'Present' : 'None')
    console.log('  - Main auth session valid:', client.auth.getSessionInfo().isValid)
    console.log('  - Direct auth session valid:', client.directAuth.getSessionInfo().isValid)
    
    // Try to manually check if ensureValidSession works
    console.log('\n🔧 Testing ensureValidSession...')
    try {
      await client.ensureValidSession()
      console.log('✅ ensureValidSession succeeded')
    } catch (error) {
      console.log('❌ ensureValidSession failed:', error.message)
    }
    
    // Try to manually check the GraphQL client's auth check
    console.log('\n🔧 Testing GraphQL client auth check...')
    try {
      await client.auth.ensureValidSession()
      console.log('✅ GraphQL client auth check succeeded')
    } catch (error) {
      console.log('❌ GraphQL client auth check failed:', error.message)
    }

  } catch (error) {
    console.error('❌ Debug session failed:', error.message)
    console.error('Error code:', error.code)
    console.error('Error type:', error.constructor.name)
    process.exit(1)
  }
}

debugSession().then(() => {
  console.log('\n🏁 Session debug completed!')
}).catch(error => {
  console.error('💥 Session debug failed:', error)
  process.exit(1)
})