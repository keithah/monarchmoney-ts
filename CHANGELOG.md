# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-09-25

### Added
- Initial release of MonarchMoney TypeScript SDK
- Complete authentication system with MFA/TOTP support
- Full accounts API with 15+ methods
- Comprehensive transactions API with 38+ methods  
- Complete budgets API with 20+ methods
- Multi-level caching system (memory + persistent)
- Rate limiting with 100ms minimum between requests
- Comprehensive error handling with typed errors
- Session management with AES-256 encryption
- Dual package support (CommonJS + ESM)
- Full TypeScript support with complete type definitions
- Extensive test suite with unit and integration tests
- GitHub Actions CI/CD pipeline
- Comprehensive documentation and examples

### Security
- All stored sessions are AES-256 encrypted
- Sensitive data is never logged
- Automatic token refresh and expiration handling
- Secure defaults for all configuration options

### Performance
- Built-in caching with configurable TTL
- Request deduplication and optimization
- Efficient memory usage and cleanup
- Lightweight package size (< 50KB gzipped)

### Developer Experience
- Complete TypeScript support
- Comprehensive error messages
- Detailed documentation with examples
- Easy configuration and setup
- Multiple authentication methods
- Interactive login support

## [Unreleased]

### Planned
- Additional API endpoints as they become available
- Enhanced caching strategies
- Performance optimizations
- Additional authentication methods