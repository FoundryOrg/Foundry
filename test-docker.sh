#!/bin/bash

echo "🚀 Testing Foundry Docker Setup"
echo "================================"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop."
    exit 1
fi

echo "✅ Docker is running"

# Build the backend image
echo "🔨 Building backend image..."
cd backend
docker build -t foundry-backend . || {
    echo "❌ Failed to build backend image"
    exit 1
}

echo "✅ Backend image built successfully"

# Test the container
echo "🧪 Testing backend container..."
docker run -d --name test-backend -p 8000:8000 \
  -e NEXT_PUBLIC_SUPABASE_URL="test" \
  -e SUPABASE_SERVICE_ROLE_KEY="test" \
  -e ANTHROPIC_API_KEY="test" \
  -e FRONTEND_URL="http://localhost:3000" \
  foundry-backend

# Wait for container to start
sleep 5

# Test the API
echo "🌐 Testing API endpoint..."
response=$(curl -s http://localhost:8000/)
if [[ $response == *"Foundry Course Builder API"* ]]; then
    echo "✅ API is responding correctly"
else
    echo "❌ API test failed"
    docker logs test-backend
fi

# Cleanup
echo "🧹 Cleaning up..."
docker stop test-backend
docker rm test-backend

echo "✅ Docker test completed!"
