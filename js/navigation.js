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
            // Clear URL parameters when using browser navigation
            if (window.location.search) {
                const cleanUrl = window.location.pathname + window.location.hash;
                window.history.replaceState(null, '', cleanUrl);
            }
            
            const page = event.state?.page || 'home';
            this.showPage(page, false);
        });
        
        // Ensure bounce houses are rendered if we're on that page
        setTimeout(() => {
            const activePage = document.querySelector('.page.active');
            if (activePage && activePage.id === 'bounce-houses-page') {
                if (window.BounceHouseManager) {
                    window.BounceHouseManager.renderBounceHouses();
                    window.BounceHouseManager.setupFilters();
                }
            }
        }, 100);
    }

    setupNavLinks() {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                
                // Handle external links (like blog.html, waiver-print.html, etc.)
                if (href && href.includes('.html')) {
                    // Allow normal navigation for external pages
                    return;
                }
                
                e.preventDefault();
                const page = link.getAttribute('data-page');
                this.showPage(page);
            });
        });
        
        // Setup brand link
        const brandLink = document.querySelector('.nav-brand-link');
        if (brandLink) {
            brandLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showPage('home');
            });
        }
    }

    setupInitialPage() {
        // Check URL hash for initial page
        const hash = window.location.hash.substring(1);
        let page = hash || 'home';
        
        // If no hash, try to detect current page from DOM
        if (!hash) {
            const activePage = document.querySelector('.page.active');
            if (activePage) {
                const pageId = activePage.id;
                if (pageId) {
                    page = pageId.replace('-page', '');
                }
            }
        }
        
        this.showPage(page, false);
    }

        showPage(pageName, updateHistory = true) {
        // Clear URL parameters when navigating to a new page
        if (updateHistory && window.location.search) {
            const cleanUrl = window.location.pathname + window.location.hash;
            window.history.replaceState(null, '', cleanUrl);
        }
        
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
                // If page is refreshed on detail view without context, redirect to bounce houses list
                const detailContent = document.getElementById('bounce-house-detail-content');
                if (detailContent && !detailContent.innerHTML.trim()) {
                    this.showPage('bounce-houses');
                }
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
            case 'pricing':
                // Pricing page doesn't need special initialization
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