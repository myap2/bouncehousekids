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
import { auth, adminAuth, bounceHouseAuth } from '../middleware/auth';
import { tenantMiddleware, requireCompany } from '../middleware/tenant';
import Company from '../models/Company';
import { updateCompanyCoordinates, batchUpdateCompanyCoordinates } from '../services/locationService';

const router = express.Router();

interface AuthRequest extends express.Request {
  user?: any;
}

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

// Update coordinates for a specific company
router.post('/:id/update-coordinates', bounceHouseAuth, async (req: AuthRequest, res: express.Response) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Check if company admin is trying to update a different company
    if (req.user?.role === 'company-admin' && 
        company._id.toString() !== req.user.company.toString()) {
      return res.status(403).json({ 
        message: 'Access denied. You can only update your own company.' 
      });
    }

    await updateCompanyCoordinates(company);
    res.json({ 
      message: 'Coordinates updated successfully',
      coordinates: company.address.coordinates 
    });
  } catch (error) {
    console.error('Error updating company coordinates:', error);
    res.status(500).json({ message: 'Error updating coordinates' });
  }
});

// Batch update coordinates for all companies (admin only)
router.post('/batch-update-coordinates', adminAuth, async (req: express.Request, res: express.Response) => {
  try {
    const companies = await Company.find({ isActive: true });
    await batchUpdateCompanyCoordinates(companies);
    res.json({ 
      message: `Batch coordinate update completed for ${companies.length} companies` 
    });
  } catch (error) {
    console.error('Error batch updating coordinates:', error);
    res.status(500).json({ message: 'Error batch updating coordinates' });
  }
});

// Get companies within delivery radius of a location
router.get('/delivery-available', async (req: express.Request, res: express.Response) => {
  try {
    const { zipCode, latitude, longitude, city, state } = req.query;
    
    if (!zipCode && !latitude && !longitude && !city && !state) {
      return res.status(400).json({ 
        message: 'Please provide zipCode, coordinates (latitude/longitude), or city/state' 
      });
    }

    // This endpoint returns companies that can deliver to the specified location
    // Implementation depends on your specific needs
    const companies = await Company.find({ isActive: true });
    
    // For now, return all companies with their delivery radius info
    const companiesWithDeliveryInfo = companies.map(company => ({
      _id: company._id,
      name: company.name,
      address: company.address,
      deliveryRadius: company.settings.deliveryRadius,
      deliveryFee: company.settings.deliveryFee
    }));

    res.json({
      companies: companiesWithDeliveryInfo,
      total: companiesWithDeliveryInfo.length
    });
  } catch (error) {
    console.error('Error fetching delivery available companies:', error);
    res.status(500).json({ message: 'Error fetching companies' });
  }
});

export default router;