import express from 'express';
import {
  createCompany,
  getCompany,
  updateCompany,
  deleteCompany,
  getCompanyStats,
  getCompanyBranding,
  updateCompanyBranding,
  getAllCompanies
} from '../controllers/companyController';
import { auth, adminAuth } from '../middleware/auth';
import { tenantMiddleware, requireCompany } from '../middleware/tenant';

const router = express.Router();

// Temporary test route (remove in production)
router.post('/test', createCompany);

// Super admin routes (for platform management)
router.get('/', adminAuth, getAllCompanies);
router.post('/', adminAuth, createCompany);
router.get('/:id', adminAuth, getCompany);
router.put('/:id', adminAuth, updateCompany);
router.delete('/:id', adminAuth, deleteCompany);
router.get('/:id/stats', adminAuth, getCompanyStats);

// Tenant-specific routes (for company branding/settings)
router.get('/branding', tenantMiddleware, requireCompany, getCompanyBranding);
router.put('/branding', tenantMiddleware, requireCompany, auth, updateCompanyBranding);

export default router;