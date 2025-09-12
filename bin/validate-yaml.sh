#!/bin/bash
#
# YearAway YAML Validation Wrapper Script
# Shell wrapper for validate-yaml.py with enhanced functionality
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
VALIDATE_SCRIPT="$SCRIPT_DIR/validate-yaml.py"

# Check if Python script exists
if [ ! -f "$VALIDATE_SCRIPT" ]; then
    echo -e "${RED}❌ Error: validate-yaml.py not found at $VALIDATE_SCRIPT${NC}"
    exit 1
fi

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}⚠️  Warning: Not in a git repository. Some features may not work correctly.${NC}"
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
        if [ "$VERBOSE" = true ] && [ "$QUIET" = false ]; then
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
    echo "YearAway YAML Validation Wrapper"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help              Show this help message"
    echo "  -e, --exit-on-error     Exit with error code if validation fails"
    echo "  -v, --verbose           Show verbose output"
    echo "  -q, --quiet             Suppress non-error output"
    echo "  -c, --check-only        Only check changed files (git diff)"
    echo "  -a, --all               Validate all YAML files (default)"
    echo "  --repo-root DIR         Set repository root directory"
    echo ""
    echo "Examples:"
    echo "  $0                      # Validate all YAML files"
    echo "  $0 --check-only         # Only validate changed files"
    echo "  $0 --exit-on-error      # Exit with error code on failure"
    echo "  $0 --verbose            # Show detailed output"
    echo ""
    echo "The wrapper script provides enhanced functionality over the raw Python script:"
    echo "  - Better error handling and colored output"
    echo "  - Git integration for changed files"
    echo "  - Shell-friendly exit codes"
    echo "  - Enhanced help and usage information"
}

# Default options
EXIT_ON_ERROR=false
VERBOSE=false
QUIET=false
CHECK_ONLY=false
REPO_ROOT=""

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_usage
            exit 0
            ;;
        -e|--exit-on-error)
            EXIT_ON_ERROR=true
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
        -c|--check-only)
            CHECK_ONLY=true
            shift
            ;;
        -a|--all)
            CHECK_ONLY=false
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

if [ "$EXIT_ON_ERROR" = true ]; then
    PYTHON_ARGS+=("--exit-on-error")
fi

if [ -n "$REPO_ROOT" ]; then
    PYTHON_ARGS+=("--repo-root" "$REPO_ROOT")
fi

# Show header unless quiet
if [ "$QUIET" = false ]; then
    echo -e "${BLUE}🔍 YearAway YAML Validation${NC}"
    echo "=================================================="
fi

# Activate virtual environment
activate_venv

# Run the Python validation script
if [ "$VERBOSE" = true ] && [ "$QUIET" = false ]; then
    echo -e "${BLUE}📄 Running: python3 $VALIDATE_SCRIPT ${PYTHON_ARGS[*]}${NC}"
fi

# Execute the Python script and capture output
if python3 "$VALIDATE_SCRIPT" "${PYTHON_ARGS[@]}"; then
    if [ "$QUIET" = false ]; then
        echo -e "${GREEN}✅ YAML validation completed successfully!${NC}"
    fi
    exit 0
else
    EXIT_CODE=$?
    if [ "$QUIET" = false ]; then
        echo -e "${RED}❌ YAML validation failed!${NC}"
    fi
    exit $EXIT_CODE
fi
