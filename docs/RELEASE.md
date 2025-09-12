# Release Process

## Quick Commands

```bash
# Patch release (0.1.0 → 0.1.1)
npm run release

# Minor release (0.1.0 → 0.2.0)  
npm run release:minor

# Major release (0.1.0 → 1.0.0)
npm run release:major
```

## What Happens Automatically

1. **Pre-checks**
   - Validates on main branch
   - Ensures clean working directory
   - Pulls latest changes

2. **Build & Test**
   - Installs dependencies (`npm ci`)
   - Builds plugin (`npm run build`)
   - Validates TypeScript compilation

3. **Version Management**
   - Bumps version in `package.json`
   - Updates `manifest.json` via `version-bump.mjs`
   - Updates `versions.json` with compatibility info
   - Creates git commit with version changes

4. **Git Operations**
   - Pushes changes to main branch
   - Creates and pushes version tag (e.g., `v0.1.1`)

5. **GitHub Release** (via Actions)
   - Validates tag version matches manifest (handles 'v' prefix)
   - Extracts changelog section for release notes
   - Creates GitHub release with proper formatting
   - Uploads required Obsidian plugin files:
     - `main.js` (bundled plugin code)
     - `manifest.json` (plugin metadata)
     - `styles.css` (plugin styles)

## Manual Release Alternative

```bash
# Traditional approach
npm version patch
git push origin main
git push origin v$(node -p "require('./package.json').version")
```

## Troubleshooting

**"Not on main branch"**: Switch to main and pull latest
```bash
git checkout main
git pull origin main
```

**"Working directory not clean"**: Commit or stash changes
```bash
git add .
git commit -m "prepare for release"
# OR
git stash
```

**"GitHub Actions failed"**: Check the Actions tab on GitHub for build logs

## Changelog Maintenance

Update `docs/CHANGELOG.md` before releases to provide better release notes:
```markdown
## [Unreleased]
### Added
- New feature descriptions
### Fixed  
- Bug fix descriptions
```

The GitHub release will automatically use the changelog section for the released version.
