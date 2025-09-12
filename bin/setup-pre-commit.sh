#!/bin/bash
#
# YearAway Pre-commit Hook Setup Script
# This script sets up the YAML validation pre-commit hook
#

echo "🔧 Setting up YearAway pre-commit hook..."

# Create hooks directory if it doesn't exist
mkdir -p .git/hooks

# Create the pre-commit hook
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/sh
#
# YearAway Pre-commit Hook
# Runs YAML validation before allowing commits
#

echo "🔍 Running pre-commit validation..."

# Run the YAML validation script
./bin/validate-yaml --exit-on-error

# Check if validation passed
if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Pre-commit validation failed!"
    echo "Please fix the YAML validation errors before committing."
    echo ""
    echo "To bypass validation (not recommended), use:"
    echo "  git commit --no-verify"
    echo ""
    exit 1
fi

echo "✅ Pre-commit validation passed!"
exit 0
EOF

# Make the hook executable
chmod +x .git/hooks/pre-commit

echo "✅ Pre-commit hook installed successfully!"
echo ""
echo "The hook will now run YAML validation before each commit."
echo "To test it, try making a commit with invalid YAML."
echo ""
echo "To disable the hook temporarily, use:"
echo "  git commit --no-verify"
echo ""
echo "To remove the hook:"
echo "  rm .git/hooks/pre-commit"
