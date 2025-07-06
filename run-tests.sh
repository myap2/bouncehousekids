#!/bin/bash

echo "🧪 Running Comprehensive Test Suite for Bounce House Rental System"
echo "=================================================================="

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

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js to run tests."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm to run tests."
    exit 1
fi

print_status "Starting test execution..."

# Backend Tests
echo ""
echo "🔧 BACKEND TESTS"
echo "=================="

print_status "Running backend unit tests..."
cd server

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_warning "Backend dependencies not found. Installing..."
    npm install
fi

# Run backend tests
print_status "Executing Jest tests for backend controllers and services..."
npm test 2>&1 | tee ../backend-test-results.log

backend_exit_code=$?

if [ $backend_exit_code -eq 0 ]; then
    print_success "Backend tests completed successfully!"
else
    print_error "Backend tests failed with exit code $backend_exit_code"
fi

# Generate backend test coverage
print_status "Generating backend test coverage report..."
npm run test -- --coverage --coverageDirectory=../coverage/backend 2>/dev/null

cd ..

# Frontend Tests  
echo ""
echo "🎨 FRONTEND TESTS"
echo "=================="

print_status "Running frontend unit tests..."
cd client

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_warning "Frontend dependencies not found. Installing..."
    npm install
fi

# Run frontend tests
print_status "Executing React Testing Library tests for components..."
npm test -- --coverage --watchAll=false --coverageDirectory=../coverage/frontend 2>&1 | tee ../frontend-test-results.log

frontend_exit_code=$?

if [ $frontend_exit_code -eq 0 ]; then
    print_success "Frontend tests completed successfully!"
else
    print_error "Frontend tests failed with exit code $frontend_exit_code"
fi

cd ..

# Test Summary
echo ""
echo "📊 TEST EXECUTION SUMMARY"
echo "=========================="

print_status "Backend Test Results:"
if [ $backend_exit_code -eq 0 ]; then
    print_success "✅ Backend tests PASSED"
else
    print_error "❌ Backend tests FAILED"
fi

print_status "Frontend Test Results:"
if [ $frontend_exit_code -eq 0 ]; then
    print_success "✅ Frontend tests PASSED"
else
    print_error "❌ Frontend tests FAILED"
fi

# Overall result
echo ""
if [ $backend_exit_code -eq 0 ] && [ $frontend_exit_code -eq 0 ]; then
    print_success "🎉 ALL TESTS PASSED! Your application is ready for deployment."
    exit 0
else
    print_error "❌ Some tests failed. Please review the logs and fix the issues."
    exit 1
fi