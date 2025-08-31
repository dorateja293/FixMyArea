# FixMyArea Project Structure 📁

This document provides a detailed overview of the FixMyArea project structure and organization.

## 🏗️ Overall Architecture

```
FixMyArea/
├── server/                  # Backend API server
├── client/                  # Frontend React application
├── packages/                # Shared packages (future use)
├── docs/                    # Documentation (future use)
├── .gitignore              # Git ignore rules
├── README.md               # Main project documentation
└── PROJECT_STRUCTURE.md    # This file
```

## 🖥️ Backend (Server) Structure

```
server/
├── src/
│   ├── config/             # Configuration files
│   │   ├── cloudinary.js   # Cloudinary image service config
│   │   └── database.js     # Database connection config
│   │
│   ├── controllers/        # Route controllers (MVC pattern)
│   │   ├── authController.js      # Authentication logic
│   │   ├── complaintController.js # Complaint management
│   │   ├── dogController.js       # Dog registration
│   │   ├── locationController.js  # Location management
│   │   ├── reportController.js    # Reporting functionality
│   │   └── userController.js      # User management
│   │
│   ├── data/               # Static data and seeders
│   │   ├── locations.json  # Location catalog data
│   │   └── seeders/        # Database seeding scripts
│   │
│   ├── middleware/         # Custom middleware functions
│   │   ├── auth.js         # JWT authentication
│   │   ├── fileUpload.js   # File upload handling
│   │   └── validation.js   # Input validation
│   │
│   ├── models/             # Database models (Mongoose schemas)
│   │   ├── Complaint.js    # Complaint data model
│   │   ├── DogRecord.js    # Dog registration model
│   │   ├── LocationCatalog.js # Location data model
│   │   ├── OTP.js          # OTP verification model
│   │   └── User.js         # User data model
│   │
│   ├── routes/             # API route definitions
│   │   ├── authRoutes.js   # Authentication endpoints
│   │   ├── complaintRoutes.js # Complaint endpoints
│   │   ├── dogRoutes.js    # Dog management endpoints
│   │   ├── locationRoutes.js # Location endpoints
│   │   ├── otpRoutes.js    # OTP verification endpoints
│   │   ├── reportRoutes.js # Reporting endpoints
│   │   └── userRoutes.js   # User management endpoints
│   │
│   └── services/           # Business logic services
│       └── otpService.js   # OTP generation and verification
│
├── package.json            # Backend dependencies and scripts
├── server.js               # Main server entry point
└── .env.example           # Environment variables template
```

## 🎨 Frontend (Client) Structure

```
client/
├── src/
│   ├── assets/             # Static assets
│   │   └── react.svg       # React logo
│   │
│   ├── components/         # Reusable UI components
│   │   ├── Navigation.jsx  # Navigation component
│   │   ├── OTPVerification.jsx # OTP verification UI
│   │   ├── ProtectedRoute.jsx  # Route protection
│   │   └── ui/             # UI component library
│   │       ├── button.jsx  # Button component
│   │       └── card.jsx    # Card component
│   │
│   ├── contexts/           # React context providers
│   │   └── AuthContext.jsx # Authentication state management
│   │
│   ├── lib/                # Utility libraries
│   │   └── utils.js        # Common utility functions
│   │
│   ├── pages/              # Page components
│   │   ├── AdminDashboard.jsx    # Admin dashboard
│   │   ├── AnalyticsPage.jsx     # Analytics view
│   │   ├── AuthLayout.jsx        # Authentication layout
│   │   ├── ComplaintForm.jsx     # Complaint submission
│   │   ├── DogManagementPage.jsx # Dog management
│   │   ├── LandingPage.jsx       # Home page
│   │   ├── LoginPage.jsx         # Login form
│   │   ├── ProfilePage.jsx       # User profile
│   │   ├── RegisterPage.jsx      # Registration form
│   │   ├── RoleSelectionPage.jsx # Role selection
│   │   ├── ResidentDashboard.jsx # Resident dashboard
│   │   └── StaffDashboard.jsx    # Staff dashboard
│   │
│   ├── services/           # API service functions
│   │   └── locationService.js # Location API calls
│   │
│   └── utils/              # Utility functions
│       └── validation.js   # Form validation logic
│
├── public/                 # Public assets
│   └── logo.png           # Application logo
│
├── package.json            # Frontend dependencies and scripts
├── index.html              # Main HTML file
├── main.jsx                # React entry point
├── App.jsx                 # Main App component
├── App.css                 # Main App styles
├── index.css               # Global styles
├── tailwind.config.js      # Tailwind CSS configuration
├── postcss.config.js       # PostCSS configuration
├── vite.config.js          # Vite build configuration
└── eslint.config.js        # ESLint configuration
```

## 🔧 Configuration Files

### Backend Configuration
- **Environment Variables**: `.env` file (not tracked in Git)
- **Database**: MongoDB connection string
- **External Services**: Cloudinary, Twilio, Nodemailer
- **Security**: JWT secrets and expiration

### Frontend Configuration
- **Build Tool**: Vite configuration
- **Styling**: Tailwind CSS configuration
- **Linting**: ESLint rules
- **PostCSS**: CSS processing

## 📦 Package Management

### Backend Dependencies
- **Runtime**: Express, Mongoose, JWT, etc.
- **Development**: Nodemon, ESLint, Jest
- **Scripts**: `npm run dev`, `npm start`, `npm test`

### Frontend Dependencies
- **Runtime**: React, React Router, Axios, etc.
- **Development**: Vite, ESLint, Tailwind CSS
- **Scripts**: `npm run dev`, `npm run build`, `npm run preview`

## 🚀 Development Workflow

1. **Clone Repository**: `git clone <repo-url>`
2. **Install Dependencies**: Run `npm install` in both `server` and `client`
3. **Environment Setup**: Copy `.env.example` to `.env` and configure
4. **Database**: Start MongoDB (local or Atlas)
5. **Run Development**: 
   - Backend: `cd server && npm run dev`
   - Frontend: `cd client && npm run dev`

## 📁 File Naming Conventions

- **Components**: PascalCase (e.g., `Navigation.jsx`)
- **Utilities**: camelCase (e.g., `validation.js`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_ENDPOINTS`)
- **Files**: kebab-case for multi-word files (e.g., `auth-controller.js`)

## 🔒 Security Considerations

- Environment variables are not tracked in Git
- JWT tokens for authentication
- Input validation middleware
- File upload restrictions
- Rate limiting for API endpoints

## 📊 Testing Structure

- **Backend**: Jest tests in `apps/server`
- **Frontend**: Component testing (to be implemented)
- **API**: Integration tests for endpoints

## 🌐 Deployment Structure

- **Backend**: Node.js production server
- **Frontend**: Built static files served by backend
- **Database**: MongoDB (local or cloud)
- **Assets**: Cloudinary for image storage

---

This structure follows modern best practices for full-stack JavaScript applications with clear separation of concerns and maintainable code organization.
