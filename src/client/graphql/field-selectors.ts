// Field Selection Helpers for Minimal Data Transfer
// These utilities help reduce GraphQL payload sizes by selecting only needed fields

export interface FieldSelector {
  fields: string[]
  fragments?: Record<string, string>
}

// Core fragments for reusability
export const FRAGMENTS = {
  TransactionCore: `
    fragment TransactionCore on Transaction {
      id
      amount
      date
      pending
    }
  `,

  TransactionWithCategory: `
    fragment TransactionWithCategory on Transaction {
      id
      amount
      date
      pending
      category {
        id
        name
      }
    }
  `,

  AccountCore: `
    fragment AccountCore on Account {
      id
      displayName
      currentBalance
      isHidden
    }
  `,

  AccountWithType: `
    fragment AccountWithType on Account {
      id
      displayName
      currentBalance
      isHidden
      type {
        name
        display
      }
    }
  `
}

// Field selection presets
export const FIELD_PRESETS = {
  // Minimal account data for listings
  accounts: {
    minimal: ['id', 'displayName', 'currentBalance'],
    withType: ['id', 'displayName', 'currentBalance', 'type { name display }'],
    full: [
      'id', 'displayName', 'currentBalance', 'availableBalance',
      'isHidden', 'isAsset', 'includeInNetWorth',
      'type { name display }', 'subtype { name display }'
    ]
  },

  // Transaction field presets
  transactions: {
    minimal: ['id', 'amount', 'date'],
    withCategory: ['id', 'amount', 'date', 'category { id name }'],
    withMerchant: ['id', 'amount', 'date', 'merchant { id name }'],
    full: [
      'id', 'amount', 'date', 'pending', 'notes', 'isRecurring',
      'category { id name }', 'merchant { id name }',
      'account { id displayName }'
    ]
  },

  // Budget field presets
  budgets: {
    minimal: ['id', 'startDate', 'endDate'],
    withCategories: [
      'id', 'startDate', 'endDate',
      'categories { id name budgetAmount spentAmount }'
    ]
  }
}

// Dynamic query builder
export class QueryBuilder {
  private fragments: string[] = []

  buildQuery(
    operation: 'query' | 'mutation',
    name: string,
    fields: string[],
    variables?: Record<string, string>,
    filters?: Record<string, any>
  ): string {
    const variablesDef = variables
      ? `(${Object.entries(variables).map(([key, type]) => `$${key}: ${type}`).join(', ')})`
      : ''

    const filtersStr = filters
      ? `(${Object.entries(filters).map(([key, value]) => `${key}: ${value}`).join(', ')})`
      : ''

    const fragmentsStr = this.fragments.length > 0
      ? '\n\n' + this.fragments.join('\n\n')
      : ''

    return `
      ${operation} ${name}${variablesDef} {
        ${name.toLowerCase()}${filtersStr} {
          ${fields.join('\n          ')}
        }
      }${fragmentsStr}
    `.trim()
  }

  addFragment(fragmentName: string): this {
    if (FRAGMENTS[fragmentName as keyof typeof FRAGMENTS]) {
      this.fragments.push(FRAGMENTS[fragmentName as keyof typeof FRAGMENTS])
    }
    return this
  }

  buildTransactionQuery(
    preset: keyof typeof FIELD_PRESETS.transactions = 'minimal',
    _variables?: {
      offset?: number
      limit?: number
      filters?: string
    }
  ): string {
    const fields = FIELD_PRESETS.transactions[preset]

    return `
      query GetTransactions${preset.charAt(0).toUpperCase() + preset.slice(1)}(
        $offset: Int,
        $limit: Int,
        $filters: TransactionFilterInput,
        $orderBy: TransactionOrdering
      ) {
        allTransactions(filters: $filters) {
          totalCount
          results(offset: $offset, limit: $limit, orderBy: $orderBy) {
            ${fields.join('\n            ')}
          }
        }
      }
    `.trim()
  }

  buildAccountQuery(preset: keyof typeof FIELD_PRESETS.accounts = 'minimal'): string {
    const fields = FIELD_PRESETS.accounts[preset]

    return `
      query GetAccounts${preset.charAt(0).toUpperCase() + preset.slice(1)} {
        accounts {
          ${fields.join('\n          ')}
        }
      }
    `.trim()
  }
}

// Utility to estimate query complexity/size
export class QueryAnalyzer {
  private fieldWeights = {
    // Simple fields
    'id': 1,
    'name': 1,
    'amount': 1,
    'date': 1,

    // Medium complexity
    'currentBalance': 2,
    'displayName': 2,
    'notes': 3,

    // Complex nested objects
    'category': 5,
    'account': 5,
    'merchant': 5,
    'type': 4,

    // Heavy fields
    'attachments': 10,
    'holdings': 15,
    'transactions': 20
  }

  estimateComplexity(fields: string[]): number {
    return fields.reduce((total, field) => {
      const baseField = field.split(' ')[0] // Get base field name
      return total + (this.fieldWeights[baseField as keyof typeof this.fieldWeights] || 3) // Default weight: 3
    }, 0)
  }

  suggestOptimizations(fields: string[]): string[] {
    const suggestions: string[] = []

    if (fields.includes('attachments')) {
      suggestions.push('Consider removing attachments field - high payload cost')
    }

    if (fields.includes('holdings') && fields.includes('transactions')) {
      suggestions.push('Avoid querying both holdings and transactions together')
    }

    const complexity = this.estimateComplexity(fields)
    if (complexity > 50) {
      suggestions.push(`High complexity query (${complexity}). Consider splitting into multiple requests`)
    }

    return suggestions
  }
}

// Pre-built optimized queries for MCP usage
export const MCP_OPTIMIZED_QUERIES = {
  // Lightweight transaction list for overview
  transactionsList: `
    query MCPTransactionsList($limit: Int = 50, $offset: Int = 0) {
      allTransactions {
        totalCount
        results(limit: $limit, offset: $offset) {
          id
          amount
          date
          category { id name }
          merchant { id name }
        }
      }
    }
  `,

  // Essential account info
  accountsSummary: `
    query MCPAccountsSummary {
      accounts {
        id
        displayName
        currentBalance
        type { display }
      }
    }
  `,

  // Budget overview without heavy details
  budgetOverview: `
    query MCPBudgetOverview($startDate: String, $endDate: String) {
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
  `
}

export { QueryBuilder as default }