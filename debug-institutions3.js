#!/usr/bin/env node

// Debug script to see actual credential data structure
const { MonarchClient } = require('./dist/cjs/index.js')
require('dotenv/config')

async function debugCredentialData() {
  console.log('🐛 Debugging Actual Credential Data...')
  
  const client = new MonarchClient({
    baseURL: 'https://api.monarchmoney.com',
    timeout: 30000
  })

  try {
    console.log('🔑 Using existing session...')
    
    // Get actual credential data to inspect
    console.log('\n1. Getting full credential data...')
    try {
      const query = `
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
      
      const result = await client.graphql.query(query)
      console.log(`Found ${result.credentials.length} credentials`)
      
      // Inspect first few credentials
      for (let i = 0; i < Math.min(3, result.credentials.length); i++) {
        const cred = result.credentials[i]
        console.log(`\nCredential ${i + 1}:`)
        console.log(`  ID: ${cred.id}`)
        console.log(`  Data Provider: ${cred.dataProvider}`)
        console.log(`  Update Required: ${cred.updateRequired}`)
        console.log(`  Institution:`, cred.institution ? {
          id: cred.institution.id,
          name: cred.institution.name,
          url: cred.institution.url,
          logoUrl: cred.institution.logoUrl,
          primaryColor: cred.institution.primaryColor
        } : 'null')
      }
      
      // Count how many have institution data
      const withInstitution = result.credentials.filter(c => c.institution && c.institution.id)
      console.log(`\n${withInstitution.length}/${result.credentials.length} credentials have institution data`)
      
      if (withInstitution.length > 0) {
        // Extract unique institutions
        const institutions = new Map()
        withInstitution.forEach(cred => {
          institutions.set(cred.institution.id, cred.institution)
        })
        
        console.log(`Found ${institutions.size} unique institutions:`)
        Array.from(institutions.values()).slice(0, 5).forEach((inst, i) => {
          console.log(`  ${i + 1}. ${inst.name} (${inst.id})`)
        })
      }
      
    } catch (error) {
      console.log(`❌ Failed to get credential data: ${error.message}`)
      console.log('Error details:', error)
    }

  } catch (error) {
    console.error('💥 Debug failed:', error.message)
  }
}

debugCredentialData().then(() => {
  console.log('\n🏁 Credential data debug completed!')
}).catch(error => {
  console.error('💥 Debug failed:', error)
  process.exit(1)
})