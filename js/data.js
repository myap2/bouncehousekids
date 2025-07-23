// Bounce House Data - converted from database to JavaScript arrays
const bounceHouses = [
    {
        id: '1',
        name: 'Princess Castle',
        description: 'A magical princess-themed bounce house perfect for making your little princess feel special. Features beautiful pink and purple colors with castle turrets and royal decorations.',
        theme: 'Princess',
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
            'images/princess-castle-1.jpg',
            'images/princess-castle-2.jpg'
        ],
        features: [
            'Slide included',
            'Basketball hoop',
            'Mesh safety walls',
            'Anchor points included'
        ],
        rating: 4.8,
        isActive: true
    },
    {
        id: '2',
        name: 'Superhero Arena',
        description: 'Action-packed superhero themed bounce house featuring your favorite comic book heroes. Perfect for superhero birthday parties and adventures.',
        theme: 'Superhero',
        dimensions: {
            length: 18,
            width: 15,
            height: 14
        },
        capacity: {
            minAge: 4,
            maxAge: 14,
            maxWeight: 180,
            maxOccupants: 10
        },
        price: {
            daily: 175,
            weekly: 900,
            weekend: 225
        },
        images: [
            'images/superhero-arena-1.jpg',
            'images/superhero-arena-2.jpg'
        ],
        features: [
            'Double slide',
            'Obstacle course',
            'Climbing wall',
            'Superhero graphics'
        ],
        rating: 4.9,
        isActive: true
    },
    {
        id: '3',
        name: 'Jungle Adventure',
        description: 'Wild jungle-themed bounce house with animal decorations and tropical colors. Great for animal lovers and safari-themed parties.',
        theme: 'Jungle',
        dimensions: {
            length: 16,
            width: 16,
            height: 13
        },
        capacity: {
            minAge: 3,
            maxAge: 12,
            maxWeight: 160,
            maxOccupants: 9
        },
        price: {
            daily: 160,
            weekly: 850,
            weekend: 210
        },
        images: [
            'images/jungle-adventure-1.jpg',
            'images/jungle-adventure-2.jpg'
        ],
        features: [
            'Animal graphics',
            'Tropical colors',
            'Safety net enclosure',
            'Easy setup'
        ],
        rating: 4.7,
        isActive: true
    },
    {
        id: '4',
        name: 'Pirate Ship Adventure',
        description: 'Ahoy matey! Set sail on a bouncing adventure with this incredible pirate ship bounce house. Complete with masts, sails, and treasure decorations.',
        theme: 'Pirate',
        dimensions: {
            length: 20,
            width: 12,
            height: 15
        },
        capacity: {
            minAge: 4,
            maxAge: 14,
            maxWeight: 170,
            maxOccupants: 8
        },
        price: {
            daily: 180,
            weekly: 950,
            weekend: 240
        },
        images: [
            'images/pirate-ship-1.jpg',
            'images/pirate-ship-2.jpg'
        ],
        features: [
            'Ship design',
            'Slide as gangplank',
            'Pirate decorations',
            'Treasure chest obstacle'
        ],
        rating: 4.8,
        isActive: true
    },
    {
        id: '5',
        name: 'Sports Arena',
        description: 'Perfect for sports enthusiasts! This bounce house features basketball hoops, soccer goals, and sports-themed decorations.',
        theme: 'Sports',
        dimensions: {
            length: 18,
            width: 18,
            height: 12
        },
        capacity: {
            minAge: 5,
            maxAge: 16,
            maxWeight: 200,
            maxOccupants: 12
        },
        price: {
            daily: 170,
            weekly: 900,
            weekend: 220
        },
        images: [
            'images/sports-arena-1.jpg',
            'images/sports-arena-2.jpg'
        ],
        features: [
            'Basketball hoops',
            'Soccer goals',
            'Sports graphics',
            'Large bouncing area'
        ],
        rating: 4.6,
        isActive: true
    },
    {
        id: '6',
        name: 'Space Adventure',
        description: 'Blast off to fun with this space-themed bounce house! Features rockets, planets, and astronaut decorations for an out-of-this-world experience.',
        theme: 'Space',
        dimensions: {
            length: 17,
            width: 15,
            height: 14
        },
        capacity: {
            minAge: 4,
            maxAge: 13,
            maxWeight: 175,
            maxOccupants: 9
        },
        price: {
            daily: 165,
            weekly: 875,
            weekend: 215
        },
        images: [
            'images/space-adventure-1.jpg',
            'images/space-adventure-2.jpg'
        ],
        features: [
            'Space theme graphics',
            'Rocket slide',
            'Planet decorations',
            'LED lighting effects'
        ],
        rating: 4.9,
        isActive: true
    }
];

// Theme categories for filtering
const themes = ['All', 'Princess', 'Superhero', 'Jungle', 'Pirate', 'Sports', 'Space'];

// Company information
const companyInfo = {
    name: 'My Bounce Place',
    phone: '(555) 123-4567',
    email: 'info@mybounceplace.com',
    hours: 'Monday - Sunday, 8:00 AM - 8:00 PM',
    serviceArea: 'Greater metropolitan area with free delivery and setup within 20 miles'
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
        answer: 'We require a deposit to secure your booking, with the balance due on the day of delivery. We accept cash, check, and major credit cards.'
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