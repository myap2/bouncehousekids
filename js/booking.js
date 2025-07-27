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
                    <input type="hidden" name="package" value="${pricingType}">
                    <input type="hidden" name="price" value="${price}">
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
        
        try {
            // Show loading state
            const submitBtn = form.querySelector('.submit-btn');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;

            // Send booking request
            await this.sendBookingEmail(bookingData);
            
            // Show success
            this.showBookingConfirmation(bookingData);
            
            // Track in analytics
            this.trackBookingAnalytics(bookingData);
            
        } catch (error) {
            console.error('Booking error:', error);
            this.showBookingError(error);
        } finally {
            // Reset button
            const submitBtn = form.querySelector('.submit-btn');
            submitBtn.textContent = 'Request Booking';
            submitBtn.disabled = false;
        }
    }

    async sendBookingEmail(bookingData) {
        // Option 1: Using EmailJS (Recommended for easy setup)
        if (typeof emailjs !== 'undefined') {
            return this.sendViaEmailJS(bookingData);
        }
        
        // Option 2: Using Formspree (Alternative)
        return this.sendViaFormspree(bookingData);
    }

    async sendViaEmailJS(bookingData) {
        const templateParams = {
            to_email: 'noreply@mybounceplace.com', // Your email
            from_name: bookingData.name,
            from_email: bookingData.email,
            from_phone: bookingData.phone,
            event_date: bookingData.eventDate,
            event_time: bookingData.eventTime,
            event_location: bookingData.location,
            number_guests: bookingData.guests,
            special_requests: bookingData.notes,
            package: bookingData.package,
            price: bookingData.price,
            message: this.formatBookingEmail(bookingData)
        };

        return emailjs.send(
            'YOUR_EMAILJS_SERVICE_ID', // Replace with your EmailJS service ID
            'YOUR_EMAILJS_TEMPLATE_ID', // Replace with your EmailJS template ID
            templateParams
        );
    }

    async sendViaFormspree(bookingData) {
        const formData = new FormData();
        
        // Add all booking data to form
        Object.keys(bookingData).forEach(key => {
            formData.append(key, bookingData[key]);
        });

        const response = await fetch('https://formspree.io/f/YOUR_FORMSPREE_ID', { // Replace with your Formspree ID
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to send booking request');
        }

        return response.json();
    }

    formatBookingEmail(bookingData) {
        return `
New Bounce House Booking Request

Customer Details:
- Name: ${bookingData.name}
- Email: ${bookingData.email}
- Phone: ${bookingData.phone}

Event Details:
- Date: ${bookingData.eventDate}
- Time: ${bookingData.eventTime}
- Location: ${bookingData.location}
- Number of Guests: ${bookingData.guests || 'Not specified'}

Package Details:
- Package: ${bookingData.package}
- Price: ${bookingData.price}

Special Requests:
${bookingData.notes || 'None'}

---
This booking request was submitted from the My Bounce Place website.
Please respond within 24 hours to confirm availability.
        `;
    }

    trackBookingAnalytics(bookingData) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'booking_request', {
                event_category: 'engagement',
                event_label: bookingData.package,
                value: 1,
                custom_parameters: {
                    package: bookingData.package,
                    price: bookingData.price,
                    event_date: bookingData.eventDate
                }
            });
        }
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
                <p><strong>Next Steps:</strong></p>
                <ul style="text-align: left; display: inline-block;">
                    <li>Check your email for a confirmation</li>
                    <li>We'll call you to confirm availability</li>
                    <li>Discuss delivery and setup details</li>
                </ul>
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
                <p><strong>Alternative Contact Methods:</strong></p>
                <ul style="text-align: left; display: inline-block;">
                    <li>Call: (385) 288-8065</li>
                    <li>Email: noreply@mybounceplace.com</li>
                    <li>Text us for quick response</li>
                </ul>
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