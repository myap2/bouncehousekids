// Bounce House Data - converted from database to JavaScript arrays
const bounceHouses = [
    {
        id: '1',
        name: 'Bounce Castle with a Slide',
        description: 'A fantastic bounce castle perfect for all kids! Features a fun slide, bright colors, and plenty of bouncing space for hours of entertainment.',
        theme: 'Castle',
        dimensions: {
            length: 15,
            width: 15,
            height: 12
        },
        capacity: {
            minAge: 3,
            maxAge: 12,
            maxWeight: 150,
            maxOccupants: 8
        },
        price: {
            daily: 150,
            weekly: 800,
            weekend: 200
        },
        images: [
            'images/2025-08-16_13-53-15_509.jpeg',
            'images/2025-08-16_13-53-27_996.jpeg',
            'images/2025-08-16_13-53-32_339.jpeg',
            'images/2025-08-16_13-53-41_604.jpeg',
            'images/2025-08-16_13-53-51_371.jpeg'
        ],
        features: [
            'Slide included',
            'Basketball hoop',
            'Mesh safety walls',
            'Anchor points included'
        ],
        rating: 4.8,
        isActive: true
    }
];

// Theme categories for filtering
const themes = ['All', 'Castle'];

// Company information
const companyInfo = {
    name: 'My Bounce Place',
    phone: '(385) 288-8065',
    email: 'noreply@mybounceplace.com',
    hours: 'Monday - Sunday, 8:00 AM - 8:00 PM',
    serviceArea: 'Delivery & setup fee: $20 inside Cache Valley or within 15 miles of Logan; $50 outside Cache Valley'
};

// FAQ data
const faqData = [
    {
        question: 'How far in advance should I book?',
        answer: 'We recommend booking at least 2-3 weeks in advance, especially during peak season (spring and summer). However, we often have availability for last-minute bookings.'
    },
    {
        question: 'What\'s included in the rental?',
        answer: 'Our rental includes the bounce house, delivery, setup, takedown, and all necessary equipment (blower, stakes, extension cords). We also provide safety instructions and guidelines.'
    },
    {
        question: 'What if it rains on my event day?',
        answer: 'Safety is our priority. If there\'s severe weather, we\'ll work with you to reschedule at no additional charge. Light rain is usually not a problem for covered events.'
    },
    {
        question: 'How much space do I need?',
        answer: 'Space requirements vary by bounce house. Generally, you\'ll need the dimensions of the bounce house plus 3-5 feet on all sides for stakes and safety clearance.'
    },
    {
        question: 'Do you provide supervision?',
        answer: 'We provide setup and safety instructions, but adult supervision is required during use. We recommend having at least one responsible adult watching the children at all times.'
    },
    {
        question: 'What are your payment terms?',
        answer: 'We require a deposit to secure your booking, with the balance due on the day of delivery. We accept cash, check, major credit cards, and Venmo.'
    }
];

// Waiver template text
const waiverText = `BOUNCE HOUSE LIABILITY WAIVER

By signing, I acknowledge that using inflatable equipment involves risk. I agree to supervise all participants, follow safety rules, and stop use if conditions become unsafe.

I release and hold harmless My Bounce Place, its owners, employees, and agents from any claims arising from use of the equipment.

I am at least 18 years old (or the parent/guardian of the participant) and I sign this waiver voluntarily.

Date: ________________
Participant Name: __________________________
Signature: _________________________________`;

// Export data for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { bounceHouses, themes, companyInfo, faqData, waiverText };
}