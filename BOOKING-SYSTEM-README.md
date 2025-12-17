# My Bounce Place - Booking System Setup Guide

This guide covers setting up the real-time booking system with Stripe payments, Supabase database, and automated email confirmations.

## Architecture Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────┐
│  Frontend       │────▶│ Netlify Functions│────▶│  Supabase   │
│  (Vanilla JS)   │     │  (Serverless)    │     │ (PostgreSQL)│
└─────────────────┘     └──────────────────┘     └─────────────┘
                               │
                    ┌──────────┴──────────┐
                    ▼                     ▼
             ┌─────────────┐       ┌─────────────┐
             │   Stripe    │       │   Resend    │
             │  (Payments) │       │  (Emails)   │
             └─────────────┘       └─────────────┘
```

## Features

### Customer Features
- Interactive availability calendar
- Real-time date availability checking
- Dynamic pricing based on rental type and delivery zone
- Secure Stripe Checkout for deposits (50%)
- Automated confirmation emails
- Booking success/cancellation pages

### Admin Features (Phase 2)
- Admin dashboard with login
- Calendar view of all bookings
- Booking management (view, edit status, cancel)
- Block dates management
- Revenue reporting

---

## Setup Instructions

### Step 1: Set Up Supabase (Database)

1. **Create Account**
   - Go to [supabase.com](https://supabase.com)
   - Sign up for a free account
   - Create a new project (choose a region close to your users)

2. **Run Database Schema**
   - In your Supabase dashboard, go to **SQL Editor**
   - Copy the contents of `database-schema.sql` from this repo
   - Paste and click **Run**
   - This creates the tables: `bounce_houses`, `bookings`, `blocked_dates`

3. **Get API Keys**
   - Go to **Settings > API**
   - Copy these values:
     - `Project URL` → `SUPABASE_URL`
     - `anon public` key → `SUPABASE_ANON_KEY`
     - `service_role` key → `SUPABASE_SERVICE_KEY`

### Step 2: Set Up Stripe (Payments)

1. **Create Account**
   - Go to [stripe.com](https://stripe.com)
   - Sign up and complete verification

2. **Get API Keys**
   - Go to **Developers > API keys**
   - Copy:
     - Publishable key → `STRIPE_PUBLISHABLE_KEY`
     - Secret key → `STRIPE_SECRET_KEY`

3. **Create Webhook**
   - Go to **Developers > Webhooks**
   - Click **Add endpoint**
   - Endpoint URL: `https://mybounceplace.com/.netlify/functions/stripe-webhook`
   - Select events:
     - `checkout.session.completed`
     - `checkout.session.expired`
     - `payment_intent.payment_failed`
   - Click **Add endpoint**
   - Copy the **Signing secret** → `STRIPE_WEBHOOK_SECRET`

4. **Test Mode vs Live Mode**
   - Use test keys for development (start with `pk_test_` and `sk_test_`)
   - Switch to live keys when ready to accept real payments

### Step 3: Set Up Resend (Emails)

1. **Create Account**
   - Go to [resend.com](https://resend.com)
   - Sign up for a free account (100 emails/day free)

2. **Verify Domain**
   - Go to **Domains**
   - Add `mybounceplace.com`
   - Add the DNS records shown to your domain registrar
   - Wait for verification (usually a few minutes)

3. **Get API Key**
   - Go to **API Keys**
   - Create a new API key
   - Copy it → `RESEND_API_KEY`

### Step 4: Configure Netlify Environment Variables

1. **In Netlify Dashboard**
   - Go to **Site Settings > Environment Variables**
   - Add each of the following:

```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=re_...
SITE_URL=https://mybounceplace.com
ADMIN_EMAIL=admin@mybounceplace.com
FROM_EMAIL=bookings@mybounceplace.com
```

2. **Redeploy**
   - After adding environment variables, trigger a new deploy
   - Go to **Deploys > Trigger deploy > Deploy site**

### Step 5: Test the System

1. **Test Booking Flow**
   - Go to your site
   - Click "Book Now" on a pricing card
   - Select a date from the calendar
   - Fill in test customer info
   - Click "Pay Deposit"
   - Use Stripe test card: `4242 4242 4242 4242`
   - Verify redirect to success page
   - Check email was received

2. **Verify Database**
   - In Supabase, go to **Table Editor > bookings**
   - Confirm the booking was created with status `confirmed`

3. **Test Blocked Dates**
   - Try selecting a blocked date (holiday)
   - Verify it shows as unavailable

---

## File Structure

```
bouncehousekids/
├── netlify/
│   └── functions/
│       ├── _shared/
│       │   ├── supabase.js      # Database client
│       │   ├── stripe.js        # Stripe client
│       │   └── email.js         # Email helper
│       ├── check-availability.js   # Check date availability
│       ├── create-checkout.js      # Create Stripe session
│       ├── get-calendar.js         # Get month availability
│       ├── stripe-webhook.js       # Handle payments
│       ├── admin-login.js          # Admin authentication
│       ├── get-bookings.js         # Get all bookings (admin)
│       ├── update-booking.js       # Update booking status
│       ├── manage-blocked-dates.js # Block/unblock dates
│       └── package.json            # Function dependencies
├── js/
│   ├── api.js                     # Frontend API helper
│   ├── calendar.js                # Calendar component
│   ├── booking.js                 # Booking system
│   ├── contact.js                 # Contact form
│   └── admin.js                   # Admin dashboard logic
├── admin.html                     # Admin dashboard page
├── database-schema.sql            # Supabase schema
├── .env.example                   # Environment template
└── netlify.toml                   # Netlify config
```

---

## API Endpoints

### Check Availability
```
POST /.netlify/functions/check-availability
Body: { "bounceHouseId": "uuid", "date": "2025-06-15" }
Response: { "available": true, "reason": null }
```

### Get Calendar
```
GET /.netlify/functions/get-calendar?year=2025&month=6&bounceHouseId=uuid
Response: { "dates": [{ "date": "2025-06-01", "available": true, "status": "available" }, ...] }
```

### Create Checkout
```
POST /.netlify/functions/create-checkout
Body: {
  "bounceHouseId": "uuid",
  "eventDate": "2025-06-15",
  "eventTime": "10:00",
  "rentalType": "daily",
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerPhone": "385-555-1234",
  "eventAddress": "123 Main St, Logan, UT",
  "eventZip": "84321",
  "guestsCount": 15,
  "specialRequests": "Birthday party"
}
Response: { "checkoutUrl": "https://checkout.stripe.com/...", "sessionId": "cs_...", "bookingId": "uuid" }
```

### Stripe Webhook
```
POST /.netlify/functions/stripe-webhook
(Called automatically by Stripe after payment)
```

---

## Pricing Logic

### Base Prices
| Rental Type | Price |
|------------|-------|
| Daily (8 hours) | $150 |
| Weekend (Fri-Sun) | $200 |
| Weekly (7 days) | $800 |

### Delivery Fees
| Zone | Zip Codes | Fee |
|------|-----------|-----|
| Cache Valley | 84321, 84322, 84325, 84326, 84332, 84333, 84335, 84339, 84341 | $20 |
| Outside | All others | $50 |

### Deposit
- 50% of total due at booking
- Remaining 50% due at event

---

## Troubleshooting

### Booking Not Working
1. Check Netlify function logs: **Functions > View logs**
2. Verify environment variables are set correctly
3. Check browser console for JavaScript errors

### Emails Not Sending
1. Verify Resend API key is correct
2. Check domain is verified in Resend
3. Check Netlify function logs for errors

### Stripe Checkout Not Opening
1. Verify Stripe keys are correct
2. Check create-checkout function logs
3. Ensure site URL matches Stripe dashboard settings

### Calendar Not Loading
1. Check if get-calendar function is deployed
2. Verify Supabase connection
3. Fallback data should show if API fails

### Webhook Not Working
1. Verify webhook URL in Stripe dashboard
2. Check webhook signing secret
3. View webhook logs in Stripe dashboard

---

## Local Development

Since this is a static site with serverless functions:

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Create .env file**
   ```bash
   cp .env.example .env
   # Fill in your values
   ```

3. **Run locally**
   ```bash
   netlify dev
   ```
   This runs both the static site and functions locally.

4. **Test Stripe webhooks locally**
   ```bash
   stripe listen --forward-to localhost:8888/.netlify/functions/stripe-webhook
   ```

---

## Security Notes

- Never commit `.env` files or API keys to git
- Use Stripe's test mode during development
- The `SUPABASE_SERVICE_KEY` has full database access - keep it secret
- Webhook signatures verify requests come from Stripe
- All payment data is handled by Stripe (PCI compliant)

---

## Admin Dashboard

The admin dashboard is available at `/admin.html` and provides:

### Features
- **Secure Login**: JWT-based authentication
- **Overview**: Stats cards showing total bookings, revenue, pending bookings
- **Bookings List**: Searchable, filterable table of all bookings
- **Calendar View**: Visual month view with bookings and blocked dates
- **Booking Management**: View details, update status, add notes
- **Blocked Dates**: Add/remove dates to block from booking

### Access
1. Go to `https://mybounceplace.com/admin.html`
2. Login with admin credentials

### Default Credentials
- **Email**: `admin@mybounceplace.com`
- **Password**: Set via `ADMIN_PASSWORD` environment variable

### Admin Environment Variables
Add these to Netlify:
```
ADMIN_EMAIL=admin@mybounceplace.com
ADMIN_PASSWORD=YourSecurePassword123!
ADMIN_SECRET_KEY=random-string-for-token-signing
```

### Admin API Endpoints

**Login**
```
POST /.netlify/functions/admin-login
Body: { "email": "admin@...", "password": "..." }
Response: { "token": "...", "expiresIn": 86400 }
```

**Get Bookings** (requires auth)
```
GET /.netlify/functions/get-bookings?status=confirmed&startDate=2025-01-01
Headers: { "Authorization": "Bearer <token>" }
```

**Update Booking** (requires auth)
```
PUT /.netlify/functions/update-booking
Body: { "bookingId": "uuid", "status": "confirmed", "notes": "..." }
```

**Manage Blocked Dates**
```
GET /.netlify/functions/manage-blocked-dates
POST /.netlify/functions/manage-blocked-dates (requires auth)
DELETE /.netlify/functions/manage-blocked-dates (requires auth)
```

---

## Support

- Business Phone: (385) 288-8065
- Business Email: noreply@mybounceplace.com
- Technical Issues: Check Netlify and Supabase dashboards
