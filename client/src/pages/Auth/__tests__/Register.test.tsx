import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import userEvent from '@testing-library/user-event';
import Register from '../Register';
import authReducer from '../../../store/slices/authSlice';

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock the API service
jest.mock('../../../services/api', () => ({
  authAPI: {
    register: jest.fn(),
    login: jest.fn(),
    getProfile: jest.fn(),
    updateProfile: jest.fn(),
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

describe('Register Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Form Rendering', () => {
    it('should render all form fields', () => {
      render(<TestWrapper><Register /></TestWrapper>);

      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/street address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/city/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/state/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/zip code/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    });

    it('should render page title and subtitle', () => {
      render(<TestWrapper><Register /></TestWrapper>);

      expect(screen.getByText(/create account/i)).toBeInTheDocument();
      expect(screen.getByText(/join bouncehouse kids today/i)).toBeInTheDocument();
    });

    it('should render login link', () => {
      render(<TestWrapper><Register /></TestWrapper>);

      expect(screen.getByText(/already have an account/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show error for empty required fields', async () => {
      const user = userEvent.setup();
      render(<TestWrapper><Register /></TestWrapper>);

      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/last name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/phone number is required/i)).toBeInTheDocument();
        expect(screen.getByText(/street address is required/i)).toBeInTheDocument();
        expect(screen.getByText(/city is required/i)).toBeInTheDocument();
        expect(screen.getByText(/state is required/i)).toBeInTheDocument();
        expect(screen.getByText(/zip code is required/i)).toBeInTheDocument();
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
        expect(screen.getByText(/please confirm your password/i)).toBeInTheDocument();
      });
    });

    it('should show error for invalid email format', async () => {
      const user = userEvent.setup();
      render(<TestWrapper><Register /></TestWrapper>);

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'invalid-email');

      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email is invalid/i)).toBeInTheDocument();
      });
    });

    it('should show error for password too short', async () => {
      const user = userEvent.setup();
      render(<TestWrapper><Register /></TestWrapper>);

      const passwordInput = screen.getByLabelText(/^password$/i);
      await user.type(passwordInput, '123');

      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
      });
    });

    it('should show error for mismatched passwords', async () => {
      const user = userEvent.setup();
      render(<TestWrapper><Register /></TestWrapper>);

      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      
      await user.type(passwordInput, 'password123');
      await user.type(confirmPasswordInput, 'differentpassword');

      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      });
    });

    it('should clear errors when user starts typing', async () => {
      const user = userEvent.setup();
      render(<TestWrapper><Register /></TestWrapper>);

      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
      });

      const firstNameInput = screen.getByLabelText(/first name/i);
      await user.type(firstNameInput, 'John');

      await waitFor(() => {
        expect(screen.queryByText(/first name is required/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Submission', () => {
    it('should submit form with valid data', async () => {
      const user = userEvent.setup();
      const mockStore = createMockStore();
      
      render(<TestWrapper store={mockStore}><Register /></TestWrapper>);

      // Fill out the form
      await user.type(screen.getByLabelText(/first name/i), 'John');
      await user.type(screen.getByLabelText(/last name/i), 'Doe');
      await user.type(screen.getByLabelText(/email/i), 'john.doe@example.com');
      await user.type(screen.getByLabelText(/phone number/i), '123-456-7890');
      await user.type(screen.getByLabelText(/street address/i), '123 Main St');
      await user.type(screen.getByLabelText(/city/i), 'Anytown');
      await user.type(screen.getByLabelText(/state/i), 'CA');
      await user.type(screen.getByLabelText(/zip code/i), '12345');
      await user.type(screen.getByLabelText(/^password$/i), 'password123');
      await user.type(screen.getByLabelText(/confirm password/i), 'password123');

      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      // Check that the Redux action was dispatched
      await waitFor(() => {
        const state = mockStore.getState();
        expect(state.auth.loading).toBe(true);
      });
    });

    it('should show loading state during submission', async () => {
      const user = userEvent.setup();
      const mockStore = createMockStore({ loading: true });
      
      render(<TestWrapper store={mockStore}><Register /></TestWrapper>);

      const submitButton = screen.getByRole('button', { name: /creating account/i });
      expect(submitButton).toBeDisabled();
    });

    it('should navigate to home page on successful registration', async () => {
      const user = userEvent.setup();
      const mockStore = createMockStore();
      
      render(<TestWrapper store={mockStore}><Register /></TestWrapper>);

      // Fill out the form
      await user.type(screen.getByLabelText(/first name/i), 'John');
      await user.type(screen.getByLabelText(/last name/i), 'Doe');
      await user.type(screen.getByLabelText(/email/i), 'john.doe@example.com');
      await user.type(screen.getByLabelText(/phone number/i), '123-456-7890');
      await user.type(screen.getByLabelText(/street address/i), '123 Main St');
      await user.type(screen.getByLabelText(/city/i), 'Anytown');
      await user.type(screen.getByLabelText(/state/i), 'CA');
      await user.type(screen.getByLabelText(/zip code/i), '12345');
      await user.type(screen.getByLabelText(/^password$/i), 'password123');
      await user.type(screen.getByLabelText(/confirm password/i), 'password123');

      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      // Simulate successful registration
      await waitFor(() => {
        mockStore.dispatch({
          type: 'auth/register/fulfilled',
          payload: {
            token: 'mock-token',
            user: {
              _id: '1',
              email: 'john.doe@example.com',
              firstName: 'John',
              lastName: 'Doe',
              role: 'customer'
            }
          }
        });
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });
  });

  describe('Error Handling', () => {
    it('should display Redux error state', () => {
      const mockStore = createMockStore({ 
        error: 'Registration failed. Please try again.' 
      });
      
      render(<TestWrapper store={mockStore}><Register /></TestWrapper>);

      expect(screen.getByText(/registration failed. please try again./i)).toBeInTheDocument();
    });

    it('should display form validation errors', async () => {
      const user = userEvent.setup();
      render(<TestWrapper><Register /></TestWrapper>);

      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
      });
    });

    it('should handle API errors', async () => {
      const user = userEvent.setup();
      const mockStore = createMockStore();
      
      render(<TestWrapper store={mockStore}><Register /></TestWrapper>);

      // Fill out the form
      await user.type(screen.getByLabelText(/first name/i), 'John');
      await user.type(screen.getByLabelText(/last name/i), 'Doe');
      await user.type(screen.getByLabelText(/email/i), 'john.doe@example.com');
      await user.type(screen.getByLabelText(/phone number/i), '123-456-7890');
      await user.type(screen.getByLabelText(/street address/i), '123 Main St');
      await user.type(screen.getByLabelText(/city/i), 'Anytown');
      await user.type(screen.getByLabelText(/state/i), 'CA');
      await user.type(screen.getByLabelText(/zip code/i), '12345');
      await user.type(screen.getByLabelText(/^password$/i), 'password123');
      await user.type(screen.getByLabelText(/confirm password/i), 'password123');

      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      // Simulate API error
      await waitFor(() => {
        mockStore.dispatch({
          type: 'auth/register/rejected',
          payload: 'User already exists'
        });
      });

      await waitFor(() => {
        expect(screen.getByText(/user already exists/i)).toBeInTheDocument();
      });
    });
  });

  describe('User Interactions', () => {
    it('should handle input changes correctly', async () => {
      const user = userEvent.setup();
      render(<TestWrapper><Register /></TestWrapper>);

      const firstNameInput = screen.getByLabelText(/first name/i);
      await user.type(firstNameInput, 'John');

      expect(firstNameInput).toHaveValue('John');
    });

    it('should handle address field changes', async () => {
      const user = userEvent.setup();
      render(<TestWrapper><Register /></TestWrapper>);

      const streetInput = screen.getByLabelText(/street address/i);
      const cityInput = screen.getByLabelText(/city/i);
      const stateInput = screen.getByLabelText(/state/i);
      const zipInput = screen.getByLabelText(/zip code/i);

      await user.type(streetInput, '123 Main St');
      await user.type(cityInput, 'Anytown');
      await user.type(stateInput, 'CA');
      await user.type(zipInput, '12345');

      expect(streetInput).toHaveValue('123 Main St');
      expect(cityInput).toHaveValue('Anytown');
      expect(stateInput).toHaveValue('CA');
      expect(zipInput).toHaveValue('12345');
    });

    it('should clear errors when user starts typing in address fields', async () => {
      const user = userEvent.setup();
      render(<TestWrapper><Register /></TestWrapper>);

      const submitButton = screen.getByRole('button', { name: /create account/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/street address is required/i)).toBeInTheDocument();
      });

      const streetInput = screen.getByLabelText(/street address/i);
      await user.type(streetInput, '123 Main St');

      await waitFor(() => {
        expect(screen.queryByText(/street address is required/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper form labels', () => {
      render(<TestWrapper><Register /></TestWrapper>);

      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/street address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/city/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/state/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/zip code/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    });

    it('should have proper input types', () => {
      render(<TestWrapper><Register /></TestWrapper>);

      expect(screen.getByLabelText(/email/i)).toHaveAttribute('type', 'email');
      expect(screen.getByLabelText(/phone number/i)).toHaveAttribute('type', 'tel');
      expect(screen.getByLabelText(/^password$/i)).toHaveAttribute('type', 'password');
      expect(screen.getByLabelText(/confirm password/i)).toHaveAttribute('type', 'password');
    });

    it('should disable submit button when loading', () => {
      const mockStore = createMockStore({ loading: true });
      render(<TestWrapper store={mockStore}><Register /></TestWrapper>);

      const submitButton = screen.getByRole('button', { name: /creating account/i });
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Form Structure', () => {
    it('should have proper form structure with rows', () => {
      render(<TestWrapper><Register /></TestWrapper>);

      // Check that first name and last name are in a row
      const firstNameInput = screen.getByLabelText(/first name/i);
      const lastNameInput = screen.getByLabelText(/last name/i);
      
      // Check that city and state are in a row
      const cityInput = screen.getByLabelText(/city/i);
      const stateInput = screen.getByLabelText(/state/i);

      // These should be in form-row containers
      expect(firstNameInput.closest('.form-row')).toBeInTheDocument();
      expect(lastNameInput.closest('.form-row')).toBeInTheDocument();
      expect(cityInput.closest('.form-row')).toBeInTheDocument();
      expect(stateInput.closest('.form-row')).toBeInTheDocument();
    });

    it('should have proper field order', () => {
      render(<TestWrapper><Register /></TestWrapper>);

      const inputs = screen.getAllByRole('textbox');
      const passwords = screen.getAllByDisplayValue('');

      // Check that required fields are present in expected order
      expect(inputs[0]).toHaveAttribute('name', 'firstName');
      expect(inputs[1]).toHaveAttribute('name', 'lastName');
      expect(inputs[2]).toHaveAttribute('name', 'email');
      expect(inputs[3]).toHaveAttribute('name', 'phone');
      expect(inputs[4]).toHaveAttribute('name', 'address.street');
      expect(inputs[5]).toHaveAttribute('name', 'address.city');
      expect(inputs[6]).toHaveAttribute('name', 'address.state');
      expect(inputs[7]).toHaveAttribute('name', 'address.zipCode');
    });
  });
}); 