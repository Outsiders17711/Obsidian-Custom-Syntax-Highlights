import { ExtensionMapping, cshSettings } from "./types";

// re-export types for convenience
export type { ExtensionMapping, cshSettings };

export const DEFAULT_SETTINGS: cshSettings = {
  extensionMappings: [
    { extension: "tex", language: "" },
    { extension: "json", language: "" },
    { extension: "yaml", language: "" },
    { extension: "bib", language: "ini" },
    { extension: "txt", language: "md" },
  ],
  autoSwitchToReading: true
};

export function validateExtension(ext: string): string {
  const cleaned = ext.toLowerCase().replace(/[^a-z0-9_]/g, '');
  // don't allow 'md' extension as it's handled natively by obsidian
  if (cleaned === 'md') return '';
  return cleaned;
}

export function validateLanguage(lang: string): string {
  // return the trimmed language, empty string is valid (means use extension as language)
  return lang.trim();
}
