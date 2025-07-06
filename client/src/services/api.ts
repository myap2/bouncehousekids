import axios from 'axios';
import { User, BounceHouse, Booking } from '../types';

// The baseURL should be '/api' so all endpoints are relative to it
const API_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  console.log('API Request:', config.method?.toUpperCase(), config.url);
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.config?.url, error.message);
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData: Partial<User>) => api.post('/users/register', userData),
  login: (email: string, password: string) => api.post('/users/login', { email, password }),
  getProfile: () => api.get('/users/profile'),
  updateProfile: (userData: Partial<User>) => api.patch('/users/profile', userData)
};

// Bounce House API
export const bounceHouseAPI = {
  getAll: (params?: {
    theme?: string;
    minCapacity?: number;
    maxPrice?: number;
    startDate?: string;
    endDate?: string;
  }) => api.get('/bounce-houses', { params }),
  getById: (id: string) => api.get(`/bounce-houses/${id}`),
  create: (bounceHouseData: Partial<BounceHouse>) => api.post('/bounce-houses', bounceHouseData),
  update: (id: string, bounceHouseData: Partial<BounceHouse>) => api.patch(`/bounce-houses/${id}`, bounceHouseData),
  delete: (id: string) => api.delete(`/bounce-houses/${id}`),
  addReview: (id: string, reviewData: { rating: number; comment: string }) =>
    api.post(`/bounce-houses/${id}/reviews`, reviewData)
};

// Booking API
export const bookingAPI = {
  create: (bookingData: Partial<Booking>) => api.post('/bookings', bookingData),
  getAll: () => api.get('/bookings'),
  getById: (id: string) => api.get(`/bookings/${id}`),
  cancel: (id: string, reason: string) => api.post(`/bookings/${id}/cancel`, { reason })
};

// Company API
export const companyAPI = {
  getAll: () => api.get('/companies'),
  getById: (id: string) => api.get(`/companies/${id}`),
  create: (companyData: any) => api.post('/companies', companyData),
  update: (id: string, companyData: any) => api.put(`/companies/${id}`, companyData),
  delete: (id: string) => api.delete(`/companies/${id}`),
  getStats: (id: string) => api.get(`/companies/${id}/stats`),
  getBranding: () => api.get('/companies/branding'),
  updateBranding: (brandingData: any) => api.put('/companies/branding', brandingData)
};

export default api; 