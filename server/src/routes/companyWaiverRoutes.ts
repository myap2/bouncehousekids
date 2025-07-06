import express from 'express';
import { 
  getCompanyWaiverTemplates,
  getWaiverTemplate,
  getDefaultWaiverTemplate,
  createWaiverTemplate,
  updateWaiverTemplate,
  deleteWaiverTemplate,
  setDefaultWaiverTemplate
} from '../controllers/companyWaiverController';
import { auth } from '../middleware/auth';
import { tenantMiddleware, requireCompany } from '../middleware/tenant';
import { createUploadMiddleware } from '../services/uploadService';

const router = express.Router();
const upload = createUploadMiddleware();

// Apply authentication and company context to all routes
router.use(tenantMiddleware);
router.use(requireCompany);
router.use(auth);

// Get all waiver templates for company
router.get('/templates', getCompanyWaiverTemplates);

// Get default waiver template
router.get('/templates/default', getDefaultWaiverTemplate);

// Get specific waiver template
router.get('/templates/:id', getWaiverTemplate);

// Create new waiver template (with optional file upload)
router.post('/templates', upload.single('document'), createWaiverTemplate);

// Update waiver template (with optional file upload)
router.put('/templates/:id', upload.single('document'), updateWaiverTemplate);

// Set template as default
router.patch('/templates/:id/set-default', setDefaultWaiverTemplate);

// Delete waiver template
router.delete('/templates/:id', deleteWaiverTemplate);

export default router;