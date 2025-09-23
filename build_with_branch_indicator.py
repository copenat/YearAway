#!/usr/bin/env python3
"""
Build script that adds branch indicator to HTML files.
Shows "DEVELOPMENT BRANCH" indicator when on develop branch,
no indicator when on main branch.
"""

import os
import subprocess
import sys
from pathlib import Path

def get_current_branch():
    """Get the current git branch name."""
    # FIRST: Check environment variables (most reliable in CI/CD)
    import os
    branch = os.environ.get('CF_PAGES_BRANCH')
    if branch:
        return branch
    
    # Fallback: try to get branch from Cloudflare Pages environment variables
    branch = os.environ.get('CF_PAGES_BRANCH_NAME')
    if branch:
        return branch
    
    # Fallback: try to get branch from Cloudflare Pages URL
    branch = os.environ.get('CF_PAGES_URL')
    if branch and 'develop' in branch:
        return 'develop'
    elif branch and 'main' in branch:
        return 'main'
    
    # THEN: Try git commands (for local development)
    try:
        result = subprocess.run(['git', 'branch', '--show-current'], 
                              capture_output=True, text=True, check=True)
        branch = result.stdout.strip()
        if branch:
            return branch
    except subprocess.CalledProcessError:
        pass
    
    # Fallback: try to get branch from git status
    try:
        result = subprocess.run(['git', 'status', '--porcelain=v1', '-b'], 
                              capture_output=True, text=True, check=True)
        # Parse the branch from the first line
        first_line = result.stdout.split('\n')[0]
        if first_line.startswith('## '):
            branch = first_line.split('...')[0].replace('## ', '')
            if branch:
                return branch
    except:
        pass
    
    # Fallback: try to get branch from git remote
    try:
        result = subprocess.run(['git', 'remote', 'show', 'origin'], 
                              capture_output=True, text=True, check=True)
        output = result.stdout.strip()
        if 'HEAD branch: develop' in output:
            return 'develop'
        elif 'HEAD branch: main' in output:
            return 'main'
    except:
        pass
    
    # Fallback: try to get branch from git log
    try:
        result = subprocess.run(['git', 'log', '-1', '--pretty=%D'], 
                              capture_output=True, text=True, check=True)
        output = result.stdout.strip()
        if 'origin/develop' in output:
            return 'develop'
        elif 'origin/main' in output:
            return 'main'
    except:
        pass
    
    # Fallback: try to get branch from git show-ref
    try:
        result = subprocess.run(['git', 'show-ref', '--heads'], 
                              capture_output=True, text=True, check=True)
        output = result.stdout.strip()
        if 'refs/heads/develop' in output:
            return 'develop'
        elif 'refs/heads/main' in output:
            return 'main'
    except:
        pass
    
    # Fallback: try to get branch from git branch -a
    try:
        result = subprocess.run(['git', 'branch', '-a'], 
                              capture_output=True, text=True, check=True)
        output = result.stdout.strip()
        if 'origin/develop' in output:
            return 'develop'
        elif 'origin/main' in output:
            return 'main'
    except:
        pass
    
    return None

def add_branch_indicator_to_html(html_content, branch):
    """Add or remove branch indicator from HTML content."""
    import re
    
    # First, remove any existing development indicator
    # Remove the indicator div and its styles
    indicator_pattern = r'<!-- DEVELOPMENT BRANCH INDICATOR -->.*?</div>\s*<style>.*?</style>'
    html_content = re.sub(indicator_pattern, '', html_content, flags=re.DOTALL)
    
    # Remove body margin-top if it exists
    html_content = re.sub(r'body\s*\{\s*margin-top:\s*40px;\s*\}', '', html_content)
    
    # Remove any remaining margin-top from body styles
    html_content = re.sub(r'margin-top:\s*40px;?\s*', '', html_content)
    
    if branch == 'develop':
        # Add development indicator
        indicator_html = '''
    <!-- DEVELOPMENT BRANCH INDICATOR -->
    <div id="branch-indicator" style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: linear-gradient(135deg, #ff6b6b, #ff8e53);
        color: white;
        text-align: center;
        padding: 8px;
        font-weight: bold;
        font-size: 14px;
        z-index: 9999;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        animation: pulse 2s infinite;
    ">
        🚧 DEVELOPMENT BRANCH - This is a test version 🚧
    </div>
    <style>
        @keyframes pulse {
            0% { opacity: 0.8; }
            50% { opacity: 1; }
            100% { opacity: 0.8; }
        }
        body { margin-top: 40px; }
    </style>'''
        
        # Insert the indicator after the opening body tag
        if '<body>' in html_content:
            html_content = html_content.replace('<body>', f'<body>{indicator_html}')
        elif '<body ' in html_content:
            # Handle body tag with attributes
            html_content = re.sub(r'(<body[^>]*>)', rf'\1{indicator_html}', html_content)
    
    return html_content

def process_html_files(directory='.'):
    """Process all HTML files in the directory."""
    # Debug: Print environment variables for troubleshooting
    import os
    print("🔍 Debug information:")
    print(f"   CF_PAGES_BRANCH: {os.environ.get('CF_PAGES_BRANCH', 'Not set')}")
    print(f"   CF_PAGES_BRANCH_NAME: {os.environ.get('CF_PAGES_BRANCH_NAME', 'Not set')}")
    print(f"   CF_PAGES_URL: {os.environ.get('CF_PAGES_URL', 'Not set')}")
    print(f"   CF_PAGES_COMMIT_SHA: {os.environ.get('CF_PAGES_COMMIT_SHA', 'Not set')}")
    print(f"   GITHUB_REF: {os.environ.get('GITHUB_REF', 'Not set')}")
    print(f"   GITHUB_HEAD_REF: {os.environ.get('GITHUB_HEAD_REF', 'Not set')}")
    
    # Debug: Print all CF_PAGES environment variables
    cf_vars = {k: v for k, v in os.environ.items() if k.startswith('CF_PAGES')}
    if cf_vars:
        print("   All CF_PAGES variables:")
        for k, v in cf_vars.items():
            print(f"     {k}: {v}")
    else:
        print("   No CF_PAGES environment variables found")
    
    branch = get_current_branch()
    
    if branch is None:
        print("⚠️  Warning: Could not determine git branch. No branch indicator will be added.")
        branch = 'unknown'  # Continue processing with a default value
    
    print(f"🌿 Current branch: {branch}")
    
    if branch == 'develop':
        print("🚧 Adding DEVELOPMENT BRANCH indicator to HTML files...")
    elif branch == 'unknown':
        print("❓ Unknown branch detected. No development indicator will be added.")
    else:
        print("✅ Production branch detected. No development indicator needed.")
    
    # Find all HTML files
    html_files = list(Path(directory).glob('*.html'))
    
    if not html_files:
        print("📁 No HTML files found in current directory.")
        return
    
    for html_file in html_files:
        print(f"📝 Processing: {html_file}")
        
        # Read the file
        try:
            with open(html_file, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            print(f"❌ Error reading {html_file}: {e}")
            continue
        
        # Add branch indicator
        updated_content = add_branch_indicator_to_html(content, branch)
        
        # Write back to file
        try:
            with open(html_file, 'w', encoding='utf-8') as f:
                f.write(updated_content)
            print(f"✅ Updated: {html_file}")
        except Exception as e:
            print(f"❌ Error writing {html_file}: {e}")

def main():
    """Main function."""
    print("🔨 YearAway Build Script with Branch Indicator")
    print("=" * 50)
    
    # Additional debugging for Cloudflare
    print("🔍 Environment Debug:")
    print(f"   Current working directory: {os.getcwd()}")
    print(f"   Python version: {sys.version}")
    print(f"   Files in current directory: {os.listdir('.')}")
    
    # Check if we're in a git repository
    if not os.path.exists('.git'):
        print("❌ Error: Not in a git repository.")
        print("📁 Available directories:")
        for item in os.listdir('.'):
            if os.path.isdir(item):
                print(f"   📂 {item}")
        sys.exit(1)
    
    # Process HTML files
    try:
        process_html_files()
        print("\n🎉 Build complete!")
    except Exception as e:
        print(f"\n❌ Build failed with error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    
    # Show current branch status
    branch = get_current_branch()
    if branch == 'develop':
        print("🚧 You're on the DEVELOPMENT branch - indicator added to HTML files")
    elif branch == 'main':
        print("✅ You're on the MAIN branch - no development indicator")
    else:
        print(f"ℹ️  You're on branch '{branch}' - no development indicator")

if __name__ == '__main__':
    main()
