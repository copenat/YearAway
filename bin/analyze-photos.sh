#!/bin/bash
#
# AI Photo Analyzer Wrapper Script
# Shell wrapper for ai-photo-analyzer.py with enhanced functionality
#

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory (where this script is located)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ANALYZER_SCRIPT="$SCRIPT_DIR/ai-photo-analyzer.py"

# Check if Python script exists
if [ ! -f "$ANALYZER_SCRIPT" ]; then
    echo -e "${RED}❌ Error: ai-photo-analyzer.py not found at $ANALYZER_SCRIPT${NC}"
    exit 1
fi

# Function to show usage
show_usage() {
    echo "AI Photo Analyzer for YearAway"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help              Show this help message"
    echo "  -a, --auto-add          Automatically add generated entries to YAML files"
    echo "  -v, --verbose           Show verbose output"
    echo "  --repo-root DIR         Set repository root directory"
    echo ""
    echo "Examples:"
    echo "  $0                      # Analyze photos and show suggestions"
    echo "  $0 --auto-add           # Analyze photos and add to YAML files"
    echo "  $0 --verbose            # Show detailed output"
    echo ""
    echo "Requirements:"
    echo "  - LLaVA CLI installed and available in PATH"
    echo "  - Python 3 with PyYAML"
    echo "  - Virtual environment activated (if using project venv)"
    echo ""
    echo "The AI analyzer will:"
    echo "  - Detect new images in content/images/ directories"
    echo "  - Analyze images using LLaVA model"
    echo "  - Generate captions, IDs, tags, and adventure suggestions"
    echo "  - Optionally add entries to photos-data YAML files"
}

# Default options
AUTO_ADD=false
VERBOSE=false
REPO_ROOT=""

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_usage
            exit 0
            ;;
        -a|--auto-add)
            AUTO_ADD=true
            shift
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        --repo-root)
            REPO_ROOT="$2"
            shift 2
            ;;
        *)
            echo -e "${RED}❌ Unknown option: $1${NC}"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Build Python script arguments
PYTHON_ARGS=()

if [ "$AUTO_ADD" = true ]; then
    PYTHON_ARGS+=("--auto-add")
fi

if [ -n "$REPO_ROOT" ]; then
    PYTHON_ARGS+=("--repo-root" "$REPO_ROOT")
fi

# Show header
echo -e "${BLUE}🤖 AI Photo Analyzer for YearAway${NC}"
echo "=================================================="

# Check if LLaVA is available
if ! command -v llava-cli &> /dev/null; then
    echo -e "${YELLOW}⚠️  Warning: LLaVA CLI not found in PATH${NC}"
    echo "Please install LLaVA to use AI photo analysis:"
    echo "  https://github.com/haotian-liu/LLaVA"
    echo ""
    echo "Continuing with analysis (will show error for each photo)..."
    echo ""
fi

# Run the Python analysis script
if [ "$VERBOSE" = true ]; then
    echo -e "${BLUE}📄 Running: python3 $ANALYZER_SCRIPT ${PYTHON_ARGS[*]}${NC}"
fi

# Execute the Python script
if python3 "$ANALYZER_SCRIPT" "${PYTHON_ARGS[@]}"; then
    echo -e "${GREEN}✅ AI photo analysis completed successfully!${NC}"
    exit 0
else
    EXIT_CODE=$?
    echo -e "${RED}❌ AI photo analysis failed!${NC}"
    exit $EXIT_CODE
fi
