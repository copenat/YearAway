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

# Function to activate virtual environment
activate_venv() {
    local venv_path=""
    
    # Look for venv in current directory or parent directories
    local current_dir="$(pwd)"
    while [ "$current_dir" != "/" ]; do
        if [ -d "$current_dir/venv" ]; then
            venv_path="$current_dir/venv"
            break
        fi
        current_dir="$(dirname "$current_dir")"
    done
    
    if [ -n "$venv_path" ] && [ -f "$venv_path/bin/activate" ]; then
        if [ "$VERBOSE" = true ]; then
            echo -e "${BLUE}🐍 Activating virtual environment: $venv_path${NC}"
        fi
        source "$venv_path/bin/activate"
        return 0
    else
        if [ "$QUIET" = false ]; then
            echo -e "${YELLOW}⚠️  Warning: No virtual environment found. Using system Python.${NC}"
        fi
        return 1
    fi
}

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
    echo "  -q, --quiet             Suppress non-error output"
    echo "  --repo-root DIR         Set repository root directory"
    echo ""
    echo "Examples:"
    echo "  $0                      # Analyze photos and show suggestions"
    echo "  $0 --auto-add           # Analyze photos and add to YAML files"
    echo "  $0 --verbose            # Show detailed output"
    echo ""
    echo "Requirements:"
    echo "  - Ollama with LLaVA model (recommended) OR LLaVA CLI"
    echo "  - Python 3 with PyYAML"
    echo "  - Virtual environment activated (if using project venv)"
    echo ""
    echo "Installation options:"
    echo "  Ollama: https://ollama.ai (easier, recommended)"
    echo "  LLaVA CLI: https://github.com/haotian-liu/LLaVA"
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
QUIET=false
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
        -q|--quiet)
            QUIET=true
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

# Activate virtual environment
activate_venv

# Check if any LLaVA implementation is available
if ! command -v ollama &> /dev/null && ! command -v llava-cli &> /dev/null; then
    echo -e "${YELLOW}⚠️  Warning: No LLaVA implementation found${NC}"
    echo "Please install one of the following:"
    echo "  Ollama (recommended): https://ollama.ai"
    echo "  LLaVA CLI: https://github.com/haotian-liu/LLaVA"
    echo ""
    echo "Continuing with analysis (will show error for each photo)..."
    echo ""
elif command -v ollama &> /dev/null; then
    echo -e "${GREEN}🦙 Ollama detected - will use Ollama LLaVA${NC}"
elif command -v llava-cli &> /dev/null; then
    echo -e "${GREEN}🔧 LLaVA CLI detected - will use direct LLaVA CLI${NC}"
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
