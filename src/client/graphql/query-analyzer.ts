// GraphQL Query Analyzer for Payload Size Estimation and Optimization
// Helps identify heavy queries and suggests optimizations for MCP usage

export interface QueryMetrics {
  estimatedResponseSize: number // in KB
  fieldCount: number
  complexityScore: number
  heavyFields: string[]
  suggestions: string[]
}

export interface FieldWeight {
  name: string
  estimatedSizeKB: number
  complexity: number
}

// Field weight database based on typical Monarch Money response sizes
export const FIELD_WEIGHTS: Record<string, FieldWeight> = {
  // Lightweight fields (< 0.1KB each)
  'id': { name: 'id', estimatedSizeKB: 0.05, complexity: 1 },
  'name': { name: 'name', estimatedSizeKB: 0.1, complexity: 1 },
  'amount': { name: 'amount', estimatedSizeKB: 0.05, complexity: 1 },
  'date': { name: 'date', estimatedSizeKB: 0.05, complexity: 1 },
  'displayName': { name: 'displayName', estimatedSizeKB: 0.1, complexity: 1 },
  'currentBalance': { name: 'currentBalance', estimatedSizeKB: 0.05, complexity: 1 },
  'pending': { name: 'pending', estimatedSizeKB: 0.02, complexity: 1 },

  // Medium fields (0.1-1KB each)
  'notes': { name: 'notes', estimatedSizeKB: 0.5, complexity: 2 },
  'merchantName': { name: 'merchantName', estimatedSizeKB: 0.2, complexity: 1 },
  'plaidName': { name: 'plaidName', estimatedSizeKB: 0.3, complexity: 1 },
  'description': { name: 'description', estimatedSizeKB: 0.4, complexity: 2 },
  'mask': { name: 'mask', estimatedSizeKB: 0.1, complexity: 1 },

  // Nested objects (1-5KB each)
  'category': { name: 'category', estimatedSizeKB: 2, complexity: 5 },
  'merchant': { name: 'merchant', estimatedSizeKB: 1.5, complexity: 4 },
  'account': { name: 'account', estimatedSizeKB: 3, complexity: 6 },
  'institution': { name: 'institution', estimatedSizeKB: 2.5, complexity: 5 },
  'credential': { name: 'credential', estimatedSizeKB: 4, complexity: 7 },
  'type': { name: 'type', estimatedSizeKB: 1, complexity: 3 },
  'subtype': { name: 'subtype', estimatedSizeKB: 1, complexity: 3 },

  // Heavy fields (5-20KB each)
  'attachments': { name: 'attachments', estimatedSizeKB: 15, complexity: 15 },
  'holdings': { name: 'holdings', estimatedSizeKB: 25, complexity: 20 },
  'transactions': { name: 'transactions', estimatedSizeKB: 50, complexity: 30 },
  'budgets': { name: 'budgets', estimatedSizeKB: 10, complexity: 12 },

  // Arrays/collections multipliers
  'categories': { name: 'categories', estimatedSizeKB: 5, complexity: 8 },
  'accounts': { name: 'accounts', estimatedSizeKB: 8, complexity: 10 },
  'results': { name: 'results', estimatedSizeKB: 2, complexity: 5 } // per item multiplier
}

export class QueryAnalyzer {
  // Analyze a GraphQL query string
  analyzeQuery(query: string, estimatedResultCount: number = 1): QueryMetrics {
    const fields = this.extractFields(query)
    const metrics = this.calculateMetrics(fields, estimatedResultCount)

    return {
      ...metrics,
      suggestions: this.generateSuggestions(fields, metrics)
    }
  }

  // Extract field names from GraphQL query
  private extractFields(query: string): string[] {
    const fields: string[] = []

    // Remove comments and normalize whitespace
    const cleanQuery = query
      .replace(/#[^\n\r]*/g, '')
      .replace(/\s+/g, ' ')
      .trim()

    // Extract field names (simplified parser)
    const fieldRegex = /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(?:\([^)]*\))?\s*\{?/g
    let match

    while ((match = fieldRegex.exec(cleanQuery)) !== null) {
      const field = match[1]
      // Skip GraphQL keywords
      if (!['query', 'mutation', 'subscription', 'fragment', 'on'].includes(field)) {
        fields.push(field)
      }
    }

    return [...new Set(fields)] // Remove duplicates
  }

  // Calculate query metrics
  private calculateMetrics(fields: string[], estimatedResultCount: number): Omit<QueryMetrics, 'suggestions'> {
    let totalSize = 0
    let complexityScore = 0
    const heavyFields: string[] = []

    for (const field of fields) {
      const weight = FIELD_WEIGHTS[field] || { name: field, estimatedSizeKB: 1, complexity: 3 }

      let fieldSize = weight.estimatedSizeKB
      let fieldComplexity = weight.complexity

      // Apply multipliers for collections
      if (['results', 'transactions', 'accounts', 'categories'].includes(field)) {
        fieldSize *= estimatedResultCount
        fieldComplexity *= Math.min(estimatedResultCount, 10) // Cap complexity multiplier
      }

      totalSize += fieldSize
      complexityScore += fieldComplexity

      // Mark heavy fields (>5KB estimated)
      if (fieldSize > 5) {
        heavyFields.push(field)
      }
    }

    return {
      estimatedResponseSize: Math.round(totalSize * 100) / 100, // Round to 2 decimals
      fieldCount: fields.length,
      complexityScore: Math.round(complexityScore),
      heavyFields
    }
  }

  // Generate optimization suggestions
  private generateSuggestions(fields: string[], metrics: Omit<QueryMetrics, 'suggestions'>): string[] {
    const suggestions: string[] = []

    // Size-based suggestions
    if (metrics.estimatedResponseSize > 100) {
      suggestions.push(`Large payload (${metrics.estimatedResponseSize}KB). Consider splitting into multiple queries`)
    }

    // Specific field suggestions
    if (fields.includes('attachments')) {
      suggestions.push('Remove attachments field - adds ~15KB per transaction')
    }

    if (fields.includes('holdings') && fields.includes('transactions')) {
      suggestions.push('Avoid querying holdings and transactions together - very heavy')
    }

    if (fields.includes('notes') && fields.length > 10) {
      suggestions.push('Consider removing notes field for list queries')
    }

    // Nested object suggestions
    const nestedFields = fields.filter(f => ['category', 'merchant', 'account', 'institution'].includes(f))
    if (nestedFields.length > 2) {
      suggestions.push(`Limit nested objects: ${nestedFields.join(', ')}`)
    }

    // Complexity suggestions
    if (metrics.complexityScore > 50) {
      suggestions.push('High complexity query - consider using field presets')
    }

    if (fields.length > 15) {
      suggestions.push('Many fields selected - use field presets for common patterns')
    }

    return suggestions
  }

  // Compare two queries
  compareQueries(query1: string, query2: string, resultCount: number = 1): {
    query1: QueryMetrics
    query2: QueryMetrics
    recommendation: string
  } {
    const metrics1 = this.analyzeQuery(query1, resultCount)
    const metrics2 = this.analyzeQuery(query2, resultCount)

    let recommendation = ''
    if (metrics1.estimatedResponseSize < metrics2.estimatedResponseSize * 0.8) {
      recommendation = 'Query 1 is significantly lighter'
    } else if (metrics2.estimatedResponseSize < metrics1.estimatedResponseSize * 0.8) {
      recommendation = 'Query 2 is significantly lighter'
    } else {
      recommendation = 'Queries have similar payload sizes'
    }

    return {
      query1: metrics1,
      query2: metrics2,
      recommendation
    }
  }
}

// Quick analysis functions for common patterns
export class QuickAnalyzer {
  private analyzer = new QueryAnalyzer()

  // Analyze transaction queries with different result counts
  analyzeTransactionQuery(query: string, options: {
    light?: number    // 1-25 results
    medium?: number   // 26-100 results
    heavy?: number    // 101+ results
  } = {}): Record<string, QueryMetrics> {
    const counts = {
      light: options.light || 10,
      medium: options.medium || 50,
      heavy: options.heavy || 200
    }

    const results: Record<string, QueryMetrics> = {}

    for (const [size, count] of Object.entries(counts)) {
      results[size] = this.analyzer.analyzeQuery(query, count)
    }

    return results
  }

  // Get optimization recommendations for MCP usage
  getMCPRecommendations(query: string): {
    isOptimized: boolean
    payloadSize: number
    recommendations: string[]
    optimizedQuery?: string
  } {
    const metrics = this.analyzer.analyzeQuery(query, 25) // Assume 25 results for MCP

    const isOptimized = metrics.estimatedResponseSize < 50 && metrics.complexityScore < 30

    let optimizedQuery: string | undefined
    if (!isOptimized) {
      // Generate a lighter version of the query
      optimizedQuery = this.generateLightQuery(query)
    }

    return {
      isOptimized,
      payloadSize: metrics.estimatedResponseSize,
      recommendations: [
        ...metrics.suggestions,
        ...(metrics.estimatedResponseSize > 50 ? ['Consider using MCP_OPTIMIZED_QUERIES from field-selectors.ts'] : [])
      ],
      optimizedQuery
    }
  }

  // Generate a lighter version of a query
  private generateLightQuery(query: string): string {
    // This is a simplified version - could be more sophisticated
    return query
      .replace(/attachments\s*\{[^}]*\}/g, '') // Remove attachments
      .replace(/notes/g, '') // Remove notes
      .replace(/plaidName/g, '') // Remove plaidName
      .replace(/,\s*,/g, ',') // Clean up extra commas
      .replace(/\{\s*,/g, '{') // Clean up leading commas
      .replace(/,\s*\}/g, '}') // Clean up trailing commas
  }
}

export { QueryAnalyzer as default }