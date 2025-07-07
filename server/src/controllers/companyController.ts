import { Request, Response } from 'express';
import Company from '../models/Company';
import User from '../models/User';
import BounceHouse from '../models/BounceHouse';

export const createCompany = async (req: Request, res: Response) => {
  try {
    const company = new Company(req.body);
    await company.save();

    // Create a company admin user if provided
    if (req.body.adminUser) {
      const adminUser = new User({
        ...req.body.adminUser,
        role: 'company-admin',
        company: company._id
      });
      await adminUser.save();
    }

    res.status(201).json(company);
  } catch (error) {
    console.error('Error creating company:', error); // Log the real error
    if ((error as any).code === 11000) {
      res.status(400).json({ message: 'Subdomain already exists' });
    } else {
      res.status(400).json({ message: (error as any).message || 'Error creating company' });
    }
  }
};

export const getCompany = async (req: Request, res: Response) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    res.json(company);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching company' });
  }
};

export const updateCompany = async (req: Request, res: Response) => {
  try {
    const company = await Company.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    
    res.json(company);
  } catch (error) {
    res.status(400).json({ message: 'Error updating company' });
  }
};

export const deleteCompany = async (req: Request, res: Response) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Soft delete - deactivate instead of removing
    company.isActive = false;
    await company.save();

    res.json({ message: 'Company deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting company' });
  }
};

export const getCompanyStats = async (req: Request, res: Response) => {
  try {
    const companyId = req.params.id;
    
    const [userCount, bounceHouseCount, totalBookings] = await Promise.all([
      User.countDocuments({ company: companyId }),
      BounceHouse.countDocuments({ company: companyId }),
      // We'll add booking count later once we update the booking model
      Promise.resolve(0)
    ]);

    res.json({
      userCount,
      bounceHouseCount,
      totalBookings
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching company stats' });
  }
};

export const getCompanyBranding = async (req: Request, res: Response) => {
  try {
    if (!req.company) {
      return res.status(400).json({ message: 'Company context required' });
    }

    const branding = {
      name: req.company.name,
      branding: req.company.branding,
      settings: {
        currency: req.company.settings.currency,
        timezone: req.company.settings.timezone,
        businessHours: req.company.settings.businessHours
      },
      contact: {
        email: req.company.email,
        phone: req.company.phone,
        address: req.company.address
      },
      socialMedia: req.company.socialMedia
    };

    res.json(branding);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching company branding' });
  }
};

export const updateCompanyBranding = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'company-admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (!req.company) {
      return res.status(400).json({ message: 'Company context required' });
    }

    const allowedFields = ['branding', 'settings', 'socialMedia'];
    const updates: any = {};

    allowedFields.forEach(field => {
      if (req.body[field]) {
        updates[field] = req.body[field];
      }
    });

    const company = await Company.findByIdAndUpdate(
      req.company._id,
      updates,
      { new: true, runValidators: true }
    );

    res.json(company);
  } catch (error) {
    res.status(400).json({ message: 'Error updating company branding' });
  }
};

export const getAllCompanies = async (req: Request, res: Response) => {
  try {
    const companies = await Company.find({ isActive: true })
      .select('_id name subdomain email phone plan isActive createdAt')
      .sort({ createdAt: -1 });
    
    res.json(companies);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching companies' });
  }
};