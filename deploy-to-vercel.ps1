# Quick Vercel Deployment Script
# Run this from project root: .\deploy-to-vercel.ps1

Write-Host "🚀 Quiz Management System - Vercel Deployment" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if Vercel CLI is installed
Write-Host "🔍 Checking Vercel CLI..." -ForegroundColor Yellow
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue
if (-not $vercelInstalled) {
    Write-Host "❌ Vercel CLI not found. Installing..." -ForegroundColor Red
    npm install -g vercel
    Write-Host "✅ Vercel CLI installed!" -ForegroundColor Green
} else {
    Write-Host "✅ Vercel CLI found!" -ForegroundColor Green
}
Write-Host ""

# Check Git initialization
Write-Host "🔍 Checking Git repository..." -ForegroundColor Yellow
if (-not (Test-Path ".git")) {
    Write-Host "⚠️  Git not initialized. Initializing..." -ForegroundColor Yellow
    git init
    git add .
    git commit -m "Initial commit for Vercel deployment"
    Write-Host "✅ Git repository initialized!" -ForegroundColor Green
} else {
    Write-Host "✅ Git repository found!" -ForegroundColor Green
}
Write-Host ""

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
Write-Host "   Installing backend dependencies..." -ForegroundColor Gray
Set-Location backend
npm install | Out-Null
Set-Location ..

Write-Host "   Installing frontend dependencies..." -ForegroundColor Gray
Set-Location frontend
npm install | Out-Null
Set-Location ..
Write-Host "✅ Dependencies installed!" -ForegroundColor Green
Write-Host ""

# Display environment variables needed
Write-Host "⚙️  Environment Variables Required:" -ForegroundColor Cyan
Write-Host "   You'll need to set these in Vercel:" -ForegroundColor Gray
Write-Host "   1. MONGO_URI - Your MongoDB connection string" -ForegroundColor White
Write-Host "   2. JWT_SECRET - Secure random string (32+ chars)" -ForegroundColor White
Write-Host "   3. NODE_ENV - production" -ForegroundColor White
Write-Host "   4. DEFAULT_ADMIN_EMAIL - admin@charusat.edu.in" -ForegroundColor White
Write-Host "   5. DEFAULT_ADMIN_PASSWORD - Admin@123" -ForegroundColor White
Write-Host "   6. FRONTEND_URL - (will be set after deployment)" -ForegroundColor White
Write-Host ""

# Login check
Write-Host "🔐 Vercel Login Required" -ForegroundColor Cyan
Write-Host "   Running: vercel login" -ForegroundColor Gray
Write-Host ""
vercel login

Write-Host ""
Write-Host "🚀 Starting Deployment..." -ForegroundColor Cyan
Write-Host "   Running: vercel --prod" -ForegroundColor Gray
Write-Host ""

# Deploy
vercel --prod

Write-Host ""
Write-Host "✅ Deployment Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Copy your deployment URL from above" -ForegroundColor White
Write-Host "   2. Add environment variables: vercel env add VARIABLE_NAME" -ForegroundColor White
Write-Host "   3. Update FRONTEND_URL with your deployment URL" -ForegroundColor White
Write-Host "   4. Redeploy: vercel --prod" -ForegroundColor White
Write-Host ""
Write-Host "📖 Full Guide: See VERCEL_DEPLOYMENT.md" -ForegroundColor Yellow
Write-Host ""
