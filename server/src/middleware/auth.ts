import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

interface AuthRequest extends Request {
  user?: any;
}

export const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new Error();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findOne({ _id: (decoded as any)._id });

    if (!user) {
      throw new Error();
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Please authenticate.' });
  }
};

export const adminAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await auth(req, res, () => {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
      }
      next();
    });
  } catch (error) {
    res.status(401).json({ message: 'Please authenticate.' });
  }
};

// New middleware for bounce house management - allows both admin and company-admin
export const bounceHouseAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await auth(req, res, () => {
      if (req.user.role !== 'admin' && req.user.role !== 'company-admin') {
        return res.status(403).json({ 
          message: 'Access denied. Only administrators and company administrators can manage bounce houses.' 
        });
      }
      
      // Company admins must have a company associated
      if (req.user.role === 'company-admin' && !req.user.company) {
        return res.status(403).json({ 
          message: 'Access denied. Company administrators must be associated with a company.' 
        });
      }
      
      next();
    });
  } catch (error) {
    res.status(401).json({ message: 'Please authenticate.' });
  }
}; 