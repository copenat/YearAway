#!/usr/bin/env python3
"""
YearAway YAML Validation Script
Validates YAML files for format, content, and cross-references
"""

import os
import sys
import yaml
import subprocess
import json
from pathlib import Path
from typing import Dict, List, Set, Any, Optional
import argparse

class YAMLValidator:
    def __init__(self, repo_root: str):
        self.repo_root = Path(repo_root)
        self.content_dir = self.repo_root / "and-now" / "content"
        self.errors = []
        self.warnings = []
        
    def log_error(self, message: str):
        """Log an error message"""
        self.errors.append(f"❌ ERROR: {message}")
        print(f"❌ ERROR: {message}")
        
    def log_warning(self, message: str):
        """Log a warning message"""
        self.warnings.append(f"⚠️  WARNING: {message}")
        print(f"⚠️  WARNING: {message}")
        
    def log_success(self, message: str):
        """Log a success message"""
        print(f"✅ {message}")
        
    def validate_yaml_format(self, file_path: Path) -> Optional[Dict]:
        """Validate YAML file format and return parsed data"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = yaml.safe_load(f)
                self.log_success(f"YAML format valid: {file_path.name}")
                return data
        except yaml.YAMLError as e:
            self.log_error(f"Invalid YAML format in {file_path.name}: {e}")
            return None
        except FileNotFoundError:
            self.log_error(f"File not found: {file_path.name}")
            return None
            
    def get_git_diff_files(self) -> Dict[str, List[str]]:
        """Get files changed in git diff"""
        try:
            # Get staged changes
            result = subprocess.run(
                ['git', 'diff', '--cached', '--name-only'],
                capture_output=True, text=True, cwd=self.repo_root
            )
            staged_files = result.stdout.strip().split('\n') if result.stdout.strip() else []
            
            # Get unstaged changes
            result = subprocess.run(
                ['git', 'diff', '--name-only'],
                capture_output=True, text=True, cwd=self.repo_root
            )
            unstaged_files = result.stdout.strip().split('\n') if result.stdout.strip() else []
            
            return {
                'staged': staged_files,
                'unstaged': unstaged_files
            }
        except subprocess.CalledProcessError as e:
            self.log_warning(f"Could not get git diff: {e}")
            return {'staged': [], 'unstaged': []}
            
    def get_git_diff_content(self, file_path: str) -> str:
        """Get the diff content for a specific file"""
        try:
            result = subprocess.run(
                ['git', 'diff', '--cached', file_path],
                capture_output=True, text=True, cwd=self.repo_root
            )
            if result.stdout:
                return result.stdout
                
            result = subprocess.run(
                ['git', 'diff', file_path],
                capture_output=True, text=True, cwd=self.repo_root
            )
            return result.stdout
        except subprocess.CalledProcessError:
            return ""
            
    def find_new_images_in_diff(self, diff_content: str) -> List[str]:
        """Find new image files mentioned in git diff"""
        new_images = []
        lines = diff_content.split('\n')
        
        for line in lines:
            if line.startswith('+') and any(ext in line.lower() for ext in ['.jpg', '.jpeg', '.png', '.gif', '.webp']):
                # Extract image path from the line
                if 'content/images/' in line:
                    # Look for image paths in the diff
                    parts = line.split('content/images/')
                    if len(parts) > 1:
                        image_path = 'content/images/' + parts[1].split()[0].strip('"\'')
                        new_images.append(image_path)
                        
        return new_images
        
    def validate_photos_data(self, photos_data: Dict, new_images: List[str]) -> None:
        """Validate that new images are referenced in photos data"""
        if not photos_data or 'photos' not in photos_data or not photos_data['photos']:
            return
            
        existing_photos = set()
        for photo in photos_data['photos']:
            if 'filename' in photo and 'path' in photo:
                # Create full path like the validation script expects
                full_path = photo['path'] + photo['filename']
                existing_photos.add(full_path)
                # Also add just the filename for partial matching
                existing_photos.add(photo['filename'])
                
        for image in new_images:
            # Extract just the filename from the full path
            image_filename = image.split('/')[-1] if '/' in image else image
            if image not in existing_photos and image_filename not in existing_photos:
                self.log_warning(f"New image {image} not found in photos-data files")
    
    def validate_photo_paths(self, photos_data: Dict, yaml_file_name: str) -> None:
        """Validate that photo paths in YAML files point to existing files"""
        if not photos_data or 'photos' not in photos_data or not photos_data['photos']:
            return
        
        for i, photo in enumerate(photos_data['photos']):
            if 'filename' not in photo or 'path' not in photo:
                continue
            
            filename = photo['filename']
            path = photo['path']
            
            # Construct the full path to the image file
            # Remove 'content/images/' prefix if present since we're already in content_dir
            if path.startswith('content/images/'):
                relative_path = path[15:]  # Remove 'content/images/' prefix
            else:
                relative_path = path
            
            # Ensure path ends with /
            if not relative_path.endswith('/'):
                relative_path += '/'
            
            full_path = self.content_dir / "images" / relative_path / filename
            
            # Check if the file exists
            if not full_path.exists():
                self.log_error(f"Photo {i+1} in {yaml_file_name}: File not found at {full_path}")
            else:
                self.log_success(f"Photo {i+1} in {yaml_file_name}: File exists at {full_path}")
            
            # Validate path format
            if not path.startswith('content/images/'):
                self.log_warning(f"Photo {i+1} in {yaml_file_name}: Path should start with 'content/images/' but got '{path}'")
            
            # Check if path matches expected directory structure
            if 'public' in path and 'members' in path:
                self.log_error(f"Photo {i+1} in {yaml_file_name}: Path cannot contain both 'public' and 'members': '{path}'")
            elif 'public' not in path and 'members' not in path:
                self.log_warning(f"Photo {i+1} in {yaml_file_name}: Path should specify 'public' or 'members' directory: '{path}'")
            
            # Validate isPublic field matches path
            if 'isPublic' in photo:
                is_public = photo['isPublic']
                if is_public and 'public' not in path:
                    self.log_warning(f"Photo {i+1} in {yaml_file_name}: isPublic=true but path doesn't contain 'public': '{path}'")
                elif not is_public and 'members' not in path:
                    self.log_warning(f"Photo {i+1} in {yaml_file_name}: isPublic=false but path doesn't contain 'members': '{path}'")
                
    def validate_adventure_tags(self, adventures_data: Dict, photos_data: Dict) -> None:
        """Validate that photo tags and adventure_ids will make photos show up in adventure entries"""
        if not adventures_data or 'adventures' not in adventures_data:
            return
            
        if not photos_data or 'photos' not in photos_data or not photos_data['photos']:
            return
            
        # Create a mapping of adventure IDs to titles
        adventure_id_to_title = {}
        for adventure in adventures_data['adventures']:
            adventure_id_to_title[adventure.get('id', '')] = adventure.get('title', adventure.get('id', 'Unknown'))
            
        # Get all adventure tags
        adventure_tags = set()
        for adventure in adventures_data['adventures']:
            if 'tags' in adventure:
                adventure_tags.update(adventure['tags'])
                
        # Check photo tags and adventure_ids against adventures
        for photo in photos_data['photos']:
            matching_adventures = []
            
            # Check adventure_ids first (more direct linking)
            if 'adventure_ids' in photo and photo['adventure_ids']:
                for adventure_id in photo['adventure_ids']:
                    if adventure_id in adventure_id_to_title:
                        matching_adventures.append(adventure_id_to_title[adventure_id])
            
            # Check photo tags against adventure tags (fallback)
            if 'tags' in photo and not matching_adventures:
                photo_tags = set(photo['tags'])
                for adventure in adventures_data['adventures']:
                    if 'tags' in adventure:
                        adventure_tag_set = set(adventure['tags'])
                        if photo_tags.intersection(adventure_tag_set):
                            matching_adventures.append(adventure.get('title', adventure.get('id', 'Unknown')))
                            
            if not matching_adventures:
                photo_name = photo.get('filename', photo.get('id', 'Unknown'))
                if 'adventure_ids' in photo and photo['adventure_ids']:
                    self.log_warning(f"Photo {photo_name} has adventure_ids {photo['adventure_ids']} but no matching adventures found")
                elif 'tags' in photo:
                    self.log_warning(f"Photo {photo_name} tags {photo['tags']} don't match any adventure tags")
            else:
                photo_name = photo.get('filename', photo.get('id', 'Unknown'))
                self.log_success(f"Photo {photo_name} will appear in adventures: {', '.join(matching_adventures)}")
                    
    def validate_tips_data(self, tips_data: Dict) -> None:
        """Validate tips data structure"""
        if not tips_data or 'tips' not in tips_data:
            return
            
        required_fields = ['id', 'title', 'description', 'category', 'tags', 'rating']
        
        for i, tip in enumerate(tips_data['tips']):
            for field in required_fields:
                if field not in tip:
                    self.log_error(f"Tip {i+1} missing required field: {field}")
                    
            # Validate rating is between 1-5
            if 'rating' in tip:
                try:
                    rating = int(tip['rating'])
                    if rating < 1 or rating > 5:
                        self.log_warning(f"Tip {tip.get('id', i+1)} has invalid rating: {rating} (should be 1-5)")
                except (ValueError, TypeError):
                    self.log_error(f"Tip {tip.get('id', i+1)} has invalid rating format: {tip['rating']}")
                    
    def validate_adventures_data(self, adventures_data: Dict) -> None:
        """Validate adventures data structure"""
        if not adventures_data or 'adventures' not in adventures_data:
            return
            
        required_fields = ['id', 'title', 'description', 'date', 'category', 'tags', 'status']
        
        for i, adventure in enumerate(adventures_data['adventures']):
            for field in required_fields:
                if field not in adventure:
                    self.log_error(f"Adventure {i+1} missing required field: {field}")
                    
            # Validate date format
            if 'date' in adventure:
                try:
                    from datetime import datetime
                    datetime.strptime(adventure['date'], '%Y-%m-%d')
                except ValueError:
                    self.log_error(f"Adventure {adventure.get('id', i+1)} has invalid date format: {adventure['date']} (should be YYYY-MM-DD)")
                    
    def validate_category_counts(self, category_counts: Dict) -> None:
        """Validate category counts structure"""
        if not category_counts:
            return
            
        required_fields = ['categories', 'lastUpdated', 'totalStats']
        
        for field in required_fields:
            if field not in category_counts:
                self.log_error(f"category-counts missing required field: {field}")
                
        if 'categories' in category_counts:
            for i, category in enumerate(category_counts['categories']):
                required_cat_fields = ['id', 'name', 'icon', 'description', 'publicTips', 'membersOnlyTips', 'totalTips']
                for field in required_cat_fields:
                    if field not in category:
                        self.log_error(f"Category {i+1} missing required field: {field}")
                        
    def run_validation(self) -> bool:
        """Run the complete validation process"""
        print("🔍 YearAway YAML Validation")
        print("=" * 50)
        
        # Get changed files
        changed_files = self.get_git_diff_files()
        all_changed = set(changed_files['staged'] + changed_files['unstaged'])
        
        # Filter for YAML files in content directory
        yaml_changed = [f for f in all_changed if f.endswith('.yaml') and 'and-now/content/' in f]
        
        if yaml_changed:
            print(f"📁 Found {len(yaml_changed)} changed YAML files:")
            for yaml_file in sorted(yaml_changed):
                print(f"   📄 {yaml_file}")
        else:
            print(f"📁 Found {len(all_changed)} changed files (no YAML files changed)")
        
        # Validate all YAML files in content directory (alphabetical order)
        yaml_files = sorted(list(self.content_dir.glob("*.yaml")))
        print(f"📄 Validating {len(yaml_files)} YAML files...")
        
        photos_data_public = None
        photos_data_members = None
        adventures_data_public = None
        adventures_data_members = None
        tips_data_public = None
        tips_data_members = None
        category_counts = None
        
        for yaml_file in yaml_files:
            data = self.validate_yaml_format(yaml_file)
            if data is None:
                continue
                
            # Store data for cross-validation
            if yaml_file.name == 'photos-data-public.yaml':
                photos_data_public = data
            elif yaml_file.name == 'photos-data-members.yaml':
                photos_data_members = data
            elif yaml_file.name == 'adventures-data-public.yaml':
                adventures_data_public = data
            elif yaml_file.name == 'adventures-data-members.yaml':
                adventures_data_members = data
            elif yaml_file.name == 'tips-data-public.yaml':
                tips_data_public = data
            elif yaml_file.name == 'tips-data-members.yaml':
                tips_data_members = data
            elif yaml_file.name == 'tips-category-counts.yaml':
                category_counts = data
                
        # Cross-validation
        print("\n🔗 Cross-validation...")
        
        # Check for new images in changed files
        new_images = []
        for changed_file in all_changed:
            if changed_file.endswith(('.jpg', '.jpeg', '.png', '.gif', '.webp')):
                new_images.append(changed_file)
            elif changed_file.endswith('.yaml'):
                diff_content = self.get_git_diff_content(changed_file)
                new_images.extend(self.find_new_images_in_diff(diff_content))
                
        if new_images:
            print(f"🖼️  Found {len(new_images)} new images: {new_images}")
            if photos_data_public:
                self.validate_photos_data(photos_data_public, new_images)
            if photos_data_members:
                self.validate_photos_data(photos_data_members, new_images)
            
            # Run AI analysis for new images that don't have entries
            self.run_ai_analysis_for_new_images(new_images)
                
        # Validate data structures
        if tips_data_public:
            self.validate_tips_data(tips_data_public)
        if tips_data_members:
            self.validate_tips_data(tips_data_members)
        if adventures_data_public:
            self.validate_adventures_data(adventures_data_public)
        if adventures_data_members:
            self.validate_adventures_data(adventures_data_members)
        if category_counts:
            self.validate_category_counts(category_counts)
        
        # Validate photo paths
        if photos_data_public:
            self.validate_photo_paths(photos_data_public, 'photos-data-public.yaml')
        if photos_data_members:
            self.validate_photo_paths(photos_data_members, 'photos-data-members.yaml')
            
        # Validate photo-adventure tag matching
        if photos_data_public and adventures_data_public:
            self.validate_adventure_tags(adventures_data_public, photos_data_public)
        if photos_data_members and adventures_data_members:
            self.validate_adventure_tags(adventures_data_members, photos_data_members)
            
        # Summary
        print("\n📊 Validation Summary")
        print("=" * 30)
        print(f"✅ Errors: {len(self.errors)}")
        print(f"⚠️  Warnings: {len(self.warnings)}")
        
        if self.errors:
            print("\n❌ ERRORS:")
            for error in self.errors:
                print(f"  {error}")
                
        if self.warnings:
            print("\n⚠️  WARNINGS:")
            for warning in self.warnings:
                print(f"  {warning}")
                
        return len(self.errors) == 0
    
    def run_ai_analysis_for_new_images(self, new_images: List[str]) -> None:
        """Run AI photo analysis for new images that don't have YAML entries"""
        if not new_images:
            return
        
        # Check which images actually need analysis (not already in YAML files)
        images_needing_analysis = []
        
        # Load existing photos to check against
        existing_photos = set()
        
        # Check public photos
        public_file = self.content_dir / "photos-data-public.yaml"
        if public_file.exists():
            with open(public_file, 'r') as f:
                data = yaml.safe_load(f)
                if data and 'photos' in data and data['photos']:
                    for photo in data['photos']:
                        existing_photos.add(photo.get('filename', ''))
        
        # Check members photos
        members_file = self.content_dir / "photos-data-members.yaml"
        if members_file.exists():
            with open(members_file, 'r') as f:
                data = yaml.safe_load(f)
                if data and 'photos' in data and data['photos']:
                    for photo in data['photos']:
                        existing_photos.add(photo.get('filename', ''))
        
        # Filter new images to only those not in existing YAML files
        for image_path in new_images:
            # Extract just the filename from the path
            filename = Path(image_path).name
            if filename not in existing_photos:
                images_needing_analysis.append(image_path)
        
        if not images_needing_analysis:
            print(f"✅ All new images already have YAML entries")
            return
        
        print(f"\n🤖 Running AI analysis for {len(images_needing_analysis)} new images...")
        
        # Import and run the AI photo analyzer
        try:
            import subprocess
            import sys
            
            # Build command to run AI photo analyzer
            analyzer_script = self.repo_root / "bin" / "ai-photo-analyzer.py"
            
            if not analyzer_script.exists():
                print(f"⚠️  AI photo analyzer not found at {analyzer_script}")
                return
            
            # Run AI analysis for each image
            for image_path in images_needing_analysis:
                print(f"🔍 Analyzing {Path(image_path).name}...")
                
                cmd = [
                    sys.executable, str(analyzer_script),
                    "--image-path", image_path,
                    "--auto-add"
                ]
                
                try:
                    result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
                    
                    if result.returncode == 0:
                        print(f"✅ Successfully analyzed {Path(image_path).name}")
                        # Show the generated entry
                        if result.stdout:
                            lines = result.stdout.split('\n')
                            for line in lines:
                                if 'Generated entry:' in line or 'ID:' in line or 'Caption:' in line:
                                    print(f"   {line.strip()}")
                    else:
                        print(f"❌ Failed to analyze {Path(image_path).name}: {result.stderr}")
                        
                except subprocess.TimeoutExpired:
                    print(f"⏰ Analysis timed out for {Path(image_path).name}")
                except Exception as e:
                    print(f"❌ Error analyzing {Path(image_path).name}: {e}")
            
            print(f"🎉 AI analysis completed for {len(images_needing_analysis)} images")
            
        except ImportError as e:
            print(f"⚠️  Could not import required modules for AI analysis: {e}")
        except Exception as e:
            print(f"⚠️  Error running AI photo analysis: {e}")

def main():
    parser = argparse.ArgumentParser(description='Validate YearAway YAML files')
    parser.add_argument('--repo-root', default='.', help='Repository root directory')
    parser.add_argument('--exit-on-error', action='store_true', help='Exit with error code if validation fails')
    
    args = parser.parse_args()
    
    validator = YAMLValidator(args.repo_root)
    success = validator.run_validation()
    
    if not success and args.exit_on_error:
        sys.exit(1)
        
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
