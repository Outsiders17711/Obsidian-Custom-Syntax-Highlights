import { cshSettings } from "../settings";
import { getFileExtension, isMarkdownFile } from "./file";

// re-export file utils for convenience
export { getFileExtension, isMarkdownFile } from "./file";

/**
 * extension management utilities
 */

export function isConfiguredExtension(extension: string, settings: cshSettings): boolean {
  // don't process .md files - leave those to obsidian
  if (isMarkdownFile(extension)) return false;
  
  return settings.extensionMappings.some(mapping => 
    mapping.extension.toLowerCase() === extension.toLowerCase()
  );
}

export function getLanguageForFile(path: string, settings: cshSettings): string {
  const extension = getFileExtension(path);
  if (!extension) return 'text';
  
  const mapping = settings.extensionMappings.find(m => 
    m.extension.toLowerCase() === extension.toLowerCase()
  );
  
  if (!mapping) return 'text';
  // use the language if it's specified and not empty, otherwise fall back to extension
  return (mapping.language && mapping.language.trim()) ? mapping.language : extension;
}

export function getConfiguredExtensions(settings: cshSettings): string[] {
  // get all configured extensions (excluding 'md' which is handled by obsidian)
  return settings.extensionMappings
    .map(m => m.extension)
    .filter(ext => ext.length > 0 && !isMarkdownFile(ext));
}
