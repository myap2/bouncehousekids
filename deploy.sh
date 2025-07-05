#!/bin/bash

# Bounce House Kids Deployment Script
# This script handles the deployment process

set -e  # Exit on any error

echo "🚀 Starting Bounce House Kids Deployment..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "Please copy .env.production to .env and fill in your configuration."
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed!"
    echo "Please install Docker before running this script."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed!"
    echo "Please install Docker Compose before running this script."
    exit 1
fi

# Pull latest changes (if this is a git repository)
if [ -d ".git" ]; then
    echo "📥 Pulling latest changes..."
    git pull origin main
fi

# Build and start containers
echo "🔨 Building containers..."
docker-compose build --no-cache

echo "🏁 Starting services..."
docker-compose up -d

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 30

# Check if services are running
if [ "$(docker-compose ps -q | wc -l)" -eq 4 ]; then
    echo "✅ All services are running!"
    
    # Show service status
    echo ""
    echo "📊 Service Status:"
    docker-compose ps
    
    echo ""
    echo "🌐 Your application should be available at:"
    echo "Frontend: http://localhost:3000"
    echo "Backend API: http://localhost:5000"
    echo "MongoDB: localhost:27017"
    
    echo ""
    echo "📝 To view logs, run:"
    echo "docker-compose logs -f"
    
    echo ""
    echo "🛑 To stop all services, run:"
    echo "docker-compose down"
    
    echo ""
    echo "🗃️ To seed the database with sample data, run:"
    echo "docker-compose exec server npm run seed"
    
else
    echo "❌ Some services failed to start!"
    echo "Check the logs with: docker-compose logs"
    exit 1
fi

echo ""
echo "🎉 Deployment completed successfully!"