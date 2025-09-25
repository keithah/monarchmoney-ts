import { MonarchClient } from '../src/client/MonarchClient'

describe('Integration Tests', () => {
  let client: MonarchClient

  // These tests require live credentials in .env file
  const hasCredentials = process.env.MONARCH_EMAIL && 
                        process.env.MONARCH_PASSWORD && 
                        process.env.MONARCH_MFA_SECRET

  beforeAll(() => {
    if (!hasCredentials) {
      console.warn('Skipping integration tests - no credentials provided')
      return
    }

    client = new MonarchClient({
      baseURL: 'https://api.monarchmoney.com',
      timeout: 30000,
      retries: 1
    })
  })

  describe('Authentication', () => {
    it.skip('should authenticate with live credentials', async () => {
      if (!hasCredentials) return

      await client.login({
        email: process.env.MONARCH_EMAIL!,
        password: process.env.MONARCH_PASSWORD!,
        mfaSecretKey: process.env.MONARCH_MFA_SECRET!,
        useSavedSession: false,
        saveSession: false
      })

      const sessionInfo = client.getSessionInfo()
      expect(sessionInfo.isValid).toBe(true)
    }, 60000)

    it.skip('should handle session persistence', async () => {
      if (!hasCredentials) return

      await client.login({
        email: process.env.MONARCH_EMAIL!,
        password: process.env.MONARCH_PASSWORD!,
        mfaSecretKey: process.env.MONARCH_MFA_SECRET!,
        saveSession: true
      })

      // Create new client and load session
      const client2 = new MonarchClient()
      const loaded = client2.loadSession()
      expect(loaded).toBe(true)
    }, 60000)
  })

  describe('Accounts API', () => {
    beforeEach(async () => {
      if (!hasCredentials) return
      
      await client.login({
        email: process.env.MONARCH_EMAIL!,
        password: process.env.MONARCH_PASSWORD!,
        mfaSecretKey: process.env.MONARCH_MFA_SECRET!
      })
    })

    it.skip('should fetch all accounts', async () => {
      if (!hasCredentials) return

      const accounts = await client.accounts.getAll()
      expect(Array.isArray(accounts)).toBe(true)
      expect(accounts.length).toBeGreaterThan(0)
      
      // Verify account structure
      const account = accounts[0]
      expect(account).toHaveProperty('id')
      expect(account).toHaveProperty('displayName')
      expect(account).toHaveProperty('currentBalance')
      expect(account).toHaveProperty('type')
    }, 30000)

    it.skip('should fetch account by ID', async () => {
      if (!hasCredentials) return

      const accounts = await client.accounts.getAll()
      expect(accounts.length).toBeGreaterThan(0)
      
      const account = await client.accounts.getById(accounts[0].id)
      expect(account.id).toBe(accounts[0].id)
      expect(account.displayName).toBe(accounts[0].displayName)
    }, 30000)
  })

  describe('Transactions API', () => {
    beforeEach(async () => {
      if (!hasCredentials) return
      
      await client.login({
        email: process.env.MONARCH_EMAIL!,
        password: process.env.MONARCH_PASSWORD!,
        mfaSecretKey: process.env.MONARCH_MFA_SECRET!
      })
    })

    it.skip('should fetch transactions', async () => {
      if (!hasCredentials) return

      const transactions = await client.transactions.getAll({
        limit: 10
      })
      
      expect(Array.isArray(transactions)).toBe(true)
      expect(transactions.length).toBeLessThanOrEqual(10)
      
      if (transactions.length > 0) {
        const transaction = transactions[0]
        expect(transaction).toHaveProperty('id')
        expect(transaction).toHaveProperty('description')
        expect(transaction).toHaveProperty('amount')
        expect(transaction).toHaveProperty('date')
      }
    }, 30000)

    it.skip('should search transactions', async () => {
      if (!hasCredentials) return

      const transactions = await client.transactions.getAll({
        limit: 5,
        search: 'coffee'
      })
      
      expect(Array.isArray(transactions)).toBe(true)
    }, 30000)
  })

  describe('Budgets API', () => {
    beforeEach(async () => {
      if (!hasCredentials) return
      
      await client.login({
        email: process.env.MONARCH_EMAIL!,
        password: process.env.MONARCH_PASSWORD!,
        mfaSecretKey: process.env.MONARCH_MFA_SECRET!
      })
    })

    it.skip('should fetch budgets', async () => {
      if (!hasCredentials) return

      const budgets = await client.budgets.getAll()
      expect(Array.isArray(budgets)).toBe(true)
      
      if (budgets.length > 0) {
        const budget = budgets[0]
        expect(budget).toHaveProperty('id')
        expect(budget).toHaveProperty('name')
      }
    }, 30000)
  })

  describe('Rate Limiting', () => {
    beforeEach(async () => {
      if (!hasCredentials) return
      
      await client.login({
        email: process.env.MONARCH_EMAIL!,
        password: process.env.MONARCH_PASSWORD!,
        mfaSecretKey: process.env.MONARCH_MFA_SECRET!
      })
    })

    it.skip('should handle rapid requests without rate limiting errors', async () => {
      if (!hasCredentials) return

      // Make multiple rapid requests
      const promises = Array.from({ length: 5 }, () => 
        client.accounts.getAll()
      )
      
      const results = await Promise.allSettled(promises)
      const failures = results.filter(r => r.status === 'rejected')
      
      // Should not have rate limit errors due to built-in throttling
      expect(failures.length).toBe(0)
    }, 60000)
  })

  afterAll(() => {
    if (client) {
      client.deleteSession()
    }
  })
})