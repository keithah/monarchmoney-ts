// Jest setup file
import { jest } from '@jest/globals'

// Mock node-fetch for testing
jest.mock('node-fetch', () => ({
  __esModule: true,
  default: jest.fn()
}))

// Mock console methods in tests to reduce noise
const originalConsoleDebug = console.debug
const originalConsoleInfo = console.info

beforeEach(() => {
  console.debug = jest.fn()
  console.info = jest.fn()
})

afterEach(() => {
  console.debug = originalConsoleDebug
  console.info = originalConsoleInfo
})