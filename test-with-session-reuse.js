#!/usr/bin/env node

// Test with session reuse - like the Python library does
const { MonarchClient } = require('./dist/cjs/index.js')
require('dotenv/config')

async function testWithSessionReuse() {
  console.log('🔄 Testing with Session Reuse (like Python library)...')
  
  if (!process.env.MONARCH_EMAIL || !process.env.MONARCH_PASSWORD || !process.env.MONARCH_MFA_SECRET) {
    console.error('❌ Missing credentials in .env file')
    process.exit(1)
  }

  const client = new MonarchClient({
    baseURL: 'https://api.monarchmoney.com',
    timeout: 30000,
    retries: 1
  })

  const results = {
    passed: [],
    failed: []
  }

  try {
    console.log('🔑 Attempting authentication with session reuse...')
    
    // First try to load existing session
    const hasExistingSession = client.loadSession()
    if (hasExistingSession) {
      console.log('✅ Found existing session, validating...')
      const isValid = await client.validateSession()
      if (isValid) {
        console.log('✅ Existing session is valid - no re-authentication needed!')
      } else {
        console.log('❌ Existing session invalid, need to re-authenticate')
        throw new Error('Session invalid')
      }
    } else {
      throw new Error('No existing session')
    }

  } catch (error) {
    // Only authenticate if session doesn't exist or is invalid
    console.log('🔑 Need to authenticate...')
    
    try {
      await client.directLogin({
        email: process.env.MONARCH_EMAIL,
        password: process.env.MONARCH_PASSWORD,
        mfaSecretKey: process.env.MONARCH_MFA_SECRET,
        saveSession: true  // 🔥 KEY CHANGE: Save the session!
      })
      console.log('✅ Authentication successful and session saved!')
    } catch (authError) {
      if (authError.message.includes('CAPTCHA')) {
        console.log('⚠️  CAPTCHA required - this means we need better session reuse!')
        console.log('💡 SOLUTION: The session should be reused to avoid re-authentication')
        process.exit(1)
      }
      throw authError
    }
  }

  // Now test APIs with the authenticated session
  console.log('\n🧪 Testing APIs with reused/fresh session...')

  // Test 1: User Profile (lightweight test)
  try {
    const user = await client.get_me()
    console.log(`✅ User Profile: ${user.name || user.email}`)
    results.passed.push('User Profile API')
  } catch (error) {
    console.log(`❌ User Profile failed: ${error.message}`)
    results.failed.push('User Profile API')
  }

  // Test 2: Accounts (core functionality)
  try {
    const accounts = await client.accounts.getAll()
    console.log(`✅ Accounts: ${accounts.length} accounts`)
    results.passed.push(`Accounts API (${accounts.length})`)
  } catch (error) {
    console.log(`❌ Accounts failed: ${error.message}`)
    results.failed.push('Accounts API')
  }

  // Test 3: Categories (commonly used)
  try {
    const categories = await client.categories.getCategories()
    console.log(`✅ Categories: ${categories.length} categories`)
    results.passed.push(`Categories API (${categories.length})`)
  } catch (error) {
    console.log(`❌ Categories failed: ${error.message}`)
    results.failed.push('Categories API')
  }

  // Test 4: NEW - Institutions API
  try {
    const institutions = await client.institutions.getInstitutions()
    console.log(`✅ Institutions: ${institutions.length} institutions`)
    results.passed.push(`Institutions API (${institutions.length})`)
  } catch (error) {
    console.log(`❌ Institutions failed: ${error.message}`)
    results.failed.push('Institutions API')
  }

  // Summary
  console.log('\n📊 SESSION REUSE TEST RESULTS:')
  console.log('=' .repeat(50))
  
  if (results.passed.length > 0) {
    console.log(`✅ PASSED (${results.passed.length}):`)
    results.passed.forEach(test => console.log(`   ✓ ${test}`))
  }
  
  if (results.failed.length > 0) {
    console.log(`\n❌ FAILED (${results.failed.length}):`)
    results.failed.forEach(test => console.log(`   ✗ ${test}`))
  }

  const successRate = Math.round((results.passed.length / (results.passed.length + results.failed.length)) * 100)
  console.log(`\n🎯 Success Rate: ${successRate}% (${results.passed.length}/${results.passed.length + results.failed.length})`)

  console.log('\n💡 KEY INSIGHT: Session reuse prevents CAPTCHA by avoiding re-authentication!')

}

testWithSessionReuse().then(() => {
  console.log('\n🏁 Session reuse test completed!')
}).catch(error => {
  console.error('💥 Session reuse test failed:', error.message)
  process.exit(1)
})