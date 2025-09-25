#!/usr/bin/env node

import { MonarchClient } from './src'
import * as dotenv from 'dotenv'
import * as totp from 'otplib'

dotenv.config()

async function debugAuth() {
  console.log('🔍 Debug Authentication Flow')
  console.log('============================')

  const client = new MonarchClient({
    logLevel: 'debug', // More verbose logging
    enablePersistentCache: false
  })

  try {
    const email = process.env.MONARCH_EMAIL
    const password = process.env.MONARCH_PASSWORD
    const mfaSecret = process.env.MONARCH_MFA_SECRET

    if (!email || !password) {
      console.log('❌ Missing credentials')
      return
    }

    console.log(`📧 Email: ${email}`)
    console.log(`🔒 Has MFA Secret: ${!!mfaSecret}`)
    
    if (mfaSecret) {
      const generatedCode = totp.authenticator.generate(mfaSecret)
      console.log(`🔢 Generated TOTP: ${generatedCode}`)
    }

    console.log('\n🚀 Attempting login...')
    
    try {
      await client.login({
        email,
        password,
        mfaSecretKey: mfaSecret,
        saveSession: false
      })
      
      console.log('✅ Login successful!')
      
      // Try a simple API call
      const userProfile = await client.get_me()
      console.log('👤 User ID:', userProfile.id)
      
    } catch (error) {
      console.log('❌ Login failed')
      console.log('Error details:')
      console.log('- Name:', error.name)
      console.log('- Message:', error.message)
      console.log('- Code:', error.code)
      console.log('- Status:', error.statusCode)
      
      // Let's try manual MFA
      if (error.name === 'MonarchMFARequiredError' && mfaSecret) {
        console.log('\n🔄 Trying manual MFA...')
        const manualCode = totp.authenticator.generate(mfaSecret)
        console.log(`Generated code: ${manualCode}`)
        
        await client.multiFactorAuthenticate({
          email,
          password,
          code: manualCode
        })
        
        console.log('✅ Manual MFA successful!')
      }
    }

  } catch (error) {
    console.log('💥 Unexpected error:', error)
  } finally {
    await client.close()
  }
}

if (require.main === module) {
  debugAuth().catch(console.error)
}