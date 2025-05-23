import express from 'express';
import {
  createBooking,
  getBookings,
  getBookingById,
  cancelBooking
} from '../controllers/bookingController';
import { auth } from '../middleware/auth';

const router = express.Router();

// All booking routes require authentication
router.use(auth);

router.post('/', createBooking);
router.get('/', getBookings);
router.get('/:id', getBookingById);
router.post('/:id/cancel', cancelBooking);

export default router; 