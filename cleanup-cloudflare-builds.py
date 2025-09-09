#!/usr/bin/env python3
"""
Cloudflare Pages Build Cleanup Script
Deletes old builds from Cloudflare Pages, keeping only the most recent develop build.

Requirements:
- cloudflare package: pip install cloudflare
- Cloudflare API token with Zone:Read, Page:Edit permissions
- Set CLOUDFLARE_API_TOKEN environment variable

Usage:
    python cleanup-cloudflare-builds.py
"""

import os
import sys
import json
from datetime import datetime
from cloudflare import Cloudflare

def get_cloudflare_client():
    """Initialize Cloudflare client with API token."""
    api_token = os.getenv('CLOUDFLARE_API_TOKEN')
    if not api_token:
        print("❌ Error: CLOUDFLARE_API_TOKEN environment variable not set")
        print("   Get your API token from: https://dash.cloudflare.com/profile/api-tokens")
        print("   Required permissions: Zone:Read, Page:Edit")
        sys.exit(1)
    
    try:
        cf = Cloudflare(api_token=api_token)
        return cf
    except Exception as e:
        print(f"❌ Error initializing Cloudflare client: {e}")
        sys.exit(1)

def get_pages_project(cf, project_name="yearaway"):
    """Get the Pages project by name."""
    try:
        # Get the yearaway.com zone ID
        zones = cf.zones.list()
        yearaway_zone = None
        for zone in zones:
            if 'yearaway.com' in zone.name:
                yearaway_zone = zone
                break
        
        if not yearaway_zone:
            print("❌ Error: yearaway.com zone not found")
            sys.exit(1)
        
        print(f"✅ Found zone: {yearaway_zone.name} (ID: {yearaway_zone.id})")
        print(f"✅ Found account: {yearaway_zone.account.name} (ID: {yearaway_zone.account.id})")
        
        # List all Pages projects for this account
        projects_response = cf.pages.projects.list(account_id=yearaway_zone.account.id)
        projects = projects_response.data if hasattr(projects_response, 'data') else list(projects_response)
        
        # Find the YearAway project
        for project in projects:
            if project_name.lower() in project.name.lower():
                print(f"✅ Found Pages project: {project.name}")
                return project
        
        print(f"❌ Error: Pages project '{project_name}' not found")
        print("Available projects:")
        for project in projects:
            print(f"  - {project.name}")
        sys.exit(1)
        
    except Exception as e:
        print(f"❌ Error fetching Pages projects: {e}")
        sys.exit(1)

def get_deployments(cf, project_name, account_id):
    """Get all deployments for the project."""
    try:
        deployments_response = cf.pages.projects.deployments.list(project_name, account_id=account_id)
        deployments = list(deployments_response)
        return deployments
    except Exception as e:
        print(f"❌ Error fetching deployments: {e}")
        sys.exit(1)

def filter_develop_builds(deployments):
    """Filter deployments to only include develop branch builds."""
    develop_builds = []
    
    for deployment in deployments:
        # Check if this is a develop branch build
        # In Cloudflare Pages, preview environment = develop branch
        # NEVER delete production builds
        if (hasattr(deployment, 'environment') and deployment.environment == 'preview'):
            develop_builds.append(deployment)
    
    return develop_builds

def sort_deployments_by_date(deployments):
    """Sort deployments by creation date (newest first)."""
    return sorted(deployments, 
                 key=lambda x: x.created_on, 
                 reverse=True)

def delete_deployment(cf, project_name, deployment_id, account_id):
    """Delete a specific deployment."""
    try:
        cf.pages.projects.deployments.delete(deployment_id, account_id=account_id, project_name=project_name)
        return True
    except Exception as e:
        print(f"❌ Error deleting deployment {deployment_id}: {e}")
        return False

def format_date(date_obj):
    """Format datetime object for display."""
    try:
        if isinstance(date_obj, str):
            dt = datetime.fromisoformat(date_obj.replace('Z', '+00:00'))
        else:
            dt = date_obj
        return dt.strftime('%Y-%m-%d %H:%M:%S UTC')
    except:
        return str(date_obj)

def main():
    """Main cleanup function."""
    print("🧹 Cloudflare Pages Build Cleanup")
    print("=" * 50)
    
    # Initialize Cloudflare client
    cf = get_cloudflare_client()
    
    # Get Pages project
    project = get_pages_project(cf)
    project_id = project.id
    project_name = project.name
    
    # Get account ID from zone (we already have this from get_pages_project)
    zones = cf.zones.list()
    yearaway_zone = None
    for zone in zones:
        if 'yearaway.com' in zone.name:
            yearaway_zone = zone
            break
    account_id = yearaway_zone.account.id
    
    print(f"📁 Project: {project_name} (ID: {project_id})")
    
    # Get all deployments
    print("📋 Fetching deployments...")
    all_deployments = get_deployments(cf, project_name, account_id)
    print(f"   Found {len(all_deployments)} total deployments")
    
    # Show production builds (protected)
    production_builds = [d for d in all_deployments if hasattr(d, 'environment') and d.environment == 'production']
    if production_builds:
        print(f"🔒 Found {len(production_builds)} production builds (PROTECTED - will not be deleted)")
        for build in production_builds:
            print(f"   🔒 PROTECTED {build.id[:8]}... - {format_date(build.created_on)} - {getattr(build, 'url', 'N/A')}")
    
    # Filter to develop builds only
    develop_builds = filter_develop_builds(all_deployments)
    print(f"🌿 Found {len(develop_builds)} develop branch builds")
    
    if len(develop_builds) <= 1:
        print("✅ Only one or no develop builds found. Nothing to clean up.")
        return
    
    # Sort by date (newest first)
    develop_builds = sort_deployments_by_date(develop_builds)
    
    # Show current builds
    print("\n📊 Current develop builds:")
    for i, build in enumerate(develop_builds):
        status = "🟢 KEEP" if i == 0 else "🔴 DELETE"
        print(f"   {status} {build.id[:8]}... - {format_date(build.created_on)} - {getattr(build, 'url', 'N/A')}")
    
    # Confirm deletion
    builds_to_delete = develop_builds[1:]  # Keep the first (newest), delete the rest
    print(f"\n🗑️  Will delete {len(builds_to_delete)} old develop builds")
    print("⚠️  Safety: Only deleting OLD preview builds, keeping latest preview and all production builds")
    
    response = input("\nProceed with deletion? (y/N): ").strip().lower()
    if response != 'y':
        print("❌ Deletion cancelled.")
        return
    
    # Delete old builds
    print("\n🗑️  Deleting old builds...")
    deleted_count = 0
    failed_count = 0
    
    for build in builds_to_delete:
        build_id = build.id
        build_date = format_date(build.created_on)
        
        # Safety check: only delete preview builds
        if build.environment != 'preview':
            print(f"   ⚠️  Skipping {build_id[:8]}... (not a preview build - safety check)")
            continue
            
        print(f"   Deleting {build_id[:8]}... ({build_date})", end=" ")
        
        if delete_deployment(cf, project_name, build_id, account_id):
            print("✅")
            deleted_count += 1
        else:
            print("❌")
            failed_count += 1
    
    # Summary
    print(f"\n📊 Cleanup Summary:")
    print(f"   ✅ Deleted: {deleted_count}")
    print(f"   ❌ Failed: {failed_count}")
    print(f"   🟢 Kept: 1 (most recent)")
    
    if deleted_count > 0:
        print(f"\n🎉 Successfully cleaned up {deleted_count} old develop builds!")
    else:
        print(f"\n⚠️  No builds were deleted.")

if __name__ == "__main__":
    main()
