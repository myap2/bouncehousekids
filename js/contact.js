// Contact Form Management - replaces server-side form processing
class ContactManager {
    constructor() {
        this.form = null;
    }

    init() {
        this.setupForm();
    }

    setupForm() {
        this.form = document.getElementById('contact-form');
        if (!this.form) return;

        // Prevent default form submission to avoid redirecting and URL params
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.handleSubmit();
            return false;
        });

        // Add input validation listeners
        this.setupInputListeners();
        
        // Set minimum date to today
        this.setupDatePicker();
    }

    setupInputListeners() {
        const inputs = this.form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
    }

    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.name;
        let isValid = true;
        let errorMessage = '';

        // Clear previous error
        this.clearFieldError(field);

        switch (fieldName) {
            case 'name':
                if (!value) {
                    errorMessage = 'Name is required';
                    isValid = false;
                } else if (value.length < 2) {
                    errorMessage = 'Name must be at least 2 characters';
                    isValid = false;
                }
                break;

            case 'email':
                if (!value) {
                    errorMessage = 'Email is required';
                    isValid = false;
                } else if (!this.isValidEmail(value)) {
                    errorMessage = 'Please enter a valid email address';
                    isValid = false;
                }
                break;

            case 'phone':
                // Phone is optional, but if provided, should be valid format
                if (value && !this.isValidPhone(value)) {
                    errorMessage = 'Please enter a valid phone number';
                    isValid = false;
                }
                break;

            case 'message':
                if (!value) {
                    errorMessage = 'Message is required';
                    isValid = false;
                } else if (value.length < 10) {
                    errorMessage = 'Message must be at least 10 characters';
                    isValid = false;
                }
                break;

            case 'desiredDate':
                if (!value) {
                    errorMessage = 'Desired rental date is required';
                    isValid = false;
                } else {
                    const selectedDate = new Date(value);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    
                    if (selectedDate < today) {
                        errorMessage = 'Please select a future date';
                        isValid = false;
                    }
                }
                break;
        }

        if (!isValid) {
            this.showFieldError(field, errorMessage);
        }

        return isValid;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidPhone(phone) {
        // Remove all non-digits
        const cleaned = phone.replace(/\D/g, '');
        // Check if it's a valid US phone number (10 or 11 digits)
        return cleaned.length === 10 || (cleaned.length === 11 && cleaned[0] === '1');
    }

    showFieldError(field, message) {
        // Remove existing error
        this.clearFieldError(field);

        // Create error element
        const errorElement = document.createElement('span');
        errorElement.className = 'field-error';
        errorElement.style.color = '#dc3545';
        errorElement.style.fontSize = '0.875rem';
        errorElement.style.marginTop = '0.25rem';
        errorElement.style.display = 'block';
        errorElement.textContent = message;

        // Add error styling to field
        field.style.borderColor = '#dc3545';

        // Insert error message after the field
        field.parentNode.insertBefore(errorElement, field.nextSibling);
    }

    clearFieldError(field) {
        // Remove error styling
        field.style.borderColor = '';

        // Remove error message
        const errorElement = field.parentNode.querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
        }
    }

    validateForm() {
        const formData = new FormData(this.form);
        const fields = ['name', 'email', 'desiredDate', 'message']; // phone is optional
        let isValid = true;

        fields.forEach(fieldName => {
            const field = this.form.querySelector(`[name="${fieldName}"]`);
            if (field && !this.validateField(field)) {
                isValid = false;
            }
        });

        // Also validate phone if provided
        const phoneField = this.form.querySelector('[name="phone"]');
        if (phoneField && phoneField.value.trim()) {
            if (!this.validateField(phoneField)) {
                isValid = false;
            }
        }

        return isValid;
    }

    collectFormData() {
        const formData = new FormData(this.form);
        return {
            name: formData.get('name')?.trim() || '',
            email: formData.get('email')?.trim() || '',
            phone: formData.get('phone')?.trim() || '',
            desiredDate: formData.get('desiredDate') || '',
            message: formData.get('message')?.trim() || '',
            timestamp: new Date().toISOString()
        };
    }

    async handleSubmit() {
        // Validate form
        if (!this.validateForm()) {
            return;
        }

        // Collect form data
        const data = this.collectFormData();

        // Prevent any URL changes
        const currentUrl = window.location.href;
        const urlObserver = () => {
            if (window.location.href !== currentUrl) {
                window.history.replaceState(null, null, currentUrl);
            }
        };
        window.addEventListener('popstate', urlObserver);

        // Disable submit button
        const submitBtn = this.form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';

        try {
            // Submit to Formspree
            const formData = new FormData(this.form);
            
            // Add hidden fields for better email formatting
            formData.append('_subject', `Bounce House Rental Request - ${data.name}`);
            formData.append('_replyto', data.email);
            
            const response = await fetch('https://formspree.io/f/mgvzkqgp', {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                // Also save to localStorage for backup
                const existingMessages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
                const messageId = 'msg_' + Date.now();
                existingMessages.push({
                    id: messageId,
                    ...data
                });
                localStorage.setItem('contactMessages', JSON.stringify(existingMessages));

                // Show inline success message
                this.showInlineSuccess(data);

                // Reset form
                this.form.reset();
                
                // Clear any remaining field errors
                const errorElements = this.form.querySelectorAll('.field-error');
                errorElements.forEach(el => el.remove());
                
                const fields = this.form.querySelectorAll('input, textarea');
                fields.forEach(field => {
                    field.style.borderColor = '';
                });
            } else {
                console.error('Form submission failed:', response.status, response.statusText);
                throw new Error('Form submission failed');
            }

        } catch (error) {
            console.error('Error submitting contact form:', error);
            this.showError('An error occurred while sending your message. Please try again or call us directly.');
        } finally {
            // Re-enable submit button
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
            
            // Clean up URL observer
            window.removeEventListener('popstate', urlObserver);
        }
    }

    showSuccess(data) {
        const modal = document.getElementById('success-modal');
        const message = document.getElementById('success-message');
        
        if (modal && message) {
            message.innerHTML = `
                <strong>Message Sent Successfully!</strong><br><br>
                Thank you, ${data.name}! We've received your rental request for ${data.desiredDate} and will get back to you soon.<br><br>
                <strong>What happens next:</strong><br>
                • We'll review your request within 24 hours<br>
                • You'll receive a response at ${data.email}<br>
                • For urgent matters, please call ${companyInfo.phone}<br><br>
                We appreciate your interest in ${companyInfo.name}!
            `;
            modal.classList.add('show');
        }
    }

    showInlineSuccess(data) {
        // Create or update success message container
        let successContainer = this.form.querySelector('.form-success');
        
        if (!successContainer) {
            successContainer = document.createElement('div');
            successContainer.className = 'form-success';
            successContainer.style.cssText = `
                background: #d4edda;
                color: #155724;
                padding: 1rem;
                border-radius: 5px;
                margin-bottom: 1rem;
                border: 1px solid #c3e6cb;
                text-align: center;
                font-weight: bold;
                font-size: 1.1rem;
            `;
            this.form.insertBefore(successContainer, this.form.firstChild);
        }
        
        successContainer.innerHTML = `✅ Successfully sent!`;
        
        // Scroll to the success message
        successContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    showError(errorMessage) {
        // Create or update error display
        let errorContainer = this.form.querySelector('.form-error');
        
        if (!errorContainer) {
            errorContainer = document.createElement('div');
            errorContainer.className = 'form-error';
            errorContainer.style.cssText = `
                background: #f8d7da;
                color: #721c24;
                padding: 1rem;
                border-radius: 5px;
                margin-bottom: 1rem;
                border: 1px solid #f5c6cb;
            `;
            this.form.insertBefore(errorContainer, this.form.firstChild);
        }
        
        errorContainer.textContent = errorMessage;
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (errorContainer.parentNode) {
                errorContainer.remove();
            }
        }, 5000);
    }

    // Method to format phone number as user types (optional enhancement)
    formatPhoneNumber(input) {
        let value = input.value.replace(/\D/g, '');
        
        if (value.length >= 6) {
            value = value.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
        } else if (value.length >= 3) {
            value = value.replace(/(\d{3})(\d{3})/, '($1) $2');
        } else if (value.length > 0) {
            value = value.replace(/(\d{3})/, '($1');
        }
        
        input.value = value;
    }

    // Setup date picker with minimum date
    setupDatePicker() {
        const dateInput = document.getElementById('contact-date');
        if (dateInput) {
            // Set minimum date to today
            const today = new Date();
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const dd = String(today.getDate()).padStart(2, '0');
            const todayString = `${yyyy}-${mm}-${dd}`;
            
            dateInput.setAttribute('min', todayString);
            
            // Set placeholder text
            dateInput.setAttribute('placeholder', 'Select your desired rental date');
        }
    }
}

// Initialize contact manager
document.addEventListener('DOMContentLoaded', () => {
    window.ContactManager = new ContactManager();

    // Optional: Add phone number formatting
    const phoneInput = document.getElementById('contact-phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            if (window.ContactManager) {
                window.ContactManager.formatPhoneNumber(e.target);
            }
        });
    }
});