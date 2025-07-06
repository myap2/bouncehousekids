import { Request, Response } from 'express';
import Waiver from '../models/Waiver';
import Company from '../models/Company';

// Get client IP address
const getClientIP = (req: Request): string => {
  return (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
         req.connection.remoteAddress ||
         req.socket.remoteAddress ||
         '127.0.0.1';
};

// Default waiver text template
const getDefaultWaiverText = (companyName: string): string => {
  return `
RELEASE AND WAIVER OF LIABILITY, ASSUMPTION OF RISK, AND INDEMNITY AGREEMENT

IN CONSIDERATION of being permitted to participate in bounce house activities provided by ${companyName} ("Company"), I acknowledge, appreciate, and agree that:

1. ASSUMPTION OF RISK: I understand that bounce house activities involve risks including but not limited to: physical injury, property damage, or death. These risks may be caused by my own actions, the actions of others, equipment failure, or the condition of the premises.

2. RELEASE: I voluntarily release, discharge, waive, and relinquish any and all claims, actions, or lawsuits for personal injury, property damage, wrongful death, loss of services, lost wages, exemplary damages, or other loss that may arise out of my participation in bounce house activities.

3. INDEMNIFICATION: I agree to indemnify, defend, and hold harmless the Company, its owners, employees, agents, and representatives from any and all claims, actions, suits, procedures, costs, expenses, damages, and liabilities arising out of my participation in these activities.

4. MEDICAL CONDITION: I represent that I am in good health and have no medical conditions that would prevent safe participation in these activities.

5. RULES AND SUPERVISION: I agree to follow all posted rules and instructions from Company staff. I understand that adult supervision is required for children under 12.

6. EQUIPMENT INSPECTION: I acknowledge that I have inspected the bounce house equipment and found it to be in safe operating condition.

7. ASSUMPTION OF RESPONSIBILITY: I assume full responsibility for any injury or damage that may occur during the rental period.

I HAVE READ THIS AGREEMENT, FULLY UNDERSTAND ITS TERMS, UNDERSTAND THAT I HAVE GIVEN UP SUBSTANTIAL RIGHTS BY SIGNING IT, AND SIGN IT FREELY AND VOLUNTARILY WITHOUT ANY INDUCEMENT.

By signing below, I acknowledge that I have read, understood, and agree to be bound by this waiver.
  `.trim();
};

export const createWaiver = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (!req.company) {
      return res.status(400).json({ message: 'Company context required' });
    }

    const {
      participantName,
      participantAge,
      parentGuardianName,
      parentGuardianEmail,
      emergencyContactName,
      emergencyContactPhone,
      medicalConditions,
      allergies,
      signature,
      agreedTerms,
      booking,
      witnessName,
      witnessSignature
    } = req.body;

    // Validate required fields
    if (!participantName || !participantAge || !emergencyContactName || !emergencyContactPhone || !signature) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (!agreedTerms) {
      return res.status(400).json({ message: 'Must agree to terms to proceed' });
    }

    const isMinor = participantAge < 18;

    // Validate parent/guardian info for minors
    if (isMinor && (!parentGuardianName || !parentGuardianEmail)) {
      return res.status(400).json({ message: 'Parent/guardian information required for minors' });
    }

    // Check if user already has a valid waiver
    const existingWaiver = await Waiver.findOne({
      user: req.user._id,
      company: req.company._id,
      participantName,
      signedAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) } // Within last year
    });

    if (existingWaiver) {
      return res.status(400).json({ 
        message: 'Valid waiver already exists for this participant',
        waiver: existingWaiver
      });
    }

    // Create the waiver
    const waiver = new Waiver({
      user: req.user._id,
      company: req.company._id,
      booking,
      participantName,
      participantAge,
      parentGuardianName: isMinor ? parentGuardianName : undefined,
      parentGuardianEmail: isMinor ? parentGuardianEmail : undefined,
      emergencyContactName,
      emergencyContactPhone,
      medicalConditions,
      allergies,
      waiverText: getDefaultWaiverText(req.company.name),
      agreedTerms,
      signature,
      isMinor,
      ipAddress: getClientIP(req),
      userAgent: req.headers['user-agent'] || '',
      witnessName,
      witnessSignature
    });

    await waiver.save();

    res.status(201).json({
      message: 'Waiver signed successfully',
      waiver: {
        _id: waiver._id,
        participantName: waiver.participantName,
        signedAt: waiver.signedAt,
        isMinor: waiver.isMinor
      }
    });
  } catch (error) {
    console.error('Error creating waiver:', error);
    res.status(400).json({ message: 'Error creating waiver' });
  }
};

export const getUserWaivers = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (!req.company) {
      return res.status(400).json({ message: 'Company context required' });
    }

    const waivers = await Waiver.find({
      user: req.user._id,
      company: req.company._id
    })
    .select('-signature -ipAddress -userAgent -waiverText')
    .sort({ signedAt: -1 });

    res.json(waivers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching waivers' });
  }
};

export const getWaiverById = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const waiver = await Waiver.findById(req.params.id)
      .populate('user', 'firstName lastName email')
      .populate('booking', 'startDate endDate');

    if (!waiver) {
      return res.status(404).json({ message: 'Waiver not found' });
    }

    // Check if user owns the waiver or is admin/company-admin
    if (waiver.user._id.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin' && 
        req.user.role !== 'company-admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(waiver);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching waiver' });
  }
};

export const checkWaiverStatus = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (!req.company) {
      return res.status(400).json({ message: 'Company context required' });
    }

    const { participantName } = req.query;

    if (!participantName) {
      return res.status(400).json({ message: 'Participant name required' });
    }

    const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);

    const waiver = await Waiver.findOne({
      user: req.user._id,
      company: req.company._id,
      participantName,
      signedAt: { $gte: oneYearAgo }
    }).select('_id participantName signedAt isMinor');

    if (waiver) {
      res.json({
        hasValidWaiver: true,
        waiver: {
          _id: waiver._id,
          participantName: waiver.participantName,
          signedAt: waiver.signedAt,
          isMinor: waiver.isMinor
        }
      });
    } else {
      res.json({
        hasValidWaiver: false,
        message: 'No valid waiver found. A new waiver must be signed.'
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error checking waiver status' });
  }
};

export const getWaiverTemplate = async (req: Request, res: Response) => {
  try {
    if (!req.company) {
      return res.status(400).json({ message: 'Company context required' });
    }

    const waiverText = getDefaultWaiverText(req.company.name);

    res.json({
      companyName: req.company.name,
      waiverText,
      settings: {
        requiresWitness: req.company.settings?.requiresWitness || false,
        waiverValidityDays: 365,
        minorRequiresParent: true
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching waiver template' });
  }
};

// Admin function to get all waivers for a company
export const getCompanyWaivers = async (req: Request, res: Response) => {
  try {
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'company-admin')) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (!req.company) {
      return res.status(400).json({ message: 'Company context required' });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const waivers = await Waiver.find({ company: req.company._id })
      .populate('user', 'firstName lastName email')
      .populate('booking', 'startDate endDate bounceHouse')
      .select('-signature -ipAddress -userAgent')
      .sort({ signedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Waiver.countDocuments({ company: req.company._id });

    res.json({
      waivers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching company waivers' });
  }
};