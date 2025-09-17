# 🚀 AfricArtz Admin Dashboard - Vercel Deployment Guide

## ✅ **Your App is Ready for Vercel Deployment!**

### 📋 **Pre-Deployment Checklist**
- [x] Production build works (`npm run build:prod`)
- [x] Environment configuration is properly set up
- [x] Vercel configuration file (`vercel.json`) created
- [x] Git repository initialized
- [x] API endpoints configured for production

---

## 🌐 **Deploy to Vercel**

### Method 1: Vercel CLI (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy from project directory:**
   ```bash
   cd "/Users/ikape/Desktop/AFRICARTZ STORE ENTERPRISE/Admin-dashboard"
   vercel
   ```

4. **Follow the prompts:**
   - Set up and deploy: `Y`
   - Which scope: Choose your account/team
   - Link to existing project: `N` (for first deployment)
   - Project name: `africartz-admin-dashboard` (or your preferred name)
   - Directory: `./` (current directory)

### Method 2: Vercel Dashboard (GUI)

1. **Go to:** https://vercel.com/dashboard
2. **Click:** "New Project"
3. **Import:** Your Git repository
4. **Configure:**
   - Framework Preset: `Create React App`
   - Build Command: `npm run build:prod`
   - Output Directory: `build`

---

## 🔧 **Environment Variables Setup**

### In Vercel Dashboard:
1. Go to your project → Settings → Environment Variables
2. Add these variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| `REACT_APP_API_BASE_URL` | `https://api.africartz.com/api` | Production |
| `REACT_APP_ENVIRONMENT` | `production` | Production |
| `REACT_APP_ENABLE_NOTIFICATIONS` | `true` | All |
| `REACT_APP_DEBUG_MODE` | `false` | Production |

### For Preview/Development:
Add the same variables but with staging/development values if needed.

---

## 🌍 **Custom Domain Setup**

### Add Your Domain:
1. In Vercel Dashboard → Project → Settings → Domains
2. Add your custom domain (e.g., `admin.africartz.com`)
3. Follow DNS configuration instructions
4. Vercel will automatically provision SSL certificates

---

## 🔄 **Automatic Deployments**

### Git Integration:
- **Production Branch:** `main` or `master` → Auto-deploys to production
- **Development Branch:** `dev` → Auto-deploys to preview
- **Pull Requests:** → Auto-generates preview deployments

### Manual Deployments:
```bash
# Deploy to production
vercel --prod

# Deploy to preview
vercel
```

---

## 📊 **Deployment Commands Reference**

```bash
# Local development (production API)
npm run start:prod-api

# Local development (local API)
npm run start:dev

# Staging testing
npm run start:staging

# Production build (for deployment)
npm run build:prod

# Test production build locally
npx serve -s build

# Deploy to Vercel
vercel --prod
```

---

## 🚨 **Important Notes**

### Security:
- ✅ Environment files are in `.gitignore`
- ✅ Sensitive data is managed via Vercel dashboard
- ✅ Production API URLs are configured

### Performance:
- ✅ Production build is optimized (457KB gzipped)
- ✅ Static assets are served via Vercel CDN
- ✅ Automatic compression enabled

### API Configuration:
- ✅ Production API: `https://api.africartz.com/api`
- ⚠️ **Ensure CORS is configured** on your API server for your Vercel domain

---

## 🔍 **Troubleshooting**

### Build Failures:
- Check build logs in Vercel dashboard
- Test locally: `npm run build:prod`
- Verify all dependencies are in `package.json`

### API Errors:
- Verify environment variables in Vercel dashboard
- Check API server CORS configuration
- Ensure API server is accessible from Vercel's IPs

### Routing Issues:
- SPA routing is configured in `vercel.json`
- All routes redirect to `index.html`

---

## 🎯 **Post-Deployment**

### Test Your Deployment:
1. **Visit your Vercel URL**
2. **Test login functionality**
3. **Verify API calls work**
4. **Check all routes work**

### Monitor:
- Vercel Analytics (automatic)
- Error tracking via browser console
- API response monitoring

---

## 📞 **Support**

- **Vercel Docs:** https://vercel.com/docs
- **Deployment Issues:** Check Vercel build logs
- **API Issues:** Verify backend CORS configuration

---

**🎉 Your app is ready to deploy! Run `vercel` in your project directory to get started.**
