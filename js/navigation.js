// Navigation functionality - replaces React Router
class NavigationManager {
    constructor() {
        this.currentPage = 'home';
        this.init();
    }

    init() {
        // Set up navigation event listeners
        this.setupNavLinks();
        this.setupInitialPage();
        
        // Handle browser back/forward buttons
        window.addEventListener('popstate', (event) => {
            const page = event.state?.page || 'home';
            this.showPage(page, false);
        });
    }

    setupNavLinks() {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.getAttribute('data-page');
                this.showPage(page);
            });
        });
    }

    setupInitialPage() {
        // Check URL hash for initial page
        const hash = window.location.hash.substring(1);
        const page = hash || 'home';
        this.showPage(page, false);
    }

    showPage(pageName, updateHistory = true) {
        // Hide all pages
        const pages = document.querySelectorAll('.page');
        pages.forEach(page => {
            page.classList.remove('active');
        });

        // Show target page
        const targetPage = document.getElementById(`${pageName}-page`);
        if (targetPage) {
            targetPage.classList.add('active');
            this.currentPage = pageName;

            // Update URL and history
            if (updateHistory) {
                const url = `#${pageName}`;
                window.history.pushState({ page: pageName }, '', url);
            }

            // Update active nav link
            this.updateActiveNavLink(pageName);

            // Trigger page-specific initialization
            this.handlePageSpecificLogic(pageName);
        }
    }

    updateActiveNavLink(pageName) {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-page') === pageName) {
                link.classList.add('active');
            }
        });
    }

    handlePageSpecificLogic(pageName) {
        switch (pageName) {
            case 'home':
                if (window.BounceHouseManager) {
                    window.BounceHouseManager.renderFeaturedBounceHouses();
                }
                break;
            case 'bounce-houses':
                if (window.BounceHouseManager) {
                    window.BounceHouseManager.renderBounceHouses();
                    window.BounceHouseManager.setupFilters();
                }
                break;
            case 'bounce-house-detail':
                // This will be handled separately when viewing a specific bounce house
                break;
            case 'waiver':
                if (window.WaiverManager) {
                    window.WaiverManager.init();
                }
                break;
            case 'contact':
                if (window.ContactManager) {
                    window.ContactManager.init();
                }
                break;
        }
    }

    // Method to show bounce house detail page
    showBounceHouseDetail(bounceHouseId) {
        if (window.BounceHouseManager) {
            window.BounceHouseManager.renderBounceHouseDetail(bounceHouseId);
        }
        this.showPage('bounce-house-detail');
    }

    // Method to go back to previous page
    goBack() {
        window.history.back();
    }
}

// Global navigation function for use in HTML onclick handlers
function showPage(pageName) {
    if (window.navigationManager) {
        window.navigationManager.showPage(pageName);
    }
}

// Global function to show bounce house detail
function showBounceHouseDetail(id) {
    if (window.navigationManager) {
        window.navigationManager.showBounceHouseDetail(id);
    }
}

// Initialize navigation manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.navigationManager = new NavigationManager();
});