import express from 'express';
import {
  createBounceHouse,
  getBounceHouses,
  getBounceHouseById,
  updateBounceHouse,
  deleteBounceHouse,
  addReview,
  getMyCompanyBounceHouses,
  searchBounceHousesByLocation
} from '../controllers/bounceHouseController';
import { auth, adminAuth, bounceHouseAuth } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/', getBounceHouses);
router.get('/search/location', searchBounceHousesByLocation);
router.get('/:id', getBounceHouseById);

// Protected routes
router.post('/:id/reviews', auth, addReview);

// Company Admin routes
router.get('/my-company', bounceHouseAuth, getMyCompanyBounceHouses);

// Admin and Company Admin routes
router.post('/', bounceHouseAuth, createBounceHouse);
router.patch('/:id', bounceHouseAuth, updateBounceHouse);
router.delete('/:id', bounceHouseAuth, deleteBounceHouse);

export default router; 