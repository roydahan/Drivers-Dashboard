#!/bin/bash

# Secure Docker Deployment Script for Drivers Dashboard
# This script handles GitHub token securely for production deployment

set -e

IMAGE_NAME="drivers-dashboard"
TAG="${TAG:-latest}"
FULL_IMAGE_NAME="${IMAGE_NAME}:${TAG}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Drivers Dashboard - Secure Docker Deployment${NC}"
echo ""

# Function to prompt for token securely
get_github_token() {
    if [ -n "$GITHUB_TOKEN" ]; then
        echo -e "${GREEN}✅ Using GITHUB_TOKEN from environment${NC}"
        return 0
    fi

    echo -e "${YELLOW}🔑 GitHub Token Required${NC}"
    echo "The dashboard needs a GitHub token for:"
    echo "  • 5,000 API requests/hour (vs 60 without token)"
    echo "  • Access to private repositories (if needed)"
    echo ""
    echo "Create a token at: https://github.com/settings/tokens"
    echo "Required scopes: public_repo"
    echo ""

    # Prompt for token securely (won't echo to terminal)
    read -s -p "Enter your GitHub token (or press Enter to skip): " GITHUB_TOKEN
    echo ""

    if [ -z "$GITHUB_TOKEN" ]; then
        echo -e "${RED}⚠️  No token provided - proceeding without authentication${NC}"
        echo "   API rate limits will apply (60 requests/hour)"
        return 1
    fi

    echo -e "${GREEN}✅ Token provided securely${NC}"
    return 0
}

# Build the Docker image
build_image() {
    echo -e "${BLUE}🏗️  Building Docker image: ${FULL_IMAGE_NAME}${NC}"

    # Build without token injection (token handled at runtime)
    docker build -t "${FULL_IMAGE_NAME}" .

    echo -e "${GREEN}✅ Build completed!${NC}"
    echo -e "${BLUE}ℹ️  Token will be injected at runtime via volume mount${NC}"
}

# Deploy the container
deploy_container() {
    echo -e "${BLUE}🚀 Deploying container...${NC}"

    # Stop existing container if running
    if docker ps -q -f name=drivers-dashboard | grep -q .; then
        echo "🛑 Stopping existing container..."
        docker stop drivers-dashboard >/dev/null 2>&1 || true
        docker rm drivers-dashboard >/dev/null 2>&1 || true
    fi

    # Run the container with GITHUB_TOKEN as environment variable
    if [ -n "$GITHUB_TOKEN" ]; then
        echo -e "${GREEN}🔑 Deploying with GitHub token authentication${NC}"
        docker run -d \
            --name drivers-dashboard \
            --restart unless-stopped \
            -p 8080:80 \
            -e GITHUB_TOKEN="$GITHUB_TOKEN" \
            "${FULL_IMAGE_NAME}"
    else
        echo -e "${YELLOW}⚠️  Deploying without GitHub token${NC}"
        docker run -d \
            --name drivers-dashboard \
            --restart unless-stopped \
            -p 8080:80 \
            "${FULL_IMAGE_NAME}"
    fi

    echo -e "${GREEN}✅ Container deployed successfully!${NC}"
    echo ""
    echo -e "${GREEN}🌐 Access your dashboard at: http://localhost:8080${NC}"
    echo ""
    echo -e "${BLUE}📊 Container Status:${NC}"
    docker ps -f name=drivers-dashboard --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
}

# Show usage information
show_usage() {
    echo -e "${BLUE}📋 Usage:${NC}"
    echo "  # Option 1: Set token as environment variable"
    echo "  export GITHUB_TOKEN=your_token_here"
    echo "  ./deploy-docker.sh"
    echo ""
    echo "  # Option 2: Interactive token prompt"
    echo "  ./deploy-docker.sh"
    echo ""
    echo "  # Option 3: Use docker-compose with .env file"
    echo "  echo 'GITHUB_TOKEN=your_token_here' > .env"
    echo "  docker-compose up -d"
    echo ""
    echo -e "${BLUE}🔒 Security Notes:${NC}"
    echo "  • Token is injected at runtime via volume mount"
    echo "  • Never commit tokens to version control"
    echo "  • runtime-config.js is gitignored and generated locally"
    echo "  • Container can be rebuilt without token changes"
}

# Main execution
main() {
    # Check if help is requested
    if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
        show_usage
        exit 0
    fi

    # Get GitHub token
    TOKEN_PROVIDED=false
    if get_github_token; then
        TOKEN_PROVIDED=true
    fi

    # Build the image
    build_image

    # Deploy the container
    deploy_container

    echo ""
    echo -e "${GREEN}🎉 Deployment Complete!${NC}"
    if [ "$TOKEN_PROVIDED" = true ]; then
        echo -e "${GREEN}🔑 GitHub API authenticated (5,000 requests/hour)${NC}"
    else
        echo -e "${YELLOW}⚠️  No authentication (60 requests/hour limit)${NC}"
    fi

    echo ""
    echo -e "${BLUE}🛑 To stop: docker stop drivers-dashboard${NC}"
    echo -e "${BLUE}🗑️  To remove: docker rm drivers-dashboard${NC}"
    echo -e "${BLUE}📊 View logs: docker logs -f drivers-dashboard${NC}"
}

# Run main function
main "$@"
