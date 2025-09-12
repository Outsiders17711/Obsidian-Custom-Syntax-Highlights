import { App, PluginSettingTab, Setting } from "obsidian";
import cshPlugin from "../main";
import { ExtensionMapping, validateExtension, validateLanguage } from "./settings";

export class cshSettingTab extends PluginSettingTab {
  plugin: cshPlugin;

  constructor(app: App, plugin: cshPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl("h2", { text: "Custom File Extensions Settings" });

    containerEl.createEl("p", { 
      text: "Configure file extensions to display as syntax-highlighted code blocks in reading view." 
    });

    // Auto-switch to reading view setting
    new Setting(containerEl)
      .setName("Auto-switch to reading view")
      .setDesc("Automatically switch files with configured extensions to reading view when opened")
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.autoSwitchToReading)
        .onChange(async (value) => {
          this.plugin.settings.autoSwitchToReading = value;
          await this.plugin.saveSettings();
        }));

    // Extension mappings header
    containerEl.createEl("h3", { text: "Extension Mappings" });
    
    containerEl.createEl("p", { 
      text: "Define which file extensions should be displayed with which syntax highlighting language. Leave language empty to use the extension name." 
    });

    // Display existing mappings
    this.plugin.settings.extensionMappings.forEach((mapping, index) => {
      this.createMappingSetting(containerEl, mapping, index);
    });

    // Add new mapping button
    new Setting(containerEl)
      .setName("Add new extension mapping")
      .setDesc("Add a new file extension to language mapping")
      .addButton(button => button
        .setButtonText("Add mapping")
        .setCta()
        .onClick(async () => {
          this.plugin.settings.extensionMappings.push({ extension: "", language: "" });
          await this.plugin.saveSettings();
          this.display(); // Refresh the settings display
        }));

    // Examples section
    containerEl.createEl("h4", { text: "Examples" });
    const exampleEl = containerEl.createEl("div", { cls: "csh-examples" });
    exampleEl.createEl("p", { text: "Common mappings:" });
    const examples = [
      "json → json (or leave empty)",
      "bib → ini",
      "py → python", 
      "js → javascript",
    ];
    
    const exampleList = exampleEl.createEl("ul");
    examples.forEach(example => {
      exampleList.createEl("li", { text: example });
    });
  }

  private createMappingSetting(containerEl: HTMLElement, mapping: ExtensionMapping, index: number): void {
    const setting = new Setting(containerEl)
      .setName(`Extension mapping ${index + 1}`)
      .setDesc("File extension and corresponding syntax highlighting language");

    setting.addText(text => text
      .setPlaceholder("Extension (e.g., tex, json, bib)")
      .setValue(mapping.extension)
      .onChange(async (value) => {
        const validated = validateExtension(value);
        mapping.extension = validated;
        text.setValue(validated); // Update display with validated value
        await this.plugin.saveSettings();
        await this.plugin.refreshExtensionRegistrations();
      }));

    setting.addText(text => text
      .setPlaceholder("Language (e.g., tex, json, ini) - leave empty to use extension")
      .setValue(mapping.language)
      .onChange(async (value) => {
        mapping.language = validateLanguage(value);
        await this.plugin.saveSettings();
      }));

    setting.addButton(button => button
      .setButtonText("Remove")
      .setWarning()
      .onClick(async () => {
        this.plugin.settings.extensionMappings.splice(index, 1);
        await this.plugin.saveSettings();
        await this.plugin.refreshExtensionRegistrations();
        this.display(); // Refresh the settings display
      }));
  }
}
