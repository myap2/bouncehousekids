// Performance Optimization for My Bounce Place
class PerformanceOptimizer {
    constructor() {
        this.initializeOptimizations();
    }

    initializeOptimizations() {
        this.setupLazyLoading();
        this.setupImageOptimization();
        this.setupCaching();
        this.setupAnalytics();
        this.setupErrorTracking();
    }

    setupLazyLoading() {
        // Lazy load images
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }

    setupImageOptimization() {
        // Optimize images based on device capabilities
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            // Add loading="lazy" for better performance
            if (!img.loading) {
                img.loading = 'lazy';
            }
            
            // Add error handling
            img.addEventListener('error', () => {
                img.src = '/images/placeholder.jpg';
            });
        });
    }

    setupCaching() {
        // Cache frequently accessed data
        this.cache = new Map();
        
        // Cache bounce house data
        if (window.bounceHousesData) {
            this.cache.set('bounceHouses', window.bounceHousesData);
        }
    }

    setupAnalytics() {
        // Performance monitoring
        if ('performance' in window) {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const perfData = performance.getEntriesByType('navigation')[0];
                    
                    // Track page load performance
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'timing_complete', {
                            name: 'load',
                            value: Math.round(perfData.loadEventEnd - perfData.loadEventStart),
                            event_category: 'JS Dependencies'
                        });
                    }
                }, 0);
            });
        }
    }

    setupErrorTracking() {
        // Global error handler
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            
            // Track errors in analytics
            if (typeof gtag !== 'undefined') {
                gtag('event', 'exception', {
                    description: event.error?.message || 'Unknown error',
                    fatal: false
                });
            }
        });

        // Unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            
            // Track promise rejections in analytics
            if (typeof gtag !== 'undefined') {
                gtag('event', 'exception', {
                    description: 'Unhandled promise rejection: ' + event.reason,
                    fatal: false
                });
            }
        });
    }

    // Preload critical resources
    preloadResources() {
        const criticalResources = [
            '/css/styles.css',
            '/js/app.js',
            '/images/princess-castle-1.jpg'
        ];

        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource;
            link.as = resource.endsWith('.css') ? 'style' : 
                     resource.endsWith('.js') ? 'script' : 'image';
            document.head.appendChild(link);
        });
    }

    // Optimize form submissions
    optimizeForms() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            // Add debouncing to form inputs
            const inputs = form.querySelectorAll('input, textarea');
            inputs.forEach(input => {
                let timeout;
                input.addEventListener('input', () => {
                    clearTimeout(timeout);
                    timeout = setTimeout(() => {
                        // Auto-save form data to localStorage
                        this.saveFormData(form);
                    }, 1000);
                });
            });
        });
    }

    saveFormData(form) {
        const formData = new FormData(form);
        const data = {};
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        localStorage.setItem(`form_${form.id}`, JSON.stringify(data));
    }

    restoreFormData(form) {
        const saved = localStorage.getItem(`form_${form.id}`);
        if (saved) {
            const data = JSON.parse(saved);
            Object.keys(data).forEach(key => {
                const input = form.querySelector(`[name="${key}"]`);
                if (input) {
                    input.value = data[key];
                }
            });
        }
    }

    // Optimize navigation
    optimizeNavigation() {
        // Prefetch pages on hover
        const navLinks = document.querySelectorAll('a[href]');
        navLinks.forEach(link => {
            link.addEventListener('mouseenter', () => {
                const href = link.getAttribute('href');
                if (href && !href.startsWith('#') && !href.startsWith('http')) {
                    this.prefetchPage(href);
                }
            });
        });
    }

    prefetchPage(url) {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        document.head.appendChild(link);
    }

    // Monitor Core Web Vitals
    monitorCoreWebVitals() {
        if ('PerformanceObserver' in window) {
            // Monitor Largest Contentful Paint (LCP)
            const lcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'largest_contentful_paint', {
                        value: Math.round(lastEntry.startTime),
                        event_category: 'Web Vitals'
                    });
                }
            });
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

            // Monitor First Input Delay (FID)
            const fidObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'first_input_delay', {
                            value: Math.round(entry.processingStart - entry.startTime),
                            event_category: 'Web Vitals'
                        });
                    }
                });
            });
            fidObserver.observe({ entryTypes: ['first-input'] });

            // Monitor Cumulative Layout Shift (CLS)
            const clsObserver = new PerformanceObserver((list) => {
                let clsValue = 0;
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                });
                
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'cumulative_layout_shift', {
                        value: Math.round(clsValue * 1000) / 1000,
                        event_category: 'Web Vitals'
                    });
                }
            });
            clsObserver.observe({ entryTypes: ['layout-shift'] });
        }
    }
}

// Initialize performance optimizations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.performanceOptimizer = new PerformanceOptimizer();
    
    // Preload critical resources
    window.performanceOptimizer.preloadResources();
    
    // Optimize forms
    window.performanceOptimizer.optimizeForms();
    
    // Optimize navigation
    window.performanceOptimizer.optimizeNavigation();
    
    // Monitor Core Web Vitals
    window.performanceOptimizer.monitorCoreWebVitals();
});