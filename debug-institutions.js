#!/usr/bin/env node

// Debug script to test institutions queries
const { MonarchClient } = require('./dist/cjs/index.js')
require('dotenv/config')

async function debugInstitutions() {
  console.log('🐛 Debugging Institutions API...')
  
  const client = new MonarchClient({
    baseURL: 'https://api.monarchmoney.com',
    timeout: 30000
  })

  try {
    console.log('🔑 Using existing session...')
    
    // Test 1: Direct GraphQL query for GetInstitutions (from Python library)
    console.log('\n1. Testing GetInstitutions query directly...')
    try {
      const query1 = `
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
      `
      
      const result1 = await client.graphql.query(query1)
      console.log(`✅ GetInstitutions: Found ${result1.institutions.length} institutions`)
      if (result1.institutions.length > 0) {
        console.log(`   Sample: ${result1.institutions[0].name}`)
      }
    } catch (error) {
      console.log(`❌ GetInstitutions failed: ${error.message}`)
      console.log('Error details:', error)
    }

    // Test 2: Direct GraphQL query for Web_GetInstitutionSettings
    console.log('\n2. Testing Web_GetInstitutionSettings query directly...')
    try {
      const query2 = `
        query Web_GetInstitutionSettings {
          credentials {
            id
            updateRequired
            disconnectedFromDataProviderAt
            displayLastUpdatedAt
            dataProvider
            institution {
              id
              name
              url
              logoUrl
              primaryColor
              hasIssuesReported
              hasIssuesReportedMessage
              status
              balanceStatus
              transactionsStatus
              __typename
            }
            __typename
          }
          subscription {
            isOnFreeTrial
            hasPremiumEntitlement
            __typename
          }
        }
      `
      
      const result2 = await client.graphql.query(query2)
      console.log(`✅ Web_GetInstitutionSettings: Found ${result2.credentials.length} credentials`)
    } catch (error) {
      console.log(`❌ Web_GetInstitutionSettings failed: ${error.message}`)
      console.log('Error details:', error)
    }

    // Test 3: Simpler query to find what works
    console.log('\n3. Testing minimal query to identify issue...')
    try {
      const query3 = `
        query {
          credentials {
            id
            __typename
          }
        }
      `
      
      const result3 = await client.graphql.query(query3)
      console.log(`✅ Simple credentials query: Found ${result3.credentials.length} credentials`)
    } catch (error) {
      console.log(`❌ Simple credentials query failed: ${error.message}`)
      console.log('Error details:', error)
    }

  } catch (error) {
    console.error('💥 Debug failed:', error.message)
  }
}

debugInstitutions().then(() => {
  console.log('\n🏁 Debug completed!')
}).catch(error => {
  console.error('💥 Debug failed:', error)
  process.exit(1)
})