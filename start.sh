#!/bin/bash

echo "Starting White Game..."

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "ngrok is not installed. Please install it first:"
    echo "  macOS: brew install ngrok"
    echo "  Linux: snap install ngrok"
    echo "  Or download from: https://ngrok.com/download"
    exit 1
fi

# Check if docker is running
if ! docker info &> /dev/null; then
    echo "Docker is not running. Please start Docker Desktop first."
    exit 1
fi

# Start Docker containers
echo "Starting Docker containers..."
docker-compose up -d

# Wait for services to be ready
echo "Waiting for services to start..."
sleep 5

# Check if services are healthy
if docker-compose ps | grep -q "unhealthy"; then
    echo "Services failed to start properly. Check logs with: docker-compose logs"
    exit 1
fi

echo ""
echo "Services are running!"
echo "Local access: http://localhost"
echo ""
echo "Starting ngrok tunnel..."
echo "Share the ngrok URL with your players!"
echo ""

# Start ngrok
ngrok http 80