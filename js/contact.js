console.log('📜 Contact.js file loaded successfully!');

// Contact Form Management - replaces server-side form processing
class ContactManager {
    constructor() {
        this.form = null;
    }

    init() {
        this.setupForm();
    }

    setupForm() {
        console.log('🔧 Setting up contact form...');
        
        this.form = document.getElementById('contact-form');
        if (!this.form) {
            console.log('❌ Contact form not found!');
            return;
        }
        
        console.log('✅ Contact form found:', this.form);

        // Remove any existing submit listeners
        this.form.removeEventListener('submit', this.handleSubmit);
        
        // Prevent default form submission to avoid redirecting and URL params
        this.form.addEventListener('submit', (e) => {
            console.log('📝 Form submit event triggered');
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            console.log('🛑 Default form submission prevented');
            this.handleSubmit();
            return false;
        });
        
        // Also prevent submit on button click
        const submitBtn = this.form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.addEventListener('click', (e) => {
                console.log('🔘 Submit button clicked');
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                console.log('🛑 Button click prevented');
                this.handleSubmit();
                return false;
            });
        }
        
        console.log('📋 Form submit listener added');

        // Add input validation listeners
        this.setupInputListeners();
        
        // Set minimum date to today
        this.setupDatePicker();
        
        console.log('✅ Form setup complete');
    }

    setupInputListeners() {
        console.log('🎯 Setting up input listeners...');
        
        const inputs = this.form.querySelectorAll('input, textarea');
        console.log(`📝 Found ${inputs.length} form inputs:`, inputs);
        
        inputs.forEach((input, index) => {
            console.log(`📋 Setting up input ${index + 1}:`, input.name, input.type);
            input.addEventListener('blur', () => {
                console.log(`🔍 Validating field: ${input.name}`);
                this.validateField(input);
            });
            input.addEventListener('input', () => {
                console.log(`🧹 Clearing error for field: ${input.name}`);
                this.clearFieldError(input);
            });
        });
        
        console.log('✅ Input listeners setup complete');
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

            case 'address':
                if (!value) {
                    errorMessage = 'Event address is required';
                    isValid = false;
                } else if (value.length < 10) {
                    errorMessage = 'Please provide a complete address';
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
        const fields = ['name', 'email', 'address', 'desiredDate', 'message']; // phone is optional
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
            address: formData.get('address')?.trim() || '',
            desiredDate: formData.get('desiredDate') || '',
            message: formData.get('message')?.trim() || '',
            timestamp: new Date().toISOString()
        };
    }

    async handleSubmit() {
        console.log('🚀 Form submission started');
        
        // Validate form
        if (!this.validateForm()) {
            console.log('❌ Form validation failed');
            return;
        }
        console.log('✅ Form validation passed');

        // Collect form data
        const data = this.collectFormData();
        console.log('📋 Collected form data:', data);

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
        console.log('🔒 Submit button disabled');

        // Save to localStorage first (always do this)
        const existingMessages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
        const messageId = 'msg_' + Date.now();
        existingMessages.push({
            id: messageId,
            ...data,
            status: 'sent'
        });
        localStorage.setItem('contactMessages', JSON.stringify(existingMessages));
        console.log('💾 Message saved to localStorage with ID:', messageId);

        try {
            // Try to send email automatically
            console.log('🔄 Attempting to send email...');
            const emailSent = await this.sendEmailAutomatically(data);
            
            if (emailSent) {
                console.log('✅ Email sent successfully!');
                // Show success message
                this.showInlineSuccess(data);
            } else {
                console.log('⚠️ Email failed, showing fallback options');
                // Show email options as fallback
                this.showEmailOptions(data);
            }
            
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
            console.error('Error in form submission:', error);
            this.showError('An error occurred. Please try again or call us directly.');
        } finally {
            // Re-enable submit button
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
            
            // Clean up URL observer
            window.removeEventListener('popstate', urlObserver);
        }
    }

    async sendEmailAutomatically(data) {
        try {
            console.log('📧 Starting email send process...');
            console.log('📋 Form data to send:', data);
            console.log('🔍 Data validation:');
            console.log('  - Name:', data.name ? '✅' : '❌');
            console.log('  - Email:', data.email ? '✅' : '❌');
            console.log('  - Address:', data.address ? '✅' : '❌');
            console.log('  - Date:', data.desiredDate ? '✅' : '❌');
            console.log('  - Message:', data.message ? '✅' : '❌');
            
            // Try using Formspree (free service) - using URLSearchParams format
            const formData = new URLSearchParams();
            formData.append('name', data.name);
            formData.append('email', data.email);
            formData.append('phone', data.phone);
            formData.append('address', data.address);
            formData.append('desiredDate', data.desiredDate);
            formData.append('message', data.message);
            formData.append('_subject', `Bounce House Rental Request - ${data.name}`);
            formData.append('_replyto', data.email);

            console.log('📤 Sending to Formspree URL: https://formspree.io/f/mgvzkqgp');
            console.log('📦 FormData contents:');
            for (let [key, value] of formData.entries()) {
                console.log(`  ${key}: ${value}`);
            }

            console.log('🌐 Making fetch request to Formspree...');
            console.log('📤 Request method: POST');
            console.log('📤 Request headers:', {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            });
            
            const response = await fetch('https://formspree.io/f/mgvzkqgp', {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json'
                }
            });

            console.log('📡 Formspree response received!');
            console.log('📡 Response status:', response.status);
            console.log('📡 Response statusText:', response.statusText);
            console.log('📡 Response ok:', response.ok);
            console.log('📡 Response type:', response.type);
            console.log('📡 Response headers:', response.headers);

            // Try to get response text for debugging
            try {
                const responseText = await response.text();
                console.log('📡 Formspree response body:', responseText);
            } catch (textError) {
                console.log('📡 Could not read response body:', textError);
            }

            if (response.ok) {
                console.log('✅ Email sent successfully via Formspree');
                return true;
            } else {
                console.log('❌ Formspree failed, status:', response.status);
                console.log('❌ Formspree failed, statusText:', response.statusText);
                return false;
            }
        } catch (error) {
            console.log('❌ Email sending failed with error:', error);
            console.log('❌ Error name:', error.name);
            console.log('❌ Error message:', error.message);
            console.log('❌ Error stack:', error.stack);
            return false;
        }
    }

    showEmailOptions(data) {
        // Create success message container
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
            `;
            this.form.insertBefore(successContainer, this.form.firstChild);
        }
        
        successContainer.innerHTML = `
            <strong>✅ Message Sent Successfully!</strong><br><br>
            Your message has been saved and we'll get back to you soon.<br><br>
            
            <div style="font-size: 0.9rem; margin-top: 10px;">
                <strong>Your message details:</strong><br>
                Name: ${data.name}<br>
                Email: ${data.email}<br>
                Address: ${data.address}<br>
                Date: ${data.desiredDate}<br>
                Message: ${data.message.substring(0, 100)}${data.message.length > 100 ? '...' : ''}
            </div>
        `;
        
        // Scroll to the success message
        successContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    async tryFormspree(data) {
        try {
            console.log('Attempting to send email via Formspree...');
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

            console.log('Formspree response status:', response.status);
            
            if (response.ok) {
                console.log('✅ Formspree email sent successfully');
                return true;
            } else {
                console.error('❌ Formspree failed:', response.status, response.statusText);
                return false;
            }
        } catch (error) {
            console.error('❌ Formspree error:', error);
            return false;
        }
    }

    async tryAlternativeEmail(data) {
        try {
            // Try EmailJS as alternative
            console.log('Attempting to send email via EmailJS...');
            
            // Check if EmailJS is loaded
            if (typeof emailjs === 'undefined') {
                console.log('EmailJS not loaded, loading it now...');
                await this.loadEmailJS();
            }
            
            const templateParams = {
                to_email: 'noreply@mybounceplace.com',
                from_name: data.name,
                from_email: data.email,
                from_phone: data.phone || 'Not provided',
                desired_date: data.desiredDate,
                message: data.message,
                subject: `Bounce House Rental Request - ${data.name}`
            };

            // You'll need to replace these with your actual EmailJS service and template IDs
            const result = await emailjs.send(
                'service_mybounceplace', // Replace with your EmailJS service ID
                'template_contact_form', // Replace with your EmailJS template ID
                templateParams
            );

            console.log('✅ EmailJS email sent successfully:', result);
            return true;
        } catch (error) {
            console.error('❌ EmailJS error:', error);
            return false;
        }
    }

    async loadEmailJS() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
            script.onload = () => {
                emailjs.init('YOUR_EMAILJS_USER_ID'); // Replace with your EmailJS user ID
                resolve();
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    showFallbackOptions(data) {
        // Create fallback message container
        let fallbackContainer = this.form.querySelector('.form-fallback');
        
        if (!fallbackContainer) {
            fallbackContainer = document.createElement('div');
            fallbackContainer.className = 'form-fallback';
            fallbackContainer.style.cssText = `
                background: #fff3cd;
                color: #856404;
                padding: 1rem;
                border-radius: 5px;
                margin-bottom: 1rem;
                border: 1px solid #ffeaa7;
                text-align: center;
            `;
            this.form.insertBefore(fallbackContainer, this.form.firstChild);
        }
        
        fallbackContainer.innerHTML = `
            <strong>📧 Email Sent Successfully!</strong><br><br>
            Your message has been saved and we'll get back to you soon.<br><br>
            
            <div style="font-size: 0.9rem; margin-top: 10px;">
                <strong>Your message details:</strong><br>
                Name: ${data.name}<br>
                Email: ${data.email}<br>
                Address: ${data.address}<br>
                Date: ${data.desiredDate}<br>
                Message: ${data.message.substring(0, 100)}${data.message.length > 100 ? '...' : ''}
            </div>
        `;
        
        // Scroll to the fallback message
        fallbackContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
    console.log('🚀 DOM Content Loaded - Initializing Contact Manager');
    
    // Test if form exists
    const testForm = document.getElementById('contact-form');
    console.log('🔍 Form found on DOMContentLoaded:', testForm);
    
    window.ContactManager = new ContactManager();
    console.log('📦 ContactManager instance created');
    
    window.ContactManager.init(); // Initialize the contact manager
    console.log('✅ ContactManager initialized');

    // Optional: Add phone number formatting
    const phoneInput = document.getElementById('contact-phone');
    if (phoneInput) {
        console.log('📞 Phone input found, adding formatting');
        phoneInput.addEventListener('input', (e) => {
            if (window.ContactManager) {
                window.ContactManager.formatPhoneNumber(e.target);
            }
        });
    } else {
        console.log('⚠️ Phone input not found');
    }
    
    console.log('🎯 Contact form setup complete');
});