import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser
} from '../controllers/userController';
import { auth, adminAuth } from '../middleware/auth';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// User routes (require authentication)
router.get('/profile', auth, getUserProfile);
router.put('/profile', auth, updateUserProfile);

// Admin routes (require admin privileges)
router.get('/', adminAuth, getAllUsers);
router.post('/', adminAuth, createUser);
router.put('/:id', adminAuth, updateUser);
router.delete('/:id', adminAuth, deleteUser);

export default router; 