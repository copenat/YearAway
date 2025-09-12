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
        """Analyze photo using Ollama LLaVA model"""
        try:
            system_prompt = self.get_llava_system_prompt()
            
            # Create a temporary prompt file
            import tempfile
            with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as f:
                f.write(system_prompt)
                prompt_file = f.name
            
            # Run Ollama with LLaVA
            cmd = [
                'ollama', 'run', 'llava',
                '--image', str(image_path),
                '--prompt', f'@{prompt_file}'
            ]
            
            print(f"🤖 Analyzing {image_path.name} with Ollama LLaVA...")
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
            
            # Clean up temp file
            os.unlink(prompt_file)
            
            if result.returncode == 0:
                # Parse JSON response from Ollama
                response_text = result.stdout.strip()
                # Extract JSON from response (Ollama might add extra text)
                try:
                    # Look for JSON in the response
                    import re
                    json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
                    if json_match:
                        response = json.loads(json_match.group())
                        return response
                    else:
                        print(f"❌ No JSON found in Ollama response: {response_text}")
                        return None
                except json.JSONDecodeError as e:
                    print(f"❌ Failed to parse Ollama JSON response: {e}")
                    print(f"Raw response: {response_text}")
                    return None
            else:
                print(f"❌ Ollama analysis failed: {result.stderr}")
                return None
                
        except subprocess.TimeoutExpired:
            print(f"❌ Ollama analysis timed out for {image_path.name}")
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
        
        # Create YAML entry
        entry = {
            'id': analysis.get('id', filename.replace('.', '-').lower()),
            'filename': filename,
            'path': relative_path,
            'caption': analysis.get('caption', ''),
            'date': datetime.now().strftime('%Y-%m-%d'),
            'tags': analysis.get('tags', []),
            'adventure_ids': analysis.get('adventure_ids', []),
            'isPublic': is_public,
            'featured': False
        }
        
        return entry
    
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

def main():
    parser = argparse.ArgumentParser(description='AI Photo Analyzer for YearAway')
    parser.add_argument('--repo-root', default='.', help='Repository root directory')
    parser.add_argument('--auto-add', action='store_true', 
                       help='Automatically add generated entries to YAML files')
    
    args = parser.parse_args()
    
    analyzer = AIPhotoAnalyzer(args.repo_root)
    success = analyzer.run_analysis(auto_add=args.auto_add)
    
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
