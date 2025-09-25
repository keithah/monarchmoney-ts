import { MonarchClient } from '../client/MonarchClient'

describe('MonarchClient', () => {
  let client: MonarchClient

  beforeEach(() => {
    client = new MonarchClient({
      logLevel: 'error' // Reduce log noise in tests
    })
  })

  afterEach(async () => {
    await client.close()
  })

  describe('constructor', () => {
    it('should create a client with default config', () => {
      expect(client).toBeInstanceOf(MonarchClient)
    })

    it('should accept custom configuration', () => {
      const customClient = new MonarchClient({
        baseURL: 'https://custom.example.com',
        timeout: 60000,
        enablePersistentCache: false
      })

      expect(customClient).toBeInstanceOf(MonarchClient)
    })

    it('should merge environment variables', () => {
      const originalEnv = process.env.MONARCH_BASE_URL
      process.env.MONARCH_BASE_URL = 'https://env.example.com'

      const envClient = new MonarchClient()
      expect(envClient).toBeInstanceOf(MonarchClient)

      // Restore original env
      if (originalEnv) {
        process.env.MONARCH_BASE_URL = originalEnv
      } else {
        delete process.env.MONARCH_BASE_URL
      }
    })
  })

  describe('session management', () => {
    it('should provide session info', () => {
      const sessionInfo = client.getSessionInfo()
      expect(sessionInfo).toHaveProperty('isValid')
      expect(sessionInfo).toHaveProperty('isStale')
    })

    it('should handle session stale check', () => {
      const isStale = client.isSessionStale()
      expect(typeof isStale).toBe('boolean')
    })
  })

  describe('cache management', () => {
    it('should clear cache', () => {
      expect(() => client.clearCache()).not.toThrow()
    })

    it('should get cache stats', () => {
      const stats = client.getCacheStats()
      expect(stats).toBeDefined()
    })
  })

  describe('utility methods', () => {
    it('should provide version info', () => {
      const version = client.getVersion()
      expect(version).toHaveProperty('version')
      expect(version).toHaveProperty('sessionInfo')
    })

    it('should detect Node.js environment', () => {
      expect(MonarchClient.isNode()).toBe(true)
    })

    it('should detect browser environment', () => {
      expect(MonarchClient.isBrowser()).toBe(false)
    })
  })

  describe('static factory methods', () => {
    it('should create client via static method', () => {
      const staticClient = MonarchClient.create({ timeout: 15000 })
      expect(staticClient).toBeInstanceOf(MonarchClient)
    })
  })

  describe('API modules', () => {
    it('should expose accounts API', () => {
      expect(client.accounts).toBeDefined()
      expect(typeof client.accounts.getAll).toBe('function')
    })
  })
})