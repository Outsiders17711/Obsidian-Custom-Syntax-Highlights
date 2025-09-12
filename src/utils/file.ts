/**
 * file utility functions for handling file extensions and paths
 */

export function getFileExtension(path: string): string | null {
  const lastDot = path.lastIndexOf('.');
  if (lastDot === -1) return null;
  return path.substring(lastDot + 1).toLowerCase();
}

export function isMarkdownFile(extension: string): boolean {
  return extension.toLowerCase() === 'md';
}
