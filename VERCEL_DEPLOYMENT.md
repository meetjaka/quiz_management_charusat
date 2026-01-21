# 🚀 Vercel Deployment Guide - Quiz Management System

This guide will help you deploy your full-stack Quiz Management System to Vercel using the CLI.

---

## 📋 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI**: Install globally
3. **Git**: Ensure your project is a git repository
4. **MongoDB Atlas**: Active database cluster

---

## 🛠️ Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

Verify installation:

```bash
vercel --version
```

---

## 🔐 Step 2: Login to Vercel

```bash
vercel login
```

Choose your preferred login method (GitHub, GitLab, Bitbucket, or Email).

---

## 📦 Step 3: Prepare Your Project

### A. Initialize Git Repository (if not already done)

```bash
cd c:\Users\Dell\Desktop\Quiz_Managment_System
git init
git add .
git commit -m "Initial commit for Vercel deployment"
```

### B. Install Backend Dependencies

```bash
cd backend
npm install
cd ..
```

### C. Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

---

## ⚙️ Step 4: Configure Environment Variables

Before deploying, you need to set up environment variables in Vercel.

### Backend Environment Variables (Required):

```bash
# MongoDB
MONGO_URI=mongodb+srv://meetjaka46:meet6782@qmcharusat.2sahf8f.mongodb.net/quiz_management?retryWrites=true&w=majority

# JWT Secret (Generate a secure random string)
JWT_SECRET=your_super_secure_jwt_secret_key_minimum_32_characters_long

# Server Configuration
NODE_ENV=production
PORT=5001

# CORS - Frontend URL (will be updated after first deployment)
FRONTEND_URL=https://your-app-name.vercel.app

# Default Admin
DEFAULT_ADMIN_EMAIL=admin@charusat.edu.in
DEFAULT_ADMIN_PASSWORD=Admin@123

# Email Service (Optional)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### Frontend Environment Variables (Required):

```bash
# API URL (will be your Vercel deployment URL)
REACT_APP_API_URL=/api
```

---

## 🚀 Step 5: Deploy to Vercel

### Option A: Deploy with Interactive Setup

```bash
# From project root
vercel
```

Follow the prompts:

1. **Set up and deploy**: Choose `Y`
2. **Which scope**: Select your account
3. **Link to existing project**: Choose `N` (for first deployment)
4. **Project name**: Enter a name (e.g., `quiz-management-system`)
5. **Directory**: Press Enter (use current directory)
6. **Override settings**: Choose `N`

### Option B: Deploy with One Command

```bash
vercel --prod
```

---

## 🔧 Step 6: Add Environment Variables via CLI

After deployment, add environment variables:

```bash
# Add each environment variable
vercel env add MONGO_URI
# Paste your MongoDB URI when prompted
# Select: Production, Preview, Development (all three)

vercel env add JWT_SECRET
# Enter a strong random string (min 32 characters)
# Select: Production, Preview, Development

vercel env add NODE_ENV
# Enter: production
# Select: Production

vercel env add DEFAULT_ADMIN_EMAIL
# Enter: admin@charusat.edu.in
# Select: Production, Preview, Development

vercel env add DEFAULT_ADMIN_PASSWORD
# Enter: Admin@123
# Select: Production, Preview, Development

vercel env add FRONTEND_URL
# Enter: https://your-app-name.vercel.app (use your actual URL from deployment)
# Select: Production

vercel env add REACT_APP_API_URL
# Enter: /api
# Select: Production
```

---

## 🔄 Step 7: Redeploy with Environment Variables

After adding environment variables, redeploy:

```bash
vercel --prod
```

---

## 📱 Step 8: Access Your Deployment

After successful deployment, you'll receive URLs:

- **Production URL**: `https://your-app-name.vercel.app`
- **Preview URLs**: For branch deployments
- **Deployment Dashboard**: `https://vercel.com/dashboard`

### Test Your Deployment:

1. **Health Check**: Visit `https://your-app-name.vercel.app/api/health`
2. **Frontend**: Visit `https://your-app-name.vercel.app`
3. **Login**: Use default admin credentials:
   - Email: `admin@charusat.edu.in`
   - Password: `Admin@123`

---

## 🔍 Step 9: Verify Deployment

### Check Backend API:

```bash
curl https://your-app-name.vercel.app/api/health
```

Expected response:

```json
{
  "message": "Server is running",
  "timestamp": "2026-01-21T...",
  "mongodb": "Connected"
}
```

### Check Frontend:

Open browser: `https://your-app-name.vercel.app`

---

## 🌐 Step 10: Connect Custom Domain (Optional)

### Via CLI:

```bash
vercel domains add yourdomain.com
```

### Via Dashboard:

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Domains**
4. Add your custom domain
5. Update DNS records as instructed

---

## 🔄 Continuous Deployment

### Link to Git Repository:

```bash
# Push to GitHub/GitLab/Bitbucket
git remote add origin https://github.com/yourusername/quiz-management-system.git
git push -u origin main
```

### Auto-deployment:

Once linked to Git, Vercel will automatically deploy:

- **Main branch** → Production
- **Other branches** → Preview deployments

---

## 🛠️ Managing Your Deployment

### View Deployment Logs:

```bash
vercel logs
```

### List Deployments:

```bash
vercel ls
```

### Promote Preview to Production:

```bash
vercel promote <deployment-url>
```

### Remove Deployment:

```bash
vercel remove <project-name>
```

---

## 📊 Environment Variables Management

### List Environment Variables:

```bash
vercel env ls
```

### Remove Environment Variable:

```bash
vercel env rm VARIABLE_NAME
```

### Pull Environment Variables Locally:

```bash
vercel env pull
```

---

## 🐛 Troubleshooting

### Issue 1: MongoDB Connection Failed

**Solution**: Ensure MongoDB Atlas allows connections from all IPs:

1. Go to MongoDB Atlas Dashboard
2. Network Access → Add IP Address
3. Click "Allow Access from Anywhere" (0.0.0.0/0)

### Issue 2: CORS Errors

**Solution**: Update FRONTEND_URL environment variable:

```bash
vercel env add FRONTEND_URL
# Enter: https://your-actual-deployment-url.vercel.app
# Select: Production
```

Then redeploy:

```bash
vercel --prod
```

### Issue 3: 404 on API Routes

**Solution**: Check `vercel.json` routing configuration. The file should already be configured correctly.

### Issue 4: Build Failures

**Solution**: Check build logs:

```bash
vercel logs
```

Common fixes:

- Ensure all dependencies are in `package.json`
- Check Node.js version compatibility
- Verify environment variables are set

### Issue 5: File Upload Not Working

**Note**: Vercel serverless functions are stateless. File uploads to `/uploads` won't persist.

**Solutions**:

1. Use **Vercel Blob Storage**: [vercel.com/docs/storage/vercel-blob](https://vercel.com/docs/storage/vercel-blob)
2. Use **AWS S3** or **Cloudinary** for file storage
3. For Excel uploads, process in-memory without saving

---

## 📦 Project Structure for Vercel

```
Quiz_Managment_System/
├── api/
│   └── index.js              # Serverless backend entry point
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── .env.production
├── vercel.json               # Vercel configuration
├── .vercelignore            # Files to exclude from deployment
└── .env.example             # Environment variables template
```

---

## 🔒 Security Best Practices

1. **Never commit `.env` files** to Git
2. **Use strong JWT secrets** (minimum 32 characters, random)
3. **Enable MongoDB IP whitelist** (or use 0.0.0.0/0 for Vercel)
4. **Change default admin password** after first login
5. **Use HTTPS only** (Vercel provides this automatically)
6. **Set NODE_ENV=production** in Vercel environment variables

---

## 📝 Quick Reference Commands

```bash
# Deploy to production
vercel --prod

# Deploy preview (branch deployment)
vercel

# View logs
vercel logs

# List deployments
vercel ls

# Add environment variable
vercel env add VARIABLE_NAME

# List environment variables
vercel env ls

# Pull environment variables
vercel env pull

# Login
vercel login

# Logout
vercel logout
```

---

## 🎯 Post-Deployment Checklist

- [ ] Verify health endpoint: `/api/health`
- [ ] Test admin login
- [ ] Create a test quiz
- [ ] Upload Excel quiz (if using in-memory processing)
- [ ] Test student quiz attempt
- [ ] Check analytics dashboards
- [ ] Verify email notifications (if configured)
- [ ] Update CORS settings if needed
- [ ] Set up custom domain (optional)
- [ ] Enable Git-based continuous deployment
- [ ] Change default admin password
- [ ] Monitor application logs

---

## 📞 Support & Resources

- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Vercel CLI Docs**: [vercel.com/docs/cli](https://vercel.com/docs/cli)
- **MongoDB Atlas**: [mongodb.com/docs/atlas](https://mongodb.com/docs/atlas)
- **Vercel Support**: [vercel.com/support](https://vercel.com/support)

---

## 🎉 You're All Set!

Your Quiz Management System is now deployed on Vercel with:

- ✅ Serverless backend API
- ✅ React frontend with build optimization
- ✅ MongoDB database connection
- ✅ Environment variable security
- ✅ Automatic HTTPS
- ✅ Global CDN distribution

**Access your app at**: `https://your-app-name.vercel.app`

Happy deploying! 🚀
