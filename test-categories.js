#!/usr/bin/env node

// Test the new categories API
const { MonarchClient } = require('./dist/cjs/index.js')
require('dotenv/config')

async function testCategoriesAPI() {
  console.log('🏷️ Testing MonarchMoney Categories API...')
  
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
    
    // Test categories API
    console.log('🏷️ Testing categories API...')
    
    // Get all categories
    const categories = await client.categories.getCategories()
    console.log(`✅ Found ${categories.length} categories`)
    
    if (categories.length > 0) {
      console.log('📋 First few categories:')
      categories.slice(0, 3).forEach((category, index) => {
        console.log(`  ${index + 1}. ${category.name} (${category.displayName || 'N/A'})`)
        console.log(`     - ID: ${category.id}`)
        console.log(`     - Group: ${category.group?.name || 'N/A'}`)
        console.log(`     - Color: ${category.color || 'N/A'}`)
      })
    }
    
    // Get category groups
    console.log('\n📂 Testing category groups...')
    const groups = await client.categories.getCategoryGroups()
    console.log(`✅ Found ${groups.length} category groups`)
    
    if (groups.length > 0) {
      console.log('📂 Category groups:')
      groups.slice(0, 3).forEach((group, index) => {
        console.log(`  ${index + 1}. ${group.name} (${group.displayName || 'N/A'})`)
        console.log(`     - ID: ${group.id}`)
        console.log(`     - Categories: ${group.categories?.length || 0}`)
      })
    }
    
    // Get tags
    console.log('\n🏷️ Testing tags...')
    const tags = await client.categories.getTags()
    console.log(`✅ Found ${tags.length} tags`)
    
    if (tags.length > 0) {
      console.log('🏷️ Tags:')
      tags.slice(0, 3).forEach((tag, index) => {
        console.log(`  ${index + 1}. ${tag.name}`)
        console.log(`     - ID: ${tag.id}`)
        console.log(`     - Color: ${tag.color || 'N/A'}`)
      })
    }

    console.log('\n🎉 Categories API tests completed successfully!')

  } catch (error) {
    console.error('❌ Categories API test failed:', error.message)
    console.error('Error code:', error.code)
    console.error('Error type:', error.constructor.name)
    
    if (error.stack) {
      console.error('Stack trace:', error.stack)
    }
    process.exit(1)
  }
}

testCategoriesAPI().then(() => {
  console.log('\n🏁 Categories API test completed successfully!')
}).catch(error => {
  console.error('💥 Categories API test failed:', error)
  process.exit(1)
})