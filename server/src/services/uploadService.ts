import multer from 'multer';
import multerS3 from 'multer-s3';
import * as AWS from 'aws-sdk';
import { v2 as cloudinary } from 'cloudinary';
import path from 'path';
import fs from 'fs';

// Configure AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Storage configuration based on environment
const createStorageConfig = () => {
  const storageType = process.env.UPLOAD_STORAGE_TYPE || 'local';
  
  switch (storageType) {
    case 's3':
      return createS3Storage();
    case 'cloudinary':
      return createCloudinaryStorage();
    case 'local':
    default:
      return createLocalStorage();
  }
};

// Local storage configuration (for development/Docker)
const createLocalStorage = () => {
  const uploadDir = path.join(__dirname, '../../../uploads');
  
  // Ensure upload directory exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  
  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const extension = path.extname(file.originalname);
      cb(null, `${uniqueSuffix}${extension}`);
    }
  });
};

// AWS S3 storage configuration
const createS3Storage = () => {
  if (!process.env.AWS_S3_BUCKET) {
    throw new Error('AWS_S3_BUCKET environment variable is required for S3 storage');
  }

  return multerS3({
    s3: s3 as any, // Type assertion to fix compatibility
    bucket: process.env.AWS_S3_BUCKET,
    acl: 'public-read',
    key: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const extension = path.extname(file.originalname);
      cb(null, `bounce-houses/${uniqueSuffix}${extension}`);
    }
  });
};

// Cloudinary storage configuration
const createCloudinaryStorage = () => {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    throw new Error('CLOUDINARY_CLOUD_NAME environment variable is required for Cloudinary storage');
  }

  return multer.memoryStorage(); // We'll handle Cloudinary upload manually
};

// File filter for images only
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

// Create multer upload instance
export const createUploadMiddleware = () => {
  const storage = createStorageConfig();
  
  return multer({
    storage,
    fileFilter,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
    }
  });
};

// Upload to Cloudinary (when using memory storage)
export const uploadToCloudinary = async (buffer: Buffer, originalname: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const publicId = `bounce-houses/${uniqueSuffix}`;
    
    cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        public_id: publicId,
        folder: 'bounce-houses',
        transformation: [
          { width: 1200, height: 800, crop: 'limit', quality: 'auto' },
          { fetch_format: 'auto' }
        ]
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result!.secure_url);
        }
      }
    ).end(buffer);
  });
};

// Get file URL based on storage type
export const getFileUrl = (filename: string): string => {
  const storageType = process.env.UPLOAD_STORAGE_TYPE || 'local';
  
  switch (storageType) {
    case 's3':
      return `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/bounce-houses/${filename}`;
    case 'cloudinary':
      return filename; // Cloudinary returns full URL
    case 'local':
    default:
      const baseUrl = process.env.SERVER_BASE_URL || 'http://localhost:5000';
      return `${baseUrl}/uploads/${filename}`;
  }
};

// Delete file based on storage type
export const deleteFile = async (filename: string): Promise<void> => {
  const storageType = process.env.UPLOAD_STORAGE_TYPE || 'local';
  
  switch (storageType) {
    case 's3':
      await s3.deleteObject({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: `bounce-houses/${filename}`
      }).promise();
      break;
    
    case 'cloudinary':
      // Extract public_id from Cloudinary URL
      const publicId = filename.split('/').pop()?.split('.')[0];
      if (publicId) {
        await cloudinary.uploader.destroy(`bounce-houses/${publicId}`);
      }
      break;
    
    case 'local':
    default:
      const filePath = path.join(__dirname, '../../../uploads', filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      break;
  }
};

// Utility function to check storage configuration
export const getStorageInfo = () => {
  const storageType = process.env.UPLOAD_STORAGE_TYPE || 'local';
  
  return {
    type: storageType,
    configured: checkStorageConfiguration(storageType),
    config: getStorageConfig(storageType)
  };
};

// Check if storage is properly configured
const checkStorageConfiguration = (storageType: string): boolean => {
  switch (storageType) {
    case 's3':
      return !!(
        process.env.AWS_ACCESS_KEY_ID &&
        process.env.AWS_SECRET_ACCESS_KEY &&
        process.env.AWS_S3_BUCKET
      );
    
    case 'cloudinary':
      return !!(
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
      );
    
    case 'local':
    default:
      return true; // Local storage always available
  }
};

// Get storage configuration details
const getStorageConfig = (storageType: string) => {
  switch (storageType) {
    case 's3':
      return {
        bucket: process.env.AWS_S3_BUCKET,
        region: process.env.AWS_REGION || 'us-east-1'
      };
    
    case 'cloudinary':
      return {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME
      };
    
    case 'local':
    default:
      return {
        uploadDir: path.join(__dirname, '../../../uploads')
      };
  }
};