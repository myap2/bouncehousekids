// Bounce House Data - converted from database to JavaScript arrays
const bounceHouses = [
    {
        id: '1',
        name: 'Princess Castle Bounce House with Slide',
        description: 'Our beautiful princess castle bounce house is perfect for birthday parties and special events! Features a fun slide, bright pink and purple colors, and plenty of bouncing space for hours of entertainment. This castle-themed bounce house creates a magical experience that kids absolutely love.',
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
            'images/princess-castle-1.jpg'
        ],
        features: [
            'Fun slide included',
            'Basketball hoop for extra fun',
            'Mesh safety walls for visibility',
            'Anchor points and stakes included',
            'Commercial-grade blower',
            'Extension cords provided',
            'Easy setup and takedown',
            'Perfect for 3-12 year olds'
        ],
        rating: 4.8,
        isActive: true,
        availability: 'Available for booking 7 days a week',
        setupTime: '30-45 minutes',
        spaceRequired: '20ft x 20ft minimum area'
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
    serviceArea: 'Logan, Utah and surrounding areas with free delivery and setup within 20 miles',
    speciality: 'Princess Castle Bounce House Rentals',
    established: '2024',
    insurance: 'Fully insured and licensed',
    cleaning: 'Professionally cleaned and sanitized after each rental'
};

// FAQ data
const faqData = [
    {
        question: 'How far in advance should I book?',
        answer: 'We recommend booking at least 2-3 weeks in advance, especially during peak season (spring and summer). Since we have one bounce house, availability can fill up quickly on weekends and holidays.'
    },
    {
        question: 'What\'s included in the rental?',
        answer: 'Our princess castle rental includes the bounce house, delivery, setup, takedown, commercial blower, stakes, extension cords, and safety instructions. Everything you need for a perfect party!'
    },
    {
        question: 'What if it rains on my event day?',
        answer: 'Safety is our priority. If there\'s severe weather, we\'ll work with you to reschedule at no additional charge. Light rain is usually not a problem for covered events.'
    },
    {
        question: 'How much space do I need?',
        answer: 'Our princess castle requires a minimum 20ft x 20ft area (15ft x 15ft bounce house plus 3-5 feet on all sides for stakes and safety clearance).'
    },
    {
        question: 'Do you provide supervision?',
        answer: 'We provide setup and safety instructions, but adult supervision is required during use. We recommend having at least one responsible adult watching the children at all times.'
    },
    {
        question: 'What are your payment terms?',
        answer: 'We require a $50 deposit to secure your booking, with the balance due on the day of delivery. We accept cash, check, and major credit cards.'
    },
    {
        question: 'How many kids can use the bounce house at once?',
        answer: 'Our princess castle can safely accommodate up to 8 children at once, ages 3-12 years old, with a maximum weight of 150 pounds per child.'
    },
    {
        question: 'How long does setup take?',
        answer: 'Setup typically takes 30-45 minutes. We arrive early to ensure everything is ready before your event starts.'
    }
];

// Waiver template text
const waiverText = `BOUNCE HOUSE LIABILITY WAIVER

I, the undersigned, acknowledge and fully understand that participation in bounce house activities involves risks of injury. I agree to assume all risks and hazards incidental to such participation, including but not limited to physical injury, property damage, or loss.

I hereby release, waive, discharge, and covenant not to sue My Bounce Place, its owners, employees, and agents from any and all liability, claims, demands, actions, and causes of action whatsoever arising out of or related to any loss, damage, or injury that may be sustained while using the bounce house equipment.

I certify that I am at least 18 years of age (or the parent/guardian of the participant) and have read and voluntarily sign this waiver and release of liability.

Date: ________________
Participant Name: __________________________
Signature: _________________________________`;

// Export data for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { bounceHouses, themes, companyInfo, faqData, waiverText };
}