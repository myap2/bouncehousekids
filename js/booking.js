// Enhanced Booking System for My Bounce Place
class BookingSystem {
    constructor() {
        this.availability = {};
        this.initializeBookingSystem();
    }

    initializeBookingSystem() {
        this.setupBookingButtons();
        this.setupAvailabilityChecker();
        this.setupBookingConfirmation();
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

    showBookingModal(pricingCard) {
        const pricingType = pricingCard.querySelector('h3').textContent;
        const price = pricingCard.querySelector('div[style*="font-size: 2.5rem"]').textContent;
        
        // Create booking modal
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'booking-modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
                <h3>Book Your Bounce House</h3>
                <p><strong>Package:</strong> ${pricingType}</p>
                <p><strong>Price:</strong> ${price}</p>
                
                <form id="booking-form">
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
                        <label for="booking-date">Event Date *</label>
                        <input type="date" id="booking-date" name="eventDate" required min="${new Date().toISOString().split('T')[0]}">
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
                        <label for="booking-location">Event Location *</label>
                        <input type="text" id="booking-location" name="location" required placeholder="Address or location">
                    </div>
                    <div class="form-group">
                        <label for="booking-guests">Number of Guests</label>
                        <input type="number" id="booking-guests" name="guests" min="1" max="50" placeholder="Estimated number of children">
                    </div>
                    <div class="form-group">
                        <label for="booking-notes">Special Requests</label>
                        <textarea id="booking-notes" name="notes" rows="3" placeholder="Any special requirements or requests"></textarea>
                    </div>
                    <button type="submit" class="submit-btn">Request Booking</button>
                </form>
            </div>
        `;

        document.body.appendChild(modal);
        this.setupBookingForm();
    }

    setupBookingForm() {
        const form = document.getElementById('booking-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.processBooking(form);
            });
        }
    }

    async processBooking(form) {
        const formData = new FormData(form);
        const bookingData = Object.fromEntries(formData);
        
        // Add package info
        const modal = document.getElementById('booking-modal');
        const packageInfo = modal.querySelector('p').textContent;
        bookingData.package = packageInfo;

        try {
            // Simulate booking submission (replace with actual API call)
            await this.submitBooking(bookingData);
            this.showBookingConfirmation(bookingData);
        } catch (error) {
            this.showBookingError(error);
        }
    }

    async submitBooking(bookingData) {
        // Simulate API call - replace with actual booking system
        return new Promise((resolve) => {
            setTimeout(() => {
                // Track booking attempt in analytics
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'booking_request', {
                        event_category: 'engagement',
                        event_label: bookingData.package,
                        value: 1
                    });
                }
                resolve(bookingData);
            }, 1000);
        });
    }

    showBookingConfirmation(bookingData) {
        const modal = document.getElementById('booking-modal');
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px; text-align: center;">
                <h3>🎉 Booking Request Submitted!</h3>
                <p>Thank you for choosing My Bounce Place!</p>
                <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin: 1rem 0;">
                    <p><strong>Confirmation Details:</strong></p>
                    <p>Name: ${bookingData.name}</p>
                    <p>Date: ${bookingData.eventDate}</p>
                    <p>Time: ${bookingData.eventTime}</p>
                    <p>Package: ${bookingData.package}</p>
                </div>
                <p>We'll contact you within 24 hours to confirm your booking and discuss setup details.</p>
                <button onclick="this.parentElement.parentElement.remove()" class="hero-button">Close</button>
            </div>
        `;
    }

    showBookingError(error) {
        const modal = document.getElementById('booking-modal');
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px; text-align: center;">
                <h3>❌ Booking Error</h3>
                <p>Sorry, there was an issue processing your booking request.</p>
                <p>Please try again or call us directly at <a href="tel:+13852888065">(385) 288-8065</a></p>
                <button onclick="this.parentElement.parentElement.remove()" class="hero-button">Close</button>
            </div>
        `;
    }

    setupAvailabilityChecker() {
        // Add availability checker to contact form
        const contactForm = document.getElementById('contact-form');
        if (contactForm) {
            const dateInput = contactForm.querySelector('#contact-date');
            if (dateInput) {
                dateInput.addEventListener('change', (e) => {
                    this.checkAvailability(e.target.value);
                });
            }
        }
    }

    async checkAvailability(date) {
        // Simulate availability check
        const available = Math.random() > 0.3; // 70% availability for demo
        
        if (available) {
            this.showAvailabilityMessage('✅ Available for booking!', 'success');
        } else {
            this.showAvailabilityMessage('❌ Date not available. Please select another date.', 'error');
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