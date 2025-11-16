# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
### Changed
### Removed
### Fixed

## [0.5.3] - 2025-11-16

### Fixed
- Make sure to push only the new tag created during release process.
- Fix test vault update during release to use correct version number.

## [0.5.2] - 2025-11-16

### Changed
- Updated test script for robustness; now builds plugin before testing by default.
- Updated release script for robustness; now requires explicit release type argument, runs lint checks before releasing and updates test vault as part of release process.
- Updated `package.json` scripts and documentation to reflect changes in test and release scripts.

## [0.5.1] - 2025-11-16

### Fixed
- Resolved ESLint errors flagged by Obsidian plugin review.
- Removed async from method where unnecessary to comply with linting rules.

## [0.5.0] - 2025-11-15

### Added
- Installed ESLint as new devDependencies for improved linting and code quality.
- Installed `globals` package to provide global type definitions for better TypeScript support.
- Added `.gitattributes` to enforce consistent line endings.

### Changed
- Upgraded TypeScript to ^5.4.5 and upgraded other dependencies for compatibility with ESLint.

### Removed
- Removed `.eslintignore` file and moved ignore rules into `eslint.config.js`.

### Fixed
- Updated release script to commit changes to the plugin in the test vault with new releases
- Resolved all ESLint errors to improve code quality and stability.
- Refactored rendering logic to prevent potential memory leaks.

## [0.4.0] - 2025-09-13

### Added
- Demo images for source/reading modes from extension-language combinations in test vault

### Changed
- Moved style assignments from JavaScript into CSS for easier compatibility with themes and snippets

### Fixed
- Updated release and test script logic so test vault has the current version number
- Addressed Obsidian plugin review feedback regarding JavaScript-assigned styles

## [0.3.0] - 2025-09-12

### Added
- Improved extension validation to allow underscores in extension names
- Test file `test.ffs_batch` for FreeFileSync config syntax highlighting
- `.npmrc` configuration for clean version tags without prefix

### Changed  
- Enhanced release scripts with better error handling and version validation
- Updated test script to use production build instead of development mode

## [0.2.3] - 2025-09-12
- Fixed git tag format to match Obsidian plugin requirements (removed "v" prefix from tags)
- Updated GitHub Actions workflow to handle tags without prefix

## [0.2.2] - 2025-09-12
- Fixed GitHub release title format to match Obsidian plugin requirements (removed "Release" prefix)

## [0.2.1] - 2025-09-12
- Fixed missing dependencies lock file for GitHub Actions

## [0.2.0] - 2025-09-12

### Added
- Complete automated release workflow with GitHub Actions
- Release scripts for patch/minor/major version bumping
- Comprehensive documentation in `docs/` folder
- Streamlined README with better user flow
- Version validation and changelog integration in releases

### Changed
- Moved CHANGELOG.md to docs/ folder for better organization
- Restructured README for improved readability and flow
- Updated all documentation references to new locations
- Refactored plugin into focused, modular components

## [0.1.0] - 2025-09-11

### Added
- **MAJOR REWRITE**: Expanded from LaTeX-only to multi-extension support
- Support for any custom file extension with configurable syntax highlighting
- Settings interface for extension-to-language mappings
- Auto-switch to reading view for configured extensions
- DOM cleanup and memory management with WeakSet tracking
- Support for .tex, .json, .yaml, .bib, and other file types

### Changed
- **Plugin renamed**: `LaTeX Syntax Highlight` → `Custom Syntax Highlights`
- **Plugin ID changed**: `latex-syntax-highlight` → `custom-syntax-highlights`
- **Scope expanded**: From LaTeX-only to any file extension
- **Mode simplified**: Reading view only (eliminated broken editing mode)

### Fixed
- Proper TypeScript strict mode compliance
- Settings migration for legacy configurations

## [Pre-0.1.0] - LaTeX Syntax Highlight Era

- **Plugin Name**: `LaTeX Syntax Highlight`
- **Plugin ID**: `latex-syntax-highlight`
- **Scope**: LaTeX files only (.tex)
- **Features**: Attempted syntax highlighting in both editing and reading modes
- **Issues**: Editing mode was broken, limited to single file type
- **Description**: "Apply syntax highlighting to LaTeX code blocks in Obsidian using Codemirror (for editing) and hacking the internal Markdown renderer for tex code blocks (for preview)."
