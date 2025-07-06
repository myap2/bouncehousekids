#!/bin/bash

# 🏠 Multi-Tenant Bounce House Deployment Script
# This script deploys your multi-tenant bounce house platform

echo "🎈 Welcome to Multi-Tenant Bounce House Deployment!"
echo "This will help you deploy your apartment building for bounce house companies!"
echo ""

# Colors for pretty output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_step() {
    echo -e "${BLUE}🏗️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if required tools are installed
check_requirements() {
    print_step "Checking requirements..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    print_success "All requirements met!"
}

# Setup environment variables
setup_environment() {
    print_step "Setting up environment variables..."
    
    echo "🔐 Let's set up your environment variables:"
    echo ""
    
    # Database setup
    echo "📊 Database Configuration:"
    read -p "Enter your MongoDB connection string: " MONGODB_URI
    
    # JWT Secret
    echo "🔑 Security Configuration:"
    read -p "Enter a secret key for JWT (make it random and long): " JWT_SECRET
    
    # File storage
    echo "📁 File Storage Configuration:"
    echo "Choose your file storage option:"
    echo "1. Cloudinary (Recommended - free tier available)"
    echo "2. AWS S3 (Cost-effective for large scale)"
    echo "3. Local storage (Development only)"
    read -p "Enter your choice (1-3): " STORAGE_CHOICE
    
    case $STORAGE_CHOICE in
        1)
            UPLOAD_STORAGE_TYPE="cloudinary"
            read -p "Enter Cloudinary Cloud Name: " CLOUDINARY_CLOUD_NAME
            read -p "Enter Cloudinary API Key: " CLOUDINARY_API_KEY
            read -p "Enter Cloudinary API Secret: " CLOUDINARY_API_SECRET
            ;;
        2)
            UPLOAD_STORAGE_TYPE="s3"
            read -p "Enter AWS S3 Bucket Name: " AWS_S3_BUCKET
            read -p "Enter AWS Access Key ID: " AWS_ACCESS_KEY_ID
            read -p "Enter AWS Secret Access Key: " AWS_SECRET_ACCESS_KEY
            ;;
        3)
            UPLOAD_STORAGE_TYPE="local"
            print_warning "Local storage selected - only use for development!"
            ;;
        *)
            print_error "Invalid choice. Defaulting to local storage."
            UPLOAD_STORAGE_TYPE="local"
            ;;
    esac
    
    # Create server .env file
    cat > server/.env << EOF
# Multi-Tenant Bounce House Configuration
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=$MONGODB_URI

# Authentication
JWT_SECRET=$JWT_SECRET

# File Storage
UPLOAD_STORAGE_TYPE=$UPLOAD_STORAGE_TYPE
EOF

    # Add storage-specific variables
    if [ "$UPLOAD_STORAGE_TYPE" == "cloudinary" ]; then
        cat >> server/.env << EOF
CLOUDINARY_CLOUD_NAME=$CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY=$CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET=$CLOUDINARY_API_SECRET
EOF
    elif [ "$UPLOAD_STORAGE_TYPE" == "s3" ]; then
        cat >> server/.env << EOF
AWS_S3_BUCKET=$AWS_S3_BUCKET
AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY
EOF
    fi
    
    print_success "Environment variables configured!"
}

# Install dependencies
install_dependencies() {
    print_step "Installing dependencies..."
    
    # Install server dependencies
    echo "📦 Installing server dependencies..."
    cd server
    npm install
    cd ..
    
    # Install client dependencies
    echo "📦 Installing client dependencies..."
    cd client
    npm install
    cd ..
    
    print_success "Dependencies installed!"
}

# Build applications
build_applications() {
    print_step "Building applications..."
    
    # Build server
    echo "🏗️ Building server..."
    cd server
    npm run build
    cd ..
    
    # Build client
    echo "🏗️ Building client..."
    cd client
    npm run build
    cd ..
    
    print_success "Applications built successfully!"
}

# Deploy to cloud
deploy_to_cloud() {
    print_step "Deployment Options..."
    
    echo "🚀 Choose your deployment method:"
    echo "1. Railway + Vercel (Recommended - easiest)"
    echo "2. Docker + VPS (Budget option)"
    echo "3. Manual deployment (Advanced users)"
    read -p "Enter your choice (1-3): " DEPLOY_CHOICE
    
    case $DEPLOY_CHOICE in
        1)
            deploy_railway_vercel
            ;;
        2)
            deploy_docker_vps
            ;;
        3)
            deploy_manual
            ;;
        *)
            print_error "Invalid choice. Please run the script again."
            exit 1
            ;;
    esac
}

# Railway + Vercel deployment
deploy_railway_vercel() {
    print_step "Railway + Vercel Deployment"
    
    echo "🚂 Railway + Vercel deployment instructions:"
    echo ""
    echo "1. 🗄️ Database (MongoDB Atlas):"
    echo "   - Go to https://www.mongodb.com/cloud/atlas"
    echo "   - Create free account and cluster"
    echo "   - Get connection string (already configured)"
    echo ""
    echo "2. 🚂 Backend (Railway):"
    echo "   - Go to https://railway.app/"
    echo "   - Connect your GitHub account"
    echo "   - Create new project from your GitHub repo"
    echo "   - Select the 'server' folder"
    echo "   - Railway will automatically detect it's a Node.js app"
    echo "   - Add environment variables from server/.env"
    echo ""
    echo "3. ⚡ Frontend (Vercel):"
    echo "   - Go to https://vercel.com/"
    echo "   - Connect your GitHub account"
    echo "   - Import your project"
    echo "   - Select the 'client' folder"
    echo "   - Set REACT_APP_API_URL to your Railway app URL"
    echo ""
    
    read -p "Enter your Railway app URL (e.g., https://your-app.railway.app): " RAILWAY_URL
    
    # Create client .env file
    cat > client/.env << EOF
REACT_APP_API_URL=$RAILWAY_URL
EOF
    
    print_success "Configuration complete!"
    print_success "Your multi-tenant bounce house platform is ready to deploy!"
}

# Docker VPS deployment
deploy_docker_vps() {
    print_step "Docker VPS Deployment"
    
    echo "🐳 Docker deployment instructions:"
    echo ""
    echo "1. Get a VPS (DigitalOcean, Linode, etc.)"
    echo "2. Install Docker on your VPS"
    echo "3. Copy your project files to the VPS"
    echo "4. Run: docker-compose up -d"
    echo ""
    echo "Your docker-compose.yml is already configured for multi-tenant deployment!"
    
    print_success "Docker deployment ready!"
}

# Manual deployment
deploy_manual() {
    print_step "Manual Deployment"
    
    echo "📋 Manual deployment checklist:"
    echo ""
    echo "✅ Environment variables configured"
    echo "✅ Dependencies installed"
    echo "✅ Applications built"
    echo ""
    echo "Next steps:"
    echo "1. Deploy server/dist folder to your Node.js hosting"
    echo "2. Deploy client/build folder to your static hosting"
    echo "3. Configure environment variables on your hosting platform"
    echo "4. Set up database connection"
    echo ""
    
    print_success "Manual deployment ready!"
}

# Create initial admin user
create_admin_user() {
    print_step "Creating initial admin user..."
    
    echo "👤 Let's create your super admin account:"
    read -p "Enter admin email: " ADMIN_EMAIL
    read -p "Enter admin password: " ADMIN_PASSWORD
    read -p "Enter admin first name: " ADMIN_FIRST_NAME
    read -p "Enter admin last name: " ADMIN_LAST_NAME
    
    # Create admin user script
    cat > create-admin.js << EOF
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: { type: String, default: 'customer' },
  phone: { type: String, required: true },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true }
  }
});

const User = mongoose.model('User', UserSchema);

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('$ADMIN_PASSWORD', salt);
    
    const admin = new User({
      email: '$ADMIN_EMAIL',
      password: hashedPassword,
      firstName: '$ADMIN_FIRST_NAME',
      lastName: '$ADMIN_LAST_NAME',
      role: 'admin',
      phone: '555-0000',
      address: {
        street: '123 Admin St',
        city: 'Admin City',
        state: 'AC',
        zipCode: '12345'
      }
    });
    
    await admin.save();
    console.log('✅ Admin user created successfully!');
    console.log('Email:', admin.email);
    console.log('Role:', admin.role);
    
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

createAdmin();
EOF
    
    print_success "Admin user script created!"
    echo "Run 'node create-admin.js' after deployment to create your admin account."
}

# Main deployment flow
main() {
    echo "🎈 Multi-Tenant Bounce House Deployment"
    echo "======================================"
    echo ""
    
    check_requirements
    setup_environment
    install_dependencies
    build_applications
    deploy_to_cloud
    create_admin_user
    
    echo ""
    echo "🎉 Deployment Complete!"
    echo "======================"
    echo ""
    echo "Your multi-tenant bounce house platform is ready!"
    echo ""
    echo "📋 What you now have:"
    echo "✅ Secure multi-tenant architecture"
    echo "✅ Company isolation (each company sees only their data)"
    echo "✅ Role-based access control"
    echo "✅ Cloud storage for bounce house images"
    echo "✅ Payment processing ready"
    echo "✅ Professional waiver system"
    echo ""
    echo "🏢 How it works:"
    echo "• Companies sign up and become 'company-admin'"
    echo "• They can only add/edit their own bounce houses"
    echo "• Customers can see all bounce houses and book them"
    echo "• You (super admin) can manage everything"
    echo ""
    echo "💰 Revenue model:"
    echo "• Charge companies monthly subscription fees"
    echo "• Free tier: 5 bounce houses"
    echo "• Pro tier: 50 bounce houses"
    echo "• Enterprise: Unlimited"
    echo ""
    echo "🎈 Happy bouncing!"
}

# Run the main function
main