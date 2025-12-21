// API Helper for My Bounce Place Booking System
const BookingAPI = {
  // Base URL for Netlify Functions
  BASE_URL: '/.netlify/functions',

  /**
   * Check if a specific date is available for booking
   * @param {string} date - Date in YYYY-MM-DD format
   * @param {string} [bounceHouseId] - Optional bounce house ID
   * @returns {Promise<{available: boolean, reason?: string}>}
   */
  async checkAvailability(date, bounceHouseId = null) {
    try {
      const response = await fetch(`${this.BASE_URL}/check-availability`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bounceHouseId, date }),
      });

      if (!response.ok) {
        throw new Error('Failed to check availability');
      }

      return await response.json();
    } catch (error) {
      console.error('Error checking availability:', error);
      // Fallback to local blocked dates if API fails
      return this.checkLocalAvailability(date);
    }
  },

  /**
   * Fallback local availability check using hardcoded blocked dates
   */
  checkLocalAvailability(date) {
    const blockedDates = [
      '2025-12-25', '2025-12-31', '2026-01-01',
      '2026-01-15', '2026-02-16', '2026-05-25',
      '2026-07-04', '2026-09-07', '2026-10-12',
      '2026-11-11', '2026-11-26', '2026-12-25',
    ];

    const isBlocked = blockedDates.includes(date);
    const isPast = new Date(date) < new Date().setHours(0, 0, 0, 0);

    return {
      available: !isBlocked && !isPast,
      reason: isPast ? 'Date is in the past' : (isBlocked ? 'This date is blocked (holiday)' : null),
    };
  },

  /**
   * Get calendar availability for a month
   * @param {number} year - Year (e.g., 2025)
   * @param {number} month - Month (1-12)
   * @param {string} [bounceHouseId] - Optional bounce house ID
   * @returns {Promise<{dates: Array}>}
   */
  async getCalendarAvailability(year, month, bounceHouseId = null) {
    try {
      const params = new URLSearchParams({
        year: year.toString(),
        month: month.toString(),
      });

      if (bounceHouseId) {
        params.append('bounceHouseId', bounceHouseId);
      }

      const response = await fetch(`${this.BASE_URL}/get-calendar?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch calendar');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching calendar:', error);
      // Return local fallback data
      return this.getLocalCalendar(year, month);
    }
  },

  /**
   * Local fallback calendar generation
   */
  getLocalCalendar(year, month) {
    const blockedDates = [
      '2025-12-25', '2025-12-31', '2026-01-01',
      '2026-01-15', '2026-02-16', '2026-05-25',
      '2026-07-04', '2026-09-07', '2026-10-12',
      '2026-11-11', '2026-11-26', '2026-12-25',
    ];

    const lastDay = new Date(year, month, 0).getDate();
    const dates = [];

    for (let day = 1; day <= lastDay; day++) {
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isBlocked = blockedDates.includes(dateStr);
      const isPast = new Date(dateStr) < new Date().setHours(0, 0, 0, 0);

      dates.push({
        date: dateStr,
        available: !isBlocked && !isPast,
        status: isPast ? 'past' : (isBlocked ? 'blocked' : 'available'),
        reason: isBlocked ? 'Holiday' : null,
      });
    }

    return { dates };
  },

  /**
   * Create a Stripe Checkout session for booking
   * @param {Object} bookingData - Booking details
   * @returns {Promise<{checkoutUrl: string, sessionId: string, bookingId: string, pricing: Object}>}
   */
  async createCheckout(bookingData) {
    try {
      const response = await fetch(`${this.BASE_URL}/create-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create checkout');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating checkout:', error);
      throw error;
    }
  },

  /**
   * Calculate pricing based on rental type and zip code
   * @param {string} rentalType - 'daily', 'weekend', or 'weekly'
   * @param {string} [zip] - Zip code for delivery fee calculation
   * @returns {Object} Pricing breakdown
   */
  calculatePricing(rentalType, zip = null) {
    // Use CONFIG if available, otherwise use defaults
    const PRICING = typeof CONFIG !== 'undefined' && CONFIG.pricing ? {
      daily: CONFIG.pricing.daily,
      weekend: CONFIG.pricing.weekend,
      weekly: CONFIG.pricing.weekly,
    } : {
      daily: 150,
      weekend: 200,
      weekly: 800,
    };

    const LOCAL_ZIPS = typeof CONFIG !== 'undefined' && CONFIG.delivery ?
      CONFIG.delivery.localZips :
      ['84321', '84322', '84325', '84326', '84332', '84333', '84335', '84339', '84341'];

    const localFee = typeof CONFIG !== 'undefined' && CONFIG.delivery ? CONFIG.delivery.localFee : 20;
    const outsideFee = typeof CONFIG !== 'undefined' && CONFIG.delivery ? CONFIG.delivery.outsideFee : 50;
    const localAreaName = typeof CONFIG !== 'undefined' && CONFIG.delivery ? CONFIG.delivery.localAreaName : 'Local Area';

    const basePrice = PRICING[rentalType] || PRICING.daily;
    const isLocal = zip && LOCAL_ZIPS.includes(zip);
    const deliveryFee = isLocal ? localFee : outsideFee;
    const totalAmount = basePrice + deliveryFee;
    const depositPercent = typeof CONFIG !== 'undefined' && CONFIG.pricing ? CONFIG.pricing.depositPercent : 0.5;
    const depositAmount = Math.round(totalAmount * depositPercent * 100) / 100;

    return {
      basePrice,
      deliveryFee,
      deliveryZone: isLocal ? localAreaName : `Outside ${localAreaName}`,
      totalAmount,
      depositAmount,
      balanceDue: totalAmount - depositAmount,
    };
  },

  /**
   * Format currency for display
   */
  formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  },

  /**
   * Format date for display
   */
  formatDate(dateStr) {
    // Parse date parts to avoid timezone issues
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  },

  /**
   * Validate a promo code
   * @param {string} code - Promo code to validate
   * @param {number} orderAmount - Order amount for percentage calculation
   * @returns {Promise<Object>} Validation result
   */
  async validatePromoCode(code, orderAmount) {
    try {
      const response = await fetch(`${this.BASE_URL}/validate-promo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, orderAmount }),
      });

      if (!response.ok) {
        throw new Error('Failed to validate promo code');
      }

      return await response.json();
    } catch (error) {
      console.error('Error validating promo code:', error);
      return { valid: false, error: 'Failed to validate promo code' };
    }
  },

  /**
   * Fetch available add-ons
   * @param {string} [category] - Optional category filter (default: 'party_supplies')
   * @returns {Promise<{addOns: Array}>}
   */
  async getAddOns(category = 'party_supplies') {
    // Fallback add-ons data
    const fallbackAddOns = [
      { id: 'table-6ft', name: 'Folding Table (6ft)', description: 'Standard 6-foot rectangular folding table', price_per_unit: 10.00, max_quantity: 10 },
      { id: 'chair', name: 'Folding Chair', description: 'White folding chair', price_per_unit: 2.00, max_quantity: 50 },
      { id: 'canopy-10x10', name: 'Pop-up Canopy (10x10)', description: '10x10 foot white pop-up canopy tent', price_per_unit: 35.00, max_quantity: 4 },
      { id: 'tent-20x20', name: 'Party Tent (20x20)', description: 'Large 20x20 foot party tent', price_per_unit: 75.00, max_quantity: 2 },
    ];

    try {
      const params = new URLSearchParams({ category });
      const response = await fetch(`${this.BASE_URL}/get-add-ons?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch add-ons');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching add-ons:', error);
      return { addOns: fallbackAddOns };
    }
  },

  /**
   * Calculate add-ons total price
   * @param {Array} selectedAddOns - Array of {id, quantity, price_per_unit}
   * @returns {number} Total add-ons price
   */
  calculateAddOnsTotal(selectedAddOns) {
    if (!selectedAddOns || !Array.isArray(selectedAddOns)) return 0;
    return selectedAddOns.reduce((total, addOn) => {
      return total + (addOn.quantity * addOn.price_per_unit);
    }, 0);
  },
};

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.BookingAPI = BookingAPI;
}
