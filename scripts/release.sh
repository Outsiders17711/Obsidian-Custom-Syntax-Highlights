#!/bin/bash

# Release script for Obsidian Custom Syntax Highlights plugin
# Usage: ./scripts/release.sh [patch|minor|major]

set -e

# Default to patch if no argument provided
BUMP_TYPE=${1:-patch}

echo "🚀 Starting release process..."

# Check if we're on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "❌ Error: Must be on main branch to release. Currently on: $CURRENT_BRANCH"
    exit 1
fi

# Check if working directory is clean
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ Error: Working directory is not clean. Please commit or stash changes."
    git status --short
    exit 1
fi

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run tests/build to ensure everything works
echo "🔨 Building project..."
npm run build

# Bump version (this runs version-bump.mjs via postversion script)
echo "🔢 Bumping version ($BUMP_TYPE)..."
npm version $BUMP_TYPE

# Get the new version
NEW_VERSION=$(node -p "require('./package.json').version")
echo "✅ Version bumped to: $NEW_VERSION"

# Push changes and tags
echo "📤 Pushing changes and tags..."
git push origin main
git push origin "v$NEW_VERSION"

echo "🎉 Release $NEW_VERSION initiated!"
echo "📋 GitHub Actions will automatically:"
echo "   - Build the plugin"
echo "   - Create a GitHub release"
echo "   - Upload main.js, manifest.json, and styles.css"
echo ""
echo "🔗 Check the release at: https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\([^.]*\).*/\1/')/releases"
