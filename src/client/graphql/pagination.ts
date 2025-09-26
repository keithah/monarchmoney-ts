// Pagination Utilities for Efficient Data Fetching
// Supports both offset-based and cursor-based pagination patterns

export interface PaginationOptions {
  limit?: number
  offset?: number
  cursor?: string
  direction?: 'forward' | 'backward'
}

export interface PageInfo {
  hasNextPage: boolean
  hasPreviousPage?: boolean
  startCursor?: string
  endCursor?: string
  totalCount?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pageInfo: PageInfo
  totalCount?: number
}

// Cursor-based pagination handler
export class CursorPagination<T> {
  private currentCursor?: string
  private pageSize: number
  private direction: 'forward' | 'backward'

  constructor(pageSize: number = 25, direction: 'forward' | 'backward' = 'forward') {
    this.pageSize = pageSize
    this.direction = direction
  }

  // Generate cursor-based query variables
  getVariables(cursor?: string): Record<string, any> {
    const variables: Record<string, any> = {}

    if (this.direction === 'forward') {
      variables.first = this.pageSize
      if (cursor) variables.after = cursor
    } else {
      variables.last = this.pageSize
      if (cursor) variables.before = cursor
    }

    return variables
  }

  // Process paginated response and update cursor
  processResponse(response: any): PaginatedResponse<T> {
    const pageInfo = response.pageInfo || {}
    const edges = response.edges || []
    const data = edges.map((edge: any) => edge.node)

    // Update current cursor
    if (this.direction === 'forward' && pageInfo.endCursor) {
      this.currentCursor = pageInfo.endCursor
    } else if (this.direction === 'backward' && pageInfo.startCursor) {
      this.currentCursor = pageInfo.startCursor
    }

    return {
      data,
      pageInfo,
      totalCount: response.totalCount
    }
  }

  getCurrentCursor(): string | undefined {
    return this.currentCursor
  }

  hasNextPage(pageInfo: PageInfo): boolean {
    return this.direction === 'forward' ? pageInfo.hasNextPage : !!pageInfo.hasPreviousPage
  }
}

// Offset-based pagination handler
export class OffsetPagination<T> {
  private currentOffset: number = 0
  private pageSize: number
  private totalCount?: number

  constructor(pageSize: number = 25) {
    this.pageSize = pageSize
  }

  // Generate offset-based query variables
  getVariables(offset?: number): Record<string, any> {
    const actualOffset = offset ?? this.currentOffset
    return {
      limit: this.pageSize,
      offset: actualOffset
    }
  }

  // Process paginated response and update offset
  processResponse(response: any, requestedOffset?: number): PaginatedResponse<T> {
    const results = response.results || response.data || []
    const totalCount = response.totalCount || response.total

    // Update pagination state
    this.totalCount = totalCount
    if (requestedOffset !== undefined) {
      this.currentOffset = requestedOffset
    }

    const hasNextPage = totalCount ? (this.currentOffset + this.pageSize) < totalCount : results.length === this.pageSize
    const hasPreviousPage = this.currentOffset > 0

    return {
      data: results,
      pageInfo: {
        hasNextPage,
        hasPreviousPage,
        totalCount
      },
      totalCount
    }
  }

  // Navigation methods
  nextPage(): Record<string, any> {
    this.currentOffset += this.pageSize
    return this.getVariables()
  }

  previousPage(): Record<string, any> {
    this.currentOffset = Math.max(0, this.currentOffset - this.pageSize)
    return this.getVariables()
  }

  goToPage(pageNumber: number): Record<string, any> {
    this.currentOffset = (pageNumber - 1) * this.pageSize
    return this.getVariables()
  }

  getCurrentPage(): number {
    return Math.floor(this.currentOffset / this.pageSize) + 1
  }

  getTotalPages(): number | undefined {
    return this.totalCount ? Math.ceil(this.totalCount / this.pageSize) : undefined
  }

  reset(): void {
    this.currentOffset = 0
    this.totalCount = undefined
  }
}

// Smart pagination that adapts to the GraphQL schema
export class AdaptivePagination<T> {
  private cursorPagination?: CursorPagination<T>
  private offsetPagination?: OffsetPagination<T>
  private mode: 'cursor' | 'offset'

  constructor(pageSize: number = 25, preferredMode: 'cursor' | 'offset' = 'offset') {
    this.mode = preferredMode

    if (preferredMode === 'cursor') {
      this.cursorPagination = new CursorPagination<T>(pageSize)
    } else {
      this.offsetPagination = new OffsetPagination<T>(pageSize)
    }
  }

  // Auto-detect pagination mode from query string
  static detectPaginationMode(query: string): 'cursor' | 'offset' {
    if (query.includes('edges') && query.includes('pageInfo')) {
      return 'cursor'
    }
    return 'offset'
  }

  getVariables(cursor?: string, offset?: number): Record<string, any> {
    if (this.mode === 'cursor' && this.cursorPagination) {
      return this.cursorPagination.getVariables(cursor)
    } else if (this.offsetPagination) {
      return this.offsetPagination.getVariables(offset)
    }
    return {}
  }

  processResponse(response: any, requestedOffset?: number): PaginatedResponse<T> {
    if (this.mode === 'cursor' && this.cursorPagination) {
      return this.cursorPagination.processResponse(response)
    } else if (this.offsetPagination) {
      return this.offsetPagination.processResponse(response, requestedOffset)
    }

    // Fallback
    return {
      data: [],
      pageInfo: { hasNextPage: false }
    }
  }
}

// Batch fetcher for large datasets
export class BatchDataFetcher<T> {
  private batchSize: number
  private maxConcurrent: number

  constructor(batchSize: number = 100, maxConcurrent: number = 3) {
    this.batchSize = batchSize
    this.maxConcurrent = maxConcurrent
  }

  async *fetchAll<R>(
    fetcher: (variables: Record<string, any>) => Promise<R>,
    extractData: (response: R) => { data: T[], hasMore: boolean, nextOffset?: number },
    startOffset: number = 0
  ): AsyncGenerator<T[], void, unknown> {
    let offset = startOffset
    let hasMore = true

    while (hasMore) {
      // Prepare batch requests
      const batchRequests: Promise<R>[] = []
      const batchOffsets: number[] = []

      for (let i = 0; i < this.maxConcurrent && hasMore; i++) {
        batchOffsets.push(offset)
        batchRequests.push(
          fetcher({
            limit: this.batchSize,
            offset: offset
          })
        )
        offset += this.batchSize
      }

      // Execute batch
      const responses = await Promise.allSettled(batchRequests)

      for (let i = 0; i < responses.length; i++) {
        const result = responses[i]
        if (result.status === 'fulfilled') {
          const { data, hasMore: batchHasMore } = extractData(result.value)

          if (data.length > 0) {
            yield data
          }

          // Update hasMore based on last successful batch
          if (i === responses.length - 1) {
            hasMore = batchHasMore && data.length === this.batchSize
          }
        } else {
          // Handle failed batch - could implement retry logic
          console.warn(`Batch failed at offset ${batchOffsets[i]}:`, result.reason)
          hasMore = false
        }
      }
    }
  }
}

// Query templates optimized for different pagination patterns
export const PAGINATED_QUERIES = {
  // Offset-based transaction pagination (matches your current pattern)
  transactionsOffset: `
    query GetTransactionsPaginated(
      $offset: Int = 0,
      $limit: Int = 25,
      $filters: TransactionFilterInput,
      $orderBy: TransactionOrdering
    ) {
      allTransactions(filters: $filters) {
        totalCount
        results(offset: $offset, limit: $limit, orderBy: $orderBy) {
          id
          amount
          date
          category { id name }
          merchant { id name }
          account { id displayName }
        }
      }
    }
  `,

  // Cursor-based pattern (if Monarch supports it)
  transactionsCursor: `
    query GetTransactionsCursor(
      $first: Int = 25,
      $after: String,
      $filters: TransactionFilterInput
    ) {
      allTransactions(filters: $filters) {
        totalCount
        pageInfo {
          hasNextPage
          endCursor
        }
        edges {
          cursor
          node {
            id
            amount
            date
            category { id name }
            merchant { id name }
            account { id displayName }
          }
        }
      }
    }
  `,

  // Lightweight account pagination
  accountsPaginated: `
    query GetAccountsPaginated($limit: Int = 50, $offset: Int = 0) {
      accounts(limit: $limit, offset: $offset) {
        id
        displayName
        currentBalance
        type { display }
      }
    }
  `
}

export { AdaptivePagination as default }