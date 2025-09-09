#!/bin/bash
# Cloudflare Pages Build Cleanup Script
# Cleans up old develop branch builds, keeping only the most recent

set -e

echo "🧹 Cloudflare Pages Build Cleanup"
echo "=================================="

# Check if Python 3 is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: Python 3 is required but not installed"
    exit 1
fi

# Check if virtual environment exists, create if not
if [ ! -d "venv-cloudflare" ]; then
    echo "📦 Creating virtual environment for Cloudflare cleanup..."
    python3 -m venv venv-cloudflare
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv-cloudflare/bin/activate

# Install requirements
echo "📥 Installing requirements..."
pip install -q -r requirements.txt

# Check for API token
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo "❌ Error: CLOUDFLARE_API_TOKEN environment variable not set"
    echo ""
    echo "To get your API token:"
    echo "1. Go to https://dash.cloudflare.com/profile/api-tokens"
    echo "2. Create a custom token with:"
    echo "   - Zone:Read permission"
    echo "   - Page:Edit permission"
    echo "3. Set the token: export CLOUDFLARE_API_TOKEN='your-token-here'"
    echo ""
    echo "Or run: CLOUDFLARE_API_TOKEN='your-token' ./cleanup-builds.sh"
    exit 1
fi

# Run the cleanup script
echo "🚀 Running cleanup script..."
python3 cleanup-cloudflare-builds.py

echo "✅ Cleanup script completed!"
