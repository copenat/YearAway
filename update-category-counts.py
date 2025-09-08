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
    """Load tips data from JSON file"""
    tips_file = "and-now/content/tips-data.json"
    if not os.path.exists(tips_file):
        print(f"❌ Tips data file not found: {tips_file}")
        return None
    
    with open(tips_file, 'r', encoding='utf-8') as f:
        return json.load(f)

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
            'Technology': '📱'
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
    output_file = "and-now/content/category-counts.json"
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(category_counts, f, indent=2, ensure_ascii=False)
    
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
