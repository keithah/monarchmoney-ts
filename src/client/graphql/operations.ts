// GraphQL Operations and Queries

// Account Operations
export const GET_ACCOUNTS = `
  query GetAccounts {
    accounts {
      edges {
        node {
          id
          displayName
          syncDisabled
          deactivatedAt
          isHidden
          isAsset
          includeInNetWorth
          currentBalance
          availableBalance
          dataProvider
          dataProviderAccountId
          institutionName
          mask
          createdAt
          updatedAt
          importedFromMint
          accountTypeId
          accountSubtypeId
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
          credential {
            id
            institutionId
            institutionName
          }
        }
      }
    }
  }
`

export const GET_ACCOUNT_DETAILS = `
  query GetAccountDetails($id: ID!) {
    account(id: $id) {
      id
      displayName
      syncDisabled
      deactivatedAt
      isHidden
      isAsset
      includeInNetWorth
      currentBalance
      availableBalance
      dataProvider
      dataProviderAccountId
      institutionName
      mask
      createdAt
      updatedAt
      importedFromMint
      accountTypeId
      accountSubtypeId
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
      credential {
        id
        institutionId
        institutionName
      }
    }
  }
`

// Transaction Operations
export const GET_TRANSACTIONS = `
  query GetTransactions(
    $limit: Int,
    $offset: Int,
    $startDate: String,
    $endDate: String,
    $search: String,
    $categoryIds: [ID!],
    $accountIds: [ID!],
    $tagIds: [ID!],
    $hasAttachments: Boolean,
    $hasNotes: Boolean,
    $hiddenFromReports: Boolean,
    $isSplit: Boolean,
    $isRecurring: Boolean,
    $importedFromMint: Boolean,
    $syncedFromInstitution: Boolean,
    $isCredit: Boolean
  ) {
    transactions(
      first: $limit,
      offset: $offset,
      startDate: $startDate,
      endDate: $endDate,
      search: $search,
      categoryIds: $categoryIds,
      accountIds: $accountIds,
      tagIds: $tagIds,
      hasAttachments: $hasAttachments,
      hasNotes: $hasNotes,
      hiddenFromReports: $hiddenFromReports,
      isSplit: $isSplit,
      isRecurring: $isRecurring,
      importedFromMint: $importedFromMint,
      syncedFromInstitution: $syncedFromInstitution,
      isCredit: $isCredit
    ) {
      edges {
        node {
          id
          amount
          date
          merchantName
          categoryId
          category {
            id
            name
            icon
            order
            group {
              id
              name
              type
            }
          }
          accountId
          account {
            id
            displayName
            institutionName
            mask
          }
          notes
          isRecurring
          needsReview
          reviewedAt
          createdAt
          updatedAt
          importedFromMint
          plaidTransactionId
          dataProvider
          dataProviderTransactionId
          hasTags
          tags {
            id
            name
            color
            order
          }
          isHidden
          hiddenAt
          isSplit
          splits {
            id
            amount
            categoryId
            category {
              id
              name
            }
            notes
          }
          originalDescription
          isCashIn
          isCashOut
        }
      }
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`

export const CREATE_TRANSACTION = `
  mutation CreateTransaction(
    $date: String!,
    $accountId: ID!,
    $amount: Float!,
    $merchantName: String!,
    $categoryId: ID,
    $notes: String,
    $updateBalance: Boolean
  ) {
    createTransaction(
      date: $date,
      accountId: $accountId,
      amount: $amount,
      merchantName: $merchantName,
      categoryId: $categoryId,
      notes: $notes,
      updateBalance: $updateBalance
    ) {
      transaction {
        id
        amount
        date
        merchantName
        categoryId
        accountId
        notes
        createdAt
      }
      errors {
        message
        field
      }
    }
  }
`

export const UPDATE_TRANSACTION = `
  mutation UpdateTransaction(
    $id: ID!,
    $amount: Float,
    $date: String,
    $merchantName: String,
    $categoryId: ID,
    $notes: String,
    $isHidden: Boolean,
    $tagIds: [ID!]
  ) {
    updateTransaction(
      id: $id,
      amount: $amount,
      date: $date,
      merchantName: $merchantName,
      categoryId: $categoryId,
      notes: $notes,
      isHidden: $isHidden,
      tagIds: $tagIds
    ) {
      transaction {
        id
        amount
        date
        merchantName
        categoryId
        accountId
        notes
        isHidden
        updatedAt
      }
      errors {
        message
        field
      }
    }
  }
`

export const DELETE_TRANSACTION = `
  mutation DeleteTransaction($id: ID!) {
    deleteTransaction(id: $id) {
      success
      errors {
        message
      }
    }
  }
`

// Budget Operations
export const GET_BUDGETS = `
  query GetBudgets(
    $startDate: String,
    $endDate: String,
    $useLegacyGoals: Boolean,
    $useV2Goals: Boolean
  ) {
    budgets(
      startDate: $startDate,
      endDate: $endDate,
      useLegacyGoals: $useLegacyGoals,
      useV2Goals: $useV2Goals
    ) {
      id
      startDate
      endDate
      categories {
        id
        name
        budgetAmount
        spentAmount
        remainingAmount
        percentSpent
        isFlexible
        flexibleAmounts {
          month
          amount
        }
      }
    }
  }
`

export const SET_BUDGET_AMOUNT = `
  mutation SetBudgetAmount(
    $categoryId: ID!,
    $amount: Float!,
    $startDate: String
  ) {
    setBudgetAmount(
      categoryId: $categoryId,
      amount: $amount,
      startDate: $startDate
    ) {
      budget {
        id
        categories {
          id
          budgetAmount
        }
      }
      errors {
        message
        field
      }
    }
  }
`

// Holdings Operations
export const GET_ACCOUNT_HOLDINGS = `
  query GetAccountHoldings($accountId: ID!) {
    account(id: $accountId) {
      holdings {
        edges {
          node {
            id
            accountId
            securityId
            security {
              id
              symbol
              name
              type
              price
              priceDate
            }
            quantity
            price
            value
            costBasis
            unrealizedGainLoss
            percentOfPortfolio
          }
        }
      }
    }
  }
`

export const CREATE_MANUAL_HOLDING = `
  mutation CreateManualHolding(
    $accountId: ID!,
    $securityId: ID,
    $ticker: String,
    $quantity: Float!
  ) {
    createManualHolding(
      accountId: $accountId,
      securityId: $securityId,
      ticker: $ticker,
      quantity: $quantity
    ) {
      holding {
        id
        accountId
        securityId
        quantity
        security {
          id
          symbol
          name
        }
      }
      errors {
        message
        field
      }
    }
  }
`

export const DELETE_MANUAL_HOLDING = `
  mutation DeleteManualHolding($id: ID!) {
    deleteManualHolding(id: $id) {
      success
      errors {
        message
      }
    }
  }
`

// Category Operations
export const GET_TRANSACTION_CATEGORIES = `
  query GetTransactionCategories {
    transactionCategories {
      id
      name
      icon
      order
      group {
        id
        name
        type
      }
    }
  }
`

export const CREATE_TRANSACTION_CATEGORY = `
  mutation CreateTransactionCategory(
    $name: String!,
    $icon: String,
    $groupId: ID
  ) {
    createTransactionCategory(
      name: $name,
      icon: $icon,
      groupId: $groupId
    ) {
      category {
        id
        name
        icon
        order
      }
      errors {
        message
        field
      }
    }
  }
`

// Goal Operations
export const GET_GOALS = `
  query GetGoals {
    goals {
      id
      name
      targetAmount
      currentAmount
      targetDate
      createdAt
      updatedAt
      completedAt
    }
  }
`

export const CREATE_GOAL = `
  mutation CreateGoal(
    $name: String!,
    $targetAmount: Float!,
    $targetDate: String
  ) {
    createGoal(
      name: $name,
      targetAmount: $targetAmount,
      targetDate: $targetDate
    ) {
      goal {
        id
        name
        targetAmount
        currentAmount
        targetDate
        createdAt
      }
      errors {
        message
        field
      }
    }
  }
`

// Cashflow Operations
export const GET_CASHFLOW = `
  query GetCashflow($startDate: String!, $endDate: String!) {
    cashflow(startDate: $startDate, endDate: $endDate) {
      income
      expenses
      netCashflow
      period
      categories {
        categoryId
        categoryName
        amount
        transactionCount
      }
    }
  }
`

// User Profile Operations
export const GET_ME = `
  query GetMe {
    me {
      id
      email
      firstName
      lastName
      timezone
      subscriptionType
      isMfaEnabled
      createdAt
    }
  }
`

// Institution Operations
export const GET_INSTITUTIONS = `
  query GetInstitutions {
    institutions {
      id
      name
      logo
      url
    }
  }
`

// Merchant Operations
export const GET_MERCHANTS = `
  query GetMerchants {
    merchants {
      id
      name
      transactionCount
      logoUrl
    }
  }
`

// Tag Operations
export const GET_TRANSACTION_TAGS = `
  query GetTransactionTags {
    transactionTags {
      id
      name
      color
      order
    }
  }
`

export const CREATE_TRANSACTION_TAG = `
  mutation CreateTransactionTag($name: String!, $color: String!) {
    createTransactionTag(name: $name, color: $color) {
      tag {
        id
        name
        color
        order
      }
      errors {
        message
        field
      }
    }
  }
`

// Account Type Operations
export const GET_ACCOUNT_TYPE_OPTIONS = `
  query GetAccountTypeOptions {
    accountTypeOptions {
      types {
        id
        name
        display
      }
      subtypes {
        id
        name
        display
        typeId
      }
    }
  }
`

// Recurring Transaction Operations
export const GET_RECURRING_TRANSACTIONS = `
  query GetRecurringTransactions {
    recurringTransactions {
      id
      merchantName
      amount
      categoryId
      category {
        id
        name
      }
      frequency
      nextDate
      isActive
    }
  }
`

// Bills Operations
export const GET_BILLS = `
  query GetBills($startDate: String, $endDate: String) {
    bills(startDate: $startDate, endDate: $endDate) {
      id
      merchantName
      amount
      dueDate
      categoryId
      category {
        id
        name
      }
      isPaid
    }
  }
`

// Net Worth Operations
export const GET_NET_WORTH_HISTORY = `
  query GetNetWorthHistory($startDate: String, $endDate: String) {
    netWorthHistory(startDate: $startDate, endDate: $endDate) {
      date
      netWorth
      assets
      liabilities
    }
  }
`