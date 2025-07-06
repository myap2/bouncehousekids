import mongoose, { Document, Schema } from 'mongoose';

export interface IWaiver extends Document {
  user: mongoose.Types.ObjectId;
  company: mongoose.Types.ObjectId;
  booking?: mongoose.Types.ObjectId;
  participantName: string;
  participantAge: number;
  parentGuardianName?: string;
  parentGuardianEmail?: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  medicalConditions?: string;
  allergies?: string;
  waiverText: string;
  agreedTerms: boolean;
  signature: string; // Base64 encoded signature
  ipAddress: string;
  userAgent: string;
  signedAt: Date;
  isMinor: boolean;
  witnessName?: string;
  witnessSignature?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WaiverSchema = new Schema({
  user: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  company: { 
    type: Schema.Types.ObjectId, 
    ref: 'Company', 
    required: true 
  },
  booking: { 
    type: Schema.Types.ObjectId, 
    ref: 'Booking' 
  },
  participantName: { 
    type: String, 
    required: true 
  },
  participantAge: { 
    type: Number, 
    required: true 
  },
  parentGuardianName: { 
    type: String,
    required: function(this: IWaiver) { 
      return this.isMinor; 
    }
  },
  parentGuardianEmail: { 
    type: String,
    required: function(this: IWaiver) { 
      return this.isMinor; 
    }
  },
  emergencyContactName: { 
    type: String, 
    required: true 
  },
  emergencyContactPhone: { 
    type: String, 
    required: true 
  },
  medicalConditions: { 
    type: String 
  },
  allergies: { 
    type: String 
  },
  waiverText: { 
    type: String, 
    required: true 
  },
  agreedTerms: { 
    type: Boolean, 
    required: true, 
    validate: {
      validator: function(v: boolean) {
        return v === true;
      },
      message: 'User must agree to terms to proceed'
    }
  },
  signature: { 
    type: String, 
    required: true 
  },
  ipAddress: { 
    type: String, 
    required: true 
  },
  userAgent: { 
    type: String, 
    required: true 
  },
  signedAt: { 
    type: Date, 
    default: Date.now 
  },
  isMinor: { 
    type: Boolean, 
    required: true 
  },
  witnessName: { 
    type: String 
  },
  witnessSignature: { 
    type: String 
  }
}, {
  timestamps: true
});

// Add indexes
WaiverSchema.index({ user: 1, company: 1 });
WaiverSchema.index({ booking: 1 });
WaiverSchema.index({ signedAt: -1 });
WaiverSchema.index({ company: 1, signedAt: -1 });

// Virtual for determining if waiver is expired (1 year validity)
WaiverSchema.virtual('isExpired').get(function(this: IWaiver) {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  return this.signedAt < oneYearAgo;
});

export default mongoose.model<IWaiver>('Waiver', WaiverSchema);