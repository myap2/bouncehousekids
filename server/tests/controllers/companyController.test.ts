import request from 'supertest';
import express from 'express';
import Company from '../../src/models/Company';
import User from '../../src/models/User';
import { 
  createCompany,
  getAllCompanies,
  getCompany,
  updateCompany,
  deleteCompany
} from '../../src/controllers/companyController';
import { auth } from '../../src/middleware/auth';

// Mock middleware
jest.mock('../../src/middleware/auth');

const app = express();
app.use(express.json());

// Setup routes
app.post('/api/companies', auth, createCompany);
app.get('/api/companies', auth, getAllCompanies);
app.get('/api/companies/:id', auth, getCompany);
app.put('/api/companies/:id', auth, updateCompany);
app.delete('/api/companies/:id', auth, deleteCompany);

describe('Company Controller', () => {
  let company: any;
  let company2: any;
  let mockAdmin: any;
  let mockCompanyAdmin: any;
  let mockUser: any;

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
        coordinates: [-74.0060, 40.7128]
      },
      settings: {
        deliveryRadius: 25,
        requiresDeposit: false,
        depositAmount: 0,
        cancellationPolicy: 'Standard'
      },
      isActive: true
    });

    company2 = await Company.create({
      name: 'Another Company',
      subdomain: 'another-company',
      email: 'another@company.com',
      phone: '987-654-3210',
      address: {
        street: '456 Another St',
        city: 'Another City',
        state: 'AC',
        zipCode: '54321'
      },
      location: {
        type: 'Point',
        coordinates: [-118.2437, 34.0522]
      },
      settings: {
        deliveryRadius: 30,
        requiresDeposit: true,
        depositAmount: 100,
        cancellationPolicy: 'Strict'
      },
      isActive: true
    });

    // Create test users
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

    mockUser = await User.create({
      email: 'user@example.com',
      password: 'user123',
      firstName: 'Regular',
      lastName: 'User',
      role: 'user',
      company: company._id
    });

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('POST /api/companies', () => {
    it('should create a new company as admin', async () => {
      // Mock admin user
      (auth as jest.Mock).mockImplementation((req: any, res: any, next: any) => {
        req.user = mockAdmin;
        next();
      });

      const companyData = {
        name: 'New Test Company',
        subdomain: 'new-test-company',
        email: 'new@company.com',
        phone: '555-123-4567',
        address: {
          street: '789 New St',
          city: 'New City',
          state: 'NC',
          zipCode: '78910'
        },
        settings: {
          deliveryRadius: 35,
          requiresDeposit: true,
          depositAmount: 150,
          cancellationPolicy: 'Flexible'
        }
      };

      const response = await request(app)
        .post('/api/companies')
        .send(companyData)
        .expect(201);

      expect(response.body.name).toBe(companyData.name);
      expect(response.body.subdomain).toBe(companyData.subdomain);
      expect(response.body.email).toBe(companyData.email);
      expect(response.body.settings.deliveryRadius).toBe(companyData.settings.deliveryRadius);
      expect(response.body.isActive).toBe(true);
    });

    it('should return error for non-admin users', async () => {
      // Mock company admin
      (auth as jest.Mock).mockImplementation((req: any, res: any, next: any) => {
        req.user = mockCompanyAdmin;
        next();
      });

      const companyData = {
        name: 'Unauthorized Company',
        subdomain: 'unauthorized',
        email: 'unauthorized@company.com'
      };

      const response = await request(app)
        .post('/api/companies')
        .send(companyData)
        .expect(403);

      expect(response.body.message).toBe('Access denied. Admin privileges required.');
    });

    it('should return error for duplicate subdomain', async () => {
      // Mock admin user
      (auth as jest.Mock).mockImplementation((req: any, res: any, next: any) => {
        req.user = mockAdmin;
        next();
      });

      const companyData = {
        name: 'Duplicate Subdomain Company',
        subdomain: 'test-company', // Already exists
        email: 'duplicate@company.com'
      };

      const response = await request(app)
        .post('/api/companies')
        .send(companyData)
        .expect(400);

      expect(response.body.message).toBe('Error creating company');
    });

    it('should return error for missing required fields', async () => {
      // Mock admin user
      (auth as jest.Mock).mockImplementation((req: any, res: any, next: any) => {
        req.user = mockAdmin;
        next();
      });

      const companyData = {
        name: 'Incomplete Company'
        // Missing subdomain and email
      };

      const response = await request(app)
        .post('/api/companies')
        .send(companyData)
        .expect(400);

      expect(response.body.message).toBe('Error creating company');
    });
  });

  describe('GET /api/companies', () => {
    it('should get all companies for admin', async () => {
      // Mock admin user
      (auth as jest.Mock).mockImplementation((req: any, res: any, next: any) => {
        req.user = mockAdmin;
        next();
      });

      const response = await request(app)
        .get('/api/companies')
        .expect(200);

             expect(response.body).toHaveLength(2);
    });

    it('should return error for non-admin users', async () => {
      // Mock company admin
      (auth as jest.Mock).mockImplementation((req: any, res: any, next: any) => {
        req.user = mockCompanyAdmin;
        next();
      });

      const response = await request(app)
        .get('/api/companies')
        .expect(403);

      expect(response.body.message).toBe('Access denied. Admin privileges required.');
    });

         it('should return all companies', async () => {
       // Mock admin user
       (auth as jest.Mock).mockImplementation((req: any, res: any, next: any) => {
         req.user = mockAdmin;
         next();
       });

       const response = await request(app)
         .get('/api/companies')
         .expect(200);

       expect(response.body).toHaveLength(2);
       expect(response.body[0].name).toBeDefined();
       expect(response.body[0].subdomain).toBeDefined();
     });

    it('should filter active companies only', async () => {
      // Mock admin user
      (auth as jest.Mock).mockImplementation((req: any, res: any, next: any) => {
        req.user = mockAdmin;
        next();
      });

      // Deactivate one company
      await Company.findByIdAndUpdate(company2._id, { isActive: false });

      const response = await request(app)
        .get('/api/companies')
        .expect(200);

             expect(response.body).toHaveLength(1);
       expect(response.body[0].isActive).toBe(true);
    });

    it('should sort companies by creation date', async () => {
      // Mock admin user
      (auth as jest.Mock).mockImplementation((req: any, res: any, next: any) => {
        req.user = mockAdmin;
        next();
      });

      const response = await request(app)
        .get('/api/companies')
        .expect(200);

             expect(response.body).toHaveLength(2);
       // Should be sorted by createdAt descending
       expect(new Date(response.body[0].createdAt).getTime()).toBeGreaterThanOrEqual(
         new Date(response.body[1].createdAt).getTime()
       );
    });
  });

  describe('GET /api/companies/:id', () => {
    it('should get company by ID as admin', async () => {
      // Mock admin user
      (auth as jest.Mock).mockImplementation((req: any, res: any, next: any) => {
        req.user = mockAdmin;
        next();
      });

      const response = await request(app)
        .get(`/api/companies/${company._id}`)
        .expect(200);

      expect(response.body.name).toBe(company.name);
      expect(response.body.subdomain).toBe(company.subdomain);
      expect(response.body.settings).toBeDefined();
    });

    it('should return error for non-existent company', async () => {
      // Mock admin user
      (auth as jest.Mock).mockImplementation((req: any, res: any, next: any) => {
        req.user = mockAdmin;
        next();
      });

      const response = await request(app)
        .get('/api/companies/507f1f77bcf86cd799439011')
        .expect(404);

      expect(response.body.message).toBe('Company not found');
    });

    it('should return error for non-admin users', async () => {
      // Mock regular user
      (auth as jest.Mock).mockImplementation((req: any, res: any, next: any) => {
        req.user = mockUser;
        next();
      });

      const response = await request(app)
        .get(`/api/companies/${company._id}`)
        .expect(403);

      expect(response.body.message).toBe('Access denied. Admin privileges required.');
    });
  });

  describe('PUT /api/companies/:id', () => {
    it('should update company as admin', async () => {
      // Mock admin user
      (auth as jest.Mock).mockImplementation((req: any, res: any, next: any) => {
        req.user = mockAdmin;
        next();
      });

      const updateData = {
        name: 'Updated Company Name',
        phone: '555-999-8888',
        settings: {
          deliveryRadius: 40,
          requiresDeposit: true,
          depositAmount: 200,
          cancellationPolicy: 'Moderate'
        }
      };

      const response = await request(app)
        .put(`/api/companies/${company._id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe(updateData.name);
      expect(response.body.phone).toBe(updateData.phone);
      expect(response.body.settings.deliveryRadius).toBe(updateData.settings.deliveryRadius);
    });

    it('should return error for non-admin users', async () => {
      // Mock company admin
      (auth as jest.Mock).mockImplementation((req: any, res: any, next: any) => {
        req.user = mockCompanyAdmin;
        next();
      });

      const updateData = {
        name: 'Unauthorized Update'
      };

      const response = await request(app)
        .put(`/api/companies/${company._id}`)
        .send(updateData)
        .expect(403);

      expect(response.body.message).toBe('Access denied. Admin privileges required.');
    });

    it('should return error for invalid update fields', async () => {
      // Mock admin user
      (auth as jest.Mock).mockImplementation((req: any, res: any, next: any) => {
        req.user = mockAdmin;
        next();
      });

      const updateData = {
        invalidField: 'should not be allowed'
      };

      const response = await request(app)
        .put(`/api/companies/${company._id}`)
        .send(updateData)
        .expect(400);

      expect(response.body.message).toBe('Invalid updates');
    });

    it('should return error for non-existent company', async () => {
      // Mock admin user
      (auth as jest.Mock).mockImplementation((req: any, res: any, next: any) => {
        req.user = mockAdmin;
        next();
      });

      const updateData = {
        name: 'Updated Name'
      };

      const response = await request(app)
        .put('/api/companies/507f1f77bcf86cd799439011')
        .send(updateData)
        .expect(404);

      expect(response.body.message).toBe('Company not found');
    });
  });

  describe('DELETE /api/companies/:id', () => {
    it('should soft delete company as admin', async () => {
      // Mock admin user
      (auth as jest.Mock).mockImplementation((req: any, res: any, next: any) => {
        req.user = mockAdmin;
        next();
      });

      const response = await request(app)
        .delete(`/api/companies/${company._id}`)
        .expect(200);

             expect(response.body.message).toBe('Company deactivated successfully');

      // Verify it was soft deleted
      const deletedCompany = await Company.findById(company._id);
      expect(deletedCompany?.isActive).toBe(false);
    });

    it('should return error for non-admin users', async () => {
      // Mock company admin
      (auth as jest.Mock).mockImplementation((req: any, res: any, next: any) => {
        req.user = mockCompanyAdmin;
        next();
      });

      const response = await request(app)
        .delete(`/api/companies/${company._id}`)
        .expect(403);

      expect(response.body.message).toBe('Access denied. Admin privileges required.');
    });

    it('should return error for non-existent company', async () => {
      // Mock admin user
      (auth as jest.Mock).mockImplementation((req: any, res: any, next: any) => {
        req.user = mockAdmin;
        next();
      });

      const response = await request(app)
        .delete('/api/companies/507f1f77bcf86cd799439011')
        .expect(404);

      expect(response.body.message).toBe('Company not found');
    });
  });

  

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      // Mock admin user
      (auth as jest.Mock).mockImplementation((req: any, res: any, next: any) => {
        req.user = mockAdmin;
        next();
      });

      // Mock database error
      jest.spyOn(Company, 'find').mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/companies')
        .expect(500);

      expect(response.body.message).toBe('Error fetching companies');
    });

    it('should handle validation errors', async () => {
      // Mock admin user
      (auth as jest.Mock).mockImplementation((req: any, res: any, next: any) => {
        req.user = mockAdmin;
        next();
      });

      const invalidData = {
        name: '', // Invalid - empty name
        subdomain: 'invalid subdomain!', // Invalid characters
        email: 'invalid-email' // Invalid email format
      };

      const response = await request(app)
        .post('/api/companies')
        .send(invalidData)
        .expect(400);

      expect(response.body.message).toBe('Error creating company');
    });
  });
});