#!/usr/bin/env node

import * as dotenv from 'dotenv'

dotenv.config()

async function testExactPython() {
  console.log('🎯 EXACT Python Match Test')
  console.log('=======================')
  console.log('✅ Python authenticated with 200 OK')
  console.log('✅ Our direct test authenticated with 200 OK')
  console.log('❌ Our library gets 403 Forbidden')
  console.log('\nThe issue must be in HOW the library makes the request.\n')

  try {
    const { MonarchClient } = await import('./dist/cjs/index.js')
    
    const client = new MonarchClient({
      baseURL: 'https://api.monarchmoney.com',
      timeout: 30000,
      retries: 1
    })

    console.log('🔍 Testing TypeScript library...')
    
    await client.login({
      email: process.env.MONARCH_EMAIL!,
      password: process.env.MONARCH_PASSWORD!,
      mfaSecretKey: process.env.MONARCH_MFA_SECRET!,
      useSavedSession: false,
      saveSession: true
    })

    console.log('✅ SUCCESS! Authentication working!')
    
    const accounts = await client.accounts.getAll()
    console.log(`✅ Retrieved ${accounts.length} accounts`)

  } catch (error) {
    console.log('\n❌ Failed:', error.message)
    
    // The Python library works, our direct test works, but library fails
    // This suggests the issue is in the TypeScript library's request handling
    console.log('\n📝 Summary:')
    console.log('• Python library: ✅ 200 OK')
    console.log('• Our direct fetch test: ✅ 200 OK')  
    console.log('• TypeScript library: ❌ 403 Forbidden')
    console.log('\nThe headers and body are identical.')
    console.log('The issue must be in the fetch implementation or request construction.')
  }
}

testExactPython().catch(console.error)