/**
 * Optimized GraphQL Queries for MCP Context Management
 *
 * This module provides pre-optimized GraphQL queries with different
 * verbosity levels to minimize MCP context usage while maintaining
 * functionality.
 *
 * Performance targets:
 * - Ultra-Light: < 5KB responses (99% reduction)
 * - Light: < 15KB responses (85% reduction)
 * - Standard: < 35KB responses (60% reduction)
 */

export interface OptimizedQueryOptions {
  verbosity?: 'ultra-light' | 'light' | 'standard';
  limit?: number;
  includeHidden?: boolean;
}

/**
 * Ultra-light account queries for quick overviews
 * Returns only essential fields: id, name, balance, type
 */
export const ULTRA_LIGHT_ACCOUNTS_QUERY = `
  query GetAccountsUltraLight {
    accounts {
      id
      displayName
      balance {
        amount
      }
      accountType {
        name
      }
    }
  }
`;

/**
 * Light account queries with moderate detail
 * Adds institution, last updated, account number
 */
export const LIGHT_ACCOUNTS_QUERY = `
  query GetAccountsLight {
    accounts {
      id
      displayName
      balance {
        amount
        currency
      }
      accountType {
        name
      }
      institution {
        name
      }
      mask
      updatedAt
    }
  }
`;

/**
 * Standard account queries with comprehensive detail
 * Includes all commonly used fields
 */
export const STANDARD_ACCOUNTS_QUERY = `
  query GetAccountsStandard {
    accounts {
      id
      displayName
      balance {
        amount
        currency
      }
      accountType {
        name
        display
      }
      accountSubtype {
        name
        display
      }
      institution {
        id
        name
        logoUrl
      }
      mask
      accountNumber
      routingNumber
      isHidden
      isAsset
      isLiability
      includeInNetWorth
      order
      updatedAt
      createdAt
      signupableInstitution {
        id
        name
      }
      credential {
        id
        status
      }
    }
  }
`;

/**
 * Ultra-light transaction queries
 * Returns only: id, amount, description, date, account
 */
export const ULTRA_LIGHT_TRANSACTIONS_QUERY = `
  query GetTransactionsUltraLight($limit: Int, $offset: Int, $filters: TransactionFilterInput, $orderBy: String) {
    allTransactions(limit: $limit, offset: $offset, filters: $filters, orderBy: $orderBy) {
      results {
        id
        amount
        description
        date
        account {
          displayName
        }
      }
    }
  }
`;

/**
 * Light transaction queries
 * Adds category, merchant, tags
 */
export const LIGHT_TRANSACTIONS_QUERY = `
  query GetTransactionsLight($limit: Int, $offset: Int, $filters: TransactionFilterInput, $orderBy: String) {
    allTransactions(limit: $limit, offset: $offset, filters: $filters, orderBy: $orderBy) {
      results {
        id
        amount
        description
        date
        account {
          id
          displayName
          mask
        }
        category {
          id
          name
        }
        merchant {
          name
        }
        tags {
          id
          name
        }
        isRecurring
        needsReview
      }
    }
  }
`;

/**
 * Standard transaction queries
 * Comprehensive transaction data
 */
export const STANDARD_TRANSACTIONS_QUERY = `
  query GetTransactionsStandard($limit: Int, $offset: Int, $filters: TransactionFilterInput, $orderBy: String) {
    allTransactions(limit: $limit, offset: $offset, filters: $filters, orderBy: $orderBy) {
      results {
        id
        amount
        originalAmount
        foreignAmount
        currency
        description
        originalDescription
        date
        hideFromReports
        plaidName
        notes
        isRecurring
        needsReview
        reviewedAt
        reviewedByUser
        account {
          id
          displayName
          mask
          accountType {
            name
          }
        }
        category {
          id
          name
          icon
          color
          order
          group {
            id
            name
          }
        }
        merchant {
          id
          name
          transactionsCount
        }
        tags {
          id
          name
          color
          order
        }
        attachments {
          id
          filename
          extension
        }
        goal {
          id
          name
        }
        splits {
          id
          amount
          description
          category {
            id
            name
          }
        }
        updatedAt
        createdAt
      }
      hasNextPage
      hasPreviousPage
      totalCount
    }
  }
`;

/**
 * Pre-aggregated spending summary query
 * Returns category totals for ultra-compact responses
 */
export const SPENDING_SUMMARY_QUERY = `
  query GetSpendingSummary($startDate: Date, $endDate: Date, $limit: Int) {
    categorySpending: getSpendingByCategory(
      startDate: $startDate,
      endDate: $endDate,
      limit: $limit
    ) {
      category {
        name
        icon
      }
      totalSpent
      transactionCount
    }
  }
`;

/**
 * Quick financial overview query
 * Single query for net worth, recent activity, top spending
 */
export const QUICK_OVERVIEW_QUERY = `
  query GetQuickOverview {
    summary: getQuickStats {
      netWorth
      monthlyChange
      recentTransactionCount
      topSpendingCategories {
        category
        amount
      }
    }
  }
`;

/**
 * Balance trends summary query
 * Account balance changes over time (aggregated)
 */
export const BALANCE_TRENDS_QUERY = `
  query GetBalanceTrends($startDate: Date, $endDate: Date) {
    balanceTrends: getBalanceTrends(
      startDate: $startDate,
      endDate: $endDate
    ) {
      account {
        displayName
        accountType {
          name
        }
      }
      trend
      changeAmount
      changePercent
    }
  }
`;

/**
 * Query selector based on verbosity level and data type
 */
export class OptimizedQuerySelector {
  static getAccountsQuery(verbosity: 'ultra-light' | 'light' | 'standard' = 'standard'): string {
    switch (verbosity) {
      case 'ultra-light':
        return ULTRA_LIGHT_ACCOUNTS_QUERY;
      case 'light':
        return LIGHT_ACCOUNTS_QUERY;
      default:
        return STANDARD_ACCOUNTS_QUERY;
    }
  }

  static getTransactionsQuery(verbosity: 'ultra-light' | 'light' | 'standard' = 'standard'): string {
    switch (verbosity) {
      case 'ultra-light':
        return ULTRA_LIGHT_TRANSACTIONS_QUERY;
      case 'light':
        return LIGHT_TRANSACTIONS_QUERY;
      default:
        return STANDARD_TRANSACTIONS_QUERY;
    }
  }

  static getSummaryQuery(type: 'spending' | 'overview' | 'trends'): string {
    switch (type) {
      case 'spending':
        return SPENDING_SUMMARY_QUERY;
      case 'overview':
        return QUICK_OVERVIEW_QUERY;
      case 'trends':
        return BALANCE_TRENDS_QUERY;
      default:
        return QUICK_OVERVIEW_QUERY;
    }
  }
}

/**
 * Estimated response sizes for different query types
 * Used for intelligent query selection in MCP contexts
 */
export const QUERY_SIZE_ESTIMATES = {
  'ultra-light': {
    accounts: 50,      // ~50 chars per account
    transactions: 80,  // ~80 chars per transaction
    summary: 30        // ~30 chars total
  },
  'light': {
    accounts: 150,     // ~150 chars per account
    transactions: 200, // ~200 chars per transaction
    summary: 100       // ~100 chars total
  },
  'standard': {
    accounts: 400,     // ~400 chars per account
    transactions: 600, // ~600 chars per transaction
    summary: 300       // ~300 chars total
  }
} as const;

/**
 * Smart query selector that estimates response size
 * and selects appropriate verbosity level
 */
export function selectOptimalQuery(
  dataType: 'accounts' | 'transactions' | 'summary',
  itemCount: number,
  maxSize: number = 5000
): 'ultra-light' | 'light' | 'standard' {
  const estimates = QUERY_SIZE_ESTIMATES;

  // Calculate estimated sizes for each verbosity level
  const lightSize = estimates['light'][dataType] * itemCount;
  const standardSize = estimates['standard'][dataType] * itemCount;

  // Select the highest verbosity that fits within size limit
  if (standardSize <= maxSize) return 'standard';
  if (lightSize <= maxSize) return 'light';
  return 'ultra-light';
}

/**
 * Response formatters for different verbosity levels
 */
export class OptimizedResponseFormatter {
  static formatAccounts(accounts: any[], verbosity: 'ultra-light' | 'light' | 'standard'): string {
    switch (verbosity) {
      case 'ultra-light':
        const total = accounts.reduce((sum, acc) => sum + (acc.balance?.amount || 0), 0);
        return `💰 ${accounts.length} accounts, Total: $${total.toLocaleString()}`;

      case 'light':
        return accounts.map(acc =>
          `• ${acc.displayName}: $${acc.balance?.amount?.toLocaleString() || '0'}`
        ).join('\n') + `\n\nTotal: $${accounts.reduce((s, a) => s + (a.balance?.amount || 0), 0).toLocaleString()}`;

      default:
        return accounts.map(acc =>
          `• **${acc.displayName}**\n  Type: ${acc.accountType?.name}\n  Balance: $${acc.balance?.amount?.toLocaleString() || '0'}\n  Institution: ${acc.institution?.name || 'Manual'}\n  Updated: ${new Date(acc.updatedAt).toLocaleDateString()}`
        ).join('\n\n') + `\n\n**Total Balance: $${accounts.reduce((s, a) => s + (a.balance?.amount || 0), 0).toLocaleString()}**`;
    }
  }

  static formatTransactions(transactions: any[], verbosity: 'ultra-light' | 'light' | 'standard'): string {
    if (!transactions.length) return '';

    switch (verbosity) {
      case 'ultra-light':
        const total = transactions.reduce((sum, txn) => sum + Math.abs(txn.amount), 0);
        return `💳 ${transactions.length} transactions, Volume: $${total.toLocaleString()}`;

      case 'light':
        return transactions.map(txn =>
          `• ${new Date(txn.date).toLocaleDateString()} - ${txn.description}\n  $${txn.amount.toLocaleString()} • ${txn.category?.name || 'Uncategorized'}`
        ).join('\n');

      default:
        return transactions.map(txn =>
          `• ${new Date(txn.date).toLocaleDateString()} - **${txn.description}**\n  Amount: ${txn.amount < 0 ? '-' : ''}$${Math.abs(txn.amount).toLocaleString()}\n  Category: ${txn.category?.name || 'Uncategorized'}\n  Account: ${txn.account?.displayName} ${txn.account?.mask ? `(...${txn.account.mask})` : ''}`
        ).join('\n\n') + `\n\n**Total Transaction Volume: $${transactions.reduce((s, t) => s + Math.abs(t.amount), 0).toLocaleString()}**`;
    }
  }
}