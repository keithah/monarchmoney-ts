#!/usr/bin/env node

// Test simple credentials query to verify it works
const { MonarchClient } = require('./dist/cjs/index.js')
require('dotenv/config')

async function testSimpleCredentials() {
  console.log('🐛 Testing Simple Credentials Query...')
  
  const client = new MonarchClient({
    baseURL: 'https://api.monarchmoney.com',
    timeout: 30000
  })

  try {
    console.log('🔑 Using existing session...')
    
    // Test simple credentials query (this worked before)
    console.log('\n1. Testing basic credentials query...')
    try {
      const query1 = `
        query {
          credentials {
            id
            __typename
          }
        }
      `
      
      const result1 = await client.graphql.query(query1)
      console.log(`✅ Basic credentials: Found ${result1.credentials.length} credentials`)
    } catch (error) {
      console.log(`❌ Basic credentials failed: ${error.message}`)
    }

    // Test credentials with just institution id and name
    console.log('\n2. Testing credentials with minimal institution fields...')
    try {
      const query2 = `
        query {
          credentials {
            id
            institution {
              id
              name
              __typename
            }
            __typename
          }
        }
      `
      
      const result2 = await client.graphql.query(query2)
      console.log(`✅ Credentials with institution: Found ${result2.credentials.length} credentials`)
      
      // Count how many have institution data
      const withInstitution = result2.credentials.filter(c => c.institution && c.institution.id)
      console.log(`  ${withInstitution.length} credentials have institution data`)
      
      if (withInstitution.length > 0) {
        console.log(`  Sample: ${withInstitution[0].institution.name}`)
        
        // Extract unique institutions
        const institutions = new Map()
        withInstitution.forEach(cred => {
          institutions.set(cred.institution.id, cred.institution)
        })
        
        console.log(`  ${institutions.size} unique institutions`)
      }
    } catch (error) {
      console.log(`❌ Credentials with institution failed: ${error.message}`)
    }

  } catch (error) {
    console.error('💥 Test failed:', error.message)
  }
}

testSimpleCredentials().then(() => {
  console.log('\n🏁 Simple credentials test completed!')
}).catch(error => {
  console.error('💥 Test failed:', error)
  process.exit(1)
})