# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**My Bounce Place** - A bounce house rental website for a Logan, Utah business. Static frontend with Netlify Functions backend, Supabase database, and Stripe payment processing.

## Architecture

```
Frontend (Static)          Netlify Functions           External Services
─────────────────         ──────────────────          ─────────────────
index.html                 create-checkout.js    ───► Stripe (payments)
js/*.js          ───►      stripe-webhook.js     ───► Supabase (database)
css/styles.css             check-availability.js ───► Resend (emails)
                           get-calendar.js       ───► Twilio (SMS, optional)
                           admin-login.js        ───► Google Calendar (optional)
                           validate-promo.js
```

### Key Components

- **Frontend**: Vanilla JavaScript SPA with hash-based routing (#home, #contact, etc.)
- **Backend**: Netlify Functions (serverless) in `netlify/functions/`
- **Database**: Supabase (PostgreSQL) - schema in `database-schema.sql`
- **Payments**: Stripe Checkout with 50% deposit model
- **Emails**: Resend for confirmations and reminders

## Development Commands

```bash
# Local development (static files + functions)
netlify dev

# Static files only
python -m http.server 8000

# Test Stripe webhooks locally
stripe listen --forward-to localhost:8888/.netlify/functions/stripe-webhook

# Deploy
git push  # Auto-deploys via Netlify
```

## Environment Variables

Required in Netlify Dashboard (Site Settings > Environment Variables):

```
SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY
STRIPE_PUBLISHABLE_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
RESEND_API_KEY
SITE_URL=https://mybounceplace.com
FROM_EMAIL=bookings@mybounceplace.com
ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_SECRET_KEY
```

## File Structure

```
/
├── index.html                 # Main SPA (all pages as divs)
├── admin.html                 # Admin dashboard
├── css/styles.css             # All styles
├── js/
│   ├── api.js                 # BookingAPI - talks to Netlify Functions
│   ├── booking.js             # BookingSystem - modal, form, Stripe redirect
│   ├── calendar.js            # AvailabilityCalendar component
│   ├── navigation.js          # Hash routing, page transitions
│   ├── bouncehouses.js        # Listing and detail views
│   ├── data.js                # Static data (bounceHouses, companyInfo)
│   └── admin.js               # Admin dashboard logic
├── netlify/functions/
│   ├── _shared/
│   │   ├── supabase.js        # Database client
│   │   ├── stripe.js          # Payment client
│   │   ├── email.js           # Resend helper
│   │   ├── sms.js             # Twilio helper
│   │   └── google-calendar.js # Calendar sync
│   ├── create-checkout.js     # Creates Stripe session + booking record
│   ├── stripe-webhook.js      # Confirms payment, sends emails
│   ├── check-availability.js  # Single date check
│   ├── get-calendar.js        # Month availability data
│   ├── validate-promo.js      # Promo code validation
│   ├── admin-login.js         # JWT authentication
│   ├── get-bookings.js        # Admin: list bookings
│   ├── update-booking.js      # Admin: update status
│   └── manage-blocked-dates.js # Admin: block/unblock dates
├── database-schema.sql        # Supabase schema (run in SQL Editor)
├── netlify.toml               # Build config, redirects, scheduled functions
└── .env.example               # Environment variable template
```

## Database Schema (Supabase)

Four main tables:
- **bounce_houses**: Inventory with pricing, dimensions, capacity
- **bookings**: Customer info, event details, payment status, waiver tracking
- **blocked_dates**: Holidays and unavailable dates
- **promo_codes**: Discount codes with validation rules

Run `database-schema.sql` in Supabase SQL Editor to create tables and seed data.

## Booking Flow

1. User clicks "Book Now" on pricing card
2. Modal opens with `AvailabilityCalendar` component
3. Calendar fetches availability from `get-calendar` function
4. User selects date, fills form, optionally applies promo code
5. `create-checkout` creates Supabase booking + Stripe session
6. User redirected to Stripe Checkout (50% deposit)
7. `stripe-webhook` confirms payment, updates booking, sends email
8. User redirected to success page

## Frontend Patterns

### Manager Classes
Each feature is a singleton class attached to `window`:
- `window.bookingSystem` - BookingSystem
- `window.navigationManager` - NavigationManager
- `window.BounceHouseManager` - BounceHouseManager

### Modal Pattern
```javascript
// Create modal, add 'show' class to display
modal.classList.add('show');
// Close handlers: X button, backdrop click, Escape key
modal.remove();
```

### Page Navigation
```javascript
showPage('contact');  // Shows #contact-page div
// Pages are: home, bounce-houses, pricing, about, contact, faq, waiver
```

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/check-availability` | POST | Check single date |
| `/get-calendar` | GET | Month availability |
| `/create-checkout` | POST | Create booking + Stripe session |
| `/stripe-webhook` | POST | Handle payment events |
| `/validate-promo` | POST | Validate promo code |
| `/admin-login` | POST | Admin authentication |
| `/get-bookings` | GET | List bookings (auth required) |
| `/update-booking` | PUT | Update booking (auth required) |
| `/manage-blocked-dates` | GET/POST/DELETE | Blocked dates |

## Pricing Logic

- Daily: $150, Weekend: $200, Weekly: $800
- Delivery: $20 (Cache Valley zips: 84321, 84322, 84325, 84326, 84332, 84333, 84335, 84339, 84341), $50 outside
- Deposit: 50% of total at booking

## Important Notes

- **Blocked dates**: Now stored in database, not hardcoded. Fallback to local array if API fails.
- **Stripe webhook**: Must be configured in Stripe Dashboard pointing to `/.netlify/functions/stripe-webhook`
- **Admin dashboard**: Access at `/admin.html`, login with ADMIN_EMAIL/ADMIN_PASSWORD
- **Scheduled reminders**: `send-reminders` function runs daily at 9 AM UTC (configured in netlify.toml)

## Business Information

- **Phone**: (385) 288-8065
- **Email**: noreply@mybounceplace.com
- **Service Area**: Logan, Utah and Cache Valley
- **Hours**: Monday - Sunday, 8:00 AM - 8:00 PM
