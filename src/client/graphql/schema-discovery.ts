// GraphQL Schema Discovery and Fuzzing Utilities
// Since introspection is disabled, we'll discover the schema through systematic exploration

import { GraphQLClient } from './GraphQLClient'

export interface FieldDiscovery {
  fieldName: string
  type: 'scalar' | 'object' | 'array' | 'unknown'
  exists: boolean
  subFields?: string[]
  errorMessage?: string
}

export interface TypeDiscovery {
  typeName: string
  fields: FieldDiscovery[]
  mutations?: string[]
  queries?: string[]
}

export class SchemaFuzzer {
  private client: GraphQLClient
  private discoveredTypes = new Map<string, TypeDiscovery>()

  constructor(client: GraphQLClient) {
    this.client = client
  }

  // Fuzz a specific type by trying various field combinations
  async fuzzeType(typeName: string, knownFields: string[] = []): Promise<TypeDiscovery> {
    const typeDiscovery: TypeDiscovery = {
      typeName,
      fields: [],
      queries: [],
      mutations: []
    }

    // Start with known fields and common field names
    const fieldsToTest = [
      ...knownFields,
      ...this.getCommonFields(typeName),
      ...this.generateFieldVariations(typeName)
    ]

    console.log(`🔍 Fuzzing type: ${typeName} with ${fieldsToTest.length} potential fields`)

    // Test fields in batches to avoid overwhelming the server
    const batchSize = 5
    for (let i = 0; i < fieldsToTest.length; i += batchSize) {
      const batch = fieldsToTest.slice(i, i + batchSize)
      const results = await this.testFieldsBatch(typeName, batch)
      typeDiscovery.fields.push(...results)

      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    this.discoveredTypes.set(typeName, typeDiscovery)
    return typeDiscovery
  }

  // Test multiple fields at once to see which ones exist
  private async testFieldsBatch(typeName: string, fields: string[]): Promise<FieldDiscovery[]> {
    const results: FieldDiscovery[] = []

    // Test each field individually first
    for (const field of fields) {
      try {
        const query = this.buildTestQuery(typeName, [field])
        await this.client.query(query, {}, { cache: false })

        results.push({
          fieldName: field,
          type: 'unknown',
          exists: true
        })

        console.log(`✅ Found field: ${typeName}.${field}`)
      } catch (error: any) {
        const errorMessage = error.message || error.toString()

        // Analyze error to determine if field exists but has different structure
        if (this.isFieldExistsError(errorMessage)) {
          results.push({
            fieldName: field,
            type: 'unknown',
            exists: true,
            errorMessage
          })
          console.log(`⚠️  Field exists but needs args: ${typeName}.${field}`)
        } else if (this.isUnknownFieldError(errorMessage)) {
          results.push({
            fieldName: field,
            type: 'unknown',
            exists: false,
            errorMessage
          })
        } else {
          // Other error - might still be a valid field
          results.push({
            fieldName: field,
            type: 'unknown',
            exists: false,
            errorMessage
          })
        }
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 50))
    }

    return results
  }

  // Build a test query for field discovery
  private buildTestQuery(typeName: string, fields: string[]): string {
    const fieldsStr = fields.join('\n      ')

    // Different query patterns based on type
    if (typeName.toLowerCase() === 'transaction') {
      return `
        query TestFields {
          allTransactions {
            results(limit: 1) {
              ${fieldsStr}
            }
          }
        }
      `
    } else if (typeName.toLowerCase() === 'account') {
      return `
        query TestFields {
          accounts {
            ${fieldsStr}
          }
        }
      `
    } else if (typeName.toLowerCase() === 'category') {
      return `
        query TestFields {
          categories {
            ${fieldsStr}
          }
        }
      `
    } else {
      // Generic pattern
      return `
        query TestFields {
          ${typeName.toLowerCase()} {
            ${fieldsStr}
          }
        }
      `
    }
  }

  // Generate common field names for a type
  private getCommonFields(typeName: string): string[] {
    const commonGlobalFields = [
      'id', 'name', 'displayName', 'description', 'createdAt', 'updatedAt',
      'isActive', 'isEnabled', 'isHidden', 'order', 'status', 'type'
    ]

    const typeSpecificFields: Record<string, string[]> = {
      transaction: [
        'amount', 'date', 'pending', 'notes', 'merchantName', 'plaidName',
        'categoryId', 'accountId', 'merchantId', 'isRecurring', 'needsReview',
        'reviewStatus', 'hideFromReports', 'originalDescription', 'tags',
        'splits', 'attachments', 'location', 'confidence'
      ],
      account: [
        'displayName', 'currentBalance', 'availableBalance', 'mask', 'institutionName',
        'accountNumber', 'routingNumber', 'isAsset', 'includeInNetWorth',
        'syncDisabled', 'deactivatedAt', 'dataProvider', 'dataProviderAccountId',
        'isManual', 'transactionsCount', 'holdingsCount', 'logoUrl'
      ],
      category: [
        'name', 'icon', 'color', 'isSystemCategory', 'isDisabled', 'parentId',
        'groupId', 'transactionCount', 'budgetAmount', 'spentAmount'
      ],
      institution: [
        'name', 'logo', 'logoUrl', 'primaryColor', 'url', 'plaidInstitutionId',
        'status', 'capabilities', 'products'
      ],
      merchant: [
        'name', 'logoUrl', 'category', 'transactionCount', 'averageAmount'
      ],
      holding: [
        'quantity', 'price', 'value', 'costBasis', 'unrealizedGainLoss',
        'percentOfPortfolio', 'securityId', 'accountId'
      ]
    }

    return [
      ...commonGlobalFields,
      ...(typeSpecificFields[typeName.toLowerCase()] || [])
    ]
  }

  // Generate field name variations
  private generateFieldVariations(typeName: string): string[] {
    const variations: string[] = []
    const baseNames = ['total', 'count', 'list', 'summary', 'details', 'info']
    const suffixes = ['Id', 'Ids', 'Count', 'Amount', 'Date', 'At', 'Url', 'Name']
    const prefixes = ['is', 'has', 'can', 'should', 'display', 'current', 'last', 'next']

    // Add variations
    for (const base of baseNames) {
      variations.push(base)
      for (const suffix of suffixes) {
        variations.push(base + suffix)
      }
    }

    for (const prefix of prefixes) {
      variations.push(prefix + typeName)
      for (const suffix of suffixes) {
        variations.push(prefix + typeName + suffix)
      }
    }

    return variations
  }

  // Check if error indicates field exists but needs different structure
  private isFieldExistsError(errorMessage: string): boolean {
    const patterns = [
      /argument.*required/i,
      /missing.*argument/i,
      /field.*requires/i,
      /cannot query.*without/i
    ]
    return patterns.some(pattern => pattern.test(errorMessage))
  }

  // Check if error indicates unknown field
  private isUnknownFieldError(errorMessage: string): boolean {
    const patterns = [
      /cannot query field.*on type/i,
      /unknown field/i,
      /field.*doesn't exist/i,
      /no such field/i
    ]
    return patterns.some(pattern => pattern.test(errorMessage))
  }

  // Discover query operations by testing common patterns
  async discoverQueries(): Promise<string[]> {
    const commonQueries = [
      'me', 'user', 'profile',
      'accounts', 'account', 'getAccounts', 'allAccounts',
      'transactions', 'transaction', 'getTransactions', 'allTransactions',
      'categories', 'category', 'getCategories', 'allCategories',
      'budgets', 'budget', 'getBudgets', 'allBudgets',
      'institutions', 'institution', 'getInstitutions',
      'merchants', 'merchant', 'getMerchants',
      'holdings', 'holding', 'getHoldings',
      'goals', 'goal', 'getGoals',
      'cashflow', 'getCashflow',
      'netWorth', 'getNetWorth',
      'bills', 'getBills',
      'recurringTransactions', 'getRecurringTransactions',
      'tags', 'transactionTags', 'getTags'
    ]

    const discoveredQueries: string[] = []

    for (const queryName of commonQueries) {
      try {
        const testQuery = `query Test { ${queryName} }`
        await this.client.query(testQuery, {}, { cache: false })
        discoveredQueries.push(queryName)
        console.log(`✅ Found query: ${queryName}`)
      } catch (error: any) {
        // Check if it's a structure error (query exists but needs different format)
        if (!this.isUnknownFieldError(error.message)) {
          discoveredQueries.push(queryName)
          console.log(`⚠️  Query exists but needs different structure: ${queryName}`)
        }
      }

      await new Promise(resolve => setTimeout(resolve, 100))
    }

    return discoveredQueries
  }

  // Discover mutations
  async discoverMutations(): Promise<string[]> {
    const commonMutations = [
      'createTransaction', 'updateTransaction', 'deleteTransaction',
      'createAccount', 'updateAccount', 'deleteAccount',
      'createCategory', 'updateCategory', 'deleteCategory',
      'setBudgetAmount', 'updateBudget',
      'createGoal', 'updateGoal', 'deleteGoal',
      'createTag', 'updateTag', 'deleteTag',
      'linkAccount', 'unlinkAccount', 'refreshAccount',
      'categorizeTransaction', 'splitTransaction',
      'createRecurringTransaction', 'updateRecurringTransaction'
    ]

    const discoveredMutations: string[] = []

    for (const mutationName of commonMutations) {
      try {
        // Test with minimal required args (this will likely fail but tell us if mutation exists)
        const testMutation = `mutation Test { ${mutationName}(id: "test") { id } }`
        await this.client.mutation(testMutation, {}, { cache: false })
        discoveredMutations.push(mutationName)
        console.log(`✅ Found mutation: ${mutationName}`)
      } catch (error: any) {
        if (!this.isUnknownFieldError(error.message)) {
          discoveredMutations.push(mutationName)
          console.log(`⚠️  Mutation exists but needs different args: ${mutationName}`)
        }
      }

      await new Promise(resolve => setTimeout(resolve, 100))
    }

    return discoveredMutations
  }

  // Analyze existing queries to discover more fields
  analyzeExistingQueries(queries: Record<string, string>): Map<string, string[]> {
    const typeFields = new Map<string, string[]>()

    for (const [_queryName, queryString] of Object.entries(queries)) {
      // Extract type and fields from query string
      const typeMatches = queryString.match(/(\w+)\s*\{([^}]+)\}/g)

      if (typeMatches) {
        for (const match of typeMatches) {
          const [, typeName, fieldsBlock] = match.match(/(\w+)\s*\{([^}]+)\}/) || []

          if (typeName && fieldsBlock) {
            const fields = this.extractFieldsFromBlock(fieldsBlock)

            if (typeFields.has(typeName)) {
              const existing = typeFields.get(typeName)!
              typeFields.set(typeName, [...new Set([...existing, ...fields])])
            } else {
              typeFields.set(typeName, fields)
            }
          }
        }
      }
    }

    return typeFields
  }

  private extractFieldsFromBlock(fieldsBlock: string): string[] {
    const fields: string[] = []
    const lines = fieldsBlock.split('\n')

    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#')) {
        const fieldMatch = trimmed.match(/^(\w+)/)
        if (fieldMatch) {
          fields.push(fieldMatch[1])
        }
      }
    }

    return fields
  }

  // Export discovered schema
  exportDiscoveredSchema(): {
    types: Record<string, TypeDiscovery>
    queries: string[]
    mutations: string[]
    summary: {
      totalTypes: number
      totalFields: number
      totalQueries: number
      totalMutations: number
    }
  } {
    const types: Record<string, TypeDiscovery> = {}
    this.discoveredTypes.forEach((value, key) => {
      types[key] = value
    })

    const allQueries = Array.from(this.discoveredTypes.values())
      .flatMap(t => t.queries || [])
    const allMutations = Array.from(this.discoveredTypes.values())
      .flatMap(t => t.mutations || [])

    const totalFields = Array.from(this.discoveredTypes.values())
      .reduce((sum, type) => sum + type.fields.length, 0)

    return {
      types,
      queries: allQueries,
      mutations: allMutations,
      summary: {
        totalTypes: this.discoveredTypes.size,
        totalFields,
        totalQueries: allQueries.length,
        totalMutations: allMutations.length
      }
    }
  }
}

// Utility to run comprehensive schema discovery
export class SchemaDiscoveryRunner {
  private fuzzer: SchemaFuzzer

  constructor(client: GraphQLClient) {
    this.fuzzer = new SchemaFuzzer(client)
  }

  async runFullDiscovery(existingQueries?: Record<string, string>): Promise<void> {
    console.log('🚀 Starting comprehensive GraphQL schema discovery...')

    // Step 1: Analyze existing queries
    if (existingQueries) {
      console.log('📋 Analyzing existing queries...')
      const knownTypes = this.fuzzer.analyzeExistingQueries(existingQueries)

      for (const [typeName, fields] of knownTypes) {
        console.log(`📝 Found ${fields.length} fields for type ${typeName}`)
        await this.fuzzer.fuzzeType(typeName, fields)
      }
    }

    // Step 2: Discover available queries
    console.log('🔍 Discovering available queries...')
    await this.fuzzer.discoverQueries()

    // Step 3: Discover available mutations
    console.log('🔧 Discovering available mutations...')
    await this.fuzzer.discoverMutations()

    // Step 4: Fuzz common types
    const commonTypes = ['Transaction', 'Account', 'Category', 'Institution', 'Merchant', 'Holding']
    for (const type of commonTypes) {
      console.log(`🔬 Deep fuzzing type: ${type}`)
      await this.fuzzer.fuzzeType(type)
    }

    // Export results
    const results = this.fuzzer.exportDiscoveredSchema()
    console.log('\n📊 Discovery Results:')
    console.log(`Types discovered: ${results.summary.totalTypes}`)
    console.log(`Fields discovered: ${results.summary.totalFields}`)
    console.log(`Queries discovered: ${results.summary.totalQueries}`)
    console.log(`Mutations discovered: ${results.summary.totalMutations}`)

    return results as any
  }
}

export { SchemaFuzzer as default }