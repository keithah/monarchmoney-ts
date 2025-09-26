// Schema Discovery Test Script
// Run this to discover the GraphQL schema through systematic fuzzing

import { MonarchClient } from '../client/MonarchClient'
import { SchemaDiscoveryRunner } from '../client/graphql/schema-discovery'
import * as operations from '../client/graphql/operations'
import * as fs from 'fs'
import * as path from 'path'

async function runSchemaDiscovery() {
  console.log('🔐 Authenticating with Monarch Money...')

  // Initialize client
  const client = new MonarchClient({
    timeout: 30000,
    enablePersistentCache: false // Disable cache for discovery
  })

  try {
    // Authenticate (you'll need to set these env vars or modify for your auth method)
    await client.login({
      email: process.env.MONARCH_EMAIL!,
      password: process.env.MONARCH_PASSWORD!,
      mfaSecretKey: process.env.MONARCH_MFA_SECRET
    })

    console.log('✅ Authentication successful')

    // Start discovery
    const discoveryRunner = new SchemaDiscoveryRunner(client.getGraphQLClient())

    // Convert operations to a more usable format
    const existingQueries: Record<string, string> = {}
    for (const [key, value] of Object.entries(operations)) {
      if (typeof value === 'string' && value.includes('query')) {
        existingQueries[key] = value
      }
    }

    console.log(`📚 Starting discovery with ${Object.keys(existingQueries).length} existing queries`)

    const results = await discoveryRunner.runFullDiscovery(existingQueries)

    // Save results to file
    const outputDir = path.join(process.cwd(), 'discovery-results')
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const outputFile = path.join(outputDir, `schema-discovery-${timestamp}.json`)

    fs.writeFileSync(outputFile, JSON.stringify(results, null, 2))

    console.log(`💾 Results saved to: ${outputFile}`)

    // Generate summary report
    generateSummaryReport(results, outputDir, timestamp)

  } catch (error) {
    console.error('❌ Discovery failed:', error)
  }
}

function generateSummaryReport(results: any, outputDir: string, timestamp: string) {
  const reportFile = path.join(outputDir, `discovery-report-${timestamp}.md`)

  let report = `# GraphQL Schema Discovery Report\n\n`
  report += `Generated: ${new Date().toISOString()}\n\n`

  report += `## Summary\n\n`
  report += `- **Types Discovered**: ${results.summary.totalTypes}\n`
  report += `- **Fields Discovered**: ${results.summary.totalFields}\n`
  report += `- **Queries Discovered**: ${results.summary.totalQueries}\n`
  report += `- **Mutations Discovered**: ${results.summary.totalMutations}\n\n`

  report += `## Discovered Types\n\n`

  for (const [typeName, typeData] of Object.entries(results.types)) {
    const type = typeData as any
    report += `### ${typeName}\n\n`

    if (type.fields && type.fields.length > 0) {
      report += `**Fields (${type.fields.length}):**\n\n`
      for (const field of type.fields) {
        const status = field.exists ? '✅' : '❌'
        const errorInfo = field.errorMessage ? ` (${field.errorMessage.substring(0, 50)}...)` : ''
        report += `- ${status} \`${field.fieldName}\`${errorInfo}\n`
      }
      report += '\n'
    }

    if (type.queries && type.queries.length > 0) {
      report += `**Queries:**\n`
      type.queries.forEach((q: string) => report += `- ${q}\n`)
      report += '\n'
    }

    if (type.mutations && type.mutations.length > 0) {
      report += `**Mutations:**\n`
      type.mutations.forEach((m: string) => report += `- ${m}\n`)
      report += '\n'
    }
  }

  report += `## Optimization Recommendations\n\n`
  report += `Based on the discovery, here are the recommended field combinations for MCP:\n\n`

  // Generate optimized queries based on discovered fields
  report += generateOptimizedQueries(results)

  fs.writeFileSync(reportFile, report)
  console.log(`📋 Summary report saved to: ${reportFile}`)
}

function generateOptimizedQueries(results: any): string {
  let queries = ''

  // For each type, suggest minimal and extended field sets
  for (const [typeName, typeData] of Object.entries(results.types)) {
    const type = typeData as any
    const existingFields = type.fields.filter((f: any) => f.exists).map((f: any) => f.fieldName)

    if (existingFields.length === 0) continue

    queries += `### ${typeName} Queries\n\n`

    // Minimal query (core fields only)
    const coreFields = existingFields.filter((f: string) =>
      ['id', 'name', 'displayName', 'amount', 'date', 'currentBalance'].includes(f)
    ).slice(0, 5)

    if (coreFields.length > 0) {
      queries += `**Minimal ${typeName}:**\n`
      queries += '```graphql\n'
      queries += `{\n  ${coreFields.join('\n  ')}\n}\n`
      queries += '```\n\n'
    }

    // Extended query (useful fields)
    const usefulFields = existingFields.filter((f: string) =>
      !['attachments', 'holdings', 'transactions'].includes(f) // Exclude heavy fields
    ).slice(0, 10)

    if (usefulFields.length > coreFields.length) {
      queries += `**Extended ${typeName}:**\n`
      queries += '```graphql\n'
      queries += `{\n  ${usefulFields.join('\n  ')}\n}\n`
      queries += '```\n\n'
    }
  }

  return queries
}

// Alternative discovery methods
export class AlternativeDiscovery {

  // Try to discover through error message analysis
  static async discoverThroughErrors(client: any): Promise<string[]> {
    const discoveries: string[] = []

    // Test common field patterns that might give us useful error messages
    const testPatterns = [
      'query { __schema }', // Try introspection anyway
      'query { accounts { unknownField } }', // See what error we get
      'query { transactions { invalidField } }', // Field suggestion in error?
    ]

    for (const pattern of testPatterns) {
      try {
        await client.query(pattern)
      } catch (error: any) {
        const message = error.message || error.toString()
        discoveries.push(`Pattern: ${pattern} -> Error: ${message}`)
      }
    }

    return discoveries
  }

  // Analyze response headers for hints
  static async analyzeResponseHeaders(_client: any): Promise<Record<string, string>> {
    return {
      // This would need to be implemented in the GraphQL client to capture headers
      serverInfo: 'GraphQL response headers analysis not implemented'
    }
  }

  // Try batch queries to discover field relationships
  static async discoverFieldRelationships(client: any): Promise<Record<string, string[]>> {
    const relationships: Record<string, string[]> = {}

    // Test known relationships
    const relationshipTests = [
      { parent: 'transaction', child: 'category' },
      { parent: 'transaction', child: 'account' },
      { parent: 'transaction', child: 'merchant' },
      { parent: 'account', child: 'institution' },
      { parent: 'account', child: 'type' }
    ]

    for (const test of relationshipTests) {
      try {
        const query = `query { ${test.parent}s { ${test.child} { id } } }`
        await client.query(query)

        if (!relationships[test.parent]) {
          relationships[test.parent] = []
        }
        relationships[test.parent].push(test.child)
      } catch (error) {
        // Relationship doesn't exist or needs different structure
      }
    }

    return relationships
  }
}

// Run if called directly
if (require.main === module) {
  runSchemaDiscovery().catch(console.error)
}

export { runSchemaDiscovery }