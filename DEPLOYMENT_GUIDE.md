# Bounce House Kids - Complete Deployment Guide

## 🚀 Step-by-Step Production Deployment

This guide will walk you through deploying your Bounce House Kids application from development to production, including domain setup and SSL configuration.

---

## 📋 Pre-Deployment Checklist

### Required Accounts & Services
- [ ] Domain registrar account (Namecheap, GoDaddy, etc.)
- [ ] Cloud hosting accounts (choose your preferred option):
  - Frontend: Vercel, Netlify, or AWS S3
  - Backend: Railway, Render, or AWS EC2
  - Database: MongoDB Atlas
- [ ] Payment processing: Stripe account
- [ ] Email service: SendGrid account
- [ ] SSL certificate (usually free with hosting providers)

---

## 🌐 OPTION 1: Cloud Deployment (Recommended)

### Step 1: Database Setup (MongoDB Atlas)

1. **Create MongoDB Atlas Account**
   ```bash
   # Go to https://cloud.mongodb.com/
   # Sign up for free account
   ```

2. **Create Database Cluster**
   - Click "Create a New Cluster"
   - Choose "FREE" tier (M0 Sandbox)
   - Select region closest to your users
   - Name your cluster: `bouncehouse-prod`

3. **Configure Database Access**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Username: `bouncehouse-admin`
   - Password: Generate secure password
   - Database User Privileges: "Read and write to any database"

4. **Configure Network Access**
   - Go to "Network Access"
   - Click "Add IP Address"
   - Add: `0.0.0.0/0` (Allow from anywhere) - for initial setup
   - Later restrict to your server IPs for security

5. **Get Connection String**
   - Go to "Clusters" → "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database password

### Step 2: Backend Deployment (Railway)

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   railway login
   ```

2. **Deploy Backend**
   ```bash
   cd server
   railway init
   railway up
   ```

3. **Set Environment Variables**
   ```bash
   # Set all environment variables in Railway dashboard
   railway variables set NODE_ENV=production
   railway variables set PORT=5000
   railway variables set MONGODB_URI="your-mongodb-atlas-connection-string"
   railway variables set JWT_SECRET="your-super-secure-jwt-secret-key"
   railway variables set STRIPE_SECRET_KEY="sk_live_your_stripe_secret_key"
   railway variables set SENDGRID_API_KEY="your-sendgrid-api-key"
   railway variables set SENDGRID_FROM_EMAIL="noreply@yourdomain.com"
   railway variables set CORS_ORIGIN="https://yourdomain.com"
   ```

4. **Get Backend URL**
   - Railway will provide a URL like: `https://your-app-name.railway.app`
   - Save this URL for frontend configuration

### Step 3: Frontend Deployment (Vercel)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   vercel login
   ```

2. **Configure Frontend Environment**
   ```bash
   cd client
   
   # Create production environment file
   cat > .env.production << EOF
   REACT_APP_API_URL=https://your-backend-url.railway.app
   REACT_APP_STRIPE_PUBLIC_KEY=pk_live_your_stripe_public_key
   REACT_APP_APP_NAME=Bounce House Kids
   REACT_APP_COMPANY_NAME=Bounce House Kids LLC
   REACT_APP_COMPANY_EMAIL=info@bouncehousekids.com
   REACT_APP_COMPANY_PHONE=(555) 123-4567
   EOF
   ```

3. **Deploy Frontend**
   ```bash
   vercel --prod
   ```

4. **Get Frontend URL**
   - Vercel will provide a URL like: `https://your-app-name.vercel.app`

### Step 4: Domain Setup

1. **Purchase Domain**
   - Go to your preferred registrar (Namecheap, GoDaddy, etc.)
   - Purchase your domain: `bouncehousekids.com`

2. **Configure DNS for Frontend (Vercel)**
   ```bash
   # In Vercel dashboard:
   # 1. Go to your project
   # 2. Click "Settings" → "Domains"
   # 3. Add your domain: bouncehousekids.com
   # 4. Add DNS records in your registrar:
   ```
   
   **DNS Records for Registrar:**
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   
   Type: A
   Name: @
   Value: 76.76.19.61
   ```

3. **Configure Custom Domain for Backend**
   ```bash
   # In Railway dashboard:
   # 1. Go to your project
   # 2. Click "Settings" → "Domains"
   # 3. Add custom domain: api.bouncehousekids.com
   ```
   
   **Additional DNS Record:**
   ```
   Type: CNAME
   Name: api
   Value: your-railway-app-name.railway.app
   ```

### Step 5: SSL Certificate Setup

1. **Vercel SSL (Automatic)**
   - SSL is automatically provided by Vercel
   - Wait 24-48 hours for propagation

2. **Railway SSL (Automatic)**
   - SSL is automatically provided by Railway
   - Custom domains get free SSL certificates

### Step 6: Update Environment Variables

1. **Update Backend CORS**
   ```bash
   railway variables set CORS_ORIGIN="https://bouncehousekids.com"
   ```

2. **Update Frontend API URL**
   ```bash
   # In Vercel dashboard:
   # Go to Settings → Environment Variables
   # Add: REACT_APP_API_URL = https://api.bouncehousekids.com
   ```

3. **Redeploy Frontend**
   ```bash
   cd client
   vercel --prod
   ```

---

## 🐳 OPTION 2: Docker Deployment (VPS/Dedicated Server)

### Step 1: Server Setup

1. **Provision Server**
   - Rent VPS (DigitalOcean, Linode, AWS EC2)
   - Ubuntu 22.04 LTS recommended
   - Minimum: 2GB RAM, 1 CPU, 25GB SSD

2. **Connect to Server**
   ```bash
   ssh root@your-server-ip
   ```

3. **Install Docker**
   ```bash
   # Update system
   apt update && apt upgrade -y
   
   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   
   # Install Docker Compose
   curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   chmod +x /usr/local/bin/docker-compose
   ```

### Step 2: Deploy Application

1. **Clone Repository**
   ```bash
   git clone https://github.com/yourusername/bouncehousekids.git
   cd bouncehousekids
   ```

2. **Configure Environment**
   ```bash
   # Create production environment file
   cat > .env << EOF
   # Database
   MONGODB_URI=mongodb://admin:password123@mongodb:27017/bouncehousekids?authSource=admin
   
   # Server
   JWT_SECRET=your-super-secure-jwt-secret-key
   STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
   SENDGRID_API_KEY=your-sendgrid-api-key
   SENDGRID_FROM_EMAIL=noreply@bouncehousekids.com
   CORS_ORIGIN=https://bouncehousekids.com
   
   # Client
   REACT_APP_API_URL=https://api.bouncehousekids.com
   REACT_APP_STRIPE_PUBLIC_KEY=pk_live_your_stripe_public_key
   REACT_APP_APP_NAME=Bounce House Kids
   REACT_APP_COMPANY_NAME=Bounce House Kids LLC
   REACT_APP_COMPANY_EMAIL=info@bouncehousekids.com
   REACT_APP_COMPANY_PHONE=(555) 123-4567
   EOF
   ```

3. **Deploy with Docker Compose**
   ```bash
   docker-compose up -d
   ```

### Step 3: Configure Nginx & SSL

1. **Install Nginx**
   ```bash
   apt install nginx -y
   systemctl start nginx
   systemctl enable nginx
   ```

2. **Configure Nginx**
   ```bash
   cat > /etc/nginx/sites-available/bouncehousekids << EOF
   server {
       listen 80;
       server_name bouncehousekids.com www.bouncehousekids.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_set_header Host \$host;
           proxy_set_header X-Real-IP \$remote_addr;
           proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto \$scheme;
       }
   }
   
   server {
       listen 80;
       server_name api.bouncehousekids.com;
       
       location / {
           proxy_pass http://localhost:5000;
           proxy_set_header Host \$host;
           proxy_set_header X-Real-IP \$remote_addr;
           proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto \$scheme;
       }
   }
   EOF
   
   ln -s /etc/nginx/sites-available/bouncehousekids /etc/nginx/sites-enabled/
   nginx -t
   systemctl reload nginx
   ```

3. **Install SSL Certificate**
   ```bash
   # Install Certbot
   apt install certbot python3-certbot-nginx -y
   
   # Get SSL certificates
   certbot --nginx -d bouncehousekids.com -d www.bouncehousekids.com -d api.bouncehousekids.com
   
   # Auto-renewal
   crontab -e
   # Add: 0 12 * * * /usr/bin/certbot renew --quiet
   ```

### Step 4: Configure DNS

1. **Point Domain to Server**
   ```
   Type: A
   Name: @
   Value: your-server-ip
   
   Type: A
   Name: www
   Value: your-server-ip
   
   Type: A
   Name: api
   Value: your-server-ip
   ```

---

## 🔧 Post-Deployment Configuration

### Step 1: Database Seeding

1. **Run Database Seeds**
   ```bash
   # If using cloud backend
   railway run npm run seed
   
   # If using Docker
   docker-compose exec server npm run seed
   ```

### Step 2: Test Deployment

1. **Frontend Testing**
   ```bash
   # Test main site
   curl -I https://bouncehousekids.com
   
   # Should return 200 OK
   ```

2. **Backend Testing**
   ```bash
   # Test API endpoint
   curl https://api.bouncehousekids.com/health
   
   # Should return: {"status":"ok"}
   ```

3. **Database Testing**
   ```bash
   # Test bounce house listing
   curl https://api.bouncehousekids.com/api/bounce-houses
   
   # Should return JSON array
   ```

### Step 3: Configure Monitoring

1. **Setup Error Tracking**
   - Sign up for Sentry.io
   - Add Sentry DSN to environment variables
   - Redeploy applications

2. **Setup Analytics**
   - Create Google Analytics account
   - Add tracking ID to environment variables
   - Redeploy frontend

### Step 4: Performance Optimization

1. **Configure CDN (Optional)**
   - Setup CloudFlare for static assets
   - Configure caching rules

2. **Database Optimization**
   - Add database indexes
   - Configure connection pooling

---

## 📊 Production Monitoring

### Health Checks

1. **Automated Monitoring**
   ```bash
   # Create monitoring script
   cat > /usr/local/bin/health-check.sh << 'EOF'
   #!/bin/bash
   
   # Check frontend
   if curl -f https://bouncehousekids.com > /dev/null 2>&1; then
       echo "Frontend: OK"
   else
       echo "Frontend: FAILED"
   fi
   
   # Check backend
   if curl -f https://api.bouncehousekids.com/health > /dev/null 2>&1; then
       echo "Backend: OK"
   else
       echo "Backend: FAILED"
   fi
   EOF
   
   chmod +x /usr/local/bin/health-check.sh
   
   # Run every 5 minutes
   crontab -e
   # Add: */5 * * * * /usr/local/bin/health-check.sh
   ```

### Backup Strategy

1. **Database Backups**
   ```bash
   # If using MongoDB Atlas - automatic backups included
   # If using self-hosted MongoDB:
   
   cat > /usr/local/bin/backup-db.sh << 'EOF'
   #!/bin/bash
   DATE=$(date +%Y%m%d_%H%M%S)
   mongodump --host localhost:27017 --db bouncehousekids --out /backups/mongo_$DATE
   # Upload to cloud storage
   aws s3 cp /backups/mongo_$DATE s3://your-backup-bucket/
   EOF
   
   chmod +x /usr/local/bin/backup-db.sh
   # Run daily at 2 AM
   # 0 2 * * * /usr/local/bin/backup-db.sh
   ```

---

## 🎯 Quick Start Summary

### For Cloud Deployment (Fastest):
1. Create MongoDB Atlas database
2. Deploy backend to Railway
3. Deploy frontend to Vercel
4. Configure domain DNS
5. Update environment variables
6. Test deployment

### For Docker Deployment (Full Control):
1. Provision VPS server
2. Install Docker & Docker Compose
3. Clone repository and configure
4. Deploy with docker-compose
5. Configure Nginx & SSL
6. Point domain to server

### Timeline:
- **Cloud Deployment**: 2-4 hours
- **Docker Deployment**: 4-8 hours
- **Domain Propagation**: 24-48 hours

---

## 🆘 Troubleshooting

### Common Issues:

1. **CORS Errors**
   - Check CORS_ORIGIN environment variable
   - Ensure frontend URL matches exactly

2. **Database Connection Issues**
   - Verify MongoDB URI format
   - Check database user permissions
   - Ensure network access is configured

3. **SSL Certificate Issues**
   - Wait 24-48 hours for DNS propagation
   - Check domain configuration
   - Verify A records point to correct IP

4. **Build Failures**
   - Check environment variables
   - Verify all dependencies are installed
   - Check build logs for specific errors

### Support Commands:
```bash
# Check application logs
docker-compose logs -f

# Check server resources
htop
df -h

# Check DNS propagation
nslookup bouncehousekids.com
dig bouncehousekids.com

# Test SSL
openssl s_client -connect bouncehousekids.com:443
```

---

## 🎉 Deployment Complete!

After following these steps, your Bounce House Kids application will be:
- ✅ Live on your custom domain
- ✅ Secured with SSL certificates
- ✅ Connected to production database
- ✅ Configured for payments
- ✅ Ready for customers

**Your application is now production-ready and accessible at:**
- Main site: https://bouncehousekids.com
- API: https://api.bouncehousekids.com
- Admin: https://bouncehousekids.com/admin

Remember to:
1. Test all functionality thoroughly
2. Configure monitoring and backups
3. Update payment processing to live mode
4. Set up customer support channels
5. Launch marketing campaigns

**Congratulations! 🎊 Your Bounce House Kids business is now online!**