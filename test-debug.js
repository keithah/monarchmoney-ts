#!/usr/bin/env node

// Debug authentication test script with detailed HTTP logging
const { default: fetch } = require('node-fetch')
const totp = require('otplib')
require('dotenv/config')

function generateDeviceUUID() {
  const chars = '0123456789abcdef'
  let uuid = ''
  for (let i = 0; i < 32; i++) {
    if (i === 8 || i === 12 || i === 16 || i === 20) {
      uuid += '-'
    }
    uuid += chars[Math.floor(Math.random() * 16)]
  }
  return uuid
}

async function testAuth() {
  console.log('🔍 Testing MonarchMoney authentication with detailed logging...')
  
  if (!process.env.MONARCH_EMAIL || !process.env.MONARCH_PASSWORD || !process.env.MONARCH_MFA_SECRET) {
    console.error('❌ Missing credentials in .env file')
    process.exit(1)
  }

  const baseUrl = 'https://api.monarchmoney.com'
  const deviceUuid = generateDeviceUUID()
  
  console.log('🔧 Request configuration:')
  console.log('  - Base URL:', baseUrl)
  console.log('  - Email:', process.env.MONARCH_EMAIL)
  console.log('  - Device UUID:', deviceUuid)

  // Generate MFA code
  const mfaCode = totp.authenticator.generate(process.env.MONARCH_MFA_SECRET)
  console.log('  - MFA Code:', mfaCode)

  const loginData = {
    username: process.env.MONARCH_EMAIL,
    password: process.env.MONARCH_PASSWORD,
    trusted_device: true,
    supports_mfa: true,
    supports_email_otp: true,
    supports_recaptcha: true,
    totp: mfaCode  // Add TOTP code
  }

  const headers = {
    'Accept': 'application/json',
    'Client-Platform': 'web',
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'device-uuid': deviceUuid,
    'Origin': 'https://app.monarchmoney.com',
    'x-cio-client-platform': 'web',
    'x-cio-site-id': '2598be4aa410159198b2',
    'x-gist-user-anonymous': 'false'
  }

  console.log('📤 Request headers:')
  for (const [key, value] of Object.entries(headers)) {
    console.log(`  ${key}: ${value}`)
  }

  console.log('📤 Request body:', JSON.stringify(loginData, null, 2))

  try {
    console.log('🌐 Making request...')
    
    const response = await fetch(`${baseUrl}/auth/login/`, {
      method: 'POST',
      headers,
      body: JSON.stringify(loginData)
    })

    console.log('📥 Response received:')
    console.log('  - Status:', response.status)
    console.log('  - Status Text:', response.statusText)
    console.log('  - Headers:')
    
    for (const [key, value] of response.headers.entries()) {
      console.log(`    ${key}: ${value}`)
    }

    const responseText = await response.text()
    console.log('  - Body length:', responseText.length)
    console.log('  - Body preview (first 500 chars):', responseText.substring(0, 500))

    try {
      const responseJson = JSON.parse(responseText)
      console.log('  - Parsed JSON:', JSON.stringify(responseJson, null, 2))
    } catch (e) {
      console.log('  - Body is not valid JSON')
    }

    if (response.status === 429) {
      console.log('⚠️  This is a 429 Rate Limit response')
      const retryAfter = response.headers.get('Retry-After')
      if (retryAfter) {
        console.log('  - Retry-After header:', retryAfter)
      }
    } else if (response.status === 403) {
      console.log('⚠️  This is a 403 Forbidden response (not rate limiting according to user)')
    } else if (response.status >= 400) {
      console.log('⚠️  This is an error response')
    } else {
      console.log('✅ This appears to be a successful response')
    }

  } catch (error) {
    console.error('💥 Request failed with error:', error)
    if (error.stack) {
      console.error('Stack trace:', error.stack)
    }
    process.exit(1)
  }
}

testAuth().then(() => {
  console.log('🎉 Debug test completed!')
}).catch(error => {
  console.error('💥 Debug test failed:', error)
  process.exit(1)
})