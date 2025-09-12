#!/bin/bash

# Release script for Obsidian Custom Syntax Highlights plugin
# Usage: ./scripts/release.sh [patch|minor|major]

set -e

# Default to patch if no argument provided
BUMP_TYPE=${1:-patch}

echo "🚀 starting release process..."

# check if we're on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "❌ error: must be on main branch to release. currently on: $CURRENT_BRANCH"
    exit 1
fi

# check if working directory is clean
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ error: working directory is not clean. please commit or stash changes."
    git status --short
    exit 1
fi

# pull latest changes
echo "📥 pulling latest changes..."
git pull origin main

# install dependencies
echo "📦 installing dependencies..."
npm ci

# build to ensure everything works
echo "🔨 building project..."
npm run build

# bump version (this runs version-bump.mjs via postversion script)
echo "🔢 bumping version ($BUMP_TYPE)..."
CURRENT_VERSION=$(node -p "require('./package.json').version")
npm version "$BUMP_TYPE" --message "release: %s"

# Get the new version
NEW_VERSION=$(node -p "require('./package.json').version")
echo "✅ version bumped: $CURRENT_VERSION -> $NEW_VERSION"

MANIFEST_VERSION=$(node -p "require('./manifest.json').version")
if [ "$MANIFEST_VERSION" != "$NEW_VERSION" ]; then
    echo "❌ error: manifest version ($MANIFEST_VERSION) does not match package version ($NEW_VERSION)"
    exit 1
fi

# update test vault with new version
echo "🧪 updating test vault with new version..."
npm run test

# ensure tag exists (should be created by npm with no prefix due to .npmrc)
if ! git rev-parse "$NEW_VERSION" >/dev/null 2>&1; then
    echo "⚠️ warning: tag missing, creating annotated tag $NEW_VERSION"
    git tag -a "$NEW_VERSION" -m "$NEW_VERSION"
fi

# push changes and tags
echo "📤 pushing changes and tag $NEW_VERSION..."
git push origin main --follow-tags

echo "🎉 release $NEW_VERSION initiated!"
echo "📋 github actions will automatically:"
echo "   - build the plugin"
echo "   - create a github release"
echo "   - upload main.js, manifest.json, and styles.css"
echo ""
echo "🔗 check the release at: https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\([^.]*\).*/\1/')/releases"
