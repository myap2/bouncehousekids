import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import Company from '../src/models/Company';
import User from '../src/models/User';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

// Helper function to create test companies with all required fields
export const createTestCompany = async (overrides: any = {}) => {
  const defaultCompany = {
    name: 'Test Company',
    subdomain: 'test-company',
    email: 'test@company.com',
    phone: '123-456-7890',
    address: {
      street: '123 Test St',
      city: 'Test City',
      state: 'TS',
      zipCode: '12345'
    },
    paymentConfig: {
      stripePublicKey: 'pk_test_mock_public_key',
      stripeSecretKey: 'sk_test_mock_secret_key',
      stripeWebhookSecret: 'whsec_mock_webhook_secret'
    },
    emailConfig: {
      fromEmail: 'noreply@testcompany.com',
      fromName: 'Test Company'
    },
    isActive: true
  };

  return await Company.create({ ...defaultCompany, ...overrides });
};

// Helper function to create test users
export const createTestUser = async (overrides: any = {}) => {
  const defaultUser = {
    email: 'test@example.com',
    password: 'password123',
    firstName: 'Test',
    lastName: 'User',
    role: 'customer',
    phone: '123-456-7890',
    address: {
      street: '123 Test St',
      city: 'Test City',
      state: 'TS',
      zipCode: '12345'
    }
  };

  return await User.create({ ...defaultUser, ...overrides });
};

// Helper function to create test bounce houses
export const createTestBounceHouse = async (overrides: any = {}) => {
  const BounceHouse = require('../src/models/BounceHouse').default;
  
  const defaultBounceHouse = {
    name: 'Test Castle',
    description: 'A test bounce house',
    theme: 'castle',
    dimensions: {
      length: 15,
      width: 15,
      height: 12
    },
    capacity: {
      minAge: 3,
      maxAge: 12,
      maxWeight: 100,
      maxOccupants: 8
    },
    price: {
      daily: 150,
      weekly: 900,
      weekend: 200
    },
    images: ['image1.jpg', 'image2.jpg'],
    features: ['slide', 'basketball hoop'],
    company: overrides.company || '507f1f77bcf86cd799439011',
    isActive: true,
    rating: 4.5,
    reviews: []
  };

  return await BounceHouse.create({ ...defaultBounceHouse, ...overrides });
};

// Mock environment variables for testing
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.STRIPE_SECRET_KEY = 'sk_test_mock_stripe_key';
process.env.SENDGRID_API_KEY = 'test-sendgrid-key';
process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud';
process.env.CLOUDINARY_API_KEY = 'test-api-key';
process.env.CLOUDINARY_API_SECRET = 'test-api-secret';
process.env.AWS_ACCESS_KEY_ID = 'test-aws-key';
process.env.AWS_SECRET_ACCESS_KEY = 'test-aws-secret';
process.env.AWS_REGION = 'us-east-1';
process.env.S3_BUCKET_NAME = 'test-bucket';