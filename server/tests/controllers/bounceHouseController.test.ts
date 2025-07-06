import request from 'supertest';
import express from 'express';
import BounceHouse from '../../src/models/BounceHouse';
import Company from '../../src/models/Company';
import User from '../../src/models/User';
import { 
  createBounceHouse,
  getBounceHouses,
  getBounceHouseById,
  updateBounceHouse,
  deleteBounceHouse,
  addReview,
  getMyCompanyBounceHouses,
  searchBounceHousesByLocation
} from '../../src/controllers/bounceHouseController';
import { auth } from '../../src/middleware/auth';
import * as locationService from '../../src/services/locationService';

// Mock middleware and services
jest.mock('../../src/middleware/auth');
jest.mock('../../src/services/locationService');

const app = express();
app.use(express.json());

// Setup routes
app.post('/api/bounce-houses', auth, createBounceHouse);
app.get('/api/bounce-houses', getBounceHouses);
app.get('/api/bounce-houses/search', searchBounceHousesByLocation);
app.get('/api/bounce-houses/my-company', auth, getMyCompanyBounceHouses);
app.get('/api/bounce-houses/:id', getBounceHouseById);
app.put('/api/bounce-houses/:id', auth, updateBounceHouse);
app.delete('/api/bounce-houses/:id', auth, deleteBounceHouse);
app.post('/api/bounce-houses/:id/reviews', auth, addReview);

describe('Bounce House Controller', () => {
  let company: any;
  let company2: any;
  let mockUser: any;
  let mockAdmin: any;
  let mockCompanyAdmin: any;
  let bounceHouse: any;
  let bounceHouse2: any;

  beforeEach(async () => {
    // Create test companies
    company = await Company.create({
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
      location: {
        type: 'Point',
        coordinates: [-74.0060, 40.7128] // New York coordinates
      },
      settings: {
        deliveryRadius: 25,
        requiresDeposit: false,
        depositAmount: 0,
        cancellationPolicy: 'Standard'
      }
    });

    company2 = await Company.create({
      name: 'Test Company 2',
      subdomain: 'test-company-2',
      email: 'test2@company.com',
      phone: '987-654-3210',
      address: {
        street: '456 Test Ave',
        city: 'Test City 2',
        state: 'TS',
        zipCode: '54321'
      },
      location: {
        type: 'Point',
        coordinates: [-118.2437, 34.0522] // Los Angeles coordinates
      },
      settings: {
        deliveryRadius: 30,
        requiresDeposit: true,
        depositAmount: 100,
        cancellationPolicy: 'Strict'
      }
    });

    // Create test users
    mockUser = await User.create({
      email: 'user@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      role: 'user',
      company: company._id
    });

    mockAdmin = await User.create({
      email: 'admin@example.com',
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin'
    });

    mockCompanyAdmin = await User.create({
      email: 'company-admin@example.com',
      password: 'company123',
      firstName: 'Company',
      lastName: 'Admin',
      role: 'company-admin',
      company: company._id
    });

    // Create test bounce houses
    bounceHouse = await BounceHouse.create({
      name: 'Super Fun Castle',
      description: 'A magical castle bounce house',
      theme: 'princess',
      dimensions: {
        length: 15,
        width: 15,
        height: 12
      },
      capacity: {
        maxOccupants: 8,
        ageRange: '3-12'
      },
      price: {
        daily: 150,
        weekly: 900,
        monthly: 3000
      },
      images: ['image1.jpg', 'image2.jpg'],
      features: ['slide', 'basketball hoop', 'obstacle course'],
      company: company._id,
      isActive: true,
      rating: 4.5,
      reviews: []
    });

    bounceHouse2 = await BounceHouse.create({
      name: 'Pirate Ship Adventure',
      description: 'Ahoy matey! A pirate-themed bounce house',
      theme: 'pirate',
      dimensions: {
        length: 20,
        width: 12,
        height: 14
      },
      capacity: {
        maxOccupants: 10,
        ageRange: '4-14'
      },
      price: {
        daily: 200,
        weekly: 1200,
        monthly: 4000
      },
      images: ['pirate1.jpg', 'pirate2.jpg'],
      features: ['slide', 'climbing wall', 'treasure hunt'],
      company: company2._id,
      isActive: true,
      rating: 4.8,
      reviews: []
    });
  });

  describe('POST /api/bounce-houses', () => {
    it('should create bounce house as company admin', async () => {
      // Mock company admin
      (auth as jest.Mock).mockImplementation((req: any, res: any, next: any) => {
        req.user = mockCompanyAdmin;
        next();
      });

      const bounceHouseData = {
        name: 'New Castle',
        description: 'A new castle bounce house',
        theme: 'medieval',
        dimensions: {
          length: 16,
          width: 14,
          height: 13
        },
        capacity: {
          maxOccupants: 9,
          ageRange: '3-13'
        },
        price: {
          daily: 175,
          weekly: 1000,
          monthly: 3500
        },
        features: ['slide', 'moat', 'drawbridge']
      };

      const response = await request(app)
        .post('/api/bounce-houses')
        .send(bounceHouseData)
        .expect(201);

      expect(response.body.name).toBe(bounceHouseData.name);
      expect(response.body.theme).toBe(bounceHouseData.theme);
      expect(response.body.company).toBeDefined();
    });

    it('should create bounce house as admin with company specified', async () => {
      // Mock admin
      (auth as jest.Mock).mockImplementation((req: any, res: any, next: any) => {
        req.user = mockAdmin;
        next();
      });

      const bounceHouseData = {
        name: 'Admin Created Castle',
        description: 'A bounce house created by admin',
        theme: 'fantasy',
        company: company._id,
        dimensions: {
          length: 18,
          width: 16,
          height: 15
        },
        capacity: {
          maxOccupants: 12,
          ageRange: '5-15'
        },
        price: {
          daily: 225,
          weekly: 1350,
          monthly: 4500
        },
        features: ['slide', 'obstacle course', 'climbing wall']
      };

      const response = await request(app)
        .post('/api/bounce-houses')
        .send(bounceHouseData)
        .expect(201);

      expect(response.body.name).toBe(bounceHouseData.name);
      expect(response.body.company).toBeDefined();
    });

    it('should return error for admin without company specified', async () => {
      // Mock admin
      (auth as jest.Mock).mockImplementation((req: any, res: any, next: any) => {
        req.user = mockAdmin;
        next();
      });

      const bounceHouseData = {
        name: 'No Company Castle',
        description: 'A bounce house without company',
        theme: 'generic'
      };

      const response = await request(app)
        .post('/api/bounce-houses')
        .send(bounceHouseData)
        .expect(400);

      expect(response.body.message).toBe('Company ID is required for creating bounce houses');
    });

    it('should return error for unauthenticated user', async () => {
      // Mock unauthenticated user
      (auth as jest.Mock).mockImplementation((req: any, res: any, next: any) => {
        req.user = null;
        next();
      });

      const bounceHouseData = {
        name: 'Unauthorized Castle',
        description: 'Should not be created'
      };

      const response = await request(app)
        .post('/api/bounce-houses')
        .send(bounceHouseData)
        .expect(401);

      expect(response.body.message).toBe('User not authenticated');
    });
  });

  describe('GET /api/bounce-houses', () => {
    it('should get all active bounce houses', async () => {
      const response = await request(app)
        .get('/api/bounce-houses')
        .expect(200);

      expect(response.body.bounceHouses).toHaveLength(2);
      expect(response.body.total).toBe(2);
      expect(response.body.bounceHouses[0].isActive).toBe(true);
    });

    it('should filter bounce houses by theme', async () => {
      const response = await request(app)
        .get('/api/bounce-houses?theme=princess')
        .expect(200);

      expect(response.body.bounceHouses).toHaveLength(1);
      expect(response.body.bounceHouses[0].theme).toBe('princess');
    });

    it('should filter bounce houses by minimum capacity', async () => {
      const response = await request(app)
        .get('/api/bounce-houses?minCapacity=10')
        .expect(200);

      expect(response.body.bounceHouses).toHaveLength(1);
      expect(response.body.bounceHouses[0].capacity.maxOccupants).toBeGreaterThanOrEqual(10);
    });

    it('should filter bounce houses by maximum price', async () => {
      const response = await request(app)
        .get('/api/bounce-houses?maxPrice=175')
        .expect(200);

      expect(response.body.bounceHouses).toHaveLength(1);
      expect(response.body.bounceHouses[0].price.daily).toBeLessThanOrEqual(175);
    });

    it('should filter bounce houses by company', async () => {
      const response = await request(app)
        .get(`/api/bounce-houses?company=${company._id}`)
        .expect(200);

      expect(response.body.bounceHouses).toHaveLength(1);
      expect(response.body.bounceHouses[0].company._id).toBe(company._id.toString());
    });

    it('should filter bounce houses by date availability', async () => {
      const startDate = '2024-06-01';
      const endDate = '2024-06-03';

      const response = await request(app)
        .get(`/api/bounce-houses?startDate=${startDate}&endDate=${endDate}`)
        .expect(200);

      expect(response.body.bounceHouses).toHaveLength(2);
      // Both bounce houses should be available as they have no bookings yet
    });

    it('should support location-based filtering with coordinates', async () => {
      // Mock location service
      (locationService.getZipCodeCoordinates as jest.Mock).mockResolvedValue({
        latitude: 40.7128,
        longitude: -74.0060
      });
      (locationService.calculateDistancesToCompanies as jest.Mock).mockReturnValue([
        { company: company, distance: 5 },
        { company: company2, distance: 50 }
      ]);

      const response = await request(app)
        .get('/api/bounce-houses?latitude=40.7128&longitude=-74.0060&radius=25')
        .expect(200);

      expect(response.body.bounceHouses).toBeDefined();
      expect(response.body.searchLocation).toBeDefined();
    });

    it('should support location-based filtering with zip code', async () => {
      // Mock location service
      (locationService.getZipCodeCoordinates as jest.Mock).mockResolvedValue({
        latitude: 40.7128,
        longitude: -74.0060
      });
      (locationService.calculateDistancesToCompanies as jest.Mock).mockReturnValue([
        { company: company, distance: 5 }
      ]);

      const response = await request(app)
        .get('/api/bounce-houses?zipCode=10001')
        .expect(200);

      expect(response.body.bounceHouses).toBeDefined();
      expect(response.body.searchLocation).toBeDefined();
    });

    it('should support delivery-only filtering', async () => {
      // Mock location service
      (locationService.getZipCodeCoordinates as jest.Mock).mockResolvedValue({
        latitude: 40.7128,
        longitude: -74.0060
      });
      (locationService.filterCompaniesByDeliveryRadius as jest.Mock).mockReturnValue([
        { ...company.toObject(), distance: 15 }
      ]);

      const response = await request(app)
        .get('/api/bounce-houses?zipCode=10001&deliveryOnly=true')
        .expect(200);

      expect(response.body.bounceHouses).toBeDefined();
      expect(response.body.searchLocation).toBeDefined();
    });

    it('should sort by distance when requested', async () => {
      // Mock location service
      (locationService.getZipCodeCoordinates as jest.Mock).mockResolvedValue({
        latitude: 40.7128,
        longitude: -74.0060
      });
      (locationService.calculateDistancesToCompanies as jest.Mock).mockReturnValue([
        { company: company, distance: 5 },
        { company: company2, distance: 15 }
      ]);

      const response = await request(app)
        .get('/api/bounce-houses?zipCode=10001&sortBy=distance')
        .expect(200);

      expect(response.body.bounceHouses).toBeDefined();
      // Should be sorted by distance
    });
  });

  describe('GET /api/bounce-houses/:id', () => {
    it('should get bounce house by ID', async () => {
      const response = await request(app)
        .get(`/api/bounce-houses/${bounceHouse._id}`)
        .expect(200);

      expect(response.body.name).toBe(bounceHouse.name);
      expect(response.body.theme).toBe(bounceHouse.theme);
      expect(response.body.company).toBeDefined();
    });

    it('should return 404 for non-existent bounce house', async () => {
      const response = await request(app)
        .get('/api/bounce-houses/507f1f77bcf86cd799439011')
        .expect(404);

      expect(response.body.message).toBe('Bounce house not found');
    });
  });

  describe('PUT /api/bounce-houses/:id', () => {
    it('should update bounce house as company admin', async () => {
      // Mock company admin
      (auth as jest.Mock).mockImplementation((req: any, res: any, next: any) => {
        req.user = mockCompanyAdmin;
        next();
      });

      const updateData = {
        name: 'Updated Castle',
        description: 'An updated description',
        price: {
          daily: 175,
          weekly: 1050,
          monthly: 3500
        }
      };

      const response = await request(app)
        .put(`/api/bounce-houses/${bounceHouse._id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe(updateData.name);
      expect(response.body.description).toBe(updateData.description);
      expect(response.body.price.daily).toBe(updateData.price.daily);
    });

    it('should update bounce house as admin', async () => {
      // Mock admin
      (auth as jest.Mock).mockImplementation((req: any, res: any, next: any) => {
        req.user = mockAdmin;
        next();
      });

      const updateData = {
        name: 'Admin Updated Castle',
        company: company2._id // Admin can change company
      };

      const response = await request(app)
        .put(`/api/bounce-houses/${bounceHouse._id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe(updateData.name);
    });

    it('should return error for company admin updating different company bounce house', async () => {
      // Mock company admin from different company
      const otherCompanyAdmin = await User.create({
        email: 'other@example.com',
        password: 'password123',
        firstName: 'Other',
        lastName: 'Admin',
        role: 'company-admin',
        company: company2._id
      });

      (auth as jest.Mock).mockImplementation((req: any, res: any, next: any) => {
        req.user = otherCompanyAdmin;
        next();
      });

      const updateData = {
        name: 'Unauthorized Update'
      };

      const response = await request(app)
        .put(`/api/bounce-houses/${bounceHouse._id}`)
        .send(updateData)
        .expect(403);

      expect(response.body.message).toBe('Access denied. You can only update bounce houses from your own company.');
    });

    it('should return error for invalid update fields', async () => {
      // Mock company admin
      (auth as jest.Mock).mockImplementation((req: any, res: any, next: any) => {
        req.user = mockCompanyAdmin;
        next();
      });

      const updateData = {
        invalidField: 'should not be allowed'
      };

      const response = await request(app)
        .put(`/api/bounce-houses/${bounceHouse._id}`)
        .send(updateData)
        .expect(400);

      expect(response.body.message).toBe('Invalid updates');
    });
  });

  describe('DELETE /api/bounce-houses/:id', () => {
    it('should soft delete bounce house as company admin', async () => {
      // Mock company admin
      (auth as jest.Mock).mockImplementation((req: any, res: any, next: any) => {
        req.user = mockCompanyAdmin;
        next();
      });

      const response = await request(app)
        .delete(`/api/bounce-houses/${bounceHouse._id}`)
        .expect(200);

      expect(response.body.message).toBe('Bounce house deleted successfully');

      // Verify it was soft deleted
      const deletedBounceHouse = await BounceHouse.findById(bounceHouse._id);
      expect(deletedBounceHouse?.isActive).toBe(false);
    });

    it('should return error for company admin deleting different company bounce house', async () => {
      // Mock company admin from different company
      const otherCompanyAdmin = await User.create({
        email: 'other-delete@example.com',
        password: 'password123',
        firstName: 'Other',
        lastName: 'Admin',
        role: 'company-admin',
        company: company2._id
      });

      (auth as jest.Mock).mockImplementation((req: any, res: any, next: any) => {
        req.user = otherCompanyAdmin;
        next();
      });

      const response = await request(app)
        .delete(`/api/bounce-houses/${bounceHouse._id}`)
        .expect(403);

      expect(response.body.message).toBe('Access denied. You can only delete bounce houses from your own company.');
    });
  });

  describe('POST /api/bounce-houses/:id/reviews', () => {
    it('should add review to bounce house', async () => {
      // Mock authenticated user
      (auth as jest.Mock).mockImplementation((req: any, res: any, next: any) => {
        req.user = mockUser;
        next();
      });

      const reviewData = {
        rating: 5,
        comment: 'Amazing bounce house! Kids loved it!'
      };

      const response = await request(app)
        .post(`/api/bounce-houses/${bounceHouse._id}/reviews`)
        .send(reviewData)
        .expect(200);

      expect(response.body.reviews).toHaveLength(1);
      expect(response.body.reviews[0].rating).toBe(reviewData.rating);
      expect(response.body.reviews[0].comment).toBe(reviewData.comment);
      expect(response.body.rating).toBe(5); // Should update average rating
    });

    it('should return error for unauthenticated user', async () => {
      // Mock unauthenticated user
      (auth as jest.Mock).mockImplementation((req: any, res: any, next: any) => {
        req.user = null;
        next();
      });

      const reviewData = {
        rating: 5,
        comment: 'Great bounce house!'
      };

      const response = await request(app)
        .post(`/api/bounce-houses/${bounceHouse._id}/reviews`)
        .send(reviewData)
        .expect(401);

      expect(response.body.message).toBe('User not authenticated');
    });
  });

  describe('GET /api/bounce-houses/my-company', () => {
    it('should get company bounce houses for company admin', async () => {
      // Mock company admin
      (auth as jest.Mock).mockImplementation((req: any, res: any, next: any) => {
        req.user = mockCompanyAdmin;
        next();
      });

      const response = await request(app)
        .get('/api/bounce-houses/my-company')
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].company._id).toBe(company._id.toString());
    });

    it('should get all bounce houses for admin', async () => {
      // Mock admin
      (auth as jest.Mock).mockImplementation((req: any, res: any, next: any) => {
        req.user = mockAdmin;
        next();
      });

      const response = await request(app)
        .get('/api/bounce-houses/my-company')
        .expect(200);

      expect(response.body).toHaveLength(2);
    });

    it('should return error for regular user', async () => {
      // Mock regular user
      (auth as jest.Mock).mockImplementation((req: any, res: any, next: any) => {
        req.user = mockUser;
        next();
      });

      const response = await request(app)
        .get('/api/bounce-houses/my-company')
        .expect(403);

      expect(response.body.message).toBe('Access denied. Only company administrators can view company bounce houses.');
    });
  });

  describe('GET /api/bounce-houses/search', () => {
    it('should search bounce houses by location', async () => {
      // Mock location service
      (locationService.getZipCodeCoordinates as jest.Mock).mockResolvedValue({
        latitude: 40.7128,
        longitude: -74.0060
      });
      (locationService.calculateDistancesToCompanies as jest.Mock).mockReturnValue([
        { company: company, distance: 5 }
      ]);

      const response = await request(app)
        .get('/api/bounce-houses/search?location=10001')
        .expect(200);

      expect(response.body.bounceHouses).toBeDefined();
      expect(response.body.searchLocation).toBeDefined();
      expect(response.body.searchLocation.location).toBe('10001');
    });

    it('should return error for missing location parameter', async () => {
      const response = await request(app)
        .get('/api/bounce-houses/search')
        .expect(400);

      expect(response.body.message).toBe('Location parameter is required');
    });

    it('should return error for invalid location', async () => {
      // Mock location service to return null
      (locationService.getZipCodeCoordinates as jest.Mock).mockResolvedValue(null);
      (locationService.geocodeAddress as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .get('/api/bounce-houses/search?location=invalid')
        .expect(400);

      expect(response.body.message).toBe('Unable to find coordinates for the provided location');
    });

    it('should support delivery-only search', async () => {
      // Mock location service
      (locationService.getZipCodeCoordinates as jest.Mock).mockResolvedValue({
        latitude: 40.7128,
        longitude: -74.0060
      });
      (locationService.filterCompaniesByDeliveryRadius as jest.Mock).mockReturnValue([
        { ...company.toObject(), distance: 15 }
      ]);

      const response = await request(app)
        .get('/api/bounce-houses/search?location=10001&deliveryOnly=true')
        .expect(200);

      expect(response.body.bounceHouses).toBeDefined();
      expect(response.body.searchLocation.deliveryOnly).toBe(true);
    });

    it('should support custom radius search', async () => {
      // Mock location service
      (locationService.getZipCodeCoordinates as jest.Mock).mockResolvedValue({
        latitude: 40.7128,
        longitude: -74.0060
      });
      (locationService.calculateDistancesToCompanies as jest.Mock).mockReturnValue([
        { company: company, distance: 5 }
      ]);

      const response = await request(app)
        .get('/api/bounce-houses/search?location=10001&radius=50')
        .expect(200);

      expect(response.body.bounceHouses).toBeDefined();
      expect(response.body.searchLocation.radius).toBe(50);
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      // Mock database error
      jest.spyOn(BounceHouse, 'find').mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/bounce-houses')
        .expect(500);

      expect(response.body.message).toBe('Error fetching bounce houses');
    });

    it('should handle location service errors gracefully', async () => {
      // Mock location service error
      (locationService.getZipCodeCoordinates as jest.Mock).mockRejectedValue(new Error('Location service error'));

      const response = await request(app)
        .get('/api/bounce-houses/search?location=10001')
        .expect(500);

      expect(response.body.message).toBe('Error searching bounce houses by location');
    });
  });
});