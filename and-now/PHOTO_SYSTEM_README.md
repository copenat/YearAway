# YearAway Photo System Documentation

## Overview

The YearAway photo system allows you to link photos to diary entries (adventures) using a flexible tag-based approach. Photos are stored in GitHub directories and linked to adventures through YAML metadata files.

## Directory Structure

```
and-now/
└── content/
    ├── images/
    │   ├── adventures/          # Public adventure photos
    │   │   ├── asia-trip-1.jpg
    │   │   ├── asia-trip-2.jpg
    │   │   └── planning-1.jpg
    │   └── members/             # Members-only photos
    │       ├── family-1.jpg
    │       └── private-1.jpg
    ├── photos-data-public.yaml
    └── photos-data-members.yaml
```

## How to Add Photos

### 1. Upload Photos to GitHub

Upload your photos to the appropriate directory:
- **Public photos**: `and-now/content/images/adventures/`
- **Members-only photos**: `and-now/content/images/members/`

### 2. Add Photo Metadata

Add photo information to the appropriate YAML file:

#### For Public Photos (`photos-data-public.yaml`):
```yaml
photos:
  - id: unique-photo-id
    filename: "your-photo.jpg"
    path: "content/images/adventures/"
    caption: "Description of the photo"
    date: "2025-09-10"
    tags: [tag1, tag2, tag3]
    adventure_ids: ["adventure-id-1", "adventure-id-2"]
    isPublic: true
    featured: false
```

#### For Members-Only Photos (`photos-data-members.yaml`):
```yaml
photos:
  - id: unique-photo-id
    filename: "your-photo.jpg"
    path: "content/images/members/"
    caption: "Description of the photo"
    date: "2025-09-10"
    tags: [tag1, tag2, tag3]
    adventure_ids: ["adventure-id-1"]
    isPublic: false
    featured: true
```

## Photo Metadata Fields

| Field | Required | Description |
|-------|----------|-------------|
| `id` | Yes | Unique identifier for the photo |
| `filename` | Yes | Name of the image file |
| `path` | Yes | Directory path relative to and-now/ |
| `caption` | Yes | Description/caption for the photo |
| `date` | Yes | Date the photo was taken (YYYY-MM-DD) |
| `tags` | Yes | Array of tags for flexible linking |
| `adventure_ids` | Yes | Array of adventure IDs this photo is linked to |
| `isPublic` | Yes | `true` for public, `false` for members-only |
| `featured` | No | `true` to mark as featured photo |

## Linking Photos to Adventures

Photos are linked to adventures in two ways:

### 1. Direct Linking (Recommended)
Use the `adventure_ids` field to directly link photos to specific adventures:
```yaml
adventure_ids: ["planning-a-trip-to-asia", "site-development"]
```

### 2. Tag-Based Linking (Fallback)
If no direct links are found, the system will look for photos with matching tags:
```yaml
tags: [asia, planning, china, thailand, laos, india, travel]
```

## Example Workflow

### Step 1: Create an Adventure
In `adventures-data-public.yaml`:
```yaml
adventures:
  - id: planning-a-trip-to-asia
    title: Planning a trip to Asia
    description: |
      We are currently planning a trip to Asia, specifically China, Thailand, Laos and finally India.
    date: "2025-09-10"
    category: Travel
    tags: [asia, china, thailand, laos, india, travel, culture, food-dining]
    status: active
```

### Step 2: Upload Photos
Upload photos to `and-now/content/images/adventures/`:
- `asia-trip-1.jpg`
- `asia-trip-2.jpg`

### Step 3: Add Photo Metadata
In `photos-data-public.yaml`:
```yaml
photos:
  - id: asia-planning-1
    filename: "asia-trip-1.jpg"
    path: "content/images/adventures/"
    caption: "Researching destinations for our Asia trip"
    date: "2025-09-10"
    tags: [asia, planning, china, thailand, laos, india, travel]
    adventure_ids: ["planning-a-trip-to-asia"]
    isPublic: true
    featured: false

  - id: asia-planning-2
    filename: "asia-trip-2.jpg"
    path: "content/images/adventures/"
    caption: "Booking flights and accommodations"
    date: "2025-09-12"
    tags: [asia, planning, booking, travel, logistics]
    adventure_ids: ["planning-a-trip-to-asia"]
    isPublic: true
    featured: true
```

### Step 4: View Results
The photos will automatically appear in the adventure entry on the adventures page, with proper authentication handling for members-only content.

## Best Practices

1. **Use descriptive filenames**: `asia-trip-planning-1.jpg` instead of `IMG_001.jpg`
2. **Consistent tagging**: Use the same tags across photos and adventures for better linking
3. **Direct linking preferred**: Use `adventure_ids` for precise control over photo placement
4. **Organize by content**: Use the `content/images/adventures/` directory for public content, `content/images/members/` for private
5. **Featured photos**: Mark your best photos as `featured: true` for special display

## Authentication Integration

The photo system automatically integrates with the YearAway authentication system:
- **Public photos**: Visible to all visitors
- **Members-only photos**: Only visible to authenticated members
- **Mixed content**: Adventures can show both public and members-only photos based on user authentication status

## Technical Details

- Photos are loaded via the `PhotosManager` JavaScript class
- Integration with `AdventuresManager` for automatic display
- Responsive grid layout with hover effects
- Lazy loading for performance
- Tag-based fallback linking system

## Troubleshooting

### Photos Not Showing
1. Check that the photo file exists in the correct directory
2. Verify the `path` field matches the actual directory structure
3. Ensure the `adventure_ids` match existing adventure IDs
4. Check browser console for JavaScript errors

### Members-Only Photos Not Visible
1. Verify user is authenticated (check auth status in header)
2. Ensure `isPublic: false` in photo metadata
3. Check that photo is in `photos-data-members.yaml`

### Tag Linking Not Working
1. Ensure tags match exactly between photos and adventures
2. Check for typos in tag names
3. Verify tags are in array format: `[tag1, tag2, tag3]`
