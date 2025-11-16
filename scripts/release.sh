#!/bin/bash

# release script for obsidian custom syntax highlights plugin
# usage: ./scripts/release.sh [patch|minor|major]
# usage: npm run release:patch|minor|major

set -e  # exit on error

# check if a bump type is provided
if [ -z "$1" ]; then
    echo "❌ error: no release type specified; usage: $0 [patch|minor|major]"
    exit 1
fi
bumpType=$1

# get plugin id from manifest.json
pluginID=$(node -p "require('./manifest.json').id")
echo "🚀 starting $bumpType release process for $pluginID..."

# check if we're on main branch
gitBranch=$(git branch --show-current)
if [ "$gitBranch" != "main" ]; then
    echo "❌ error: must be on main branch to release; currently on: $gitBranch"
    exit 1
fi

# check if working directory is clean
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ error: working directory is not clean; please commit or stash changes."
    git status --short
    exit 1
fi

# run strict lint checks before releasing
echo -n "🔍 running lint checks... "
if ! npm run lint:check >/dev/null 2>&1; then
    echo ""
    echo "❌ error: linting failed; please run 'npm run lint' to see errors."
    exit 1
fi

# pull latest changes
echo -n "📥 pulling latest changes... "
git pull origin main

# install dependencies
echo "📦 installing dependencies..."
npm ci --silent

# build to ensure everything works
echo -n "🔨 building project... "
npm run build --silent

# update test vault as part of release process
echo "🧪 updating test vault..."
npm run test:nobuild --silent
git add tests/cshVault/.obsidian/plugins/$pluginID/

# bump version (this runs version-bump.mjs via postversion script)
echo -n "🔢 bumping version ($bumpType)... "
currentVersion=$(node -p "require('./package.json').version")
npm version "$bumpType" --message "release: %s"

# get the new version; assert it matches manifest
newVersion=$(node -p "require('./package.json').version")
echo "✅ version bumped: $currentVersion -> $newVersion"

manifestVersion=$(node -p "require('./manifest.json').version")
if [ "$manifestVersion" != "$newVersion" ]; then
    echo "❌ error: manifest version ($manifestVersion) does not match package version ($newVersion)"
    exit 1
fi

# ensure tag exists (should be created by npm with no prefix due to .npmrc)
if ! git rev-parse "$newVersion" >/dev/null 2>&1; then
    echo "⚠️ warning: tag missing; creating annotated tag $newVersion"
    git tag -a "$newVersion" -m "$newVersion"
fi

# push changes and tags
echo "📤 pushing changes and tag $newVersion..."
git push origin main --follow-tags

echo -n "🎉 release $newVersion initiated! "
echo "📋 github actions will automatically:"
echo " >> build the plugin >> create a github release >> upload {main.js, manifest.json, styles.css}"
echo "🔗 check the release at: https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\([^.]*\).*/\1/')/releases"
