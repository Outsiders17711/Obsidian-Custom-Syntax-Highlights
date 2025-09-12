/**
 * typescript type definitions for the plugin
 */

export interface ExtensionMapping {
  extension: string;
  language: string; // leave empty to use extension name as language
}

export interface cshSettings {
  extensionMappings: ExtensionMapping[];
  autoSwitchToReading: boolean;
}

// re-export from settings for backward compatibility
export type { cshSettings as CustomSyntaxHighlightSettings, ExtensionMapping as ExtensionMappingType };
