// Business Configuration - Update these values for your business
const businessConfig = {
    // Contact Information
    businessName: 'My Bounce Place',
    phone: '(385) 288-8065',
    email: 'noreply@mybounceplace.com',
    
    // Business Hours
    hours: 'Monday - Sunday, 8:00 AM - 8:00 PM',
    
    // Service Area
    serviceArea: 'Logan, Utah and surrounding areas',
    deliveryRadius: '20 miles',
    
    // Pricing
    dailyRate: 150,
    weeklyRate: 800,
    weekendRate: 200,
    depositAmount: 50,
    
    // Bounce House Details
    bounceHouseName: 'Princess Castle Bounce House with Slide',
    dimensions: '15ft x 15ft x 12ft',
    capacity: 'Up to 8 children (ages 3-12)',
    spaceRequired: '20ft x 20ft minimum area',
    setupTime: '30-45 minutes',
    
    // Payment Methods
    paymentMethods: ['Cash', 'Check', 'Credit Card'],
    
    // Social Media (optional)
    facebook: '', // Add your Facebook page URL
    instagram: '', // Add your Instagram handle
    googleBusiness: '', // Add your Google Business profile URL
    
    // Analytics (replace with your actual IDs)
    googleAnalyticsId: 'G-XXXXXXXXXX', // Replace with your GA4 ID
    emailjsPublicKey: 'YOUR_EMAILJS_PUBLIC_KEY', // Replace with your EmailJS key
    
    // SEO
    websiteUrl: 'https://mybounceplace.com',
    businessDescription: 'Premier princess castle bounce house rentals in Logan, Utah. Perfect for birthday parties and special events with delivery and setup included.',
    
    // Legal
    insurance: 'Fully insured and licensed',
    established: '2024'
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { businessConfig };
}