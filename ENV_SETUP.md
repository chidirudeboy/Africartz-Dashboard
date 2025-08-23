# Environment Configuration Guide

## Overview
This project uses environment variables to manage different configurations for development, staging, and production environments.

## Quick Setup

1. **Copy the example environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit the `.env` file with your configuration:**
   ```bash
   # Required
   REACT_APP_API_BASE_URL=https://api.africartz.com/api
   
   # Optional (with defaults)
   REACT_APP_ENVIRONMENT=production
   REACT_APP_ENABLE_NOTIFICATIONS=true
   ```

## Environment Files

- `.env` - Default environment file (not committed to git)
- `.env.development` - Development-specific variables
- `.env.staging` - Staging-specific variables  
- `.env.example` - Template file (committed to git)

## Available Scripts

### Development
```bash
npm start              # Uses .env or .env.development
npm run start:dev      # Explicitly uses development environment
npm run build:dev      # Build for development
```

### Staging
```bash
npm run start:staging  # Uses .env.staging
npm run build:staging  # Build for staging
```

### Production
```bash
npm start              # Uses .env (production settings)
npm run build:prod     # Build for production
```

### Environment Checking
```bash
npm run env:check      # Shows current environment variables
```

## Environment Variables

### Required Variables
- `REACT_APP_API_BASE_URL` - API base URL for your environment

### Optional Variables
- `REACT_APP_ENVIRONMENT` - Environment name (development/staging/production)
- `REACT_APP_ENABLE_NOTIFICATIONS` - Enable/disable notifications (true/false)
- `REACT_APP_ENABLE_PUSH_NOTIFICATIONS` - Enable push notifications (true/false)
- `REACT_APP_DEBUG_MODE` - Enable debug logging (true/false)
- `REACT_APP_NOTIFICATION_CHECK_INTERVAL` - How often to check for notifications (ms)
- `REACT_APP_API_TIMEOUT` - API request timeout (ms)

## Usage in Code

### Using the Environment Config
```javascript
import { ENV_CONFIG, isDevelopment, debugLog } from './config/env';

// Get API base URL
const apiUrl = ENV_CONFIG.API_BASE_URL;

// Check environment
if (isDevelopment()) {
  console.log('Running in development mode');
}

// Debug logging (only shows in dev/debug mode)
debugLog('This will only log in development or debug mode');
```

### Using Endpoints
```javascript
// Old way (still works)
import { AdminLoginAPI } from './Endpoints';

// New way (recommended)
import { AUTH_ENDPOINTS } from './api/endpoints';
const loginUrl = AUTH_ENDPOINTS.adminLogin;
```

## Environment Priority

React loads environment variables in this order (later files override earlier ones):

1. `.env`
2. `.env.local` (ignored by git)
3. `.env.development`, `.env.staging`, `.env.production`
4. `.env.development.local`, `.env.staging.local`, `.env.production.local`

## Security Notes

- Never commit `.env` files containing sensitive information
- Only commit `.env.example` as a template
- Use `REACT_APP_` prefix for variables that should be available in the browser
- Sensitive keys should be handled server-side, not in React

## Deployment

### Development
```bash
npm run build:dev
# Deploy build/ folder to development server
```

### Staging  
```bash
npm run build:staging
# Deploy build/ folder to staging server
```

### Production
```bash
npm run build:prod
# Deploy build/ folder to production server
```

## Troubleshooting

### Environment variables not loading
1. Ensure variable names start with `REACT_APP_`
2. Restart the development server after adding new variables
3. Check that the `.env` file is in the project root
4. Run `npm run env:check` to verify current values

### API calls failing
1. Check `REACT_APP_API_BASE_URL` is correct for your environment
2. Ensure the API server is running and accessible
3. Verify CORS is configured on the API server

### Build issues
1. Make sure all required environment variables are set
2. Check for typos in variable names
3. Ensure `.env` file exists in project root