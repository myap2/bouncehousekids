// Bounce House Data - converted from database to JavaScript arrays
const bounceHouses = [
    {
        id: '1',
        name: 'Princess Castle Bounce House',
        description: 'A magical princess castle perfect for little princesses! Features beautiful pink and purple colors, turrets, and plenty of bouncing space for royal fun.',
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
            'images/princess-castle-1.jpg'
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
        name: 'Superhero Adventure Arena',
        description: 'Calling all superheroes! This action-packed bounce house features superhero graphics and obstacles for an epic adventure.',
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
            'images/superhero-arena-1.jpg'
        ],
        features: [
            'Obstacle course',
            'Climbing wall',
            'Dual slides',
            'Basketball hoops',
            'Reinforced safety netting'
        ],
        rating: 4.9,
        isActive: true
    },
    {
        id: '3',
        name: 'Jungle Safari Adventure',
        description: 'Explore the wild with this jungle-themed bounce house! Features animal graphics and adventurous obstacles.',
        theme: 'Safari',
        dimensions: {
            length: 20,
            width: 15,
            height: 15
        },
        capacity: {
            minAge: 3,
            maxAge: 12,
            maxWeight: 160,
            maxOccupants: 12
        },
        price: {
            daily: 180,
            weekly: 950,
            weekend: 230
        },
        images: [
            'images/jungle-adventure-1.jpg'
        ],
        features: [
            'Animal graphics',
            'Tunnel crawl',
            'Slide',
            'Bouncing area',
            'Weather resistant'
        ],
        rating: 4.7,
        isActive: true
    },
    {
        id: '4',
        name: 'Pirate Ship Bouncer',
        description: 'Ahoy mateys! Set sail for fun with this pirate ship bounce house complete with mast and ship details.',
        theme: 'Pirate',
        dimensions: {
            length: 22,
            width: 12,
            height: 16
        },
        capacity: {
            minAge: 4,
            maxAge: 14,
            maxWeight: 170,
            maxOccupants: 8
        },
        price: {
            daily: 190,
            weekly: 1000,
            weekend: 240
        },
        images: [
            'images/pirate-ship-1.jpg'
        ],
        features: [
            'Ship mast design',
            'Pirate graphics',
            'Slide down the plank',
            'Treasure hunt area',
            'Crow\'s nest climbing'
        ],
        rating: 4.8,
        isActive: true
    },
    {
        id: '5',
        name: 'Sports Arena Combo',
        description: 'Perfect for sports lovers! Features basketball hoops, football toss, and soccer goals all in one bounce house.',
        theme: 'Sports',
        dimensions: {
            length: 25,
            width: 15,
            height: 14
        },
        capacity: {
            minAge: 5,
            maxAge: 16,
            maxWeight: 200,
            maxOccupants: 12
        },
        price: {
            daily: 200,
            weekly: 1100,
            weekend: 260
        },
        images: [
            'images/sports-arena-1.jpg'
        ],
        features: [
            'Multiple basketball hoops',
            'Football toss targets',
            'Soccer goals',
            'Bounce area',
            'Sports equipment included'
        ],
        rating: 4.9,
        isActive: true
    },
    {
        id: '6',
        name: 'Space Adventure Rocket',
        description: 'Blast off to fun! This space-themed bounce house features rocket ship design and cosmic graphics.',
        theme: 'Space',
        dimensions: {
            length: 16,
            width: 16,
            height: 18
        },
        capacity: {
            minAge: 3,
            maxAge: 12,
            maxWeight: 150,
            maxOccupants: 10
        },
        price: {
            daily: 185,
            weekly: 975,
            weekend: 235
        },
        images: [
            'images/space-adventure-1.jpg'
        ],
        features: [
            'Rocket ship design',
            'Space graphics',
            'Control panel play',
            'Slide',
            'LED lighting (optional)'
        ],
        rating: 4.6,
        isActive: true
    },
    {
        id: '7',
        name: 'Unicorn Dream Castle',
        description: 'Enter a magical world of unicorns and rainbows! Perfect for unicorn lovers with pastel colors and mystical design.',
        theme: 'Unicorn',
        dimensions: {
            length: 14,
            width: 14,
            height: 13
        },
        capacity: {
            minAge: 2,
            maxAge: 10,
            maxWeight: 120,
            maxOccupants: 8
        },
        price: {
            daily: 165,
            weekly: 875,
            weekend: 215
        },
        images: [
            'images/unicorn-castle-1.jpg'
        ],
        features: [
            'Unicorn graphics',
            'Rainbow slide',
            'Pastel colors',
            'Small bounce area',
            'Perfect for younger kids'
        ],
        rating: 4.8,
        isActive: true
    },
    {
        id: '8',
        name: 'Monster Truck Rally',
        description: 'Rev up the fun with this monster truck themed bounce house! Perfect for truck and car enthusiasts.',
        theme: 'Vehicles',
        dimensions: {
            length: 20,
            width: 14,
            height: 15
        },
        capacity: {
            minAge: 4,
            maxAge: 14,
            maxWeight: 180,
            maxOccupants: 10
        },
        price: {
            daily: 175,
            weekly: 925,
            weekend: 225
        },
        images: [
            'images/monster-truck-1.jpg'
        ],
        features: [
            'Monster truck graphics',
            'Racing theme',
            'Obstacle course',
            'Slide',
            'Sound effects (optional)'
        ],
        rating: 4.7,
        isActive: true
    },
    {
        id: '9',
        name: 'Under the Sea Adventure',
        description: 'Dive into underwater fun! Features sea creatures, coral reefs, and ocean-themed obstacles.',
        theme: 'Ocean',
        dimensions: {
            length: 18,
            width: 16,
            height: 14
        },
        capacity: {
            minAge: 3,
            maxAge: 12,
            maxWeight: 160,
            maxOccupants: 10
        },
        price: {
            daily: 170,
            weekly: 900,
            weekend: 220
        },
        images: [
            'images/under-sea-1.jpg'
        ],
        features: [
            'Ocean creature graphics',
            'Coral reef design',
            'Wave slide',
            'Fish tunnel',
            'Mermaid area'
        ],
        rating: 4.8,
        isActive: true
    },
    {
        id: '10',
        name: 'Dinosaur Discovery Land',
        description: 'Travel back in time with the dinosaurs! This prehistoric bounce house features realistic dinosaur graphics.',
        theme: 'Dinosaur',
        dimensions: {
            length: 19,
            width: 15,
            height: 16
        },
        capacity: {
            minAge: 4,
            maxAge: 14,
            maxWeight: 170,
            maxOccupants: 10
        },
        price: {
            daily: 180,
            weekly: 950,
            weekend: 230
        },
        images: [
            'images/dinosaur-land-1.jpg'
        ],
        features: [
            'Realistic dinosaur graphics',
            'Fossil dig area',
            'T-Rex slide',
            'Volcano climb',
            'Educational elements'
        ],
        rating: 4.9,
        isActive: true
    },
    {
        id: '11',
        name: 'Candy Land Sweet Shop',
        description: 'Satisfy your sweet tooth! This candy-themed bounce house looks like a giant candy store.',
        theme: 'Candy',
        dimensions: {
            length: 16,
            width: 14,
            height: 12
        },
        capacity: {
            minAge: 2,
            maxAge: 10,
            maxWeight: 140,
            maxOccupants: 8
        },
        price: {
            daily: 160,
            weekly: 850,
            weekend: 210
        },
        images: [
            'images/candy-land-1.jpg'
        ],
        features: [
            'Candy graphics',
            'Lollipop obstacles',
            'Gingerbread slide',
            'Sweet colors',
            'Candy cane arches'
        ],
        rating: 4.6,
        isActive: true
    },
    {
        id: '12',
        name: 'Fire Truck Rescue Station',
        description: 'Emergency fun ahead! This fire truck bounce house teaches kids about fire safety while they play.',
        theme: 'Emergency',
        dimensions: {
            length: 21,
            width: 13,
            height: 15
        },
        capacity: {
            minAge: 3,
            maxAge: 12,
            maxWeight: 160,
            maxOccupants: 9
        },
        price: {
            daily: 185,
            weekly: 975,
            weekend: 235
        },
        images: [
            'images/fire-truck-1.jpg'
        ],
        features: [
            'Fire truck design',
            'Rescue ladder',
            'Fire pole slide',
            'Emergency graphics',
            'Educational safety features'
        ],
        rating: 4.8,
        isActive: true
    },
    {
        id: '13',
        name: 'Tropical Paradise Island',
        description: 'Escape to the tropics! Features palm trees, tropical fish, and island paradise theme.',
        theme: 'Tropical',
        dimensions: {
            length: 17,
            width: 15,
            height: 13
        },
        capacity: {
            minAge: 3,
            maxAge: 12,
            maxWeight: 150,
            maxOccupants: 10
        },
        price: {
            daily: 170,
            weekly: 900,
            weekend: 220
        },
        images: [
            'images/tropical-island-1.jpg'
        ],
        features: [
            'Palm tree graphics',
            'Tropical fish design',
            'Island slide',
            'Beach ball pit (optional)',
            'Tiki hut entrance'
        ],
        rating: 4.7,
        isActive: true
    },
    {
        id: '14',
        name: 'Medieval Knight Castle',
        description: 'Brave knights and fair maidens welcome! This medieval castle features towers, flags, and royal crests.',
        theme: 'Medieval',
        dimensions: {
            length: 18,
            width: 16,
            height: 17
        },
        capacity: {
            minAge: 4,
            maxAge: 14,
            maxWeight: 180,
            maxOccupants: 10
        },
        price: {
            daily: 190,
            weekly: 1000,
            weekend: 240
        },
        images: [
            'images/medieval-castle-1.jpg'
        ],
        features: [
            'Castle towers',
            'Knight graphics',
            'Royal flags',
            'Drawbridge entrance',
            'Shield and sword decorations'
        ],
        rating: 4.8,
        isActive: true
    },
    {
        id: '15',
        name: 'Carnival Fun House',
        description: 'Step right up! This carnival-themed bounce house brings the circus to your backyard with bright colors and fun graphics.',
        theme: 'Carnival',
        dimensions: {
            length: 20,
            width: 16,
            height: 14
        },
        capacity: {
            minAge: 3,
            maxAge: 14,
            maxWeight: 170,
            maxOccupants: 12
        },
        price: {
            daily: 185,
            weekly: 975,
            weekend: 235
        },
        images: [
            'images/carnival-funhouse-1.jpg'
        ],
        features: [
            'Carnival graphics',
            'Circus tent design',
            'Ring toss games',
            'Clown decorations',
            'Festive colors'
        ],
        rating: 4.7,
        isActive: true
    }
];

// Theme categories for filtering
const themes = ['All', 'Princess', 'Superhero', 'Safari', 'Pirate', 'Sports', 'Space', 'Unicorn', 'Vehicles', 'Ocean', 'Dinosaur', 'Candy', 'Emergency', 'Tropical', 'Medieval', 'Carnival'];

// Company information
const companyInfo = {
    name: 'My Bounce Place',
    phone: '(385) 288-8065',
    email: 'noreply@mybounceplace.com',
    hours: 'Monday - Sunday, 8:00 AM - 8:00 PM',
    serviceArea: 'Logan, Utah and surrounding areas with free delivery and setup within 20 miles'
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
        answer: 'We require a deposit to secure your booking, with the balance due on the day of delivery. We accept cash, check, and major credit cards. Online payment is also available for your convenience.'
    },
    {
        question: 'Can I book multiple bounce houses?',
        answer: 'Absolutely! We offer package deals for multiple bounce house rentals. Contact us for special pricing on multiple units.'
    },
    {
        question: 'What age groups can use the bounce houses?',
        answer: 'Each bounce house has specific age and weight recommendations. Most accommodate children ages 3-14, but we have options for toddlers and older kids too.'
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