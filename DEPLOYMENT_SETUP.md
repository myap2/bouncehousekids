# Bounce House Kids - Cloud Deployment Setup

## 🎯 Quick Cloud Deployment Guide

### Step 1: Database Setup (MongoDB Atlas)

1. **Create MongoDB Atlas Account**
   - Go to https://cloud.mongodb.com/
   - Sign up for a free account
   - Choose "FREE" tier (M0 Sandbox)

2. **Create Database Cluster**
   - Click "Create a New Cluster"
   - Choose "FREE" tier (M0 Sandbox)
   - Select region closest to your users
   - Name your cluster: `bouncehouse-prod`

3. **Configure Database Access**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Username: `bouncehouse-admin`
   - Password: Generate a secure password (save this!)
   - Database User Privileges: "Read and write to any database"

4. **Configure Network Access**
   - Go to "Network Access"
   - Click "Add IP Address"
   - Add: `0.0.0.0/0` (Allow from anywhere)
   - Click "Confirm"

5. **Get Connection String**
   - Go to "Clusters" → "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database password
   - Save this connection string for Step 2

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

3. **Set Environment Variables in Railway Dashboard**
   - Go to your Railway project dashboard
   - Click "Variables" tab
   - Add these variables:

   ```
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=your-mongodb-atlas-connection-string
   JWT_SECRET=your-super-secure-jwt-secret-key
   STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
   SENDGRID_API_KEY=your-sendgrid-api-key
   SENDGRID_FROM_EMAIL=noreply@yourdomain.com
   CORS_ORIGIN=https://yourdomain.com
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
   REACT_APP_COMPANY_EMAIL=info@yourdomain.com
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

1. **Configure DNS for Frontend (Vercel)**
   - In Vercel dashboard: Go to your project → "Settings" → "Domains"
   - Add your domain: `yourdomain.com`
   - Add DNS records in your registrar:

   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com

   Type: A
   Name: @
   Value: 76.76.19.61
   ```

2. **Configure Custom Domain for Backend**
   - In Railway dashboard: Go to your project → "Settings" → "Domains"
   - Add custom domain: `api.yourdomain.com`
   - Add DNS record in your registrar:

   ```
   Type: CNAME
   Name: api
   Value: your-railway-app-name.railway.app
   ```

### Step 5: Update Environment Variables

1. **Update Backend CORS**
   - In Railway dashboard, update:
   ```
   CORS_ORIGIN=https://yourdomain.com
   ```

2. **Update Frontend API URL**
   - In Vercel dashboard: Settings → Environment Variables
   - Update: `REACT_APP_API_URL = https://api.yourdomain.com`

3. **Redeploy Frontend**
   ```bash
   cd client
   vercel --prod
   ```

### Step 6: Test Your Deployment

1. **Test Frontend**: Visit `https://yourdomain.com`
2. **Test Backend**: Visit `https://api.yourdomain.com/health`
3. **Test Database**: Check if bounce houses load on the frontend

### Step 7: Seed Database

```bash
# In Railway dashboard, run:
railway run npm run seed
```

## 🎉 You're Live!

Your Bounce House Kids application is now deployed and accessible at:
- **Frontend**: https://yourdomain.com
- **Backend API**: https://api.yourdomain.com

## 📝 Required Accounts

- [ ] MongoDB Atlas (free)
- [ ] Railway (free tier)
- [ ] Vercel (free tier)
- [ ] Domain registrar (where you bought your domain)
- [ ] Stripe (for payments)
- [ ] SendGrid (for emails) 