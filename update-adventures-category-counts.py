#!/usr/bin/env python3
"""
YearAway Adventures Category Counts Updater
Automatically calculates and updates adventure category counts from adventures-data YAML files
"""

import os
from datetime import datetime
from collections import defaultdict

def load_adventures_data():
    """Load adventures data from separate YAML files"""
    public_file = "and-now/content/adventures-data-public.yaml"
    members_file = "and-now/content/adventures-data-members.yaml"
    
    try:
        import yaml
        
        # Load public adventures
        public_adventures = []
        public_categories = []
        if os.path.exists(public_file):
            with open(public_file, 'r', encoding='utf-8') as f:
                public_data = yaml.safe_load(f)
                public_adventures = public_data.get('adventures', [])
                public_categories = public_data.get('categories', [])
                # Mark all public adventures as public
                for adventure in public_adventures:
                    adventure['isPublic'] = True
        
        # Load members adventures
        members_adventures = []
        members_categories = []
        if os.path.exists(members_file):
            with open(members_file, 'r', encoding='utf-8') as f:
                members_data = yaml.safe_load(f)
                members_adventures = members_data.get('adventures', [])
                members_categories = members_data.get('categories', [])
                # Mark all members adventures as not public
                for adventure in members_adventures:
                    adventure['isPublic'] = False
        
        return {
            'public': {
                'adventures': public_adventures,
                'categories': public_categories
            },
            'members': {
                'adventures': members_adventures,
                'categories': members_categories
            }
        }
        
    except ImportError:
        print("❌ PyYAML not installed. Install with: pip install PyYAML")
        return None

def calculate_category_counts(adventures_data):
    """Calculate adventure counts for each category in both public and members sections"""
    public_stats = defaultdict(lambda: {'count': 0, 'adventures': []})
    members_stats = defaultdict(lambda: {'count': 0, 'adventures': []})
    
    # Count public adventures by category
    for adventure in adventures_data['public']['adventures']:
        category = adventure.get('category', 'Unknown')
        public_stats[category]['count'] += 1
        public_stats[category]['adventures'].append(adventure.get('id', 'unknown'))
    
    # Count members adventures by category
    for adventure in adventures_data['members']['adventures']:
        category = adventure.get('category', 'Unknown')
        members_stats[category]['count'] += 1
        members_stats[category]['adventures'].append(adventure.get('id', 'unknown'))
    
    return public_stats, members_stats

def update_public_categories(public_categories, public_stats):
    """Update public categories with new counts"""
    updated_categories = []
    
    for category in public_categories:
        category_name = category['name']
        count = public_stats.get(category_name, {}).get('count', 0)
        
        updated_category = category.copy()
        updated_category['count'] = count
        updated_categories.append(updated_category)
    
    return updated_categories

def update_members_categories(members_categories, members_stats):
    """Update members categories with new counts"""
    updated_categories = []
    
    for category in members_categories:
        category_name = category['name']
        count = members_stats.get(category_name, {}).get('count', 0)
        
        updated_category = category.copy()
        updated_category['count'] = count
        updated_categories.append(updated_category)
    
    return updated_categories

def update_adventures_files(adventures_data, public_stats, members_stats):
    """Update the adventures YAML files with new category counts"""
    import yaml
    
    # Update public adventures file
    public_file = "and-now/content/adventures-data-public.yaml"
    if os.path.exists(public_file):
        with open(public_file, 'r', encoding='utf-8') as f:
            public_data = yaml.safe_load(f)
        
        # Update categories with new counts
        public_data['categories'] = update_public_categories(
            public_data.get('categories', []), 
            public_stats
        )
        
        # Update lastUpdated timestamp
        public_data['lastUpdated'] = datetime.now().isoformat() + "Z"
        
        # Write back to file
        with open(public_file, 'w', encoding='utf-8') as f:
            yaml.dump(public_data, f, default_flow_style=False, allow_unicode=True, sort_keys=False)
        
        print(f"✅ Updated public adventures: {public_file}")
    
    # Update members adventures file
    members_file = "and-now/content/adventures-data-members.yaml"
    if os.path.exists(members_file):
        with open(members_file, 'r', encoding='utf-8') as f:
            members_data = yaml.safe_load(f)
        
        # Update categories with new counts
        members_data['categories'] = update_members_categories(
            members_data.get('categories', []), 
            members_stats
        )
        
        # Update lastUpdated timestamp
        members_data['lastUpdated'] = datetime.now().isoformat() + "Z"
        
        # Write back to file
        with open(members_file, 'w', encoding='utf-8') as f:
            yaml.dump(members_data, f, default_flow_style=False, allow_unicode=True, sort_keys=False)
        
        print(f"✅ Updated members adventures: {members_file}")

def print_summary(public_stats, members_stats):
    """Print a summary of the updated counts"""
    print("\n📊 Adventures Category Counts Summary:")
    print("=" * 60)
    
    print("\n🌍 PUBLIC ADVENTURES:")
    print("-" * 30)
    total_public = 0
    for category, stats in public_stats.items():
        count = stats['count']
        total_public += count
        adventures_list = ', '.join(stats['adventures']) if stats['adventures'] else 'None'
        print(f"  {category}: {count} adventures ({adventures_list})")
    
    print(f"\n  Total Public Adventures: {total_public}")
    
    print("\n🔒 MEMBERS-ONLY ADVENTURES:")
    print("-" * 30)
    total_members = 0
    for category, stats in members_stats.items():
        count = stats['count']
        total_members += count
        adventures_list = ', '.join(stats['adventures']) if stats['adventures'] else 'None'
        print(f"  {category}: {count} adventures ({adventures_list})")
    
    print(f"\n  Total Members Adventures: {total_members}")
    print(f"\n📈 Grand Total: {total_public + total_members} adventures")

def main():
    """Main function"""
    print("🔄 YearAway Adventures Category Counts Updater")
    print("=" * 50)
    
    # Load adventures data
    adventures_data = load_adventures_data()
    if not adventures_data:
        return 1
    
    public_count = len(adventures_data['public']['adventures'])
    members_count = len(adventures_data['members']['adventures'])
    print(f"📄 Loaded {public_count} public adventures and {members_count} members adventures")
    
    # Calculate category counts
    public_stats, members_stats = calculate_category_counts(adventures_data)
    print(f"📊 Calculated counts for {len(public_stats)} public categories and {len(members_stats)} members categories")
    
    # Update the files
    update_adventures_files(adventures_data, public_stats, members_stats)
    
    # Print summary
    print_summary(public_stats, members_stats)
    
    print(f"\n🎉 Adventure category counts updated successfully!")
    print(f"💡 This keeps public and members sections separate as requested")
    print(f"🚀 Consider running this script in your CI/CD pipeline")
    
    return 0

if __name__ == "__main__":
    exit(main())
