import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../../src/models/User';
import Company from '../../src/models/Company';
import { 
  register, 
  login, 
  getProfile, 
  updateProfile,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getUserProfile,
  updateUserProfile,
  registerUser,
  loginUser
} from '../../src/controllers/userController';
import { auth } from '../../src/middleware/auth';
import { createTestCompany, createTestUser } from '../setup';

// Mock middleware
jest.mock('../../src/middleware/auth');

const app = express();
app.use(express.json());

// Setup routes
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);
app.get('/api/auth/profile', auth, getProfile);
app.put('/api/auth/profile', auth, updateProfile);
app.get('/api/users', auth, getAllUsers);
app.post('/api/users', auth, createUser);
app.put('/api/users/:id', auth, updateUser);
app.delete('/api/users/:id', auth, deleteUser);
app.get('/api/user/profile', auth, getUserProfile);
app.put('/api/user/profile', auth, updateUserProfile);

// Add new routes for registerUser and loginUser
app.post('/api/users/register', registerUser);
app.post('/api/users/login', loginUser);

describe('User Controller', () => {
  let company: any;
  let mockUser: any;
  let mockAdmin: any;

  beforeEach(async () => {
    // Create test company using helper function
    company = await createTestCompany({
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
      settings: {
        deliveryRadius: 25,
        requiresDeposit: false,
        depositPercentage: 0,
        cancellationPolicy: 'Standard'
      }
    });

    // Create test users using helper function
    mockUser = await createTestUser({
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      phone: '123-456-7890',
      address: {
        street: '123 Test St',
        city: 'Test City',
        state: 'TS',
        zipCode: '12345'
      },
      company: company._id
    });

    mockAdmin = await createTestUser({
      email: 'admin@example.com',
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      phone: '123-456-7890',
      address: {
        street: '123 Admin St',
        city: 'Admin City',
        state: 'AD',
        zipCode: '54321'
      }
    });
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
        phone: '987-654-3210',
        address: {
          street: '456 New St',
          city: 'New City',
          state: 'NW',
          zipCode: '67890'
        }
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.firstName).toBe(userData.firstName);
      expect(response.body.user.lastName).toBe(userData.lastName);
      expect(response.body.user.role).toBe('customer');
    });

    it('should return error for existing email', async () => {
      const userData = {
        email: 'test@example.com', // Already exists
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.message).toBe('User already exists');
    });

    it('should return error for missing required fields', async () => {
      const userData = {
        email: 'incomplete@example.com'
        // Missing password, firstName, lastName
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(500);

      expect(response.body.message).toBe('Error creating user');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with correct credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe(loginData.email);
      expect(response.body.user.role).toBe('customer');
    });

    it('should return error for invalid email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should return error for invalid password', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.message).toBe('Invalid credentials');
    });
  });

  describe('GET /api/auth/profile', () => {
    it('should return user profile when authenticated', async () => {
      // Mock authenticated user
      (auth as jest.Mock).mockImplementation((req: any, res: any, next: any) => {
        req.user = mockUser;
        next();
      });

      const response = await request(app)
        .get('/api/auth/profile')
        .expect(200);

      expect(response.body.email).toBe(mockUser.email);
      expect(response.body.firstName).toBe(mockUser.firstName);
      expect(response.body.lastName).toBe(mockUser.lastName);
      expect(response.body.password).toBeUndefined();
    });

    it('should return error when user not found', async () => {
      // Mock authenticated user that doesn't exist
      (auth as jest.Mock).mockImplementation((req: any, res: any, next: any) => {
        req.user = { _id: '507f1f77bcf86cd799439011' }; // Non-existent ID
        next();
      });

      const response = await request(app)
        .get('/api/auth/profile')
        .expect(404);

      expect(response.body.message).toBe('User not found');
    });
  });

  describe('PUT /api/auth/profile', () => {
    it('should update user profile successfully', async () => {
      // Mock authenticated user
      (auth as jest.Mock).mockImplementation((req: any, res: any, next: any) => {
        req.user = mockUser;
        next();
      });

      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
        phone: '555-123-4567'
      };

      const response = await request(app)
        .put('/api/auth/profile')
        .send(updateData)
        .expect(200);

      expect(response.body.firstName).toBe(updateData.firstName);
      expect(response.body.lastName).toBe(updateData.lastName);
      expect(response.body.phone).toBe(updateData.phone);
    });

    it('should return error for invalid update fields', async () => {
      // Mock authenticated user
      (auth as jest.Mock).mockImplementation((req: any, res: any, next: any) => {
        req.user = mockUser;
        next();
      });

      const updateData = {
        email: 'newemail@example.com', // Not allowed
        role: 'admin' // Not allowed
      };

      const response = await request(app)
        .put('/api/auth/profile')
        .send(updateData)
        .expect(400);

      expect(response.body.message).toBe('Invalid updates');
    });
  });

  describe('GET /api/users (Admin only)', () => {
    it('should return all users for admin', async () => {
      // Mock admin user
      (auth as jest.Mock).mockImplementation((req: any, res: any, next: any) => {
        req.user = mockAdmin;
        next();
      });

      const response = await request(app)
        .get('/api/users')
        .expect(200);

      expect(response.body.users).toHaveLength(2);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.total).toBe(2);
    });

    it('should return error for non-admin users', async () => {
      // Mock regular user
      (auth as jest.Mock).mockImplementation((req: any, res: any, next: any) => {
        req.user = mockUser;
        next();
      });

      const response = await request(app)
        .get('/api/users')
        .expect(403);

      expect(response.body.message).toBe('Access denied. Admin privileges required.');
    });

    it('should support pagination', async () => {
      // Mock admin user
      (auth as jest.Mock).mockImplementation((req: any, res: any, next: any) => {
        req.user = mockAdmin;
        next();
      });

      const response = await request(app)
        .get('/api/users?page=1&limit=1')
        .expect(200);

      expect(response.body.users).toHaveLength(1);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(1);
      expect(response.body.pagination.total).toBe(2);
    });
  });

  describe('POST /api/users (Admin only)', () => {
    it('should create a new user as admin', async () => {
      // Mock admin user
      (auth as jest.Mock).mockImplementation((req: any, res: any, next: any) => {
        req.user = mockAdmin;
        next();
      });

      const userData = {
        email: 'adminuser@example.com',
        password: 'password123',
        firstName: 'Admin',
        lastName: 'Created',
        role: 'company-admin',
        phone: '555-999-8888',
        address: {
          street: '789 Admin St',
          city: 'Admin City',
          state: 'AD',
          zipCode: '99999'
        },
        company: company._id
      };

      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(201);

      expect(response.body.email).toBe(userData.email);
      expect(response.body.role).toBe(userData.role);
      expect(response.body.company).toBeDefined();
    });

    it('should return error for non-admin users', async () => {
      // Mock regular user
      (auth as jest.Mock).mockImplementation((req: any, res: any, next: any) => {
        req.user = mockUser;
        next();
      });

      const userData = {
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User'
      };

      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(403);

      expect(response.body.message).toBe('Access denied. Admin privileges required.');
    });
  });

  describe('PUT /api/users/:id (Admin only)', () => {
    it('should update user as admin', async () => {
      // Mock admin user
      (auth as jest.Mock).mockImplementation((req: any, res: any, next: any) => {
        req.user = mockAdmin;
        next();
      });

      const updateData = {
        firstName: 'Updated',
        lastName: 'ByAdmin',
        role: 'company-admin'
      };

      const response = await request(app)
        .put(`/api/users/${mockUser._id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.firstName).toBe(updateData.firstName);
      expect(response.body.lastName).toBe(updateData.lastName);
      expect(response.body.role).toBe(updateData.role);
    });

    it('should return error for non-admin users', async () => {
      // Mock regular user
      (auth as jest.Mock).mockImplementation((req: any, res: any, next: any) => {
        req.user = mockUser;
        next();
      });

      const updateData = {
        firstName: 'Updated',
        lastName: 'ByUser'
      };

      const response = await request(app)
        .put(`/api/users/${mockUser._id}`)
        .send(updateData)
        .expect(403);

      expect(response.body.message).toBe('Access denied. Admin privileges required.');
    });
  });

  describe('DELETE /api/users/:id (Admin only)', () => {
    it('should delete user as admin', async () => {
      // Mock admin user
      (auth as jest.Mock).mockImplementation((req: any, res: any, next: any) => {
        req.user = mockAdmin;
        next();
      });

      const response = await request(app)
        .delete(`/api/users/${mockUser._id}`)
        .expect(200);

      expect(response.body.message).toBe('User deleted successfully');

      // Verify user was deleted
      const deletedUser = await User.findById(mockUser._id);
      expect(deletedUser).toBeNull();
    });

    it('should return error for non-admin users', async () => {
      // Mock regular user
      (auth as jest.Mock).mockImplementation((req: any, res: any, next: any) => {
        req.user = mockUser;
        next();
      });

      const response = await request(app)
        .delete(`/api/users/${mockUser._id}`)
        .expect(403);

      expect(response.body.message).toBe('Access denied. Admin privileges required.');
    });

    it('should return error for non-existent user', async () => {
      // Mock admin user
      (auth as jest.Mock).mockImplementation((req: any, res: any, next: any) => {
        req.user = mockAdmin;
        next();
      });

      const response = await request(app)
        .delete('/api/users/507f1f77bcf86cd799439011')
        .expect(404);

      expect(response.body.message).toBe('User not found');
    });
  });

  describe('JWT Token Generation', () => {
    it('should generate valid JWT token', async () => {
      const userData = {
        email: 'jwttest@example.com',
        password: 'password123',
        firstName: 'JWT',
        lastName: 'Test',
        phone: '555-123-4567',
        address: {
          street: '123 JWT St',
          city: 'JWT City',
          state: 'JW',
          zipCode: '12345'
        }
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.token).toBeDefined();
      
      // Verify token is valid
      const decoded = jwt.verify(response.body.token, process.env.JWT_SECRET || 'test-jwt-secret');
      expect(decoded).toBeDefined();
    });
  });

  describe('POST /api/users/register (registerUser)', () => {
    it('should register a new user successfully with all required fields', async () => {
      const userData = {
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
        phone: '987-654-3210',
        address: {
          street: '456 New St',
          city: 'New City',
          state: 'NW',
          zipCode: '67890'
        }
      };

      const response = await request(app)
        .post('/api/users/register')
        .send(userData)
        .expect(201);

      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.firstName).toBe(userData.firstName);
      expect(response.body.user.lastName).toBe(userData.lastName);
      expect(response.body.user.role).toBe('customer');
      expect(response.body.user._id).toBeDefined();

      // Verify user was actually saved to database
      const savedUser = await User.findOne({ email: userData.email });
      expect(savedUser).toBeDefined();
      expect(savedUser?.firstName).toBe(userData.firstName);
      expect(savedUser?.phone).toBe(userData.phone);
      expect(savedUser?.address.street).toBe(userData.address.street);
    });

    it('should register user with company context when available', async () => {
      const userData = {
        email: 'companyuser@example.com',
        password: 'password123',
        firstName: 'Company',
        lastName: 'User',
        phone: '555-123-4567',
        address: {
          street: '789 Company St',
          city: 'Company City',
          state: 'CC',
          zipCode: '11111'
        }
      };

      // Mock company context
      const req = { company: company, body: userData } as any;
      const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as any;

      await registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          token: expect.any(String),
          user: expect.objectContaining({
            email: userData.email,
            role: 'customer'
          })
        })
      );
    });

    it('should return error for existing email', async () => {
      const userData = {
        email: 'test@example.com', // Already exists
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        phone: '123-456-7890',
        address: {
          street: '123 Test St',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345'
        }
      };

      const response = await request(app)
        .post('/api/users/register')
        .send(userData)
        .expect(400);

      expect(response.body.message).toBe('User already exists');
    });

    it('should return error for missing required fields', async () => {
      const userData = {
        email: 'incomplete@example.com'
        // Missing password, firstName, lastName, phone, address
      };

      const response = await request(app)
        .post('/api/users/register')
        .send(userData)
        .expect(400);

      expect(response.body.message).toContain('User validation failed');
    });

    it('should return error for invalid email format', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        phone: '123-456-7890',
        address: {
          street: '123 Test St',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345'
        }
      };

      const response = await request(app)
        .post('/api/users/register')
        .send(userData)
        .expect(400);

      expect(response.body.message).toContain('User validation failed');
    });

    it('should return error for password too short', async () => {
      const userData = {
        email: 'shortpass@example.com',
        password: '123', // Too short
        firstName: 'Test',
        lastName: 'User',
        phone: '123-456-7890',
        address: {
          street: '123 Test St',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345'
        }
      };

      const response = await request(app)
        .post('/api/users/register')
        .send(userData)
        .expect(400);

      expect(response.body.message).toContain('User validation failed');
    });

    it('should hash password before saving', async () => {
      const userData = {
        email: 'hashtest@example.com',
        password: 'password123',
        firstName: 'Hash',
        lastName: 'Test',
        phone: '123-456-7890',
        address: {
          street: '123 Hash St',
          city: 'Hash City',
          state: 'HS',
          zipCode: '12345'
        }
      };

      const response = await request(app)
        .post('/api/users/register')
        .send(userData)
        .expect(201);

      // Verify password was hashed
      const savedUser = await User.findOne({ email: userData.email });
      expect(savedUser?.password).not.toBe(userData.password);
      expect(savedUser?.password).toMatch(/^\$2[aby]\$\d{1,2}\$[./A-Za-z0-9]{53}$/); // bcrypt hash pattern
    });

    it('should set default role as customer', async () => {
      const userData = {
        email: 'defaultrole@example.com',
        password: 'password123',
        firstName: 'Default',
        lastName: 'Role',
        phone: '123-456-7890',
        address: {
          street: '123 Default St',
          city: 'Default City',
          state: 'DF',
          zipCode: '12345'
        }
      };

      const response = await request(app)
        .post('/api/users/register')
        .send(userData)
        .expect(201);

      expect(response.body.user.role).toBe('customer');

      // Verify in database
      const savedUser = await User.findOne({ email: userData.email });
      expect(savedUser?.role).toBe('customer');
    });

    it('should initialize empty arrays for paymentMethods and bookings', async () => {
      const userData = {
        email: 'arrays@example.com',
        password: 'password123',
        firstName: 'Array',
        lastName: 'Test',
        phone: '123-456-7890',
        address: {
          street: '123 Array St',
          city: 'Array City',
          state: 'AR',
          zipCode: '12345'
        }
      };

      const response = await request(app)
        .post('/api/users/register')
        .send(userData)
        .expect(201);

      // Verify arrays are initialized
      const savedUser = await User.findOne({ email: userData.email });
      expect(savedUser?.paymentMethods).toEqual([]);
      expect(savedUser?.bookings).toEqual([]);
    });
  });

  describe('POST /api/users/login (loginUser)', () => {
    it('should login successfully with correct credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/users/login')
        .send(loginData)
        .expect(200);

      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe(loginData.email);
      expect(response.body.user.role).toBe('customer');
      expect(response.body.user.company).toBeDefined();
    });

    it('should return error for invalid email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/users/login')
        .send(loginData)
        .expect(401);

      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should return error for invalid password', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/users/login')
        .send(loginData)
        .expect(401);

      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should include company information in response', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/users/login')
        .send(loginData)
        .expect(200);

      expect(response.body.user.company).toBeDefined();
    });
  });
});