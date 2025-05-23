import express from 'express';
import {
  createBounceHouse,
  getBounceHouses,
  getBounceHouseById,
  updateBounceHouse,
  deleteBounceHouse,
  addReview
} from '../controllers/bounceHouseController';
import { auth, adminAuth } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/', getBounceHouses);
router.get('/:id', getBounceHouseById);

// Protected routes
router.post('/:id/reviews', auth, addReview);

// Admin routes
router.post('/', adminAuth, createBounceHouse);
router.patch('/:id', adminAuth, updateBounceHouse);
router.delete('/:id', adminAuth, deleteBounceHouse);

export default router; 