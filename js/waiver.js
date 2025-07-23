// Waiver Form Management - replaces React waiver component
class WaiverManager {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.isDrawing = false;
        this.formData = {
            participantName: '',
            participantAge: 18,
            guardianName: '',
            guardianEmail: '',
            emergencyName: '',
            emergencyPhone: '',
            signature: '',
            agreeTerms: false
        };
        this.signatures = []; // Store signature data for localStorage
    }

    init() {
        this.setupCanvas();
        this.setupForm();
        this.setupModal();
        this.loadSelectedBounceHouse();
    }

    setupCanvas() {
        this.canvas = document.getElementById('signature-canvas');
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.setupCanvasEvents();
        this.setupCanvasStyles();
    }

    setupCanvasStyles() {
        if (!this.ctx) return;
        
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 2;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
    }

    setupCanvasEvents() {
        if (!this.canvas) return;

        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('mouseout', () => this.stopDrawing());

        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.canvas.dispatchEvent(mouseEvent);
        });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.canvas.dispatchEvent(mouseEvent);
        });

        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            const mouseEvent = new MouseEvent('mouseup', {});
            this.canvas.dispatchEvent(mouseEvent);
        });

        // Clear signature button
        const clearBtn = document.getElementById('clear-signature');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearSignature());
        }
    }

    startDrawing(e) {
        this.isDrawing = true;
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
    }

    draw(e) {
        if (!this.isDrawing) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
    }

    stopDrawing() {
        if (!this.isDrawing) return;
        this.isDrawing = false;
        
        // Save signature data
        this.formData.signature = this.canvas.toDataURL();
        this.clearError('signature');
    }

    clearSignature() {
        if (!this.ctx || !this.canvas) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.formData.signature = '';
    }

    setupForm() {
        const form = document.getElementById('waiver-form');
        if (!form) return;

        // Age input listener for guardian section
        const ageInput = document.getElementById('participant-age');
        if (ageInput) {
            ageInput.addEventListener('change', () => this.toggleGuardianSection());
        }

        // Form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        // Input validation listeners
        this.setupInputListeners();
    }

    setupInputListeners() {
        const inputs = [
            'participant-name',
            'participant-age',
            'guardian-name',
            'guardian-email',
            'emergency-name',
            'emergency-phone',
            'agree-terms'
        ];

        inputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('input', () => this.clearError(inputId));
                input.addEventListener('change', () => this.clearError(inputId));
            }
        });
    }

    toggleGuardianSection() {
        const ageInput = document.getElementById('participant-age');
        const guardianSection = document.getElementById('guardian-section');
        const signatureLabel = document.getElementById('signature-label');
        
        if (!ageInput || !guardianSection || !signatureLabel) return;

        const age = parseInt(ageInput.value);
        const isMinor = age < 18;

        guardianSection.style.display = isMinor ? 'block' : 'none';
        signatureLabel.textContent = isMinor ? 'Parent/Guardian Signature *' : 'Participant Signature *';

        // Update required fields
        const guardianInputs = guardianSection.querySelectorAll('input');
        guardianInputs.forEach(input => {
            input.required = isMinor;
        });
    }

    setupModal() {
        // Waiver agreement modal
        const viewBtn = document.getElementById('view-agreement-btn');
        const modal = document.getElementById('waiver-agreement-modal');
        const closeBtn = modal?.querySelector('.close');

        if (viewBtn && modal) {
            viewBtn.addEventListener('click', () => {
                modal.classList.add('show');
            });
        }

        if (closeBtn && modal) {
            closeBtn.addEventListener('click', () => {
                modal.classList.remove('show');
            });
        }

        // Close modal when clicking outside
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('show');
                }
            });
        }

        // Success modal close functionality
        const successModal = document.getElementById('success-modal');
        const successCloseBtn = successModal?.querySelector('.close');

        if (successCloseBtn && successModal) {
            successCloseBtn.addEventListener('click', () => {
                successModal.classList.remove('show');
            });
        }

        if (successModal) {
            successModal.addEventListener('click', (e) => {
                if (e.target === successModal) {
                    successModal.classList.remove('show');
                }
            });
        }
    }

    loadSelectedBounceHouse() {
        const selectedHouse = localStorage.getItem('selectedBounceHouse');
        if (selectedHouse) {
            const house = JSON.parse(selectedHouse);
            // You could pre-fill participant name or show which bounce house they're signing for
            console.log('Waiver for bounce house:', house.name);
        }
    }

    collectFormData() {
        const data = {
            participantName: document.getElementById('participant-name')?.value || '',
            participantAge: parseInt(document.getElementById('participant-age')?.value) || 18,
            guardianName: document.getElementById('guardian-name')?.value || '',
            guardianEmail: document.getElementById('guardian-email')?.value || '',
            emergencyName: document.getElementById('emergency-name')?.value || '',
            emergencyPhone: document.getElementById('emergency-phone')?.value || '',
            agreeTerms: document.getElementById('agree-terms')?.checked || false,
            signature: this.formData.signature
        };

        return data;
    }

    validateForm(data) {
        const errors = {};
        const isMinor = data.participantAge < 18;

        // Required field validation
        if (!data.participantName.trim()) {
            errors['participant-name'] = 'Participant name is required';
        }

        if (!data.participantAge || data.participantAge < 1) {
            errors['participant-age'] = 'Valid age is required';
        }

        if (isMinor && !data.guardianName.trim()) {
            errors['guardian-name'] = 'Parent/guardian name is required for minors';
        }

        if (isMinor && !data.guardianEmail.trim()) {
            errors['guardian-email'] = 'Parent/guardian email is required for minors';
        }

        if (!data.emergencyName.trim()) {
            errors['emergency-name'] = 'Emergency contact name is required';
        }

        if (!data.emergencyPhone.trim()) {
            errors['emergency-phone'] = 'Emergency contact phone is required';
        }

        if (!data.agreeTerms) {
            errors['agree-terms'] = 'You must agree to the terms to proceed';
        }

        if (!data.signature) {
            errors['signature'] = 'Signature is required';
        }

        return errors;
    }

    displayErrors(errors) {
        // Clear all existing errors first
        const errorElements = document.querySelectorAll('.error-message');
        errorElements.forEach(el => el.textContent = '');

        // Display new errors
        Object.keys(errors).forEach(field => {
            const errorElement = document.getElementById(`${field}-error`);
            if (errorElement) {
                errorElement.textContent = errors[field];
            }
        });
    }

    clearError(field) {
        const errorElement = document.getElementById(`${field}-error`);
        if (errorElement) {
            errorElement.textContent = '';
        }
    }

    async handleSubmit() {
        const data = this.collectFormData();
        const errors = this.validateForm(data);

        if (Object.keys(errors).length > 0) {
            this.displayErrors(errors);
            return;
        }

        // Clear any existing errors
        this.displayErrors({});

        try {
            // Since this is a static site, save to localStorage instead of server
            const waiverId = 'waiver_' + Date.now();
            const waiverRecord = {
                id: waiverId,
                ...data,
                timestamp: new Date().toISOString(),
                bounceHouse: JSON.parse(localStorage.getItem('selectedBounceHouse') || 'null')
            };

            // Save to localStorage
            const existingWaivers = JSON.parse(localStorage.getItem('waivers') || '[]');
            existingWaivers.push(waiverRecord);
            localStorage.setItem('waivers', JSON.stringify(existingWaivers));

            // Show success message
            this.showSuccess();

            // Reset form
            this.resetForm();

        } catch (error) {
            console.error('Error submitting waiver:', error);
            this.displayErrors({ submit: 'An error occurred while submitting the waiver' });
        }
    }

    showSuccess() {
        const modal = document.getElementById('success-modal');
        const message = document.getElementById('success-message');
        
        if (modal && message) {
            message.innerHTML = `
                <strong>Waiver Submitted Successfully!</strong><br><br>
                Your liability waiver has been completed and saved.<br><br>
                <strong>Next Steps:</strong><br>
                • Call us at ${companyInfo.phone} to confirm your booking<br>
                • We'll schedule delivery and setup for your event<br><br>
                Thank you for choosing ${companyInfo.name}!
            `;
            modal.classList.add('show');
        }
    }

    resetForm() {
        const form = document.getElementById('waiver-form');
        if (form) {
            form.reset();
        }

        this.clearSignature();
        this.toggleGuardianSection();
        
        // Clear any error messages
        this.displayErrors({});
    }
}

// Initialize waiver manager
document.addEventListener('DOMContentLoaded', () => {
    window.WaiverManager = new WaiverManager();
});