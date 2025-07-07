import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../../src/models/User';
import { createTestUser } from '../setup';

describe('User Model', () => {
  beforeAll(async () => {
    // Connection is already established by jest.setup.js
  });

  afterAll(async () => {
    // Connection cleanup is handled by jest.setup.js
  });

  beforeEach(async () => {
    // Clear the users collection before each test
    await User.deleteMany({});
  });

  describe('Schema Validation', () => {
    it('should create a valid user with all required fields', async () => {
      const userData = {
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
        }
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.firstName).toBe(userData.firstName);
      expect(savedUser.lastName).toBe(userData.lastName);
      expect(savedUser.phone).toBe(userData.phone);
      expect(savedUser.address.street).toBe(userData.address.street);
      expect(savedUser.role).toBe('customer'); // Default role
      expect(savedUser.paymentMethods).toEqual([]); // Default empty array
      expect(savedUser.bookings).toEqual([]); // Default empty array
    });

    it('should require email field', async () => {
      const userData = {
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

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });

    it('should require password field', async () => {
      const userData = {
        email: 'test@example.com',
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

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });

    it('should require firstName field', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        lastName: 'User',
        phone: '123-456-7890',
        address: {
          street: '123 Test St',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345'
        }
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });

    it('should require lastName field', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        phone: '123-456-7890',
        address: {
          street: '123 Test St',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345'
        }
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });

    it('should require phone field', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        address: {
          street: '123 Test St',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345'
        }
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });

    it('should require address fields', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        phone: '123-456-7890',
        address: {
          street: '123 Test St'
          // Missing city, state, zipCode
        }
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });

    it('should enforce unique email constraint', async () => {
      const userData = {
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
        }
      };

      // Create first user
      await User.create(userData);

      // Try to create second user with same email
      const duplicateUser = new User(userData);
      await expect(duplicateUser.save()).rejects.toThrow();
    });

    it('should enforce minimum password length', async () => {
      const userData = {
        email: 'test@example.com',
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

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });

    it('should validate role enum values', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
        role: 'invalid-role', // Invalid role
        phone: '123-456-7890',
        address: {
          street: '123 Test St',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345'
        }
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });

    it('should accept valid role values', async () => {
      const validRoles = ['customer', 'admin', 'company-admin'];
      
      for (const role of validRoles) {
        const userData = {
          email: `test-${role}@example.com`,
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
          role,
          phone: '123-456-7890',
          address: {
            street: '123 Test St',
            city: 'Test City',
            state: 'TS',
            zipCode: '12345'
          }
        };

        const user = new User(userData);
        const savedUser = await user.save();
        expect(savedUser.role).toBe(role);
      }
    });

    it('should trim and lowercase email', async () => {
      const userData = {
        email: '  TEST@EXAMPLE.COM  ',
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

      const user = new User(userData);
      const savedUser = await user.save();
      expect(savedUser.email).toBe('test@example.com');
    });

    it('should trim firstName and lastName', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: '  Test  ',
        lastName: '  User  ',
        phone: '123-456-7890',
        address: {
          street: '123 Test St',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345'
        }
      };

      const user = new User(userData);
      const savedUser = await user.save();
      expect(savedUser.firstName).toBe('Test');
      expect(savedUser.lastName).toBe('User');
    });
  });

  describe('Password Hashing', () => {
    it('should hash password before saving', async () => {
      const userData = {
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
        }
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.password).not.toBe(userData.password);
      expect(savedUser.password).toMatch(/^\$2[aby]\$\d{1,2}\$[./A-Za-z0-9]{53}$/); // bcrypt hash pattern
    });

    it('should not hash password if not modified', async () => {
      const userData = {
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
        }
      };

      const user = new User(userData);
      const savedUser = await user.save();
      const originalHash = savedUser.password;

      // Update non-password field
      savedUser.firstName = 'Updated';
      await savedUser.save();

      expect(savedUser.password).toBe(originalHash);
    });

    it('should hash password when password is modified', async () => {
      const userData = {
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
        }
      };

      const user = new User(userData);
      const savedUser = await user.save();
      const originalHash = savedUser.password;

      // Update password
      savedUser.password = 'newpassword123';
      await savedUser.save();

      expect(savedUser.password).not.toBe(originalHash);
      expect(savedUser.password).not.toBe('newpassword123');
      expect(savedUser.password).toMatch(/^\$2[aby]\$\d{1,2}\$[./A-Za-z0-9]{53}$/);
    });
  });

  describe('Password Comparison', () => {
    it('should correctly compare password with hash', async () => {
      const userData = {
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
        }
      };

      const user = new User(userData);
      const savedUser = await user.save();

      // Test correct password
      const isMatch = await savedUser.comparePassword('password123');
      expect(isMatch).toBe(true);

      // Test incorrect password
      const isNotMatch = await savedUser.comparePassword('wrongpassword');
      expect(isNotMatch).toBe(false);
    });

    it('should handle password comparison with different hash rounds', async () => {
      const userData = {
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
        }
      };

      const user = new User(userData);
      const savedUser = await user.save();

      // Verify the hash was created with the correct salt rounds
      const isMatch = await savedUser.comparePassword('password123');
      expect(isMatch).toBe(true);
    });
  });

  describe('Default Values', () => {
    it('should set default role as customer', async () => {
      const userData = {
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
        }
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.role).toBe('customer');
    });

    it('should initialize empty arrays for paymentMethods and bookings', async () => {
      const userData = {
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
        }
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.paymentMethods).toEqual([]);
      expect(savedUser.bookings).toEqual([]);
    });

    it('should set timestamps', async () => {
      const userData = {
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
        }
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.createdAt).toBeDefined();
      expect(savedUser.updatedAt).toBeDefined();
      expect(savedUser.createdAt).toBeInstanceOf(Date);
      expect(savedUser.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('Indexes', () => {
    it('should have email index', async () => {
      const indexes = await User.collection.indexes();
      const emailIndex = indexes.find(index => 
        index.key && index.key.email === 1
      );
      expect(emailIndex).toBeDefined();
    });

    it('should have role index', async () => {
      const indexes = await User.collection.indexes();
      const roleIndex = indexes.find(index => 
        index.key && index.key.role === 1
      );
      expect(roleIndex).toBeDefined();
    });
  });

  describe('Payment Methods', () => {
    it('should allow adding payment methods', async () => {
      const userData = {
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
        paymentMethods: [{
          type: 'visa',
          last4: '1234',
          expiryMonth: 12,
          expiryYear: 2025,
          isDefault: true
        }]
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.paymentMethods).toHaveLength(1);
      expect(savedUser.paymentMethods[0].type).toBe('visa');
      expect(savedUser.paymentMethods[0].last4).toBe('1234');
      expect(savedUser.paymentMethods[0].isDefault).toBe(true);
    });

    it('should validate payment method fields', async () => {
      const userData = {
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
        paymentMethods: [{
          type: 'visa'
          // Missing required fields
        }]
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });
  });

  describe('Bookings', () => {
    it('should allow adding booking references', async () => {
      const userData = {
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
        bookings: [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()]
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.bookings).toHaveLength(2);
      expect(savedUser.bookings[0]).toBeInstanceOf(mongoose.Types.ObjectId);
    });
  });
}); 