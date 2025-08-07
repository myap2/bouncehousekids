// Payment Processing System for My Bounce Place
class PaymentSystem {
    constructor() {
        this.stripe = null;
        this.elements = null;
        this.cardElement = null;
        this.depositPercentage = 0.25; // 25% deposit required
        this.initializeStripe();
    }

    async initializeStripe() {
        // Initialize Stripe (you'll need to replace with your publishable key)
        try {
            this.stripe = Stripe('pk_test_REPLACE_WITH_YOUR_STRIPE_PUBLISHABLE_KEY');
            this.elements = this.stripe.elements();
            console.log('Stripe initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Stripe:', error);
            this.showPaymentError('Payment system unavailable. Please contact us directly.');
        }
    }

    createPaymentModal(bookingData) {
        const totalAmount = parseFloat(bookingData.price.replace('$', ''));
        const depositAmount = totalAmount * this.depositPercentage;
        const remainingAmount = totalAmount - depositAmount;

        const modal = document.createElement('div');
        modal.className = 'modal payment-modal';
        modal.id = 'payment-modal';
        modal.innerHTML = `
            <div class="modal-content payment-modal-content">
                <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
                <h3>Complete Your Booking</h3>
                
                <div class="booking-summary">
                    <h4>Booking Summary</h4>
                    <div class="summary-item">
                        <span>Bounce House:</span>
                        <span>${bookingData.bounceHouseName}</span>
                    </div>
                    <div class="summary-item">
                        <span>Package:</span>
                        <span>${bookingData.package}</span>
                    </div>
                    <div class="summary-item">
                        <span>Date:</span>
                        <span>${bookingData.eventDate}</span>
                    </div>
                    <div class="summary-item">
                        <span>Time:</span>
                        <span>${bookingData.eventTime}</span>
                    </div>
                    <div class="summary-item total">
                        <span>Total Amount:</span>
                        <span>$${totalAmount.toFixed(2)}</span>
                    </div>
                </div>

                <div class="payment-options">
                    <h4>Payment Options</h4>
                    <div class="payment-option-buttons">
                        <button class="payment-option-btn active" id="deposit-option">
                            <span class="option-title">Pay Deposit (25%)</span>
                            <span class="option-amount">$${depositAmount.toFixed(2)}</span>
                            <span class="option-note">Remaining $${remainingAmount.toFixed(2)} due on delivery</span>
                        </button>
                        <button class="payment-option-btn" id="full-payment-option">
                            <span class="option-title">Pay Full Amount</span>
                            <span class="option-amount">$${totalAmount.toFixed(2)}</span>
                            <span class="option-note">No additional payment required</span>
                        </button>
                    </div>
                </div>

                <div class="payment-form">
                    <h4>Payment Information</h4>
                    <form id="payment-form">
                        <div class="form-group">
                            <label for="card-element">Credit or Debit Card</label>
                            <div id="card-element" class="stripe-card-element">
                                <!-- Stripe Elements will create form elements here -->
                            </div>
                            <div id="card-errors" role="alert"></div>
                        </div>
                        
                        <div class="form-group">
                            <label for="billing-name">Cardholder Name *</label>
                            <input type="text" id="billing-name" name="billingName" required>
                        </div>
                        
                        <div class="billing-address">
                            <h5>Billing Address</h5>
                            <div class="form-row">
                                <div class="form-group half">
                                    <label for="billing-address-line1">Address Line 1 *</label>
                                    <input type="text" id="billing-address-line1" name="billingAddressLine1" required>
                                </div>
                                <div class="form-group half">
                                    <label for="billing-address-line2">Address Line 2</label>
                                    <input type="text" id="billing-address-line2" name="billingAddressLine2">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group third">
                                    <label for="billing-city">City *</label>
                                    <input type="text" id="billing-city" name="billingCity" required>
                                </div>
                                <div class="form-group third">
                                    <label for="billing-state">State *</label>
                                    <input type="text" id="billing-state" name="billingState" value="UT" required>
                                </div>
                                <div class="form-group third">
                                    <label for="billing-zip">ZIP Code *</label>
                                    <input type="text" id="billing-zip" name="billingZip" required>
                                </div>
                            </div>
                        </div>

                        <div class="payment-total">
                            <div class="total-line">
                                <span>Amount to charge:</span>
                                <span id="charge-amount">$${depositAmount.toFixed(2)}</span>
                            </div>
                        </div>

                        <button type="submit" id="submit-payment" class="submit-btn payment-submit-btn">
                            <span id="button-text">Pay Now</span>
                            <div id="spinner" class="spinner hidden"></div>
                        </button>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.setupPaymentForm(bookingData, totalAmount, depositAmount);
    }

    setupPaymentForm(bookingData, totalAmount, depositAmount) {
        // Create Stripe card element
        const cardElement = this.elements.create('card', {
            style: {
                base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                        color: '#aab7c4',
                    },
                },
                invalid: {
                    color: '#9e2146',
                },
            },
        });

        cardElement.mount('#card-element');
        this.cardElement = cardElement;

        // Handle real-time validation errors from the card Element
        cardElement.on('change', ({error}) => {
            const displayError = document.getElementById('card-errors');
            if (error) {
                displayError.textContent = error.message;
            } else {
                displayError.textContent = '';
            }
        });

        // Setup payment option buttons
        this.setupPaymentOptions(totalAmount, depositAmount);

        // Handle form submission
        const form = document.getElementById('payment-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handlePayment(bookingData);
        });
    }

    setupPaymentOptions(totalAmount, depositAmount) {
        const depositBtn = document.getElementById('deposit-option');
        const fullPaymentBtn = document.getElementById('full-payment-option');
        const chargeAmount = document.getElementById('charge-amount');

        let selectedAmount = depositAmount;
        let selectedOption = 'deposit';

        depositBtn.addEventListener('click', () => {
            depositBtn.classList.add('active');
            fullPaymentBtn.classList.remove('active');
            chargeAmount.textContent = `$${depositAmount.toFixed(2)}`;
            selectedAmount = depositAmount;
            selectedOption = 'deposit';
        });

        fullPaymentBtn.addEventListener('click', () => {
            fullPaymentBtn.classList.add('active');
            depositBtn.classList.remove('active');
            chargeAmount.textContent = `$${totalAmount.toFixed(2)}`;
            selectedAmount = totalAmount;
            selectedOption = 'full';
        });

        // Store selected amount and option for later use
        this.selectedAmount = selectedAmount;
        this.selectedOption = selectedOption;

        // Update amounts when buttons are clicked
        depositBtn.addEventListener('click', () => {
            this.selectedAmount = depositAmount;
            this.selectedOption = 'deposit';
        });

        fullPaymentBtn.addEventListener('click', () => {
            this.selectedAmount = totalAmount;
            this.selectedOption = 'full';
        });
    }

    async handlePayment(bookingData) {
        const submitButton = document.getElementById('submit-payment');
        const buttonText = document.getElementById('button-text');
        const spinner = document.getElementById('spinner');

        // Show loading state
        submitButton.disabled = true;
        buttonText.classList.add('hidden');
        spinner.classList.remove('hidden');

        try {
            // Get billing details
            const billingDetails = this.getBillingDetails();
            
            // Create payment method
            const {paymentMethod, error} = await this.stripe.createPaymentMethod({
                type: 'card',
                card: this.cardElement,
                billing_details: billingDetails,
            });

            if (error) {
                throw new Error(error.message);
            }

            // Process payment
            await this.processPayment(paymentMethod, bookingData);

        } catch (error) {
            this.showPaymentError(error.message);
        } finally {
            // Reset button state
            submitButton.disabled = false;
            buttonText.classList.remove('hidden');
            spinner.classList.add('hidden');
        }
    }

    getBillingDetails() {
        return {
            name: document.getElementById('billing-name').value,
            address: {
                line1: document.getElementById('billing-address-line1').value,
                line2: document.getElementById('billing-address-line2').value,
                city: document.getElementById('billing-city').value,
                state: document.getElementById('billing-state').value,
                postal_code: document.getElementById('billing-zip').value,
                country: 'US',
            },
        };
    }

    async processPayment(paymentMethod, bookingData) {
        // In a real implementation, you would send this to your server
        // For this demo, we'll simulate the process
        
        const paymentData = {
            paymentMethodId: paymentMethod.id,
            amount: Math.round(this.selectedAmount * 100), // Amount in cents
            currency: 'usd',
            bookingData: bookingData,
            paymentOption: this.selectedOption,
            customerEmail: bookingData.email,
        };

        // Simulate server processing
        await this.simulateServerPayment(paymentData);
    }

    async simulateServerPayment(paymentData) {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Simulate successful payment (90% success rate)
        const isSuccess = Math.random() > 0.1;

        if (isSuccess) {
            this.handlePaymentSuccess(paymentData);
        } else {
            throw new Error('Payment failed. Please try again or use a different card.');
        }
    }

    handlePaymentSuccess(paymentData) {
        // Store payment information
        const paymentRecord = {
            id: 'payment_' + Date.now(),
            bookingId: paymentData.bookingData.id || 'booking_' + Date.now(),
            amount: paymentData.amount / 100,
            paymentOption: paymentData.paymentOption,
            status: 'completed',
            timestamp: new Date().toISOString(),
            customerEmail: paymentData.customerEmail,
        };

        this.savePaymentRecord(paymentRecord);

        // Update booking with payment info
        if (paymentData.bookingData.id) {
            this.updateBookingPaymentStatus(paymentData.bookingData.id, paymentRecord);
        }

        // Show success message
        this.showPaymentSuccess(paymentRecord);

        // Close payment modal
        document.getElementById('payment-modal')?.remove();

        // Trigger booking confirmation
        document.dispatchEvent(new CustomEvent('paymentCompleted', {
            detail: {
                payment: paymentRecord,
                booking: paymentData.bookingData
            }
        }));
    }

    savePaymentRecord(paymentRecord) {
        const payments = JSON.parse(localStorage.getItem('payments') || '[]');
        payments.push(paymentRecord);
        localStorage.setItem('payments', JSON.stringify(payments));
    }

    updateBookingPaymentStatus(bookingId, paymentRecord) {
        const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
        const bookingIndex = bookings.findIndex(b => b.id === bookingId);
        
        if (bookingIndex !== -1) {
            bookings[bookingIndex].paymentStatus = paymentRecord.paymentOption === 'full' ? 'paid' : 'deposit_paid';
            bookings[bookingIndex].paymentId = paymentRecord.id;
            bookings[bookingIndex].amountPaid = paymentRecord.amount;
            localStorage.setItem('bookings', JSON.stringify(bookings));
        }
    }

    showPaymentSuccess(paymentRecord) {
        const modal = document.createElement('div');
        modal.className = 'modal success-modal';
        modal.innerHTML = `
            <div class="modal-content success-content">
                <div class="success-icon">✓</div>
                <h3>Payment Successful!</h3>
                <p>Your payment of $${paymentRecord.amount.toFixed(2)} has been processed successfully.</p>
                <p><strong>Payment ID:</strong> ${paymentRecord.id}</p>
                <p>You will receive an email confirmation shortly.</p>
                <button class="submit-btn" onclick="this.parentElement.parentElement.remove()">
                    Continue
                </button>
            </div>
        `;
        document.body.appendChild(modal);
    }

    showPaymentError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'payment-error-notification';
        errorDiv.innerHTML = `
            <div class="error-content">
                <span class="error-icon">⚠️</span>
                <span class="error-message">${message}</span>
                <button class="error-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        document.body.appendChild(errorDiv);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    // Method to handle alternative payment methods (for future expansion)
    setupAlternativePayments() {
        // PayPal, Apple Pay, Google Pay integration could go here
    }

    // Method to handle payment plans (for future expansion)
    setupPaymentPlans() {
        // Installment payment options could go here
    }
}

// Initialize payment system
document.addEventListener('DOMContentLoaded', () => {
    window.paymentSystem = new PaymentSystem();
});