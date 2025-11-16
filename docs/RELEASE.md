# Release Process

## Quick Commands

```bash
# Patch release (0.1.0 → 0.1.1)
npm run release:patch

# Minor release (0.1.0 → 0.2.0)  
npm run release:minor

# Major release (0.1.0 → 1.0.0)
npm run release:major
```

## What Happens Automatically

1. **Checks**
   - Verifies the release is running on the `main` branch.
   - Ensures the working directory is clean (no uncommitted changes).
   - Runs strict lint checks to prevent warnings or errors.
   - Pulls the latest changes from the remote `main` branch.

2. **Build & Stage**
   - Installs exact dependencies with `npm ci`.
   - Builds the plugin and generates production files.
   - Copies the new build files into the test vault.
   - Stages the test vault updates for the release commit.

3. **Version & Commit**
   - Bumps the version in `package.json`, `manifest.json`, and `versions.json`.
   - Commits all staged changes with a `release: <version>` message.
   - Creates a git tag for the new version (e.g., `0.6.0`).

4. **Push & Deploy**
   - Pushes the release commit and the new tag to the remote repository.
   - Triggers a GitHub Action that builds and uploads release assets.

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
