# My Bounce Place - Setup Guide

## 🎯 Quick Setup Checklist

### 1. **Update Business Information**
Edit `js/config.js` and update:
- Phone number
- Email address
- Business hours
- Service area
- Pricing (if different)
- Social media links (optional)

### 2. **Set Up Analytics & Email**
Replace placeholder values in `js/config.js`:
- **Google Analytics**: Get your GA4 ID from Google Analytics
- **EmailJS**: Sign up at emailjs.com and get your public key

### 3. **Domain Configuration**
- Update `CNAME` file with your actual domain
- Update `sitemap.xml` with your domain URL
- Update `robots.txt` if needed

### 4. **Test Your Website**
Run locally to test:
```bash
python -m http.server 8000
# or
npx serve .
```
Then visit `http://localhost:8000`

### 5. **Deploy to Web Host**
Upload all files to your web hosting service:
- **Netlify**: Drag and drop the folder
- **Vercel**: Connect to Git repository
- **GitHub Pages**: Push to repository
- **Any web hosting**: Upload via FTP

## 📱 What's Optimized for Your Single Bounce House

✅ **Single Product Focus**: Website highlights your princess castle
✅ **Clear Pricing**: Daily, weekly, and weekend rates displayed
✅ **Detailed Information**: Space requirements, capacity, features
✅ **Easy Booking**: Simple contact form for inquiries
✅ **Mobile Friendly**: Works great on phones and tablets
✅ **SEO Optimized**: Ready for search engines
✅ **Professional Design**: Clean, modern look

## 🔧 Easy Customization

### Change Colors/Theme
Edit `css/styles.css` - look for color variables at the top

### Update Images
Replace `images/princess-castle-1.jpg` with your actual bounce house photo

### Modify Content
- `js/data.js` - Bounce house details and FAQ
- `js/config.js` - Business information
- `index.html` - Main page content

## 📞 Support

Your website is now optimized for a single bounce house business! The focus is on your princess castle, making it easy for customers to understand what you offer and how to book.

## 🚀 Next Steps (Optional)

1. **Add Real Photos**: Replace the placeholder image with actual photos of your bounce house
2. **Set Up Google Business**: Create a Google Business profile for local SEO
3. **Add Reviews**: Collect and display customer testimonials
4. **Social Media**: Link your Facebook/Instagram accounts
5. **Online Payments**: Consider adding payment processing

---

**Your website is ready to go!** 🎉