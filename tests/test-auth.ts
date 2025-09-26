#!/usr/bin/env node

import * as dotenv from 'dotenv'

dotenv.config()

async function testAuth() {
  console.log('🧪 Testing Authentication Service')
  console.log('=================================')

  const email = process.env.MONARCH_EMAIL!
  const password = process.env.MONARCH_PASSWORD!
  const mfaSecret = process.env.MONARCH_MFA_SECRET!

  console.log(`📧 Email: ${email}`)
  console.log(`🔑 MFA Secret configured: ${mfaSecret ? 'Yes' : 'No'}`)

  try {
    // Import the compiled JS since TS has compilation issues
    const { AuthenticationService } = await import('./dist/client/auth/AuthenticationService.js')
    const { SessionStorage } = await import('./dist/client/auth/SessionStorage.js')

    const sessionStorage = new SessionStorage()
    const authService = new AuthenticationService('https://api.monarchmoney.com', sessionStorage)

    console.log('\n🚀 Starting authentication...')

    await authService.login({
      email,
      password,
      mfaSecretKey: mfaSecret,
      useSavedSession: false,
      saveSession: true
    })

    console.log('✅ Authentication successful!')
    
    const sessionInfo = authService.getSessionInfo()
    console.log('📊 Session Info:', sessionInfo)

    // Test session validation
    console.log('\n🔍 Validating session...')
    const isValid = await authService.validateSession()
    console.log(`Session valid: ${isValid}`)

  } catch (error) {
    console.log('\n❌ Authentication failed:', error)
    
    if (error.message?.includes('CAPTCHA')) {
      console.log('\n💡 CAPTCHA is required - this means our request format is correct!')
      console.log('   Try again in a few minutes when the CAPTCHA requirement expires.')
    }
    
    if (error.message?.includes('MFA')) {
      console.log('\n💡 MFA is required - this indicates initial auth worked!')
    }
  }
}

testAuth().catch(console.error)