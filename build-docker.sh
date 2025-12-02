#!/bin/bash

# Drivers Dashboard Docker Build Script
# This script builds and optionally runs the Docker container

set -e

IMAGE_NAME="drivers-dashboard"
TAG="latest"
FULL_IMAGE_NAME="${IMAGE_NAME}:${TAG}"

echo "🏗️  Building Drivers Dashboard Docker image..."
echo "📦 Image: ${FULL_IMAGE_NAME}"

# Build the Docker image (token handled at runtime)
echo "🏗️ Building Docker image (token injected at runtime)"
docker build -t "${FULL_IMAGE_NAME}" .

echo "✅ Build completed successfully!"
echo ""
echo "🚀 To run the container:"
echo "   docker run -p 8080:80 ${FULL_IMAGE_NAME}"
echo ""
echo "📊 To run with docker-compose:"
echo "   docker-compose up -d"
echo ""
echo "🔍 To check if it's running:"
echo "   curl http://localhost:8080"
echo ""
echo "🛑 To stop the container:"
echo "   docker-compose down"
echo ""

# Ask if user wants to run the container
read -p "🤔 Do you want to run the container now? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Starting container..."
    docker run -d -p 8080:80 --name drivers-dashboard "${FULL_IMAGE_NAME}"
    echo "✅ Container started!"
    echo "🌐 Access at: http://localhost:8080"
    echo ""
    echo "📊 Container logs:"
    docker logs drivers-dashboard
fi
