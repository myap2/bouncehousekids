// ============================================
// BACKEND CONFIGURATION
// ============================================
// All values are read from environment variables
// with sensible defaults for development.

const CONFIG = {
  // Business Info
  BUSINESS_NAME: process.env.BUSINESS_NAME || 'Your Business Name',
  BUSINESS_PHONE: process.env.BUSINESS_PHONE || '(555) 123-4567',

  // Site URL for redirects and emails
  SITE_URL: process.env.SITE_URL || 'https://yourdomain.com',

  // Local delivery zone zip codes (comma-separated in env)
  LOCAL_ZIPS: (process.env.LOCAL_ZIPS || '').split(',').filter(z => z.trim()),

  // Pricing
  PRICING: {
    daily: parseInt(process.env.PRICE_DAILY) || 150,
    weekend: parseInt(process.env.PRICE_WEEKEND) || 200,
    weekly: parseInt(process.env.PRICE_WEEKLY) || 800,
  },

  // Delivery fees
  DELIVERY_FEES: {
    local: parseInt(process.env.DELIVERY_LOCAL) || 20,
    outside: parseInt(process.env.DELIVERY_OUTSIDE) || 50,
  },

  // Deposit percentage (0.5 = 50%)
  DEPOSIT_PERCENTAGE: parseFloat(process.env.DEPOSIT_PERCENT) || 0.5,

  // Email settings
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@yourdomain.com',
  FROM_EMAIL: process.env.FROM_EMAIL || 'bookings@yourdomain.com',
};

// Helper: Check if zip is in local delivery zone
CONFIG.isLocalZip = function(zip) {
  return this.LOCAL_ZIPS.includes(zip);
};

// Helper: Get delivery fee based on zip
CONFIG.getDeliveryFee = function(zip) {
  return this.isLocalZip(zip) ? this.DELIVERY_FEES.local : this.DELIVERY_FEES.outside;
};

// Helper: Get delivery zone name
CONFIG.getDeliveryZone = function(zip) {
  return this.isLocalZip(zip) ? 'local' : 'outside';
};

// Helper: Get price by rental type
CONFIG.getPrice = function(rentalType) {
  return this.PRICING[rentalType] || this.PRICING.daily;
};

// Helper: Calculate deposit amount
CONFIG.calculateDeposit = function(totalAmount) {
  return Math.round(totalAmount * this.DEPOSIT_PERCENTAGE * 100) / 100;
};

module.exports = { CONFIG };
