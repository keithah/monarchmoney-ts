// Jest setup file
global.fetch = require('node-fetch')

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