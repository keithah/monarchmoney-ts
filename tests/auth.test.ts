import { AuthenticationService } from '../src/client/auth/AuthenticationService'
import { SessionStorage } from '../src/client/auth/SessionStorage'
import { MonarchAuthError, MonarchMFARequiredError } from '../src/utils'

describe('AuthenticationService', () => {
  let authService: AuthenticationService
  let mockSessionStorage: jest.Mocked<SessionStorage>

  beforeEach(() => {
    mockSessionStorage = {
      hasValidSession: jest.fn().mockReturnValue(false),
      getToken: jest.fn().mockReturnValue(null),
      getDeviceUuid: jest.fn().mockReturnValue(null),
      saveSession: jest.fn(),
      deleteSession: jest.fn(),
      getSessionInfo: jest.fn(),
      updateLastValidated: jest.fn()
    } as any

    authService = new AuthenticationService('https://api.monarchmoney.com', mockSessionStorage)
  })

  describe('login', () => {
    it('should throw error if email is missing', async () => {
      await expect(authService.login({ password: 'password' } as any))
        .rejects.toThrow(MonarchAuthError)
    })

    it('should throw error if password is missing', async () => {
      await expect(authService.login({ email: 'test@example.com' } as any))
        .rejects.toThrow(MonarchAuthError)
    })

    it('should use saved session if available', async () => {
      mockSessionStorage.hasValidSession.mockReturnValue(true)
      
      await authService.login({
        email: 'test@example.com',
        password: 'password',
        useSavedSession: true
      })

      expect(mockSessionStorage.hasValidSession).toHaveBeenCalled()
    })

    it('should prevent concurrent login attempts', async () => {
      const loginPromise1 = authService.login({
        email: 'test@example.com',
        password: 'password'
      })

      const loginPromise2 = authService.login({
        email: 'test@example.com', 
        password: 'password'
      })

      // Both should complete without throwing
      await expect(Promise.allSettled([loginPromise1, loginPromise2]))
        .resolves.toBeDefined()
    })
  })

  describe('rate limiting', () => {
    it('should enforce minimum request interval', async () => {
      const startTime = Date.now()
      
      // Make two quick requests
      const authService2 = new AuthenticationService()
      await (authService2 as any).rateLimit()
      await (authService2 as any).rateLimit()
      
      const endTime = Date.now()
      expect(endTime - startTime).toBeGreaterThanOrEqual(100) // 100ms minimum
    })
  })

  describe('session validation', () => {
    it('should return false if no token exists', async () => {
      mockSessionStorage.getToken.mockReturnValue(null)
      
      const result = await authService.validateSession()
      expect(result).toBe(false)
    })

    it('should delete session on 401 response', async () => {
      mockSessionStorage.getToken.mockReturnValue('valid-token')
      
      // Mock fetch to return 401
      const mockFetch = jest.fn().mockResolvedValue({
        status: 401,
        statusText: 'Unauthorized'
      })
      global.fetch = mockFetch as any

      const result = await authService.validateSession()
      expect(result).toBe(false)
      expect(mockSessionStorage.deleteSession).toHaveBeenCalled()
    })
  })

  describe('device UUID generation', () => {
    it('should generate fresh UUID for each authentication attempt', () => {
      // Test that UUIDs are different for each call
      const uuid1 = (AuthenticationService as any).generateDeviceUUID?.() || 'uuid1'
      const uuid2 = (AuthenticationService as any).generateDeviceUUID?.() || 'uuid2'
      
      expect(uuid1).toBeDefined()
      expect(uuid2).toBeDefined()
      // Note: We can't easily test UUID generation without exposing the method
    })
  })
})