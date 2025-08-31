# FixMyArea 🏘️

A comprehensive municipal complaint management system that allows residents to report and track issues in their area, with role-based access for residents, staff, and administrators.

## 🌟 Features

### For Residents
- **Complaint Submission**: Report issues with photos and location mapping
- **Real-time Tracking**: Monitor complaint status and updates
- **Location Services**: Integrated mapping for precise issue location
- **Photo Upload**: Attach images to complaints for better documentation
- **Profile Management**: Personal dashboard and complaint history

### For Staff
- **Complaint Management**: View, assign, and update complaint status
- **Task Assignment**: Manage workload and track progress
- **Communication**: Update residents on complaint progress
- **Analytics**: View performance metrics and workload distribution

### For Administrators
- **System Overview**: Comprehensive dashboard with key metrics
- **User Management**: Manage residents and staff accounts
- **Analytics & Reports**: Detailed insights and performance tracking
- **Dog Management**: Track and manage dog registrations
- **System Configuration**: Manage locations and system settings

## 🛠️ Tech Stack

### Backend (Server)
- **Node.js** with **Express.js** framework
- **MongoDB** with **Mongoose** ODM
- **JWT** authentication and authorization
- **Cloudinary** for image storage
- **Twilio** for SMS/OTP services
- **Nodemailer** for email notifications
- **Express Validator** for input validation
- **Helmet** for security headers

### Frontend (Client)
- **React 18** with **Vite** build tool
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Axios** for API communication
- **Leaflet** for interactive maps
- **Recharts** for data visualization
- **React Query** for state management

### Infrastructure
- **MongoDB** database
- **Node.js** runtime environment

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v6.0 or higher)

### GitHub Setup

1. **Clone the repository**
   ```bash
   git clone <your-github-repo-url>
   cd FixMyArea
   ```

2. **Set up your branch**
   ```bash
   git checkout -b your-feature-branch
   ```

### Local Development Setup

1. **Install dependencies**
   ```bash
   # Backend
   cd server
   npm install
   
   # Frontend
   cd ../client
   npm install
   ```

2. **Set up environment variables**
   ```bash
   # In server directory
   cp .env.example .env
   # Configure your environment variables
   ```

3. **Start MongoDB**
   ```bash
   # Start MongoDB service
   # Option 1: Install MongoDB locally and start the service
   # Option 2: Use MongoDB Atlas (cloud database)
   ```

4. **Run the application**
   ```bash
   # Terminal 1 - Backend
   cd server
   npm run dev
   
   # Terminal 2 - Frontend
   cd ../client
   npm run dev
   ```

5. **Access the application**
   - Web App: http://localhost:5173
   - API: http://localhost:5000

## 📁 Project Structure

```
FixMyArea/
├── server/                  # Backend API server
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Route controllers
│   │   ├── data/           # Data files and seeders
│   │   ├── middleware/     # Custom middleware
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   └── services/       # Business logic
│   ├── package.json        # Backend dependencies
│   └── server.js           # Main server file
│
├── client/                  # Frontend React application
│   ├── src/
│   │   ├── assets/         # Static assets
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React contexts
│   │   ├── lib/            # Utility libraries
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── utils/          # Utility functions
│   ├── public/             # Public assets
│   ├── package.json        # Frontend dependencies
│   └── index.html          # Main HTML file
│
├── packages/                # Shared packages (if any)
├── .gitignore              # Git ignore rules
├── README.md               # Main project documentation
└── PROJECT_STRUCTURE.md    # Project structure details
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `server` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/fixmyarea

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRE=24h

# Cloudinary (Image Storage)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Twilio (SMS/OTP)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=your-twilio-number

# Email (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-otp` - OTP verification
- `POST /api/auth/refresh-token` - Refresh JWT token

### Complaints
- `GET /api/complaints` - Get complaints (with filters)
- `POST /api/complaints` - Create new complaint
- `GET /api/complaints/:id` - Get complaint details
- `PUT /api/complaints/:id` - Update complaint
- `DELETE /api/complaints/:id` - Delete complaint

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users` - Get all users (admin only)

### Locations
- `GET /api/locations` - Get available locations
- `GET /api/locations/:id` - Get location details

## 🧪 Testing

### Backend Tests
```bash
cd server
npm test
```

### Frontend Tests
```bash
cd client
npm run test
```

## 🚀 Deployment

### Production Build
```bash
# Build frontend
cd client
npm run build

# Start production server
cd ../server
npm start
```



## 👥 Team Collaboration

We welcome contributions from developers who want to help make communities better! 

### 🚀 For New Team Members
- **[Team Setup Guide](TEAM_SETUP.md)** - Complete guide for getting started with the team
- **[Contributing Guidelines](CONTRIBUTING.md)** - Detailed contribution workflow and standards

### 🤝 How to Contribute

1. **Fork the repository** on GitHub
2. **Clone your fork** locally
3. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
4. **Make your changes** following our coding standards
5. **Test your changes** thoroughly
6. **Commit your changes** with descriptive messages
7. **Push to your branch** (`git push origin feature/amazing-feature`)
8. **Create a Pull Request** with detailed description

### 📋 Development Resources
- **Bug Reports**: Use our [bug report template](.github/ISSUE_TEMPLATE/bug_report.md)
- **Feature Requests**: Use our [feature request template](.github/ISSUE_TEMPLATE/feature_request.md)
- **Pull Requests**: Use our [PR template](.github/pull_request_template.md)
- **Project Structure**: See [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) for detailed organization

### 🎯 Current Team Focus
- **Backend Development**: API endpoints, database optimization
- **Frontend Development**: UI/UX improvements, responsive design
- **Full-Stack Features**: Cross-cutting functionality, integration
- **Testing & Documentation**: Code quality, user guides

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔮 Roadmap

- [ ] Mobile application (React Native)
- [ ] Real-time notifications
- [ ] Advanced analytics dashboard
- [ ] Integration with municipal systems
- [ ] Multi-language support
- [ ] Advanced reporting features

---

**FixMyArea** - Making communities better, one complaint at a time! 🏘️✨
