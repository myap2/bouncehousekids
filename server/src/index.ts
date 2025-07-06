import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';

// Import upload service
import { createUploadMiddleware, getFileUrl, uploadToCloudinary, getStorageInfo } from './services/uploadService';

// Import routes
import userRoutes from './routes/userRoutes';
import bounceHouseRoutes from './routes/bounceHouseRoutes';
import bookingRoutes from './routes/bookingRoutes';
import companyRoutes from './routes/companyRoutes';
import waiverRoutes from './routes/waiverRoutes';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Create upload middleware
const upload = createUploadMiddleware();

// Serve static files (only for local storage)
if ((process.env.UPLOAD_STORAGE_TYPE || 'local') === 'local') {
  const uploadDir = path.join(__dirname, '../../uploads');
  app.use('/uploads', express.static(uploadDir));
}

// --- Upload endpoint ---
app.post('/api/upload', upload.single('image'), async (req: express.Request, res: express.Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    let fileUrl: string;
    const storageType = process.env.UPLOAD_STORAGE_TYPE || 'local';

    if (storageType === 'cloudinary') {
      // Handle Cloudinary upload
      fileUrl = await uploadToCloudinary(req.file.buffer, req.file.originalname);
    } else if (storageType === 's3') {
      // S3 URL is handled by multer-s3
      fileUrl = (req.file as any).location;
    } else {
      // Local storage
      fileUrl = getFileUrl(req.file.filename);
    }

    res.json({ url: fileUrl });
  } catch (error: unknown) {
    console.error('Upload error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Upload failed';
    res.status(500).json({ message: errorMessage });
  }
});

// Storage info endpoint (for debugging)
app.get('/api/storage-info', (req: express.Request, res: express.Response) => {
  res.json(getStorageInfo());
});

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bouncehousekids';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/bounce-houses', bounceHouseRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/waivers', waiverRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Upload storage: ${getStorageInfo().type}`);
}); 