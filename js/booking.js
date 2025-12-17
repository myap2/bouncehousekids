// Enhanced Booking System for My Bounce Place with Stripe Integration
class BookingSystem {
    constructor() {
        this.availability = {};
        this.selectedDate = null;
        this.calendar = null;
        this.currentPricing = null;
        this.initializeBookingSystem();
    }

    initializeBookingSystem() {
        this.setupBookingButtons();
        this.setupAvailabilityChecker();
        this.setupBookingConfirmation();
        this.handleBookingRedirects();
    }

    setupBookingButtons() {
        // Add booking buttons to all pricing cards
        const pricingCards = document.querySelectorAll('.pricing-card');
        pricingCards.forEach(card => {
            const bookButton = card.querySelector('.hero-button');
            if (bookButton) {
                bookButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.showBookingModal(card);
                });
            }
        });
    }

    // Handle Stripe redirect callbacks
    handleBookingRedirects() {
        const hash = window.location.hash;

        if (hash.includes('booking-success')) {
            // Show success page
            this.showSuccessPage();
        } else if (hash.includes('booking-cancelled')) {
            // Show cancelled page
            this.showCancelledPage();
        }
    }

    showSuccessPage() {
        // Create success modal
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'booking-success-modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px; text-align: center;">
                <h2 style="color: #28a745;">Payment Successful!</h2>
                <div style="font-size: 4rem; margin: 20px 0;">🎉</div>
                <p>Thank you for booking with My Bounce Place!</p>
                <p>Your deposit has been received and your booking is confirmed.</p>

                <div style="background: #d4edda; padding: 1rem; border-radius: 8px; margin: 20px 0;">
                    <p><strong>What happens next?</strong></p>
                    <ul style="text-align: left; margin: 10px 0;">
                        <li>You'll receive a confirmation email shortly</li>
                        <li>We'll contact you 1-2 days before your event</li>
                        <li>Please ensure you've signed the waiver</li>
                    </ul>
                </div>

                <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                    <a href="#waiver" class="hero-button" style="background: #28a745;">Sign Waiver</a>
                    <a href="#home" class="hero-button" onclick="this.closest('.modal').remove()">Return Home</a>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Clean up URL
        history.replaceState(null, '', window.location.pathname + '#home');
    }

    showCancelledPage() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'booking-cancelled-modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px; text-align: center;">
                <h2 style="color: #dc3545;">Booking Cancelled</h2>
                <div style="font-size: 4rem; margin: 20px 0;">😕</div>
                <p>Your booking was not completed.</p>
                <p>No charges have been made to your card.</p>

                <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin: 20px 0;">
                    <p>Need help? Contact us:</p>
                    <p><a href="tel:3852888065">(385) 288-8065</a></p>
                    <p><a href="mailto:noreply@mybounceplace.com">noreply@mybounceplace.com</a></p>
                </div>

                <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                    <a href="#pricing" class="hero-button" style="background: #4a90d9;" onclick="this.closest('.modal').remove()">Try Again</a>
                    <a href="#home" class="hero-button" onclick="this.closest('.modal').remove()">Return Home</a>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        // Clean up URL
        history.replaceState(null, '', window.location.pathname + '#home');
    }

    showBookingModal(pricingCard) {
        const pricingType = pricingCard.querySelector('h3').textContent;
        const priceText = pricingCard.querySelector('div[style*="font-size: 2.5rem"]').textContent;

        // Map display name to rental type key
        const rentalTypeMap = {
            'Daily Rental': 'daily',
            'Weekend Special': 'weekend',
            'Weekly Rental': 'weekly'
        };
        const rentalType = rentalTypeMap[pricingType] || 'daily';

        // Create booking modal with calendar
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'booking-modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <span class="close">&times;</span>
                <h3>Book Your Bounce House</h3>
                <p><strong>Package:</strong> ${pricingType}</p>

                <div id="booking-calendar-container" style="margin: 20px 0;"></div>

                <div id="pricing-breakdown" style="display: none; background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <h4 style="margin-top: 0;">Pricing</h4>
                    <div id="pricing-details"></div>
                </div>

                <form id="booking-form" style="display: none;">
                    <div class="form-group">
                        <label for="booking-name">Name *</label>
                        <input type="text" id="booking-name" name="name" required>
                    </div>
                    <div class="form-group">
                        <label for="booking-email">Email *</label>
                        <input type="email" id="booking-email" name="email" required>
                    </div>
                    <div class="form-group">
                        <label for="booking-phone">Phone *</label>
                        <input type="tel" id="booking-phone" name="phone" required>
                    </div>
                    <div class="form-group">
                        <label for="booking-time">Event Time *</label>
                        <select id="booking-time" name="eventTime" required>
                            <option value="">Select time</option>
                            <option value="09:00">9:00 AM</option>
                            <option value="10:00">10:00 AM</option>
                            <option value="11:00">11:00 AM</option>
                            <option value="12:00">12:00 PM</option>
                            <option value="13:00">1:00 PM</option>
                            <option value="14:00">2:00 PM</option>
                            <option value="15:00">3:00 PM</option>
                            <option value="16:00">4:00 PM</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="booking-location">Event Address *</label>
                        <input type="text" id="booking-location" name="location" required placeholder="Full street address">
                    </div>
                    <div class="form-group">
                        <label for="booking-zip">Zip Code *</label>
                        <input type="text" id="booking-zip" name="zip" required placeholder="84321" maxlength="5" pattern="[0-9]{5}">
                        <small style="color: #666;">Used to calculate delivery fee</small>
                    </div>
                    <div class="form-group">
                        <label for="booking-guests">Number of Guests</label>
                        <input type="number" id="booking-guests" name="guests" min="1" max="50" placeholder="Estimated number of children">
                    </div>
                    <div class="form-group">
                        <label for="booking-notes">Special Requests</label>
                        <textarea id="booking-notes" name="notes" rows="3" placeholder="Any special requirements or requests"></textarea>
                    </div>
                    <div class="form-group">
                        <label for="booking-promo">Promo Code</label>
                        <div style="display: flex; gap: 10px;">
                            <input type="text" id="booking-promo" name="promoCode" placeholder="Enter code" style="flex: 1; text-transform: uppercase;">
                            <button type="button" id="apply-promo-btn" class="submit-btn" style="padding: 10px 15px; font-size: 0.9rem;">Apply</button>
                        </div>
                        <div id="promo-message" style="margin-top: 5px; font-size: 0.9rem;"></div>
                    </div>
                    <input type="hidden" name="rentalType" value="${rentalType}">
                    <input type="hidden" name="eventDate" id="booking-event-date" value="">

                    <div id="booking-error" style="display: none; background: #f8d7da; color: #721c24; padding: 10px; border-radius: 4px; margin-bottom: 15px;"></div>

                    <button type="submit" class="submit-btn" id="pay-deposit-btn">
                        <span id="btn-text">Pay Deposit</span>
                        <span id="btn-loading" style="display: none;">Processing...</span>
                    </button>

                    <p style="font-size: 0.9rem; color: #666; margin-top: 10px; text-align: center;">
                        You'll be redirected to our secure payment page to pay a 50% deposit.
                    </p>
                </form>
            </div>
        `;

        document.body.appendChild(modal);

        // Show modal (add 'show' class)
        modal.classList.add('show');

        // Setup close handlers
        const closeBtn = modal.querySelector('.close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => modal.remove());
        }

        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });

        // Close on Escape key
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                modal.remove();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);

        // Initialize calendar
        this.calendar = new AvailabilityCalendar('booking-calendar-container', {
            onDateSelect: (date, dayData) => this.handleDateSelection(date, dayData, rentalType)
        });

        // Setup zip code change handler for pricing updates
        const zipInput = modal.querySelector('#booking-zip');
        zipInput.addEventListener('change', () => this.updatePricingDisplay(rentalType, zipInput.value));
        zipInput.addEventListener('input', () => {
            if (zipInput.value.length === 5) {
                this.updatePricingDisplay(rentalType, zipInput.value);
            }
        });

        // Setup promo code handler
        const promoBtn = modal.querySelector('#apply-promo-btn');
        promoBtn.addEventListener('click', () => this.applyPromoCode(rentalType));

        this.setupBookingForm(rentalType);
    }

    async applyPromoCode(rentalType) {
        const promoInput = document.getElementById('booking-promo');
        const promoMessage = document.getElementById('promo-message');
        const promoBtn = document.getElementById('apply-promo-btn');
        const zipInput = document.getElementById('booking-zip');

        const code = promoInput.value.trim();
        if (!code) {
            promoMessage.innerHTML = '<span style="color: #dc3545;">Please enter a promo code</span>';
            return;
        }

        // Calculate current order amount
        const pricing = BookingAPI.calculatePricing(rentalType, zipInput?.value);

        promoBtn.disabled = true;
        promoBtn.textContent = '...';

        try {
            const result = await BookingAPI.validatePromoCode(code, pricing.totalAmount);

            if (result.valid) {
                this.appliedPromo = result;
                promoMessage.innerHTML = `<span style="color: #28a745;">&#10004; ${result.description || 'Code applied!'} (-${BookingAPI.formatCurrency(result.discountAmount)})</span>`;
                promoInput.disabled = true;
                promoBtn.textContent = 'Applied';
                promoBtn.style.background = '#28a745';

                // Update pricing display with discount
                this.updatePricingDisplay(rentalType, zipInput?.value);
            } else {
                this.appliedPromo = null;
                promoMessage.innerHTML = `<span style="color: #dc3545;">&#10008; ${result.error || 'Invalid code'}</span>`;
                promoBtn.disabled = false;
                promoBtn.textContent = 'Apply';
            }
        } catch (error) {
            promoMessage.innerHTML = '<span style="color: #dc3545;">Error validating code</span>';
            promoBtn.disabled = false;
            promoBtn.textContent = 'Apply';
        }
    }

    handleDateSelection(date, dayData, rentalType) {
        const form = document.getElementById('booking-form');
        const dateInput = document.getElementById('booking-event-date');
        const pricingBreakdown = document.getElementById('pricing-breakdown');

        if (dayData.available) {
            this.selectedDate = date;
            dateInput.value = date;
            form.style.display = 'block';
            pricingBreakdown.style.display = 'block';

            // Update pricing with current zip
            const zipInput = document.getElementById('booking-zip');
            this.updatePricingDisplay(rentalType, zipInput?.value);
        } else {
            this.selectedDate = null;
            dateInput.value = '';
            form.style.display = 'none';
            pricingBreakdown.style.display = 'none';
        }
    }

    updatePricingDisplay(rentalType, zip) {
        const pricingDetails = document.getElementById('pricing-details');
        const pricing = BookingAPI.calculatePricing(rentalType, zip);

        // Apply promo discount if available
        let discountAmount = 0;
        let discountHtml = '';

        if (this.appliedPromo && this.appliedPromo.valid) {
            discountAmount = this.appliedPromo.discountAmount || 0;
            discountHtml = `
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #28a745;">
                    <span>Promo Discount (${this.appliedPromo.code}):</span>
                    <span>-${BookingAPI.formatCurrency(discountAmount)}</span>
                </div>
            `;
        }

        const finalTotal = pricing.totalAmount - discountAmount;
        const depositAmount = Math.round(finalTotal * 0.5 * 100) / 100;
        const balanceDue = finalTotal - depositAmount;

        // Store current pricing with discount applied
        this.currentPricing = {
            ...pricing,
            discountAmount,
            finalTotal,
            depositAmount,
            balanceDue
        };

        pricingDetails.innerHTML = `
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span>Base Price (${rentalType}):</span>
                <span>${BookingAPI.formatCurrency(pricing.basePrice)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span>Delivery Fee (${pricing.deliveryZone}):</span>
                <span>${BookingAPI.formatCurrency(pricing.deliveryFee)}</span>
            </div>
            ${discountHtml}
            <hr style="margin: 10px 0;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-weight: bold;">
                <span>Total:</span>
                <span>${BookingAPI.formatCurrency(finalTotal)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; color: #28a745; font-weight: bold;">
                <span>Deposit Due Now (50%):</span>
                <span>${BookingAPI.formatCurrency(depositAmount)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; color: #666; font-size: 0.9rem;">
                <span>Balance Due at Event:</span>
                <span>${BookingAPI.formatCurrency(balanceDue)}</span>
            </div>
        `;

        // Update button text
        const btnText = document.getElementById('btn-text');
        if (btnText) {
            btnText.textContent = `Pay ${BookingAPI.formatCurrency(depositAmount)} Deposit`;
        }
    }

    setupBookingForm(rentalType) {
        const form = document.getElementById('booking-form');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.processBooking(form, rentalType);
            });
        }
    }

    async processBooking(form, rentalType) {
        const submitBtn = document.getElementById('pay-deposit-btn');
        const btnText = document.getElementById('btn-text');
        const btnLoading = document.getElementById('btn-loading');
        const errorDiv = document.getElementById('booking-error');

        try {
            // Validate date is selected
            if (!this.selectedDate) {
                throw new Error('Please select a date from the calendar');
            }

            // Show loading state
            submitBtn.disabled = true;
            btnText.style.display = 'none';
            btnLoading.style.display = 'inline';
            errorDiv.style.display = 'none';

            // Collect form data
            const formData = new FormData(form);
            const bookingData = {
                bounceHouseId: null, // Will use default if only one
                eventDate: this.selectedDate,
                eventTime: formData.get('eventTime'),
                rentalType: rentalType,
                customerName: formData.get('name'),
                customerEmail: formData.get('email'),
                customerPhone: formData.get('phone'),
                eventAddress: formData.get('location'),
                eventZip: formData.get('zip'),
                guestsCount: formData.get('guests'),
                specialRequests: formData.get('notes'),
                promoCode: this.appliedPromo?.code || formData.get('promoCode') || null,
            };

            // Check availability one more time
            const availability = await BookingAPI.checkAvailability(this.selectedDate);
            if (!availability.available) {
                throw new Error(availability.reason || 'This date is no longer available');
            }

            // Create Stripe checkout session
            const result = await BookingAPI.createCheckout(bookingData);

            if (result.checkoutUrl) {
                // Save booking data to localStorage as backup
                const existingBookings = JSON.parse(localStorage.getItem('bookingRequests') || '[]');
                existingBookings.push({
                    id: result.bookingId || 'pending_' + Date.now(),
                    sessionId: result.sessionId,
                    ...bookingData,
                    pricing: result.pricing,
                    timestamp: new Date().toISOString(),
                    status: 'pending_payment'
                });
                localStorage.setItem('bookingRequests', JSON.stringify(existingBookings));

                // Track in analytics
                this.trackBookingAnalytics(bookingData);

                // Redirect to Stripe Checkout
                window.location.href = result.checkoutUrl;
            } else {
                throw new Error('Failed to create checkout session');
            }

        } catch (error) {
            console.error('Booking error:', error);
            errorDiv.textContent = error.message || 'An error occurred. Please try again.';
            errorDiv.style.display = 'block';

            // Reset button
            submitBtn.disabled = false;
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
        }
    }

    trackBookingAnalytics(bookingData) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'begin_checkout', {
                event_category: 'ecommerce',
                event_label: bookingData.rentalType,
                value: this.currentPricing?.depositAmount || 0,
                items: [{
                    item_name: 'Bounce House Rental',
                    item_category: bookingData.rentalType,
                    price: this.currentPricing?.totalAmount || 0,
                }]
            });
        }
    }

    setupAvailabilityChecker() {
        // Add availability checker to contact form
        const contactForm = document.getElementById('contact-form');
        if (contactForm) {
            const dateInput = contactForm.querySelector('#contact-date');
            if (dateInput) {
                dateInput.addEventListener('change', async (e) => {
                    await this.checkAvailability(e.target.value);
                });

                // Reset styling when user starts typing/selecting
                dateInput.addEventListener('focus', () => {
                    dateInput.style.cssText = '';
                });
            }
        }
    }

    async checkAvailability(date) {
        const dateInput = document.getElementById('contact-date');

        // Use API to check availability
        const result = await BookingAPI.checkAvailability(date);

        if (dateInput) {
            if (!result.available) {
                dateInput.style.cssText = `
                    background-color: #f8d7da;
                    border-color: #f5c6cb;
                    color: #721c24;
                    text-decoration: line-through;
                    opacity: 0.7;
                `;
                this.showAvailabilityMessage(`❌ ${result.reason || 'Date not available'}`, 'error');
            } else {
                dateInput.style.cssText = `
                    background-color: #d4edda;
                    border-color: #c3e6cb;
                    color: #155724;
                    text-decoration: none;
                    opacity: 1;
                `;
                this.showAvailabilityMessage('✅ Available for booking!', 'success');
            }
        }
    }

    showAvailabilityMessage(message, type) {
        let existingMessage = document.getElementById('availability-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.id = 'availability-message';
        messageDiv.style.cssText = `
            padding: 0.5rem;
            margin: 0.5rem 0;
            border-radius: 4px;
            font-weight: bold;
            ${type === 'success' ? 'background: #d4edda; color: #155724; border: 1px solid #c3e6cb;' : 'background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;'}
        `;
        messageDiv.textContent = message;

        const dateInput = document.getElementById('contact-date');
        if (dateInput) {
            dateInput.parentNode.appendChild(messageDiv);
        }
    }

    setupBookingConfirmation() {
        // Add booking confirmation tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', 'page_view', {
                page_title: 'Booking System',
                page_location: window.location.href
            });
        }
    }
}

// Initialize booking system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.bookingSystem = new BookingSystem();
});
