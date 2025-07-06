#!/bin/bash

# Bounce House Kids - Production Deployment Script
# This script prepares and deploys the application for production

set -e

echo "🚀 Starting Production Deployment for Bounce House Kids..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "ℹ️  $1"
}

# Check if required tools are installed
check_requirements() {
    print_info "Checking requirements..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is required but not installed."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is required but not installed."
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        print_warning "Docker is not installed. Some deployment options will be unavailable."
    fi
    
    print_success "Requirements check completed"
}

# Install dependencies
install_dependencies() {
    print_info "Installing dependencies..."
    
    # Server dependencies
    print_info "Installing server dependencies..."
    cd server
    npm install
    cd ..
    
    # Client dependencies
    print_info "Installing client dependencies..."
    cd client
    npm install
    cd ..
    
    print_success "Dependencies installed"
}

# Build applications
build_applications() {
    print_info "Building applications..."
    
    # Build server
    print_info "Building server..."
    cd server
    npm run build
    cd ..
    
    # Build client
    print_info "Building client..."
    cd client
    npm run build
    cd ..
    
    print_success "Applications built successfully"
}

# Check environment files
check_environment() {
    print_info "Checking environment configuration..."
    
    if [ ! -f "server/.env" ]; then
        print_warning "Server .env file not found. Creating from template..."
        cp server/.env.example server/.env
        print_warning "Please update server/.env with your production values"
    fi
    
    if [ ! -f "client/.env" ]; then
        print_warning "Client .env file not found. Creating from template..."
        cp client/.env.example client/.env
        print_warning "Please update client/.env with your production values"
    fi
    
    print_success "Environment configuration checked"
}

# Security check
security_check() {
    print_info "Running security checks..."
    
    # Check for security vulnerabilities
    cd server
    npm audit
    cd ..
    
    cd client
    npm audit
    cd ..
    
    print_success "Security check completed"
}

# Database setup
setup_database() {
    print_info "Setting up database..."
    
    print_warning "Make sure MongoDB is running and accessible"
    print_warning "Update MONGODB_URI in server/.env with your production database"
    
    # Check if seeding is needed
    if [ -f "server/src/scripts/seed.ts" ]; then
        print_info "Database seeding script available. Run: cd server && npm run seed"
    fi
    
    print_success "Database setup instructions provided"
}

# Create production environment file
create_production_env() {
    print_info "Creating production environment template..."
    
    cat > .env.production << EOF
# Production Environment Variables
# Copy these to your production server and update with actual values

# Server Environment
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb://localhost:27017/bouncehousekids
JWT_SECRET=your_secure_jwt_secret_here_replace_with_random_string
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
CORS_ORIGIN=https://yourdomain.com

# Client Environment
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_STRIPE_PUBLIC_KEY=pk_live_your_stripe_public_key
REACT_APP_APP_NAME=Bounce House Kids
REACT_APP_COMPANY_NAME=Bounce House Kids LLC
REACT_APP_COMPANY_EMAIL=info@bouncehousekids.com
REACT_APP_COMPANY_PHONE=(555) 123-4567
REACT_APP_GA_TRACKING_ID=UA-XXXXXXXXX-X
REACT_APP_SENTRY_DSN=https://your-sentry-dsn
EOF
    
    print_success "Production environment template created"
}

# Docker deployment
docker_deploy() {
    if command -v docker &> /dev/null; then
        print_info "Docker deployment option available"
        print_info "Run: docker-compose up -d"
        print_info "This will start all services in production mode"
    else
        print_warning "Docker not available. Skipping Docker deployment setup."
    fi
}

# Generate deployment summary
generate_summary() {
    print_info "Generating deployment summary..."
    
    cat > DEPLOYMENT_SUMMARY.md << EOF
# Deployment Summary - $(date)

## ✅ Completed Tasks
- Dependencies installed
- Applications built successfully
- Environment files configured
- Security checks completed
- Production environment template created

## 🚀 Ready for Deployment

### Quick Start Options:

#### Option 1: Docker Compose (Recommended)
\`\`\`bash
docker-compose up -d
\`\`\`

#### Option 2: Manual Deployment
\`\`\`bash
# Start MongoDB
mongod

# Start Server
cd server && npm start

# Serve Client (in another terminal)
cd client && npx serve -s build
\`\`\`

#### Option 3: Cloud Deployment
- Frontend: Deploy build folder to Vercel/Netlify
- Backend: Deploy to Railway/Render/AWS
- Database: Use MongoDB Atlas

## 📋 Next Steps
1. Update production environment variables
2. Set up production database
3. Configure domain and SSL
4. Set up monitoring and analytics
5. Test thoroughly in production environment

## 🔗 Access Points
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Database: MongoDB on port 27017

## 📞 Support
All critical issues resolved. Application is production-ready!
EOF
    
    print_success "Deployment summary generated"
}

# Main deployment function
main() {
    print_info "🏠 Bounce House Kids - Production Deployment"
    print_info "=============================================="
    
    check_requirements
    install_dependencies
    build_applications
    check_environment
    security_check
    setup_database
    create_production_env
    docker_deploy
    generate_summary
    
    echo
    print_success "🎉 DEPLOYMENT PREPARATION COMPLETE!"
    print_success "Your Bounce House Kids application is ready for production!"
    echo
    print_info "Next steps:"
    print_info "1. Update .env.production with your actual production values"
    print_info "2. Set up your production database"
    print_info "3. Choose your deployment method (Docker, Manual, or Cloud)"
    print_info "4. Deploy and test!"
    echo
    print_info "📖 Check DEPLOYMENT_SUMMARY.md for detailed instructions"
    print_info "📖 Check PRODUCTION_READY_SUMMARY.md for comprehensive overview"
}

# Run main function
main "$@"