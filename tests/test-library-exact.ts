#!/usr/bin/env node

import * as dotenv from 'dotenv'
import fetch from 'node-fetch'
import * as totp from 'otplib'
import { EncryptionService } from './dist/cjs/utils/index.js'

dotenv.config()

async function testLibraryExact() {
  console.log('🔍 TEST: Exact Library Implementation')
  console.log('====================================')

  // Exactly what the library does
  const deviceUuid = EncryptionService.generateDeviceUUID()
  const mfaCode = totp.authenticator.generate(process.env.MONARCH_MFA_SECRET!)
  
  const loginData = {
    username: process.env.MONARCH_EMAIL!,
    password: process.env.MONARCH_PASSWORD!,
    trusted_device: true,
    supports_mfa: true,
    supports_email_otp: true,
    supports_recaptcha: true,
    totp: mfaCode  // Same logic as library
  }
  
  console.log('📤 Request Data:')
  console.log(`Device UUID: ${deviceUuid}`)
  console.log(`TOTP Code: ${mfaCode}`)
  console.log(`Body:`, JSON.stringify(loginData, null, 2))
  
  try {
    // Test 1: Without AbortSignal (like our working debug)
    console.log('\n🧪 Test 1: Without AbortSignal.timeout')
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
    
    console.log(`Response 1: ${response1.status} ${response1.statusText}`)
    
    // Test 2: With AbortSignal.timeout (like library)
    console.log('\n🧪 Test 2: With AbortSignal.timeout (library style)')
    
    let abortController
    let timeoutSignal
    
    try {
      // Try AbortSignal.timeout if available
      timeoutSignal = AbortSignal.timeout(30000)
    } catch {
      // Fallback to AbortController if AbortSignal.timeout not available
      abortController = new AbortController()
      timeoutSignal = abortController.signal
      setTimeout(() => abortController.abort(), 30000)
    }
    
    const response2 = await fetch('https://api.monarchmoney.com/auth/login/', {
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
      body: JSON.stringify(loginData),
      signal: timeoutSignal
    })
    
    console.log(`Response 2: ${response2.status} ${response2.statusText}`)
    
    if (response1.status !== response2.status) {
      console.log('🚨 DIFFERENT STATUS CODES - AbortSignal is the issue!')
    } else {
      console.log('✅ Same status codes - issue is elsewhere')
    }
    
  } catch (error) {
    console.log('❌ Error in test:', error.message)
  }
}

testLibraryExact().catch(console.error)