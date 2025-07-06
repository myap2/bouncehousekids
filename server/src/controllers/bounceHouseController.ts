import { Request, Response } from 'express';
import BounceHouse from '../models/BounceHouse';

interface AuthRequest extends Request {
  user?: any;
}

export const createBounceHouse = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const bounceHouseData = { ...req.body };
    
    // For company admins, automatically set the company to their company
    if (req.user.role === 'company-admin') {
      bounceHouseData.company = req.user.company;
    }
    
    // For super admins, company must be provided in the request
    if (req.user.role === 'admin' && !bounceHouseData.company) {
      return res.status(400).json({ 
        message: 'Company ID is required for creating bounce houses' 
      });
    }

    const bounceHouse = new BounceHouse(bounceHouseData);
    await bounceHouse.save();
    
    // Populate company info for the response
    await bounceHouse.populate('company', 'name');
    
    res.status(201).json(bounceHouse);
  } catch (error: unknown) {
    console.error('Error creating bounce house:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error creating bounce house';
    res.status(400).json({ message: errorMessage });
  }
};

export const getBounceHouses = async (req: Request, res: Response) => {
  try {
    const {
      theme,
      minCapacity,
      maxPrice,
      startDate,
      endDate,
      company
    } = req.query;

    const query: any = { isActive: true };

    if (theme) {
      query.theme = theme;
    }

    if (minCapacity) {
      query['capacity.maxOccupants'] = { $gte: Number(minCapacity) };
    }

    if (maxPrice) {
      query['price.daily'] = { $lte: Number(maxPrice) };
    }

    if (company) {
      query.company = company;
    }

    if (startDate && endDate) {
      query.availability = {
        $not: {
          $elemMatch: {
            startDate: { $lte: new Date(endDate as string) },
            endDate: { $gte: new Date(startDate as string) }
          }
        }
      };
    }

    const bounceHouses = await BounceHouse.find(query)
      .populate('company', 'name location')
      .sort({ rating: -1 });

    res.json(bounceHouses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bounce houses' });
  }
};

export const getBounceHouseById = async (req: Request, res: Response) => {
  try {
    const bounceHouse = await BounceHouse.findById(req.params.id)
      .populate('company', 'name location contact');
    
    if (!bounceHouse) {
      return res.status(404).json({ message: 'Bounce house not found' });
    }
    
    res.json(bounceHouse);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bounce house' });
  }
};

export const updateBounceHouse = async (req: AuthRequest, res: Response) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = [
    'name',
    'description',
    'theme',
    'dimensions',
    'capacity',
    'price',
    'images',
    'features',
    'availability',
    'isActive'
  ];

  // Super admins can update company field, company admins cannot
  if (req.user?.role === 'admin') {
    allowedUpdates.push('company');
  }

  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).json({ message: 'Invalid updates' });
  }

  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const bounceHouse = await BounceHouse.findById(req.params.id);
    if (!bounceHouse) {
      return res.status(404).json({ message: 'Bounce house not found' });
    }

    // Check if company admin is trying to update a bounce house from a different company
    if (req.user.role === 'company-admin' && 
        bounceHouse.company.toString() !== req.user.company.toString()) {
      return res.status(403).json({ 
        message: 'Access denied. You can only update bounce houses from your own company.' 
      });
    }

    updates.forEach(update => (bounceHouse as any)[update] = req.body[update]);
    await bounceHouse.save();
    
    // Populate company info for the response
    await bounceHouse.populate('company', 'name');
    
    res.json(bounceHouse);
  } catch (error) {
    res.status(400).json({ message: 'Error updating bounce house' });
  }
};

export const deleteBounceHouse = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const bounceHouse = await BounceHouse.findById(req.params.id);
    if (!bounceHouse) {
      return res.status(404).json({ message: 'Bounce house not found' });
    }

    // Check if company admin is trying to delete a bounce house from a different company
    if (req.user.role === 'company-admin' && 
        bounceHouse.company.toString() !== req.user.company.toString()) {
      return res.status(403).json({ 
        message: 'Access denied. You can only delete bounce houses from your own company.' 
      });
    }

    bounceHouse.isActive = false;
    await bounceHouse.save();
    
    res.json({ message: 'Bounce house deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting bounce house' });
  }
};

export const addReview = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const bounceHouse = await BounceHouse.findById(req.params.id);
    if (!bounceHouse) {
      return res.status(404).json({ message: 'Bounce house not found' });
    }

    const { rating, comment } = req.body;
    const review = {
      userId: req.user._id,
      rating,
      comment,
      date: new Date()
    };

    bounceHouse.reviews.push(review);

    // Update average rating
    const totalRating = bounceHouse.reviews.reduce((sum, review) => sum + review.rating, 0);
    bounceHouse.rating = totalRating / bounceHouse.reviews.length;

    await bounceHouse.save();
    res.json(bounceHouse);
  } catch (error) {
    res.status(400).json({ message: 'Error adding review' });
  }
};

// Get bounce houses for the current user's company (for company admins)
export const getMyCompanyBounceHouses = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (req.user.role !== 'company-admin' && req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: 'Access denied. Only company administrators can view company bounce houses.' 
      });
    }

    let query: any = {};
    
    // Company admins can only see their own company's bounce houses
    if (req.user.role === 'company-admin') {
      query.company = req.user.company;
    }
    
    // Super admins can see all bounce houses or filter by company
    if (req.user.role === 'admin' && req.query.company) {
      query.company = req.query.company;
    }

    const bounceHouses = await BounceHouse.find(query)
      .populate('company', 'name location contact')
      .sort({ createdAt: -1 });

    res.json(bounceHouses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching company bounce houses' });
  }
}; 