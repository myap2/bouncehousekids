import mongoose, { Document, Schema } from 'mongoose';

export interface ICompanyWaiverTemplate extends Document {
  company: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  waiverText: string;
  documentUrl?: string; // URL to uploaded PDF/document
  documentType: 'text' | 'pdf' | 'docx';
  isDefault: boolean;
  isActive: boolean;
  version: number;
  settings: {
    requiresWitness: boolean;
    requiresParentSignature: boolean;
    validityDays: number;
    requiresMedicalInfo: boolean;
    requiresEmergencyContact: boolean;
    allowsOnlineSignature: boolean;
    requiresInPersonSignature: boolean;
  };
  customFields: Array<{
    name: string;
    type: 'text' | 'number' | 'boolean' | 'date' | 'select';
    required: boolean;
    options?: string[]; // For select type
    placeholder?: string;
  }>;
  legalRequirements: {
    state?: string;
    country: string;
    complianceNotes?: string;
    lastReviewedDate?: Date;
    reviewedBy?: string;
  };
  createdBy: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CompanyWaiverTemplateSchema = new Schema({
  company: { 
    type: Schema.Types.ObjectId, 
    ref: 'Company', 
    required: true 
  },
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  description: { 
    type: String,
    trim: true
  },
  waiverText: { 
    type: String, 
    required: function(this: ICompanyWaiverTemplate) {
      return this.documentType === 'text';
    }
  },
  documentUrl: { 
    type: String,
    required: function(this: ICompanyWaiverTemplate) {
      return this.documentType === 'pdf' || this.documentType === 'docx';
    }
  },
  documentType: { 
    type: String, 
    enum: ['text', 'pdf', 'docx'],
    required: true,
    default: 'text'
  },
  isDefault: { 
    type: Boolean, 
    default: false 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  version: { 
    type: Number, 
    default: 1 
  },
  settings: {
    requiresWitness: { 
      type: Boolean, 
      default: false 
    },
    requiresParentSignature: { 
      type: Boolean, 
      default: true 
    },
    validityDays: { 
      type: Number, 
      default: 365 
    },
    requiresMedicalInfo: { 
      type: Boolean, 
      default: true 
    },
    requiresEmergencyContact: { 
      type: Boolean, 
      default: true 
    },
    allowsOnlineSignature: { 
      type: Boolean, 
      default: true 
    },
    requiresInPersonSignature: { 
      type: Boolean, 
      default: false 
    }
  },
  customFields: [{
    name: { 
      type: String, 
      required: true 
    },
    type: { 
      type: String, 
      enum: ['text', 'number', 'boolean', 'date', 'select'],
      required: true 
    },
    required: { 
      type: Boolean, 
      default: false 
    },
    options: [String], // For select type
    placeholder: String
  }],
  legalRequirements: {
    state: String,
    country: { 
      type: String, 
      default: 'US' 
    },
    complianceNotes: String,
    lastReviewedDate: Date,
    reviewedBy: String
  },
  createdBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  updatedBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  }
}, {
  timestamps: true
});

// Indexes
CompanyWaiverTemplateSchema.index({ company: 1, isActive: 1 });
CompanyWaiverTemplateSchema.index({ company: 1, isDefault: 1 });
CompanyWaiverTemplateSchema.index({ company: 1, name: 1 });

// Ensure only one default waiver per company
CompanyWaiverTemplateSchema.pre('save', async function(this: ICompanyWaiverTemplate, next) {
  if (this.isDefault && this.isModified('isDefault')) {
    // Remove default status from other waivers in this company
    await mongoose.model('CompanyWaiverTemplate').updateMany(
      { 
        company: this.company, 
        _id: { $ne: this._id } 
      },
      { isDefault: false }
    );
  }
  next();
});

// Virtual for checking if waiver is current
CompanyWaiverTemplateSchema.virtual('isCurrent').get(function(this: ICompanyWaiverTemplate) {
  return this.isActive;
});

// Method to create new version
CompanyWaiverTemplateSchema.methods.createNewVersion = async function(this: ICompanyWaiverTemplate, updates: Partial<ICompanyWaiverTemplate>) {
  const currentData = this.toObject();
  delete currentData._id;
  
  const newVersion = new (mongoose.model('CompanyWaiverTemplate'))({
    ...currentData,
    version: this.version + 1,
    ...updates,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  // Deactivate current version
  this.isActive = false;
  await this.save();
  
  return await newVersion.save();
};

export default mongoose.model<ICompanyWaiverTemplate>('CompanyWaiverTemplate', CompanyWaiverTemplateSchema);