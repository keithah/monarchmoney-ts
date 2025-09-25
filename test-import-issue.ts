#!/usr/bin/env node

import * as dotenv from 'dotenv'
import fetch from 'node-fetch'
import * as totp from 'otplib'

dotenv.config()

async function testImportIssue() {
  console.log('🔍 Testing with exact same imports as library')
  console.log('=========================================')
  
  // Use the exact same UUID generation as library
  const { EncryptionService } = await import('./dist/cjs/utils/index.js')
  const deviceUuid = EncryptionService.generateDeviceUUID()
  
  // Generate TOTP
  const mfaCode = totp.authenticator.generate(process.env.MONARCH_MFA_SECRET!)
  
  const loginData = {
    username: process.env.MONARCH_EMAIL!,
    password: process.env.MONARCH_PASSWORD!,
    trusted_device: true,
    supports_mfa: true,
    supports_email_otp: true,
    supports_recaptcha: true,
    totp: mfaCode
  }
  
  console.log('Device UUID:', deviceUuid)
  console.log('TOTP:', mfaCode)
  
  // Test 1: Direct fetch (like our working test)
  console.log('\n🧪 Test 1: Direct node-fetch')
  try {
    const response1 = await fetch('https://api.monarchmoney.com/auth/login/', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Client-Platform': 'web',
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
        'device-uuid': deviceUuid,
        'Origin': 'https://app.monarchmoney.com',
        'x-cio-client-platform': 'web',
        'x-cio-site-id': '2598be4aa410159198b2',
        'x-gist-user-anonymous': 'false'
      },
      body: JSON.stringify(loginData)
    })
    
    console.log(`Response: ${response1.status} ${response1.statusText}`)
    if (response1.status === 200) {
      const data = await response1.json()
      console.log('✅ Got token:', data.token ? 'Yes' : 'No')
    }
  } catch (error) {
    console.log('❌ Error:', error.message)
  }
  
  // Test 2: Through library
  console.log('\n🧪 Test 2: Through TypeScript library')
  try {
    const { MonarchClient } = await import('./dist/cjs/index.js')
    const client = new MonarchClient({
      baseURL: 'https://api.monarchmoney.com',
      timeout: 30000,
      retries: 1
    })
    
    await client.login({
      email: process.env.MONARCH_EMAIL!,
      password: process.env.MONARCH_PASSWORD!,
      mfaSecretKey: process.env.MONARCH_MFA_SECRET!,
      useSavedSession: false,
      saveSession: false
    })
    
    console.log('✅ Library authentication successful!')
  } catch (error) {
    console.log('❌ Library error:', error.message)
  }
}

testImportIssue().catch(console.error)