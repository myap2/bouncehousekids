import mongoose, { Document, Schema } from 'mongoose';

export interface IBounceHouse extends Document {
  name: string;
  description: string;
  theme: string;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  capacity: {
    minAge: number;
    maxAge: number;
    maxWeight: number;
    maxOccupants: number;
  };
  price: {
    daily: number;
    weekly: number;
    weekend: number;
  };
  images: string[];
  features: string[];
  availability: {
    startDate: Date;
    endDate: Date;
  }[];
  rating: number;
  reviews: {
    userId: mongoose.Types.ObjectId;
    rating: number;
    comment: string;
    date: Date;
  }[];
  company: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BounceHouseSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  theme: { type: String, required: true },
  dimensions: {
    length: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true }
  },
  capacity: {
    minAge: { type: Number, required: true },
    maxAge: { type: Number, required: true },
    maxWeight: { type: Number, required: true },
    maxOccupants: { type: Number, required: true }
  },
  price: {
    daily: { type: Number, required: true },
    weekly: { type: Number, required: true },
    weekend: { type: Number, required: true }
  },
  images: [{ type: String, required: true }],
  features: [{ type: String }],
  availability: [{
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true }
  }],
  rating: { type: Number, default: 0 },
  reviews: [{
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    date: { type: Date, default: Date.now }
  }],
  company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true
});

// Add indexes for common queries
BounceHouseSchema.index({ theme: 1 });
BounceHouseSchema.index({ 'capacity.maxOccupants': 1 });
BounceHouseSchema.index({ 'price.daily': 1 });
BounceHouseSchema.index({ rating: -1 });

export default mongoose.model<IBounceHouse>('BounceHouse', BounceHouseSchema); 