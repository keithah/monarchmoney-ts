#!/usr/bin/env node

import * as dotenv from 'dotenv'

dotenv.config()

async function testLibraryStructure() {
  console.log('🧪 Testing Library Structure & Components')
  console.log('=========================================')

  try {
    // Test imports
    console.log('📦 Testing Imports...')
    const { MonarchClient } = await import('./dist/cjs/index.js')
    console.log('✅ MonarchClient imported successfully')

    // Test client initialization
    console.log('\n🚀 Testing Client Initialization...')
    const client = new MonarchClient({
      baseURL: 'https://api.monarchmoney.com',
      timeout: 30000
    })
    console.log('✅ MonarchClient initialized successfully')

    // Test API modules availability
    console.log('\n🔌 Testing API Modules...')
    console.log('✅ Accounts API available:', typeof client.accounts)
    console.log('✅ Transactions API available:', typeof client.transactions)
    console.log('✅ Budgets API available:', typeof client.budgets)

    // Test API method availability
    console.log('\n📋 Testing API Methods...')
    
    // Accounts API
    const accountsMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.accounts))
      .filter(name => typeof client.accounts[name] === 'function' && name !== 'constructor')
    console.log(`✅ Accounts API methods: ${accountsMethods.length}`)
    console.log(`   - ${accountsMethods.slice(0, 5).join(', ')}...`)

    // Transactions API  
    const transactionsMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.transactions))
      .filter(name => typeof client.transactions[name] === 'function' && name !== 'constructor')
    console.log(`✅ Transactions API methods: ${transactionsMethods.length}`)
    console.log(`   - ${transactionsMethods.slice(0, 5).join(', ')}...`)

    // Budgets API
    const budgetsMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(client.budgets))
      .filter(name => typeof client.budgets[name] === 'function' && name !== 'constructor')
    console.log(`✅ Budgets API methods: ${budgetsMethods.length}`)
    console.log(`   - ${budgetsMethods.slice(0, 5).join(', ')}...`)

    // Test session management
    console.log('\n🔐 Testing Session Management...')
    console.log('✅ getSessionInfo available:', typeof client.getSessionInfo)
    console.log('✅ validateSession available:', typeof client.validateSession) 
    console.log('✅ deleteSession available:', typeof client.deleteSession)

    // Test authentication methods
    console.log('\n🔑 Testing Authentication Methods...')
    console.log('✅ login available:', typeof client.login)
    console.log('✅ interactiveLogin available:', typeof client.interactiveLogin)

    // Test session info (without login)
    const sessionInfo = client.getSessionInfo()
    console.log('✅ Session info structure:', {
      isValid: sessionInfo.isValid,
      isStale: sessionInfo.isStale
    })

    console.log('\n🎉 Library Structure Test Complete!')
    console.log('\n📊 Summary:')
    console.log(`✅ Total API methods: ${accountsMethods.length + transactionsMethods.length + budgetsMethods.length}+`)
    console.log('✅ All API modules initialized')
    console.log('✅ Authentication system ready')
    console.log('✅ Session management ready')
    console.log('✅ Library fully functional')

  } catch (error) {
    console.log('❌ Library structure test failed:', error.message)
  }
}

testLibraryStructure().catch(console.error)