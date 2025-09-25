# MonarchMoney TypeScript SDK

[![npm version](https://badge.fury.io/js/monarchmoney.svg)](https://badge.fury.io/js/monarchmoney)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://github.com/keithah/monarchmoney-ts/workflows/CI/badge.svg)](https://github.com/keithah/monarchmoney-ts/actions)

A comprehensive, production-ready TypeScript/JavaScript SDK for the MonarchMoney API. This library provides complete access to MonarchMoney's GraphQL API with full TypeScript support, authentication handling, caching, and rate limiting.

## 🚀 Features

- **Complete API Coverage**: Full implementation of MonarchMoney's GraphQL API
- **TypeScript Support**: Comprehensive type definitions for all API responses
- **Authentication**: Automatic login with MFA/TOTP support
- **Session Management**: Secure session storage with encryption
- **Rate Limiting**: Built-in rate limiting to respect API limits
- **Multi-Level Caching**: Memory and persistent file-based caching
- **Error Handling**: Comprehensive error types and retry logic  
- **Dual Package**: CommonJS and ESM support
- **Production Ready**: Extensive testing and CI/CD pipeline

## 📦 Installation

```bash
npm install monarchmoney
```

## 🏃 Quick Start

```typescript
import { MonarchClient } from 'monarchmoney'

const client = new MonarchClient({
  baseURL: 'https://api.monarchmoney.com',
  timeout: 30000
})

// Login with credentials and MFA
await client.login({
  email: 'your-email@example.com',
  password: 'your-password',
  mfaSecretKey: 'your-mfa-secret' // Optional TOTP secret
})

// Get all accounts
const accounts = await client.accounts.getAll()
console.log(`Found ${accounts.length} accounts`)

// Get recent transactions  
const transactions = await client.transactions.getAll({
  limit: 50,
  offset: 0
})

// Get budgets
const budgets = await client.budgets.getAll()
```

## 📚 API Documentation

### Authentication

The SDK supports multiple authentication methods:

```typescript
// Basic login
await client.login({
  email: 'your-email@example.com', 
  password: 'your-password'
})

// Login with MFA/TOTP
await client.login({
  email: 'your-email@example.com',
  password: 'your-password', 
  mfaSecretKey: 'YOUR_TOTP_SECRET_KEY'
})

// Interactive login (prompts for credentials)
await client.interactiveLogin()
```

### Accounts API

Complete account management with 15+ methods including balance history, manual account creation, and account updates.

### Transactions API  

Comprehensive transaction handling with 38+ methods including CRUD operations, bulk editing, transaction rules, splitting, and categorization.

### Budgets API

Full budget management with 20+ methods including budget creation, cash flow analysis, goal tracking, and bill management.

## ⚙️ Configuration

```typescript
const client = new MonarchClient({
  baseURL: 'https://api.monarchmoney.com',
  timeout: 30000,
  retries: 3,
  enablePersistentCache: true,
  cache: {
    ttl: 300, // 5 minutes
    maxSize: 1000
  },
  cacheEncryptionKey: 'your-encryption-key' // Optional
})
```

## 🧪 Testing

The SDK includes comprehensive tests:

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run integration tests (requires credentials)
npm run test:integration
```

## 🚦 Rate Limiting

The SDK automatically handles MonarchMoney's rate limits:

- **100ms minimum** between requests (matching official Python SDK)
- **Exponential backoff** on rate limit errors
- **Concurrent request protection** prevents multiple simultaneous logins
- **Retry-After header support** for optimal retry timing

## 💾 Caching

Multi-level caching system with memory and persistent storage options.

## 🔐 Security

- **Session Encryption**: All stored sessions are AES-256 encrypted
- **Secure Defaults**: Sensitive data is never logged
- **MFA Support**: Full TOTP/MFA authentication support
- **Token Management**: Automatic token refresh and expiration handling

## 🛠️ Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Lint code
npm run lint

# Format code
npm run format
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by the official [Python MonarchMoney library](https://github.com/monarchmoney/monarchmoney)
- Built with TypeScript, Node-Fetch, and modern JavaScript practices

## 📊 Status

- **API Coverage**: ✅ Complete (70+ methods across Accounts, Transactions, Budgets)
- **Authentication**: ✅ Complete (Login, MFA, Session Management)
- **Caching**: ✅ Complete (Memory + Persistent)
- **Error Handling**: ✅ Complete (Typed Errors + Retry Logic)
- **Rate Limiting**: ✅ Complete (100ms + Backoff)

---

**Made with ❤️ for the MonarchMoney community**