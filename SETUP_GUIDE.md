# 🎉 My Bounce Place - Complete Setup Guide

Welcome to My Bounce Place! This guide will help you get your bounce house rental business up and running quickly.

## 🎯 What You're Getting

This is a **complete, customizable bounce house rental platform** that includes:

- ✅ **Multi-tenant/White-label support** - Run multiple businesses from one platform
- ✅ **Complete booking system** with calendar, payments, and management
- ✅ **Stripe payment integration** for secure transactions
- ✅ **User management** with customer accounts and admin panels
- ✅ **Responsive design** that works on all devices
- ✅ **Email notifications** for bookings and confirmations
- ✅ **Inventory management** for bounce houses
- ✅ **Review and rating system**
- ✅ **Production-ready** with Docker deployment

## 🚀 Quick Start (5 Minutes)

### Prerequisites

- Computer with Docker installed
- Domain name (optional, can use localhost for testing)
- Stripe account for payments
- SendGrid account for emails (optional)

### 1. Download and Setup

```bash
# Clone or download the project
git clone <your-repository-url>
cd bouncehousekids

# Copy environment template
cp .env.production .env

# Make deployment script executable
chmod +x deploy.sh
```

### 2. Configure Your Business

Edit the `.env` file with your business information:

```env
# Your business details
REACT_APP_APP_NAME=Your Business Name
REACT_APP_COMPANY_NAME=Your Business LLC
REACT_APP_COMPANY_EMAIL=info@yourbusiness.com
REACT_APP_COMPANY_PHONE=(555) 123-4567

# Stripe keys (get from https://dashboard.stripe.com)
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
REACT_APP_STRIPE_PUBLIC_KEY=pk_live_your_stripe_public_key

# Email setup (get from https://sendgrid.com)
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@yourbusiness.com

# Website URL
REACT_APP_API_URL=https://yourdomain.com/api
CORS_ORIGIN=https://yourdomain.com

# Security (generate a strong random string)
JWT_SECRET=your-super-strong-random-secret-here
```

### 3. Deploy

```bash
# Run the deployment script
./deploy.sh
```

### 4. Setup Sample Data

```bash
# Add sample bounce houses and admin account
docker-compose exec server npm run seed
```

### 5. Access Your Site

- **Website**: http://localhost:3000
- **Admin Login**: admin@bouncehousekids.com / password123

## 🎨 Customizing for Your Business

### White-Label/Multi-Tenant Setup

This platform supports multiple businesses. Each business gets:

- Custom subdomain (e.g., yourname.bouncehousekids.com)
- Custom branding (colors, logo, fonts)
- Separate inventory and customers
- Independent payment processing

#### Adding a New Business

1. **Via API** (recommended for automation):

```bash
curl -X POST http://localhost:5000/api/companies \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "ABC Party Rentals",
    "subdomain": "abc",
    "email": "info@abcparty.com",
    "phone": "(555) 123-4567",
    "address": {
      "street": "123 Business St",
      "city": "Your City",
      "state": "CA",
      "zipCode": "12345"
    },
    "branding": {
      "primaryColor": "#FF6B6B",
      "secondaryColor": "#4ECDC4",
      "fontFamily": "Roboto, sans-serif"
    },
    "paymentConfig": {
      "stripePublicKey": "pk_test_...",
      "stripeSecretKey": "sk_test_...",
      "stripeWebhookSecret": "whsec_..."
    },
    "emailConfig": {
      "fromEmail": "noreply@abcparty.com",
      "fromName": "ABC Party Rentals"
    }
  }'
```

2. **Direct Database** (for manual setup):

- Connect to your MongoDB
- Insert a new company record
- Create a company admin user

### Branding Customization

Each business can customize:

#### Colors and Fonts

```javascript
// Available via API: GET /api/companies/branding
{
  "branding": {
    "primaryColor": "#4F46E5",    // Main brand color
    "secondaryColor": "#10B981",  // Accent color
    "fontFamily": "Inter, sans-serif",
    "logo": "https://yourdomain.com/logo.png",
    "favicon": "https://yourdomain.com/favicon.ico"
  }
}
```

#### Business Settings

```javascript
{
  "settings": {
    "currency": "USD",
    "timezone": "America/New_York",
    "minimumBookingNotice": 24,    // hours
    "maximumBookingAdvance": 365,  // days
    "deliveryRadius": 25,          // miles
    "deliveryFee": 50,             // dollars
    "taxRate": 0.08,               // 8%
    "requiresDeposit": true,
    "depositPercentage": 50        // 50%
  }
}
```

## 🌐 Production Deployment

### Option 1: Docker (Recommended)

The platform includes complete Docker configuration for easy deployment on any server.

```bash
# On your production server
git clone <your-repository>
cd bouncehousekids
cp .env.production .env
# Edit .env with production values
./deploy.sh
```

### Option 2: Cloud Platforms

#### Vercel + Railway/Render

- **Frontend**: Deploy to Vercel (automatic from Git)
- **Backend**: Deploy to Railway or Render
- **Database**: MongoDB Atlas

#### AWS/Digital Ocean/Google Cloud

- Use the included Docker configuration
- Set up load balancer and SSL certificates
- Configure domain routing

### Domain Setup

#### Single Business

Point your domain to the server:

```
yourbusiness.com → Your Server IP
```

#### Multi-Tenant (Multiple Businesses)

Configure wildcard DNS:

```
*.yourbusiness.com → Your Server IP
abc.yourbusiness.com → ABC Party Rentals
xyz.yourbusiness.com → XYZ Bounce Co
```

## 💳 Payment Setup

### Stripe Configuration

1. **Create Stripe Account**: https://dashboard.stripe.com
2. **Get API Keys**:
   - Test keys for development
   - Live keys for production
3. **Configure Webhooks**:
   - Endpoint: `https://yourdomain.com/api/stripe/webhook`
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`

### Multi-Business Payments

Each business can have separate Stripe accounts for independent payment processing.

## 📧 Email Setup

### SendGrid (Recommended)

1. Create account at https://sendgrid.com
2. Get API key
3. Verify sender email
4. Configure in `.env`

### Custom SMTP

Configure any SMTP provider in the company settings:

```javascript
{
  "emailConfig": {
    "smtpHost": "smtp.youremail.com",
    "smtpPort": 587,
    "smtpUser": "your-username",
    "smtpPass": "your-password"
  }
}
```

## 🛡️ Security Checklist

- [ ] Strong JWT secret (use random generator)
- [ ] HTTPS enabled (SSL certificate)
- [ ] Firewall configured
- [ ] Database authentication enabled
- [ ] Regular backups configured
- [ ] Environment variables secured
- [ ] Stripe webhooks verified
- [ ] Rate limiting enabled

## 📊 Analytics and Monitoring

### Built-in Analytics

- Booking statistics
- Revenue tracking
- Popular bounce houses
- Customer insights

### External Integration

- Google Analytics support
- Sentry error tracking
- Custom dashboard API

## 🎯 Monetization Options

### 1. White-Label SaaS

- Charge monthly fees per business
- Tiered pricing based on features
- Setup fees for new businesses

### 2. Commission Model

- Take percentage of each booking
- Integrated payment processing
- Automatic commission calculation

### 3. One-Time Sale

- Sell complete platform to businesses
- Provide setup and customization
- Ongoing support contracts

## 🔧 Customization Examples

### Adding New Features

#### New Bounce House Fields

1. Update the BounceHouse model
2. Add to the admin interface
3. Update the booking flow

#### Custom Pricing Rules

1. Extend the pricing calculation
2. Add business rules
3. Update the API

#### New Payment Methods

1. Integrate payment provider
2. Update checkout flow
3. Add to admin settings

### UI Customization

#### Themes

Each business can have custom CSS:

```css
:root {
  --primary-color: var(--company-primary, #4f46e5);
  --secondary-color: var(--company-secondary, #10b981);
  --font-family: var(--company-font, 'Inter, sans-serif');
}
```

#### Custom Components

- Replace logo component
- Custom footer
- Business-specific pages
- Custom booking flow

## 🚨 Troubleshooting

### Common Issues

#### "Company not found" error

- Check subdomain configuration
- Verify database has company records
- Check DNS settings

#### Payment failures

- Verify Stripe keys
- Check webhook configuration
- Review Stripe dashboard

#### Email not sending

- Verify SendGrid API key
- Check sender verification
- Review email templates

### Debug Mode

```bash
# Enable debug logging
docker-compose logs -f server

# Check specific service
docker-compose logs client
docker-compose logs mongodb
```

## 📞 Support

### Self-Help Resources

- Check logs: `docker-compose logs`
- Database access: MongoDB Compass
- API testing: Postman collection included

### Professional Setup

Need help setting up? We offer:

- Complete deployment service
- Custom branding setup
- Payment integration
- Domain configuration
- Training and support

Contact: [your-support-email]

## 🎉 Success Stories

> "We went from idea to live business in 2 days using this platform. The multi-tenant feature lets us run 5 different bounce house businesses!" - Happy Customer

## 📈 Scaling Your Business

### Growth Features

- Automated booking confirmations
- Customer management system
- Inventory tracking
- Revenue analytics
- Marketing tools integration

### Expansion Options

- Multiple locations
- Franchise opportunities
- Partner network
- Additional rental items
- Event planning services

---

**Ready to launch your bounce house empire? Let's get bouncing! 🎪**
