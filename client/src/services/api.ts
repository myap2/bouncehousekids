import axios from 'axios';
import { User, BounceHouse, Booking } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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

export default api; 