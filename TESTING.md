# Testing the MonarchMoney TypeScript Library

## Live API Testing

To test the library with real MonarchMoney credentials:

### 1. Set up your environment

```bash
# Copy the environment template
cp .env.template .env

# Edit .env and add your credentials
nano .env
```

Add your MonarchMoney credentials:
```bash
MONARCH_EMAIL=your-email@example.com
MONARCH_PASSWORD=your-secure-password
MONARCH_LOG_LEVEL=info
```

### 2. Install dependencies and run the test

```bash
# Install dependencies
npm install

# Run the live test
npx tsx test-live.ts
```

### 3. What the test does

The live test script will:

1. **Check initial session status** - See if there's a saved session
2. **Attempt to load saved session** - Try to use cached authentication
3. **Login with credentials** - Authenticate with MonarchMoney
4. **Handle MFA if required** - Interactive MFA code entry
5. **Validate session** - Ensure the session is working
6. **Get user profile** - Test basic API calls
7. **Fetch accounts** - Test the accounts API
8. **Get account types** - Test additional API endpoints  
9. **Show cache statistics** - Verify caching is working
10. **Display session info** - Final status check

### 4. Expected output

```bash
🏦 MonarchMoney TypeScript Library - Live API Test
================================================

1️⃣ Checking session status...
Initial session: { isValid: false, isStale: true, hasStoredSession: false }

2️⃣ Attempting to load saved session...
Valid saved session found: false

3️⃣ Logging in with credentials...
Logging in as: your-email@example.com
✅ Login successful!

4️⃣ Validating session...
Session validation result: true

5️⃣ Getting user profile...
User profile: {
  id: "user-123",
  email: "your-email@example.com", 
  name: "Your Name",
  timezone: "America/Los_Angeles",
  subscription: "premium",
  mfaEnabled: true
}

6️⃣ Getting accounts...
Found 5 accounts:
  1. Chase Checking
     Type: Depository - Checking
     Balance: $2,500
     Institution: Chase Bank
     Hidden: false

  2. Savings Account
     Type: Depository - Savings  
     Balance: $15,000
     Institution: Chase Bank
     Hidden: false

💰 Total Net Worth: $45,250

7️⃣ Getting account type options...
Available account types: 8
Available subtypes: 24

8️⃣ Cache statistics...
Cache stats: { memorySize: 3, persistentSize: 2, totalCached: 5 }

9️⃣ Final session status...
Final session: { isValid: true, isStale: false, lastValidated: "2024-01-15T10:30:00.000Z" }

✅ All tests completed successfully!
```

### 5. Troubleshooting

**Authentication Errors:**
- Verify your email and password are correct
- Check if MFA is required (you'll be prompted)
- Ensure you have access to your MFA device

**API Errors:**
- Check your internet connection
- Verify MonarchMoney service is up
- Look at the error details for specific issues

**Session Issues:**
- Delete cached sessions: `rm -rf ~/.mm/`
- Try logging in again from scratch

### 6. MFA Handling

If you have MFA enabled:

**Option 1: Interactive (recommended)**
- The test will prompt you for your MFA code
- Enter the 6-digit code from your authenticator app

**Option 2: TOTP Secret (advanced)**
- Add your TOTP secret to `.env`:
  ```bash
  MONARCH_MFA_SECRET=your-totp-secret-key
  ```
- The library will generate codes automatically

### 7. Security Notes

- Your `.env` file is automatically ignored by git
- Sessions are encrypted and stored in `~/.mm/`
- Cache data is encrypted with AES-256
- All sensitive data is protected

### 8. Development Testing

For development without live credentials:

```bash
# Run unit tests (mocked)
npm test

# Run TypeScript compilation
npm run build

# Run linting
npm run lint
```

## Testing Specific Features

### Test Authentication Only
```typescript
import { MonarchClient } from './src'

const client = new MonarchClient()
await client.login({ email: 'test@example.com', password: 'password' })
console.log('Session info:', client.getSessionInfo())
```

### Test Accounts API
```typescript
const accounts = await client.accounts.getAll()
console.log('Account count:', accounts.length)

const account = await client.accounts.getById(accounts[0].id)
console.log('Account details:', account)
```

### Test Caching
```typescript
// First call - hits API
const accounts1 = await client.accounts.getAll()

// Second call - uses cache  
const accounts2 = await client.accounts.getAll()

// Check cache stats
console.log('Cache stats:', client.getCacheStats())
```

## Known Limitations

1. **Transactions API** - Not yet implemented
2. **Budgets API** - Not yet implemented  
3. **Categories API** - Not yet implemented
4. **Investment API** - Not yet implemented

The test focuses on authentication and accounts API which are fully implemented.