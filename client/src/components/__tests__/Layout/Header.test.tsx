import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import Header from '../Layout/Header';
import { authSlice } from '../../store/slices/authSlice';

// Mock store configuration
const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authSlice.reducer,
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

describe('Header Component', () => {
  describe('When user is not authenticated', () => {
    it('should render login and register links', () => {
      render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      );

      expect(screen.getByText(/sign in/i)).toBeInTheDocument();
      expect(screen.getByText(/sign up/i)).toBeInTheDocument();
      expect(screen.queryByText(/dashboard/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/logout/i)).not.toBeInTheDocument();
    });

    it('should render the company logo/brand', () => {
      render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      );

      expect(screen.getByText(/bounce house kids/i)).toBeInTheDocument();
    });

    it('should have navigation links to browse bounce houses', () => {
      render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      );

      expect(screen.getByText(/browse/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /browse/i })).toHaveAttribute('href', '/bounce-houses');
    });

    it('should render mobile menu toggle', () => {
      render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      );

      const mobileMenuButton = screen.getByRole('button', { name: /menu/i });
      expect(mobileMenuButton).toBeInTheDocument();
    });

    it('should toggle mobile menu when clicked', () => {
      render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      );

      const mobileMenuButton = screen.getByRole('button', { name: /menu/i });
      
      // Initially mobile menu should be closed
      expect(screen.queryByTestId('mobile-menu')).not.toBeVisible();
      
      // Click to open
      fireEvent.click(mobileMenuButton);
      expect(screen.getByTestId('mobile-menu')).toBeVisible();
      
      // Click to close
      fireEvent.click(mobileMenuButton);
      expect(screen.queryByTestId('mobile-menu')).not.toBeVisible();
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

    it('should render user-specific navigation', () => {
      const store = createMockStore({
        isAuthenticated: true,
        user: mockUser,
        token: 'mock-token',
      });

      render(
        <TestWrapper store={store}>
          <Header />
        </TestWrapper>
      );

      expect(screen.getByText(/my bookings/i)).toBeInTheDocument();
      expect(screen.getByText(/profile/i)).toBeInTheDocument();
      expect(screen.getByText(/logout/i)).toBeInTheDocument();
      expect(screen.queryByText(/sign in/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/sign up/i)).not.toBeInTheDocument();
    });

    it('should display user name', () => {
      const store = createMockStore({
        isAuthenticated: true,
        user: mockUser,
        token: 'mock-token',
      });

      render(
        <TestWrapper store={store}>
          <Header />
        </TestWrapper>
      );

      expect(screen.getByText(/john doe/i)).toBeInTheDocument();
    });

    it('should not show admin links for regular users', () => {
      const store = createMockStore({
        isAuthenticated: true,
        user: mockUser,
        token: 'mock-token',
      });

      render(
        <TestWrapper store={store}>
          <Header />
        </TestWrapper>
      );

      expect(screen.queryByText(/admin dashboard/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/manage companies/i)).not.toBeInTheDocument();
    });

    it('should show shopping cart if user has items', () => {
      const store = createMockStore({
        isAuthenticated: true,
        user: mockUser,
        token: 'mock-token',
      });

      render(
        <TestWrapper store={store}>
          <Header />
        </TestWrapper>
      );

      // Assuming cart functionality exists
      expect(screen.queryByTestId('cart-icon')).toBeInTheDocument();
    });
  });

  describe('When user is authenticated as company admin', () => {
    const mockCompanyAdmin = {
      _id: '2',
      email: 'admin@company.com',
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'company-admin',
      company: {
        _id: 'company1',
        name: 'Test Company',
        subdomain: 'test-company',
      },
    };

    it('should render company admin navigation', () => {
      const store = createMockStore({
        isAuthenticated: true,
        user: mockCompanyAdmin,
        token: 'mock-token',
      });

      render(
        <TestWrapper store={store}>
          <Header />
        </TestWrapper>
      );

      expect(screen.getByText(/company dashboard/i)).toBeInTheDocument();
      expect(screen.getByText(/manage bounce houses/i)).toBeInTheDocument();
      expect(screen.getByText(/bookings/i)).toBeInTheDocument();
    });

    it('should display company name', () => {
      const store = createMockStore({
        isAuthenticated: true,
        user: mockCompanyAdmin,
        token: 'mock-token',
      });

      render(
        <TestWrapper store={store}>
          <Header />
        </TestWrapper>
      );

      expect(screen.getByText(/test company/i)).toBeInTheDocument();
    });

    it('should not show super admin links for company admins', () => {
      const store = createMockStore({
        isAuthenticated: true,
        user: mockCompanyAdmin,
        token: 'mock-token',
      });

      render(
        <TestWrapper store={store}>
          <Header />
        </TestWrapper>
      );

      expect(screen.queryByText(/system admin/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/all companies/i)).not.toBeInTheDocument();
    });
  });

  describe('When user is authenticated as super admin', () => {
    const mockSuperAdmin = {
      _id: '3',
      email: 'superadmin@example.com',
      firstName: 'Super',
      lastName: 'Admin',
      role: 'admin',
    };

    it('should render super admin navigation', () => {
      const store = createMockStore({
        isAuthenticated: true,
        user: mockSuperAdmin,
        token: 'mock-token',
      });

      render(
        <TestWrapper store={store}>
          <Header />
        </TestWrapper>
      );

      expect(screen.getByText(/admin dashboard/i)).toBeInTheDocument();
      expect(screen.getByText(/manage companies/i)).toBeInTheDocument();
      expect(screen.getByText(/all users/i)).toBeInTheDocument();
      expect(screen.getByText(/system settings/i)).toBeInTheDocument();
    });

    it('should show all admin capabilities', () => {
      const store = createMockStore({
        isAuthenticated: true,
        user: mockSuperAdmin,
        token: 'mock-token',
      });

      render(
        <TestWrapper store={store}>
          <Header />
        </TestWrapper>
      );

      expect(screen.getByText(/companies/i)).toBeInTheDocument();
      expect(screen.getByText(/users/i)).toBeInTheDocument();
      expect(screen.getByText(/analytics/i)).toBeInTheDocument();
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

      // Mock the logout action
      const mockLogout = jest.fn();
      jest.spyOn(store, 'dispatch').mockImplementation(mockLogout);

      render(
        <TestWrapper store={store}>
          <Header />
        </TestWrapper>
      );

      const logoutButton = screen.getByText(/logout/i);
      fireEvent.click(logoutButton);

      await waitFor(() => {
        expect(mockLogout).toHaveBeenCalled();
      });
    });

    it('should show confirmation dialog before logout', () => {
      const store = createMockStore({
        isAuthenticated: true,
        user: mockUser,
        token: 'mock-token',
      });

      render(
        <TestWrapper store={store}>
          <Header />
        </TestWrapper>
      );

      const logoutButton = screen.getByText(/logout/i);
      fireEvent.click(logoutButton);

      expect(screen.getByText(/are you sure you want to log out/i)).toBeInTheDocument();
    });
  });

  describe('Responsive behavior', () => {
    it('should hide navigation items on mobile', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      );

      const navItems = screen.getAllByRole('link');
      navItems.forEach(item => {
        expect(item).toHaveClass('md:block');
      });
    });

    it('should show mobile menu toggle on small screens', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      );

      expect(screen.getByRole('button', { name: /menu/i })).toBeInTheDocument();
    });
  });

  describe('Search functionality', () => {
    it('should render search input', () => {
      render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      );

      expect(screen.getByPlaceholderText(/search bounce houses/i)).toBeInTheDocument();
    });

    it('should handle search input changes', () => {
      render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      );

      const searchInput = screen.getByPlaceholderText(/search bounce houses/i);
      fireEvent.change(searchInput, { target: { value: 'princess castle' } });

      expect(searchInput).toHaveValue('princess castle');
    });

    it('should trigger search on form submit', () => {
      const mockNavigate = jest.fn();
      jest.mock('react-router-dom', () => ({
        ...jest.requireActual('react-router-dom'),
        useNavigate: () => mockNavigate,
      }));

      render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      );

      const searchForm = screen.getByRole('form');
      const searchInput = screen.getByPlaceholderText(/search bounce houses/i);
      
      fireEvent.change(searchInput, { target: { value: 'princess' } });
      fireEvent.submit(searchForm);

      expect(mockNavigate).toHaveBeenCalledWith('/bounce-houses?search=princess');
    });
  });

  describe('Notifications', () => {
    it('should show notification bell for authenticated users', () => {
      const store = createMockStore({
        isAuthenticated: true,
        user: {
          _id: '1',
          email: 'user@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'user',
        },
        token: 'mock-token',
      });

      render(
        <TestWrapper store={store}>
          <Header />
        </TestWrapper>
      );

      expect(screen.getByTestId('notification-bell')).toBeInTheDocument();
    });

    it('should show notification count badge when there are notifications', () => {
      const store = createMockStore({
        isAuthenticated: true,
        user: {
          _id: '1',
          email: 'user@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'user',
          unreadNotifications: 5,
        },
        token: 'mock-token',
      });

      render(
        <TestWrapper store={store}>
          <Header />
        </TestWrapper>
      );

      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByTestId('notification-badge')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      );

      expect(screen.getByRole('banner')).toBeInTheDocument();
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByLabelText(/main navigation/i)).toBeInTheDocument();
    });

    it('should be keyboard navigable', () => {
      render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      );

      const firstLink = screen.getAllByRole('link')[0];
      firstLink.focus();
      
      expect(firstLink).toHaveFocus();
      
      // Test tab navigation
      fireEvent.keyDown(firstLink, { key: 'Tab' });
      // Next focusable element should receive focus
    });

    it('should have skip navigation link', () => {
      render(
        <TestWrapper>
          <Header />
        </TestWrapper>
      );

      expect(screen.getByText(/skip to main content/i)).toBeInTheDocument();
    });
  });

  describe('Loading states', () => {
    it('should show loading state while authenticating', () => {
      const store = createMockStore({
        loading: true,
        isAuthenticated: false,
        user: null,
      });

      render(
        <TestWrapper store={store}>
          <Header />
        </TestWrapper>
      );

      expect(screen.getByTestId('header-loading')).toBeInTheDocument();
    });

    it('should hide user menu while loading', () => {
      const store = createMockStore({
        loading: true,
        isAuthenticated: true,
        user: {
          _id: '1',
          email: 'user@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'user',
        },
      });

      render(
        <TestWrapper store={store}>
          <Header />
        </TestWrapper>
      );

      expect(screen.queryByText(/john doe/i)).not.toBeInTheDocument();
    });
  });
});