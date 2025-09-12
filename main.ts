import { Plugin } from "obsidian";
import { createMarkdownPostProcessor } from "./src/processors/processMarkdown";
import { cshSettings, DEFAULT_SETTINGS } from "./src/settings";
import { cshSettingTab } from "./src/ui/settingsTab";
import { SizerManager } from "./src/utils/manageSizer";
import { applyToAllOpenFiles, setupFileOpenHandler } from "./src/utils/manageWorkspace";
import { ExtensionRegistrationManager } from "./src/utils/registerExtension";

export default class cshPlugin extends Plugin {
  settings!: cshSettings;
  private sizerManager = new SizerManager();
  private extensionManager!: ExtensionRegistrationManager;

  async onload() {
    await this.loadSettings();
    
    // initialize managers
    this.extensionManager = new ExtensionRegistrationManager(this);
    
    // add settings tab
    this.addSettingTab(new cshSettingTab(this.app, this));

    // register extensions and set up event handlers
    await this.refreshExtensionRegistrations();

    // set up file-open event handler for auto-switching to reading view
    this.registerEvent(setupFileOpenHandler(this.app.workspace, this.settings));

    // register markdown post processor for syntax highlighting
    this.registerMarkdownPostProcessor(
      createMarkdownPostProcessor(this, this.sizerManager)
    );

    // apply to all currently open files
    this.applyToAllOpen();
  }

  async refreshExtensionRegistrations() {
    await this.extensionManager.refreshExtensionRegistrations(this.settings);
    this.applyToAllOpen();
  }

  private applyToAllOpen() {
    applyToAllOpenFiles(this.app.workspace, this.settings);
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    
    // migration: clean up language fields that were set to 'text' when they should be empty
    // this fixes the bug where clearing language field resulted in 'text' instead of fallback to extension
    let needsMigration = false;
    
    // remove any 'md' extension mappings as they should be handled by obsidian
    const originalLength = this.settings.extensionMappings.length;
    this.settings.extensionMappings = this.settings.extensionMappings.filter(mapping => 
      mapping.extension.toLowerCase() !== 'md'
    );
    if (this.settings.extensionMappings.length !== originalLength) {
      needsMigration = true;
    }
    
    for (const mapping of this.settings.extensionMappings) {
      if (mapping.language === 'text' && mapping.extension !== 'text') {
        mapping.language = '';
        needsMigration = true;
      }
    }
    
    if (needsMigration) {
      await this.saveSettings();
    }
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
