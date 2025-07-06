import { Request, Response } from 'express';
import BounceHouse from '../models/BounceHouse';

export const createBounceHouse = async (req: Request, res: Response) => {
  try {
    const bounceHouse = new BounceHouse(req.body);
    await bounceHouse.save();
    res.status(201).json(bounceHouse);
  } catch (error) {
    console.error('Error creating bounce house:', error);
    res.status(400).json({ message: error.message || 'Error creating bounce house' });
  }
};

export const getBounceHouses = async (req: Request, res: Response) => {
  try {
    const {
      theme,
      minCapacity,
      maxPrice,
      startDate,
      endDate
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
      .sort({ rating: -1 });

    res.json(bounceHouses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bounce houses' });
  }
};

export const getBounceHouseById = async (req: Request, res: Response) => {
  try {
    const bounceHouse = await BounceHouse.findById(req.params.id);
    if (!bounceHouse) {
      return res.status(404).json({ message: 'Bounce house not found' });
    }
    res.json(bounceHouse);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bounce house' });
  }
};

export const updateBounceHouse = async (req: Request, res: Response) => {
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

  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).json({ message: 'Invalid updates' });
  }

  try {
    const bounceHouse = await BounceHouse.findById(req.params.id);
    if (!bounceHouse) {
      return res.status(404).json({ message: 'Bounce house not found' });
    }

    updates.forEach(update => (bounceHouse as any)[update] = req.body[update]);
    await bounceHouse.save();
    res.json(bounceHouse);
  } catch (error) {
    res.status(400).json({ message: 'Error updating bounce house' });
  }
};

export const deleteBounceHouse = async (req: Request, res: Response) => {
  try {
    const bounceHouse = await BounceHouse.findById(req.params.id);
    if (!bounceHouse) {
      return res.status(404).json({ message: 'Bounce house not found' });
    }

    bounceHouse.isActive = false;
    await bounceHouse.save();
    res.json({ message: 'Bounce house deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting bounce house' });
  }
};

export const addReview = async (req: Request, res: Response) => {
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