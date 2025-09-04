#!/usr/bin/env python3
"""
Simple build script for Cloudflare Pages
"""

import os
import subprocess
import sys

def main():
    print("🔨 YearAway Build Script")
    print("========================")
    
    # Check if we're in a git repository
    if not os.path.exists('.git'):
        print("❌ Error: Not in a git repository.")
        sys.exit(1)
    
    # Get current branch
    try:
        result = subprocess.run(['git', 'branch', '--show-current'], 
                              capture_output=True, text=True, check=True)
        branch = result.stdout.strip()
        print(f"🌿 Current branch: {branch}")
    except:
        print("⚠️  Could not determine branch")
        branch = "unknown"
    
    # Run the main build script
    try:
        result = subprocess.run([sys.executable, 'build_with_branch_indicator.py'], 
                              check=True)
        print("✅ Build completed successfully")
    except subprocess.CalledProcessError as e:
        print(f"❌ Build failed: {e}")
        sys.exit(1)
    
    print("🎉 Build complete!")

if __name__ == '__main__':
    main()
