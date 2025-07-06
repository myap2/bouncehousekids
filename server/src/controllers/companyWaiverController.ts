import { Request, Response } from 'express';
import CompanyWaiverTemplate from '../models/CompanyWaiverTemplate';
import { uploadToCloudinary, deleteFile } from '../services/uploadService';

// Get all waiver templates for a company
export const getCompanyWaiverTemplates = async (req: Request, res: Response) => {
  try {
    if (!req.company) {
      return res.status(400).json({ message: 'Company context required' });
    }

    const includeInactive = req.query.includeInactive === 'true';
    const filter: any = { company: req.company._id };
    
    if (!includeInactive) {
      filter.isActive = true;
    }

    const templates = await CompanyWaiverTemplate.find(filter)
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName')
      .sort({ isDefault: -1, version: -1, name: 1 });

    res.json(templates);
  } catch (error: unknown) {
    console.error('Error fetching waiver templates:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error fetching waiver templates';
    res.status(500).json({ message: errorMessage });
  }
};

// Get specific waiver template
export const getWaiverTemplate = async (req: Request, res: Response) => {
  try {
    if (!req.company) {
      return res.status(400).json({ message: 'Company context required' });
    }

    const template = await CompanyWaiverTemplate.findOne({
      _id: req.params.id,
      company: req.company._id
    })
    .populate('createdBy', 'firstName lastName')
    .populate('updatedBy', 'firstName lastName');

    if (!template) {
      return res.status(404).json({ message: 'Waiver template not found' });
    }

    res.json(template);
  } catch (error: unknown) {
    console.error('Error fetching waiver template:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error fetching waiver template';
    res.status(500).json({ message: errorMessage });
  }
};

// Get default waiver template for a company
export const getDefaultWaiverTemplate = async (req: Request, res: Response) => {
  try {
    if (!req.company) {
      return res.status(400).json({ message: 'Company context required' });
    }

    let template = await CompanyWaiverTemplate.findOne({
      company: req.company._id,
      isDefault: true,
      isActive: true
    });

    // If no default template, create one with standard waiver text
    if (!template) {
      template = await createDefaultWaiverTemplate(req.company._id, req.user!._id);
    }

    res.json(template);
  } catch (error: unknown) {
    console.error('Error fetching default waiver template:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error fetching default waiver template';
    res.status(500).json({ message: errorMessage });
  }
};

// Create new waiver template
export const createWaiverTemplate = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.company) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Check if user has permission to create waiver templates
    if (req.user.role !== 'admin' && req.user.role !== 'company-admin') {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    const {
      name,
      description,
      waiverText,
      documentType,
      isDefault,
      settings,
      customFields,
      legalRequirements
    } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ message: 'Template name is required' });
    }

    if (documentType === 'text' && !waiverText) {
      return res.status(400).json({ message: 'Waiver text is required for text type' });
    }

    // Handle file upload for PDF/DOCX types
    let documentUrl;
    if ((documentType === 'pdf' || documentType === 'docx') && req.file) {
      if (process.env.UPLOAD_STORAGE_TYPE === 'cloudinary') {
        documentUrl = await uploadToCloudinary(req.file.buffer, req.file.originalname);
      } else {
        // Handle other storage types or local storage
        documentUrl = `/uploads/${req.file.filename}`;
      }
    }

    // If setting as default, remove default status from other templates
    if (isDefault) {
      await CompanyWaiverTemplate.updateMany(
        { company: req.company._id },
        { isDefault: false }
      );
    }

    const template = new CompanyWaiverTemplate({
      company: req.company._id,
      name,
      description,
      waiverText,
      documentUrl,
      documentType: documentType || 'text',
      isDefault: isDefault || false,
      settings: {
        requiresWitness: settings?.requiresWitness || false,
        requiresParentSignature: settings?.requiresParentSignature !== false,
        validityDays: settings?.validityDays || 365,
        requiresMedicalInfo: settings?.requiresMedicalInfo !== false,
        requiresEmergencyContact: settings?.requiresEmergencyContact !== false,
        allowsOnlineSignature: settings?.allowsOnlineSignature !== false,
        requiresInPersonSignature: settings?.requiresInPersonSignature || false
      },
      customFields: customFields || [],
      legalRequirements: {
        state: legalRequirements?.state,
        country: legalRequirements?.country || 'US',
        complianceNotes: legalRequirements?.complianceNotes,
        lastReviewedDate: legalRequirements?.lastReviewedDate,
        reviewedBy: legalRequirements?.reviewedBy
      },
      createdBy: req.user._id,
      updatedBy: req.user._id
    });

    await template.save();

    const populatedTemplate = await CompanyWaiverTemplate.findById(template._id)
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName');

    res.status(201).json({
      message: 'Waiver template created successfully',
      template: populatedTemplate
    });
  } catch (error: unknown) {
    console.error('Error creating waiver template:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error creating waiver template';
    res.status(400).json({ message: errorMessage });
  }
};

// Update waiver template
export const updateWaiverTemplate = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.company) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Check permissions
    if (req.user.role !== 'admin' && req.user.role !== 'company-admin') {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    const template = await CompanyWaiverTemplate.findOne({
      _id: req.params.id,
      company: req.company._id
    });

    if (!template) {
      return res.status(404).json({ message: 'Waiver template not found' });
    }

    const {
      name,
      description,
      waiverText,
      documentType,
      isDefault,
      settings,
      customFields,
      legalRequirements
    } = req.body;

    // Handle file upload if provided
    let documentUrl = template.documentUrl;
    if ((documentType === 'pdf' || documentType === 'docx') && req.file) {
      // Delete old file if it exists
      if (template.documentUrl) {
        try {
          await deleteFile(template.documentUrl);
        } catch (deleteError) {
          console.error('Error deleting old file:', deleteError);
        }
      }

      // Upload new file
      if (process.env.UPLOAD_STORAGE_TYPE === 'cloudinary') {
        documentUrl = await uploadToCloudinary(req.file.buffer, req.file.originalname);
      } else {
        documentUrl = `/uploads/${req.file.filename}`;
      }
    }

    // If setting as default, remove default status from other templates
    if (isDefault && !template.isDefault) {
      await CompanyWaiverTemplate.updateMany(
        { company: req.company._id, _id: { $ne: template._id } },
        { isDefault: false }
      );
    }

    // Update fields
    if (name !== undefined) template.name = name;
    if (description !== undefined) template.description = description;
    if (waiverText !== undefined) template.waiverText = waiverText;
    if (documentType !== undefined) template.documentType = documentType;
    if (documentUrl !== undefined) template.documentUrl = documentUrl;
    if (isDefault !== undefined) template.isDefault = isDefault;
    if (settings !== undefined) {
      template.settings = {
        ...template.settings,
        ...settings
      };
    }
    if (customFields !== undefined) template.customFields = customFields;
    if (legalRequirements !== undefined) {
      template.legalRequirements = {
        ...template.legalRequirements,
        ...legalRequirements
      };
    }

    template.updatedBy = req.user._id;
    template.version = template.version + 1;

    await template.save();

    const populatedTemplate = await CompanyWaiverTemplate.findById(template._id)
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName');

    res.json({
      message: 'Waiver template updated successfully',
      template: populatedTemplate
    });
  } catch (error: unknown) {
    console.error('Error updating waiver template:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error updating waiver template';
    res.status(400).json({ message: errorMessage });
  }
};

// Delete (deactivate) waiver template
export const deleteWaiverTemplate = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.company) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Check permissions
    if (req.user.role !== 'admin' && req.user.role !== 'company-admin') {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    const template = await CompanyWaiverTemplate.findOne({
      _id: req.params.id,
      company: req.company._id
    });

    if (!template) {
      return res.status(404).json({ message: 'Waiver template not found' });
    }

    // Don't allow deletion of default template if it's the only one
    if (template.isDefault) {
      const otherTemplates = await CompanyWaiverTemplate.countDocuments({
        company: req.company._id,
        isActive: true,
        _id: { $ne: template._id }
      });

      if (otherTemplates === 0) {
        return res.status(400).json({ 
          message: 'Cannot delete the only active waiver template. Create another template first.' 
        });
      }

      // If deleting default template, make another one default
      const nextTemplate = await CompanyWaiverTemplate.findOne({
        company: req.company._id,
        isActive: true,
        _id: { $ne: template._id }
      }).sort({ version: -1 });

      if (nextTemplate) {
        nextTemplate.isDefault = true;
        await nextTemplate.save();
      }
    }

    // Soft delete by setting isActive to false
    template.isActive = false;
    template.updatedBy = req.user._id;
    await template.save();

    // Delete associated file
    if (template.documentUrl) {
      try {
        await deleteFile(template.documentUrl);
      } catch (deleteError) {
        console.error('Error deleting file:', deleteError);
      }
    }

    res.json({ message: 'Waiver template deleted successfully' });
  } catch (error: unknown) {
    console.error('Error deleting waiver template:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error deleting waiver template';
    res.status(500).json({ message: errorMessage });
  }
};

// Set template as default
export const setDefaultWaiverTemplate = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.company) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Check permissions
    if (req.user.role !== 'admin' && req.user.role !== 'company-admin') {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    const template = await CompanyWaiverTemplate.findOne({
      _id: req.params.id,
      company: req.company._id,
      isActive: true
    });

    if (!template) {
      return res.status(404).json({ message: 'Waiver template not found' });
    }

    // Remove default status from all other templates
    await CompanyWaiverTemplate.updateMany(
      { company: req.company._id },
      { isDefault: false }
    );

    // Set this template as default
    template.isDefault = true;
    template.updatedBy = req.user._id;
    await template.save();

    res.json({ message: 'Template set as default successfully' });
  } catch (error: unknown) {
    console.error('Error setting default template:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error setting default template';
    res.status(500).json({ message: errorMessage });
  }
};

// Create default waiver template for a company
const createDefaultWaiverTemplate = async (companyId: string, userId: string) => {
  const defaultWaiverText = `
RELEASE AND WAIVER OF LIABILITY, ASSUMPTION OF RISK, AND INDEMNITY AGREEMENT

IN CONSIDERATION of being permitted to participate in bounce house activities, I acknowledge, appreciate, and agree that:

1. ASSUMPTION OF RISK: I understand that bounce house activities involve risks including but not limited to: physical injury, property damage, or death. These risks may be caused by my own actions, the actions of others, equipment failure, or the condition of the premises.

2. RELEASE: I voluntarily release, discharge, waive, and relinquish any and all claims, actions, or lawsuits for personal injury, property damage, wrongful death, loss of services, lost wages, exemplary damages, or other loss that may arise out of my participation in bounce house activities.

3. INDEMNIFICATION: I agree to indemnify, defend, and hold harmless the Company, its owners, employees, agents, and representatives from any and all claims, actions, suits, procedures, costs, expenses, damages, and liabilities arising out of my participation in these activities.

4. MEDICAL CONDITION: I represent that I am in good health and have no medical conditions that would prevent safe participation in these activities.

5. RULES AND SUPERVISION: I agree to follow all posted rules and instructions from Company staff. I understand that adult supervision is required for children under 12.

6. EQUIPMENT INSPECTION: I acknowledge that I have inspected the bounce house equipment and found it to be in safe operating condition.

7. ASSUMPTION OF RESPONSIBILITY: I assume full responsibility for any injury or damage that may occur during the rental period.

I HAVE READ THIS AGREEMENT, FULLY UNDERSTAND ITS TERMS, UNDERSTAND THAT I HAVE GIVEN UP SUBSTANTIAL RIGHTS BY SIGNING IT, AND SIGN IT FREELY AND VOLUNTARILY WITHOUT ANY INDUCEMENT.

By signing below, I acknowledge that I have read, understood, and agree to be bound by this waiver.
  `.trim();

  const template = new CompanyWaiverTemplate({
    company: companyId,
    name: 'Standard Liability Waiver',
    description: 'Default liability waiver for bounce house activities',
    waiverText: defaultWaiverText,
    documentType: 'text',
    isDefault: true,
    isActive: true,
    settings: {
      requiresWitness: false,
      requiresParentSignature: true,
      validityDays: 365,
      requiresMedicalInfo: true,
      requiresEmergencyContact: true,
      allowsOnlineSignature: true,
      requiresInPersonSignature: false
    },
    customFields: [],
    legalRequirements: {
      country: 'US'
    },
    createdBy: userId,
    updatedBy: userId
  });

  return await template.save();
};