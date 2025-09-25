# Deployment Guide

This document outlines the steps to deploy the MonarchMoney TypeScript SDK.

## GitHub Repository Setup

✅ **Completed**: Repository created at https://github.com/keithah/monarchmoney-ts

## Required GitHub Secrets

To enable automated CI/CD and npm publishing, configure these secrets in your GitHub repository:

### Required Secrets

1. **NPM_TOKEN** (Required for npm publishing)
   - Go to https://www.npmjs.com/settings/tokens
   - Create a new "Automation" token with "Publish" permission
   - Add it as a repository secret: `Settings` → `Secrets and variables` → `Actions` → `New repository secret`

### Optional Secrets (for integration testing)

2. **MONARCH_EMAIL** - Your MonarchMoney email
3. **MONARCH_PASSWORD** - Your MonarchMoney password  
4. **MONARCH_MFA_SECRET** - Your TOTP secret for MFA

## Setting up GitHub Secrets

```bash
# Option 1: Using GitHub CLI
gh secret set NPM_TOKEN --body "your-npm-token-here"

# Option 2: Via GitHub Web Interface
# Go to: https://github.com/keithah/monarchmoney-ts/settings/secrets/actions
# Click "New repository secret"
# Name: NPM_TOKEN
# Value: your-npm-token-here
```

## NPM Account Setup

1. **Create npm account**: https://www.npmjs.com/signup
2. **Verify email address**
3. **Enable 2FA** (recommended)
4. **Create automation token**:
   - Go to https://www.npmjs.com/settings/tokens
   - Click "Generate New Token"
   - Select "Automation" 
   - Set appropriate permissions (Publish, Read)
   - Copy the token and add it to GitHub secrets

## Publishing Process

### Automated Publishing (Recommended)

1. **Create a release tag**:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. **GitHub Actions will automatically**:
   - Run all tests
   - Build the project
   - Publish to npm
   - Create GitHub release

### Manual Publishing

```bash
# Build the project
npm run build

# Run tests
npm test

# Login to npm (one-time setup)
npm login

# Publish
npm publish
```

## CI/CD Pipeline

The repository includes two GitHub Actions workflows:

### 1. Continuous Integration (`.github/workflows/ci.yml`)
- **Trigger**: Every push and pull request
- **Actions**: Install dependencies, run tests, build project, run linting
- **Node versions**: 18.x, 20.x, 22.x
- **OS**: Ubuntu Latest

### 2. Release Pipeline (`.github/workflows/release.yml`)
- **Trigger**: Git tags matching `v*` (e.g., `v1.0.0`)
- **Actions**: Run tests, build, publish to npm, create GitHub release

## Package Configuration

The package is configured for:
- ✅ **Dual package support** (CommonJS + ESM)
- ✅ **TypeScript declarations**  
- ✅ **Source maps**
- ✅ **Tree shaking support**
- ✅ **Comprehensive metadata**

## Release Checklist

Before creating a new release:

- [ ] Update version in `package.json`
- [ ] Update `CHANGELOG.md` with new features/fixes
- [ ] Run `npm run test:coverage` to ensure good coverage
- [ ] Run `npm run lint` to ensure code quality
- [ ] Run `npm run build` to verify build works
- [ ] Commit all changes
- [ ] Create and push git tag: `git tag v1.x.x && git push origin v1.x.x`

## Monitoring

After publishing:
- Check npm package: https://www.npmjs.com/package/monarchmoney-ts
- Monitor GitHub Actions: https://github.com/keithah/monarchmoney-ts/actions
- Review download stats and issues

## Troubleshooting

### Common Issues

1. **NPM publish fails**: Check NPM_TOKEN secret is set correctly
2. **Tests fail in CI**: Ensure all dependencies are in `package.json`
3. **Build fails**: Check TypeScript configuration and imports
4. **Authentication tests fail**: Add optional MONARCH_* secrets

### Support

- Create issues: https://github.com/keithah/monarchmoney-ts/issues
- Check CI logs: https://github.com/keithah/monarchmoney-ts/actions