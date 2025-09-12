export interface ExtensionMapping {
  extension: string;
  language: string; // Leave empty to use extension name as language
}

export interface cshSettings {
  extensionMappings: ExtensionMapping[];
  autoSwitchToReading: boolean;
}

export const DEFAULT_SETTINGS: cshSettings = {
  extensionMappings: [
    { extension: "tex", language: "tex" }
  ],
  autoSwitchToReading: true
};

export function validateExtension(ext: string): string {
  return ext.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function validateLanguage(lang: string): string {
  // return the trimmed language, empty string is valid (means use extension as language)
  return lang.trim();
}
