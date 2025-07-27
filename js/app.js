// Main Application Initialization - replaces React App component
class App {
    constructor() {
        this.isInitialized = false;
    }

    init() {
        if (this.isInitialized) return;
        
        this.setupGlobalEvents();
        this.loadInitialData();
        this.isInitialized = true;
    }

    setupGlobalEvents() {
        // Global escape key handler for modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });

        // Handle mobile navigation toggle if needed
        this.setupMobileNavigation();

        // Handle browser resize events
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Handle network status changes (for potential future features)
        window.addEventListener('online', () => {
            // Connection restored
        });

        window.addEventListener('offline', () => {
            // Connection lost
        });
    }

    setupMobileNavigation() {
        // If we need a mobile hamburger menu in the future
        const navMenu = document.querySelector('.nav-menu');
        if (navMenu && window.innerWidth <= 768) {
            // Mobile navigation enhancements could go here
        }
    }

    closeAllModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.classList.remove('show');
        });
    }

    handleResize() {
        // Handle any responsive adjustments
        const canvas = document.getElementById('signature-canvas');
        if (canvas) {
            // Adjust canvas size for mobile if needed
            const maxWidth = Math.min(600, window.innerWidth - 40);
            canvas.style.width = maxWidth + 'px';
        }
    }

    loadInitialData() {
        // Pre-load any necessary data
        this.preloadImages();
        this.setupErrorHandlers();
    }

    preloadImages() {
        // Set up a mutation observer to handle dynamically added images
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const images = node.querySelectorAll ? node.querySelectorAll('img') : [];
                        if (node.tagName === 'IMG') {
                            images.push(node);
                        }
                        
                        images.forEach(img => {
                            if (!img.dataset.errorHandled && img.src.includes('images/')) {
                                img.addEventListener('error', this.handleImageError);
                                img.dataset.errorHandled = 'true';
                            }
                        });
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    handleImageError(event) {
        const img = event.target;
        const parent = img.parentElement;
        
        // Hide the broken image
        img.style.display = 'none';
        
        // Add placeholder styling to parent only if it's a bounce house image
        if (parent && parent.classList.contains('bounce-house-image')) {
            parent.classList.add('placeholder');
        }
    }

    setupErrorHandlers() {
        // Global error handler
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            
            // Don't show error messages for missing images
            if (event.filename && event.filename.includes('images/')) {
                return;
            }
            
            // For other errors, you might want to show a user-friendly message
            this.showGlobalError('Something went wrong. Please refresh the page and try again.');
        });

        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            event.preventDefault(); // Prevent default browser handling
        });
    }

    showGlobalError(message) {
        // Create a global error notification
        let errorNotification = document.getElementById('global-error');
        
        if (!errorNotification) {
            errorNotification = document.createElement('div');
            errorNotification.id = 'global-error';
            errorNotification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #f8d7da;
                color: #721c24;
                padding: 1rem;
                border-radius: 5px;
                border: 1px solid #f5c6cb;
                z-index: 10000;
                max-width: 300px;
                box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            `;
            document.body.appendChild(errorNotification);
        }
        
        errorNotification.innerHTML = `
            <strong>Error:</strong> ${message}
            <button onclick="this.parentElement.remove()" style="float: right; background: none; border: none; color: #721c24; cursor: pointer; font-size: 18px; line-height: 1; margin-left: 10px;">&times;</button>
        `;
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (errorNotification.parentNode) {
                errorNotification.remove();
            }
        }, 5000);
    }

    // Utility method to format currency
    static formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    // Utility method to format phone numbers
    static formatPhoneNumber(phone) {
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 10) {
            return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
        } else if (cleaned.length === 11 && cleaned[0] === '1') {
            return cleaned.replace(/(\d{1})(\d{3})(\d{3})(\d{4})/, '$1 ($2) $3-$4');
        }
        return phone;
    }

    // Utility method to validate email
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Method to show loading state
    static showLoading(element, text = 'Loading...') {
        if (!element) return;
        
        element.dataset.originalContent = element.innerHTML;
        element.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                <div style="width: 16px; height: 16px; border: 2px solid #f3f3f3; border-top: 2px solid #007bff; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                ${text}
            </div>
        `;
        element.disabled = true;
    }

    // Method to hide loading state
    static hideLoading(element) {
        if (!element || !element.dataset.originalContent) return;
        
        element.innerHTML = element.dataset.originalContent;
        element.disabled = false;
        delete element.dataset.originalContent;
    }

    // Method to get data from localStorage with error handling
    static getLocalStorageData(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.error(`Error reading localStorage key "${key}":`, error);
            return defaultValue;
        }
    }

    // Method to save data to localStorage with error handling
    static setLocalStorageData(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error(`Error saving to localStorage key "${key}":`, error);
            return false;
        }
    }

    // Method to debounce function calls (useful for search)
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Add CSS for loading animation
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
    
    // Make app instance globally available
    window.MyBounceApp = app;
});

// Make utility methods globally available
window.AppUtils = {
    formatCurrency: App.formatCurrency,
    formatPhoneNumber: App.formatPhoneNumber,
    isValidEmail: App.isValidEmail,
    showLoading: App.showLoading,
    hideLoading: App.hideLoading,
    getLocalStorageData: App.getLocalStorageData,
    setLocalStorageData: App.setLocalStorageData,
    debounce: App.debounce
};