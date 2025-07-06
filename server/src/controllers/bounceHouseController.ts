import { Request, Response } from 'express';
import BounceHouse from '../models/BounceHouse';
import Company from '../models/Company';
import { 
  getZipCodeCoordinates, 
  geocodeAddress, 
  filterCompaniesByDeliveryRadius,
  calculateDistancesToCompanies,
  normalizeZipCode,
  Coordinates 
} from '../services/locationService';

interface AuthRequest extends Request {
  user?: any;
}

interface BounceHouseWithDistance {
  [key: string]: any;
  distance?: number | null;
  withinDeliveryRadius?: boolean | null;
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
      company,
      // Location-based filters
      zipCode,
      city,
      state,
      latitude,
      longitude,
      radius,
      deliveryOnly,
      sortBy
    } = req.query;

    const query: any = { isActive: true };

    // Basic filters
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

    // Date availability filter
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

    // Location-based filtering
    let customerCoordinates: Coordinates | null = null;
    
    // Get customer coordinates from different sources
    if (latitude && longitude) {
      customerCoordinates = {
        latitude: parseFloat(latitude as string),
        longitude: parseFloat(longitude as string)
      };
    } else if (zipCode) {
      customerCoordinates = await getZipCodeCoordinates(normalizeZipCode(zipCode as string));
    } else if (city && state) {
      const address = `${city}, ${state}`;
      customerCoordinates = await geocodeAddress(address);
    }

    // Basic bounce house query
    let bounceHouses = await BounceHouse.find(query)
      .populate('company', 'name location address settings')
      .sort({ rating: -1 });

    let bounceHousesWithDistance: BounceHouseWithDistance[] = [];

    // Apply location-based filtering if coordinates available
    if (customerCoordinates) {
      // Get all companies with coordinates
      const companies = await Company.find({ isActive: true });
      
      let filteredCompanies;
      
      if (deliveryOnly === 'true') {
        // Only show companies that deliver to customer location
        filteredCompanies = filterCompaniesByDeliveryRadius(customerCoordinates, companies);
      } else if (radius) {
        // Show companies within specified radius
        const radiusMiles = parseFloat(radius as string);
        const distanceResults = calculateDistancesToCompanies(customerCoordinates, companies);
        filteredCompanies = distanceResults
          .filter(result => result.distance <= radiusMiles)
          .map(result => ({
            ...result.company.toObject(),
            distance: result.distance
          }));
      } else {
        // Show all companies with distance info
        const distanceResults = calculateDistancesToCompanies(customerCoordinates, companies);
        filteredCompanies = distanceResults.map(result => ({
          ...result.company.toObject(),
          distance: result.distance
        }));
      }

      // Filter bounce houses to only include those from filtered companies
      const companyIds = filteredCompanies.map(company => company._id.toString());
      bounceHouses = bounceHouses.filter(bounceHouse => 
        companyIds.includes(bounceHouse.company._id.toString())
      );

      // Add distance info to bounce houses
      bounceHousesWithDistance = bounceHouses.map(bounceHouse => {
        const company = filteredCompanies.find(c => 
          c._id.toString() === bounceHouse.company._id.toString()
        );
        return {
          ...bounceHouse.toObject(),
          distance: company?.distance || null,
          withinDeliveryRadius: company ? 
            (company.distance <= (company.settings?.deliveryRadius || 25)) : null
        };
      });

      // Sort by distance if requested
      if (sortBy === 'distance') {
        bounceHousesWithDistance.sort((a, b) => {
          if (a.distance === null) return 1;
          if (b.distance === null) return -1;
          return (a.distance || 0) - (b.distance || 0);
        });
      }
    } else {
      // No location filtering, convert to proper format
      bounceHousesWithDistance = bounceHouses.map(bounceHouse => bounceHouse.toObject());
    }

    // Add location-based filters to query for non-coordinate searches
    if (zipCode && !customerCoordinates) {
      const companyQuery: any = { isActive: true };
      companyQuery['address.zipCode'] = normalizeZipCode(zipCode as string);
      const companies = await Company.find(companyQuery);
      const companyIds = companies.map(c => c._id);
      bounceHousesWithDistance = bounceHousesWithDistance.filter(bounceHouse => 
        companyIds.some(id => id.toString() === bounceHouse.company._id.toString())
      );
    }

    if (city && !customerCoordinates) {
      const companyQuery: any = { isActive: true };
      companyQuery['address.city'] = new RegExp(city as string, 'i');
      const companies = await Company.find(companyQuery);
      const companyIds = companies.map(c => c._id);
      bounceHousesWithDistance = bounceHousesWithDistance.filter(bounceHouse => 
        companyIds.some(id => id.toString() === bounceHouse.company._id.toString())
      );
    }

    if (state && !customerCoordinates) {
      const companyQuery: any = { isActive: true };
      companyQuery['address.state'] = new RegExp(state as string, 'i');
      const companies = await Company.find(companyQuery);
      const companyIds = companies.map(c => c._id);
      bounceHousesWithDistance = bounceHousesWithDistance.filter(bounceHouse => 
        companyIds.some(id => id.toString() === bounceHouse.company._id.toString())
      );
    }

    res.json({
      bounceHouses: bounceHousesWithDistance,
      total: bounceHousesWithDistance.length,
      searchLocation: customerCoordinates ? {
        coordinates: customerCoordinates,
        searchType: latitude && longitude ? 'coordinates' : 
                    zipCode ? 'zipCode' : 
                    city && state ? 'cityState' : 'none'
      } : null
    });
  } catch (error) {
    console.error('Error fetching bounce houses:', error);
    res.status(500).json({ message: 'Error fetching bounce houses' });
  }
};

export const getBounceHouseById = async (req: Request, res: Response) => {
  try {
    const bounceHouse = await BounceHouse.findById(req.params.id)
      .populate('company', 'name location contact address settings');
    
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

// Search bounce houses by location
export const searchBounceHousesByLocation = async (req: Request, res: Response) => {
  try {
    const { location, radius = 25, deliveryOnly = false } = req.query;
    
    if (!location) {
      return res.status(400).json({ message: 'Location parameter is required' });
    }

    // Try to get coordinates from location
    let customerCoordinates: Coordinates | null = null;
    
    // Check if location is a zip code (5 digits)
    if (/^\d{5}$/.test(location as string)) {
      customerCoordinates = await getZipCodeCoordinates(location as string);
    } else {
      // Try geocoding the location
      customerCoordinates = await geocodeAddress(location as string);
    }

    if (!customerCoordinates) {
      return res.status(400).json({ message: 'Unable to find coordinates for the provided location' });
    }

    // Get all companies
    const companies = await Company.find({ isActive: true });
    
    // Filter companies based on location criteria
    let filteredCompanies;
    if (deliveryOnly === 'true') {
      filteredCompanies = filterCompaniesByDeliveryRadius(customerCoordinates, companies);
    } else {
      const radiusMiles = parseFloat(radius as string);
      const distanceResults = calculateDistancesToCompanies(customerCoordinates, companies);
      filteredCompanies = distanceResults
        .filter(result => result.distance <= radiusMiles)
        .map(result => ({
          ...result.company.toObject(),
          distance: result.distance
        }));
    }

    // Get bounce houses from filtered companies
    const companyIds = filteredCompanies.map(company => company._id);
    const bounceHouses = await BounceHouse.find({ 
      company: { $in: companyIds },
      isActive: true 
    }).populate('company', 'name address settings');

    // Add distance info to bounce houses
    const bounceHousesWithDistance = bounceHouses.map(bounceHouse => {
      const company = filteredCompanies.find(c => 
        c._id.toString() === bounceHouse.company._id.toString()
      );
      return {
        ...bounceHouse.toObject(),
        distance: company?.distance || null,
        withinDeliveryRadius: company ? 
          (company.distance <= (company.settings?.deliveryRadius || 25)) : null
      };
    });

    // Sort by distance
    bounceHousesWithDistance.sort((a, b) => {
      if (a.distance === null) return 1;
      if (b.distance === null) return -1;
      return a.distance - b.distance;
    });

    res.json({
      bounceHouses: bounceHousesWithDistance,
      total: bounceHousesWithDistance.length,
      searchLocation: {
        coordinates: customerCoordinates,
        location: location as string,
        radius: parseFloat(radius as string),
        deliveryOnly: deliveryOnly === 'true'
      }
    });
  } catch (error) {
    console.error('Error searching bounce houses by location:', error);
    res.status(500).json({ message: 'Error searching bounce houses by location' });
  }
}; 