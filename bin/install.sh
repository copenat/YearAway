#!/bin/bash
#
# YearAway Project Setup Script
# This script sets up the development environment and git hooks
#

set -e  # Exit on any error

echo "🚀 Setting up YearAway development environment..."

# Check if we're in the right directory
if [ ! -f "requirements.txt" ]; then
    echo "❌ Error: requirements.txt not found. Please run this script from the project root."
    exit 1
fi

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
    echo "✅ Virtual environment created"
else
    echo "📦 Virtual environment already exists"
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install requirements
echo "📥 Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt
echo "✅ Dependencies installed"

# Install pre-commit hook
echo "🔒 Setting up pre-commit hook..."
./bin/setup-pre-commit.sh

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To activate the virtual environment in the future, run:"
echo "  source venv/bin/activate"
echo ""
echo "The pre-commit hook is now active and will validate YAML files before commits."
echo ""
echo "To test the setup, try making a commit with invalid YAML."
