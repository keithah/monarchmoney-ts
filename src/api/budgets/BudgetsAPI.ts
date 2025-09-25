import { GraphQLClient } from '../../client/graphql'
import { 
  BudgetItem,
  Goal,
  CashFlowData,
  CashFlowSummary,
  BillsData
} from '../../types'
import {
  validateDate,
  validateDateRange,
  logger
} from '../../utils'

export interface BudgetsAPI {
  // Budget management
  getBudgets(options?: BudgetOptions): Promise<BudgetData>
  setBudgetAmount(params: BudgetAmountParams): Promise<BudgetItem>

  // Goals management  
  getGoals(): Promise<Goal[]>
  createGoal(params: CreateGoalParams): Promise<CreateGoalResponse>
  updateGoal(goalId: string, updates: UpdateGoalParams): Promise<UpdateGoalResponse>
  deleteGoal(goalId: string): Promise<boolean>

  // Cash flow analysis
  getCashFlow(options?: CashFlowOptions): Promise<CashFlowData>
  getCashFlowSummary(options?: CashFlowSummaryOptions): Promise<CashFlowSummary>

  // Bills tracking
  getBills(options?: BillsOptions): Promise<BillsData>
}

// Input/Options interfaces
export interface BudgetOptions {
  startDate?: string
  endDate?: string
  categoryIds?: string[]
}

export interface BudgetData {
  budgetSystem: string
  budgetData: BudgetCategory[]
  categoryGroups: BudgetCategoryGroup[]
  goalsV2?: Goal[]
}

export interface BudgetCategory {
  categoryId: string
  categoryName: string
  plannedAmount: number
  actualAmount: number
  remainingAmount: number
  percentSpent: number
}

export interface BudgetCategoryGroup {
  id: string
  name: string
  categories: BudgetCategory[]
}

export interface BudgetAmountParams {
  amount: number
  categoryId?: string
  categoryGroupId?: string
  timeframe?: string
  startDate?: string
  applyToFuture?: boolean
}

export interface CreateGoalParams {
  name: string
  targetAmount: number
  targetDate?: string
  description?: string
  categoryId?: string
  accountIds?: string[]
}

export interface CreateGoalResponse {
  goal: Goal
  errors?: any[]
}

export interface UpdateGoalParams {
  name?: string
  targetAmount?: number
  targetDate?: string
  description?: string
  isCompleted?: boolean
}

export interface UpdateGoalResponse {
  goal: Goal
  errors?: any[]
}

export interface CashFlowOptions {
  startDate?: string
  endDate?: string
  groupBy?: string
  limit?: number
}

export interface CashFlowSummaryOptions {
  startDate?: string
  endDate?: string
}

export interface BillsOptions {
  startDate?: string
  endDate?: string
  includeCompleted?: boolean
  limit?: number
}

export class BudgetsAPIImpl implements BudgetsAPI {
  constructor(private graphql: GraphQLClient) {}

  async getBudgets(options: BudgetOptions = {}): Promise<BudgetData> {
    const { startDate, endDate, categoryIds } = options

    if (startDate && endDate) {
      validateDateRange(startDate, endDate)
    }

    const query = `
      query GetBudgets($startDate: String, $endDate: String, $categoryIds: [String]) {
        budgetData(startDate: $startDate, endDate: $endDate, categoryIds: $categoryIds) {
          budgetSystem
          budgetItems {
            categoryId
            categoryName
            plannedAmount
            actualAmount
            remainingAmount
            percentSpent
          }
          categoryGroups {
            id
            name
            categories {
              categoryId
              categoryName
              plannedAmount
              actualAmount
              remainingAmount
              percentSpent
            }
          }
          goalsV2 {
            id
            name
            description
            targetAmount
            currentAmount
            targetDate
            progress
          }
        }
      }
    `

    const data = await this.graphql.query<{
      budgetData: BudgetData
    }>(query, { startDate, endDate, categoryIds })

    logger.debug('Retrieved budget data')
    return data.budgetData
  }

  async setBudgetAmount(params: BudgetAmountParams): Promise<BudgetItem> {
    const {
      amount,
      categoryId,
      categoryGroupId,
      timeframe = 'month',
      startDate,
      applyToFuture = false
    } = params

    if (categoryId && categoryGroupId) {
      throw new Error('Cannot specify both categoryId and categoryGroupId')
    }

    if (!categoryId && !categoryGroupId) {
      throw new Error('Must specify either categoryId or categoryGroupId')
    }

    if (startDate) {
      validateDate(startDate)
    }

    const mutation = `
      mutation UpdateBudgetItem(
        $amount: Float!
        $categoryId: String
        $categoryGroupId: String
        $timeframe: String!
        $startDate: String
        $applyToFuture: Boolean!
      ) {
        updateBudgetItem(
          amount: $amount
          categoryId: $categoryId
          categoryGroupId: $categoryGroupId
          timeframe: $timeframe
          startDate: $startDate
          applyToFuture: $applyToFuture
        ) {
          budgetItem {
            id
            amount
            categoryId
            categoryGroupId
            timeframe
            startDate
            endDate
          }
          errors {
            field
            messages
          }
        }
      }
    `

    const result = await this.graphql.mutation<{
      updateBudgetItem: {
        budgetItem: BudgetItem
        errors: any[]
      }
    }>(mutation, { amount, categoryId, categoryGroupId, timeframe, startDate, applyToFuture })

    if (result.updateBudgetItem.errors?.length > 0) {
      throw new Error(`Budget update failed: ${result.updateBudgetItem.errors[0].messages.join(', ')}`)
    }

    logger.info('Budget amount updated successfully')
    return result.updateBudgetItem.budgetItem
  }

  async getGoals(): Promise<Goal[]> {
    const query = `
      query GetGoals {
        goals {
          id
          name
          description
          targetAmount
          currentAmount
          targetDate
          createdAt
          updatedAt
          completedAt
          progress
          category {
            id
            name
          }
          accounts {
            id
            displayName
          }
        }
      }
    `

    const data = await this.graphql.query<{
      goals: Goal[]
    }>(query)

    return data.goals
  }

  async createGoal(params: CreateGoalParams): Promise<CreateGoalResponse> {
    const { name, targetAmount, targetDate, description, categoryId, accountIds } = params

    if (name.length < 1 || name.length > 100) {
      throw new Error('Goal name must be between 1 and 100 characters')
    }

    if (description && description.length > 500) {
      throw new Error('Goal description must be 500 characters or less')
    }

    if (targetDate) {
      validateDate(targetDate)
    }

    const mutation = `
      mutation CreateGoal(
        $name: String!
        $targetAmount: Float!
        $targetDate: String
        $description: String
        $categoryId: String
        $accountIds: [String!]
      ) {
        createGoal(
          name: $name
          targetAmount: $targetAmount
          targetDate: $targetDate
          description: $description
          categoryId: $categoryId
          accountIds: $accountIds
        ) {
          goal {
            id
            name
            description
            targetAmount
            currentAmount
            targetDate
            progress
            createdAt
            category {
              id
              name
            }
            accounts {
              id
              displayName
            }
          }
          errors {
            field
            messages
          }
        }
      }
    `

    const result = await this.graphql.mutation<{
      createGoal: CreateGoalResponse
    }>(mutation, { name, targetAmount, targetDate, description, categoryId, accountIds })

    if (result.createGoal.errors && result.createGoal.errors.length > 0) {
      throw new Error(`Goal creation failed: ${result.createGoal.errors[0].messages.join(', ')}`)
    }

    logger.info('Goal created successfully:', result.createGoal.goal.id)
    return result.createGoal
  }

  async updateGoal(goalId: string, updates: UpdateGoalParams): Promise<UpdateGoalResponse> {
    if (updates.name && (updates.name.length < 1 || updates.name.length > 100)) {
      throw new Error('Goal name must be between 1 and 100 characters')
    }

    if (updates.description && updates.description.length > 500) {
      throw new Error('Goal description must be 500 characters or less')
    }

    if (updates.targetDate) {
      validateDate(updates.targetDate)
    }

    const mutation = `
      mutation UpdateGoal(
        $goalId: String!
        $name: String
        $targetAmount: Float
        $targetDate: String
        $description: String
        $isCompleted: Boolean
      ) {
        updateGoal(
          goalId: $goalId
          name: $name
          targetAmount: $targetAmount
          targetDate: $targetDate
          description: $description
          isCompleted: $isCompleted
        ) {
          goal {
            id
            name
            description
            targetAmount
            currentAmount
            targetDate
            progress
            completedAt
            updatedAt
          }
          errors {
            field
            messages
          }
        }
      }
    `

    const result = await this.graphql.mutation<{
      updateGoal: UpdateGoalResponse
    }>(mutation, { goalId, ...updates })

    if (result.updateGoal.errors && result.updateGoal.errors.length > 0) {
      throw new Error(`Goal update failed: ${result.updateGoal.errors[0].messages.join(', ')}`)
    }

    logger.info('Goal updated successfully:', goalId)
    return result.updateGoal
  }

  async deleteGoal(goalId: string): Promise<boolean> {
    const mutation = `
      mutation DeleteGoal($goalId: String!) {
        deleteGoal(goalId: $goalId) {
          deleted
          errors {
            field
            messages
          }
        }
      }
    `

    const result = await this.graphql.mutation<{
      deleteGoal: {
        deleted: boolean
        errors: any[]
      }
    }>(mutation, { goalId })

    if (result.deleteGoal.errors?.length > 0) {
      throw new Error(`Goal deletion failed: ${result.deleteGoal.errors[0].messages.join(', ')}`)
    }

    logger.info('Goal deleted successfully:', goalId)
    return result.deleteGoal.deleted
  }

  async getCashFlow(options: CashFlowOptions = {}): Promise<CashFlowData> {
    const { startDate, endDate, groupBy = 'month', limit = 100 } = options

    if (startDate && endDate) {
      validateDateRange(startDate, endDate)
    }

    const query = `
      query GetCashFlow(
        $startDate: String
        $endDate: String
        $groupBy: String!
        $limit: Int
      ) {
        cashFlow(
          startDate: $startDate
          endDate: $endDate
          groupBy: $groupBy
          limit: $limit
        ) {
          totalIncome
          totalExpenses
          netCashFlow
          periods {
            period
            income
            expenses
            netCashFlow
          }
          categories {
            categoryId
            categoryName
            totalAmount
            transactionCount
          }
        }
      }
    `

    const data = await this.graphql.query<{
      cashFlow: CashFlowData
    }>(query, { startDate, endDate, groupBy, limit })

    logger.debug('Retrieved cash flow data')
    return data.cashFlow
  }

  async getCashFlowSummary(options: CashFlowSummaryOptions = {}): Promise<CashFlowSummary> {
    const { startDate, endDate } = options

    if (startDate && endDate) {
      validateDateRange(startDate, endDate)
    }

    const query = `
      query GetCashFlowSummary($startDate: String, $endDate: String) {
        cashFlowSummary(startDate: $startDate, endDate: $endDate) {
          totalIncome
          totalExpenses
          netCashFlow
          averageMonthlyIncome
          averageMonthlyExpenses
          averageMonthlyNetCashFlow
          periodCount
        }
      }
    `

    const data = await this.graphql.query<{
      cashFlowSummary: CashFlowSummary
    }>(query, { startDate, endDate })

    return data.cashFlowSummary
  }

  async getBills(options: BillsOptions = {}): Promise<BillsData> {
    const { startDate, endDate, includeCompleted = false, limit = 100 } = options

    if (startDate && endDate) {
      validateDateRange(startDate, endDate)
    }

    const query = `
      query GetBills(
        $startDate: String
        $endDate: String
        $includeCompleted: Boolean!
        $limit: Int
      ) {
        bills(
          startDate: $startDate
          endDate: $endDate
          includeCompleted: $includeCompleted
          limit: $limit
        ) {
          totalAmount
          totalCount
          overdueBills
          upcomingBills
          bills {
            id
            merchant {
              name
            }
            amount
            dueDate
            isPaid
            isOverdue
            category {
              id
              name
            }
            account {
              id
              displayName
            }
            recurringRule {
              frequency
              nextDate
            }
          }
        }
      }
    `

    const data = await this.graphql.query<{
      bills: BillsData
    }>(query, { startDate, endDate, includeCompleted, limit })

    logger.debug('Retrieved bills data')
    return data.bills
  }
}