#!/bin/bash

echo "🐳 Testing Docker setup for Africartz Dashboard"
echo "================================================"

# Test 1: Check Docker installation
echo "1. Checking Docker installation..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not installed"
    exit 1
fi
echo "✅ Docker version: $(docker --version)"

# Test 2: Build development image
echo "2. Building development Docker image..."
if docker build -f Dockerfile.dev -t africartz-dashboard-dev .; then
    echo "✅ Development image built successfully"
else
    echo "❌ Failed to build development image"
    exit 1
fi

# Test 3: Build production image
echo "3. Building production Docker image..."
if docker build -t africartz-dashboard-prod .; then
    echo "✅ Production image built successfully"
else
    echo "❌ Failed to build production image"
    exit 1
fi

# Test 4: Test docker-compose
echo "4. Testing docker-compose configuration..."
if docker-compose config; then
    echo "✅ docker-compose configuration is valid"
else
    echo "❌ docker-compose configuration has errors"
    exit 1
fi

echo ""
echo "🎉 All Docker tests passed!"
echo ""
echo "Next steps:"
echo "- Run 'docker-compose up app-dev' for development"
echo "- Run 'docker-compose up app' for production"
echo "- Access your app at http://localhost:3001 (dev) or http://localhost:3000 (prod)"