#!/bin/bash

# Bounce House Kids - Quick Cloud Deployment Script
# This script automates the cloud deployment process

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_header() {
    echo -e "${BLUE}🏠 $1${NC}"
    echo -e "${BLUE}================================================${NC}"
}

# Function to prompt for input
prompt_input() {
    local prompt="$1"
    local var_name="$2"
    local default_value="$3"
    
    if [ -n "$default_value" ]; then
        read -p "$prompt [$default_value]: " input
        eval "$var_name=\"${input:-$default_value}\""
    else
        read -p "$prompt: " input
        eval "$var_name=\"$input\""
    fi
}

# Function to prompt for sensitive input
prompt_secret() {
    local prompt="$1"
    local var_name="$2"
    
    read -s -p "$prompt: " input
    echo
    eval "$var_name=\"$input\""
}

# Check prerequisites
check_prerequisites() {
    print_header "Checking Prerequisites"
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        print_error "Node.js is required but not installed. Please install Node.js first."
        exit 1
    fi
    
    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        print_error "npm is required but not installed. Please install npm first."
        exit 1
    fi
    
    print_success "Prerequisites check passed"
}

# Collect configuration
collect_config() {
    print_header "Configuration Setup"
    
    print_info "Please provide the following information for your deployment:"
    echo
    
    # Domain configuration
    prompt_input "Enter your domain name (e.g., bouncehousekids.com)" DOMAIN_NAME
    
    # Storage configuration
    print_info "File Upload Storage Configuration"
    echo "Options:"
    echo "1. cloudinary (Recommended - Free 25GB, image optimization, CDN)"
    echo "2. s3 (AWS S3 - Cheapest, requires AWS setup)"
    echo "3. local (Development only - NOT for production)"
    prompt_input "Choose storage type (cloudinary/s3/local)" STORAGE_TYPE "cloudinary"
    
    # Storage-specific configuration
    if [ "$STORAGE_TYPE" = "cloudinary" ]; then
        print_info "Cloudinary Configuration (Get from https://cloudinary.com/console)"
        prompt_input "Cloudinary Cloud Name" CLOUDINARY_CLOUD_NAME
        prompt_secret "Cloudinary API Key" CLOUDINARY_API_KEY
        prompt_secret "Cloudinary API Secret" CLOUDINARY_API_SECRET
    elif [ "$STORAGE_TYPE" = "s3" ]; then
        print_info "AWS S3 Configuration"
        prompt_input "AWS S3 Bucket Name" AWS_S3_BUCKET
        prompt_input "AWS Region" AWS_REGION "us-east-1"
        prompt_secret "AWS Access Key ID" AWS_ACCESS_KEY_ID
        prompt_secret "AWS Secret Access Key" AWS_SECRET_ACCESS_KEY
    fi
    
    # Database configuration
    print_info "MongoDB Atlas connection string (from MongoDB Atlas dashboard)"
    prompt_secret "MongoDB URI" MONGODB_URI
    
    # JWT Secret
    print_info "JWT Secret (use a long, random string)"
    prompt_input "JWT Secret" JWT_SECRET "$(openssl rand -base64 32)"
    
    # Stripe configuration
    print_info "Stripe API Keys (from Stripe dashboard)"
    prompt_secret "Stripe Secret Key (sk_live_...)" STRIPE_SECRET_KEY
    prompt_input "Stripe Public Key (pk_live_...)" STRIPE_PUBLIC_KEY
    
    # SendGrid configuration
    print_info "SendGrid Email Service (from SendGrid dashboard)"
    prompt_secret "SendGrid API Key" SENDGRID_API_KEY
    prompt_input "SendGrid From Email" SENDGRID_FROM_EMAIL "noreply@$DOMAIN_NAME"
    
    # Company information
    print_info "Company Information"
    prompt_input "Company Name" COMPANY_NAME "Bounce House Kids LLC"
    prompt_input "Company Email" COMPANY_EMAIL "info@$DOMAIN_NAME"
    prompt_input "Company Phone" COMPANY_PHONE "(555) 123-4567"
    
    print_success "Configuration collected"
}

# Install CLI tools
install_cli_tools() {
    print_header "Installing CLI Tools"
    
    # Install Vercel CLI
    if ! command -v vercel &> /dev/null; then
        print_info "Installing Vercel CLI..."
        npm install -g vercel
        print_success "Vercel CLI installed"
    else
        print_info "Vercel CLI already installed"
    fi
    
    # Install Railway CLI
    if ! command -v railway &> /dev/null; then
        print_info "Installing Railway CLI..."
        npm install -g @railway/cli
        print_success "Railway CLI installed"
    else
        print_info "Railway CLI already installed"
    fi
    
    print_success "CLI tools ready"
}

# Deploy backend
deploy_backend() {
    print_header "Deploying Backend to Railway"
    
    cd server
    
    # Login to Railway
    print_info "Please login to Railway when prompted..."
    railway login
    
    # Initialize Railway project
    print_info "Initializing Railway project..."
    railway init
    
    # Set environment variables
    print_info "Setting environment variables..."
    railway variables set NODE_ENV=production
    railway variables set PORT=5000
    railway variables set MONGODB_URI="$MONGODB_URI"
    railway variables set JWT_SECRET="$JWT_SECRET"
    railway variables set STRIPE_SECRET_KEY="$STRIPE_SECRET_KEY"
    railway variables set SENDGRID_API_KEY="$SENDGRID_API_KEY"
    railway variables set SENDGRID_FROM_EMAIL="$SENDGRID_FROM_EMAIL"
    railway variables set CORS_ORIGIN="https://$DOMAIN_NAME"
    
    # Set storage-specific environment variables
    railway variables set UPLOAD_STORAGE_TYPE="$STORAGE_TYPE"
    
    if [ "$STORAGE_TYPE" = "cloudinary" ]; then
        print_info "Setting Cloudinary configuration..."
        railway variables set CLOUDINARY_CLOUD_NAME="$CLOUDINARY_CLOUD_NAME"
        railway variables set CLOUDINARY_API_KEY="$CLOUDINARY_API_KEY"
        railway variables set CLOUDINARY_API_SECRET="$CLOUDINARY_API_SECRET"
    elif [ "$STORAGE_TYPE" = "s3" ]; then
        print_info "Setting AWS S3 configuration..."
        railway variables set AWS_S3_BUCKET="$AWS_S3_BUCKET"
        railway variables set AWS_REGION="$AWS_REGION"
        railway variables set AWS_ACCESS_KEY_ID="$AWS_ACCESS_KEY_ID"
        railway variables set AWS_SECRET_ACCESS_KEY="$AWS_SECRET_ACCESS_KEY"
    fi
    
    # Deploy
    print_info "Deploying backend..."
    railway up
    
    # Get the deployed URL
    BACKEND_URL=$(railway status --json | jq -r '.deployments[0].url')
    print_success "Backend deployed to: $BACKEND_URL"
    
    cd ..
}

# Deploy frontend
deploy_frontend() {
    print_header "Deploying Frontend to Vercel"
    
    cd client
    
    # Create production environment file
    cat > .env.production << EOF
REACT_APP_API_URL=$BACKEND_URL
REACT_APP_STRIPE_PUBLIC_KEY=$STRIPE_PUBLIC_KEY
REACT_APP_APP_NAME=Bounce House Kids
REACT_APP_COMPANY_NAME=$COMPANY_NAME
REACT_APP_COMPANY_EMAIL=$COMPANY_EMAIL
REACT_APP_COMPANY_PHONE=$COMPANY_PHONE
EOF
    
    # Login to Vercel
    print_info "Please login to Vercel when prompted..."
    vercel login
    
    # Deploy
    print_info "Deploying frontend..."
    vercel --prod
    
    # Get the deployed URL
    FRONTEND_URL=$(vercel --prod 2>&1 | grep -o 'https://[^[:space:]]*' | head -1)
    print_success "Frontend deployed to: $FRONTEND_URL"
    
    cd ..
}

# Configure custom domain
configure_domain() {
    print_header "Domain Configuration"
    
    print_info "To configure your custom domain, follow these steps:"
    echo
    
    print_info "1. Frontend Domain Setup (Vercel):"
    echo "   - Go to your Vercel dashboard"
    echo "   - Click on your project"
    echo "   - Go to Settings → Domains"
    echo "   - Add domain: $DOMAIN_NAME"
    echo "   - Add DNS records in your registrar:"
    echo "     Type: A, Name: @, Value: 76.76.19.61"
    echo "     Type: CNAME, Name: www, Value: cname.vercel-dns.com"
    echo
    
    print_info "2. Backend Domain Setup (Railway):"
    echo "   - Go to your Railway dashboard"
    echo "   - Click on your project"
    echo "   - Go to Settings → Domains"
    echo "   - Add domain: api.$DOMAIN_NAME"
    echo "   - Add DNS record in your registrar:"
    echo "     Type: CNAME, Name: api, Value: $BACKEND_URL"
    echo
    
    print_warning "DNS propagation can take 24-48 hours"
    
    # Update CORS after domain setup
    print_info "After domain setup, update CORS setting:"
    echo "railway variables set CORS_ORIGIN=\"https://$DOMAIN_NAME\""
}

# Generate deployment summary
generate_summary() {
    print_header "Deployment Summary"
    
    cat > DEPLOYMENT_RESULTS.md << EOF
# Deployment Results - $(date)

## 🎉 Deployment Complete!

### Deployed URLs:
- **Frontend**: $FRONTEND_URL
- **Backend**: $BACKEND_URL

### Custom Domain Setup:
- **Main Site**: https://$DOMAIN_NAME (after DNS setup)
- **API**: https://api.$DOMAIN_NAME (after DNS setup)

### Environment Configuration:
- ✅ MongoDB Atlas database configured
- ✅ Stripe payment processing configured
- ✅ SendGrid email service configured
- ✅ JWT authentication configured

### Next Steps:
1. Configure custom domain DNS records (see instructions above)
2. Test all functionality
3. Update Stripe to live mode
4. Set up monitoring and analytics
5. Launch your business!

### Support:
- Frontend logs: Check Vercel dashboard
- Backend logs: Check Railway dashboard
- Database: Check MongoDB Atlas dashboard

### Configuration Details:
- Domain: $DOMAIN_NAME
- Company: $COMPANY_NAME
- Email: $COMPANY_EMAIL
- Phone: $COMPANY_PHONE

**🎊 Your Bounce House Kids business is now online!**
EOF
    
    print_success "Deployment summary saved to DEPLOYMENT_RESULTS.md"
}

# Test deployment
test_deployment() {
    print_header "Testing Deployment"
    
    print_info "Testing backend health..."
    if curl -f "$BACKEND_URL/health" > /dev/null 2>&1; then
        print_success "Backend is responding"
    else
        print_warning "Backend health check failed - check Railway logs"
    fi
    
    print_info "Testing frontend..."
    if curl -f "$FRONTEND_URL" > /dev/null 2>&1; then
        print_success "Frontend is responding"
    else
        print_warning "Frontend health check failed - check Vercel logs"
    fi
}

# Main deployment function
main() {
    print_header "Bounce House Kids - Quick Cloud Deployment"
    
    echo "This script will deploy your Bounce House Kids application to the cloud."
    echo "You'll need accounts with: MongoDB Atlas, Railway, Vercel, and Stripe."
    echo
    read -p "Are you ready to proceed? (y/n): " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Deployment cancelled"
        exit 0
    fi
    
    check_prerequisites
    collect_config
    install_cli_tools
    deploy_backend
    deploy_frontend
    configure_domain
    test_deployment
    generate_summary
    
    echo
    print_success "🎉 DEPLOYMENT COMPLETE!"
    echo
    print_info "Your application is now live!"
    print_info "Frontend: $FRONTEND_URL"
    print_info "Backend: $BACKEND_URL"
    echo
    print_info "📖 Check DEPLOYMENT_RESULTS.md for complete details"
    print_info "📖 Check DEPLOYMENT_GUIDE.md for custom domain setup"
    echo
    print_warning "Remember to configure your custom domain DNS records!"
}

# Run main function
main "$@"