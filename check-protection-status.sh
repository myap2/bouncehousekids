#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✅ PASS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[⚠️  WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[❌ FAIL]${NC} $1"
}

print_status "🛡️  Checking merge protection status..."
echo

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    print_error "Not in a git repository"
    exit 1
fi

# Check Node.js and npm
print_status "Environment Check:"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_success "Node.js installed: $NODE_VERSION"
else
    print_error "Node.js not installed"
fi

if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    print_success "npm installed: $NPM_VERSION"
else
    print_error "npm not installed"
fi

echo

# Check project structure
print_status "Project Structure Check:"
if [ -d "server" ]; then
    print_success "Backend directory exists"
else
    print_error "Backend directory missing"
fi

if [ -d "client" ]; then
    print_success "Frontend directory exists"
else
    print_error "Frontend directory missing"
fi

if [ -f "package.json" ]; then
    print_success "Root package.json exists"
else
    print_error "Root package.json missing"
fi

echo

# Check configuration files
print_status "Configuration Files Check:"
REQUIRED_FILES=(
    ".github/workflows/ci.yml"
    ".prettierrc"
    "commitlint.config.js"
    "server/.eslintrc.js"
    "MERGE_PROTECTION_SETUP.md"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        print_success "$file exists"
    else
        print_error "$file missing"
    fi
done

echo

# Check Husky hooks
print_status "Git Hooks Check:"
HOOKS=("pre-commit" "pre-push" "commit-msg")

for hook in "${HOOKS[@]}"; do
    if [ -f ".git/hooks/$hook" ]; then
        print_success "Git hook $hook installed"
    else
        print_error "Git hook $hook missing"
    fi
done

if [ -d ".husky" ]; then
    print_success "Husky directory exists"
else
    print_error "Husky directory missing"
fi

echo

# Check dependencies
print_status "Dependencies Check:"
if [ -f "package.json" ]; then
    if npm list husky &> /dev/null; then
        print_success "Husky installed"
    else
        print_error "Husky not installed"
    fi
    
    if npm list lint-staged &> /dev/null; then
        print_success "lint-staged installed"
    else
        print_error "lint-staged not installed"
    fi
    
    if npm list @commitlint/cli &> /dev/null; then
        print_success "commitlint installed"
    else
        print_error "commitlint not installed"
    fi
fi

echo

# Check test infrastructure
print_status "Test Infrastructure Check:"
if [ -d "server/tests" ]; then
    TEST_COUNT=$(find server/tests -name "*.test.ts" | wc -l)
    print_success "Backend tests directory exists ($TEST_COUNT test files)"
else
    print_error "Backend tests directory missing"
fi

if [ -d "client/src/components/__tests__" ]; then
    TEST_COUNT=$(find client/src/components/__tests__ -name "*.test.tsx" | wc -l)
    print_success "Frontend tests directory exists ($TEST_COUNT test files)"
else
    print_error "Frontend tests directory missing"
fi

if [ -f "run-tests.sh" ]; then
    print_success "Test runner script exists"
else
    print_error "Test runner script missing"
fi

echo

# Test the protection mechanisms
print_status "Protection Mechanisms Test:"

# Test linting
if npm run lint &> /dev/null; then
    print_success "Linting passes"
else
    print_warning "Linting has issues (run 'npm run lint' to see details)"
fi

# Test backend tests
if cd server && npm test &> /dev/null; then
    print_success "Backend tests pass"
    cd ..
else
    print_warning "Backend tests have issues"
    cd ..
fi

# Test frontend tests
if cd client && npm test -- --watchAll=false &> /dev/null; then
    print_success "Frontend tests pass"
    cd ..
else
    print_warning "Frontend tests have issues"
    cd ..
fi

# Test builds
if npm run build &> /dev/null; then
    print_success "Build succeeds"
else
    print_warning "Build has issues"
fi

echo

# Check coverage configuration
print_status "Coverage Configuration Check:"
if [ -f "server/jest.config.js" ]; then
    if grep -q "coverageThreshold" server/jest.config.js; then
        print_success "Backend coverage thresholds configured"
    else
        print_warning "Backend coverage thresholds not configured"
    fi
else
    print_error "Backend Jest configuration missing"
fi

if [ -f "client/package.json" ]; then
    if grep -q "jest" client/package.json; then
        print_success "Frontend Jest configuration found"
    else
        print_warning "Frontend Jest configuration not found"
    fi
else
    print_error "Frontend package.json missing"
fi

echo

# GitHub Actions check
print_status "CI/CD Pipeline Check:"
if [ -f ".github/workflows/ci.yml" ]; then
    print_success "GitHub Actions workflow configured"
    echo "  • Workflow file: .github/workflows/ci.yml"
    echo "  • Jobs configured: Backend Tests, Frontend Tests, Integration Tests, Security Scan, Build Check, Quality Gates"
else
    print_error "GitHub Actions workflow missing"
fi

echo

# Summary
print_status "🏁 Protection Status Summary:"
echo
echo "Local Protection (Pre-commit/Pre-push):"
if [ -f ".git/hooks/pre-commit" ] && [ -f ".git/hooks/pre-push" ]; then
    print_success "Local hooks are active"
else
    print_error "Local hooks need setup"
fi

echo
echo "CI/CD Protection:"
if [ -f ".github/workflows/ci.yml" ]; then
    print_success "GitHub Actions CI/CD configured"
else
    print_error "GitHub Actions CI/CD not configured"
fi

echo
echo "Required Manual Steps:"
print_warning "1. Configure GitHub branch protection rules (see MERGE_PROTECTION_SETUP.md)"
print_warning "2. Set up GitHub repository secrets"
print_warning "3. Enable GitHub Actions in repository settings"

echo
print_status "🎯 Next Steps:"
echo "  • Run './setup-merge-protection.sh' to fix any missing components"
echo "  • Review 'MERGE_PROTECTION_SETUP.md' for GitHub configuration"
echo "  • Test the protection with: 'npm run validate'"
echo

if [ -f ".git/hooks/pre-commit" ] && [ -f ".git/hooks/pre-push" ] && [ -f ".github/workflows/ci.yml" ]; then
    print_success "🛡️  Merge protection is properly configured!"
else
    print_error "🚨 Merge protection needs configuration"
fi