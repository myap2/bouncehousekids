# Bounce House Rental Website - Setup Guide

This guide walks you through setting up your own bounce house rental website from this template.

**Estimated setup time: 30-45 minutes**

---

## Prerequisites

You'll need accounts with:
- [GitHub](https://github.com) - Code hosting
- [Netlify](https://netlify.com) - Website hosting (free tier works)
- [Supabase](https://supabase.com) - Database (free tier works)
- [Stripe](https://stripe.com) - Payment processing
- [Resend](https://resend.com) - Email sending (free tier: 3,000 emails/month)

---

## Quick Start (5 Steps)

### Step 1: Create Your Repository

Click "Use this template" on GitHub to create your own copy.

```bash
# Or clone manually
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME
```

### Step 2: Configure Your Business Info

Edit `js/config.js` with your business details:

```javascript
const CONFIG = {
  business: {
    name: "Your Business Name",
    phone: "(555) 123-4567",
    email: "info@yourdomain.com",
    address: "Your City, State",
    serviceArea: "Your Service Area",
    // ... etc
  },
  // ...
};
```

### Step 3: Set Up Supabase

1. Create a new Supabase project
2. Go to SQL Editor
3. Copy/paste the contents of `database-schema.sql` and run it
4. Go to Settings → API and copy your keys

### Step 4: Set Up Stripe

1. Create/log into your Stripe account
2. Get your API keys from Developers → API Keys
3. Create a webhook:
   - Endpoint: `https://YOUR-SITE.netlify.app/.netlify/functions/stripe-webhook`
   - Events: `checkout.session.completed`
   - Copy the webhook signing secret

### Step 5: Deploy to Netlify

1. Connect your GitHub repo to Netlify
2. Add environment variables (see below)
3. Deploy!

---

## Environment Variables

Set these in **Netlify Dashboard → Site Settings → Environment Variables**:

### Required

| Variable | Description | Where to get it |
|----------|-------------|-----------------|
| `SUPABASE_URL` | Your Supabase project URL | Supabase → Settings → API |
| `SUPABASE_ANON_KEY` | Public anon key | Supabase → Settings → API |
| `SUPABASE_SERVICE_KEY` | Service role key (secret) | Supabase → Settings → API |
| `STRIPE_PUBLISHABLE_KEY` | Stripe public key | Stripe → Developers → API Keys |
| `STRIPE_SECRET_KEY` | Stripe secret key | Stripe → Developers → API Keys |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret | Stripe → Developers → Webhooks |
| `RESEND_API_KEY` | Email API key | Resend → API Keys |
| `FROM_EMAIL` | Sender email address | Your verified domain |
| `ADMIN_EMAIL` | Your admin email | Your email |
| `ADMIN_PASSWORD` | Admin dashboard password | Create a secure password |
| `ADMIN_SECRET_KEY` | JWT signing secret | Generate: `openssl rand -base64 32` |
| `SITE_URL` | Your production URL | e.g., `https://yourdomain.com` |

### Business Config (Optional - overrides js/config.js)

| Variable | Description | Default |
|----------|-------------|---------|
| `BUSINESS_NAME` | Your business name | From config.js |
| `BUSINESS_PHONE` | Contact phone | From config.js |
| `PRICE_DAILY` | Daily rental price | 150 |
| `PRICE_WEEKEND` | Weekend rental price | 200 |
| `PRICE_WEEKLY` | Weekly rental price | 800 |
| `LOCAL_ZIPS` | Local delivery zip codes (comma-separated) | - |
| `DELIVERY_LOCAL` | Local delivery fee | 20 |
| `DELIVERY_OUTSIDE` | Outside area delivery fee | 50 |

---

## Customization Guide

### Updating Business Information

Most business info is in `js/config.js`. Update these values:

```javascript
business: {
  name: "Awesome Bounce Rentals",
  phone: "(555) 123-4567",
  email: "info@awesomebounce.com",
  address: "Phoenix, Arizona",
  serviceArea: "Phoenix Metro Area",
  hours: "Monday - Sunday, 8:00 AM - 8:00 PM"
}
```

### Updating Pricing

In `js/config.js`:

```javascript
pricing: {
  daily: 175,      // Your daily rate
  weekend: 225,    // Your weekend rate
  weekly: 900,     // Your weekly rate
  depositPercent: 0.5  // 50% deposit
}
```

### Updating Delivery Zones

In `js/config.js`:

```javascript
delivery: {
  localZips: ["85001", "85002", "85003"],  // Your local zip codes
  localFee: 25,
  outsideFee: 60,
  localAreaName: "Phoenix Metro"
}
```

### Changing Brand Colors

Edit `js/config.js`:

```javascript
branding: {
  primaryColor: "#ff6b00",   // Orange
  accentColor: "#ffd700",    // Gold
  successColor: "#28a745"    // Green
}
```

Or edit CSS directly in `css/styles.css`:

```css
:root {
  --primary-color: #ff6b00;
  --accent-color: #ffd700;
}
```

### Adding Your Bounce Houses

Option A: **Edit Supabase directly**
- Go to Supabase → Table Editor → bounce_houses
- Add/edit rows

Option B: **Edit js/data.js** for static data (if not using database)

### Updating HTML Content

These files have hardcoded content you'll want to customize:

| File | What to update |
|------|----------------|
| `index.html` | Hero text, about section, testimonials |
| `terms-of-service.html` | Your legal terms |
| `waiver-print.html` | Your waiver text |
| `blog.html` | Your blog content (or remove) |
| `reviews.html` | Your customer reviews |

**Find/replace these values:**
- "My Bounce Place" → Your business name
- "(385) 288-8065" → Your phone
- "Logan, Utah" → Your city
- "Cache Valley" → Your service area
- "mybounceplace.com" → Your domain

### Adding SEO Landing Pages

The template includes SEO page examples:
- `bounce-house-rentals-logan-ut.html`
- `party-rentals-logan-ut.html`

To create your own:
1. Duplicate one of these files
2. Rename to `bounce-house-rentals-YOUR-CITY-STATE.html`
3. Update all content for your location
4. Add to your sitemap

---

## Adding Your Images

1. Replace images in the `images/` folder
2. Update image references in:
   - `js/data.js` (bounce house images array)
   - `index.html` (hero, about sections)
   - Social media meta tags (og:image)

Recommended image sizes:
- Bounce house photos: 800x600px
- Hero background: 1920x1080px
- OG image: 1200x630px

---

## Testing Checklist

Before going live:

- [ ] All business info is correct in `js/config.js`
- [ ] Environment variables are set in Netlify
- [ ] Test booking flow end-to-end
- [ ] Test Stripe checkout (use test mode first)
- [ ] Verify confirmation emails are sent
- [ ] Check admin dashboard login works
- [ ] Test on mobile devices
- [ ] Update all "My Bounce Place" references in HTML

---

## Going Live Checklist

- [ ] Switch Stripe to live mode (update API keys)
- [ ] Update webhook to use live endpoint
- [ ] Verify domain/email settings in Resend
- [ ] Set up Google Analytics (add ID to config)
- [ ] Submit sitemap to Google Search Console
- [ ] Test a real booking with a small amount

---

## Support

If you run into issues:

1. Check Netlify function logs for errors
2. Verify all environment variables are set correctly
3. Check Supabase logs for database errors
4. Review Stripe webhook logs

---

## File Structure

```
├── index.html                 # Main website
├── admin.html                 # Admin dashboard
├── js/
│   ├── config.js             # ⭐ YOUR BUSINESS CONFIG
│   ├── api.js                # API helpers
│   ├── booking.js            # Booking modal
│   ├── data.js               # Bounce house data
│   └── ...
├── css/
│   └── styles.css            # Styles (with CSS variables)
├── netlify/functions/
│   ├── _shared/
│   │   ├── config.js         # Backend config (reads env vars)
│   │   ├── supabase.js       # Database client
│   │   ├── stripe.js         # Payment client
│   │   └── email.js          # Email sending
│   ├── create-checkout.js    # Creates Stripe session
│   ├── stripe-webhook.js     # Handles payment confirmation
│   └── ...
├── database-schema.sql       # Run this in Supabase
├── .env.example              # Environment variables template
└── SETUP.md                  # This file
```
