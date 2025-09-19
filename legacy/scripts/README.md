# YearAway Legacy Scripts

This directory contains scripts for generating static HTML sites from the legacy YearAway travel diary data.

## Scripts

### `generate_static_site_v2.py` (Recommended)
- **Purpose**: Advanced static site generator with improved parsing
- **Features**: 
  - Better handling of escape sequences in database content
  - Comprehensive country code mapping
  - Improved photo file detection
  - Enhanced error handling
- **Usage**: `python3 generate_static_site_v2.py`

### `generate_static_site.py`
- **Purpose**: Basic static site generator
- **Features**: Simple parsing of database dump
- **Usage**: `python3 generate_static_site.py`

### `generate_entries_from_files.py`
- **Purpose**: Generate entries.html from existing HTML files
- **Features**: Scans for entry files and creates a summary page
- **Usage**: `python3 generate_entries_from_files.py`

## Requirements

- Python 3.6+
- Legacy database dump file at `../dumps/db.20111027`
- Legacy photos at `../v2.0/photos/`
- Legacy graphics at `../v2.0/graphics/`

## Output

All scripts generate static HTML files in the `legacy_site/` directory at the project root.

## Usage Examples

```bash
# Generate complete static site (recommended)
python3 generate_static_site_v2.py

# Generate basic static site
python3 generate_static_site.py

# Generate entries summary from existing files
python3 generate_entries_from_files.py

# Serve the generated site locally
cd ../../legacy_site
python3 -m http.server 8000
```

## File Structure

```
legacy/
├── scripts/
│   ├── generate_static_site_v2.py    # Advanced generator
│   ├── generate_static_site.py       # Basic generator
│   ├── generate_entries_from_files.py # Entries generator
│   └── README.md                     # This file
├── dumps/
│   └── db.20111027                   # Database dump
└── v2.0/
    ├── photos/                       # Photo files
    └── graphics/                     # Graphics files
```

## Notes

- All scripts automatically detect the project root directory
- Generated files are placed in `legacy_site/` at the project root
- Scripts can be run from any directory within the project
- The v2 generator is recommended for best results
