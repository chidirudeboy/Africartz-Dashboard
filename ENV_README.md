# 🌍 AfricArtz Admin Dashboard - Environment Guide

## 🚀 Quick Start Commands

| Environment | Command | API URL | Use Case |
|------------|---------|---------|----------|
| **Production API** | `npm run start:prod-api` | `https://api.africartz.com/api` | **Main development with production data** |
| **Local Development** | `npm run start:dev` | `http://localhost:8080/api` | Local testing with local API server |
| **Staging** | `npm run start:staging` | `https://staging-api.africartz.com/api` | Pre-production testing |

---

## 📋 Environment Files Structure

```
├── .env                    # Production settings (default)
├── .env.development        # Local development settings  
├── .env.staging           # Staging environment settings
├── .env.production        # Production build settings
└── .env.example           # Template file (safe to commit)
```

---

## 🛠️ Development Commands

### Start Development Server

```bash
# Production API (Recommended for most development)
npm run start:prod-api

# Local Development API (when you have local backend running)
npm run start:dev

# Staging Environment
npm run start:staging
```

### Build Commands

```bash
# Development build
npm run build:dev

# Staging build  
npm run build:staging

# Production build
npm run build:prod
```

### Serve Production Build

```bash
# Build and serve production
npm run build:prod
npx serve -s build -p 3000
```

---

## 🌐 Environment Details

### 🏭 **Production API Environment**
- **Command**: `npm run start:prod-api`
- **API URL**: `https://api.africartz.com/api`
- **Port**: `http://localhost:3000`
- **Features**: Hot reloading, debugging, production data
- **Best for**: Daily development work

### 💻 **Local Development Environment**
- **Command**: `npm run start:dev`  
- **API URL**: `http://localhost:8080/api`
- **Port**: `http://localhost:3000`
- **Features**: Hot reloading, debugging, mock data
- **Best for**: Backend API development, offline work

### 🧪 **Staging Environment**
- **Command**: `npm run start:staging`
- **API URL**: `https://staging-api.africartz.com/api`
- **Port**: `http://localhost:3000`
- **Features**: Hot reloading, debugging, staging data
- **Best for**: Pre-production testing

---

## 🔧 Setup Instructions

### First Time Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Copy environment template:**
   ```bash
   cp .env.example .env
   ```

3. **Start development server:**
   ```bash
   npm run start:prod-api
   ```

### Environment Variables

#### Required Variables:
- `REACT_APP_API_BASE_URL` - API base URL for your environment

#### Optional Variables:
- `REACT_APP_ENVIRONMENT` - Environment name
- `REACT_APP_ENABLE_NOTIFICATIONS` - Enable/disable notifications
- `REACT_APP_DEBUG_MODE` - Enable debug logging
- `REACT_APP_API_TIMEOUT` - API request timeout (ms)

---

## 🎯 Common Use Cases

### **Daily Development Work**
```bash
npm run start:prod-api
```
*Uses production API with development features like hot reloading*

### **Testing New Backend Features**  
```bash
npm run start:dev
```
*Uses local backend API server running on localhost:8080*

### **Pre-deployment Testing**
```bash
npm run start:staging
```
*Tests against staging environment before production release*

### **Production Build**
```bash
npm run build:prod
npx serve -s build -p 3000
```
*Creates optimized build and serves it locally*

---

## 🔍 Troubleshooting

### **Error: ERR_CONNECTION_REFUSED**
- **Cause**: API server is not running or wrong URL
- **Solution**: Check if the backend API server is running
- **For localhost:8080**: Start your local backend server
- **For api.africartz.com**: Contact DevOps team

### **Error: CORS Policy**  
- **Cause**: Backend doesn't allow frontend domain
- **Solution**: Configure CORS on backend to allow your localhost

### **Environment variables not loading**
1. Ensure variable names start with `REACT_APP_`
2. Restart the development server
3. Check that the `.env` file is in project root
4. Run `npm run env:check` to verify values

---

## 📚 Additional Scripts

```bash
# Check environment variables
npm run env:check

# Run tests
npm test

# Lint code
npm run lint

# Build for specific environment
npm run build:dev
npm run build:staging  
npm run build:prod
```

---

## 🔒 Security Notes

- **Never commit** `.env` files with real credentials
- **Only commit** `.env.example` as a template
- Use `REACT_APP_` prefix for browser-accessible variables
- Handle sensitive data server-side, not in React

---

## 🏗️ Deployment

### Development Deployment
```bash
npm run build:dev
# Deploy build/ folder to dev server
```

### Staging Deployment  
```bash
npm run build:staging
# Deploy build/ folder to staging server
```

### Production Deployment
```bash
npm run build:prod
# Deploy build/ folder to production server
```

---

## 📞 Support

- **Frontend Issues**: Check this README and environment setup
- **Backend/API Issues**: Contact backend development team
- **DevOps/Deployment**: Contact infrastructure team

---

**Last Updated**: September 2024  
**Version**: 1.0.0
