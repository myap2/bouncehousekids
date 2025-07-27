// Reviews Page Functionality
class ReviewsManager {
    constructor() {
        this.currentFilter = 'all';
        this.initializeReviews();
    }

    initializeReviews() {
        this.setupFilterButtons();
        this.setupReviewForm();
        this.setupModalHandling();
    }

    setupFilterButtons() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.filterReviews(e.target.dataset.filter);
                this.updateActiveButton(e.target);
            });
        });
    }

    filterReviews(filter) {
        this.currentFilter = filter;
        const reviewCards = document.querySelectorAll('.review-card');
        
        reviewCards.forEach(card => {
            let showCard = true;
            
            switch(filter) {
                case '5-star':
                    showCard = card.dataset.rating === '5';
                    break;
                case '4-star':
                    showCard = card.dataset.rating === '4';
                    break;
                case 'birthday':
                    showCard = card.dataset.category === 'birthday';
                    break;
                case 'school':
                    showCard = card.dataset.category === 'school';
                    break;
                case 'recent':
                    // Show reviews from last 3 months (simplified logic)
                    showCard = true; // For demo, show all recent reviews
                    break;
                default:
                    showCard = true;
            }
            
            card.style.display = showCard ? 'block' : 'none';
        });

        // Track filter usage in analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'review_filter', {
                event_category: 'engagement',
                event_label: filter,
                value: 1
            });
        }
    }

    updateActiveButton(activeButton) {
        // Remove active class from all buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Add active class to clicked button
        activeButton.classList.add('active');
    }

    setupReviewForm() {
        const form = document.getElementById('review-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitReview(form);
            });
        }
    }

    async submitReview(form) {
        const formData = new FormData(form);
        const reviewData = Object.fromEntries(formData);
        
        try {
            // Simulate review submission (replace with actual API call)
            await this.processReviewSubmission(reviewData);
            this.showReviewSuccess();
            form.reset();
            this.closeReviewForm();
        } catch (error) {
            this.showReviewError(error);
        }
    }

    async processReviewSubmission(reviewData) {
        // Simulate API call - replace with actual review system
        return new Promise((resolve) => {
            setTimeout(() => {
                // Track review submission in analytics
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'review_submission', {
                        event_category: 'engagement',
                        event_label: reviewData.rating + ' stars',
                        value: parseInt(reviewData.rating)
                    });
                }
                resolve(reviewData);
            }, 1000);
        });
    }

    showReviewSuccess() {
        const modal = document.getElementById('review-modal');
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px; text-align: center;">
                <h3>🎉 Thank You!</h3>
                <p>Your review has been submitted successfully.</p>
                <p>We appreciate you taking the time to share your experience with other families in Logan, Utah.</p>
                <button onclick="this.parentElement.parentElement.remove()" class="hero-button">Close</button>
            </div>
        `;
    }

    showReviewError(error) {
        const modal = document.getElementById('review-modal');
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px; text-align: center;">
                <h3>❌ Review Submission Error</h3>
                <p>Sorry, there was an issue submitting your review.</p>
                <p>Please try again or contact us directly at <a href="tel:+13852888065">(385) 288-8065</a></p>
                <button onclick="this.parentElement.parentElement.remove()" class="hero-button">Close</button>
            </div>
        `;
    }

    setupModalHandling() {
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('review-modal');
            if (e.target === modal) {
                this.closeReviewForm();
            }
        });

        // Close modal with escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeReviewForm();
            }
        });
    }
}

// Global functions for modal handling
function showReviewForm() {
    const modal = document.getElementById('review-modal');
    if (modal) {
        modal.style.display = 'block';
        
        // Track review form open in analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'review_form_open', {
                event_category: 'engagement',
                event_label: 'review_form',
                value: 1
            });
        }
    }
}

function closeReviewForm() {
    const modal = document.getElementById('review-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Initialize reviews manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.reviewsManager = new ReviewsManager();
    
    // Track page view
    if (typeof gtag !== 'undefined') {
        gtag('event', 'page_view', {
            page_title: 'Customer Reviews',
            page_location: window.location.href
        });
    }
});