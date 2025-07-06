# Merge Protection & CI/CD Setup Guide
## Enforcing Unit Tests Before Merging

This guide explains how to configure your repository to **require all unit tests to pass before any code can be merged** into the main branch.

## 🎯 Overview

Our multi-layered approach ensures code quality through:

1. **Pre-commit hooks** - Run tests locally before commits
2. **GitHub Actions CI/CD** - Run comprehensive tests on every PR
3. **Branch protection rules** - Block merging if tests fail
4. **Quality gates** - Enforce coverage thresholds and security scans

## 🔧 Quick Setup

### 1. Initialize Pre-commit Hooks

```bash
# Install root dependencies
npm install

# Set up husky hooks
npm run prepare

# Verify hooks are installed
ls -la .git/hooks/
```

### 2. Configure GitHub Repository

#### Enable GitHub Actions
1. Go to your repository on GitHub
2. Navigate to **Settings** → **Actions** → **General**
3. Ensure "Allow all actions and reusable workflows" is selected
4. Save settings

#### Set Up Branch Protection Rules
1. Go to **Settings** → **Branches**
2. Click **Add rule** or edit existing rule for `main` branch
3. Configure the following settings:

**Basic Protection:**
- ✅ Require a pull request before merging
- ✅ Require approvals: `1` (adjust as needed)
- ✅ Dismiss stale PR approvals when new commits are pushed
- ✅ Require review from code owners (if you have CODEOWNERS file)

**Status Checks:**
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging
- ✅ Select the following required status checks:
  - `Backend Tests (18.x)`
  - `Backend Tests (20.x)`
  - `Frontend Tests (18.x)`
  - `Frontend Tests (20.x)`
  - `Integration Tests`
  - `Security Scan`
  - `Build Check`
  - `Quality Gates`

**Additional Settings:**
- ✅ Require linear history (optional, but recommended)
- ✅ Include administrators (applies rules to admins too)
- ✅ Restrict pushes that create files (optional)
- ✅ Require deployments to succeed (if using deployment protection)

#### Environment Secrets
Set up the following secrets in **Settings** → **Secrets and variables** → **Actions**:

```
CODECOV_TOKEN=your_codecov_token_here
STRIPE_SECRET_KEY=sk_test_your_test_key_here
GOOGLE_MAPS_API_KEY=your_google_maps_key_here
MONGODB_URI=mongodb://localhost:27017/test_db
JWT_SECRET=your_jwt_secret_for_testing
```

## 🛡️ Protection Layers

### Layer 1: Pre-commit Hooks (Local)

**What it does:**
- Runs linting and related tests before each commit
- Prevents bad code from entering git history
- Fast feedback loop for developers

**Triggers on:**
- `git commit`
- `git push` (runs full validation)

**Configuration:** `.husky/` directory and `lint-staged` in `package.json`

### Layer 2: GitHub Actions CI/CD (Remote)

**What it does:**
- Comprehensive testing on multiple Node.js versions
- Security audits and vulnerability scans
- Build verification
- Code coverage analysis

**Triggers on:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`

**Configuration:** `.github/workflows/ci.yml`

### Layer 3: Branch Protection (GitHub)

**What it does:**
- Blocks direct pushes to protected branches
- Requires PR reviews and passing status checks
- Enforces linear git history

**Configuration:** GitHub repository settings

### Layer 4: Quality Gates

**What it does:**
- Enforces minimum code coverage thresholds
- Validates build artifacts
- Ensures security compliance

**Thresholds:**
- **Backend Coverage:** 80% lines, 80% statements, 75% branches, 80% functions
- **Frontend Coverage:** 80% lines, 80% statements, 75% branches, 80% functions
- **Security Audit:** No high-severity vulnerabilities

## 🚀 Developer Workflow

### Normal Development Flow

```bash
# 1. Create feature branch
git checkout -b feature/new-bounce-house-filter

# 2. Make changes and write tests
# ... code changes ...

# 3. Run tests locally (optional, but recommended)
npm test

# 4. Commit changes (pre-commit hooks run automatically)
git add .
git commit -m "feat: add advanced filtering for bounce houses"
# ✅ Pre-commit hooks run: linting + related tests

# 5. Push to remote (pre-push hooks run automatically)
git push origin feature/new-bounce-house-filter
# ✅ Pre-push hooks run: full validation

# 6. Create Pull Request on GitHub
# ✅ GitHub Actions CI starts automatically

# 7. Wait for all checks to pass
# ✅ All test suites must pass
# ✅ Security scan must pass
# ✅ Build must succeed
# ✅ Coverage thresholds must be met

# 8. Get code review approval

# 9. Merge (only possible if all checks pass)
```

### If Tests Fail

**Local Failure (Pre-commit):**
```bash
# Fix the issues and try again
npm run lint:fix
npm test
git add .
git commit -m "fix: resolve linting issues"
```

**CI Failure (GitHub Actions):**
```bash
# Check the GitHub Actions logs
# Fix the issues locally
npm run lint
npm test
npm run build

# Commit fixes
git add .
git commit -m "fix: resolve CI test failures"
git push
```

## 📊 Monitoring & Reporting

### Test Coverage Reports
- **Backend:** `server/coverage/lcov-report/index.html`
- **Frontend:** `client/coverage/lcov-report/index.html`
- **Combined:** Available in GitHub Actions artifacts

### GitHub Actions Dashboard
- View all workflow runs: `https://github.com/your-username/repo-name/actions`
- Check specific job details for debugging failures
- Download artifacts for detailed reports

### Branch Protection Status
- Green checkmarks indicate passing status checks
- Red X marks indicate failing checks that block merge
- Yellow dots indicate pending/running checks

## 🔍 Troubleshooting

### Common Issues

**1. Pre-commit hooks not running**
```bash
# Reinstall husky hooks
rm -rf .git/hooks
npm run prepare
```

**2. GitHub Actions failing to start**
- Check repository permissions
- Verify `.github/workflows/ci.yml` syntax
- Ensure all required secrets are set

**3. Tests passing locally but failing in CI**
- Check Node.js version differences
- Verify environment variables
- Review MongoDB connection issues
- Check dependency versions

**4. Coverage threshold failures**
```bash
# Check current coverage
npm run test:coverage

# Identify uncovered code
open coverage/lcov-report/index.html

# Write additional tests for uncovered areas
```

**5. Security audit failures**
```bash
# Check for vulnerabilities
npm audit

# Fix automatically where possible
npm audit fix

# For manual fixes, update specific packages
npm update package-name
```

### Debugging Failed Tests

**Backend Test Failures:**
```bash
cd server
npm test -- --verbose
npm test -- --testNamePattern="failing test name"
```

**Frontend Test Failures:**
```bash
cd client
npm test -- --verbose
npm test -- --testNamePattern="failing test name"
```

**Integration Test Failures:**
```bash
# Run the full test suite locally
./run-tests.sh

# Check specific logs
cat backend-test-results.log
cat frontend-test-results.log
```

## 🎯 Best Practices

### Writing Tests for New Features

**1. Test-Driven Development (TDD)**
```bash
# Write tests first
npm test -- --watch

# Implement feature
# ... code changes ...

# Verify tests pass
npm test
```

**2. Coverage Guidelines**
- Aim for >90% coverage on new code
- Focus on business logic and edge cases
- Test error conditions and boundary values
- Mock external dependencies appropriately

**3. Test Organization**
- Group related tests in `describe` blocks
- Use descriptive test names
- Follow AAA pattern: Arrange, Act, Assert
- Keep tests independent and isolated

### Code Review Checklist

Before approving PRs, verify:
- ✅ All tests pass
- ✅ Code coverage meets thresholds
- ✅ No security vulnerabilities introduced
- ✅ Code follows project conventions
- ✅ Tests cover new functionality
- ✅ Documentation updated if needed

### Emergency Procedures

**Hotfix Process:**
```bash
# Create hotfix branch from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-security-fix

# Make minimal changes
# ... emergency fixes ...

# Fast-track through CI (all checks still required)
git commit -m "fix: critical security vulnerability"
git push origin hotfix/critical-security-fix

# Create emergency PR with priority review
# All protection rules still apply - no exceptions!
```

**Temporary Protection Bypass (Admin Only):**
```
⚠️  WARNING: Only for extreme emergencies
1. Repository Settings → Branches
2. Temporarily uncheck protection rules
3. Merge critical fix
4. IMMEDIATELY re-enable all protection rules
5. Document the bypass in incident report
```

## 🔄 Maintenance

### Regular Tasks

**Weekly:**
- Review failed CI runs and identify patterns
- Update dependencies and run security audits
- Monitor test execution times and optimize slow tests

**Monthly:**
- Review and update coverage thresholds
- Audit and clean up unused test files
- Update GitHub Actions runners and dependencies

**Quarterly:**
- Review and update branch protection rules
- Evaluate and improve CI/CD pipeline performance
- Training sessions on testing best practices

## 📞 Support

### Getting Help

**CI/CD Issues:** Check GitHub Actions logs and compare with local test results
**Test Writing:** Refer to existing test patterns in `server/tests/` and `client/src/components/__tests__/`
**Coverage Issues:** Use coverage reports to identify missing test areas
**Security Issues:** Review npm audit output and update dependencies

### Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Husky Documentation](https://typicode.github.io/husky/)

---

## ✅ Summary

With this setup, **no code can be merged without passing tests**:

1. **Local protection:** Pre-commit hooks catch issues early
2. **CI protection:** GitHub Actions run comprehensive test suites
3. **Branch protection:** GitHub blocks merging until all checks pass
4. **Quality gates:** Coverage and security thresholds must be met

This ensures your bounce house rental system maintains high code quality and reliability! 🎯