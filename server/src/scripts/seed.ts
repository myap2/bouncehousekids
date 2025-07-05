import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Company from '../models/Company';
import User from '../models/User';
import BounceHouse from '../models/BounceHouse';
import bcrypt from 'bcryptjs';

// Load environment variables
dotenv.config();

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bouncehousekids');
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      Company.deleteMany({}),
      User.deleteMany({}),
      BounceHouse.deleteMany({})
    ]);
    console.log('Cleared existing data');

    // Create sample companies
    const companies = await Company.insertMany([
      {
        name: 'Bounce House Kids',
        subdomain: 'demo',
        email: 'info@bouncehousekids.com',
        phone: '(555) 123-4567',
        address: {
          street: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          zipCode: '12345'
        },
        branding: {
          primaryColor: '#4F46E5',
          secondaryColor: '#10B981',
          fontFamily: 'Inter, sans-serif'
        },
        paymentConfig: {
          stripePublicKey: 'pk_test_sample_key',
          stripeSecretKey: 'sk_test_sample_key',
          stripeWebhookSecret: 'whsec_sample_secret'
        },
        emailConfig: {
          fromEmail: 'noreply@bouncehousekids.com',
          fromName: 'Bounce House Kids'
        },
        plan: 'standard'
      },
      {
        name: 'Party Perfect Rentals',
        subdomain: 'partyperfect',
        email: 'info@partyperfect.com',
        phone: '(555) 987-6543',
        address: {
          street: '456 Oak Ave',
          city: 'Another City',
          state: 'TX',
          zipCode: '54321'
        },
        branding: {
          primaryColor: '#DC2626',
          secondaryColor: '#F59E0B',
          fontFamily: 'Roboto, sans-serif'
        },
        paymentConfig: {
          stripePublicKey: 'pk_test_another_key',
          stripeSecretKey: 'sk_test_another_key',
          stripeWebhookSecret: 'whsec_another_secret'
        },
        emailConfig: {
          fromEmail: 'noreply@partyperfect.com',
          fromName: 'Party Perfect Rentals'
        },
        plan: 'premium'
      }
    ]);

    console.log(`Created ${companies.length} companies`);

    // Create sample users
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const users = await User.insertMany([
      {
        email: 'admin@bouncehousekids.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        phone: '(555) 111-1111',
        address: {
          street: '123 Admin St',
          city: 'Admin City',
          state: 'CA',
          zipCode: '11111'
        }
      },
      {
        email: 'company@bouncehousekids.com',
        password: hashedPassword,
        firstName: 'Company',
        lastName: 'Admin',
        role: 'company-admin',
        phone: '(555) 222-2222',
        address: {
          street: '123 Company St',
          city: 'Company City',
          state: 'CA',
          zipCode: '22222'
        },
        company: companies[0]._id
      },
      {
        email: 'customer@bouncehousekids.com',
        password: hashedPassword,
        firstName: 'John',
        lastName: 'Customer',
        role: 'customer',
        phone: '(555) 333-3333',
        address: {
          street: '123 Customer St',
          city: 'Customer City',
          state: 'CA',
          zipCode: '33333'
        },
        company: companies[0]._id
      }
    ]);

    console.log(`Created ${users.length} users`);

    // Create sample bounce houses
    const bounceHouses = await BounceHouse.insertMany([
      {
        name: 'Princess Castle',
        description: 'A magical pink castle perfect for princess parties!',
        theme: 'Princess',
        dimensions: {
          length: 15,
          width: 15,
          height: 12
        },
        capacity: {
          minAge: 3,
          maxAge: 10,
          maxWeight: 200,
          maxOccupants: 8
        },
        price: {
          daily: 150,
          weekly: 800,
          weekend: 180
        },
        images: [
          'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
          'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400'
        ],
        features: [
          'Slide',
          'Climbing Wall',
          'Bounce Area',
          'Safety Netting',
          'Colorful Design'
        ],
        rating: 4.8,
        company: companies[0]._id
      },
      {
        name: 'Superhero Adventure',
        description: 'Action-packed bounce house for superhero fans!',
        theme: 'Superhero',
        dimensions: {
          length: 18,
          width: 12,
          height: 14
        },
        capacity: {
          minAge: 4,
          maxAge: 12,
          maxWeight: 250,
          maxOccupants: 10
        },
        price: {
          daily: 175,
          weekly: 950,
          weekend: 200
        },
        images: [
          'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=800',
          'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400'
        ],
        features: [
          'Obstacle Course',
          'Slide',
          'Climbing Wall',
          'Bounce Area',
          'Basketball Hoop'
        ],
        rating: 4.9,
        company: companies[0]._id
      },
      {
        name: 'Tropical Paradise',
        description: 'Bring the beach to your backyard with this tropical-themed bounce house!',
        theme: 'Tropical',
        dimensions: {
          length: 20,
          width: 15,
          height: 16
        },
        capacity: {
          minAge: 5,
          maxAge: 14,
          maxWeight: 300,
          maxOccupants: 12
        },
        price: {
          daily: 200,
          weekly: 1100,
          weekend: 240
        },
        images: [
          'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
          'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400'
        ],
        features: [
          'Water Slide',
          'Splash Area',
          'Climbing Wall',
          'Bounce Area',
          'Palm Tree Design'
        ],
        rating: 4.7,
        company: companies[0]._id
      },
      {
        name: 'Pirate Ship Adventure',
        description: 'Ahoy matey! Set sail for fun with this pirate-themed bounce house!',
        theme: 'Pirate',
        dimensions: {
          length: 22,
          width: 14,
          height: 18
        },
        capacity: {
          minAge: 4,
          maxAge: 12,
          maxWeight: 280,
          maxOccupants: 10
        },
        price: {
          daily: 185,
          weekly: 1000,
          weekend: 220
        },
        images: [
          'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800',
          'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400'
        ],
        features: [
          'Ship Design',
          'Slide',
          'Climbing Rope',
          'Bounce Area',
          'Treasure Chest'
        ],
        rating: 4.6,
        company: companies[1]._id
      }
    ]);

    console.log(`Created ${bounceHouses.length} bounce houses`);

    console.log('Database seeding completed successfully!');
    console.log('\nSample login credentials:');
    console.log('Admin: admin@bouncehousekids.com / password123');
    console.log('Company Admin: company@bouncehousekids.com / password123');
    console.log('Customer: customer@bouncehousekids.com / password123');

  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the seeding script
seedDatabase();