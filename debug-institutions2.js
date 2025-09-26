#!/usr/bin/env node

// Debug script to incrementally test which fields work
const { MonarchClient } = require('./dist/cjs/index.js')
require('dotenv/config')

async function debugInstitutionsFields() {
  console.log('🐛 Debugging Institutions API Fields...')
  
  const client = new MonarchClient({
    baseURL: 'https://api.monarchmoney.com',
    timeout: 30000
  })

  try {
    console.log('🔑 Using existing session...')
    
    // Test: Check if institutions field exists at all
    console.log('\n1. Testing if institutions field exists...')
    try {
      const query1 = `
        query {
          institutions {
            id
            __typename
          }
        }
      `
      
      const result1 = await client.graphql.query(query1)
      console.log(`✅ institutions field exists: Found ${result1.institutions.length} institutions`)
    } catch (error) {
      console.log(`❌ institutions field failed: ${error.message}`)
    }

    // Test: Check credentials with institution details
    console.log('\n2. Testing credentials with institution...')
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
      console.log(`✅ credentials with institution: Found ${result2.credentials.length} credentials`)
      if (result2.credentials.length > 0 && result2.credentials[0].institution) {
        console.log(`   Sample institution: ${result2.credentials[0].institution.name}`)
      }
    } catch (error) {
      console.log(`❌ credentials with institution failed: ${error.message}`)
    }

    // Test: Check what fields work on institution
    console.log('\n3. Testing institution fields one by one...')
    const fieldsToTest = ['id', 'name', 'url', 'logoUrl', 'primaryColor']
    
    for (const field of fieldsToTest) {
      try {
        const query = `
          query {
            credentials {
              id
              institution {
                id
                ${field}
                __typename
              }
              __typename
            }
          }
        `
        
        const result = await client.graphql.query(query)
        console.log(`✅ Field '${field}' works`)
      } catch (error) {
        console.log(`❌ Field '${field}' failed: ${error.message}`)
      }
    }

    // Test: Full working query for credentials->institution data
    console.log('\n4. Testing comprehensive working query...')
    try {
      const query4 = `
        query {
          credentials {
            id
            updateRequired
            displayLastUpdatedAt
            dataProvider
            institution {
              id
              name
              url
              logoUrl
              primaryColor
              __typename
            }
            __typename
          }
        }
      `
      
      const result4 = await client.graphql.query(query4)
      console.log(`✅ Comprehensive credentials query: Found ${result4.credentials.length} credentials`)
      
      // Extract unique institutions
      const institutions = new Map()
      result4.credentials.forEach(cred => {
        if (cred.institution) {
          institutions.set(cred.institution.id, cred.institution)
        }
      })
      
      console.log(`   Unique institutions: ${institutions.size}`)
      if (institutions.size > 0) {
        const first = Array.from(institutions.values())[0]
        console.log(`   Sample: ${first.name}`)
      }
      
    } catch (error) {
      console.log(`❌ Comprehensive credentials query failed: ${error.message}`)
    }

  } catch (error) {
    console.error('💥 Debug failed:', error.message)
  }
}

debugInstitutionsFields().then(() => {
  console.log('\n🏁 Field debug completed!')
}).catch(error => {
  console.error('💥 Debug failed:', error)
  process.exit(1)
})