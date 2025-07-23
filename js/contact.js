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

        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        // Add input validation listeners
        this.setupInputListeners();
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
        const fields = ['name', 'email', 'message']; // phone is optional
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

        // Disable submit button
        const submitBtn = this.form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';

        try {
            // Since this is a static site, we'll save to localStorage and show success
            // In a real implementation, you might integrate with a service like Formspree or EmailJS
            
            // Save message to localStorage
            const existingMessages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
            const messageId = 'msg_' + Date.now();
            existingMessages.push({
                id: messageId,
                ...data
            });
            localStorage.setItem('contactMessages', JSON.stringify(existingMessages));

            // Show success message
            this.showSuccess(data);

            // Reset form
            this.form.reset();
            
            // Clear any remaining field errors
            const errorElements = this.form.querySelectorAll('.field-error');
            errorElements.forEach(el => el.remove());
            
            const fields = this.form.querySelectorAll('input, textarea');
            fields.forEach(field => {
                field.style.borderColor = '';
            });

        } catch (error) {
            console.error('Error submitting contact form:', error);
            this.showError('An error occurred while sending your message. Please try again or call us directly.');
        } finally {
            // Re-enable submit button
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }

    showSuccess(data) {
        const modal = document.getElementById('success-modal');
        const message = document.getElementById('success-message');
        
        if (modal && message) {
            message.innerHTML = `
                <strong>Message Sent Successfully!</strong><br><br>
                Thank you, ${data.name}! We've received your message and will get back to you soon.<br><br>
                <strong>What happens next:</strong><br>
                • We'll review your message within 24 hours<br>
                • You'll receive a response at ${data.email}<br>
                • For urgent matters, please call ${companyInfo.phone}<br><br>
                We appreciate your interest in ${companyInfo.name}!
            `;
            modal.classList.add('show');
        }
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