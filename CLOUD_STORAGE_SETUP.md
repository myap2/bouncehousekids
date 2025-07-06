# Cloud Storage Setup Guide

## 🚨 **IMPORTANT: File Upload Storage Fixed!**

The application now supports **cloud storage** for file uploads, which is essential for production deployment. The old local storage won't work in cloud environments.

---

## 📊 **Storage Options Comparison**

| Feature | Local | Cloudinary ⭐ | AWS S3 |
|---------|-------|-------------|--------|
| **Production Ready** | ❌ No | ✅ Yes | ✅ Yes |
| **Cloud Compatible** | ❌ No | ✅ Yes | ✅ Yes |
| **Auto Image Optimization** | ❌ No | ✅ Yes | ❌ No |
| **CDN Included** | ❌ No | ✅ Yes | ❌ Separate |
| **Free Tier** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Setup Complexity** | ⭐ Easy | ⭐⭐ Medium | ⭐⭐⭐ Complex |
| **Cost (per GB)** | Free | $0.18 | $0.023 |

**Recommendation**: Use **Cloudinary** for production (best for images)

---

## 🌤️ **OPTION 1: Cloudinary Setup (Recommended)**

### Why Cloudinary?
- ✅ **Image optimization** (automatic resizing, compression)
- ✅ **Fast CDN delivery** worldwide
- ✅ **Easy setup** with simple API
- ✅ **Free tier**: 25GB storage, 25GB bandwidth
- ✅ **Perfect for bounce house photos**

### Setup Steps:

1. **Create Cloudinary Account**
   ```bash
   # Go to https://cloudinary.com/
   # Sign up for free account
   ```

2. **Get API Credentials**
   - Go to Dashboard
   - Copy: Cloud Name, API Key, API Secret

3. **Update Environment Variables**
   ```bash
   # In your .env file:
   UPLOAD_STORAGE_TYPE=cloudinary
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

4. **Deploy Updates**
   ```bash
   # Update Railway environment variables:
   railway variables set UPLOAD_STORAGE_TYPE=cloudinary
   railway variables set CLOUDINARY_CLOUD_NAME=your_cloud_name
   railway variables set CLOUDINARY_API_KEY=your_api_key
   railway variables set CLOUDINARY_API_SECRET=your_api_secret
   ```

5. **Test Upload**
   ```bash
   # Test the upload endpoint:
   curl -X POST -F "image=@test-image.jpg" https://your-api.railway.app/api/upload
   ```

---

## ☁️ **OPTION 2: AWS S3 Setup**

### Why AWS S3?
- ✅ **Extremely cheap** storage costs
- ✅ **Unlimited scalability**
- ✅ **Industry standard**
- ✅ **Free tier**: 5GB storage, 20,000 requests
- ❌ Requires more setup

### Setup Steps:

1. **Create AWS Account**
   ```bash
   # Go to https://aws.amazon.com/
   # Sign up for free account
   ```

2. **Create S3 Bucket**
   ```bash
   # In AWS Console:
   # 1. Go to S3 service
   # 2. Create bucket: "bouncehouse-uploads"
   # 3. Set region: "us-east-1"
   # 4. Enable public read access
   ```

3. **Create IAM User**
   ```bash
   # In AWS Console:
   # 1. Go to IAM service
   # 2. Create user: "bouncehouse-uploads"
   # 3. Attach policy: "AmazonS3FullAccess"
   # 4. Get Access Key & Secret
   ```

4. **Configure Bucket Policy**
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::bouncehouse-uploads/*"
       }
     ]
   }
   ```

5. **Update Environment Variables**
   ```bash
   # In your .env file:
   UPLOAD_STORAGE_TYPE=s3
   AWS_ACCESS_KEY_ID=your_access_key_id
   AWS_SECRET_ACCESS_KEY=your_secret_access_key
   AWS_REGION=us-east-1
   AWS_S3_BUCKET=bouncehouse-uploads
   ```

---

## 💻 **OPTION 3: Local Storage (Development Only)**

**Use only for local development or Docker deployments with persistent volumes.**

```bash
# In your .env file:
UPLOAD_STORAGE_TYPE=local
SERVER_BASE_URL=http://localhost:5000
```

---

## 🚀 **Deployment Updates**

### Update Quick Deploy Script

When running `./quick-deploy.sh`, you'll now be prompted for:
- Storage type (cloudinary/s3/local)
- API credentials for your chosen storage

### Manual Deployment

1. **Choose Storage Provider** (Cloudinary recommended)
2. **Set Environment Variables**:
   ```bash
   # For Railway:
   railway variables set UPLOAD_STORAGE_TYPE=cloudinary
   railway variables set CLOUDINARY_CLOUD_NAME=your_cloud_name
   railway variables set CLOUDINARY_API_KEY=your_api_key
   railway variables set CLOUDINARY_API_SECRET=your_api_secret
   ```

3. **Redeploy Application**:
   ```bash
   railway up
   ```

---

## 🧪 **Testing Cloud Storage**

### Test Upload Endpoint
```bash
# Test storage configuration
curl https://your-api.railway.app/api/storage-info

# Test file upload
curl -X POST \
  -F "image=@test-image.jpg" \
  https://your-api.railway.app/api/upload
```

### Expected Response
```json
{
  "url": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/bounce-houses/12345-image.jpg"
}
```

---

## 📁 **File Upload Features**

### Supported Formats
- JPEG, JPG, PNG, GIF, WebP
- Maximum file size: 10MB
- Automatic unique naming

### Cloudinary Features
- **Auto-optimization**: Images compressed for web
- **Responsive sizing**: Multiple sizes generated
- **Format conversion**: Auto WebP for modern browsers
- **CDN delivery**: Fast global delivery

### Security Features
- File type validation
- Size limits
- Secure upload URLs
- Access control

---

## 💰 **Cost Breakdown**

### Cloudinary (Recommended)
- **Free Tier**: 25GB storage, 25GB bandwidth
- **Paid**: $89/month for 100GB + bandwidth
- **Estimate**: ~$10/month for small business

### AWS S3
- **Free Tier**: 5GB storage, 20,000 requests
- **Paid**: ~$0.023/GB storage, $0.09/GB transfer
- **Estimate**: ~$5/month for small business

### Storage Requirements
- **Average bounce house photo**: 2-5MB
- **50 bounce houses x 5 photos**: ~1GB
- **Monthly uploads**: ~2GB
- **Recommended**: Start with Cloudinary free tier

---

## 🛠️ **Troubleshooting**

### Common Issues

1. **"Upload failed" errors**
   ```bash
   # Check storage configuration
   curl https://your-api.railway.app/api/storage-info
   
   # Verify environment variables are set
   railway variables
   ```

2. **Images not displaying**
   - Check CORS settings
   - Verify public access on S3/Cloudinary
   - Test image URLs directly

3. **Large file uploads failing**
   - Check file size limits (10MB max)
   - Verify network timeout settings
   - Consider image compression

### Debug Commands
```bash
# Check storage configuration
curl https://your-api.railway.app/api/storage-info

# Test image upload
curl -X POST -F "image=@test.jpg" https://your-api.railway.app/api/upload

# Check application logs
railway logs
```

---

## ✅ **Migration Checklist**

- [ ] Choose storage provider (Cloudinary recommended)
- [ ] Create account and get API credentials
- [ ] Update environment variables
- [ ] Test upload functionality
- [ ] Migrate existing images (if any)
- [ ] Update deployment documentation
- [ ] Monitor storage usage

---

## 🎉 **Ready for Production!**

Your file upload system is now **cloud-ready** and will work perfectly in production environments!

**What changed:**
- ✅ Local storage → Cloud storage
- ✅ Lost files on restart → Persistent cloud storage
- ✅ Single server → Scalable to multiple servers
- ✅ Basic uploads → Optimized image delivery

**Next steps:**
1. Set up Cloudinary account
2. Update environment variables
3. Deploy and test
4. Launch your business! 🚀