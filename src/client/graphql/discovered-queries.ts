// GraphQL Queries Based on Schema Discovery Results
// These queries are optimized for MCP usage with proven field availability

// ULTRA-LIGHT queries (< 5KB typical response)
export const DISCOVERED_ULTRA_LIGHT = {
  // Minimal account data - just the essentials
  accounts: `
    query DiscoveredAccountsUltraLight {
      accounts {
        id
        displayName
        currentBalance
      }
    }
  `,

  // Minimal transaction data - core fields only
  transactions: `
    query DiscoveredTransactionsUltraLight($limit: Int = 25) {
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
    query DiscoveredCategoriesUltraLight {
      categories {
        id
        name
      }
    }
  `,

  // Essential user info
  me: `
    query DiscoveredMeUltraLight {
      me {
        id
        email
        name
      }
    }
  `
}

// LIGHT queries (< 15KB typical response) - includes context
export const DISCOVERED_LIGHT = {
  // Account data with type and status
  accounts: `
    query DiscoveredAccountsLight {
      accounts {
        id
        displayName
        currentBalance
        isHidden
        isAsset
        type {
          display
        }
      }
    }
  `,

  // Transactions with category and basic merchant info
  transactions: `
    query DiscoveredTransactionsLight($limit: Int = 25, $filters: TransactionFilterInput) {
      allTransactions(filters: $filters) {
        totalCount
        results(limit: $limit) {
          id
          amount
          date
          pending
          isRecurring
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

  // Transactions with account context (useful for MCP account-specific queries)
  transactionsWithAccount: `
    query DiscoveredTransactionsWithAccountLight($limit: Int = 25, $filters: TransactionFilterInput) {
      allTransactions(filters: $filters) {
        totalCount
        results(limit: $limit) {
          id
          amount
          date
          pending
          category { id name }
          account { id displayName }
        }
      }
    }
  `,

  // Categories with groups
  categories: `
    query DiscoveredCategoriesLight {
      categories {
        id
        name
        icon
        isSystemCategory
        group {
          id
          name
          type
        }
      }
    }
  `,

  // User profile with useful fields
  me: `
    query DiscoveredMeLight {
      me {
        id
        email
        name
        timezone
        hasPassword
        hasMfaOn
      }
    }
  `
}

// STANDARD queries (< 35KB typical response) - comprehensive but efficient
export const DISCOVERED_STANDARD = {
  // Full account details (discovered fields)
  accounts: `
    query DiscoveredAccountsStandard {
      accounts {
        id
        displayName
        syncDisabled
        deactivatedAt
        isHidden
        isAsset
        mask
        createdAt
        updatedAt
        displayLastUpdatedAt
        currentBalance
        displayBalance
        includeInNetWorth
        hideFromList
        hideTransactionsFromReports
        includeBalanceInNetWorth
        includeInGoalBalance
        dataProvider
        dataProviderAccountId
        isManual
        transactionsCount
        order
        type {
          name
          display
        }
        subtype {
          name
          display
        }
        institution {
          id
          name
          primaryColor
          url
        }
      }
    }
  `,

  // Comprehensive transaction data (all discovered fields)
  transactions: `
    query DiscoveredTransactionsStandard($limit: Int = 25, $filters: TransactionFilterInput, $orderBy: TransactionOrdering) {
      allTransactions(filters: $filters) {
        totalCount
        totalSelectableCount
        results(offset: 0, limit: $limit, orderBy: $orderBy) {
          id
          amount
          pending
          date
          hideFromReports
          plaidName
          notes
          isRecurring
          reviewStatus
          needsReview
          isSplitTransaction
          createdAt
          updatedAt
          category {
            id
            name
            icon
            group {
              id
              name
              type
            }
          }
          merchant {
            name
            id
            transactionsCount
          }
          account {
            id
            displayName
            type {
              display
            }
          }
        }
      }
    }
  `,

  // Single transaction with full details
  transactionDetails: `
    query DiscoveredTransactionDetails($id: ID!) {
      transaction(id: $id) {
        id
        amount
        pending
        date
        hideFromReports
        plaidName
        notes
        isRecurring
        reviewStatus
        needsReview
        isSplitTransaction
        createdAt
        updatedAt
        category {
          id
          name
          icon
          isSystemCategory
          group {
            id
            name
            type
          }
        }
        merchant {
          name
          id
          transactionsCount
        }
        account {
          id
          displayName
          currentBalance
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
    }
  `,

  // Categories with full details
  categories: `
    query DiscoveredCategoriesStandard {
      categories {
        id
        name
        order
        icon
        isSystemCategory
        isDisabled
        group {
          id
          name
          type
        }
      }
    }
  `
}

// SPECIALIZED queries for specific MCP use cases
export const DISCOVERED_SPECIALIZED = {
  // Recent transactions for activity feed
  recentActivity: `
    query DiscoveredRecentActivity($limit: Int = 10) {
      allTransactions {
        results(limit: $limit, orderBy: DATE_DESC) {
          id
          amount
          date
          pending
          category { name icon }
          merchant { name }
          account { displayName }
        }
      }
    }
  `,

  // Account balances only (for net worth calculations)
  accountBalances: `
    query DiscoveredAccountBalances {
      accounts {
        id
        displayName
        currentBalance
        includeInNetWorth
        isAsset
        type { display }
      }
    }
  `,

  // Pending transactions
  pendingTransactions: `
    query DiscoveredPendingTransactions($limit: Int = 50) {
      allTransactions(filters: { pending: true }) {
        totalCount
        results(limit: $limit) {
          id
          amount
          date
          plaidName
          category { name }
          account { displayName }
        }
      }
    }
  `,

  // Transactions needing review
  reviewTransactions: `
    query DiscoveredReviewTransactions($limit: Int = 50) {
      allTransactions(filters: { needsReview: true }) {
        totalCount
        results(limit: $limit) {
          id
          amount
          date
          plaidName
          reviewStatus
          category { name }
          account { displayName }
        }
      }
    }
  `,

  // Categories for transaction categorization
  categoriesForSelection: `
    query DiscoveredCategoriesForSelection {
      categories {
        id
        name
        icon
        isSystemCategory
        group {
          name
          type
        }
      }
    }
  `,

  // Account summary with transaction count
  accountSummary: `
    query DiscoveredAccountSummary {
      accounts {
        id
        displayName
        currentBalance
        isHidden
        transactionsCount
        type { display }
        institution { name }
      }
    }
  `
}

// Query size estimates (based on typical response sizes)
export const QUERY_SIZE_ESTIMATES = {
  ultraLight: {
    accounts: 2, // KB
    transactions: 3,
    categories: 1,
    me: 0.5
  },
  light: {
    accounts: 8,
    transactions: 12,
    categories: 4,
    me: 1
  },
  standard: {
    accounts: 25,
    transactions: 35,
    categories: 6,
    transactionDetails: 5
  },
  specialized: {
    recentActivity: 8,
    accountBalances: 6,
    pendingTransactions: 15,
    reviewTransactions: 12,
    categoriesForSelection: 4,
    accountSummary: 10
  }
}

// Helper to select appropriate query based on size constraints
export function selectQueryBySize(
  type: 'accounts' | 'transactions' | 'categories' | 'me',
  maxSizeKB: number
): string {
  const queries = {
    accounts: {
      ultraLight: DISCOVERED_ULTRA_LIGHT.accounts,
      light: DISCOVERED_LIGHT.accounts,
      standard: DISCOVERED_STANDARD.accounts
    },
    transactions: {
      ultraLight: DISCOVERED_ULTRA_LIGHT.transactions,
      light: DISCOVERED_LIGHT.transactions,
      standard: DISCOVERED_STANDARD.transactions
    },
    categories: {
      ultraLight: DISCOVERED_ULTRA_LIGHT.categories,
      light: DISCOVERED_LIGHT.categories,
      standard: DISCOVERED_STANDARD.categories
    },
    me: {
      ultraLight: DISCOVERED_ULTRA_LIGHT.me,
      light: DISCOVERED_LIGHT.me,
      standard: DISCOVERED_ULTRA_LIGHT.me // No standard version needed
    }
  }

  const estimates = QUERY_SIZE_ESTIMATES

  if (maxSizeKB <= estimates.ultraLight[type]) {
    return queries[type].ultraLight
  } else if (maxSizeKB <= estimates.light[type]) {
    return queries[type].light
  } else {
    return queries[type].standard
  }
}

// Export all discovered queries
export const DISCOVERED_QUERIES = {
  ultraLight: DISCOVERED_ULTRA_LIGHT,
  light: DISCOVERED_LIGHT,
  standard: DISCOVERED_STANDARD,
  specialized: DISCOVERED_SPECIALIZED
}