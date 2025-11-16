import { App, PluginSettingTab, Setting } from "obsidian";
import cshPlugin from "../../main";
import { ExtensionMapping, validateExtension, validateLanguage } from "../settings";

export class cshSettingTab extends PluginSettingTab {
  plugin: cshPlugin;

  constructor(app: App, plugin: cshPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName("Custom file extensions")
      .setHeading()
      .settingEl.addClass("csh-h2");

    containerEl.createEl("p", {
      text: "Configure file extensions to display as syntax-highlighted code blocks in reading view."
    });

    // auto-switch to reading view setting
    new Setting(containerEl)
      .setName("Auto-switch to reading view")
      .setDesc("Automatically switch files with configured extensions to reading view when opened")
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.autoSwitchToReading)
        .onChange(async (value) => {
          this.plugin.settings.autoSwitchToReading = value;
          await this.plugin.saveSettings();
        }));

    // extension mappings header
    new Setting(containerEl)
      .setName("Extension mappings")
      .setHeading()
      .settingEl.addClass("csh-h2");

    containerEl.createEl("p", {
      text: "Define which file extensions should be displayed with which syntax highlighting language. Leave language empty to use the extension name."
    });

    const noteEl = containerEl.createEl("div", { cls: "setting-item-description csh-settings-note" });
    noteEl.createEl("strong", { text: "Note: " });
    noteEl.appendText("The '.md' extension is not supported as it's handled natively by Obsidian. Set language to 'md' or 'markdown' for any non-native extension to allow normal editing and disable both syntax highlighting and auto-switch to reading view.");

    // display existing mappings
    this.plugin.settings.extensionMappings.forEach((mapping, index) => {
      this.createMappingSetting(containerEl, mapping, index);
    });

    // add new mapping button
    new Setting(containerEl)
      .setName("Add new extension mapping")
      .setDesc("Add a new file extension to language mapping")
      .addButton(button => button
        .setButtonText("Add mapping")
        .setCta()
        .onClick(async () => {
          this.plugin.settings.extensionMappings.push({ extension: "", language: "" });
          await this.plugin.saveSettings();
          this.display(); // refresh the settings display
        }));

    // examples section
    new Setting(containerEl)
      .setName("Examples")
      .setHeading()
      .settingEl.addClass("csh-h2");
    const exampleEl = containerEl.createEl("div", { cls: "csh-settings-examples" });
    exampleEl.createEl("p", { text: "Common Mappings:" });
    const examples = [
      "json → json (or leave empty)",
      "bib → ini",
      "py → python",
      "js → javascript",
      "txt → md (enable normal editing, disable syntax highlighting & auto-reading view)"
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
      .setPlaceholder("file extension (`tex`, `json`, `bib`)")
      .setValue(mapping.extension)
      .onChange(async (value) => {
        const validated = validateExtension(value);
        mapping.extension = validated;
        text.setValue(validated); // update display with validated value
        await this.plugin.saveSettings();
        await this.plugin.refreshExtensionRegistrations();
      }));

    setting.addText(text => text
      .setPlaceholder("syntax language (`tex`, `json`, `ini`) - leave empty to use extension")
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
        this.display(); // refresh the settings display
      }));
  }
}
