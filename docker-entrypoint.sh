#!/bin/sh

# Docker entrypoint script for Drivers Dashboard
# Generates config.js based on GITHUB_TOKEN environment variable

set -e

echo "🚀 Starting Drivers Dashboard container..."

# Generate config.js based on GITHUB_TOKEN
if [ -n "$GITHUB_TOKEN" ]; then
    echo "🔑 GitHub token detected - generating authenticated config.js"
    cat > /usr/share/nginx/html/config.js << EOF
// Auto-generated config with GitHub token
// Generated at container startup from GITHUB_TOKEN environment variable
const GITHUB_TOKEN = '$GITHUB_TOKEN';
window.GITHUB_CONFIG = { GITHUB_TOKEN: GITHUB_TOKEN };
EOF
    echo "✅ Config generated with authentication (5,000 requests/hour)"
else
    echo "⚠️  No GitHub token provided - generating unauthenticated config.js"
    cat > /usr/share/nginx/html/config.js << EOF
// Auto-generated config (no token)
// Generated at container startup - no GITHUB_TOKEN environment variable
window.GITHUB_CONFIG = {};
EOF
    echo "ℹ️  Config generated without authentication (60 requests/hour limit)"
fi

echo "🌐 Starting nginx..."
# Execute the original nginx command
exec nginx -g 'daemon off;'



