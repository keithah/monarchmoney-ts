#!/usr/bin/env node

// Test categories API directly with working Python query
const { MonarchClient } = require('./dist/cjs/index.js')
require('dotenv/config')

async function testCategoriesDirect() {
  console.log('🏷️ Testing Categories API with direct Python query...')
  
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
    
    // Test direct categories query from Python library
    console.log('\n🏷️ Testing direct categories query...')
    try {
      const result = await client.gqlCall('GetCategories', `
        query GetCategories {
          categories {
            id
            name
            order
            icon
            isSystemCategory
            isDisabled
            group {
              id
              name
              type
              __typename
            }
            __typename
          }
        }
      `)
      console.log('✅ Categories query successful!')
      console.log(`Found ${result.categories?.length || 0} categories`)
      
      if (result.categories?.length > 0) {
        console.log('📋 First few categories:')
        result.categories.slice(0, 3).forEach((category, index) => {
          console.log(`  ${index + 1}. ${category.name} (${category.group?.name || 'No Group'})`)
          console.log(`     - ID: ${category.id}`)
          console.log(`     - Icon: ${category.icon || 'None'}`)
          console.log(`     - System: ${category.isSystemCategory}`)
        })
      }
    } catch (error) {
      console.log('❌ Categories query failed:', error.message)
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.error('Error code:', error.code)
    console.error('Error type:', error.constructor.name)
    process.exit(1)
  }
}

testCategoriesDirect().then(() => {
  console.log('\n🏁 Direct categories test completed!')
}).catch(error => {
  console.error('💥 Direct categories test failed:', error)
  process.exit(1)
})