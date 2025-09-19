# Cloudflare Pages Build Cleanup

This script helps manage Cloudflare Pages builds by automatically deleting old develop branch builds, keeping only the most recent one.

## Why Use This?

- **Storage Management**: Prevents build storage from growing indefinitely
- **Cost Control**: Reduces Cloudflare Pages storage costs
- **Clean Environment**: Keeps only the latest develop build for testing

## Setup

### 1. Get Cloudflare API Token

1. Go to [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Click "Create Token"
3. Use "Custom token" template
4. Set permissions:
   - **Zone**: `Zone:Read`
   - **Page**: `Page:Edit`
5. Set zone resources to "Include - All zones" (or specific zone)
6. Copy the generated token

### 2. Set Environment Variable

```bash
export CLOUDFLARE_API_TOKEN='your-token-here'
```

Or add to your shell profile (`~/.bashrc`, `~/.zshrc`, etc.):

```bash
echo 'export CLOUDFLARE_API_TOKEN="your-token-here"' >> ~/.bashrc
source ~/.bashrc
```

## Usage

### Option 1: Shell Script (Recommended)

```bash
./cleanup-builds.sh
```

This will:
- Create a virtual environment
- Install dependencies
- Run the cleanup script
- Handle all setup automatically

### Option 2: Manual Python

```bash
# Install dependencies
pip install -r requirements.txt

# Run script
python3 cleanup-cloudflare-builds.py
```

## What It Does

1. **Connects** to Cloudflare API using your token
2. **Finds** the YearAway Pages project
3. **Lists** all develop branch builds
4. **Shows** which builds will be kept vs deleted
5. **Asks** for confirmation before deletion
6. **Deletes** old builds, keeping only the most recent
7. **Reports** success/failure summary

## Safety Features

- ✅ **Confirmation Required**: Always asks before deleting
- ✅ **Preview Mode**: Shows what will be deleted before doing it
- ✅ **Error Handling**: Graceful failure with clear error messages
- ✅ **Dry Run**: Shows all builds before any deletion
- ✅ **Selective**: Only targets develop branch builds

## Example Output

```
🧹 Cloudflare Pages Build Cleanup
==================================================
✅ Found Pages project: yearaway
📁 Project: yearaway (ID: abc123...)
📋 Fetching deployments...
   Found 15 total deployments
🌿 Found 8 develop branch builds

📊 Current develop builds:
   🟢 KEEP abc12345... - 2025-01-15 14:30:22 UTC - https://develop.yearaway.pages.dev
   🔴 DELETE def67890... - 2025-01-15 12:15:10 UTC - https://abc123-def67890.pages.dev
   🔴 DELETE ghi11111... - 2025-01-15 10:45:33 UTC - https://abc123-ghi11111.pages.dev
   ...

🗑️  Will delete 7 old develop builds

Proceed with deletion? (y/N): y

🗑️  Deleting old builds...
   Deleting def67890... (2025-01-15 12:15:10 UTC) ✅
   Deleting ghi11111... (2025-01-15 10:45:33 UTC) ✅
   ...

📊 Cleanup Summary:
   ✅ Deleted: 7
   ❌ Failed: 0
   🟢 Kept: 1 (most recent)

🎉 Successfully cleaned up 7 old develop builds!
```

## Troubleshooting

### "Pages project not found"
- Check that your project name contains "yearaway"
- Verify your API token has Page:Edit permission

### "Authentication failed"
- Verify your API token is correct
- Check token permissions include Zone:Read and Page:Edit

### "No develop builds found"
- This is normal if you only have one develop build
- The script will exit gracefully

## Files Created

- `cleanup-cloudflare-builds.py` - Main Python script
- `cleanup-builds.sh` - Shell wrapper script
- `CLOUDFLARE_CLEANUP_README.md` - This documentation
- Updated `requirements.txt` - Added cloudflare dependency

## Automation

You can run this script automatically:

```bash
# Add to cron for weekly cleanup (Sundays at 2 AM)
0 2 * * 0 cd /path/to/YearAway && ./cleanup-builds.sh
```

Or add to your CI/CD pipeline to run after successful deployments.
