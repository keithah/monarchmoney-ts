// MCP-Optimized GraphQL Queries
// Lightweight queries designed specifically for MCP usage with minimal payloads

import { QueryAnalyzer } from './query-analyzer'

// Ultra-lightweight queries for MCP (< 10KB typical response)
export const MCP_ULTRA_LIGHT = {
  // Essential account info only
  accounts: `
    query MCPAccountsUltraLight {
      accounts {
        id
        displayName
        currentBalance
      }
    }
  `,

  // Minimal transaction data
  transactions: `
    query MCPTransactionsUltraLight($limit: Int = 25) {
      allTransactions {
        totalCount
        results(limit: $limit) {
          id
          amount
          date
        }
      }
    }
  `,

  // Basic categories
  categories: `
    query MCPCategoriesUltraLight {
      categories {
        id
        name
      }
    }
  `,

  // User info
  me: `
    query MCPMeUltraLight {
      me {
        id
        email
        name
      }
    }
  `
}

// Lightweight queries with essential context (< 25KB typical response)
export const MCP_LIGHT = {
  accounts: `
    query MCPAccountsLight {
      accounts {
        id
        displayName
        currentBalance
        isHidden
        type {
          display
        }
      }
    }
  `,

  transactions: `
    query MCPTransactionsLight($limit: Int = 25, $filters: TransactionFilterInput) {
      allTransactions(filters: $filters) {
        totalCount
        results(limit: $limit) {
          id
          amount
          date
          pending
          category {
            id
            name
          }
          merchant {
            id
            name
          }
        }
      }
    }
  `,

  transactionsWithAccount: `
    query MCPTransactionsWithAccountLight($limit: Int = 25, $filters: TransactionFilterInput) {
      allTransactions(filters: $filters) {
        totalCount
        results(limit: $limit) {
          id
          amount
          date
          category { id name }
          account { id displayName }
        }
      }
    }
  `,

  categories: `
    query MCPCategoriesLight {
      categories {
        id
        name
        icon
        group {
          id
          name
          type
        }
      }
    }
  `,

  budgets: `
    query MCPBudgetsLight($startDate: String, $endDate: String) {
      budgets(startDate: $startDate, endDate: $endDate) {
        id
        categories {
          id
          name
          budgetAmount
          spentAmount
        }
      }
    }
  `,

  cashflow: `
    query MCPCashflowLight($startDate: String!, $endDate: String!) {
      cashflow(startDate: $startDate, endDate: $endDate) {
        income
        expenses
        netCashflow
        categories {
          categoryId
          categoryName
          amount
        }
      }
    }
  `
}

// Standard queries with good detail/size balance (< 50KB typical response)
export const MCP_STANDARD = {
  accounts: `
    query MCPAccountsStandard {
      accounts {
        id
        displayName
        currentBalance
        availableBalance
        isHidden
        isAsset
        includeInNetWorth
        mask
        dataProvider
        type {
          name
          display
        }
        institution {
          id
          name
        }
      }
    }
  `,

  transactions: `
    query MCPTransactionsStandard($limit: Int = 25, $filters: TransactionFilterInput) {
      allTransactions(filters: $filters) {
        totalCount
        results(limit: $limit) {
          id
          amount
          date
          pending
          notes
          isRecurring
          needsReview
          category {
            id
            name
            icon
          }
          merchant {
            id
            name
            transactionCount
          }
          account {
            id
            displayName
            type { display }
          }
        }
      }
    }
  `,

  transactionDetails: `
    query MCPTransactionDetails($id: ID!) {
      transaction(id: $id) {
        id
        amount
        date
        pending
        notes
        plaidName
        isRecurring
        needsReview
        reviewStatus
        hideFromReports
        category {
          id
          name
          icon
          group { id name type }
        }
        merchant {
          id
          name
          transactionCount
        }
        account {
          id
          displayName
          currentBalance
          type { name display }
          institution { id name }
        }
        createdAt
        updatedAt
      }
    }
  `,

  accountDetails: `
    query MCPAccountDetails($id: ID!) {
      account(id: $id) {
        id
        displayName
        currentBalance
        availableBalance
        isHidden
        isAsset
        includeInNetWorth
        mask
        dataProvider
        isManual
        transactionsCount
        type {
          id
          name
          display
        }
        subtype {
          id
          name
          display
        }
        institution {
          id
          name
          primaryColor
          url
        }
        createdAt
        updatedAt
      }
    }
  `
}

// Query builder for dynamic MCP queries
export class MCPQueryBuilder {
  private analyzer = new QueryAnalyzer()

  // Build a transaction query optimized for MCP with specific requirements
  buildTransactionQuery(options: {
    maxPayloadKB?: number
    includeCategory?: boolean
    includeMerchant?: boolean
    includeAccount?: boolean
    includeNotes?: boolean
    limit?: number
  }): string {
    const {
      maxPayloadKB = 25,
      includeCategory = true,
      includeMerchant = false,
      includeAccount = false,
      includeNotes = false,
      limit = 25
    } = options

    let fields = ['id', 'amount', 'date']

    // Add fields based on payload budget
    let currentComplexity = this.analyzer['calculateMetrics'](fields, limit).complexityScore

    if (includeCategory && currentComplexity < maxPayloadKB * 2) {
      fields.push('category { id name }')
      currentComplexity += 10
    }

    if (includeMerchant && currentComplexity < maxPayloadKB * 2) {
      fields.push('merchant { id name }')
      currentComplexity += 8
    }

    if (includeAccount && currentComplexity < maxPayloadKB * 2) {
      fields.push('account { id displayName }')
      currentComplexity += 12
    }

    if (includeNotes && currentComplexity < maxPayloadKB * 2) {
      fields.push('notes')
      currentComplexity += 5
    }

    // Add pending if we have budget
    if (currentComplexity < maxPayloadKB * 2) {
      fields.push('pending')
    }

    return `
      query MCPTransactionsDynamic($limit: Int = ${limit}, $filters: TransactionFilterInput) {
        allTransactions(filters: $filters) {
          totalCount
          results(limit: $limit) {
            ${fields.join('\n            ')}
          }
        }
      }
    `.trim()
  }

  // Build account query with payload optimization
  buildAccountQuery(options: {
    maxPayloadKB?: number
    includeType?: boolean
    includeInstitution?: boolean
    includeBalanceDetails?: boolean
  }): string {
    const {
      maxPayloadKB = 25,
      includeType = true,
      includeInstitution = false,
      includeBalanceDetails = false
    } = options

    let fields = ['id', 'displayName', 'currentBalance']

    if (includeBalanceDetails) {
      fields.push('availableBalance', 'includeInNetWorth')
    }

    if (includeType) {
      fields.push('type { display }')
    }

    if (includeInstitution) {
      fields.push('institution { id name }')
    }

    // Estimate and trim if needed
    const metrics = this.analyzer['calculateMetrics'](fields, 50) // Assume ~50 accounts
    if (metrics.estimatedResponseSize > maxPayloadKB && includeInstitution) {
      // Remove institution if over budget
      fields = fields.filter(f => !f.includes('institution'))
    }

    return `
      query MCPAccountsDynamic {
        accounts {
          ${fields.join('\n          ')}
        }
      }
    `.trim()
  }

  // Suggest optimal query based on use case
  suggestQuery(useCase: 'overview' | 'details' | 'analysis' | 'reporting'): {
    query: string
    estimatedSize: number
    description: string
  } {
    switch (useCase) {
      case 'overview':
        return {
          query: MCP_ULTRA_LIGHT.transactions,
          estimatedSize: 5,
          description: 'Ultra-light for quick overviews and summaries'
        }

      case 'details':
        return {
          query: MCP_STANDARD.transactionDetails,
          estimatedSize: 35,
          description: 'Detailed view for single item inspection'
        }

      case 'analysis':
        return {
          query: MCP_LIGHT.transactionsWithAccount,
          estimatedSize: 15,
          description: 'Good balance for analysis with category and account context'
        }

      case 'reporting':
        return {
          query: MCP_STANDARD.transactions,
          estimatedSize: 45,
          description: 'Comprehensive data for reporting purposes'
        }

      default:
        return {
          query: MCP_LIGHT.transactions,
          estimatedSize: 20,
          description: 'Default balanced query'
        }
    }
  }
}

// Helper to validate MCP query efficiency
export class MCPQueryValidator {
  private analyzer = new QueryAnalyzer()

  validateForMCP(query: string, maxSizeKB: number = 50): {
    isValid: boolean
    estimatedSize: number
    issues: string[]
    suggestions: string[]
  } {
    const metrics = this.analyzer.analyzeQuery(query, 25) // Assume 25 results

    const issues: string[] = []
    const suggestions: string[] = []

    if (metrics.estimatedResponseSize > maxSizeKB) {
      issues.push(`Query too large: ${metrics.estimatedResponseSize}KB > ${maxSizeKB}KB limit`)
    }

    if (metrics.heavyFields.length > 0) {
      issues.push(`Heavy fields detected: ${metrics.heavyFields.join(', ')}`)
      suggestions.push('Consider removing heavy fields or using fragments')
    }

    if (metrics.complexityScore > 40) {
      issues.push(`High complexity: ${metrics.complexityScore}`)
      suggestions.push('Simplify query or split into multiple requests')
    }

    // Check for MCP-unfriendly patterns
    if (query.includes('attachments')) {
      issues.push('Attachments field adds significant payload size')
      suggestions.push('Remove attachments for MCP usage')
    }

    if (query.includes('holdings') && query.includes('transactions')) {
      issues.push('Both holdings and transactions in same query')
      suggestions.push('Split holdings and transactions into separate queries')
    }

    return {
      isValid: issues.length === 0 && metrics.estimatedResponseSize <= maxSizeKB,
      estimatedSize: metrics.estimatedResponseSize,
      issues,
      suggestions: [...suggestions, ...metrics.suggestions]
    }
  }
}

// Export collections
export const MCP_QUERIES = {
  ultraLight: MCP_ULTRA_LIGHT,
  light: MCP_LIGHT,
  standard: MCP_STANDARD
}

export { MCPQueryBuilder as default }