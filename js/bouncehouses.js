// Bounce House Management - replaces React components and state management
class BounceHouseManager {
    constructor() {
        this.filteredHouses = [...bounceHouses];
        this.currentFilter = '';
        this.currentTheme = 'All';
        this.currentBounceHouse = null;
    }

    // Render featured bounce houses on home page
    renderFeaturedBounceHouses() {
        const container = document.getElementById('featured-bounce-houses-grid');
        if (!container) return;

        // Show first 3 bounce houses as featured
        const featured = bounceHouses.slice(0, 3);
        
        container.innerHTML = featured.map(house => `
            <div class="bounce-house-card" onclick="showBounceHouseDetail('${house.id}')">
                <div class="bounce-house-image">
                    ${house.images[0] ? `<img src="${house.images[0]}" alt="${house.name}" onerror="this.parentElement.classList.add('placeholder'); this.style.display='none';">` : ''}
                </div>
                <div class="bounce-house-info">
                    <h3>${house.name}</h3>
                    <p class="theme">${house.theme}</p>
                    <p class="capacity">${house.capacity.maxOccupants} kids</p>
                    <p class="price">$${house.price.daily}/day</p>
                    <span class="view-details">View Details</span>
                </div>
            </div>
        `).join('');
    }

    // Render all bounce houses with filtering
    renderBounceHouses() {
        const container = document.getElementById('bounce-houses-grid');
        if (!container) return;

        container.innerHTML = this.filteredHouses.map(house => `
            <div class="bounce-house-card" onclick="showBounceHouseDetail('${house.id}')">
                <div class="bounce-house-image">
                    ${house.images[0] ? `<img src="${house.images[0]}" alt="${house.name}" onerror="this.parentElement.classList.add('placeholder'); this.style.display='none';">` : ''}
                </div>
                <div class="bounce-house-info">
                    <h3>${house.name}</h3>
                    <p class="theme">${house.theme}</p>
                    <p class="capacity">${house.capacity.maxOccupants} kids max</p>
                    <p class="price">$${house.price.daily}/day</p>
                    <span class="view-details">View Details</span>
                </div>
            </div>
        `).join('');
    }

    // Setup search and filter functionality
    setupFilters() {
        // Setup theme filters
        const themeContainer = document.getElementById('theme-filters');
        if (themeContainer) {
            themeContainer.innerHTML = themes.map(theme => `
                <button class="theme-button ${theme === this.currentTheme ? 'active' : ''}" 
                        onclick="window.BounceHouseManager.filterByTheme('${theme}')">
                    ${theme}
                </button>
            `).join('');
        }

        // Setup search input
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.value = this.currentFilter;
            searchInput.addEventListener('input', (e) => {
                this.filterBySearch(e.target.value);
            });
        }
    }

    // Filter by search term
    filterBySearch(searchTerm) {
        this.currentFilter = searchTerm.toLowerCase();
        this.applyFilters();
    }

    // Filter by theme
    filterByTheme(theme) {
        this.currentTheme = theme;
        this.applyFilters();
        
        // Update active theme button
        const themeButtons = document.querySelectorAll('.theme-button');
        themeButtons.forEach(button => {
            button.classList.remove('active');
            if (button.textContent.trim() === theme) {
                button.classList.add('active');
            }
        });
    }

    // Apply all filters
    applyFilters() {
        this.filteredHouses = bounceHouses.filter(house => {
            const matchesSearch = !this.currentFilter || 
                house.name.toLowerCase().includes(this.currentFilter) ||
                house.description.toLowerCase().includes(this.currentFilter) ||
                house.theme.toLowerCase().includes(this.currentFilter);
            
            const matchesTheme = this.currentTheme === 'All' || house.theme === this.currentTheme;
            
            return matchesSearch && matchesTheme && house.isActive;
        });

        this.renderBounceHouses();
    }

    // Render bounce house detail page
    renderBounceHouseDetail(bounceHouseId) {
        const house = bounceHouses.find(h => h.id === bounceHouseId);
        if (!house) return;

        this.currentBounceHouse = house;
        const container = document.getElementById('bounce-house-detail-content');
        if (!container) return;

        container.innerHTML = `
            <div class="bounce-house-detail">
                <button class="back-btn" onclick="window.navigationManager.goBack()">
                    ← Back to Bounce Houses
                </button>
                
                <div class="detail-images">
                    <div class="detail-main-image">
                        <img src="${house.images[0] || 'images/placeholder.jpg'}" 
                             alt="${house.name}" 
                             id="main-detail-image"
                             onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Cb3VuY2UgSG91c2UgSW1hZ2U8L3RleHQ+PC9zdmc+';">
                    </div>
                    ${house.images.length > 1 ? `
                        <div class="detail-thumbnails">
                            ${house.images.map((img, index) => `
                                <div class="detail-thumbnail ${index === 0 ? 'active' : ''}" 
                                     onclick="window.BounceHouseManager.switchImage('${img}', ${index})">
                                    <img src="${img}" alt="${house.name} ${index + 1}"
                                         onerror="this.parentElement.style.display='none';">
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>

                <div class="detail-info">
                    <div>
                        <h1>${house.name}</h1>
                        <p class="theme" style="font-size: 1.2rem; color: #007bff; margin-bottom: 1rem;">${house.theme} Theme</p>
                        <p style="margin-bottom: 2rem; line-height: 1.6;">${house.description}</p>
                        
                        <div class="detail-specs">
                            <h3 style="margin-bottom: 1rem;">Specifications</h3>
                            <div class="spec-item">
                                <span class="spec-label">Dimensions:</span>
                                <span class="spec-value">${house.dimensions.length}' × ${house.dimensions.width}' × ${house.dimensions.height}'</span>
                            </div>
                            <div class="spec-item">
                                <span class="spec-label">Age Range:</span>
                                <span class="spec-value">${house.capacity.minAge} - ${house.capacity.maxAge} years</span>
                            </div>
                            <div class="spec-item">
                                <span class="spec-label">Max Occupants:</span>
                                <span class="spec-value">${house.capacity.maxOccupants} children</span>
                            </div>
                            <div class="spec-item">
                                <span class="spec-label">Max Weight:</span>
                                <span class="spec-value">${house.capacity.maxWeight} lbs per child</span>
                            </div>
                            <div class="spec-item">
                                <span class="spec-label">Rating:</span>
                                <span class="spec-value">${house.rating}/5 ⭐</span>
                            </div>
                        </div>

                        ${house.features && house.features.length > 0 ? `
                            <div style="margin-top: 2rem;">
                                <h3>Features</h3>
                                <ul style="margin-top: 1rem; margin-left: 1.5rem;">
                                    ${house.features.map(feature => `<li style="margin-bottom: 0.5rem;">${feature}</li>`).join('')}
                                </ul>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="booking-section">
                        <h3>Book This Bounce House</h3>
                        <div class="price-display">$${house.price.daily}/day</div>
                        <p style="margin-bottom: 1rem; color: #666;">Weekend: $${house.price.weekend}</p>
                        <button class="book-now-btn" onclick="window.BounceHouseManager.bookBounceHouse('${house.id}')">
                            Book Now
                        </button>
                        <p style="margin-top: 1rem; font-size: 0.9rem; color: #666;">
                            Call ${companyInfo.phone} or fill out our waiver to get started!
                        </p>
                    </div>
                </div>
            </div>
        `;
    }

    // Switch main image in detail view
    switchImage(imageSrc, index) {
        const mainImage = document.getElementById('main-detail-image');
        if (mainImage) {
            mainImage.src = imageSrc;
        }

        // Update active thumbnail
        const thumbnails = document.querySelectorAll('.detail-thumbnail');
        thumbnails.forEach((thumb, i) => {
            thumb.classList.toggle('active', i === index);
        });
    }

    // Handle booking action
    bookBounceHouse(bounceHouseId) {
        const house = bounceHouses.find(h => h.id === bounceHouseId);
        if (!house) return;

        // Store the selected bounce house for the waiver
        localStorage.setItem('selectedBounceHouse', JSON.stringify(house));
        
        // Show success message with next steps
        this.showBookingModal(house);
    }

    // Show booking information modal
    showBookingModal(house) {
        const modal = document.getElementById('success-modal');
        const message = document.getElementById('success-message');
        
        if (modal && message) {
            message.innerHTML = `
                <strong>Great choice!</strong> You've selected the ${house.name}.<br><br>
                <strong>Next Steps:</strong><br>
                1. <a href="#" onclick="showPage('waiver')" style="color: #007bff;">Complete the waiver form</a><br>
                2. Call us at ${companyInfo.phone} to confirm your booking<br>
                3. We'll handle delivery, setup, and pickup!<br><br>
                <em>Price: $${house.price.daily}/day</em>
            `;
            modal.classList.add('show');
        }
    }
}

// Initialize bounce house manager
document.addEventListener('DOMContentLoaded', () => {
    window.BounceHouseManager = new BounceHouseManager();
});