#!/usr/bin/env node

import * as dotenv from 'dotenv'
import fetch from 'node-fetch'
import * as totp from 'otplib'
import { EncryptionService } from './dist/cjs/utils/index.js'

dotenv.config()

async function debugRequest() {
  console.log('🔍 DEBUG: Exact Request Analysis')
  console.log('==============================')

  // Generate TOTP code
  const mfaCode = totp.authenticator.generate(process.env.MONARCH_MFA_SECRET!)
  
  // Generate fresh UUID
  const deviceUuid = EncryptionService.generateDeviceUUID()
  
  const headers = {
    'Accept': 'application/json',
    'Client-Platform': 'web',
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
    'device-uuid': deviceUuid,
    'Origin': 'https://app.monarchmoney.com',
    'x-cio-client-platform': 'web',
    'x-cio-site-id': '2598be4aa410159198b2',
    'x-gist-user-anonymous': 'false'
  }
  
  const body = {
    username: process.env.MONARCH_EMAIL!,
    password: process.env.MONARCH_PASSWORD!,
    trusted_device: true,
    supports_mfa: true,
    supports_email_otp: true,
    supports_recaptcha: true,
    totp: mfaCode
  }
  
  console.log('\n📤 EXACT REQUEST BEING SENT:')
  console.log('URL:', 'https://api.monarchmoney.com/auth/login/')
  console.log('Method: POST')
  
  console.log('\n📋 Headers:')
  Object.entries(headers).forEach(([key, value]) => {
    console.log(`  ${key}: ${value}`)
  })
  
  console.log('\n📄 Body:')
  console.log(JSON.stringify(body, null, 2))
  
  console.log(`\n🔢 TOTP Code: ${mfaCode} (${mfaCode.length} digits)`)
  console.log(`🆔 Device UUID: ${deviceUuid}`)
  
  console.log('\n🚀 Sending request...')
  
  try {
    const response = await fetch('https://api.monarchmoney.com/auth/login/', {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      timeout: 30000
    })
    
    console.log(`\n📥 Response Status: ${response.status} ${response.statusText}`)
    console.log('\n📋 Response Headers:')
    response.headers.forEach((value, key) => {
      console.log(`  ${key}: ${value}`)
    })
    
    const responseText = await response.text()
    console.log('\n📄 Response Body:')
    console.log(responseText)
    
    // Try to parse as JSON
    try {
      const data = JSON.parse(responseText)
      console.log('\n📊 Parsed JSON:')
      console.log(JSON.stringify(data, null, 2))
    } catch {
      console.log('(Not valid JSON)')
    }
    
  } catch (error) {
    console.log('\n❌ Request failed:', error.message)
  }
}

debugRequest().catch(console.error)