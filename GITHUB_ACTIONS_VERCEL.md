# 🚀 GitHub Actions + Vercel Deployment Setup

## ✅ **Automated Deployment Workflow**

Your app is configured for **automated deployment** using GitHub Actions → Vercel integration!

### 🔄 **How It Works:**

1. **Push to GitHub** → GitHub Actions triggered
2. **Build & Test** → Ensures code quality
3. **Deploy to Vercel** → Automatic deployment
4. **Notify** → Deployment status updates

---

## 🛠️ **Initial Setup Required**

### 1. **Set up Vercel Project**

First, connect your project to Vercel manually (one time only):

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Link your project (run this from your project directory)
cd "/Users/ikape/Desktop/AFRICARTZ STORE ENTERPRISE/Admin-dashboard"
vercel --confirm
```

### 2. **Get Vercel Project Information**

After linking, get your project details:

```bash
# Get project info (save this output)
vercel project ls
```

### 3. **Configure GitHub Secrets**

In your GitHub repository, go to **Settings → Secrets and variables → Actions** and add these secrets:

| Secret Name | Where to Find | Description |
|-------------|---------------|-------------|
| `VERCEL_TOKEN` | Vercel Dashboard → Settings → Tokens → Create | Vercel API token |
| `VERCEL_ORG_ID` | `.vercel/project.json` after linking | Your Vercel organization ID |
| `VERCEL_PROJECT_ID` | `.vercel/project.json` after linking | Your specific project ID |

#### Finding Your IDs:
```bash
# After running 'vercel' command, check:
cat .vercel/project.json
```

---

## 🌟 **Deployment Triggers**

### **Production Deployments:**
- ✅ Push to `main` branch → **Automatic production deployment**
- ✅ Runs full test suite before deployment
- ✅ Uses production environment variables
- ✅ Updates deployment status on GitHub

### **Preview Deployments:**
- ✅ Pull Requests → **Automatic preview deployments**  
- ✅ Comments preview URL on PR
- ✅ Updated with every new commit to PR

### **Testing:**
- ✅ All branches → **Run tests and build checks**
- ✅ Security scanning with npm audit
- ✅ Lighthouse performance testing on PRs

---

## 📋 **Environment Variables**

Your workflow automatically sets these for production builds:

```yaml
env:
  REACT_APP_API_BASE_URL: https://api.africartz.com/api
  REACT_APP_ENVIRONMENT: production
  REACT_APP_ENABLE_NOTIFICATIONS: true
  REACT_APP_DEBUG_MODE: false
```

### **Additional Variables (Optional):**
Add these in Vercel Dashboard → Project → Settings → Environment Variables:

- `REACT_APP_API_TIMEOUT`
- `REACT_APP_RETRY_ATTEMPTS`
- Any other custom variables

---

## 🔧 **Workflow Files**

### **1. Main CI/CD Pipeline** (`.github/workflows/ci.yml`)
- ✅ Tests and builds on all branches
- ✅ Security scanning
- ✅ Docker builds (if needed)
- ✅ Lighthouse performance testing

### **2. Vercel Deployment** (`.github/workflows/vercel-deploy.yml`)
- ✅ Production deployment on `main` branch
- ✅ Preview deployments for PRs
- ✅ Automated environment setup
- ✅ Status updates and notifications

---

## 🚀 **Deployment Process**

### **For Production:**

1. **Make your changes locally**
2. **Commit and push to main branch:**
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```
3. **GitHub Actions automatically:**
   - Runs tests
   - Builds production version
   - Deploys to Vercel
   - Updates deployment status

### **For Testing:**

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature
   git push origin feature/your-feature
   ```
2. **Create Pull Request**
3. **GitHub Actions automatically:**
   - Runs all tests
   - Creates preview deployment
   - Comments preview URL on PR

---

## 📊 **Monitoring & Status**

### **GitHub:**
- ✅ Check Actions tab for deployment status
- ✅ Commit status indicators
- ✅ PR comments with preview URLs

### **Vercel Dashboard:**
- ✅ Deployment history and logs
- ✅ Performance analytics  
- ✅ Custom domain management

---

## 🔍 **Troubleshooting**

### **Build Failures:**
1. Check GitHub Actions logs
2. Verify environment variables in Vercel
3. Test build locally: `npm run build:prod`

### **Deployment Failures:**
1. Verify Vercel secrets in GitHub
2. Check Vercel project is properly linked
3. Ensure API endpoints are accessible

### **Permission Issues:**
1. Regenerate Vercel token
2. Verify organization access
3. Check repository access permissions

---

## 🎯 **Next Steps After Setup**

1. **Push to GitHub:**
   ```bash
   git push origin main
   ```

2. **Watch the magic happen:**
   - Go to GitHub Actions tab
   - See your deployment in progress
   - Get your live Vercel URL

3. **Set up custom domain** (optional):
   - Add domain in Vercel dashboard
   - Configure DNS records
   - SSL automatically provisioned

---

## 💡 **Pro Tips**

### **Branch Strategy:**
- `main` → Production deployments
- `develop` → Can be configured for staging
- Feature branches → Preview deployments via PRs

### **Environment Management:**
- Production vars → Vercel dashboard
- Build-time vars → GitHub Actions workflow
- Keep secrets in GitHub Secrets, not code

### **Performance:**
- Lighthouse runs on every PR
- Monitor bundle size in CI logs
- Use Vercel Analytics for production metrics

---

## 🎉 **You're All Set!**

Your GitHub Actions + Vercel workflow is configured for:
- ✅ **Automated testing** on every push
- ✅ **Preview deployments** for every PR
- ✅ **Production deployments** on main branch
- ✅ **Performance monitoring** and security scanning

**Just push to GitHub and watch your app deploy automatically!** 🚀
