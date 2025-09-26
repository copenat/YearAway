#!/usr/bin/env python3
"""
Inject current git hash into HTML files
This script replaces the placeholder {{GIT_HASH}} with the actual git hash
"""

import os
import sys
import subprocess
import re
from pathlib import Path

def get_git_hash():
    """Get the current git hash"""
    try:
        result = subprocess.run(['git', 'rev-parse', '--short', 'HEAD'], 
                              capture_output=True, text=True, check=True)
        return result.stdout.strip()
    except subprocess.CalledProcessError:
        return "unknown"

def inject_git_hash_in_file(file_path):
    """Inject git hash into a single HTML file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Replace the placeholder with actual git hash
        git_hash = get_git_hash()
        updated_content = content.replace('{{GIT_HASH}}', git_hash)
        
        # Only write if content changed
        if content != updated_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(updated_content)
            print(f"✅ Updated {file_path} with git hash: {git_hash}")
            return True
        else:
            print(f"ℹ️  No changes needed for {file_path}")
            return False
            
    except Exception as e:
        print(f"❌ Error processing {file_path}: {e}")
        return False

def main():
    """Main function to inject git hash into all HTML files"""
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    and_now_dir = project_root / "and-now"
    
    if not and_now_dir.exists():
        print(f"❌ Directory not found: {and_now_dir}")
        sys.exit(1)
    
    # Find all HTML files in the and-now directory
    html_files = list(and_now_dir.glob("*.html"))
    
    if not html_files:
        print("❌ No HTML files found in and-now directory")
        sys.exit(1)
    
    print(f"🔍 Found {len(html_files)} HTML files to process")
    
    updated_count = 0
    for html_file in html_files:
        if inject_git_hash_in_file(html_file):
            updated_count += 1
    
    print(f"✅ Successfully updated {updated_count} files with git hash")
    return updated_count > 0

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
