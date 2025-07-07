import React, { act } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import Layout from '../../Layout/Layout';
import authReducer from '../../../store/slices/authSlice';

// Mock environment variables
const originalEnv = process.env;
beforeAll(() => {
  process.env = {
    ...originalEnv,
    REACT_APP_APP_NAME: 'My Bounce Place',
    REACT_APP_COMPANY_EMAIL: 'info@mybounceplace.com',
    REACT_APP_COMPANY_PHONE: '(555) 123-4567',
  };
});

afterAll(() => {
  process.env = originalEnv;
});

// Mock the API service to avoid ES module issues
jest.mock('../../../services/api', () => ({
  authAPI: {
    register: jest.fn(),
    login: jest.fn(),
    getProfile: jest.fn(),
    updateProfile: jest.fn(),
  },
  bounceHouseAPI: {
    getAll: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    addReview: jest.fn(),
  },
  bookingAPI: {
    create: jest.fn(),
    getAll: jest.fn(),
    getById: jest.fn(),
    cancel: jest.fn(),
  },
  companyAPI: {
    getAll: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    getStats: jest.fn(),
    getBranding: jest.fn(),
    updateBranding: jest.fn(),
  },
}));

// Mock store configuration
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState: {
      auth: {
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: null,
        ...initialState,
      },
    },
  });
};

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode; store?: any }> = ({ 
  children, 
  store = createMockStore() 
}) => (
  <Provider store={store}>
    <BrowserRouter>
      {children}
    </BrowserRouter>
  </Provider>
);

describe('Layout Component', () => {
  describe('When user is not authenticated', () => {
    it('should render login and register links', async () => {
      await act(async () => {
        render(
          <TestWrapper>
            <Layout>
              <div>Test Content</div>
            </Layout>
          </TestWrapper>
        );
      });

      expect(screen.getByText(/login/i)).toBeInTheDocument();
      expect(screen.getByText(/register/i)).toBeInTheDocument();
      expect(screen.queryByText(/my bookings/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/logout/i)).not.toBeInTheDocument();
    });

    it('should render the company logo/brand', async () => {
      await act(async () => {
        render(
          <TestWrapper>
            <Layout>
              <div>Test Content</div>
            </Layout>
          </TestWrapper>
        );
      });

      expect(screen.getByText(/my bounce place/i)).toBeInTheDocument();
    });

    it('should have navigation links to browse bounce houses', async () => {
      await act(async () => {
        render(
          <TestWrapper>
            <Layout>
              <div>Test Content</div>
            </Layout>
          </TestWrapper>
        );
      });

      expect(screen.getByText(/bounce houses/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /bounce houses/i })).toHaveAttribute('href', '/bounce-houses');
    });

    it('should render main content area', async () => {
      await act(async () => {
        render(
          <TestWrapper>
            <Layout>
              <div>Test Content</div>
            </Layout>
          </TestWrapper>
        );
      });

      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should render footer with contact information', async () => {
      await act(async () => {
        render(
          <TestWrapper>
            <Layout>
              <div>Test Content</div>
            </Layout>
          </TestWrapper>
        );
      });

      expect(screen.getByText(/contact us/i)).toBeInTheDocument();
      expect(screen.getByText(/info@mybounceplace.com/i)).toBeInTheDocument();
      expect(screen.getByText(/\(555\) 123-4567/i)).toBeInTheDocument();
    });
  });

  describe('When user is authenticated as regular user', () => {
    const mockUser = {
      _id: '1',
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'user',
    };

    it('should render user-specific navigation', async () => {
      const store = createMockStore({
        isAuthenticated: true,
        user: mockUser,
        token: 'mock-token',
      });

      await act(async () => {
        render(
          <TestWrapper store={store}>
            <Layout>
              <div>Test Content</div>
            </Layout>
          </TestWrapper>
        );
      });

      expect(screen.getByText(/my bookings/i)).toBeInTheDocument();
      expect(screen.getByText(/logout/i)).toBeInTheDocument();
      expect(screen.queryByText(/login/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/register/i)).not.toBeInTheDocument();
    });

    it('should display user name', async () => {
      const store = createMockStore({
        isAuthenticated: true,
        user: mockUser,
        token: 'mock-token',
      });

      await act(async () => {
        render(
          <TestWrapper store={store}>
            <Layout>
              <div>Test Content</div>
            </Layout>
          </TestWrapper>
        );
      });

      expect(screen.getByText(/welcome, john!/i)).toBeInTheDocument();
    });

    it('should not show admin links for regular users', async () => {
      const store = createMockStore({
        isAuthenticated: true,
        user: mockUser,
        token: 'mock-token',
      });

      await act(async () => {
        render(
          <TestWrapper store={store}>
            <Layout>
              <div>Test Content</div>
            </Layout>
          </TestWrapper>
        );
      });

      expect(screen.queryByText(/admin/i)).not.toBeInTheDocument();
    });
  });

  describe('When user is authenticated as admin', () => {
    const mockAdmin = {
      _id: '2',
      email: 'admin@example.com',
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'admin',
    };

    it('should show admin link for admin users', async () => {
      const store = createMockStore({
        isAuthenticated: true,
        user: mockAdmin,
        token: 'mock-token',
      });

      await act(async () => {
        render(
          <TestWrapper store={store}>
            <Layout>
              <div>Test Content</div>
            </Layout>
          </TestWrapper>
        );
      });

      expect(screen.getByText(/admin/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /admin/i })).toHaveAttribute('href', '/admin');
    });

    it('should display admin user name', async () => {
      const store = createMockStore({
        isAuthenticated: true,
        user: mockAdmin,
        token: 'mock-token',
      });

      await act(async () => {
        render(
          <TestWrapper store={store}>
            <Layout>
              <div>Test Content</div>
            </Layout>
          </TestWrapper>
        );
      });

      expect(screen.getByText(/welcome, jane!/i)).toBeInTheDocument();
    });
  });

  describe('Logout functionality', () => {
    const mockUser = {
      _id: '1',
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'user',
    };

    it('should call logout when logout button is clicked', async () => {
      const store = createMockStore({
        isAuthenticated: true,
        user: mockUser,
        token: 'mock-token',
      });

      await act(async () => {
        render(
          <TestWrapper store={store}>
            <Layout>
              <div>Test Content</div>
            </Layout>
          </TestWrapper>
        );
      });

      const logoutButton = screen.getByText(/logout/i);
      
      await act(async () => {
        fireEvent.click(logoutButton);
      });

      // After logout, should show login/register links
      expect(screen.getByText(/login/i)).toBeInTheDocument();
      expect(screen.getByText(/register/i)).toBeInTheDocument();
    });
  });
});