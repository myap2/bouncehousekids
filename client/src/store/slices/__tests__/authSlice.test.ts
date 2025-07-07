import { configureStore } from '@reduxjs/toolkit';
import authReducer, { 
  register, 
  login, 
  getProfile, 
  updateProfile,
  logout,
  clearError
} from '../authSlice';
import { authAPI } from '../../../services/api';

// Mock the API service
jest.mock('../../../services/api', () => ({
  authAPI: {
    register: jest.fn(),
    login: jest.fn(),
    getProfile: jest.fn(),
    updateProfile: jest.fn(),
  },
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Auth Slice', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authReducer,
      },
    });
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = store.getState().auth;
      expect(state).toEqual({
        user: null,
        token: null,
        loading: false,
        error: null,
      });
    });

    it('should load token from localStorage on initialization', () => {
      localStorageMock.getItem.mockReturnValue('mock-token');
      
      const newStore = configureStore({
        reducer: {
          auth: authReducer,
        },
      });

      const state = newStore.getState().auth;
      expect(state.token).toBe('mock-token');
      expect(localStorageMock.getItem).toHaveBeenCalledWith('token');
    });
  });

  describe('Register Action', () => {
    const mockUserData = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      phone: '123-456-7890',
      address: {
        street: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zipCode: '12345'
      }
    };

    const mockResponse = {
      token: 'mock-jwt-token',
      user: {
        _id: '1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'customer'
      }
    };

    it('should handle register.pending', async () => {
      (authAPI.register as jest.Mock).mockResolvedValue({ data: mockResponse });

      const promise = store.dispatch(register(mockUserData));

      // Check pending state
      expect(store.getState().auth.loading).toBe(true);
      expect(store.getState().auth.error).toBe(null);

      await promise;

      // Check fulfilled state
      expect(store.getState().auth.loading).toBe(false);
      expect(store.getState().auth.user).toEqual(mockResponse.user);
      expect(store.getState().auth.token).toBe(mockResponse.token);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', mockResponse.token);
    });

    it('should handle register.fulfilled', async () => {
      (authAPI.register as jest.Mock).mockResolvedValue({ data: mockResponse });

      await store.dispatch(register(mockUserData));

      const state = store.getState().auth;
      expect(state.loading).toBe(false);
      expect(state.user).toEqual(mockResponse.user);
      expect(state.token).toBe(mockResponse.token);
      expect(state.error).toBe(null);
    });

    it('should handle register.rejected', async () => {
      const errorMessage = 'Registration failed';
      (authAPI.register as jest.Mock).mockRejectedValue({
        response: { data: { message: errorMessage } }
      });

      await store.dispatch(register(mockUserData));

      const state = store.getState().auth;
      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
      expect(state.user).toBe(null);
      expect(state.token).toBe(null);
    });

    it('should handle register.rejected with generic error', async () => {
      (authAPI.register as jest.Mock).mockRejectedValue(new Error('Network error'));

      await store.dispatch(register(mockUserData));

      const state = store.getState().auth;
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Registration failed');
      expect(state.user).toBe(null);
      expect(state.token).toBe(null);
    });

    it('should call authAPI.register with correct data', async () => {
      (authAPI.register as jest.Mock).mockResolvedValue({ data: mockResponse });

      await store.dispatch(register(mockUserData));

      expect(authAPI.register).toHaveBeenCalledWith(mockUserData);
    });
  });

  describe('Login Action', () => {
    const mockLoginData = {
      email: 'test@example.com',
      password: 'password123'
    };

    const mockResponse = {
      token: 'mock-jwt-token',
      user: {
        _id: '1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'customer'
      }
    };

    it('should handle login.pending', async () => {
      (authAPI.login as jest.Mock).mockResolvedValue({ data: mockResponse });

      const promise = store.dispatch(login(mockLoginData));

      // Check pending state
      expect(store.getState().auth.loading).toBe(true);
      expect(store.getState().auth.error).toBe(null);

      await promise;

      // Check fulfilled state
      expect(store.getState().auth.loading).toBe(false);
      expect(store.getState().auth.user).toEqual(mockResponse.user);
      expect(store.getState().auth.token).toBe(mockResponse.token);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', mockResponse.token);
    });

    it('should handle login.fulfilled', async () => {
      (authAPI.login as jest.Mock).mockResolvedValue({ data: mockResponse });

      await store.dispatch(login(mockLoginData));

      const state = store.getState().auth;
      expect(state.loading).toBe(false);
      expect(state.user).toEqual(mockResponse.user);
      expect(state.token).toBe(mockResponse.token);
      expect(state.error).toBe(null);
    });

    it('should handle login.rejected', async () => {
      const errorMessage = 'Invalid credentials';
      (authAPI.login as jest.Mock).mockRejectedValue({
        response: { data: { message: errorMessage } }
      });

      await store.dispatch(login(mockLoginData));

      const state = store.getState().auth;
      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
      expect(state.user).toBe(null);
      expect(state.token).toBe(null);
    });

    it('should call authAPI.login with correct data', async () => {
      (authAPI.login as jest.Mock).mockResolvedValue({ data: mockResponse });

      await store.dispatch(login(mockLoginData));

      expect(authAPI.login).toHaveBeenCalledWith(mockLoginData.email, mockLoginData.password);
    });
  });

  describe('Get Profile Action', () => {
    const mockUser = {
      _id: '1',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'customer'
    };

    it('should handle getProfile.pending', async () => {
      (authAPI.getProfile as jest.Mock).mockResolvedValue({ data: mockUser });

      const promise = store.dispatch(getProfile());

      // Check pending state
      expect(store.getState().auth.loading).toBe(true);
      expect(store.getState().auth.error).toBe(null);

      await promise;

      // Check fulfilled state
      expect(store.getState().auth.loading).toBe(false);
      expect(store.getState().auth.user).toEqual(mockUser);
    });

    it('should handle getProfile.fulfilled', async () => {
      (authAPI.getProfile as jest.Mock).mockResolvedValue({ data: mockUser });

      await store.dispatch(getProfile());

      const state = store.getState().auth;
      expect(state.loading).toBe(false);
      expect(state.user).toEqual(mockUser);
      expect(state.error).toBe(null);
    });

    it('should handle getProfile.rejected', async () => {
      const errorMessage = 'Failed to fetch profile';
      (authAPI.getProfile as jest.Mock).mockRejectedValue({
        response: { data: { message: errorMessage } }
      });

      await store.dispatch(getProfile());

      const state = store.getState().auth;
      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });

    it('should call authAPI.getProfile', async () => {
      (authAPI.getProfile as jest.Mock).mockResolvedValue({ data: mockUser });

      await store.dispatch(getProfile());

      expect(authAPI.getProfile).toHaveBeenCalled();
    });
  });

  describe('Update Profile Action', () => {
    const mockUpdateData = {
      firstName: 'Jane',
      lastName: 'Smith'
    };

    const mockUpdatedUser = {
      _id: '1',
      email: 'test@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'customer'
    };

    it('should handle updateProfile.pending', async () => {
      (authAPI.updateProfile as jest.Mock).mockResolvedValue({ data: mockUpdatedUser });

      const promise = store.dispatch(updateProfile(mockUpdateData));

      // Check pending state
      expect(store.getState().auth.loading).toBe(true);
      expect(store.getState().auth.error).toBe(null);

      await promise;

      // Check fulfilled state
      expect(store.getState().auth.loading).toBe(false);
      expect(store.getState().auth.user).toEqual(mockUpdatedUser);
    });

    it('should handle updateProfile.fulfilled', async () => {
      (authAPI.updateProfile as jest.Mock).mockResolvedValue({ data: mockUpdatedUser });

      await store.dispatch(updateProfile(mockUpdateData));

      const state = store.getState().auth;
      expect(state.loading).toBe(false);
      expect(state.user).toEqual(mockUpdatedUser);
      expect(state.error).toBe(null);
    });

    it('should handle updateProfile.rejected', async () => {
      const errorMessage = 'Failed to update profile';
      (authAPI.updateProfile as jest.Mock).mockRejectedValue({
        response: { data: { message: errorMessage } }
      });

      await store.dispatch(updateProfile(mockUpdateData));

      const state = store.getState().auth;
      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });

    it('should call authAPI.updateProfile with correct data', async () => {
      (authAPI.updateProfile as jest.Mock).mockResolvedValue({ data: mockUpdatedUser });

      await store.dispatch(updateProfile(mockUpdateData));

      expect(authAPI.updateProfile).toHaveBeenCalledWith(mockUpdateData);
    });
  });

  describe('Logout Action', () => {
    it('should clear user data and token', () => {
      // Set initial state with user and token
      store.dispatch({
        type: 'auth/register/fulfilled',
        payload: {
          token: 'mock-token',
          user: { _id: '1', email: 'test@example.com' }
        }
      });

      // Verify initial state
      expect(store.getState().auth.user).toBeTruthy();
      expect(store.getState().auth.token).toBe('mock-token');

      // Dispatch logout
      store.dispatch(logout());

      // Verify logout state
      const state = store.getState().auth;
      expect(state.user).toBe(null);
      expect(state.token).toBe(null);
      expect(state.loading).toBe(false);
      expect(state.error).toBe(null);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
    });
  });

  describe('Clear Error Action', () => {
    it('should clear error state', () => {
      // Set initial state with error
      store.dispatch({
        type: 'auth/register/rejected',
        payload: 'Some error'
      });

      // Verify error is set
      expect(store.getState().auth.error).toBe('Some error');

      // Dispatch clearError
      store.dispatch(clearError());

      // Verify error is cleared
      expect(store.getState().auth.error).toBe(null);
    });
  });

  describe('State Transitions', () => {
    it('should handle complete registration flow', async () => {
      const mockUserData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        phone: '123-456-7890',
        address: {
          street: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          zipCode: '12345'
        }
      };

      const mockResponse = {
        token: 'mock-jwt-token',
        user: {
          _id: '1',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'customer'
        }
      };

      (authAPI.register as jest.Mock).mockResolvedValue({ data: mockResponse });

      // Initial state
      expect(store.getState().auth.user).toBe(null);
      expect(store.getState().auth.token).toBe(null);
      expect(store.getState().auth.loading).toBe(false);

      // Register
      await store.dispatch(register(mockUserData));

      // After registration
      const state = store.getState().auth;
      expect(state.user).toEqual(mockResponse.user);
      expect(state.token).toBe(mockResponse.token);
      expect(state.loading).toBe(false);
      expect(state.error).toBe(null);

      // Logout
      store.dispatch(logout());

      // After logout
      const logoutState = store.getState().auth;
      expect(logoutState.user).toBe(null);
      expect(logoutState.token).toBe(null);
      expect(logoutState.loading).toBe(false);
      expect(logoutState.error).toBe(null);
    });

    it('should handle error recovery', async () => {
      const mockUserData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        phone: '123-456-7890',
        address: {
          street: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          zipCode: '12345'
        }
      };

      // First attempt fails
      (authAPI.register as jest.Mock).mockRejectedValue({
        response: { data: { message: 'User already exists' } }
      });

      await store.dispatch(register(mockUserData));

      // Check error state
      expect(store.getState().auth.error).toBe('User already exists');

      // Clear error
      store.dispatch(clearError());

      // Check error is cleared
      expect(store.getState().auth.error).toBe(null);

      // Second attempt succeeds
      const mockResponse = {
        token: 'mock-jwt-token',
        user: {
          _id: '1',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'customer'
        }
      };

      (authAPI.register as jest.Mock).mockResolvedValue({ data: mockResponse });

      await store.dispatch(register(mockUserData));

      // Check success state
      const state = store.getState().auth;
      expect(state.user).toEqual(mockResponse.user);
      expect(state.token).toBe(mockResponse.token);
      expect(state.error).toBe(null);
    });
  });
}); 