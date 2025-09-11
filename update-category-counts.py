#!/usr/bin/env python3
"""
YearAway Category Counts Updater
Automatically calculates and updates category tip counts from tips-data.json
"""

import json
import os
from datetime import datetime
from collections import defaultdict

def load_tips_data():
    """Load tips data from separate YAML files"""
    public_file = "and-now/content/tips-data-public.yaml"
    members_file = "and-now/content/tips-data-members.yaml"
    
    try:
        import yaml
        
        # Load public tips
        public_tips = []
        if os.path.exists(public_file):
            with open(public_file, 'r', encoding='utf-8') as f:
                public_data = yaml.safe_load(f)
                public_tips = public_data.get('tips', [])
                # Mark all public tips as public
                for tip in public_tips:
                    tip['isPublic'] = True
        
        # Load members tips
        members_tips = []
        if os.path.exists(members_file):
            with open(members_file, 'r', encoding='utf-8') as f:
                members_data = yaml.safe_load(f)
                members_tips = members_data.get('tips', [])
                # Mark all members tips as not public
                for tip in members_tips:
                    tip['isPublic'] = False
        
        # Combine tips
        all_tips = public_tips + members_tips
        
        # Get categories from category-counts.yaml (existing structure)
        categories_file = "and-now/content/category-counts.yaml"
        categories = []
        if os.path.exists(categories_file):
            with open(categories_file, 'r', encoding='utf-8') as f:
                categories_data = yaml.safe_load(f)
                categories = categories_data.get('categories', [])
        
        return {
            'tips': all_tips,
            'categories': categories
        }
        
    except ImportError:
        print("❌ PyYAML not installed. Install with: pip install PyYAML")
        return None

def calculate_category_counts(tips_data):
    """Calculate tip counts for each category"""
    category_stats = defaultdict(lambda: {'public': 0, 'members_only': 0, 'total': 0})
    
    # Count tips by category and type
    for tip in tips_data.get('tips', []):
        category = tip.get('category', 'Unknown')
        is_public = tip.get('isPublic', True)
        
        category_stats[category]['total'] += 1
        if is_public:
            category_stats[category]['public'] += 1
        else:
            category_stats[category]['members_only'] += 1
    
    return category_stats

def create_category_counts_json(tips_data, category_stats):
    """Create the category counts JSON structure"""
    categories = []
    total_public = 0
    total_members_only = 0
    total_tips = 0
    
    # Get category metadata from tips data
    category_metadata = {cat['name']: cat for cat in tips_data.get('categories', [])}
    
    for category_name, stats in category_stats.items():
        # Get category metadata
        metadata = category_metadata.get(category_name, {})
        
        # Default icons for categories if not found in metadata
        default_icons = {
            'Transportation': '✈️',
            'Accommodation': '🏨',
            'Food & Dining': '🍽️',
            'Packing': '🎒',
            'Budget': '💰',
            'Technology': '📱',
            'Running': '🏃',
            'Products': '🛍️'
        }
        
        category_data = {
            "id": metadata.get('id', category_name.lower().replace(' & ', '-').replace(' ', '-')),
            "name": category_name,
            "icon": metadata.get('icon', default_icons.get(category_name, '📝')),
            "description": metadata.get('description', f"{category_name} tips and advice"),
            "publicTips": stats['public'],
            "membersOnlyTips": stats['members_only'],
            "totalTips": stats['total']
        }
        
        categories.append(category_data)
        
        # Update totals
        total_public += stats['public']
        total_members_only += stats['members_only']
        total_tips += stats['total']
    
    # Sort categories by name for consistency
    categories.sort(key=lambda x: x['name'])
    
    return {
        "categories": categories,
        "lastUpdated": datetime.now().isoformat() + "Z",
        "totalStats": {
            "publicTips": total_public,
            "membersOnlyTips": total_members_only,
            "totalTips": total_tips
        }
    }

def update_category_counts_file(category_counts):
    """Write the updated category counts to file"""
    import yaml
    output_file = "and-now/content/category-counts.yaml"
    
    with open(output_file, 'w', encoding='utf-8') as f:
        yaml.dump(category_counts, f, default_flow_style=False, allow_unicode=True, sort_keys=False)
    
    print(f"✅ Updated category counts: {output_file}")
    return output_file

def print_summary(category_counts):
    """Print a summary of the updated counts"""
    print("\n📊 Category Counts Summary:")
    print("=" * 50)
    
    for category in category_counts['categories']:
        name = category['name']
        public = category['publicTips']
        members = category['membersOnlyTips']
        total = category['totalTips']
        
        print(f"{category['icon']} {name}:")
        print(f"  Public: {public}, Members Only: {members}, Total: {total}")
    
    stats = category_counts['totalStats']
    print(f"\n📈 Total Stats:")
    print(f"  Public Tips: {stats['publicTips']}")
    print(f"  Members Only Tips: {stats['membersOnlyTips']}")
    print(f"  Total Tips: {stats['totalTips']}")
    print(f"  Last Updated: {category_counts['lastUpdated']}")

def main():
    """Main function"""
    print("🔄 YearAway Category Counts Updater")
    print("=" * 40)
    
    # Load tips data
    tips_data = load_tips_data()
    if not tips_data:
        return 1
    
    print(f"📄 Loaded {len(tips_data.get('tips', []))} tips")
    
    # Calculate category counts
    category_stats = calculate_category_counts(tips_data)
    print(f"📊 Calculated counts for {len(category_stats)} categories")
    
    # Create category counts JSON
    category_counts = create_category_counts_json(tips_data, category_stats)
    
    # Update the file
    output_file = update_category_counts_file(category_counts)
    
    # Print summary
    print_summary(category_counts)
    
    print(f"\n🎉 Category counts updated successfully!")
    print(f"💡 This file can be used by the frontend to display accurate counts")
    print(f"🚀 Consider running this script in your CI/CD pipeline")
    
    return 0

if __name__ == "__main__":
    exit(main())
