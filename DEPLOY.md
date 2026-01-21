# 🚀 Quick Start - Deploy to Vercel

## Option 1: Automated Deployment (Recommended)

Run this single command from project root:

```powershell
.\deploy-to-vercel.ps1
```

## Option 2: Manual Step-by-Step

### 1. Install Vercel CLI

```powershell
npm install -g vercel
```

### 2. Login to Vercel

```powershell
vercel login
```

### 3. Deploy

```powershell
vercel --prod
```

### 4. Add Environment Variables

After first deployment, add these variables:

```powershell
# MongoDB Connection
vercel env add MONGO_URI
# Paste: mongodb+srv://meetjaka46:meet6782@qmcharusat.2sahf8f.mongodb.net/quiz_management

# JWT Secret (use a strong random string)
vercel env add JWT_SECRET
# Paste: your_super_secure_random_string_at_least_32_characters_long

# Node Environment
vercel env add NODE_ENV
# Enter: production

# Default Admin
vercel env add DEFAULT_ADMIN_EMAIL
# Enter: admin@charusat.edu.in

vercel env add DEFAULT_ADMIN_PASSWORD
# Enter: Admin@123

# Frontend URL (replace with your actual Vercel URL)
vercel env add FRONTEND_URL
# Enter: https://your-app-name.vercel.app
```

### 5. Redeploy with Environment Variables

```powershell
vercel --prod
```

## 📋 Pre-Deployment Checklist

- [x] vercel.json configured
- [x] .vercelignore created
- [x] api/index.js serverless entry point
- [x] Frontend build script ready
- [x] Environment variables documented
- [x] MongoDB Atlas IP whitelist configured (0.0.0.0/0)

## 🎯 Post-Deployment Testing

1. **Health Check**: Visit `https://your-app.vercel.app/api/health`
2. **Frontend**: Visit `https://your-app.vercel.app`
3. **Login**: Use admin@charusat.edu.in / Admin@123

## 📖 Full Documentation

See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for complete guide.

## 🐛 Troubleshooting

- **MongoDB Connection Failed**: Whitelist all IPs (0.0.0.0/0) in MongoDB Atlas
- **CORS Errors**: Set FRONTEND_URL environment variable
- **Build Errors**: Check `vercel logs` for details

## 🆘 Need Help?

- Vercel Docs: https://vercel.com/docs
- MongoDB Atlas: https://mongodb.com/docs/atlas
