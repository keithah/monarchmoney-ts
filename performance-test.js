#!/usr/bin/env node

const { MonarchClient } = require('./dist/cjs/client/MonarchClient')
const fs = require('fs')
const path = require('path')

async function performanceTest() {
  console.log('🚀 MonarchMoney TypeScript SDK - Performance Test')
  console.log('=' .repeat(60))

  // Load credentials
  const credentialsPath = path.join(process.env.HOME, '.config', 'monarchmoney', 'credentials.json')
  if (!fs.existsSync(credentialsPath)) {
    console.error('❌ No credentials found at:', credentialsPath)
    console.log('Please run authentication first or set up credentials')
    process.exit(1)
  }

  const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'))
  
  const client = new MonarchClient()

  try {
    console.log('🔑 Authenticating...')
    
    // Use saved session (no CAPTCHA!)
    await client.login({
      email: credentials.email,
      password: credentials.password,
      mfaSecretKey: credentials.mfaSecretKey,
      useSavedSession: true,
      saveSession: true
    })
    
    console.log('✅ Authentication successful')

    // Preload common queries
    console.log('\n📥 Preloading common queries...')
    const start = Date.now()
    await client.graphql.preloadCommonQueries()
    const preloadTime = Date.now() - start
    console.log(`✅ Preloading completed in ${preloadTime}ms`)

    // Performance test: Multiple concurrent requests
    console.log('\n🏎️  Running concurrent request performance test...')
    
    const startTime = Date.now()
    const promises = [
      // These should hit cache or be deduplicicated
      client.get_me(),
      client.get_me(), // Duplicate - should be deduplicated
      client.accounts.getAccounts(),
      client.categories.getCategories(),
      client.accounts.getAccounts(), // Duplicate - should hit cache
      client.categories.getCategories(), // Duplicate - should hit cache
      
      // These are unique queries
      client.transactions.getTransactions({ limit: 5 }),
      client.cashflow.getCashflowSummary({
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      }),
      client.institutions.getInstitutions()
    ]

    console.log(`Executing ${promises.length} concurrent requests...`)
    const results = await Promise.allSettled(promises)

    const endTime = Date.now()
    const totalTime = endTime - startTime

    // Analyze results
    const successful = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length

    console.log(`\n📊 Performance Test Results:`)
    console.log(`Total time: ${totalTime}ms`)
    console.log(`Successful requests: ${successful}/${promises.length}`)
    console.log(`Failed requests: ${failed}/${promises.length}`)
    console.log(`Average time per request: ${Math.round(totalTime / promises.length)}ms`)

    // Get performance statistics
    const perfStats = client.graphql.getPerformanceStats()
    console.log(`\n🔍 Performance Statistics:`)
    console.log(`Active requests: ${perfStats.requestStats.activeRequests}`)
    console.log(`Queued requests: ${perfStats.requestStats.queuedRequests}`)
    console.log(`Deduplicated requests: ${perfStats.requestStats.deduplicatedRequests}`)
    console.log(`Average request interval: ${perfStats.requestStats.averageRequestInterval}ms`)

    if (perfStats.cacheStats) {
      console.log(`\n💾 Cache Statistics:`)
      console.log(`Cache hits: ${perfStats.cacheStats.hits}`)
      console.log(`Cache misses: ${perfStats.cacheStats.misses}`)
      console.log(`Hit rate: ${(perfStats.cacheStats.hits / (perfStats.cacheStats.hits + perfStats.cacheStats.misses) * 100).toFixed(1)}%`)
      console.log(`Cache size: ${perfStats.cacheStats.size} entries`)
    }

    // Test request deduplication specifically
    console.log('\n🔄 Testing request deduplication...')
    const deduplicationStart = Date.now()
    
    // Fire off 5 identical requests simultaneously
    const identicalPromises = Array(5).fill().map(() => client.get_me())
    const identicalResults = await Promise.allSettled(identicalPromises)
    
    const deduplicationTime = Date.now() - deduplicationStart
    const deduplicationSuccessful = identicalResults.filter(r => r.status === 'fulfilled').length
    
    console.log(`Deduplication test: ${deduplicationSuccessful}/5 successful in ${deduplicationTime}ms`)
    console.log(`Expected: All requests should complete but only 1 actual HTTP request should be made`)

    // Test cache effectiveness
    console.log('\n💾 Testing cache effectiveness...')
    const cacheStart = Date.now()
    
    // First request (cache miss)
    await client.categories.getCategories()
    const firstRequestTime = Date.now() - cacheStart
    
    const secondCacheStart = Date.now()
    // Second request (should hit cache)
    await client.categories.getCategories()
    const secondRequestTime = Date.now() - secondCacheStart
    
    console.log(`First request (cache miss): ${firstRequestTime}ms`)
    console.log(`Second request (cache hit): ${secondRequestTime}ms`)
    console.log(`Cache speedup: ${Math.round((firstRequestTime / secondRequestTime) * 100) / 100}x`)

    console.log('\n✅ Performance test completed successfully!')
    
    // Show some actual data to verify functionality
    const userProfile = results[0].status === 'fulfilled' ? results[0].value : null
    if (userProfile) {
      console.log(`\n👤 User: ${userProfile.email} (${userProfile.displayName})`)
    }

    const accounts = results[2].status === 'fulfilled' ? results[2].value : []
    if (accounts && accounts.length > 0) {
      console.log(`💳 Found ${accounts.length} accounts`)
    }

    const categories = results[3].status === 'fulfilled' ? results[3].value : []
    if (categories && categories.length > 0) {
      console.log(`📁 Found ${categories.length} categories`)
    }

  } catch (error) {
    console.error('❌ Performance test failed:', error.message)
    if (error.code === 'MONARCH_CAPTCHA_REQUIRED') {
      console.log('\n💡 CAPTCHA required. Please:')
      console.log('1. Log in to https://app.monarchmoney.com in your browser')
      console.log('2. Complete the CAPTCHA challenge')
      console.log('3. Try running this test again')
    }
    process.exit(1)
  }
}

// Run the test
performanceTest().catch(error => {
  console.error('💥 Unexpected error:', error)
  process.exit(1)
})