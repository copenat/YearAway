# YearAway Validation Scripts

## validate-yaml.py

A comprehensive YAML validation script for the YearAway project that checks:

### Features

1. **YAML Format Validation**
   - Validates syntax and structure of all YAML files
   - Reports parsing errors with line numbers

2. **Git Integration**
   - Detects newly added/changed files via `git diff`
   - Identifies new images added to the repository
   - Validates that new images are properly referenced

3. **Cross-Reference Validation**
   - Ensures new images are added to `photos-data-*.yaml` files
   - Validates that photo tags will make photos appear in adventure entries
   - Checks tag matching between photos and adventures

4. **Data Structure Validation**
   - Validates required fields in tips, adventures, and photos data
   - Checks data types and value ranges (e.g., ratings 1-5)
   - Validates date formats (YYYY-MM-DD)

5. **Category Counts Validation**
   - Validates structure of `tips-category-counts.yaml`
   - Ensures all required fields are present

### Usage

```bash
# Basic validation (run from project root)
python3 and-now/content/bin/validate-yaml.py

# With custom repository root
python3 and-now/content/bin/validate-yaml.py --repo-root /path/to/YearAway

# Exit with error code if validation fails (useful for CI/CD)
python3 and-now/content/bin/validate-yaml.py --exit-on-error
```

### Example Output

```
🔍 YearAway YAML Validation
==================================================
📁 Found 3 changed files
📄 Validating 9 YAML files...
✅ YAML format valid: photos-data-public.yaml
✅ YAML format valid: tips-data-public.yaml
✅ Photo asia-trip-1.jpg will appear in adventures: Planning a trip to Asia
⚠️  WARNING: Photo family-1.jpg tags don't match any adventure tags

📊 Validation Summary
==============================
✅ Errors: 0
⚠️  Warnings: 1
```

### Integration with Git Hooks

You can add this script to your git pre-commit hook:

```bash
#!/bin/sh
# .git/hooks/pre-commit
python3 and-now/content/bin/validate-yaml.py --exit-on-error
```

### Integration with GitHub Actions

Add to your workflow:

```yaml
- name: Validate YAML files
  run: python3 and-now/content/bin/validate-yaml.py --exit-on-error
```
