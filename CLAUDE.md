# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **static HTML/JavaScript bounce house rental website** for My Bounce Place, a Logan, Utah-based business. The application was converted from a React/Node.js stack to vanilla JavaScript to eliminate build dependencies and enable simple static hosting.

## Architecture

### Static Single-Page Application
- **No build process required** - runs directly in the browser
- **No npm dependencies** - pure vanilla JavaScript
- **Hash-based routing** - client-side navigation using URL fragments (#home, #contact, etc.)
- **LocalStorage persistence** - form submissions and user data stored client-side
- **Progressive Web App** - includes service worker (sw.js) for offline functionality

### Key Technical Stack
- Vanilla JavaScript (ES6+ classes)
- HTML5 with semantic markup
- CSS3 with modern features (Grid, Flexbox)
- Formspree integration for email submissions (https://formspree.io/f/mgvzkqgp)
- EmailJS support (optional, needs configuration)
- Google Analytics 4 tracking

## Development Commands

### Local Development
Since this is a static site, you need a simple HTTP server:

```bash
# Using Python (recommended)
python -m http.server 8000

# Using Node.js
npx serve .

# Using PHP
php -S localhost:8000
```

Then visit `http://localhost:8000`

### No Build or Install Required
- **No `npm install`** - no package.json or dependencies
- **No compilation** - JavaScript files run as-is
- **No bundling** - individual JS files loaded via script tags
- **Direct file editing** - changes visible immediately on browser refresh

## Code Architecture

### File Structure
```
/
├── index.html              # Main SPA shell with all page content
├── css/styles.css          # All application styles
├── js/
│   ├── data.js            # Bounce house inventory and business data
│   ├── app.js             # Main application initialization
│   ├── navigation.js      # Hash-based routing system
│   ├── bouncehouses.js    # Bounce house display and filtering
│   ├── booking.js         # Booking form and availability checking
│   ├── contact.js         # Contact form handling
│   ├── waiver.js          # Digital waiver with signature pad
│   ├── performance.js     # Performance optimization utilities
│   ├── reviews.js         # Customer reviews
│   └── sms-notifications.js # SMS integration
├── sw.js                  # Service worker for PWA
├── images/                # Bounce house product images
└── *.html                 # Additional static pages (blog, reviews, etc.)
```

### JavaScript Architecture

#### Manager Classes Pattern
Each feature is encapsulated in a manager class with singleton instances:

1. **App** (`js/app.js`)
   - Global initialization and error handling
   - Utility methods: `formatCurrency()`, `formatPhoneNumber()`, `isValidEmail()`
   - Image error handling with mutation observers
   - Available globally as `window.MyBounceApp`

2. **NavigationManager** (`js/navigation.js`)
   - Hash-based routing (#home, #bounce-houses, etc.)
   - Browser history management (back/forward buttons)
   - Page-specific initialization hooks
   - Global functions: `showPage(pageName)`, `showBounceHouseDetail(id)`
   - Available globally as `window.navigationManager`

3. **BounceHouseManager** (`js/bouncehouses.js`)
   - Renders bounce house listings and detail views
   - Search and theme filtering
   - Image gallery with thumbnails
   - Booking flow initiation
   - Available globally as `window.BounceHouseManager`

4. **BookingSystem** (`js/booking.js`)
   - Handles booking form submissions
   - Date availability checking with blocked dates
   - Email integration (Formspree/EmailJS)
   - Fallback contact options (mailto, SMS, phone)
   - Available globally as `window.bookingSystem`

5. **ContactManager** (`js/contact.js`)
   - Contact form validation and submission
   - Field-level error handling
   - Email automation via Formspree
   - Date availability integration
   - Available globally as `window.ContactManager`

6. **WaiverManager** (`js/waiver.js`)
   - Digital signature capture using HTML5 Canvas
   - Form validation for participants and guardians
   - LocalStorage persistence for waiver submissions
   - Available globally as `window.WaiverManager`

### Data Layer (`js/data.js`)

Central data source exported as global constants:

- **`bounceHouses`** - Array of bounce house inventory with:
  - id, name, description, theme
  - dimensions (length, width, height)
  - capacity (minAge, maxAge, maxWeight, maxOccupants)
  - pricing (daily, weekend, weekly)
  - images array, features, rating, isActive

- **`themes`** - Array of theme categories for filtering

- **`companyInfo`** - Business contact information:
  - name: "My Bounce Place"
  - phone: "(385) 288-8065"
  - email: "noreply@mybounceplace.com"
  - hours, serviceArea

- **`faqData`** - FAQ questions and answers

- **`waiverText`** - Liability waiver template

### Navigation System

The app uses **hash-based routing** to simulate multiple pages:
- URL format: `https://example.com/#page-name`
- Pages: `#home`, `#bounce-houses`, `#pricing`, `#about`, `#contact`, `#faq`, `#waiver`
- Detail pages: Dynamically rendered (e.g., bounce house details)

**Important**: Pages are divs with class `.page` and id `{name}-page`:
```html
<div id="home-page" class="page active">...</div>
<div id="contact-page" class="page">...</div>
```

The active page has class `active` applied. Navigation is handled by:
1. User clicks nav link → `showPage(pageName)` called
2. All pages get `active` class removed
3. Target page gets `active` class added
4. URL hash updated (browser history)
5. Page-specific initialization runs

### Form Handling

All forms use **client-side submission** to prevent page reloads:

```javascript
form.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent default form submission
    // Custom handling here
});
```

**Email Integration**:
1. Primary: Formspree (https://formspree.io/f/mgvzkqgp)
2. Fallback: EmailJS (needs configuration)
3. Ultimate fallback: mailto links, SMS links, phone links

**Data Persistence**:
- All submissions saved to localStorage as backup
- Keys: `contactMessages`, `bookingRequests`, `waivers`
- Format: Array of objects with id, timestamp, status

### Date Availability System

Blocked dates are hardcoded in multiple files for consistency:
- `js/booking.js` - BookingSystem class
- `js/contact.js` - ContactManager class

**Current blocked dates** (update in both files):
- Major holidays: Christmas, New Year's, Memorial Day, July 4th, Labor Day, Thanksgiving, etc.
- Format: 'YYYY-MM-DD' strings in array

Visual feedback:
- Available dates: green background (#d4edda)
- Blocked dates: red background (#f8d7da) with strikethrough

## Business Information

### Contact Details
- **Business**: My Bounce Place
- **Phone**: (385) 288-8065
- **Email**: noreply@mybounceplace.com
- **Hours**: Monday - Sunday, 8:00 AM - 8:00 PM
- **Location**: Logan, Utah

### Service Area
- Primary: Logan, Utah
- Also serves: Smithfield, Hyrum, Providence, North Logan, Cache Valley
- Free delivery within 15 miles of Logan
- Additional charge: $2 per mile beyond service area

### Pricing
- **Daily Rental**: $150 (up to 8 hours)
- **Weekend Rental**: $200 (Friday pickup to Sunday return)
- **Weekly Rental**: $800 (7 days)
- **Security Deposit**: $100 (refundable)
- **Late Pickup**: $25 per hour
- **Cleaning Fee**: $50 (if excessive damage)

### Payment Methods
- Cash, check, credit cards, Venmo
- Venmo: @mybounceplace

### Current Inventory
- **Bounce Castle with a Slide**
  - Dimensions: 15' × 15' × 12'
  - Capacity: 8 children (ages 3-12, max 150 lbs each)
  - Features: Slide, basketball hoop, mesh safety walls, anchor points
  - Rating: 4.8/5

## Common Development Tasks

### Adding a New Bounce House
1. Edit `js/data.js`
2. Add new object to `bounceHouses` array with all required fields
3. Add theme to `themes` array if new
4. Add images to `images/` folder
5. No rebuild required - refresh browser

### Updating Business Information
Edit `companyInfo` object in `js/data.js`:
- Changes affect contact page, footer, and all references

### Modifying Blocked Dates
Update blocked dates arrays in BOTH:
1. `js/booking.js` - BookingSystem.checkBookingAvailability()
2. `js/contact.js` - ContactManager.checkDateAvailability()

### Adding a New Page
1. Add page div to `index.html`: `<div id="newpage-page" class="page">...</div>`
2. Add nav link: `<a href="#newpage" class="nav-link" data-page="newpage">New Page</a>`
3. Add case to `NavigationManager.handlePageSpecificLogic()` if initialization needed

### Styling Changes
Edit `css/styles.css` directly - changes visible on refresh

### Email Configuration
**Formspree** (current):
- Endpoint: https://formspree.io/f/mgvzkqgp
- No configuration needed in code

**EmailJS** (alternative):
- Requires setting up EmailJS account
- Update placeholders in code:
  - `YOUR_EMAILJS_PUBLIC_KEY`
  - `YOUR_EMAILJS_SERVICE_ID`
  - `YOUR_EMAILJS_TEMPLATE_ID`

### Analytics
Google Analytics 4 integration:
- Tracking ID: G-XXXXXXXXXX (placeholder - needs real ID)
- Events tracked: page views, booking requests, form submissions

## Important Implementation Notes

### Image Handling
- Images may fail to load (404s are expected)
- Automatic fallback to placeholder styling
- Mutation observer watches for dynamically added images
- Error handling prevents broken image icons

### LocalStorage Usage
- All form submissions backed up to localStorage
- Useful for debugging: `localStorage.getItem('contactMessages')`
- Clear with: `localStorage.removeItem('contactMessages')`
- View in DevTools: Application → Local Storage

### Modal System
Modals are managed through CSS classes:
- Add class `show` to display modal
- Close button removes modal or removes `show` class
- Escape key closes all modals (handled in app.js)

### URL Parameter Handling
- Contact and booking forms prevent URL parameter pollution
- Formspree may add `?success=true` - code strips this
- Navigation maintains clean URLs with hash only

### Service Worker (PWA)
- Registered in index.html
- Enables offline functionality
- Caches static assets
- Edit `sw.js` to modify caching strategy

## SEO and Schema.org

The site includes extensive structured data for:
- LocalBusiness schema
- FAQ schema
- Product/Service schemas
- Reviews and ratings

Located in `<script type="application/ld+json">` tags in index.html

## Testing

### Manual Testing Checklist
1. Navigate through all pages using navbar
2. Test browser back/forward buttons
3. Submit contact form (check localStorage)
4. Submit booking form (check localStorage)
5. Try waiver form with signature pad
6. Search and filter bounce houses
7. View bounce house details
8. Test on mobile viewport
9. Check image error handling
10. Test date availability checker

### Browser Console Debugging
```javascript
// View all stored data
localStorage.getItem('contactMessages')
localStorage.getItem('bookingRequests')
localStorage.getItem('waivers')

// Access manager instances
window.navigationManager
window.BounceHouseManager
window.ContactManager
window.bookingSystem

// Manual navigation
showPage('contact')
showBounceHouseDetail('1')
```

## Deployment

This is a static site - deployment is simple:

### Supported Platforms
- **Netlify**: Drag and drop folder or connect Git repo
- **Vercel**: Import Git repo
- **GitHub Pages**: Push to gh-pages branch
- **AWS S3**: Upload files with static hosting enabled
- **Firebase Hosting**: Use Firebase CLI
- **Any web host**: Upload via FTP

### Pre-Deployment Checklist
1. Update Google Analytics ID in index.html
2. Configure EmailJS if using (or keep Formspree)
3. Add real business images to /images/
4. Test all forms submit successfully
5. Verify blocked dates are current
6. Check contact information is accurate
7. Test on multiple browsers and devices

### Post-Deployment
- Submit sitemap to Google Search Console
- Monitor form submissions in Formspree dashboard
- Check analytics tracking is working
- Test email deliverability

## Known Limitations

1. **No backend** - all form data goes to third-party services or localStorage
2. **No real-time availability** - blocked dates are hardcoded
3. **No payment processing** - booking requests require manual follow-up
4. **No CMS** - content updates require code changes
5. **No search engine** - basic client-side filtering only

## Related Documentation

- AI Training Instructions: `ai-training-instructions.md`
- AI Training Data: `ai-training-data.json`
- Original README: `README.md`
