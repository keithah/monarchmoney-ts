// GraphQL Operations and Queries

// Account Operations
export const GET_ACCOUNTS = `
  query GetAccounts {
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
      holdingsCount
      manualInvestmentsTrackingMethod
      order
      logoUrl
      type {
        name
        display
        __typename
      }
      subtype {
        name
        display
        __typename
      }
      credential {
        id
        updateRequired
        disconnectedFromDataProviderAt
        dataProvider
        institution {
          id
          plaidInstitutionId
          name
          status
          __typename
        }
        __typename
      }
      institution {
        id
        name
        primaryColor
        url
        __typename
      }
      __typename
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
  query Web_GetTransactionsList(
    $offset: Int,
    $limit: Int,
    $filters: TransactionFilterInput,
    $orderBy: TransactionOrdering
  ) {
    allTransactions(filters: $filters) {
      totalCount
      totalSelectableCount
      results(offset: $offset, limit: $limit, orderBy: $orderBy) {
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
        attachments {
          id
          __typename
        }
        isSplitTransaction
        createdAt
        updatedAt
        category {
          id
          name
          __typename
        }
        merchant {
          name
          id
          transactionsCount
          __typename
        }
        account {
          id
          displayName
          __typename
        }
        __typename
      }
      __typename
    }
    transactionRules {
      id
      __typename
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
  query GetCategories {
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
        __typename
      }
      __typename
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
  query Common_GetMe {
    me {
      id
      birthday
      email
      isSuperuser
      name
      timezone
      hasPassword
      hasMfaOn
      externalAuthProviderNames
      pendingEmailUpdateVerification {
        email
        __typename
      }
      profilePicture {
        id
        cloudinaryPublicId
        thumbnailUrl
        __typename
      }
      profilePictureUrl
      activeSupportAccountAccessGrant {
        id
        createdAt
        expiresAt
        __typename
      }
      profile {
        id
        hasSeenCategoriesManagementTour
        dismissedTransactionsListUpdatesTourAt
        viewedMarkAsReviewedUpdatesCalloutAt
        hasDismissedWhatsNewAt
        __typename
      }
      __typename
    }
  }
`

// Institution Operations
export const GET_INSTITUTIONS = `
  query GetInstitutions {
    institutions {
      id
      name
      logo {
        url
        __typename
      }
      primaryColor
      __typename
    }
  }
`

// Merchant Operations
export const GET_MERCHANTS = `
  query GetMerchantsSearch($search: String, $limit: Int, $includeIds: [ID!]) {
    merchants(
      search: $search
      limit: $limit
      orderBy: TRANSACTION_COUNT
      includeIds: $includeIds
    ) {
      id
      name
      transactionCount
      __typename
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