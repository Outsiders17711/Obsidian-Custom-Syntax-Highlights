# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
### Changed
### Deprecated
### Removed
### Fixed
### Security

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
