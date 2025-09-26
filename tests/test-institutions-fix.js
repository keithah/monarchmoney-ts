#!/usr/bin/env node

// Test fixed institutions API with Python schema
const { MonarchClient } = require('./dist/cjs/index.js')
require('dotenv/config')

async function testInstitutionsFix() {
  console.log('🏛️ Testing FIXED Institutions API...')
  
  if (!process.env.MONARCH_EMAIL || !process.env.MONARCH_PASSWORD || !process.env.MONARCH_MFA_SECRET) {
    console.error('❌ Missing credentials in .env file')
    process.exit(1)
  }

  const client = new MonarchClient({
    baseURL: 'https://api.monarchmoney.com',
    timeout: 30000,
    retries: 1
  })

  try {
    console.log('🔑 Authenticating...')
    
    await client.directLogin({
      email: process.env.MONARCH_EMAIL,
      password: process.env.MONARCH_PASSWORD,
      mfaSecretKey: process.env.MONARCH_MFA_SECRET,
      saveSession: false
    })

    console.log('✅ Authentication successful!')
    
    // Test FIXED institutions query from Python settings_service.py
    console.log('\n🏛️ Testing FIXED institutions query...')
    try {
      const result = await client.gqlCall('GetInstitutions', `
        query GetInstitutions {
          institutions {
            id
            name
            url
            logoUrl
            primaryColor
            __typename
          }
        }
      `)
      console.log('✅ Institutions query successful!')
      console.log(`Found ${result.institutions?.length || 0} institutions`)
      
      if (result.institutions?.length > 0) {
        console.log('🏛️ First few institutions:')
        result.institutions.slice(0, 3).forEach((institution, index) => {
          console.log(`  ${index + 1}. ${institution.name}`)
          console.log(`     - ID: ${institution.id}`)
          console.log(`     - URL: ${institution.url || 'None'}`)
          console.log(`     - Logo: ${institution.logoUrl || 'None'}`)
          console.log(`     - Color: ${institution.primaryColor || 'None'}`)
        })
      }
    } catch (error) {
      console.log('❌ Institutions query failed:', error.message)
      console.log('Error details:', error)
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.error('Error code:', error.code)
    console.error('Error type:', error.constructor.name)
    process.exit(1)
  }
}

testInstitutionsFix().then(() => {
  console.log('\n🏁 Fixed institutions test completed!')
}).catch(error => {
  console.error('💥 Fixed institutions test failed:', error)
  process.exit(1)
})