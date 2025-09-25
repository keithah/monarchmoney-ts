#!/usr/bin/env node

// Get CAPTCHA challenge from MonarchMoney
const { default: fetch } = require('node-fetch')
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

async function getCaptchaChallenge() {
  console.log('🎯 Attempting to get CAPTCHA challenge...')
  
  const baseUrl = 'https://api.monarchmoney.com'
  const deviceUuid = generateDeviceUUID()

  const headers = {
    'Accept': 'application/json',
    'Client-Platform': 'web',
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
    'device-uuid': deviceUuid,
    'Origin': 'https://app.monarchmoney.com',
    'x-cio-client-platform': 'web',
    'x-cio-site-id': '2598be4aa410159198b2',
    'x-gist-user-anonymous': 'false'
  }

  // Try different methods to get CAPTCHA
  const attempts = [
    { method: 'POST', endpoint: '/auth/captcha/', body: {} },
    { method: 'POST', endpoint: '/auth/captcha/', body: { action: 'get_challenge' } },
    { method: 'GET', endpoint: '/auth/captcha/', body: null },
    { method: 'POST', endpoint: '/auth/captcha/challenge/', body: {} },
    { method: 'GET', endpoint: '/auth/captcha/challenge/', body: null },
  ]

  for (const attempt of attempts) {
    try {
      console.log(`\n📤 Trying ${attempt.method} ${attempt.endpoint}`)
      
      const options = {
        method: attempt.method,
        headers
      }

      if (attempt.body !== null) {
        options.body = JSON.stringify(attempt.body)
        console.log(`   Body: ${JSON.stringify(attempt.body)}`)
      }

      const response = await fetch(`${baseUrl}${attempt.endpoint}`, options)
      
      console.log(`📥 Response: ${response.status} ${response.statusText}`)
      
      if (response.status !== 404 && response.status !== 405) {
        console.log('   Headers:')
        for (const [key, value] of response.headers.entries()) {
          console.log(`     ${key}: ${value}`)
        }
        
        const text = await response.text()
        console.log(`   Body: ${text}`)
        
        try {
          const json = JSON.parse(text)
          console.log('   Parsed JSON:')
          console.log(JSON.stringify(json, null, 4))
          
          // Check if this contains CAPTCHA challenge data
          if (json.challenge || json.image || json.captcha_url || json.token) {
            console.log('🎯 Found CAPTCHA challenge data!')
            return json
          }
        } catch (e) {
          console.log('   Response is not JSON')
        }
      }
    } catch (error) {
      console.log(`   Error: ${error.message}`)
    }
  }

  console.log('\n❌ No CAPTCHA challenge endpoint found')
  return null
}

async function testCaptchaSolving() {
  console.log('🧪 Testing CAPTCHA solving workflow...')
  
  const challenge = await getCaptchaChallenge()
  
  if (!challenge) {
    console.log('⚠️ No CAPTCHA challenge available, trying alternative approach...')
    
    // Maybe the CAPTCHA is embedded in the normal login response
    console.log('\n🔄 Checking if CAPTCHA data is in failed login response...')
    
    const baseUrl = 'https://api.monarchmoney.com'
    const deviceUuid = generateDeviceUUID()
    
    try {
      const loginData = {
        username: process.env.MONARCH_EMAIL,
        password: process.env.MONARCH_PASSWORD,
        trusted_device: true,
        supports_mfa: true,
        supports_email_otp: true,
        supports_recaptcha: true,
        request_captcha_challenge: true  // Try requesting challenge
      }

      const response = await fetch(`${baseUrl}/auth/login/`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Client-Platform': 'web',
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
          'device-uuid': deviceUuid,
          'Origin': 'https://app.monarchmoney.com',
          'x-cio-client-platform': 'web',
          'x-cio-site-id': '2598be4aa410159198b2',
          'x-gist-user-anonymous': 'false'
        },
        body: JSON.stringify(loginData)
      })

      const text = await response.text()
      console.log(`Response: ${response.status} ${response.statusText}`)
      console.log(`Body: ${text}`)

      try {
        const json = JSON.parse(text)
        if (json.captcha_challenge || json.challenge_url || json.recaptcha_site_key) {
          console.log('🎯 Found CAPTCHA challenge in login response!')
          return json
        }
      } catch (e) {
        // Response not JSON
      }
    } catch (error) {
      console.log(`Error: ${error.message}`)
    }
  }

  console.log('\n❓ CAPTCHA implementation may require web browser interaction')
  console.log('💡 Possible solutions:')
  console.log('   1. Use a headless browser (Puppeteer/Playwright) to solve CAPTCHA')
  console.log('   2. Implement manual CAPTCHA solving with user input')
  console.log('   3. Use CAPTCHA solving services')
  console.log('   4. Request user to login via web first to clear CAPTCHA')
}

testCaptchaSolving().catch(console.error)