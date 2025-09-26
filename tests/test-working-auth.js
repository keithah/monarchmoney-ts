#!/usr/bin/env node

// Test the working authentication approach from our debug script
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

async function testWorkingAuth() {
  console.log('🎯 Testing working authentication approach...')
  
  if (!process.env.MONARCH_EMAIL || !process.env.MONARCH_PASSWORD || !process.env.MONARCH_MFA_SECRET) {
    console.error('❌ Missing credentials in .env file')
    process.exit(1)
  }

  const baseUrl = 'https://api.monarchmoney.com'
  const deviceUuid = generateDeviceUUID()
  
  // Generate MFA code
  const mfaCode = totp.authenticator.generate(process.env.MONARCH_MFA_SECRET)
  console.log('🔑 Generated TOTP code:', mfaCode)

  const loginData = {
    username: process.env.MONARCH_EMAIL,
    password: process.env.MONARCH_PASSWORD,
    trusted_device: true,
    supports_mfa: true,
    supports_email_otp: true,
    supports_recaptcha: true,
    totp: mfaCode
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

  try {
    console.log('🌐 Making authentication request...')
    
    const response = await fetch(`${baseUrl}/auth/login/`, {
      method: 'POST',
      headers,
      body: JSON.stringify(loginData)
    })

    console.log(`📥 Response: ${response.status} ${response.statusText}`)

    if (response.status === 200) {
      const data = await response.json()
      console.log('✅ Authentication successful!')
      console.log('📊 Login response:')
      console.log('  - Token:', data.token ? `${data.token.substring(0, 20)}...` : 'None')
      console.log('  - User ID:', data.id)
      console.log('  - Email:', data.email)
      console.log('  - Name:', data.name)

      // Test a GraphQL query with the token
      console.log('\n🔍 Testing GraphQL query with token...')
      
      const graphqlResponse = await fetch(`${baseUrl}/graphql`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${data.token}`,
          'Content-Type': 'application/json',
          'User-Agent': headers['User-Agent'],
          'Origin': 'https://app.monarchmoney.com'
        },
        body: JSON.stringify({
          query: `
            query GetAccounts {
              accounts {
                id
                displayName
                currentBalance
                type {
                  name
                }
              }
            }
          `
        })
      })

      console.log(`📥 GraphQL Response: ${graphqlResponse.status} ${graphqlResponse.statusText}`)
      
      if (graphqlResponse.status === 200) {
        const graphqlData = await graphqlResponse.json()
        console.log('✅ GraphQL query successful!')
        
        if (graphqlData.data && graphqlData.data.accounts) {
          console.log(`📋 Found ${graphqlData.data.accounts.length} accounts`)
          if (graphqlData.data.accounts.length > 0) {
            const account = graphqlData.data.accounts[0]
            console.log('  - First account:', account.displayName)
            console.log('  - Type:', account.type?.name || 'N/A')  
            console.log('  - Balance:', account.currentBalance)
          }
        } else {
          console.log('⚠️ No account data in response:', JSON.stringify(graphqlData, null, 2))
        }
      } else {
        const errorText = await graphqlResponse.text()
        console.error('❌ GraphQL query failed:', errorText)
      }

    } else {
      const errorText = await response.text()
      console.error(`❌ Authentication failed: ${response.status} ${response.statusText}`)
      console.error('Response:', errorText)
      
      try {
        const errorJson = JSON.parse(errorText)
        if (errorJson.You === 'Shall Not Pass') {
          console.log('🚫 IP is still blocked - wait longer or try from different IP')
        }
      } catch (e) {
        // Response not JSON
      }
    }

  } catch (error) {
    console.error('💥 Request failed:', error.message)
  }
}

testWorkingAuth().then(() => {
  console.log('\n🏁 Test completed!')
}).catch(error => {
  console.error('💥 Test failed:', error)
  process.exit(1)
})