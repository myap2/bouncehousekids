#!/bin/bash

# Bounce House Kids - Quick Start Script
# This script gets you running in development mode quickly

echo "🎪 Welcome to Bounce House Kids!"
echo "Setting up your development environment..."

# Check if .env files exist, if not create them from templates
if [ ! -f server/.env ]; then
    echo "📝 Creating server .env file..."
    cp server/.env.example server/.env
    echo "✅ Server .env created. Please edit server/.env with your configuration."
fi

if [ ! -f client/.env ]; then
    echo "📝 Creating client .env file..."
    cp client/.env.example client/.env
    echo "✅ Client .env created. Please edit client/.env with your configuration."
fi

echo ""
echo "🚀 Starting development servers..."

# Function to run in background and capture PID
run_server() {
    cd server
    npm install && npm run dev &
    SERVER_PID=$!
    cd ..
}

run_client() {
    cd client
    npm install && npm start &
    CLIENT_PID=$!
    cd ..
}

# Install dependencies and start servers
echo "📦 Installing server dependencies..."
run_server

echo "📦 Installing client dependencies..."
run_client

echo ""
echo "⏳ Starting services (this may take a minute)..."
sleep 5

echo ""
echo "🎉 Development environment is starting!"
echo ""
echo "📊 Services:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:5000"
echo "  MongoDB:  mongodb://localhost:27017/bouncehousekids"
echo ""
echo "🔑 Default login credentials:"
echo "  Email:    admin@bouncehousekids.com"
echo "  Password: password123"
echo ""
echo "📝 To seed the database with sample data:"
echo "  cd server && npm run seed"
echo ""
echo "🛑 To stop all services:"
echo "  Press Ctrl+C or run: killall node"
echo ""
echo "📚 For full setup guide, see: SETUP_GUIDE.md"
echo ""

# Keep script running and handle Ctrl+C
trap 'echo ""; echo "🛑 Stopping all services..."; kill $SERVER_PID $CLIENT_PID 2>/dev/null; exit 0' SIGINT

# Wait for user input
echo "Press Ctrl+C to stop all services..."
wait