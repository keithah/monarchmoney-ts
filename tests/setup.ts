import * as dotenv from 'dotenv'

// Load environment variables for testing
dotenv.config()

// Global test setup
beforeAll(() => {
  // Set test timeouts
  jest.setTimeout(30000)
})

afterAll(() => {
  // Cleanup after all tests
})