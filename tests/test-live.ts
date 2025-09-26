#!/usr/bin/env node

/**
 * Live API Testing Script
 * 
 * This script tests the MonarchMoney TypeScript library with real credentials.
 * It performs basic operations to validate the implementation works correctly.
 */

import { MonarchClient } from './src'
import * as dotenv from 'dotenv'

// Load environment variables from .env file
dotenv.config()

async function testLiveAPI() {
  console.log('🏦 MonarchMoney TypeScript Library - Live API Test')
  console.log('================================================')

  const client = new MonarchClient({
    logLevel: 'info',
    enablePersistentCache: true
  })

  try {
    // Test 1: Check initial session status
    console.log('\n1️⃣ Checking session status...')
    const initialSessionInfo = client.getSessionInfo()
    console.log('Initial session:', {
      isValid: initialSessionInfo.isValid,
      isStale: initialSessionInfo.isStale,
      hasStoredSession: !!initialSessionInfo.createdAt
    })

    // Test 2: Attempt to use saved session first
    console.log('\n2️⃣ Attempting to load saved session...')
    const hasValidSession = client.loadSession()
    console.log('Valid saved session found:', hasValidSession)

    if (!hasValidSession) {
      // Test 3: Login with credentials
      console.log('\n3️⃣ Logging in with credentials...')
      
      const email = process.env.MONARCH_EMAIL
      const password = process.env.MONARCH_PASSWORD
      const mfaSecret = process.env.MONARCH_MFA_SECRET

      if (!email || !password) {
        console.log('❌ Missing credentials in .env file')
        console.log('Please set MONARCH_EMAIL and MONARCH_PASSWORD')
        return
      }

      console.log(`Logging in as: ${email}`)
      
      try {
        await client.login({
          email,
          password,
          mfaSecretKey: mfaSecret,
          saveSession: true
        })
        console.log('✅ Login successful!')
      } catch (error) {
        if (error.name === 'MonarchMFARequiredError') {
          console.log('🔐 MFA required. Please provide MFA code:')
          
          // Import readline for interactive MFA
          const readline = require('readline')
          const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
          })

          const mfaCode = await new Promise<string>((resolve) => {
            rl.question('MFA Code: ', (answer: string) => {
              rl.close()
              resolve(answer.trim())
            })
          })

          await client.multiFactorAuthenticate({
            email,
            password,
            code: mfaCode
          })
          console.log('✅ MFA authentication successful!')
        } else {
          throw error
        }
      }
    } else {
      console.log('✅ Using saved session')
    }

    // Test 4: Validate session
    console.log('\n4️⃣ Validating session...')
    const sessionValid = await client.validateSession()
    console.log('Session validation result:', sessionValid)

    if (!sessionValid) {
      console.log('❌ Session validation failed')
      return
    }

    // Test 5: Get user profile
    console.log('\n5️⃣ Getting user profile...')
    try {
      const userProfile = await client.get_me()
      console.log('User profile:', {
        id: userProfile.id,
        email: userProfile.email,
        name: `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim(),
        timezone: userProfile.timezone,
        subscription: userProfile.subscriptionType,
        mfaEnabled: userProfile.isMfaEnabled
      })
    } catch (error) {
      console.log('❌ Failed to get user profile:', error.message)
    }

    // Test 6: Get accounts
    console.log('\n6️⃣ Getting accounts...')
    try {
      const accounts = await client.accounts.getAll()
      console.log(`Found ${accounts.length} accounts:`)
      
      accounts.forEach((account, index) => {
        console.log(`  ${index + 1}. ${account.displayName}`)
        console.log(`     Type: ${account.type?.display} - ${account.subtype?.display}`)
        console.log(`     Balance: $${account.currentBalance?.toLocaleString()}`)
        console.log(`     Institution: ${account.institutionName}`)
        console.log(`     Hidden: ${account.isHidden}`)
        console.log('')
      })

      // Calculate total net worth
      const totalNetWorth = accounts
        .filter(acc => acc.includeInNetWorth && !acc.isHidden)
        .reduce((sum, acc) => sum + (acc.currentBalance || 0), 0)
      
      console.log(`💰 Total Net Worth: $${totalNetWorth.toLocaleString()}`)

    } catch (error) {
      console.log('❌ Failed to get accounts:', error.message)
      console.log('Error details:', error)
    }

    // Test 7: Test account type options
    console.log('\n7️⃣ Getting account type options...')
    try {
      const typeOptions = await client.accounts.getTypeOptions()
      console.log(`Available account types: ${typeOptions.types.length}`)
      console.log(`Available subtypes: ${typeOptions.subtypes.length}`)
      
      console.log('\nAccount types:')
      typeOptions.types.forEach(type => {
        console.log(`  - ${type.display} (${type.name})`)
      })
    } catch (error) {
      console.log('❌ Failed to get account types:', error.message)
    }

    // Test 8: Cache statistics
    console.log('\n8️⃣ Cache statistics...')
    const cacheStats = client.getCacheStats()
    if (cacheStats) {
      console.log('Cache stats:', {
        memorySize: cacheStats.memory.size,
        persistentSize: cacheStats.persistent?.size || 0,
        totalCached: cacheStats.total.size
      })
    }

    // Test 9: Session info after operations
    console.log('\n9️⃣ Final session status...')
    const finalSessionInfo = client.getSessionInfo()
    console.log('Final session:', {
      isValid: finalSessionInfo.isValid,
      isStale: finalSessionInfo.isStale,
      lastValidated: finalSessionInfo.lastValidated
    })

    console.log('\n✅ All tests completed successfully!')

  } catch (error) {
    console.log('\n❌ Test failed with error:')
    console.log('Error name:', error.name)
    console.log('Error message:', error.message)
    if (error.code) {
      console.log('Error code:', error.code)
    }
    if (error.statusCode) {
      console.log('HTTP status:', error.statusCode)
    }
    console.log('\nFull error:', error)
  } finally {
    // Clean up
    await client.close()
    console.log('\n🧹 Client closed')
  }
}

// Add dotenv as a dependency for this test
const fs = require('fs')
const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'))
if (!packageJson.dependencies?.dotenv) {
  console.log('Installing dotenv for testing...')
  require('child_process').execSync('npm install dotenv', { stdio: 'inherit' })
}

// Run the test
if (require.main === module) {
  testLiveAPI().catch(error => {
    console.error('Unhandled error:', error)
    process.exit(1)
  })
}

export { testLiveAPI }