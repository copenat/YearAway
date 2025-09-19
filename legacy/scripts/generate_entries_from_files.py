#!/usr/bin/env python3
"""
Generate entries.html from actual HTML files in the directory
This creates a dynamic entries page based on what files actually exist
"""

import os
import re
from pathlib import Path
from datetime import datetime

def extract_entry_info(file_path):
    """Extract entry information from HTML file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Extract title from <title> tag
        title_match = re.search(r'<title>(.*?)</title>', content, re.IGNORECASE)
        title = title_match.group(1).strip() if title_match else "Untitled"
        
        # Extract author from filename
        filename = os.path.basename(file_path)
        author_match = re.search(r'entry_([^_]+)_', filename)
        author = author_match.group(1) if author_match else "unknown"
        
        # Extract date from filename
        date_match = re.search(r'(\d{4}-\d{2}-\d{2})', filename)
        date_str = date_match.group(1) if date_match else "0000-00-00"
        
        # Extract location from content (look for location patterns)
        location_match = re.search(r'<div class="meta">.*?•\s*([^•]+?)\s*•', content, re.DOTALL)
        location = location_match.group(1).strip() if location_match else "Unknown location"
        
        # Extract excerpt from content
        excerpt_match = re.search(r'<div class="excerpt">(.*?)</div>', content, re.DOTALL)
        excerpt = excerpt_match.group(1).strip() if excerpt_match else "No excerpt available"
        
        # Clean up excerpt (remove HTML tags and limit length)
        excerpt = re.sub(r'<[^>]+>', '', excerpt)
        if len(excerpt) > 200:
            excerpt = excerpt[:200] + "..."
        
        return {
            'title': title,
            'author': author,
            'date': date_str,
            'location': location,
            'excerpt': excerpt,
            'filename': filename
        }
    except Exception as e:
        print(f"Error processing {file_path}: {e}")
        return None

def generate_entries_html():
    """Generate entries.html from existing entry files"""
    # Get the project root directory (two levels up from this script)
    project_root = Path(__file__).parent.parent.parent
    legacy_site_dir = project_root / 'legacy_site'
    entries = []
    
    # Find all entry HTML files
    entry_files = list(legacy_site_dir.glob('entry_*.html'))
    
    print(f"Found {len(entry_files)} entry files")
    
    # Extract information from each file
    for file_path in entry_files:
        entry_info = extract_entry_info(file_path)
        if entry_info:
            entries.append(entry_info)
    
    # Sort entries by date (newest first)
    entries.sort(key=lambda x: x['date'], reverse=True)
    
    # Generate HTML
    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>All Entries - YearAway</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>All Diary Entries</h1>
            <p>{len(entries)} entries from our travels</p>
        </div>
        
        <div class="nav">
            <a href="index.html">Home</a>
            <a href="entries.html">All Entries</a>
            <a href="photos.html">Photo Gallery</a>
        </div>
        
        <div class="entries-list">
"""
    
    # Add each entry
    for entry in entries:
        # Format date nicely
        try:
            date_obj = datetime.strptime(entry['date'], '%Y-%m-%d')
            formatted_date = date_obj.strftime('%B %d, %Y')
        except:
            formatted_date = entry['date']
        
        html_content += f"""
            <div class="entry-summary">
                <h3><a href="{entry['filename']}">{entry['title']}</a></h3>
                <div class="meta">{formatted_date} • {entry['location']} • by {entry['author']}</div>
                <div class="excerpt">{entry['excerpt']}</div>
            </div>
"""
    
    html_content += """
        </div>
    </div>
</body>
</html>"""
    
    # Write the file
    output_path = legacy_site_dir / 'entries.html'
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    print(f"Generated entries.html with {len(entries)} entries")
    print(f"File saved to: {output_path}")

if __name__ == "__main__":
    generate_entries_html()
