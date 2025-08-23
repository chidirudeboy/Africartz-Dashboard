# 🏠 AfricArtz Admin Dashboard

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![Chakra UI](https://img.shields.io/badge/Chakra%20UI-2.5.5-teal.svg)](https://chakra-ui.com/)
[![Node Version](https://img.shields.io/badge/Node-16%2B-green.svg)](https://nodejs.org/)

A comprehensive admin dashboard for managing the AfricArtz platform - apartment bookings, agent management, and property approvals.

## 🚀 Features

- **🏢 Apartment Management**: Review, approve, and reject property listings
- **📋 Bookings Dashboard**: Monitor platform bookings and revenue
- **👥 Agent Management**: Oversee property agents and their performance
- **👤 User Management**: Manage platform users and permissions
- **📊 Analytics**: View platform statistics and sales summaries
- **🔔 Notifications**: Real-time notification system
- **📱 Responsive Design**: Works on desktop and mobile devices

## 🛠️ Tech Stack

- **Frontend**: React 18, Chakra UI, Emotion
- **Data Tables**: PrimeReact
- **Charts**: ApexCharts, Recharts
- **HTTP Client**: Axios
- **Icons**: React Icons
- **Media**: Yet Another React Lightbox
- **Date Handling**: DayJS

## 📋 Prerequisites

- Node.js 16 or higher
- npm or yarn package manager
- Access to AfricArtz API backend

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Admin-dashboard
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
```bash
# Copy the environment template
cp .env.example .env

# Edit .env with your configuration (see .env.example for all variables)
# Contact the development team for API endpoints and configuration values
```

### 4. Available Scripts

#### Development
```bash
npm start              # Start development server (port 3000)
npm run start:dev      # Start with development environment
npm run start:staging  # Start with staging environment
```

#### Building
```bash
npm run build          # Build for production
npm run build:dev      # Build for development
npm run build:staging  # Build for staging
npm run build:prod     # Build for production
```

#### Environment Management
```bash
npm run env:check      # Check current environment variables
```

## 🌍 Environment Configuration

The application supports multiple environments with different API endpoints and configurations.

**Environment Files:**
- `.env.development` - Development environment
- `.env.staging` - Staging environment  
- `.env` - Production environment (default)
- `.env.example` - Template with all available variables

See [ENV_SETUP.md](./ENV_SETUP.md) for detailed environment configuration.

**Note**: Contact the development team for actual API endpoints and sensitive configuration values.

## 📱 Main Features

### Apartment Management
- View pending apartment submissions
- Review apartment details, photos, and videos
- Approve apartments with notes
- Reject apartments with reasons
- Track approval history

### Bookings Management
- View booking summaries and statistics
- Monitor online vs manual bookings
- Track platform revenue
- Filter and search bookings
- Export booking data

### Agent Management
- View all registered agents
- Monitor agent performance
- Track agent bookings and revenue
- Manage agent permissions

### User Management
- View platform users
- Manage user accounts
- Track user activity

## 🔧 Key Components

```
src/
├── Pages/Admin/
│   ├── Apartments/          # Apartment management
│   ├── ApprovedApartments/  # Approved apartments view
│   ├── Bookings/           # Booking management
│   ├── Agents/             # Agent management
│   └── Users/              # User management
├── Layouts/                # App layout components
├── components/             # Reusable components
├── api/                    # API configuration
├── config/                 # Environment configuration
└── utils/                  # Utility functions
```

## 🔐 Authentication

The dashboard uses JWT token-based authentication:
- Login with admin credentials
- Tokens stored in localStorage
- Automatic token refresh
- Protected routes

## 📊 Data Management

- **Real-time updates**: Live data from API
- **Caching**: Optimized API calls
- **Error handling**: Comprehensive error management
- **Loading states**: User-friendly loading indicators

## 🎨 UI/UX

- **Design System**: Chakra UI components
- **Theme**: Light/dark mode support
- **Responsive**: Mobile-first approach
- **Accessibility**: WCAG compliant

## 🔧 Development

### Code Structure
- Clean component architecture
- Custom hooks for data fetching
- Environment-based configuration
- Consistent error handling

### Best Practices
- TypeScript-ready (JSX files can be migrated)
- ESLint configuration
- Component reusability
- Performance optimization

## 📦 Deployment

### Production Build
```bash
npm run build:prod
```

### Deployment Options
- Static hosting (Netlify, Vercel)
- CDN deployment
- Docker containerization
- CI/CD pipeline ready

## 🐛 Troubleshooting

### Common Issues

1. **API Connection Issues**
   - Check API base URL configuration in `.env`
   - Verify API server is running and accessible
   - Check CORS configuration on server
   - Ensure environment variables are properly set

2. **Authentication Problems**
   - Clear localStorage and try logging in again
   - Check if authentication token has expired
   - Verify API endpoints are correct

3. **Build Errors**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check Node.js version compatibility (16+)
   - Verify all environment variables are set correctly

### Debug Mode
```bash
REACT_APP_DEBUG_MODE=true npm start
```

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

This project is proprietary software for AfricArtz platform.

## 🔐 Private Documentation

For team members with access to sensitive configuration:
- See `README.private.md` for actual API endpoints and configuration values
- Contact the development team for access to private documentation
- Internal deployment guides available in private docs

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the API documentation

---

**Built with ❤️ for AfricArtz Platform**