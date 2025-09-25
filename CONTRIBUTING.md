# Contributing to MonarchMoney TypeScript SDK

We love your input! We want to make contributing to this project as easy and transparent as possible.

## Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

## Pull Requests

Pull requests are the best way to propose changes to the codebase:

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Issue that pull request!

## Development Setup

```bash
# Clone your fork
git clone https://github.com/yourusername/monarchmoney-ts.git
cd monarchmoney-ts

# Install dependencies
npm install

# Run tests
npm test

# Build the project
npm run build

# Run linter
npm run lint

# Format code
npm run format
```

## Testing

### Unit Tests
```bash
npm run test:unit
```

### Integration Tests
Create a `.env` file with your MonarchMoney credentials:
```env
MONARCH_EMAIL=your-email@example.com
MONARCH_PASSWORD=your-password
MONARCH_MFA_SECRET=your-totp-secret
```

Then run:
```bash
npm run test:integration
```

### Coverage
```bash
npm run test:coverage
```

## Code Style

We use ESLint and Prettier for code formatting. The configuration is already set up.

- Run `npm run lint` to check for linting errors
- Run `npm run lint:fix` to automatically fix fixable issues  
- Run `npm run format` to format code with Prettier

## Commit Messages

We follow conventional commits:
- `feat: add new feature`
- `fix: bug fix`
- `docs: documentation changes`
- `test: test additions/changes`
- `chore: maintenance tasks`

## API Design Principles

1. **TypeScript First**: All APIs should have comprehensive TypeScript types
2. **Error Handling**: Use specific error types and provide helpful error messages
3. **Rate Limiting**: Respect MonarchMoney's API limits with built-in throttling
4. **Caching**: Implement intelligent caching where appropriate
5. **Documentation**: Every public method should be documented

## Adding New API Endpoints

1. Add the GraphQL query/mutation to the appropriate API class
2. Add TypeScript types for the request/response
3. Add unit tests for the new functionality
4. Update the README with usage examples
5. Add integration tests if credentials are available

## Bug Reports

We use GitHub issues to track public bugs. Report a bug by opening a new issue.

**Great Bug Reports** tend to have:
- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

## Feature Requests

We use GitHub issues to track feature requests. When requesting a feature:
- Explain the use case and why it would be valuable
- Provide examples of how the API should work
- Consider backward compatibility

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## References

This document was adapted from Facebook's Draft.js contributing guidelines and the open-source contribution guidelines.