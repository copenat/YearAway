#!/bin/bash
# YearAway Build Script
# Automatically adds/removes development branch indicator based on current git branch

echo "🔨 YearAway Build Script"
echo "========================"

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Error: Not in a git repository."
    exit 1
fi

# Run the Python build script
python3 build_with_branch_indicator.py

# Inject git hash into HTML files
echo "🔧 Injecting git hash into HTML files..."
python3 bin/inject-git-hash.py

# Show current branch status
BRANCH=$(git branch --show-current)
echo ""
echo "📊 Current Status:"
echo "   Branch: $BRANCH"

if [ "$BRANCH" = "develop" ]; then
    echo "   🚧 Development mode - indicator added"
    echo "   💡 Run 'git checkout main' to switch to production"
elif [ "$BRANCH" = "main" ]; then
    echo "   ✅ Production mode - no development indicator"
    echo "   💡 Run 'git checkout develop' to switch to development"
else
    echo "   ℹ️  Custom branch - no development indicator"
fi

echo ""
echo "📦 Copying site files to dist/..."
mkdir -p dist
rsync -a --delete \
  --exclude='.git' \
  --exclude='.github' \
  --exclude='dist' \
  --exclude='venv' \
  --exclude='venv-cloudflare' \
  --exclude='legacy' \
  --exclude='debug-scripts' \
  --exclude='bin' \
  --exclude='__pycache__' \
  --exclude='*.py' \
  --exclude='*.sh' \
  --exclude='*.md' \
  --exclude='requirements.txt' \
  --exclude='.python-version' \
  --exclude='pyproject.toml.backup' \
  --exclude='.DS_Store' \
  . dist/
echo "✅ dist/ ready."

echo ""
echo "🎉 Build complete! Your HTML files are ready."
