import express from 'express';
import {
  createWaiver,
  getUserWaivers,
  getWaiverById,
  checkWaiverStatus,
  getWaiverTemplate,
  getCompanyWaivers
} from '../controllers/waiverController';
import { auth } from '../middleware/auth';
import { tenantMiddleware, requireCompany } from '../middleware/tenant';

const router = express.Router();

// All routes require tenant context
router.use(tenantMiddleware);
router.use(requireCompany);

// Public routes (no auth required)
router.get('/template', getWaiverTemplate);

// User routes (require authentication)
router.post('/', auth, createWaiver);
router.get('/my-waivers', auth, getUserWaivers);
router.get('/check-status', auth, checkWaiverStatus);
router.get('/:id', auth, getWaiverById);

// Admin routes (company admin or super admin)
router.get('/admin/all', auth, getCompanyWaivers);

export default router;