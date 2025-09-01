#!/usr/bin/env python3
"""
Improved static site generator for YearAway legacy travel diary
Converts PHP/MySQL site to static HTML pages with proper data extraction
"""

import re
import json
import os
import shutil
from datetime import datetime
from pathlib import Path

def extract_database_data():
    """Extract diary entries and photos from MySQL dump with better parsing"""
    print("Extracting data from database dump...")
    
    with open('legacy/dumps/db.20111027', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Function to decode escape sequences in text
    def decode_escapes(text):
        """Convert escape sequences like \\n, \\r, \\t, \\' to actual characters"""
        if not text:
            return text
        # Replace escape sequences
        text = text.replace('\\n', '\n')
        text = text.replace('\\r', '\r')
        text = text.replace('\\t', '\t')
        text = text.replace('\\\'', "'")
        text = text.replace('\\\\', '\\')  # Handle double backslashes
        return text
    
    # Country code to country name mapping
    country_codes = {
        'IN': 'India',
        'TH': 'Thailand',
        'LA': 'Laos',
        'VN': 'Vietnam',
        'KH': 'Cambodia',
        'MY': 'Malaysia',
        'SG': 'Singapore',
        'ID': 'Indonesia',
        'AU': 'Australia',
        'NZ': 'New Zealand',
        'US': 'United States',
        'CA': 'Canada',
        'GB': 'United Kingdom',
        'FR': 'France',
        'DE': 'Germany',
        'IT': 'Italy',
        'ES': 'Spain',
        'PT': 'Portugal',
        'NL': 'Netherlands',
        'BE': 'Belgium',
        'CH': 'Switzerland',
        'AT': 'Austria',
        'GR': 'Greece',
        'TR': 'Turkey',
        'EG': 'Egypt',
        'MA': 'Morocco',
        'ZA': 'South Africa',
        'KE': 'Kenya',
        'TZ': 'Tanzania',
        'UG': 'Uganda',
        'RW': 'Rwanda',
        'ET': 'Ethiopia',
        'SD': 'Sudan',
        'LY': 'Libya',
        'TN': 'Tunisia',
        'DZ': 'Algeria',
        'CN': 'China',
        'JP': 'Japan',
        'KR': 'South Korea',
        'TW': 'Taiwan',
        'HK': 'Hong Kong',
        'MO': 'Macau',
        'PH': 'Philippines',
        'MM': 'Myanmar',
        'BD': 'Bangladesh',
        'LK': 'Sri Lanka',
        'MV': 'Maldives',
        'NP': 'Nepal',
        'BT': 'Bhutan',
        'PK': 'Pakistan',
        'AF': 'Afghanistan',
        'IR': 'Iran',
        'IQ': 'Iraq',
        'SA': 'Saudi Arabia',
        'AE': 'United Arab Emirates',
        'QA': 'Qatar',
        'KW': 'Kuwait',
        'BH': 'Bahrain',
        'OM': 'Oman',
        'YE': 'Yemen',
        'JO': 'Jordan',
        'LB': 'Lebanon',
        'SY': 'Syria',
        'IL': 'Israel',
        'PS': 'Palestine',
        'CY': 'Cyprus',
        'RU': 'Russia',
        'KZ': 'Kazakhstan',
        'UZ': 'Uzbekistan',
        'TM': 'Turkmenistan',
        'TJ': 'Tajikistan',
        'KG': 'Kyrgyzstan',
        'MN': 'Mongolia',
        'KP': 'North Korea',
        'BR': 'Brazil',
        'AR': 'Argentina',
        'CL': 'Chile',
        'PE': 'Peru',
        'CO': 'Colombia',
        'VE': 'Venezuela',
        'EC': 'Ecuador',
        'BO': 'Bolivia',
        'PY': 'Paraguay',
        'UY': 'Uruguay',
        'GY': 'Guyana',
        'SR': 'Suriname',
        'GF': 'French Guiana',
        'MX': 'Mexico',
        'GT': 'Guatemala',
        'BZ': 'Belize',
        'SV': 'El Salvador',
        'HN': 'Honduras',
        'NI': 'Nicaragua',
        'CR': 'Costa Rica',
        'PA': 'Panama',
        'CU': 'Cuba',
        'JM': 'Jamaica',
        'HT': 'Haiti',
        'DO': 'Dominican Republic',
        'PR': 'Puerto Rico',
        'TT': 'Trinidad and Tobago',
        'BB': 'Barbados',
        'GD': 'Grenada',
        'LC': 'Saint Lucia',
        'VC': 'Saint Vincent and the Grenadines',
        'AG': 'Antigua and Barbuda',
        'DM': 'Dominica',
        'KN': 'Saint Kitts and Nevis',
        'BS': 'Bahamas',
        'FJ': 'Fiji',
        'PG': 'Papua New Guinea',
        'SB': 'Solomon Islands',
        'VU': 'Vanuatu',
        'NC': 'New Caledonia',
        'PF': 'French Polynesia',
        'WS': 'Samoa',
        'TO': 'Tonga',
        'KI': 'Kiribati',
        'TV': 'Tuvalu',
        'NR': 'Nauru',
        'PW': 'Palau',
        'MH': 'Marshall Islands',
        'FM': 'Micronesia',
        'AS': 'American Samoa',
        'GU': 'Guam',
        'MP': 'Northern Mariana Islands',
        'VI': 'U.S. Virgin Islands',
        'VG': 'British Virgin Islands',
        'AI': 'Anguilla',
        'MS': 'Montserrat',
        'TC': 'Turks and Caicos Islands',
        'KY': 'Cayman Islands',
        'BM': 'Bermuda',
        'GL': 'Greenland',
        'IS': 'Iceland',
        'FO': 'Faroe Islands',
        'SJ': 'Svalbard and Jan Mayen',
        'NO': 'Norway',
        'SE': 'Sweden',
        'FI': 'Finland',
        'DK': 'Denmark',
        'EE': 'Estonia',
        'LV': 'Latvia',
        'LT': 'Lithuania',
        'PL': 'Poland',
        'CZ': 'Czech Republic',
        'SK': 'Slovakia',
        'HU': 'Hungary',
        'RO': 'Romania',
        'BG': 'Bulgaria',
        'HR': 'Croatia',
        'SI': 'Slovenia',
        'BA': 'Bosnia and Herzegovina',
        'RS': 'Serbia',
        'ME': 'Montenegro',
        'MK': 'North Macedonia',
        'AL': 'Albania',
        'XK': 'Kosovo',
        'MD': 'Moldova',
        'UA': 'Ukraine',
        'BY': 'Belarus',
        'LU': 'Luxembourg',
        'IE': 'Ireland',
        'MT': 'Malta',
        'AD': 'Andorra',
        'MC': 'Monaco',
        'SM': 'San Marino',
        'VA': 'Vatican City',
        'LI': 'Liechtenstein'
    }
    
    def get_country_name(country_code):
        """Convert country code to full country name"""
        return country_codes.get(country_code, country_code)
    
    # Extract diary entries with better parsing
    diary_entries = []
    diary_section = re.search(r'INSERT INTO `diary_entry` VALUES(.*?)(?=\s*;\s*(?:INSERT|$))', content, re.DOTALL)
    if diary_section:
        entries_text = diary_section.group(1)
        
        # More robust parsing that handles the full text
        # Split by ),( to get individual entries
        entries = entries_text.split('),(')
        
        for i, entry in enumerate(entries):
            # Clean up the entry
            if i == 0:
                entry = entry[1:]  # Remove leading (
            if i == len(entries) - 1:
                entry = entry[:-1]  # Remove trailing )
            
            # Parse the entry more carefully
            parts = []
            current_part = ''
            in_quotes = False
            quote_char = None
            escape_next = False
            
            for char in entry:
                if escape_next:
                    current_part += char
                    escape_next = False
                    continue
                    
                if char == '\\':
                    escape_next = True
                    current_part += char
                    continue
                    
                if char in ['"', "'"] and not in_quotes:
                    in_quotes = True
                    quote_char = char
                    current_part += char
                elif char == quote_char and in_quotes:
                    in_quotes = False
                    quote_char = None
                    current_part += char
                elif char == ',' and not in_quotes:
                    parts.append(current_part.strip())
                    current_part = ''
                else:
                    current_part += char
            
            if current_part:
                parts.append(current_part.strip())
            
            if len(parts) >= 13:
                try:
                    user_name = parts[0].strip("'").strip('"')
                    # Filter out unwanted users
                    if user_name in ['mwillett', 'GEORDIEandVIRGINIA']:
                        continue
                        
                    diary_entries.append({
                        'user_name': user_name,
                        'diary_name': parts[1].strip("'").strip('"'),
                        'start_date': parts[2].strip("'").strip('"'),
                        'country': get_country_name(parts[3].strip("'").strip('"')) if parts[3] != 'NULL' else '',
                        'location': parts[4].strip("'").strip('"') if parts[4] != 'NULL' else '',
                        'message': decode_escapes(parts[5].strip("'").strip('"')) if parts[5] != 'NULL' else '',
                        'section': parts[10].strip("'").strip('"') if parts[10] != 'NULL' else ''
                    })
                except IndexError:
                    print(f"Skipping malformed entry: {entry[:100]}...")
                    continue
    
    # Extract photos with better parsing
    photos = []
    photo_section = re.search(r'INSERT INTO `diary_entry_photos` VALUES(.*?);', content, re.DOTALL)
    if photo_section:
        photos_text = photo_section.group(1)
        photo_entries = photos_text.split('),(')
        
        for i, photo in enumerate(photo_entries):
            if i == 0:
                photo = photo[1:]
            if i == len(photo_entries) - 1:
                photo = photo[:-1]
                
            parts = []
            current_part = ''
            in_quotes = False
            quote_char = None
            escape_next = False
            
            for char in photo:
                if escape_next:
                    current_part += char
                    escape_next = False
                    continue
                    
                if char == '\\':
                    escape_next = True
                    current_part += char
                    continue
                    
                if char in ['"', "'"] and not in_quotes:
                    in_quotes = True
                    quote_char = char
                    current_part += char
                elif char == quote_char and in_quotes:
                    in_quotes = False
                    quote_char = None
                    current_part += char
                elif char == ',' and not in_quotes:
                    parts.append(current_part.strip())
                    current_part = ''
                else:
                    current_part += char
            
            if current_part:
                parts.append(current_part.strip())
            
            if len(parts) >= 8:
                try:
                    user_name = parts[0].strip("'").strip('"')
                    # Filter out unwanted users
                    if user_name in ['mwillett', 'GEORDIEandVIRGINIA']:
                        continue
                        
                    photos.append({
                        'user_name': user_name,
                        'diary_name': parts[1].strip("'").strip('"'),
                        'start_date': parts[2].strip("'").strip('"'),
                        'filename': parts[3].strip("'").strip('"'),
                        'comment': decode_escapes(parts[4].strip("'").strip('"')) if parts[4] != 'NULL' else '',
                        'type': parts[5].strip("'").strip('"') if parts[5] != 'NULL' else 'jpeg',
                        'photo_order': parts[6] if parts[6] != 'NULL' else '0',
                        'special_feature': parts[7] if parts[7] != 'NULL' else '0'
                    })
                except IndexError:
                    print(f"Skipping malformed photo: {photo[:100]}...")
                    continue
    
    print(f"Found {len(diary_entries)} diary entries and {len(photos)} photos")
    return diary_entries, photos

def find_photo_file(user_name, diary_name, filename, photo_type):
    """Find the actual photo file based on the database entry"""
    # Try different possible filename patterns
    possible_names = [
        f"{diary_name}_{filename}.{photo_type}",
        f"{filename}.{photo_type}",
        f"{diary_name}_{filename}.jpeg",
        f"{filename}.jpeg"
    ]
    
    photo_dir = Path(f'legacy_site/photos/{user_name}')
    if photo_dir.exists():
        for name in possible_names:
            photo_path = photo_dir / name
            if photo_path.exists():
                return f"photos/{user_name}/{name}"
    
    # If not found, return a placeholder
    return f"photos/{user_name}/{diary_name}_{filename}.{photo_type}"

def copy_photos(photos):
    """Copy photos to static site directory"""
    print("Copying photos...")
    
    # Create photos directory
    os.makedirs('legacy_site/photos', exist_ok=True)
    
    # Copy photos from legacy directory
    legacy_photos_dir = Path('legacy/v2.0/photos')
    if legacy_photos_dir.exists():
        shutil.copytree(legacy_photos_dir, 'legacy_site/photos', dirs_exist_ok=True)
        print(f"Copied photos from {legacy_photos_dir}")
    
    # Also copy graphics
    legacy_graphics_dir = Path('legacy/v2.0/graphics')
    if legacy_graphics_dir.exists():
        shutil.copytree(legacy_graphics_dir, 'legacy_site/graphics', dirs_exist_ok=True)
        print(f"Copied graphics from {legacy_graphics_dir}")

def generate_css():
    """Generate CSS for the static site"""
    css_content = """
/* YearAway Legacy Site Styles */
body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: linear-gradient(135deg, #8B4513 0%, #D2691E 50%, #CD853F 100%);
    margin: 0;
    padding: 20px;
    min-height: 100vh;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 20px;
    padding: 40px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
}

.header {
    text-align: center;
    margin-bottom: 40px;
    padding-bottom: 20px;
    border-bottom: 2px solid #D2691E;
}

.header h1 {
    color: #8B4513;
    font-size: 3rem;
    margin: 0;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
}

.header p {
    color: #666;
    font-size: 1.2rem;
    margin: 10px 0 0 0;
}

.nav {
    text-align: center;
    margin-bottom: 30px;
}

.nav a {
    color: #8B4513;
    text-decoration: none;
    margin: 0 20px;
    padding: 10px 20px;
    border-radius: 25px;
    background: rgba(210, 105, 30, 0.1);
    transition: all 0.3s ease;
}

.nav a:hover {
    background: rgba(210, 105, 30, 0.2);
    transform: translateY(-2px);
}

.diary-entry {
    background: white;
    border-radius: 15px;
    padding: 30px;
    margin-bottom: 30px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    border-left: 5px solid #D2691E;
}

.diary-meta {
    color: #8B4513;
    font-weight: bold;
    margin-bottom: 15px;
    font-size: 1.1rem;
}

.diary-title {
    color: #333;
    font-size: 1.5rem;
    margin-bottom: 15px;
    font-weight: 600;
}

.diary-location {
    color: #666;
    font-style: italic;
    margin-bottom: 20px;
}

.diary-content {
    line-height: 1.6;
    color: #444;
    font-size: 1rem;
}

.diary-content p {
    margin-bottom: 15px;
}

.photo-gallery {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-top: 30px;
}

.photo-item {
    text-align: center;
    background: white;
    border-radius: 10px;
    padding: 15px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.photo-item img {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    margin-bottom: 10px;
}

.photo-caption {
    color: #666;
    font-size: 0.9rem;
    font-style: italic;
}

.entries-list {
    display: grid;
    gap: 20px;
}

.entry-summary {
    background: white;
    border-radius: 10px;
    padding: 20px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    border-left: 4px solid #D2691E;
}

.entry-summary h3 {
    margin: 0 0 10px 0;
    color: #8B4513;
}

.entry-summary .meta {
    color: #666;
    font-size: 0.9rem;
    margin-bottom: 10px;
}

.entry-summary .excerpt {
    color: #444;
    line-height: 1.5;
}

.back-link {
    display: inline-block;
    margin-bottom: 20px;
    color: #8B4513;
    text-decoration: none;
    padding: 10px 20px;
    border-radius: 25px;
    background: rgba(210, 105, 30, 0.1);
    transition: all 0.3s ease;
}

.back-link:hover {
    background: rgba(210, 105, 30, 0.2);
}

@media (max-width: 768px) {
    .container {
        padding: 20px;
        margin: 10px;
    }
    
    .header h1 {
        font-size: 2rem;
    }
    
    .nav a {
        display: block;
        margin: 10px 0;
    }
    
    .photo-gallery {
        grid-template-columns: 1fr;
    }
}
"""
    
    with open('legacy_site/style.css', 'w') as f:
        f.write(css_content)

def generate_homepage(diary_entries):
    """Generate the main homepage"""
    print("Generating homepage...")
    
    # Sort entries by date (newest first)
    sorted_entries = sorted(diary_entries, key=lambda x: x['start_date'], reverse=True)
    
    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>YearAway - Travel Diary Archive</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>YearAway</h1>
            <p>Travel Diary Archive - {len(diary_entries)} entries from our adventures around the world</p>
        </div>
        
        <div class="nav">
            <a href="index.html">Home</a>
            <a href="entries.html">All Entries</a>
            <a href="photos.html">Photo Gallery</a>
        </div>
        
        <div class="entries-list">
"""
    
    # Show latest 10 entries
    for entry in sorted_entries[:10]:
        try:
            date_obj = datetime.strptime(entry['start_date'], '%Y-%m-%d %H:%M:%S')
            formatted_date = date_obj.strftime('%B %d, %Y')
        except:
            formatted_date = entry['start_date']
        
        # Create excerpt (first 200 characters)
        excerpt = entry['message'][:200] + "..." if len(entry['message']) > 200 else entry['message']
        excerpt = excerpt.replace('\r\n', ' ').replace('\n', ' ')
        
        safe_filename = f"entry_{entry['user_name']}_{entry['diary_name']}_{entry['start_date'].replace(' ', '_').replace(':', '-')}.html"
        
        html_content += f"""
            <div class="entry-summary">
                <h3><a href="{safe_filename}">{entry['section']}</a></h3>
                <div class="meta">{formatted_date} • {entry['location']}, {entry['country']} • by {entry['user_name']}</div>
                <div class="excerpt">{excerpt}</div>
            </div>
"""
    
    html_content += """
        </div>
        
        <div style="text-align: center; margin-top: 40px;">
            <a href="entries.html" class="nav">View All Entries</a>
        </div>
    </div>
</body>
</html>"""
    
    with open('legacy_site/index.html', 'w', encoding='utf-8') as f:
        f.write(html_content)

def generate_entries_page(diary_entries):
    """Generate the all entries page"""
    print("Generating entries page...")
    
    # Sort entries by date (newest first)
    sorted_entries = sorted(diary_entries, key=lambda x: x['start_date'], reverse=True)
    
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
            <p>{len(diary_entries)} entries from our travels</p>
        </div>
        
        <div class="nav">
            <a href="index.html">Home</a>
            <a href="entries.html">All Entries</a>
            <a href="photos.html">Photo Gallery</a>
        </div>
        
        <div class="entries-list">
"""
    
    for entry in sorted_entries:
        try:
            date_obj = datetime.strptime(entry['start_date'], '%Y-%m-%d %H:%M:%S')
            formatted_date = date_obj.strftime('%B %d, %Y')
        except:
            formatted_date = entry['start_date']
        
        # Create excerpt (first 300 characters)
        excerpt = entry['message'][:300] + "..." if len(entry['message']) > 300 else entry['message']
        excerpt = excerpt.replace('\r\n', ' ').replace('\n', ' ')
        
        safe_filename = f"entry_{entry['user_name']}_{entry['diary_name']}_{entry['start_date'].replace(' ', '_').replace(':', '-')}.html"
        
        html_content += f"""
            <div class="entry-summary">
                <h3><a href="{safe_filename}">{entry['section']}</a></h3>
                <div class="meta">{formatted_date} • {entry['location']}, {entry['country']} • by {entry['user_name']}</div>
                <div class="excerpt">{excerpt}</div>
            </div>
"""
    
    html_content += """
        </div>
    </div>
</body>
</html>"""
    
    with open('legacy_site/entries.html', 'w', encoding='utf-8') as f:
        f.write(html_content)

def generate_individual_entry(entry, all_entries, photos):
    """Generate individual diary entry page"""
    try:
        date_obj = datetime.strptime(entry['start_date'], '%Y-%m-%d %H:%M:%S')
        formatted_date = date_obj.strftime('%B %d, %Y')
    except:
        formatted_date = entry['start_date']
    
    # Find related photos
    entry_photos = [p for p in photos if p['user_name'] == entry['user_name'] and 
                   p['diary_name'] == entry['diary_name'] and 
                   p['start_date'] == entry['start_date']]
    
    # Find previous and next entries
    sorted_entries = sorted(all_entries, key=lambda x: x['start_date'])
    current_index = next((i for i, e in enumerate(sorted_entries) if 
                         e['user_name'] == entry['user_name'] and 
                         e['diary_name'] == entry['diary_name'] and 
                         e['start_date'] == entry['start_date']), -1)
    
    prev_entry = sorted_entries[current_index - 1] if current_index > 0 else None
    next_entry = sorted_entries[current_index + 1] if current_index < len(sorted_entries) - 1 else None
    
    # Format message content
    formatted_message = entry['message'].replace('\r\n', '<br>').replace('\n', '<br>').replace('\r', '<br>')
    
    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{entry['section']} - YearAway</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <a href="index.html" class="back-link">← Back to Home</a>
        
        <div class="diary-entry">
            <div class="diary-meta">{formatted_date} • {entry['location']}, {entry['country']} • by {entry['user_name']}</div>
            <h1 class="diary-title">{entry['section']}</h1>
            <div class="diary-location">{entry['location']}, {entry['country']}</div>
            <div class="diary-content">
                {formatted_message}
            </div>
"""
    
    # Add photos if any
    if entry_photos:
        html_content += """
            <div class="photo-gallery">
"""
        for photo in sorted(entry_photos, key=lambda x: int(x['photo_order']) if x['photo_order'].isdigit() else 0):
            # Find the actual photo file
            photo_path = find_photo_file(entry['user_name'], entry['diary_name'], photo['filename'], photo['type'])
            html_content += f"""
                <div class="photo-item">
                    <img src="{photo_path}" alt="{photo['comment']}" loading="lazy">
                    <div class="photo-caption">{photo['comment']}</div>
                </div>
"""
        html_content += """
            </div>
"""
    
    # Add navigation
    html_content += """
            <div style="margin-top: 40px; display: flex; justify-content: space-between;">
"""
    
    if prev_entry:
        prev_filename = f"entry_{prev_entry['user_name']}_{prev_entry['diary_name']}_{prev_entry['start_date'].replace(' ', '_').replace(':', '-')}.html"
        html_content += f'<a href="{prev_filename}" class="back-link">← Previous: {prev_entry["section"]}</a>'
    else:
        html_content += '<span></span>'
    
    if next_entry:
        next_filename = f"entry_{next_entry['user_name']}_{next_entry['diary_name']}_{next_entry['start_date'].replace(' ', '_').replace(':', '-')}.html"
        html_content += f'<a href="{next_filename}" class="back-link">Next: {next_entry["section"]} →</a>'
    else:
        html_content += '<span></span>'
    
    html_content += """
            </div>
        </div>
    </div>
</body>
</html>"""
    
    filename = f"entry_{entry['user_name']}_{entry['diary_name']}_{entry['start_date'].replace(' ', '_').replace(':', '-')}.html"
    with open(f'legacy_site/{filename}', 'w', encoding='utf-8') as f:
        f.write(html_content)

def generate_photos_page(photos):
    """Generate the photos gallery page"""
    print("Generating photos page...")
    
    html_content = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Photo Gallery - YearAway</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Photo Gallery</h1>
            <p>Memories from our travels around the world</p>
        </div>
        
        <div class="nav">
            <a href="index.html">Home</a>
            <a href="entries.html">All Entries</a>
            <a href="photos.html">Photo Gallery</a>
        </div>
        
        <div class="photo-gallery">
"""
    
    for photo in photos:
        photo_path = find_photo_file(photo['user_name'], photo['diary_name'], photo['filename'], photo['type'])
        html_content += f"""
            <div class="photo-item">
                <img src="{photo_path}" alt="{photo['comment']}" loading="lazy">
                <div class="photo-caption">{photo['comment']}</div>
                <div class="photo-meta" style="font-size: 0.8rem; color: #999; margin-top: 5px;">
                    {photo['user_name']} • {photo['start_date'][:10]}
                </div>
            </div>
"""
    
    html_content += """
        </div>
    </div>
</body>
</html>"""
    
    with open('legacy_site/photos.html', 'w', encoding='utf-8') as f:
        f.write(html_content)

def main():
    """Main function to generate the static site"""
    print("Starting YearAway static site generation (v2)...")
    
    # Create output directory
    os.makedirs('legacy_site', exist_ok=True)
    
    # Extract data
    diary_entries, photos = extract_database_data()
    
    # Copy photos and graphics
    copy_photos(photos)
    
    # Generate CSS
    generate_css()
    
    # Generate pages
    generate_homepage(diary_entries)
    generate_entries_page(diary_entries)
    generate_photos_page(photos)
    
    # Generate individual entry pages
    print("Generating individual entry pages...")
    for entry in diary_entries:
        generate_individual_entry(entry, diary_entries, photos)
    
    print(f"Static site generation complete!")
    print(f"Generated {len(diary_entries)} diary entry pages")
    print(f"Site files are in the 'legacy_site' directory")
    print(f"You can now serve the site with: python3 -m http.server 8000")

if __name__ == "__main__":
    main()
