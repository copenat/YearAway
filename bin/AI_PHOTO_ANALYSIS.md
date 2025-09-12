# AI Photo Analysis for YearAway

This feature automatically analyzes new photos and generates YAML entries using a local AI model (LLaVA).

## 🎯 **What it does**

When you add a new photo to `and-now/content/images/`, the AI analyzer will:

1. **Detect new images** in both `public/` and `members/` directories
2. **Analyze photos** using LLaVA (Large Language and Vision Assistant)
3. **Generate YAML entries** with:
   - **Caption**: Short, descriptive text
   - **ID**: Unique identifier (kebab-case)
   - **Tags**: Relevant keywords (5-10 tags)
   - **Adventure IDs**: Suggested matches from existing adventures

## 🚀 **Quick Start**

### 1. Install LLaVA
```bash
# Install LLaVA CLI (follow official installation guide)
# https://github.com/haotian-liu/LLaVA
```

### 2. Add a new photo
```bash
# Copy your photo to the appropriate directory
cp my-photo.jpg and-now/content/images/public/
# or
cp my-photo.jpg and-now/content/images/members/
```

### 3. Run AI analysis
```bash
# Analyze and show suggestions (dry run)
./bin/analyze-photos.sh

# Analyze and automatically add to YAML files
./bin/analyze-photos.sh --auto-add
```

## 📋 **Usage Examples**

### Basic Analysis
```bash
./bin/analyze-photos.sh
```
Shows AI-generated suggestions without modifying files.

### Auto-Add to YAML
```bash
./bin/analyze-photos.sh --auto-add
```
Automatically adds generated entries to `photos-data-public.yaml` or `photos-data-members.yaml`.

### Verbose Output
```bash
./bin/analyze-photos.sh --verbose --auto-add
```
Shows detailed information about the analysis process.

## 🤖 **How the AI Analysis Works**

### System Prompt
The AI receives a comprehensive prompt that includes:
- **Task description**: Analyze travel/lifestyle photos
- **Output format**: Structured JSON response
- **Available adventures**: List of existing adventures for ID suggestions
- **Guidelines**: Specific instructions for captions, IDs, tags, etc.

### Example AI Response
```json
{
    "caption": "Beautiful sunset over a tropical beach with palm trees",
    "id": "sunset-beach-tropical",
    "tags": ["sunset", "beach", "tropical", "palm-trees", "travel", "vacation", "nature"],
    "adventure_ids": ["beach-vacation-2024", "tropical-getaway"]
}
```

### Generated YAML Entry
```yaml
- id: sunset-beach-tropical
  filename: "sunset-beach.jpg"
  path: "content/images/public/"
  caption: "Beautiful sunset over a tropical beach with palm trees"
  date: "2025-01-12"
  tags: [sunset, beach, tropical, palm-trees, travel, vacation, nature]
  adventure_ids: ["beach-vacation-2024", "tropical-getaway"]
  isPublic: true
  featured: false
```

## 🔧 **Integration with Validation**

The main validation script (`validate-yaml.sh`) now detects new images and suggests running the AI analyzer:

```
🖼️  Found 2 new images: ['beach-sunset.jpg', 'mountain-hike.jpg']

🤖 AI Photo Analysis Available:
   Run: ./bin/ai-photo-analyzer.py --auto-add
   This will analyze new images and generate YAML entries automatically
```

## 📁 **File Structure**

```
bin/
├── ai-photo-analyzer.py      # Main AI analysis script
├── analyze-photos.sh         # Shell wrapper with enhanced features
├── validate-yaml.py          # Updated to suggest AI analysis
└── AI_PHOTO_ANALYSIS.md      # This documentation
```

## ⚙️ **Configuration**

### LLaVA Model Requirements
- **Model**: LLaVA (Large Language and Vision Assistant)
- **CLI Tool**: `llava-cli` must be available in PATH
- **Format**: JSON output support required
- **Timeout**: 60 seconds per image analysis

### Directory Structure
```
and-now/content/images/
├── public/                   # Public images (visible to everyone)
│   ├── beach-sunset.jpg
│   └── city-street.jpg
└── members/                  # Members-only images
    ├── family-photo.jpg
    └── private-event.jpg
```

## 🛠️ **Troubleshooting**

### LLaVA Not Found
```
❌ LLaVA CLI not found. Please install LLaVA or use alternative model.
```
**Solution**: Install LLaVA following the official installation guide.

### Analysis Timeout
```
❌ LLaVA analysis timed out for large-photo.jpg
```
**Solution**: Try with smaller images or increase timeout in the script.

### JSON Parse Error
```
❌ Failed to parse LLaVA response: Expecting value
```
**Solution**: Check LLaVA model output format. Ensure JSON mode is enabled.

## 🎨 **Customization**

### Modify System Prompt
Edit the `get_llava_system_prompt()` method in `ai-photo-analyzer.py` to:
- Change caption style
- Adjust tag requirements
- Modify ID generation rules
- Update adventure matching logic

### Add Alternative Models
The script can be extended to support other vision-language models:
- GPT-4V
- Claude Vision
- Local alternatives to LLaVA

## 🔄 **Workflow Integration**

### Pre-commit Hook
The validation script runs automatically on commit and suggests AI analysis for new images.

### Manual Workflow
1. Add photos to appropriate directories
2. Run `./bin/analyze-photos.sh --auto-add`
3. Review generated entries
4. Commit changes

### Batch Processing
```bash
# Process all new images at once
./bin/analyze-photos.sh --auto-add --verbose
```

## 📊 **Benefits**

- ✅ **Automated metadata generation** - No manual caption writing
- ✅ **Consistent tagging** - AI ensures relevant, comprehensive tags
- ✅ **Smart adventure linking** - Suggests relevant adventure connections
- ✅ **Time saving** - Reduces manual YAML entry creation
- ✅ **Quality consistency** - Standardized format and style
- ✅ **Integration ready** - Works seamlessly with existing validation

This AI-powered feature transforms photo management from a manual, time-consuming task into an automated, intelligent process! 🚀
