# Bounce House Kids - Quick Start Script for Windows
# This script gets you running in development mode quickly

Write-Host "🎪 Welcome to Bounce House Kids!" -ForegroundColor Green
Write-Host "Setting up your development environment..." -ForegroundColor Yellow

# Check if .env files exist, if not create them from templates
if (-not (Test-Path "server\.env")) {
    Write-Host "📝 Creating server .env file..." -ForegroundColor Cyan
    if (Test-Path "server\.env.example") {
        Copy-Item "server\.env.example" "server\.env"
        Write-Host "✅ Server .env created. Please edit server\.env with your configuration." -ForegroundColor Green
    } else {
        Write-Host "⚠️  server\.env.example not found. Please create server\.env manually." -ForegroundColor Yellow
    }
}

if (-not (Test-Path "client\.env")) {
    Write-Host "📝 Creating client .env file..." -ForegroundColor Cyan
    if (Test-Path "client\.env.example") {
        Copy-Item "client\.env.example" "client\.env"
        Write-Host "✅ Client .env created. Please edit client\.env with your configuration." -ForegroundColor Green
    } else {
        Write-Host "⚠️  client\.env.example not found. Please create client\.env manually." -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "🚀 Starting development servers..." -ForegroundColor Green

# Function to run server
function Start-Server {
    Write-Host "📦 Installing server dependencies..." -ForegroundColor Cyan
    Set-Location server
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Server dependencies installed successfully" -ForegroundColor Green
        Write-Host "🚀 Starting server..." -ForegroundColor Cyan
        npm run dev
    } else {
        Write-Host "❌ Failed to install server dependencies" -ForegroundColor Red
    }
    Set-Location ..
}

# Function to run client
function Start-Client {
    Write-Host "📦 Installing client dependencies..." -ForegroundColor Cyan
    Set-Location client
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Client dependencies installed successfully" -ForegroundColor Green
        Write-Host "🚀 Starting client..." -ForegroundColor Cyan
        npm start
    } else {
        Write-Host "❌ Failed to install client dependencies" -ForegroundColor Red
    }
    Set-Location ..
}

Write-Host ""
Write-Host "⏳ Starting services (this may take a minute)..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

Write-Host ""
Write-Host "🎉 Development environment is starting!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Services:" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "  Backend:  http://localhost:5000" -ForegroundColor White
Write-Host "  MongoDB:  mongodb://localhost:27017/bouncehousekids" -ForegroundColor White
Write-Host ""
Write-Host "🔑 Default login credentials:" -ForegroundColor Cyan
Write-Host "  Email:    admin@bouncehousekids.com" -ForegroundColor White
Write-Host "  Password: password123" -ForegroundColor White
Write-Host ""
Write-Host "📝 To seed the database with sample data:" -ForegroundColor Cyan
Write-Host "  cd server; npm run seed" -ForegroundColor White
Write-Host ""
Write-Host "🛑 To stop all services:" -ForegroundColor Cyan
Write-Host "  Press Ctrl+C or close the terminal windows" -ForegroundColor White
Write-Host ""
Write-Host "📚 For full setup guide, see: SETUP_GUIDE.md" -ForegroundColor Cyan
Write-Host ""

# Start both servers in separate windows
Write-Host "Starting server in new window..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\server'; npm install; npm run dev"

Write-Host "Starting client in new window..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\client'; npm install; npm start"

Write-Host ""
Write-Host "✅ Both servers are starting in separate windows!" -ForegroundColor Green
Write-Host "Check the new PowerShell windows for the running services." -ForegroundColor Cyan 