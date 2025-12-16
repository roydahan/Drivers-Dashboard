#!/bin/bash

# Build script that injects GitHub token at build time
# Usage: export GITHUB_TOKEN=your_token_here && ./build.sh

echo "🔨 Building Drivers Dashboard with GitHub token injection..."

# Check if token is provided
if [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ Error: GITHUB_TOKEN environment variable not set!"
    echo "   Usage: export GITHUB_TOKEN=your_token_here && ./build.sh"
    exit 1
fi

# Create build directory
mkdir -p dist

# Copy all files
cp *.html *.css *.js dist/ 2>/dev/null || true
cp README.md dist/ 2>/dev/null || true

# Inject token into the built script.js
sed "s/const GITHUB_TOKEN = null;/const GITHUB_TOKEN = '$GITHUB_TOKEN';/" script.js > dist/script.js

# Update HTML to point to built files
sed 's|script.js|script.js|' dist/index.html > dist/index.html.tmp && mv dist/index.html.tmp dist/index.html

echo "✅ Build complete!"
echo "   📁 Built files are in: ./dist/"
echo "   🌐 Open dist/index.html in your browser"
echo ""
echo "🔒 Security: Token is injected at build time and not stored in source code"
echo "📤 Safe to deploy: Only deploy files from ./dist/ directory"



