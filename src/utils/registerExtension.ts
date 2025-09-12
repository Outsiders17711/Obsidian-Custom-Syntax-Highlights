import type { Plugin } from "obsidian";
import { cshSettings } from "../settings";
import { getConfiguredExtensions } from "./extension";

/**
 * extension registration manager
 */
export class ExtensionRegistrationManager {
  private registeredExtensions = new Set<string>();

  constructor(private plugin: Plugin) {}

  async refreshExtensionRegistrations(settings: cshSettings) {
    const extensions = getConfiguredExtensions(settings);

    // register new extensions
    for (const ext of extensions) {
      if (!this.registeredExtensions.has(ext)) {
        try {
          this.plugin.registerExtensions([ext], "markdown");
          this.registeredExtensions.add(ext);
          console.debug(`custom-syntax-highlights: registered extension .${ext}`);
        } catch (e) {
          console.debug(`custom-syntax-highlights: extension .${ext} already registered by another plugin`);
        }
      }
    }
  }

  clear() {
    this.registeredExtensions.clear();
  }

  getRegisteredExtensions(): Set<string> {
    return new Set(this.registeredExtensions);
  }
}
