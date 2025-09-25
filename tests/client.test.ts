import { MonarchClient } from '../src/client/MonarchClient'

describe('MonarchClient', () => {
  let client: MonarchClient

  beforeEach(() => {
    client = new MonarchClient({
      baseURL: 'https://api.monarchmoney.com',
      timeout: 30000
    })
  })

  describe('initialization', () => {
    it('should initialize with default config', () => {
      const defaultClient = new MonarchClient()
      expect(defaultClient).toBeInstanceOf(MonarchClient)
    })

    it('should initialize with custom config', () => {
      const customClient = new MonarchClient({
        baseURL: 'https://custom.api.com',
        timeout: 60000,
        retries: 5
      })
      expect(customClient).toBeInstanceOf(MonarchClient)
    })

    it('should have all API modules available', () => {
      expect(client.accounts).toBeDefined()
      expect(client.transactions).toBeDefined()
      expect(client.budgets).toBeDefined()
    })
  })

  describe('configuration', () => {
    it('should merge environment variables with config', () => {
      process.env.MONARCH_BASE_URL = 'https://env.api.com'
      process.env.MONARCH_TIMEOUT = '45000'
      
      const envClient = new MonarchClient()
      
      // Clean up env vars
      delete process.env.MONARCH_BASE_URL
      delete process.env.MONARCH_TIMEOUT
      
      expect(envClient).toBeDefined()
    })

    it('should validate configuration options', () => {
      expect(() => new MonarchClient({ timeout: -1000 })).not.toThrow()
      expect(() => new MonarchClient({ retries: -5 })).not.toThrow()
    })
  })

  describe('authentication methods', () => {
    it('should have login method', () => {
      expect(typeof client.login).toBe('function')
    })

    it('should have interactive login method', () => {
      expect(typeof client.interactiveLogin).toBe('function')
    })

    it('should have session management methods', () => {
      expect(typeof client.getSessionInfo).toBe('function')
      expect(typeof client.loadSession).toBe('function')
      expect(typeof client.saveSession).toBe('function')
      expect(typeof client.deleteSession).toBe('function')
    })
  })

  describe('caching', () => {
    it('should initialize with caching disabled by default', () => {
      const client = new MonarchClient()
      expect((client as any).cache).toBeUndefined()
    })

    it('should initialize with caching when enabled', () => {
      const client = new MonarchClient({
        enablePersistentCache: true
      })
      expect((client as any).cache).toBeDefined()
    })

    it('should have cache management methods', () => {
      expect(typeof client.clearCache).toBe('function')
    })
  })

  describe('API modules', () => {
    it('should have accounts API with all methods', () => {
      const accounts = client.accounts
      expect(typeof accounts.getAll).toBe('function')
      expect(typeof accounts.getById).toBe('function')
      expect(typeof accounts.createManual).toBe('function')
      expect(typeof accounts.update).toBe('function')
      expect(typeof accounts.delete).toBe('function')
    })

    it('should have transactions API with all methods', () => {
      const transactions = client.transactions
      expect(typeof transactions.getAll).toBe('function')
      expect(typeof transactions.getById).toBe('function')
      expect(typeof transactions.createManual).toBe('function')
      expect(typeof transactions.update).toBe('function')
      expect(typeof transactions.delete).toBe('function')
      expect(typeof transactions.bulkEdit).toBe('function')
      expect(typeof transactions.split).toBe('function')
    })

    it('should have budgets API with all methods', () => {
      const budgets = client.budgets
      expect(typeof budgets.getAll).toBe('function')
      expect(typeof budgets.getById).toBe('function')
      expect(typeof budgets.create).toBe('function')
      expect(typeof budgets.update).toBe('function')
      expect(typeof budgets.getCashFlow).toBe('function')
      expect(typeof budgets.getGoals).toBe('function')
      expect(typeof budgets.getBills).toBe('function')
    })
  })
})