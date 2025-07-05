import { Request, Response, NextFunction } from 'express';
import Company from '../models/Company';
import { ICompany } from '../models/Company';

declare global {
  namespace Express {
    interface Request {
      company?: ICompany;
    }
  }
}

export const tenantMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const host = req.get('host');
    
    if (!host) {
      return res.status(400).json({ message: 'Host header is required' });
    }

    let company: ICompany | null = null;

    // Check if it's a custom domain
    if (!host.includes('bouncehousekids.com') && !host.includes('localhost')) {
      company = await Company.findOne({ domain: host, isActive: true });
    } else {
      // Extract subdomain (e.g., 'abc' from 'abc.bouncehousekids.com')
      const subdomain = host.split('.')[0];
      
      // Skip if it's the main domain or localhost
      if (subdomain === 'www' || subdomain === 'api' || host.includes('localhost')) {
        return next();
      }
      
      company = await Company.findOne({ subdomain, isActive: true });
    }

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    req.company = company;
    next();
  } catch (error) {
    console.error('Tenant middleware error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const requireCompany = (req: Request, res: Response, next: NextFunction) => {
  if (!req.company) {
    return res.status(400).json({ message: 'Company context is required' });
  }
  next();
};