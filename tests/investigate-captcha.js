#!/usr/bin/env node

// Investigate CAPTCHA implementation
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

async function investigateCaptcha() {
  console.log('🕵️ Investigating MonarchMoney CAPTCHA implementation...')
  
  const baseUrl = 'https://api.monarchmoney.com'
  const deviceUuid = generateDeviceUUID()

  // 1. Try to get CAPTCHA challenge without authentication
  console.log('\n1. Checking for CAPTCHA endpoint...')
  
  const endpoints = [
    '/captcha/',
    '/captcha/challenge/',
    '/auth/captcha/',
    '/auth/captcha/challenge/',
    '/recaptcha/',
    '/hcaptcha/'
  ]

  for (const endpoint of endpoints) {
    try {
      console.log(`  Trying: ${baseUrl}${endpoint}`)
      const response = await fetch(`${baseUrl}${endpoint}`)
      console.log(`    Status: ${response.status}`)
      if (response.status !== 404) {
        const text = await response.text()
        console.log(`    Body preview: ${text.substring(0, 200)}...`)
      }
    } catch (error) {
      console.log(`    Error: ${error.message}`)
    }
  }

  // 2. Check if login endpoint provides CAPTCHA details on OPTIONS request
  console.log('\n2. Checking login endpoint with OPTIONS...')
  try {
    const response = await fetch(`${baseUrl}/auth/login/`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://app.monarchmoney.com',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    })
    console.log(`  Status: ${response.status}`)
    console.log('  Headers:')
    for (const [key, value] of response.headers.entries()) {
      console.log(`    ${key}: ${value}`)
    }
  } catch (error) {
    console.log(`  Error: ${error.message}`)
  }

  // 3. Make a failed login attempt to see if we get CAPTCHA challenge details
  console.log('\n3. Making failed login to trigger CAPTCHA response...')
  try {
    const loginData = {
      username: 'fake@example.com',
      password: 'fake-password',
      trusted_device: true,
      supports_mfa: true,
      supports_email_otp: true,
      supports_recaptcha: true
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

    console.log(`  Status: ${response.status}`)
    const text = await response.text()
    console.log(`  Response: ${text}`)

    // Check if it's JSON and contains CAPTCHA details
    try {
      const json = JSON.parse(text)
      console.log('  Parsed JSON:')
      console.log(JSON.stringify(json, null, 2))
      
      if (json.captcha_url || json.recaptcha_site_key || json.hcaptcha_site_key) {
        console.log('🎯 Found CAPTCHA configuration!')
      }
    } catch (e) {
      console.log('  Response is not JSON')
    }

  } catch (error) {
    console.log(`  Error: ${error.message}`)
  }

  // 4. Check the main web app to see what CAPTCHA service they use
  console.log('\n4. Checking main web app for CAPTCHA implementation...')
  try {
    const response = await fetch('https://app.monarchmoney.com/login')
    console.log(`  Status: ${response.status}`)
    const html = await response.text()
    
    // Look for common CAPTCHA patterns
    const captchaPatterns = [
      /recaptcha/gi,
      /hcaptcha/gi,
      /cf-turnstile/gi,
      /captcha/gi,
      /sitekey/gi,
      /data-sitekey/gi
    ]

    console.log('  Searching for CAPTCHA patterns in HTML...')
    for (const pattern of captchaPatterns) {
      const matches = html.match(pattern)
      if (matches) {
        console.log(`    Found ${pattern}: ${matches.length} matches`)
      }
    }

    // Extract potential site keys
    const siteKeyPattern = /(?:data-sitekey|sitekey)=["']([^"']+)["']/gi
    const siteKeyMatches = [...html.matchAll(siteKeyPattern)]
    if (siteKeyMatches.length > 0) {
      console.log('  🔑 Found site keys:')
      siteKeyMatches.forEach(match => console.log(`    ${match[1]}`))
    }

  } catch (error) {
    console.log(`  Error: ${error.message}`)
  }

  console.log('\n🏁 Investigation complete!')
}

investigateCaptcha().catch(console.error)