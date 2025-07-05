import mongoose, { Document, Schema } from 'mongoose';

export interface ICompany extends Document {
  name: string;
  subdomain: string;
  domain?: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  branding: {
    logo?: string;
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    favicon?: string;
  };
  settings: {
    currency: string;
    timezone: string;
    businessHours: {
      monday: { open: string; close: string; closed: boolean };
      tuesday: { open: string; close: string; closed: boolean };
      wednesday: { open: string; close: string; closed: boolean };
      thursday: { open: string; close: string; closed: boolean };
      friday: { open: string; close: string; closed: boolean };
      saturday: { open: string; close: string; closed: boolean };
      sunday: { open: string; close: string; closed: boolean };
    };
    minimumBookingNotice: number; // hours
    maximumBookingAdvance: number; // days
    cancellationPolicy: string;
    deliveryRadius: number; // miles
    deliveryFee: number;
    taxRate: number;
    requiresDeposit: boolean;
    depositPercentage: number;
  };
  paymentConfig: {
    stripePublicKey: string;
    stripeSecretKey: string;
    stripeWebhookSecret: string;
  };
  emailConfig: {
    fromEmail: string;
    fromName: string;
    sendgridApiKey?: string;
    smtpHost?: string;
    smtpPort?: number;
    smtpUser?: string;
    smtpPass?: string;
  };
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
    tiktok?: string;
  };
  isActive: boolean;
  plan: 'basic' | 'standard' | 'premium';
  createdAt: Date;
  updatedAt: Date;
}

const CompanySchema = new Schema({
  name: { type: String, required: true },
  subdomain: { type: String, required: true, unique: true },
  domain: { type: String },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true }
  },
  branding: {
    logo: { type: String },
    primaryColor: { type: String, default: '#4F46E5' },
    secondaryColor: { type: String, default: '#10B981' },
    fontFamily: { type: String, default: 'Inter, sans-serif' },
    favicon: { type: String }
  },
  settings: {
    currency: { type: String, default: 'USD' },
    timezone: { type: String, default: 'America/New_York' },
    businessHours: {
      monday: { open: { type: String, default: '08:00' }, close: { type: String, default: '18:00' }, closed: { type: Boolean, default: false } },
      tuesday: { open: { type: String, default: '08:00' }, close: { type: String, default: '18:00' }, closed: { type: Boolean, default: false } },
      wednesday: { open: { type: String, default: '08:00' }, close: { type: String, default: '18:00' }, closed: { type: Boolean, default: false } },
      thursday: { open: { type: String, default: '08:00' }, close: { type: String, default: '18:00' }, closed: { type: Boolean, default: false } },
      friday: { open: { type: String, default: '08:00' }, close: { type: String, default: '18:00' }, closed: { type: Boolean, default: false } },
      saturday: { open: { type: String, default: '08:00' }, close: { type: String, default: '18:00' }, closed: { type: Boolean, default: false } },
      sunday: { open: { type: String, default: '08:00' }, close: { type: String, default: '18:00' }, closed: { type: Boolean, default: true } }
    },
    minimumBookingNotice: { type: Number, default: 24 },
    maximumBookingAdvance: { type: Number, default: 365 },
    cancellationPolicy: { type: String, default: 'Cancellations must be made 48 hours in advance for a full refund.' },
    deliveryRadius: { type: Number, default: 25 },
    deliveryFee: { type: Number, default: 50 },
    taxRate: { type: Number, default: 0.08 },
    requiresDeposit: { type: Boolean, default: true },
    depositPercentage: { type: Number, default: 50 }
  },
  paymentConfig: {
    stripePublicKey: { type: String, required: true },
    stripeSecretKey: { type: String, required: true },
    stripeWebhookSecret: { type: String }
  },
  emailConfig: {
    fromEmail: { type: String, required: true },
    fromName: { type: String, required: true },
    sendgridApiKey: { type: String },
    smtpHost: { type: String },
    smtpPort: { type: Number },
    smtpUser: { type: String },
    smtpPass: { type: String }
  },
  socialMedia: {
    facebook: { type: String },
    instagram: { type: String },
    twitter: { type: String },
    youtube: { type: String },
    tiktok: { type: String }
  },
  isActive: { type: Boolean, default: true },
  plan: { type: String, enum: ['basic', 'standard', 'premium'], default: 'standard' }
}, {
  timestamps: true
});

// Add indexes
CompanySchema.index({ subdomain: 1 });
CompanySchema.index({ domain: 1 });
CompanySchema.index({ isActive: 1 });

export default mongoose.model<ICompany>('Company', CompanySchema);