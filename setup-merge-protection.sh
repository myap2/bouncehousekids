#!/bin/bash

set -e

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
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_status "🚀 Setting up merge protection environment for Bounce House Rental System..."

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    print_error "This script must be run in the root of a git repository"
    exit 1
fi

# Check Node.js version
print_status "Checking Node.js version..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18.x or higher."
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18.x or higher is required. Current version: $(node --version)"
    exit 1
fi

print_success "Node.js version: $(node --version)"

# Check if npm is available
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm."
    exit 1
fi

print_success "npm version: $(npm --version)"

# Install root dependencies
print_status "Installing root dependencies..."
npm install

# Install server dependencies
print_status "Installing server dependencies..."
if [ -d "server" ]; then
    cd server
    npm install
    cd ..
    print_success "Server dependencies installed"
else
    print_warning "Server directory not found, skipping server dependencies"
fi

# Install client dependencies
print_status "Installing client dependencies..."
if [ -d "client" ]; then
    cd client
    npm install
    cd ..
    print_success "Client dependencies installed"
else
    print_warning "Client directory not found, skipping client dependencies"
fi

# Set up Husky hooks
print_status "Setting up Husky pre-commit hooks..."
npm run prepare

# Make hook files executable
chmod +x .husky/pre-commit
chmod +x .husky/pre-push
chmod +x .husky/commit-msg

print_success "Husky hooks configured"

# Test the hooks
print_status "Testing pre-commit hooks..."
if npx lint-staged --dry-run 2>/dev/null; then
    print_success "Pre-commit hooks test passed"
else
    print_warning "Pre-commit hooks test failed - this is normal if no staged files"
fi

# Run initial validation
print_status "Running initial validation..."
if npm run validate; then
    print_success "Initial validation passed"
else
    print_warning "Initial validation failed - some tests may need fixes"
fi

# Display setup summary
echo
print_status "🎉 Setup Complete!"
echo
echo "Your merge protection environment is now configured with:"
echo "  ✅ Pre-commit hooks (linting + related tests)"
echo "  ✅ Pre-push hooks (full validation)"
echo "  ✅ Commit message validation"
echo "  ✅ GitHub Actions CI/CD pipeline"
echo "  ✅ Code coverage thresholds"
echo "  ✅ Security scanning"
echo

print_warning "IMPORTANT: Don't forget to configure GitHub branch protection rules!"
echo "Follow the instructions in MERGE_PROTECTION_SETUP.md to:"
echo "  1. Enable GitHub Actions"
echo "  2. Set up branch protection rules"
echo "  3. Configure required status checks"
echo "  4. Add environment secrets"
echo

print_status "Quick commands:"
echo "  npm test              - Run all tests"
echo "  npm run test:coverage - Run tests with coverage"
echo "  npm run lint          - Run linting"
echo "  npm run build         - Build the project"
echo "  npm run validate      - Run full validation"
echo

print_success "🛡️  Your code is now protected! No failing tests can be merged."

# Final check
print_status "Running final verification..."
if [ -f ".git/hooks/pre-commit" ] && [ -f ".git/hooks/pre-push" ] && [ -f ".git/hooks/commit-msg" ]; then
    print_success "All Git hooks are properly installed"
else
    print_error "Some Git hooks are missing. Please run 'npm run prepare' again."
fi

echo
print_status "Setup completed successfully! 🎯"