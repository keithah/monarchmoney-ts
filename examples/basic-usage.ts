#!/usr/bin/env node

import { MonarchClient } from '../src'

async function basicExample() {
  // Create client
  const client = new MonarchClient({
    // Configuration can be provided here or via environment variables
    // email: 'your-email@example.com',
    // password: 'your-password',
    enablePersistentCache: true,
    logLevel: 'info'
  })

  try {
    console.log('🏦 MonarchMoney TypeScript Library - Basic Example')
    console.log('================================================')

    // Check session info
    const sessionInfo = client.getSessionInfo()
    console.log('Session Info:', sessionInfo)

    // For authentication, you would typically do:
    // await client.login({
    //   email: 'your-email@example.com',
    //   password: 'your-password'
    // })

    // Or for interactive login:
    // await client.interactiveLogin()

    console.log('✅ Client initialized successfully!')

    // Once authenticated, you can use the API:
    // const accounts = await client.accounts.getAll()
    // console.log('Accounts:', accounts)

    // Get version info
    const version = client.getVersion()
    console.log('Version:', version)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    // Clean up
    await client.close()
    console.log('🧹 Client closed')
  }
}

// Run if this file is executed directly
if (require.main === module) {
  basicExample().catch(console.error)
}

export { basicExample }