# Custom Syntax Highlights

[![Release](https://img.shields.io/github/v/release/Outsiders17711/Obsidian-Custom-Syntax-Highlights)](https://github.com/Outsiders17711/Obsidian-Custom-Syntax-Highlights/releases)
[![License](https://img.shields.io/github/license/Outsiders17711/Obsidian-Custom-Syntax-Highlights)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D16-brightgreen)](https://nodejs.org/)

An Obsidian plugin that displays files with custom extensions as syntax-highlighted code blocks in reading view, with configurable extension-to-language mappings.

## Features

- **Custom Extension Mapping**: Configure any file extension to display with specific syntax highlighting
- **Auto-Switch to Reading View**: Automatically switch configured file extensions to reading view when opened
- **Flexible Language Support**: Map extensions to any supported syntax highlighting language
- **Clean Display**: Files are rendered as single, properly formatted code blocks

## Configuration

### Extension Mappings

In the plugin settings, you can configure extension-to-language mappings:

- **Extension**: The file extension (without the dot)
- **Language**: The syntax highlighting language to use (leave empty to use the extension name)

### Examples

| Extension | Language     | Result                                                                  |
| --------- | ------------ | ----------------------------------------------------------------------- |
| `tex`     | _(empty)_    | LaTeX files with TeX syntax highlighting                                |
| `json`    | _(empty)_    | JSON files with JSON syntax highlighting                                |
| `bib`     | `ini`        | Bibliography files with INI-style highlighting                          |
| `py`      | `python`     | Python files with Python syntax highlighting                            |
| `js`      | `javascript` | JavaScript files with JavaScript highlighting                           |
| `txt`     | `md`         | Text files treated as markdown (normal editing, no syntax highlighting) |

### Important Notes

- **Markdown files (`.md`)**: Not supported as they're handled natively by Obsidian
- **Enable normal editing**: Set the language to `md` or `markdown` for any non-native extension to allow normal editing and disable both syntax highlighting and auto-switch to reading view

### Settings

- **Auto-switch to reading view**: Toggle whether files with configured extensions should automatically open in reading view

## Installation

### Manual Installation
1. Download the latest release from [GitHub Releases](https://github.com/Outsiders17711/Obsidian-Custom-Syntax-Highlights/releases)
2. Extract `main.js`, `manifest.json`, and `styles.css` to your vault's `.obsidian/plugins/custom-syntax-highlights/` directory
3. Reload Obsidian and enable the plugin in Settings → Community plugins

### Development Installation
1. Clone this repo to your vault's `.obsidian/plugins/custom-syntax-highlights/` directory
2. Run `npm install` to install dependencies
3. Run `npm run dev` to start compilation in watch mode
4. Enable the plugin in Obsidian settings

## Usage

1. Configure extension mappings in Settings → Community plugins → Custom File Extensions
2. Open any file with a configured extension
3. The file will automatically switch to reading view (if enabled) and display as a syntax-highlighted code block

## Inspiration

This plugin was inspired by and built upon:
- [MeepTech/obsidian-custom-file-extensions-plugin](https://github.com/MeepTech/obsidian-custom-file-extensions-plugin)
- The original LaTeX Syntax Highlight functionality

**Note**: This plugin initially depended on the MeepTech plugin, which allows non-markdown files to be opened in Obsidian as text files. We then added syntax highlighting on top of that foundation. However, this plugin now implements the same file extension registration logic directly, making it a complete 2-in-1 solution - you no longer need the MeepTech plugin as a dependency.

## Development

### Building
- **Development**: `npm run dev` - starts watch mode for development
- **Production**: `npm run build` - creates optimized build for release

### Version Management
- **Bump version**: `npm version patch|minor|major` - automatically updates manifest.json and versions.json
- Requires Node.js 16+ and npm

### Release Process
1. Update `minAppVersion` in `manifest.json` if needed
2. Run `npm version patch` (or `minor`/`major`)
3. Create GitHub release with exact version number (no `v` prefix)
4. Upload `main.js`, `manifest.json`, and `styles.css` as release assets

## License

MIT License
