#!/usr/bin/env python3
"""
Simple build script for Cloudflare Pages
This is a minimal version to test if the issue is with the main build script
"""

import os
import sys

def main():
    print("🔨 Simple Build Script for Cloudflare")
    print("=" * 40)
    
    # Basic environment info
    print(f"Python version: {sys.version}")
    print(f"Working directory: {os.getcwd()}")
    print(f"Files in directory: {os.listdir('.')}")
    
    # Check if we can find HTML files
    html_files = [f for f in os.listdir('.') if f.endswith('.html')]
    print(f"HTML files found: {html_files}")
    
    # Check if we can find the and-now directory
    if os.path.exists('and-now'):
        print("✅ and-now directory exists")
        and_now_files = os.listdir('and-now')
        print(f"Files in and-now: {and_now_files}")
    else:
        print("❌ and-now directory not found")
    
    print("\n🎉 Simple build completed successfully!")
    return 0

if __name__ == '__main__':
    sys.exit(main())
