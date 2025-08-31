# Contributing to FixMyArea 🤝

Thank you for your interest in contributing to FixMyArea! This guide will help you get started and understand our development workflow.

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v6.0 or higher)
- Git

### Initial Setup

1. **Fork the repository**
   ```bash
   # Fork the repo on GitHub first, then clone your fork
   git clone https://github.com/YOUR_USERNAME/FixMyArea.git
   cd FixMyArea
   ```

2. **Add the original repository as upstream**
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/FixMyArea.git
   ```

3. **Install dependencies**
   ```bash
   # Backend dependencies
   cd server
   npm install
   
   # Frontend dependencies
   cd ../client
   npm install
   ```

4. **Set up environment variables**
   ```bash
   # Copy environment template
   cd ../server
   cp .env.example .env
   
   # Edit .env with your configuration
   # Ask the team lead for the required API keys
   ```

5. **Start MongoDB**
   ```bash
   # Option 1: Local MongoDB
   # Start your local MongoDB service
   
   # Option 2: MongoDB Atlas (Recommended for team development)
   # Use the shared MongoDB Atlas cluster
   ```

## 🔄 Development Workflow

### 1. Create a Feature Branch
```bash
# Always work on a new branch
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

### 2. Make Your Changes
- Follow the coding standards (see below)
- Write tests for new features
- Update documentation if needed

### 3. Test Your Changes
```bash
# Backend tests
cd server
npm test

# Frontend tests
cd ../client
npm run test

# Run the application locally
cd server && npm run dev  # Terminal 1
cd client && npm run dev  # Terminal 2
```

### 4. Commit Your Changes
```bash
# Use conventional commit messages
git commit -m "feat: add user profile page"
git commit -m "fix: resolve complaint submission bug"
git commit -m "docs: update API documentation"
```

### 5. Push and Create Pull Request
```bash
git push origin feature/your-feature-name
# Create PR on GitHub
```

## 📝 Coding Standards

### JavaScript/React Standards
- Use **ES6+** features
- Follow **PascalCase** for React components
- Use **camelCase** for variables and functions
- Use **UPPER_SNAKE_CASE** for constants
- Prefer **const** and **let** over **var**

### File Naming
- **Components**: `UserProfile.jsx`
- **Utilities**: `validation.js`
- **Constants**: `API_ENDPOINTS.js`
- **Tests**: `UserProfile.test.js`

### Code Style
```javascript
// Good
const UserProfile = ({ user, onUpdate }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (data) => {
    setIsLoading(true);
    try {
      await onUpdate(data);
    } catch (error) {
      console.error('Update failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="user-profile">
      {/* Component content */}
    </div>
  );
};

// Bad
function userProfile(props) {
  var loading = false;
  // ...
}
```

### Backend Standards
- Use **async/await** instead of callbacks
- Implement proper error handling
- Use **MVC pattern** (Models, Views, Controllers)
- Follow **RESTful API** conventions

## 🧪 Testing Guidelines

### Backend Testing
```bash
cd server
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage
```

### Frontend Testing
```bash
cd client
npm run test          # Run all tests
npm run test:watch    # Run tests in watch mode
```

### Test Structure
```javascript
// Example test structure
describe('UserProfile Component', () => {
  it('should render user information correctly', () => {
    // Test implementation
  });

  it('should handle form submission', async () => {
    // Test implementation
  });
});
```

## 📋 Pull Request Guidelines

### Before Submitting a PR
- [ ] Code follows the style guidelines
- [ ] Tests pass locally
- [ ] New features have tests
- [ ] Documentation is updated
- [ ] No console.log statements in production code
- [ ] No sensitive data in commits

### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Backend tests pass
- [ ] Frontend tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code where necessary
- [ ] I have made corresponding changes to documentation
```

## 🐛 Bug Reports

When reporting bugs, please include:
- **Description**: What happened
- **Steps to reproduce**: How to reproduce the issue
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happened
- **Environment**: OS, browser, Node.js version
- **Screenshots**: If applicable

## 💡 Feature Requests

When suggesting features:
- **Description**: What the feature should do
- **Use case**: Why this feature is needed
- **Mockups**: UI/UX mockups if applicable
- **Technical considerations**: Any technical details

## 🏗️ Project Structure

### Backend (server/)
```
src/
├── controllers/    # Business logic
├── models/         # Database models
├── routes/         # API endpoints
├── middleware/     # Custom middleware
├── services/       # External service integrations
├── config/         # Configuration files
└── data/           # Static data and seeders
```

### Frontend (client/)
```
src/
├── components/     # Reusable UI components
├── pages/          # Page components
├── contexts/       # React contexts
├── services/       # API service functions
├── utils/          # Utility functions
├── lib/            # Third-party library configs
└── assets/         # Static assets
```

## 🔧 Development Tools

### Recommended VS Code Extensions
- **ESLint** - JavaScript linting
- **Prettier** - Code formatting
- **Auto Rename Tag** - HTML/JSX tag renaming
- **Bracket Pair Colorizer** - Bracket matching
- **GitLens** - Git integration
- **Thunder Client** - API testing

### VS Code Settings
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

## 📞 Communication

### Team Communication
- **Slack/Discord**: For real-time communication
- **GitHub Issues**: For bug reports and feature requests
- **GitHub Discussions**: For general questions and ideas
- **Weekly Standups**: Regular team meetings

### Code Reviews
- Be constructive and respectful
- Focus on the code, not the person
- Suggest improvements, don't just point out issues
- Respond to feedback promptly

## 🎯 Getting Help

### When You're Stuck
1. **Check the documentation** (README.md, PROJECT_STRUCTURE.md)
2. **Search existing issues** on GitHub
3. **Ask in team chat** with specific questions
4. **Create a GitHub issue** for bugs
5. **Schedule a pair programming session**

### Useful Commands
```bash
# Check project status
git status
git log --oneline -10

# Update your fork
git fetch upstream
git checkout main
git merge upstream/main

# Clean up branches
git branch -d feature/completed-feature
git remote prune origin
```

## 🏆 Recognition

Contributors will be recognized in:
- **README.md** contributors section
- **GitHub contributors** page
- **Release notes** for significant contributions
- **Team meetings** for outstanding work

---

**Thank you for contributing to FixMyArea!** 🏘️✨

Together, we're making communities better, one complaint at a time!
