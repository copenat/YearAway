#!/usr/bin/env python3
"""
AI Photo Analyzer for YearAway
Uses local LLaVA model to analyze photos and generate YAML entries
"""

import os
import sys
import yaml
import json
import subprocess
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import argparse
from datetime import datetime

class AIPhotoAnalyzer:
    def __init__(self, repo_root: str):
        self.repo_root = Path(repo_root)
        self.content_dir = self.repo_root / "and-now" / "content"
        self.images_dir = self.content_dir / "images"
        self.adventures_data = None
        
    def load_adventures_data(self) -> Dict:
        """Load adventures data for ID suggestions"""
        adventures = {}
        
        # Load public adventures
        public_file = self.content_dir / "adventures-data-public.yaml"
        if public_file.exists():
            with open(public_file, 'r') as f:
                data = yaml.safe_load(f)
                if data and 'adventures' in data:
                    for adventure in data['adventures']:
                        adventures[adventure['id']] = {
                            'title': adventure.get('title', ''),
                            'tags': adventure.get('tags', []),
                            'category': adventure.get('category', '')
                        }
        
        # Load members adventures
        members_file = self.content_dir / "adventures-data-members.yaml"
        if members_file.exists():
            with open(members_file, 'r') as f:
                data = yaml.safe_load(f)
                if data and 'adventures' in data:
                    for adventure in data['adventures']:
                        adventures[adventure['id']] = {
                            'title': adventure.get('title', ''),
                            'tags': adventure.get('tags', []),
                            'category': adventure.get('category', '')
                        }
        
        return adventures
    
    def get_llava_system_prompt(self) -> str:
        """Generate system prompt for LLaVA model"""
        adventures_context = ""
        if self.adventures_data:
            adventures_context = "\n\nAvailable Adventures (for adventure_ids suggestions):\n"
            for adv_id, adv_data in self.adventures_data.items():
                adventures_context += f"- {adv_id}: {adv_data['title']} (tags: {adv_data['tags']})\n"
        
        return f"""You are an AI assistant that analyzes travel and lifestyle photos for the YearAway website. 

Your task is to analyze the provided image and generate a structured response with the following information:

1. **caption**: A short, descriptive caption (1-2 sentences) that describes what's in the photo
2. **id**: A unique identifier based on the photo content (use kebab-case, e.g., "sunset-beach-2024")
3. **tags**: An array of relevant tags (5-10 tags) that describe the photo content, location, activities, etc.
4. **adventure_ids**: An array of adventure IDs that this photo might relate to (from the available adventures list)

Guidelines:
- Keep captions concise but descriptive
- Use lowercase, hyphenated IDs
- Include relevant tags like location, activity, mood, objects, etc.
- Only suggest adventure_ids that are actually relevant to the photo content
- Be specific and accurate in your descriptions

{adventures_context}

Respond with valid JSON in this exact format:
{{
    "caption": "Your caption here",
    "id": "your-suggested-id",
    "tags": ["tag1", "tag2", "tag3"],
    "adventure_ids": ["adventure-id-1", "adventure-id-2"]
}}"""
    
    def check_ollama_available(self) -> bool:
        """Check if Ollama is available and has LLaVA model"""
        try:
            # Check if ollama is installed
            result = subprocess.run(['ollama', '--version'], 
                                  capture_output=True, text=True, timeout=5)
            if result.returncode != 0:
                return False
            
            # Check if llava model is available
            result = subprocess.run(['ollama', 'list'], 
                                  capture_output=True, text=True, timeout=10)
            if result.returncode == 0 and 'llava' in result.stdout.lower():
                return True
            return False
        except (subprocess.TimeoutExpired, FileNotFoundError):
            return False
    
    def check_llava_cli_available(self) -> bool:
        """Check if LLaVA CLI is available"""
        try:
            result = subprocess.run(['llava-cli', '--help'], 
                                  capture_output=True, text=True, timeout=5)
            return result.returncode == 0
        except (subprocess.TimeoutExpired, FileNotFoundError):
            return False
    
    def analyze_photo_with_ollama(self, image_path: Path) -> Optional[Dict]:
        """Analyze photo using Ollama LLaVA model via API"""
        try:
            import base64
            import requests
            
            system_prompt = self.get_llava_system_prompt()
            
            # Read and encode image
            with open(image_path, 'rb') as f:
                image_data = base64.b64encode(f.read()).decode('utf-8')
            
            # Prepare API request
            api_url = "http://localhost:11434/api/generate"
            payload = {
                "model": "llava",
                "prompt": system_prompt,
                "images": [image_data],
                "format": "json"
            }
            
            print(f"🤖 Analyzing {image_path.name} with Ollama LLaVA API...")
            response = requests.post(api_url, json=payload, timeout=120)
            
            if response.status_code == 200:
                # Parse streaming response
                response_text = ""
                for line in response.text.strip().split('\n'):
                    if line:
                        try:
                            data = json.loads(line)
                            if 'response' in data:
                                response_text += data['response']
                        except json.JSONDecodeError:
                            continue
                
                # Extract JSON from response
                try:
                    import re
                    json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
                    if json_match:
                        result_data = json.loads(json_match.group())
                        return result_data
                    else:
                        print(f"❌ No JSON found in Ollama response: {response_text}")
                        return None
                except json.JSONDecodeError as e:
                    print(f"❌ Failed to parse Ollama JSON response: {e}")
                    print(f"Raw response: {response_text}")
                    return None
            else:
                print(f"❌ Ollama API request failed: {response.status_code} - {response.text}")
                return None
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Ollama API request failed: {e}")
            return None
        except Exception as e:
            print(f"❌ Error analyzing photo with Ollama: {e}")
            return None
    
    def analyze_photo_with_llava_cli(self, image_path: Path) -> Optional[Dict]:
        """Analyze photo using LLaVA CLI directly"""
        try:
            system_prompt = self.get_llava_system_prompt()
            
            # Run LLaVA CLI
            cmd = [
                'llava-cli',
                '--image', str(image_path),
                '--prompt', system_prompt,
                '--format', 'json'
            ]
            
            print(f"🤖 Analyzing {image_path.name} with LLaVA CLI...")
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
            
            if result.returncode == 0:
                # Parse JSON response
                response = json.loads(result.stdout.strip())
                return response
            else:
                print(f"❌ LLaVA CLI analysis failed: {result.stderr}")
                return None
                
        except subprocess.TimeoutExpired:
            print(f"❌ LLaVA CLI analysis timed out for {image_path.name}")
            return None
        except json.JSONDecodeError as e:
            print(f"❌ Failed to parse LLaVA CLI response: {e}")
            return None
        except Exception as e:
            print(f"❌ Error analyzing photo with LLaVA CLI: {e}")
            return None
    
    def analyze_photo_with_llava(self, image_path: Path) -> Optional[Dict]:
        """Analyze photo using available LLaVA implementation"""
        # Try Ollama first (easier to install)
        if self.check_ollama_available():
            print(f"🦙 Using Ollama LLaVA for analysis")
            return self.analyze_photo_with_ollama(image_path)
        
        # Fall back to LLaVA CLI
        elif self.check_llava_cli_available():
            print(f"🔧 Using LLaVA CLI for analysis")
            return self.analyze_photo_with_llava_cli(image_path)
        
        # Neither available
        else:
            print(f"❌ Neither Ollama LLaVA nor LLaVA CLI found.")
            print(f"Please install one of the following:")
            print(f"  Ollama: https://ollama.ai (recommended)")
            print(f"  LLaVA CLI: https://github.com/haotian-liu/LLaVA")
            return None
    
    def generate_yaml_entry(self, image_path: Path, analysis: Dict, is_public: bool) -> Dict:
        """Generate YAML entry for photo"""
        # Determine directory and path
        if is_public:
            relative_path = "content/images/public/"
        else:
            relative_path = "content/images/members/"
        
        # Generate filename
        filename = image_path.name
        
        # Extract date from EXIF data if possible, fallback to filename parsing
        photo_date = self.extract_date_from_exif(image_path)
        
        # Create YAML entry
        entry = {
            'id': analysis.get('id', filename.replace('.', '-').lower()),
            'filename': filename,
            'path': relative_path,
            'caption': analysis.get('caption', ''),
            'date': photo_date,
            'tags': analysis.get('tags', []),
            'adventure_ids': analysis.get('adventure_ids', []),
            'isPublic': is_public,
            'featured': False
        }
        
        return entry
    
    def extract_date_from_exif(self, image_path: Path) -> str:
        """Extract date from image EXIF data using exiftool"""
        try:
            # Try to get the creation date from EXIF data
            result = subprocess.run([
                'exiftool', '-CreateDate', '-d', '%Y-%m-%d', str(image_path)
            ], capture_output=True, text=True, timeout=10)
            
            if result.returncode == 0 and result.stdout.strip():
                # Parse exiftool output: "Create Date                     : 2019-09-21"
                lines = result.stdout.strip().split('\n')
                for line in lines:
                    if 'Create Date' in line and ':' in line:
                        date_part = line.split(':')[-1].strip()
                        if date_part and date_part != '-':
                            return date_part
            
            # Fallback: try DateTimeOriginal
            result = subprocess.run([
                'exiftool', '-DateTimeOriginal', '-d', '%Y-%m-%d', str(image_path)
            ], capture_output=True, text=True, timeout=10)
            
            if result.returncode == 0 and result.stdout.strip():
                lines = result.stdout.strip().split('\n')
                for line in lines:
                    if 'Date/Time Original' in line and ':' in line:
                        date_part = line.split(':')[-1].strip()
                        if date_part and date_part != '-':
                            return date_part
            
            # Fallback: try FileModifyDate
            result = subprocess.run([
                'exiftool', '-FileModifyDate', '-d', '%Y-%m-%d', str(image_path)
            ], capture_output=True, text=True, timeout=10)
            
            if result.returncode == 0 and result.stdout.strip():
                lines = result.stdout.strip().split('\n')
                for line in lines:
                    if 'File Modification Date/Time' in line and ':' in line:
                        date_part = line.split(':')[-1].strip()
                        if date_part and date_part != '-':
                            return date_part
            
        except (subprocess.TimeoutExpired, FileNotFoundError, subprocess.CalledProcessError):
            pass
        
        # If exiftool fails or no date found, fall back to filename parsing
        return self.extract_date_from_filename(image_path.name)
    
    def extract_date_from_filename(self, filename: str) -> str:
        """Extract date from filename if it follows common patterns (fallback method)"""
        import re
        
        # Pattern 1: IMG_YYYYMMDD_HHMMSS.jpg (e.g., IMG_20190921_101514.jpg)
        match = re.search(r'IMG_(\d{4})(\d{2})(\d{2})_', filename)
        if match:
            year, month, day = match.groups()
            return f"{year}-{month}-{day}"
        
        # Pattern 2: YYYY-MM-DD_HHMMSS.jpg
        match = re.search(r'(\d{4})-(\d{2})-(\d{2})_', filename)
        if match:
            year, month, day = match.groups()
            return f"{year}-{month}-{day}"
        
        # Pattern 3: YYYYMMDD_HHMMSS.jpg
        match = re.search(r'(\d{4})(\d{2})(\d{2})_', filename)
        if match:
            year, month, day = match.groups()
            return f"{year}-{month}-{day}"
        
        # Pattern 4: YYYY-MM-DD.jpg
        match = re.search(r'(\d{4})-(\d{2})-(\d{2})\.', filename)
        if match:
            year, month, day = match.groups()
            return f"{year}-{month}-{day}"
        
        # Pattern 5: YYYYMMDD.jpg
        match = re.search(r'(\d{4})(\d{2})(\d{2})\.', filename)
        if match:
            year, month, day = match.groups()
            return f"{year}-{month}-{day}"
        
        # If no date pattern found, use today's date
        return datetime.now().strftime('%Y-%m-%d')
    
    def find_new_images(self) -> List[Tuple[Path, bool]]:
        """Find new images that aren't in photos data files"""
        new_images = []
        
        # Load existing photos
        existing_photos = set()
        
        # Check public photos
        public_file = self.content_dir / "photos-data-public.yaml"
        if public_file.exists():
            with open(public_file, 'r') as f:
                data = yaml.safe_load(f)
                if data and 'photos' in data:
                    for photo in data['photos']:
                        existing_photos.add(photo.get('filename', ''))
        
        # Check members photos
        members_file = self.content_dir / "photos-data-members.yaml"
        if members_file.exists():
            with open(members_file, 'r') as f:
                data = yaml.safe_load(f)
                if data and 'photos' in data:
                    for photo in data['photos']:
                        existing_photos.add(photo.get('filename', ''))
        
        # Find new images
        for subdir in ['public', 'members']:
            subdir_path = self.images_dir / subdir
            if subdir_path.exists():
                is_public = (subdir == 'public')
                for image_file in subdir_path.glob('*.{jpg,jpeg,png,gif,webp}'):
                    if image_file.name not in existing_photos:
                        new_images.append((image_file, is_public))
        
        return new_images
    
    def add_photo_to_yaml(self, entry: Dict, is_public: bool) -> bool:
        """Add photo entry to appropriate YAML file"""
        filename = "photos-data-public.yaml" if is_public else "photos-data-members.yaml"
        file_path = self.content_dir / filename
        
        try:
            # Load existing data
            if file_path.exists():
                with open(file_path, 'r') as f:
                    data = yaml.safe_load(f) or {}
            else:
                data = {'photos': []}
            
            # Ensure photos array exists
            if 'photos' not in data:
                data['photos'] = []
            
            # Add new entry
            data['photos'].append(entry)
            
            # Write back to file
            with open(file_path, 'w') as f:
                yaml.dump(data, f, default_flow_style=False, sort_keys=False)
            
            print(f"✅ Added {entry['filename']} to {filename}")
            return True
            
        except Exception as e:
            print(f"❌ Failed to add photo to {filename}: {e}")
            return False
    
    def run_analysis(self, auto_add: bool = False) -> bool:
        """Run photo analysis for new images"""
        print("🤖 AI Photo Analyzer for YearAway")
        print("=" * 50)
        
        # Load adventures data
        self.adventures_data = self.load_adventures_data()
        print(f"📚 Loaded {len(self.adventures_data)} adventures for context")
        
        # Find new images
        new_images = self.find_new_images()
        
        if not new_images:
            print("✅ No new images found")
            return True
        
        print(f"📸 Found {len(new_images)} new images to analyze:")
        for image_path, is_public in new_images:
            print(f"   📄 {image_path.name} ({'public' if is_public else 'members'})")
        
        success_count = 0
        
        for image_path, is_public in new_images:
            print(f"\n🔍 Analyzing {image_path.name}...")
            
            # Analyze with LLaVA
            analysis = self.analyze_photo_with_llava(image_path)
            if not analysis:
                print(f"❌ Failed to analyze {image_path.name}")
                continue
            
            # Generate YAML entry
            entry = self.generate_yaml_entry(image_path, analysis, is_public)
            
            print(f"📝 Generated entry:")
            print(f"   ID: {entry['id']}")
            print(f"   Caption: {entry['caption']}")
            print(f"   Tags: {entry['tags']}")
            print(f"   Adventure IDs: {entry['adventure_ids']}")
            
            if auto_add:
                if self.add_photo_to_yaml(entry, is_public):
                    success_count += 1
            else:
                print(f"💡 Use --auto-add to automatically add this entry to YAML files")
        
        if auto_add:
            print(f"\n✅ Successfully processed {success_count}/{len(new_images)} images")
        
        return True
    
    def run_analysis_for_specific_images(self, image_paths: List[str], auto_add: bool = False) -> bool:
        """Run photo analysis for specific image paths"""
        print("🤖 AI Photo Analyzer for YearAway (Specific Images)")
        print("=" * 50)
        
        # Load adventures data
        self.adventures_data = self.load_adventures_data()
        print(f"📚 Loaded {len(self.adventures_data)} adventures for context")
        
        success_count = 0
        
        for image_path_str in image_paths:
            image_path = Path(image_path_str)
            
            if not image_path.exists():
                print(f"❌ Image not found: {image_path}")
                continue
            
            # Determine if it's public or members based on path
            is_public = 'public' in str(image_path)
            
            print(f"\n🔍 Analyzing {image_path.name}...")
            
            # Analyze with available LLaVA implementation
            analysis = self.analyze_photo_with_llava(image_path)
            if not analysis:
                print(f"❌ Failed to analyze {image_path.name}")
                continue
            
            # Generate YAML entry
            entry = self.generate_yaml_entry(image_path, analysis, is_public)
            
            print(f"📝 Generated entry:")
            print(f"   ID: {entry['id']}")
            print(f"   Caption: {entry['caption']}")
            print(f"   Tags: {entry['tags']}")
            print(f"   Adventure IDs: {entry['adventure_ids']}")
            print(f"   Directory: {'public' if is_public else 'members'}")
            
            if auto_add:
                if self.add_photo_to_yaml(entry, is_public):
                    success_count += 1
            else:
                print(f"💡 Use --auto-add to automatically add this entry to YAML files")
        
        if auto_add:
            print(f"\n✅ Successfully processed {success_count}/{len(image_paths)} images")
        
        return True

def main():
    parser = argparse.ArgumentParser(description='AI Photo Analyzer for YearAway')
    parser.add_argument('--repo-root', default='.', help='Repository root directory')
    parser.add_argument('--auto-add', action='store_true', 
                       help='Automatically add generated entries to YAML files')
    parser.add_argument('--image-path', action='append', 
                       help='Specific image path to analyze (can be used multiple times)')
    
    args = parser.parse_args()
    
    analyzer = AIPhotoAnalyzer(args.repo_root)
    
    # If specific image paths provided, analyze those instead of looking for new images
    if args.image_path:
        success = analyzer.run_analysis_for_specific_images(args.image_path, auto_add=args.auto_add)
    else:
        success = analyzer.run_analysis(auto_add=args.auto_add)
    
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
