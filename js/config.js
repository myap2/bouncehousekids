// ============================================
// BOUNCE HOUSE RENTAL - SITE CONFIGURATION
// ============================================
// Edit this file to customize your site.
// All business-specific values are centralized here.

const CONFIG = {
  // ==========================================
  // BUSINESS INFORMATION
  // ==========================================
  business: {
    name: "Your Business Name",
    tagline: "Bounce House Rentals",
    phone: "(555) 123-4567",
    phoneRaw: "5551234567", // For tel: links
    email: "info@yourdomain.com",
    address: "Your City, State",
    serviceArea: "Your Service Area",
    hours: "Monday - Sunday, 8:00 AM - 8:00 PM",
    yearEstablished: 2024,
  },

  // ==========================================
  // PRICING
  // ==========================================
  pricing: {
    daily: 150,
    weekend: 200,
    weekly: 800,
    depositPercent: 0.5, // 50% deposit
  },

  // ==========================================
  // DELIVERY ZONES
  // ==========================================
  delivery: {
    // Zip codes that qualify for local delivery rate
    localZips: ["12345", "12346", "12347"],
    localFee: 20,
    outsideFee: 50,
    localAreaName: "Local Area", // e.g., "Cache Valley", "Metro Phoenix"
  },

  // ==========================================
  // SOCIAL MEDIA & PAYMENT LINKS
  // ==========================================
  social: {
    facebook: "", // Full URL: https://facebook.com/yourbusiness
    instagram: "", // Full URL: https://instagram.com/yourbusiness
    venmo: "", // Venmo username: @yourbusiness
    googleReviews: "", // Google Maps review URL
  },

  // ==========================================
  // BRANDING COLORS
  // ==========================================
  // These are injected as CSS variables
  branding: {
    primaryColor: "#007bff",    // Main brand color (buttons, links)
    accentColor: "#00bcd4",     // Secondary accent
    successColor: "#28a745",    // Success states, CTAs
    warningColor: "#ffc107",    // Warnings
    dangerColor: "#dc3545",     // Errors, alerts
  },

  // ==========================================
  // THIRD-PARTY INTEGRATIONS
  // ==========================================
  integrations: {
    formspreeId: "",           // Formspree form ID for contact form
    googleAnalyticsId: "",     // GA4 Measurement ID: G-XXXXXXXXXX
    emailjsServiceId: "",      // EmailJS service ID (optional)
  },

  // ==========================================
  // SEO & META
  // ==========================================
  seo: {
    siteUrl: "https://yourdomain.com",
    defaultTitle: "Bounce House Rentals | Your Business Name",
    defaultDescription: "Premium bounce house rentals for parties and events. Safe, clean, and affordable. Book online today!",
    ogImage: "/images/og-image.jpg",
  },

  // ==========================================
  // ADDITIONAL FEES (displayed on pricing page)
  // ==========================================
  additionalFees: {
    latePickup: 25,        // Per hour
    cleaningFee: 50,       // If needed
    securityDeposit: 100,  // Refundable
  },
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================

// Format currency
CONFIG.formatCurrency = function(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

// Format phone for display
CONFIG.formatPhone = function(phone) {
  const cleaned = ('' + phone).replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return '(' + match[1] + ') ' + match[2] + '-' + match[3];
  }
  return phone;
};

// Check if zip is in local delivery zone
CONFIG.isLocalZip = function(zip) {
  return this.delivery.localZips.includes(zip);
};

// Get delivery fee based on zip
CONFIG.getDeliveryFee = function(zip) {
  return this.isLocalZip(zip) ? this.delivery.localFee : this.delivery.outsideFee;
};

// Inject CSS variables for branding
CONFIG.injectBrandColors = function() {
  const root = document.documentElement;
  root.style.setProperty('--primary-color', this.branding.primaryColor);
  root.style.setProperty('--accent-color', this.branding.accentColor);
  root.style.setProperty('--success-color', this.branding.successColor);
  root.style.setProperty('--warning-color', this.branding.warningColor);
  root.style.setProperty('--danger-color', this.branding.dangerColor);
};

// ==========================================
// INITIALIZE
// ==========================================
// Auto-inject brand colors when script loads
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => CONFIG.injectBrandColors());
  } else {
    CONFIG.injectBrandColors();
  }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.CONFIG = CONFIG;
}
