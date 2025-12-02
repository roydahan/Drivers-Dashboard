#!/bin/bash

# GitHub Token Setup Script
# This script helps you configure your GitHub token securely

echo "🔑 GitHub Token Setup for Drivers Dashboard"
echo "=========================================="
echo ""

# Check if config.js already exists
if [ -f "config.js" ]; then
    echo "⚠️  config.js already exists!"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Setup cancelled."
        exit 1
    fi
fi

echo "📝 Step 1: Create a GitHub Personal Access Token"
echo "   1. Go to: https://github.com/settings/tokens"
echo "   2. Click 'Generate new token (classic)'"
echo "   3. Give it a name like 'Drivers Dashboard'"
echo "   4. Select scope: 'public_repo'"
echo "   5. Click 'Generate token'"
echo "   6. Copy the token (save it somewhere safe!)"
echo ""

read -p "🔐 Paste your GitHub token here: " -s GITHUB_TOKEN
echo ""

if [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ No token provided. Setup cancelled."
    exit 1
fi

# Validate token format (basic check)
if [[ ! $GITHUB_TOKEN =~ ^(ghp_|github_pat_)[a-zA-Z0-9_]{36,}$ ]]; then
    echo "⚠️  Warning: Token doesn't match expected format."
    echo "   It should start with 'ghp_' (classic) or 'github_pat_' (fine-grained)"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Setup cancelled."
        exit 1
    fi
fi

# Create config.js
cat > config.js << EOF
// GitHub API Configuration
// This file contains sensitive information and should NOT be committed to git
// Add this file to your .gitignore

// GitHub Personal Access Token
// Create a classic token at: https://github.com/settings/tokens
// Required scopes: public_repo
const GITHUB_TOKEN = '${GITHUB_TOKEN}';

// Export for use in script.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GITHUB_TOKEN };
} else {
    // Browser environment - make available globally
    window.GITHUB_CONFIG = { GITHUB_TOKEN };
}
EOF

echo "✅ GitHub token configured successfully!"
echo ""
echo "🔒 Security Notes:"
echo "   • config.js is in .gitignore (won't be committed)"
echo "   • Keep your token secure and never share it"
echo "   • You can revoke the token anytime at GitHub settings"
echo ""
echo "🧪 Test your setup:"
echo "   • Open index.html in your browser"
echo "   • Check browser console for authentication confirmation"
echo "   • Dashboard should now use 5,000/hour API limit"
echo ""

# Test the token if curl is available
if command -v curl &> /dev/null; then
    echo "🧪 Testing token..."
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
        -H "Authorization: Bearer ${GITHUB_TOKEN}" \
        -H "Accept: application/vnd.github.v3+json" \
        https://api.github.com/user)

    if [ "$RESPONSE" = "200" ]; then
        echo "✅ Token is valid!"
    else
        echo "❌ Token test failed (HTTP $RESPONSE)"
        echo "   Check your token or try again."
    fi
fi

