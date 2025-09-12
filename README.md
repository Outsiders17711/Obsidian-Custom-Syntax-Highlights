# Custom File Extensions Plugin

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

| Extension | Language     | Result                                         |
| --------- | ------------ | ---------------------------------------------- |
| `tex`     | _(empty)_    | LaTeX files with TeX syntax highlighting       |
| `json`    | _(empty)_    | JSON files with JSON syntax highlighting       |
| `bib`     | `ini`        | Bibliography files with INI-style highlighting |
| `py`      | `python`     | Python files with Python syntax highlighting   |
| `js`      | `javascript` | JavaScript files with JavaScript highlighting  |

### Settings

- **Auto-switch to reading view**: Toggle whether files with configured extensions should automatically open in reading view

## Installation

1. Copy the plugin files to your vault's `.obsidian/plugins/custom-file-extensions/` directory
2. Enable the plugin in Obsidian's Community Plugins settings
3. Configure your desired extension mappings in the plugin settings

## Usage

1. Configure extension mappings in Settings → Community plugins → Custom File Extensions
2. Open any file with a configured extension
3. The file will automatically switch to reading view (if enabled) and display as a syntax-highlighted code block

## Inspiration

This plugin was inspired by and built upon:
- [MeepTech/obsidian-custom-file-extensions-plugin](https://github.com/MeepTech/obsidian-custom-file-extensions-plugin)
- The original LaTeX Syntax Highlight functionality

## Development

- Build: `npm run build`
- Dev (watch): `npm run dev`
- The plugin requires Node.js and npm for building

## License

MIT License
