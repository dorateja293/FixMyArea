@echo off
REM FixMyArea Project Setup Script for Windows
REM This script helps team members set up the development environment quickly

echo 🏘️ Welcome to FixMyArea Project Setup!
echo ======================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js v16 or higher first.
    echo    Download from: https://nodejs.org/
    pause
    exit /b 1
)

REM Check Node.js version
for /f "tokens=1,2 delims=." %%a in ('node --version') do set NODE_VERSION=%%a
set NODE_VERSION=%NODE_VERSION:~1%
if %NODE_VERSION% LSS 16 (
    echo ❌ Node.js version 16 or higher is required. Current version: 
    node --version
    pause
    exit /b 1
)

echo ✅ Node.js version: 
node --version

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm.
    pause
    exit /b 1
)

echo ✅ npm version: 
npm --version

REM Install backend dependencies
echo.
echo 📦 Installing backend dependencies...
cd server
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)
echo ✅ Backend dependencies installed successfully

REM Install frontend dependencies
echo.
echo 📦 Installing frontend dependencies...
cd ..\client
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)
echo ✅ Frontend dependencies installed successfully

REM Create environment file
echo.
echo 🔧 Setting up environment variables...
cd ..\server
if not exist .env (
    copy .env.example .env >nul
    echo ✅ Environment file created (.env)
    echo ⚠️  Please edit .env file with your configuration values
    echo    Ask the team lead for the required API keys
) else (
    echo ✅ Environment file already exists
)

REM Create .gitignore if it doesn't exist
cd ..
if not exist .gitignore (
    echo 📝 Creating .gitignore file...
    (
        echo # Dependencies
        echo node_modules/
        echo npm-debug.log*
        echo.
        echo # Environment variables
        echo .env
        echo .env.local
        echo .env.development.local
        echo .env.test.local
        echo .env.production.local
        echo.
        echo # Build outputs
        echo dist/
        echo build/
        echo.
        echo # Logs
        echo logs
        echo *.log
        echo.
        echo # Runtime data
        echo pids
        echo *.pid
        echo *.seed
        echo *.pid.lock
        echo.
        echo # Coverage directory used by tools like istanbul
        echo coverage/
        echo *.lcov
        echo.
        echo # nyc test coverage
        echo .nyc_output
        echo.
        echo # Dependency directories
        echo jspm_packages/
        echo.
        echo # Optional npm cache directory
        echo .npm
        echo.
        echo # Optional eslint cache
        echo .eslintcache
        echo.
        echo # Output of 'npm pack'
        echo *.tgz
        echo.
        echo # Yarn Integrity file
        echo .yarn-integrity
        echo.
        echo # parcel-bundler cache (https://parceljs.org/)
        echo .cache
        echo .parcel-cache
        echo.
        echo # next.js build output
        echo .next
        echo.
        echo # nuxt.js build output
        echo .nuxt
        echo.
        echo # vuepress build output
        echo .vuepress/dist
        echo.
        echo # Serverless directories
        echo .serverless
        echo.
        echo # FuseBox cache
        echo .fusebox/
        echo.
        echo # DynamoDB Local files
        echo .dynamodb/
        echo.
        echo # TernJS port file
        echo .tern-port
        echo.
        echo # Stores VSCode versions used for testing VSCode extensions
        echo .vscode-test
        echo.
        echo # OS generated files
        echo .DS_Store
        echo .DS_Store?
        echo ._*
        echo .Spotlight-V100
        echo .Trashes
        echo ehthumbs.db
        echo Thumbs.db
    ) > .gitignore
    echo ✅ .gitignore file created
)

echo.
echo 🎉 Setup completed successfully!
echo.
echo 📋 Next steps:
echo 1. Edit server/.env with your configuration
echo 2. Start MongoDB (local or Atlas)
echo 3. Run the development servers:
echo    Terminal 1: cd server ^&^& npm run dev
echo    Terminal 2: cd client ^&^& npm run dev
echo.
echo 📚 Documentation:
echo - README.md - Project overview
echo - TEAM_SETUP.md - Team collaboration guide
echo - CONTRIBUTING.md - Contribution guidelines
echo - PROJECT_STRUCTURE.md - Detailed project structure
echo.
echo 🚀 Happy coding! 🏘️✨
pause
