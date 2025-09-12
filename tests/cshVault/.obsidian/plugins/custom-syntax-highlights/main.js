var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// main.ts
var main_exports = {};
__export(main_exports, {
  default: () => cshPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian2 = require("obsidian");

// src/settings.ts
var DEFAULT_SETTINGS = {
  extensionMappings: [
    { extension: "tex", language: "" },
    { extension: "json", language: "" },
    { extension: "yaml", language: "" },
    { extension: "bib", language: "ini" },
    { extension: "txt", language: "md" }
  ],
  autoSwitchToReading: true
};
function validateExtension(ext) {
  const cleaned = ext.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (cleaned === "md")
    return "";
  return cleaned;
}
function validateLanguage(lang) {
  return lang.trim();
}

// src/settings-tab.ts
var import_obsidian = require("obsidian");
var cshSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "Custom File Extensions Settings" });
    containerEl.createEl("p", {
      text: "Configure file extensions to display as syntax-highlighted code blocks in reading view."
    });
    new import_obsidian.Setting(containerEl).setName("Auto-switch to reading view").setDesc("Automatically switch files with configured extensions to reading view when opened").addToggle((toggle) => toggle.setValue(this.plugin.settings.autoSwitchToReading).onChange((value) => __async(this, null, function* () {
      this.plugin.settings.autoSwitchToReading = value;
      yield this.plugin.saveSettings();
    })));
    containerEl.createEl("h3", { text: "Extension Mappings" });
    containerEl.createEl("p", {
      text: "Define which file extensions should be displayed with which syntax highlighting language. Leave language empty to use the extension name."
    });
    const noteEl = containerEl.createEl("div", { cls: "setting-item-description" });
    noteEl.createEl("strong", { text: "Note: " });
    noteEl.appendText("The '.md' extension is not supported as it's handled natively by Obsidian. Set language to 'md' or 'markdown' for any non-native extension to allow normal editing and disable both syntax highlighting and auto-switch to reading view.");
    noteEl.style.marginBottom = "20px";
    this.plugin.settings.extensionMappings.forEach((mapping, index) => {
      this.createMappingSetting(containerEl, mapping, index);
    });
    new import_obsidian.Setting(containerEl).setName("Add new extension mapping").setDesc("Add a new file extension to language mapping").addButton((button) => button.setButtonText("Add mapping").setCta().onClick(() => __async(this, null, function* () {
      this.plugin.settings.extensionMappings.push({ extension: "", language: "" });
      yield this.plugin.saveSettings();
      this.display();
    })));
    containerEl.createEl("h4", { text: "Examples" });
    const exampleEl = containerEl.createEl("div", { cls: "csh-examples" });
    exampleEl.createEl("p", { text: "Common mappings:" });
    const examples = [
      "json \u2192 json (or leave empty)",
      "bib \u2192 ini",
      "py \u2192 python",
      "js \u2192 javascript",
      "txt \u2192 md (enable normal editing, disable syntax highlighting & auto-reading view)"
    ];
    const exampleList = exampleEl.createEl("ul");
    examples.forEach((example) => {
      exampleList.createEl("li", { text: example });
    });
  }
  createMappingSetting(containerEl, mapping, index) {
    const setting = new import_obsidian.Setting(containerEl).setName(`Extension mapping ${index + 1}`).setDesc("File extension and corresponding syntax highlighting language");
    setting.addText((text) => text.setPlaceholder("Extension (e.g., tex, json, bib)").setValue(mapping.extension).onChange((value) => __async(this, null, function* () {
      const validated = validateExtension(value);
      mapping.extension = validated;
      text.setValue(validated);
      yield this.plugin.saveSettings();
      yield this.plugin.refreshExtensionRegistrations();
    })));
    setting.addText((text) => text.setPlaceholder("Language (e.g., tex, json, ini) - leave empty to use extension").setValue(mapping.language).onChange((value) => __async(this, null, function* () {
      mapping.language = validateLanguage(value);
      yield this.plugin.saveSettings();
    })));
    setting.addButton((button) => button.setButtonText("Remove").setWarning().onClick(() => __async(this, null, function* () {
      this.plugin.settings.extensionMappings.splice(index, 1);
      yield this.plugin.saveSettings();
      yield this.plugin.refreshExtensionRegistrations();
      this.display();
    })));
  }
};

// main.ts
var cshPlugin = class extends import_obsidian2.Plugin {
  constructor() {
    super(...arguments);
    this.processedSizers = /* @__PURE__ */ new WeakSet();
    this.registeredExtensions = /* @__PURE__ */ new Set();
  }
  onload() {
    return __async(this, null, function* () {
      yield this.loadSettings();
      this.addSettingTab(new cshSettingTab(this.app, this));
      yield this.refreshExtensionRegistrations();
      this.registerEvent(this.app.workspace.on("file-open", (file) => {
        if (!this.settings.autoSwitchToReading)
          return;
        if (file instanceof import_obsidian2.TFile && this.isConfiguredExtension(file.extension)) {
          const language = this.getLanguageForFile(file.path);
          if (language === "md" || language === "markdown")
            return;
          const leaves = this.app.workspace.getLeavesOfType("markdown");
          for (const leaf of leaves) {
            const view = leaf.view;
            if (view.file === file) {
              view.setState({ mode: "preview" }, { history: false });
              break;
            }
          }
        }
      }));
      this.registerMarkdownPostProcessor((el, ctx) => {
        var _a, _b;
        const path = (_a = ctx.sourcePath) == null ? void 0 : _a.toLowerCase();
        if (!path)
          return;
        const fileExtension = this.getFileExtension(path);
        if (!fileExtension || !this.isConfiguredExtension(fileExtension))
          return;
        const language = this.getLanguageForFile(path);
        if (language === "md" || language === "markdown")
          return;
        const info = (_b = ctx.getSectionInfo) == null ? void 0 : _b.call(ctx, el);
        if (!info)
          return;
        const section = el;
        if (info.lineStart !== 0) {
          if (!section.classList.contains("csh-hidden")) {
            section.classList.add("csh-hidden");
            while (section.firstChild)
              section.removeChild(section.firstChild);
            section.style.height = "1px";
            section.style.minHeight = "1px";
            section.style.margin = "0";
            section.style.padding = "0";
            section.style.visibility = "hidden";
          }
          return;
        }
        if (section.classList.contains("csh-rendered"))
          return;
        section.classList.add("csh-rendered");
        const sizer = section.parentElement;
        const preview = section.closest(".markdown-preview-view");
        preview == null ? void 0 : preview.classList.add("csh-mode");
        if (sizer && !this.processedSizers.has(sizer)) {
          this.processedSizers.add(sizer);
          const pushers = sizer.querySelectorAll(".markdown-preview-pusher");
          pushers.forEach((pusher) => {
            const pusherEl = pusher;
            pusherEl.style.height = "0px";
            pusherEl.style.minHeight = "0px";
          });
          sizer.style.paddingBottom = "8px";
        }
        section.style.margin = "0";
        section.style.padding = "8px 0";
        while (section.firstChild)
          section.removeChild(section.firstChild);
        const child = new class extends import_obsidian2.MarkdownRenderChild {
          constructor(plugin, containerEl, ctx2) {
            super(containerEl);
            this.plugin = plugin;
            this.ctx = ctx2;
          }
          onload() {
            return __async(this, null, function* () {
              try {
                const file = this.plugin.app.vault.getAbstractFileByPath(this.ctx.sourcePath);
                if (!(file instanceof import_obsidian2.TFile))
                  return;
                const content = yield this.plugin.app.vault.cachedRead(file);
                const language2 = this.plugin.getLanguageForFile(this.ctx.sourcePath);
                const md = "```" + language2 + "\n" + content + "\n```";
                yield import_obsidian2.MarkdownRenderer.render(this.plugin.app, md, this.containerEl, this.ctx.sourcePath, this.plugin);
              } catch (e) {
                console.error("custom-syntax-highlights: reading render failed", e);
              }
            });
          }
          onunload() {
            var _a2;
            const section2 = this.containerEl;
            const preview2 = section2.closest(".markdown-preview-view");
            const sizer2 = section2.parentElement;
            (_a2 = preview2 == null ? void 0 : preview2.classList) == null ? void 0 : _a2.remove("csh-mode");
            if (sizer2 && this.plugin.processedSizers.has(sizer2)) {
              this.plugin.processedSizers.delete(sizer2);
              const pushers = sizer2.querySelectorAll(".markdown-preview-pusher");
              pushers.forEach((pusher) => {
                const pusherEl = pusher;
                pusherEl.style.height = "";
                pusherEl.style.minHeight = "";
              });
              sizer2.style.paddingBottom = "";
            }
            const allSections = preview2 == null ? void 0 : preview2.querySelectorAll(".csh-hidden");
            allSections == null ? void 0 : allSections.forEach((hiddenSection) => {
              const hiddenEl = hiddenSection;
              hiddenEl.classList.remove("csh-hidden");
              hiddenEl.style.height = "";
              hiddenEl.style.minHeight = "";
              hiddenEl.style.margin = "";
              hiddenEl.style.padding = "";
              hiddenEl.style.visibility = "";
            });
          }
        }(this, section, ctx);
        ctx.addChild(child);
      });
      this.applyToAllOpen();
    });
  }
  getFileExtension(path) {
    const lastDot = path.lastIndexOf(".");
    if (lastDot === -1)
      return null;
    return path.substring(lastDot + 1).toLowerCase();
  }
  isConfiguredExtension(extension) {
    if (extension.toLowerCase() === "md")
      return false;
    return this.settings.extensionMappings.some(
      (mapping) => mapping.extension.toLowerCase() === extension.toLowerCase()
    );
  }
  getLanguageForFile(path) {
    const extension = this.getFileExtension(path);
    if (!extension)
      return "text";
    const mapping = this.settings.extensionMappings.find(
      (m) => m.extension.toLowerCase() === extension.toLowerCase()
    );
    if (!mapping)
      return "text";
    return mapping.language && mapping.language.trim() ? mapping.language : extension;
  }
  refreshExtensionRegistrations() {
    return __async(this, null, function* () {
      const extensions = this.settings.extensionMappings.map((m) => m.extension).filter((ext) => ext.length > 0 && ext.toLowerCase() !== "md");
      for (const ext of extensions) {
        if (!this.registeredExtensions.has(ext)) {
          try {
            this.registerExtensions([ext], "markdown");
            this.registeredExtensions.add(ext);
            console.debug(`custom-syntax-highlights: registered extension .${ext}`);
          } catch (e) {
            console.debug(`custom-syntax-highlights: extension .${ext} already registered by another plugin`);
          }
        }
      }
      this.applyToAllOpen();
    });
  }
  applyToAllOpen() {
    if (!this.settings.autoSwitchToReading)
      return;
    const leaves = this.app.workspace.getLeavesOfType("markdown");
    for (const leaf of leaves) {
      const view = leaf.view;
      if (view.file instanceof import_obsidian2.TFile && this.isConfiguredExtension(view.file.extension)) {
        const language = this.getLanguageForFile(view.file.path);
        if (language === "md" || language === "markdown")
          continue;
        view.setState({ mode: "preview" }, { history: false });
      }
    }
  }
  loadSettings() {
    return __async(this, null, function* () {
      this.settings = Object.assign({}, DEFAULT_SETTINGS, yield this.loadData());
      let needsMigration = false;
      const originalLength = this.settings.extensionMappings.length;
      this.settings.extensionMappings = this.settings.extensionMappings.filter(
        (mapping) => mapping.extension.toLowerCase() !== "md"
      );
      if (this.settings.extensionMappings.length !== originalLength) {
        needsMigration = true;
      }
      for (const mapping of this.settings.extensionMappings) {
        if (mapping.language === "text" && mapping.extension !== "text") {
          mapping.language = "";
          needsMigration = true;
        }
      }
      if (needsMigration) {
        yield this.saveSettings();
      }
    });
  }
  saveSettings() {
    return __async(this, null, function* () {
      yield this.saveData(this.settings);
    });
  }
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibWFpbi50cyIsICJzcmMvc2V0dGluZ3MudHMiLCAic3JjL3NldHRpbmdzLXRhYi50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiaW1wb3J0IHsgTWFya2Rvd25SZW5kZXJDaGlsZCwgTWFya2Rvd25SZW5kZXJlciwgTWFya2Rvd25WaWV3LCBQbHVnaW4sIFRGaWxlIH0gZnJvbSBcIm9ic2lkaWFuXCI7XG5pbXBvcnQgeyBjc2hTZXR0aW5ncywgREVGQVVMVF9TRVRUSU5HUyB9IGZyb20gXCIuL3NyYy9zZXR0aW5nc1wiO1xuaW1wb3J0IHsgY3NoU2V0dGluZ1RhYiB9IGZyb20gXCIuL3NyYy9zZXR0aW5ncy10YWJcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgY3NoUGx1Z2luIGV4dGVuZHMgUGx1Z2luIHtcbiAgcHJpdmF0ZSBwcm9jZXNzZWRTaXplcnMgPSBuZXcgV2Vha1NldDxIVE1MRWxlbWVudD4oKTtcbiAgc2V0dGluZ3M6IGNzaFNldHRpbmdzO1xuICBwcml2YXRlIHJlZ2lzdGVyZWRFeHRlbnNpb25zID0gbmV3IFNldDxzdHJpbmc+KCk7XG5cbiAgYXN5bmMgb25sb2FkKCkge1xuICAgIGF3YWl0IHRoaXMubG9hZFNldHRpbmdzKCk7XG4gICAgXG4gICAgLy8gYWRkIHNldHRpbmdzIHRhYlxuICAgIHRoaXMuYWRkU2V0dGluZ1RhYihuZXcgY3NoU2V0dGluZ1RhYih0aGlzLmFwcCwgdGhpcykpO1xuXG4gICAgLy8gcmVnaXN0ZXIgZXh0ZW5zaW9ucyBhbmQgc2V0IHVwIGV2ZW50IGhhbmRsZXJzXG4gICAgYXdhaXQgdGhpcy5yZWZyZXNoRXh0ZW5zaW9uUmVnaXN0cmF0aW9ucygpO1xuXG4gICAgLy8gc2V0IHVwIGZpbGUtb3BlbiBldmVudCBoYW5kbGVyIGZvciBhdXRvLXN3aXRjaGluZyB0byByZWFkaW5nIHZpZXdcbiAgICB0aGlzLnJlZ2lzdGVyRXZlbnQodGhpcy5hcHAud29ya3NwYWNlLm9uKFwiZmlsZS1vcGVuXCIsIChmaWxlKSA9PiB7XG4gICAgICBpZiAoIXRoaXMuc2V0dGluZ3MuYXV0b1N3aXRjaFRvUmVhZGluZykgcmV0dXJuO1xuICAgICAgXG4gICAgICBpZiAoZmlsZSBpbnN0YW5jZW9mIFRGaWxlICYmIHRoaXMuaXNDb25maWd1cmVkRXh0ZW5zaW9uKGZpbGUuZXh0ZW5zaW9uKSkge1xuICAgICAgICAvLyBpZiBsYW5ndWFnZSBpcyBzZXQgdG8gJ21kJyBvciAnbWFya2Rvd24nLCBkb24ndCBhdXRvLXN3aXRjaCB0byByZWFkaW5nIHZpZXdcbiAgICAgICAgLy8gdGhpcyBhbGxvd3Mgbm9ybWFsIGVkaXRpbmcgb2YgdGhlIGZpbGUgYXMgaWYgaXQgd2VyZSBhIHJlZ3VsYXIgbWFya2Rvd24gZmlsZVxuICAgICAgICBjb25zdCBsYW5ndWFnZSA9IHRoaXMuZ2V0TGFuZ3VhZ2VGb3JGaWxlKGZpbGUucGF0aCk7XG4gICAgICAgIGlmIChsYW5ndWFnZSA9PT0gJ21kJyB8fCBsYW5ndWFnZSA9PT0gJ21hcmtkb3duJykgcmV0dXJuO1xuICAgICAgICBcbiAgICAgICAgLy8gZmluZCB0aGUgbGVhZiB3aXRoIHRoaXMgZmlsZSBhbmQgc3dpdGNoIHRvIHJlYWRpbmcgdmlld1xuICAgICAgICBjb25zdCBsZWF2ZXMgPSB0aGlzLmFwcC53b3Jrc3BhY2UuZ2V0TGVhdmVzT2ZUeXBlKFwibWFya2Rvd25cIik7XG4gICAgICAgIGZvciAoY29uc3QgbGVhZiBvZiBsZWF2ZXMpIHtcbiAgICAgICAgICBjb25zdCB2aWV3ID0gbGVhZi52aWV3IGFzIE1hcmtkb3duVmlldztcbiAgICAgICAgICBpZiAodmlldy5maWxlID09PSBmaWxlKSB7XG4gICAgICAgICAgICAvLyBzd2l0Y2ggdG8gcmVhZGluZyB2aWV3XG4gICAgICAgICAgICB2aWV3LnNldFN0YXRlKHsgbW9kZTogXCJwcmV2aWV3XCIgfSwgeyBoaXN0b3J5OiBmYWxzZSB9KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pKTtcblxuICAgIC8vIHJlYWRpbmcgbW9kZTogc2hvdyBvbmx5IGEgc2luZ2xlIGZlbmNlZCBjb2RlIGJsb2NrIG9mIHRoZSBmaWxlXG4gICAgLy8gcmVwbGFjZSBjb250ZW50IG9mIGFsbCBzZWN0aW9ucyB3aXRoIHRoZSByZW5kZXJlZCBjb2RlIGJsb2NrLCBidXQga2VlcCBzZWN0aW9ucyB2aXNpYmxlIGZvciBwcm9wZXIgdmlydHVhbGl6YXRpb25cbiAgICB0aGlzLnJlZ2lzdGVyTWFya2Rvd25Qb3N0UHJvY2Vzc29yKChlbCwgY3R4KSA9PiB7XG4gICAgICBjb25zdCBwYXRoID0gY3R4LnNvdXJjZVBhdGg/LnRvTG93ZXJDYXNlKCk7XG4gICAgICBpZiAoIXBhdGgpIHJldHVybjtcblxuICAgICAgY29uc3QgZmlsZUV4dGVuc2lvbiA9IHRoaXMuZ2V0RmlsZUV4dGVuc2lvbihwYXRoKTtcbiAgICAgIGlmICghZmlsZUV4dGVuc2lvbiB8fCAhdGhpcy5pc0NvbmZpZ3VyZWRFeHRlbnNpb24oZmlsZUV4dGVuc2lvbikpIHJldHVybjtcblxuICAgICAgLy8gaWYgbGFuZ3VhZ2UgaXMgc2V0IHRvICdtZCcgb3IgJ21hcmtkb3duJywgbGV0IG9ic2lkaWFuIGhhbmRsZSBpdCBub3JtYWxseVxuICAgICAgLy8gdGhpcyBhbGxvd3MgdGhlIGZpbGUgdG8gYmUgb3BlbmVkL2VkaXRlZCBhcyBhIHJlZ3VsYXIgbWFya2Rvd24gZmlsZVxuICAgICAgY29uc3QgbGFuZ3VhZ2UgPSB0aGlzLmdldExhbmd1YWdlRm9yRmlsZShwYXRoKTtcbiAgICAgIGlmIChsYW5ndWFnZSA9PT0gJ21kJyB8fCBsYW5ndWFnZSA9PT0gJ21hcmtkb3duJykgcmV0dXJuO1xuXG4gICAgICBjb25zdCBpbmZvID0gY3R4LmdldFNlY3Rpb25JbmZvPy4oZWwgYXMgSFRNTEVsZW1lbnQpO1xuICAgICAgaWYgKCFpbmZvKSByZXR1cm47XG5cbiAgICAgIGNvbnN0IHNlY3Rpb24gPSBlbCBhcyBIVE1MRWxlbWVudDtcblxuICAgICAgLy8gZm9yIG5vbi1maXJzdCBzZWN0aW9ucywganVzdCBoaWRlIHRoZWlyIGNvbnRlbnQgYnV0IGtlZXAgdGhlIHNlY3Rpb24gc3RydWN0dXJlXG4gICAgICBpZiAoaW5mby5saW5lU3RhcnQgIT09IDApIHtcbiAgICAgICAgaWYgKCFzZWN0aW9uLmNsYXNzTGlzdC5jb250YWlucygnY3NoLWhpZGRlbicpKSB7XG4gICAgICAgICAgc2VjdGlvbi5jbGFzc0xpc3QuYWRkKCdjc2gtaGlkZGVuJyk7XG4gICAgICAgICAgd2hpbGUgKHNlY3Rpb24uZmlyc3RDaGlsZCkgc2VjdGlvbi5yZW1vdmVDaGlsZChzZWN0aW9uLmZpcnN0Q2hpbGQpO1xuICAgICAgICAgIC8vIGtlZXAgbWluaW1hbCBoZWlnaHQgdG8gbWFpbnRhaW4gc2Nyb2xsIGNhbGN1bGF0aW9uc1xuICAgICAgICAgIHNlY3Rpb24uc3R5bGUuaGVpZ2h0ID0gXCIxcHhcIjtcbiAgICAgICAgICBzZWN0aW9uLnN0eWxlLm1pbkhlaWdodCA9IFwiMXB4XCI7XG4gICAgICAgICAgc2VjdGlvbi5zdHlsZS5tYXJnaW4gPSBcIjBcIjtcbiAgICAgICAgICBzZWN0aW9uLnN0eWxlLnBhZGRpbmcgPSBcIjBcIjtcbiAgICAgICAgICBzZWN0aW9uLnN0eWxlLnZpc2liaWxpdHkgPSBcImhpZGRlblwiO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gZmlyc3Qgc2VjdGlvbjogcmVwbGFjZSBpdHMgY29udGVudHMgb25jZSBhbmQgcmVuZGVyIGZlbmNlZCBjb2RlIGJsb2NrXG4gICAgICBpZiAoc2VjdGlvbi5jbGFzc0xpc3QuY29udGFpbnMoJ2NzaC1yZW5kZXJlZCcpKSByZXR1cm47XG4gICAgICBzZWN0aW9uLmNsYXNzTGlzdC5hZGQoJ2NzaC1yZW5kZXJlZCcpO1xuICAgICAgXG4gICAgICAvLyBpbXByb3ZlIGNvbnRhaW5lciBzdHlsaW5nIGZvciBiZXR0ZXIgbGF5b3V0XG4gICAgICBjb25zdCBzaXplciA9IHNlY3Rpb24ucGFyZW50RWxlbWVudCBhcyBIVE1MRWxlbWVudCB8IG51bGw7XG4gICAgICBjb25zdCBwcmV2aWV3ID0gc2VjdGlvbi5jbG9zZXN0KCcubWFya2Rvd24tcHJldmlldy12aWV3JykgYXMgSFRNTEVsZW1lbnQgfCBudWxsO1xuICAgICAgcHJldmlldz8uY2xhc3NMaXN0LmFkZCgnY3NoLW1vZGUnKTtcbiAgICAgIFxuICAgICAgLy8gYmV0dGVyIHNpemVyIGhhbmRsaW5nIC0gZG9uJ3QgcmVtb3ZlIHB1c2hlcnMgY29tcGxldGVseSwganVzdCBhZGp1c3QgdGhlaXIgaGVpZ2h0XG4gICAgICBpZiAoc2l6ZXIgJiYgIXRoaXMucHJvY2Vzc2VkU2l6ZXJzLmhhcyhzaXplcikpIHtcbiAgICAgICAgdGhpcy5wcm9jZXNzZWRTaXplcnMuYWRkKHNpemVyKTtcbiAgICAgICAgY29uc3QgcHVzaGVycyA9IHNpemVyLnF1ZXJ5U2VsZWN0b3JBbGwoJy5tYXJrZG93bi1wcmV2aWV3LXB1c2hlcicpO1xuICAgICAgICBwdXNoZXJzLmZvckVhY2goKHB1c2hlcikgPT4ge1xuICAgICAgICAgIGNvbnN0IHB1c2hlckVsID0gcHVzaGVyIGFzIEhUTUxFbGVtZW50O1xuICAgICAgICAgIHB1c2hlckVsLnN0eWxlLmhlaWdodCA9ICcwcHgnO1xuICAgICAgICAgIHB1c2hlckVsLnN0eWxlLm1pbkhlaWdodCA9ICcwcHgnO1xuICAgICAgICB9KTtcbiAgICAgICAgc2l6ZXIuc3R5bGUucGFkZGluZ0JvdHRvbSA9ICc4cHgnO1xuICAgICAgfVxuICAgICAgXG4gICAgICBzZWN0aW9uLnN0eWxlLm1hcmdpbiA9IFwiMFwiO1xuICAgICAgc2VjdGlvbi5zdHlsZS5wYWRkaW5nID0gXCI4cHggMFwiO1xuICAgICAgd2hpbGUgKHNlY3Rpb24uZmlyc3RDaGlsZCkgc2VjdGlvbi5yZW1vdmVDaGlsZChzZWN0aW9uLmZpcnN0Q2hpbGQpO1xuXG4gICAgICBjb25zdCBjaGlsZCA9IG5ldyAoY2xhc3MgZXh0ZW5kcyBNYXJrZG93blJlbmRlckNoaWxkIHtcbiAgICAgICAgY29uc3RydWN0b3IocHJpdmF0ZSBwbHVnaW46IGNzaFBsdWdpbiwgY29udGFpbmVyRWw6IEhUTUxFbGVtZW50LCBwcml2YXRlIGN0eDogYW55KSB7XG4gICAgICAgICAgc3VwZXIoY29udGFpbmVyRWwpO1xuICAgICAgICB9XG4gICAgICAgIGFzeW5jIG9ubG9hZCgpIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgZmlsZSA9IHRoaXMucGx1Z2luLmFwcC52YXVsdC5nZXRBYnN0cmFjdEZpbGVCeVBhdGgodGhpcy5jdHguc291cmNlUGF0aCk7XG4gICAgICAgICAgICBpZiAoIShmaWxlIGluc3RhbmNlb2YgVEZpbGUpKSByZXR1cm47XG4gICAgICAgICAgICBjb25zdCBjb250ZW50ID0gYXdhaXQgdGhpcy5wbHVnaW4uYXBwLnZhdWx0LmNhY2hlZFJlYWQoZmlsZSk7XG4gICAgICAgICAgICBjb25zdCBsYW5ndWFnZSA9IHRoaXMucGx1Z2luLmdldExhbmd1YWdlRm9yRmlsZSh0aGlzLmN0eC5zb3VyY2VQYXRoKTtcbiAgICAgICAgICAgIGNvbnN0IG1kID0gJ2BgYCcgKyBsYW5ndWFnZSArICdcXG4nICsgY29udGVudCArICdcXG5gYGAnO1xuICAgICAgICAgICAgYXdhaXQgTWFya2Rvd25SZW5kZXJlci5yZW5kZXIodGhpcy5wbHVnaW4uYXBwLCBtZCwgdGhpcy5jb250YWluZXJFbCwgdGhpcy5jdHguc291cmNlUGF0aCwgdGhpcy5wbHVnaW4pO1xuICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ2N1c3RvbS1zeW50YXgtaGlnaGxpZ2h0czogcmVhZGluZyByZW5kZXIgZmFpbGVkJywgZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIG9udW5sb2FkKCkge1xuICAgICAgICAgIC8vIGNsZWFudXAgbW9kZSBjbGFzcyBhbmQgc2l6ZXIgc3R5bGVzXG4gICAgICAgICAgY29uc3Qgc2VjdGlvbiA9IHRoaXMuY29udGFpbmVyRWwgYXMgSFRNTEVsZW1lbnQ7XG4gICAgICAgICAgY29uc3QgcHJldmlldyA9IHNlY3Rpb24uY2xvc2VzdCgnLm1hcmtkb3duLXByZXZpZXctdmlldycpIGFzIEhUTUxFbGVtZW50IHwgbnVsbDtcbiAgICAgICAgICBjb25zdCBzaXplciA9IHNlY3Rpb24ucGFyZW50RWxlbWVudCBhcyBIVE1MRWxlbWVudCB8IG51bGw7XG4gICAgICAgICAgcHJldmlldz8uY2xhc3NMaXN0Py5yZW1vdmUoJ2NzaC1tb2RlJyk7XG4gICAgICAgICAgaWYgKHNpemVyICYmIHRoaXMucGx1Z2luLnByb2Nlc3NlZFNpemVycy5oYXMoc2l6ZXIpKSB7XG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5wcm9jZXNzZWRTaXplcnMuZGVsZXRlKHNpemVyKTtcbiAgICAgICAgICAgIC8vIHJlc3RvcmUgcHVzaGVyIGhlaWdodHNcbiAgICAgICAgICAgIGNvbnN0IHB1c2hlcnMgPSBzaXplci5xdWVyeVNlbGVjdG9yQWxsKCcubWFya2Rvd24tcHJldmlldy1wdXNoZXInKTtcbiAgICAgICAgICAgIHB1c2hlcnMuZm9yRWFjaCgocHVzaGVyKSA9PiB7XG4gICAgICAgICAgICAgIGNvbnN0IHB1c2hlckVsID0gcHVzaGVyIGFzIEhUTUxFbGVtZW50O1xuICAgICAgICAgICAgICBwdXNoZXJFbC5zdHlsZS5oZWlnaHQgPSAnJztcbiAgICAgICAgICAgICAgcHVzaGVyRWwuc3R5bGUubWluSGVpZ2h0ID0gJyc7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHNpemVyLnN0eWxlLnBhZGRpbmdCb3R0b20gPSAnJztcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gY2xlYW4gdXAgaGlkZGVuIHNlY3Rpb25zXG4gICAgICAgICAgY29uc3QgYWxsU2VjdGlvbnMgPSBwcmV2aWV3Py5xdWVyeVNlbGVjdG9yQWxsKCcuY3NoLWhpZGRlbicpO1xuICAgICAgICAgIGFsbFNlY3Rpb25zPy5mb3JFYWNoKChoaWRkZW5TZWN0aW9uKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBoaWRkZW5FbCA9IGhpZGRlblNlY3Rpb24gYXMgSFRNTEVsZW1lbnQ7XG4gICAgICAgICAgICBoaWRkZW5FbC5jbGFzc0xpc3QucmVtb3ZlKCdjc2gtaGlkZGVuJyk7XG4gICAgICAgICAgICBoaWRkZW5FbC5zdHlsZS5oZWlnaHQgPSAnJztcbiAgICAgICAgICAgIGhpZGRlbkVsLnN0eWxlLm1pbkhlaWdodCA9ICcnO1xuICAgICAgICAgICAgaGlkZGVuRWwuc3R5bGUubWFyZ2luID0gJyc7XG4gICAgICAgICAgICBoaWRkZW5FbC5zdHlsZS5wYWRkaW5nID0gJyc7XG4gICAgICAgICAgICBoaWRkZW5FbC5zdHlsZS52aXNpYmlsaXR5ID0gJyc7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0pKHRoaXMsIHNlY3Rpb24sIGN0eCk7XG5cbiAgICAgIGN0eC5hZGRDaGlsZChjaGlsZCk7XG4gICAgfSk7XG5cbiAgICAvLyBhcHBseSB0byBhbGwgY3VycmVudGx5IG9wZW4gZmlsZXMgd2l0aCBjb25maWd1cmVkIGV4dGVuc2lvbnNcbiAgICB0aGlzLmFwcGx5VG9BbGxPcGVuKCk7XG4gIH1cblxuICBwcml2YXRlIGdldEZpbGVFeHRlbnNpb24ocGF0aDogc3RyaW5nKTogc3RyaW5nIHwgbnVsbCB7XG4gICAgY29uc3QgbGFzdERvdCA9IHBhdGgubGFzdEluZGV4T2YoJy4nKTtcbiAgICBpZiAobGFzdERvdCA9PT0gLTEpIHJldHVybiBudWxsO1xuICAgIHJldHVybiBwYXRoLnN1YnN0cmluZyhsYXN0RG90ICsgMSkudG9Mb3dlckNhc2UoKTtcbiAgfVxuXG4gIHByaXZhdGUgaXNDb25maWd1cmVkRXh0ZW5zaW9uKGV4dGVuc2lvbjogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgLy8gZG9uJ3QgcHJvY2VzcyAubWQgZmlsZXMgLSBsZWF2ZSB0aG9zZSB0byBvYnNpZGlhblxuICAgIGlmIChleHRlbnNpb24udG9Mb3dlckNhc2UoKSA9PT0gJ21kJykgcmV0dXJuIGZhbHNlO1xuICAgIFxuICAgIHJldHVybiB0aGlzLnNldHRpbmdzLmV4dGVuc2lvbk1hcHBpbmdzLnNvbWUobWFwcGluZyA9PiBcbiAgICAgIG1hcHBpbmcuZXh0ZW5zaW9uLnRvTG93ZXJDYXNlKCkgPT09IGV4dGVuc2lvbi50b0xvd2VyQ2FzZSgpXG4gICAgKTtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0TGFuZ3VhZ2VGb3JGaWxlKHBhdGg6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgY29uc3QgZXh0ZW5zaW9uID0gdGhpcy5nZXRGaWxlRXh0ZW5zaW9uKHBhdGgpO1xuICAgIGlmICghZXh0ZW5zaW9uKSByZXR1cm4gJ3RleHQnO1xuICAgIFxuICAgIGNvbnN0IG1hcHBpbmcgPSB0aGlzLnNldHRpbmdzLmV4dGVuc2lvbk1hcHBpbmdzLmZpbmQobSA9PiBcbiAgICAgIG0uZXh0ZW5zaW9uLnRvTG93ZXJDYXNlKCkgPT09IGV4dGVuc2lvbi50b0xvd2VyQ2FzZSgpXG4gICAgKTtcbiAgICBcbiAgICBpZiAoIW1hcHBpbmcpIHJldHVybiAndGV4dCc7XG4gICAgLy8gdXNlIHRoZSBsYW5ndWFnZSBpZiBpdCdzIHNwZWNpZmllZCBhbmQgbm90IGVtcHR5LCBvdGhlcndpc2UgZmFsbCBiYWNrIHRvIGV4dGVuc2lvblxuICAgIHJldHVybiAobWFwcGluZy5sYW5ndWFnZSAmJiBtYXBwaW5nLmxhbmd1YWdlLnRyaW0oKSkgPyBtYXBwaW5nLmxhbmd1YWdlIDogZXh0ZW5zaW9uO1xuICB9XG5cbiAgYXN5bmMgcmVmcmVzaEV4dGVuc2lvblJlZ2lzdHJhdGlvbnMoKSB7XG4gICAgLy8gZ2V0IGFsbCBjb25maWd1cmVkIGV4dGVuc2lvbnMgKGV4Y2x1ZGluZyAnbWQnIHdoaWNoIGlzIGhhbmRsZWQgYnkgb2JzaWRpYW4pXG4gICAgY29uc3QgZXh0ZW5zaW9ucyA9IHRoaXMuc2V0dGluZ3MuZXh0ZW5zaW9uTWFwcGluZ3NcbiAgICAgIC5tYXAobSA9PiBtLmV4dGVuc2lvbilcbiAgICAgIC5maWx0ZXIoZXh0ID0+IGV4dC5sZW5ndGggPiAwICYmIGV4dC50b0xvd2VyQ2FzZSgpICE9PSAnbWQnKTtcblxuICAgIC8vIHJlZ2lzdGVyIG5ldyBleHRlbnNpb25zXG4gICAgZm9yIChjb25zdCBleHQgb2YgZXh0ZW5zaW9ucykge1xuICAgICAgaWYgKCF0aGlzLnJlZ2lzdGVyZWRFeHRlbnNpb25zLmhhcyhleHQpKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgdGhpcy5yZWdpc3RlckV4dGVuc2lvbnMoW2V4dF0sIFwibWFya2Rvd25cIik7XG4gICAgICAgICAgdGhpcy5yZWdpc3RlcmVkRXh0ZW5zaW9ucy5hZGQoZXh0KTtcbiAgICAgICAgICBjb25zb2xlLmRlYnVnKGBjdXN0b20tc3ludGF4LWhpZ2hsaWdodHM6IHJlZ2lzdGVyZWQgZXh0ZW5zaW9uIC4ke2V4dH1gKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIGNvbnNvbGUuZGVidWcoYGN1c3RvbS1zeW50YXgtaGlnaGxpZ2h0czogZXh0ZW5zaW9uIC4ke2V4dH0gYWxyZWFkeSByZWdpc3RlcmVkIGJ5IGFub3RoZXIgcGx1Z2luYCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBhcHBseSB0byBjdXJyZW50bHkgb3BlbiBmaWxlc1xuICAgIHRoaXMuYXBwbHlUb0FsbE9wZW4oKTtcbiAgfVxuXG4gIHByaXZhdGUgYXBwbHlUb0FsbE9wZW4oKSB7XG4gICAgaWYgKCF0aGlzLnNldHRpbmdzLmF1dG9Td2l0Y2hUb1JlYWRpbmcpIHJldHVybjtcbiAgICBcbiAgICAvLyBzd2l0Y2ggYW55IGN1cnJlbnRseSBvcGVuIGZpbGVzIHdpdGggY29uZmlndXJlZCBleHRlbnNpb25zIHRvIHJlYWRpbmcgdmlld1xuICAgIGNvbnN0IGxlYXZlcyA9IHRoaXMuYXBwLndvcmtzcGFjZS5nZXRMZWF2ZXNPZlR5cGUoXCJtYXJrZG93blwiKTtcbiAgICBmb3IgKGNvbnN0IGxlYWYgb2YgbGVhdmVzKSB7XG4gICAgICBjb25zdCB2aWV3ID0gbGVhZi52aWV3IGFzIE1hcmtkb3duVmlldztcbiAgICAgIGlmICh2aWV3LmZpbGUgaW5zdGFuY2VvZiBURmlsZSAmJiB0aGlzLmlzQ29uZmlndXJlZEV4dGVuc2lvbih2aWV3LmZpbGUuZXh0ZW5zaW9uKSkge1xuICAgICAgICAvLyBkb24ndCBhdXRvLXN3aXRjaCBmaWxlcyB3aXRoICdtZCcgbGFuZ3VhZ2UgLSBsZXQgdGhlbSBiZSBlZGl0ZWQgbm9ybWFsbHlcbiAgICAgICAgY29uc3QgbGFuZ3VhZ2UgPSB0aGlzLmdldExhbmd1YWdlRm9yRmlsZSh2aWV3LmZpbGUucGF0aCk7XG4gICAgICAgIGlmIChsYW5ndWFnZSA9PT0gJ21kJyB8fCBsYW5ndWFnZSA9PT0gJ21hcmtkb3duJykgY29udGludWU7XG4gICAgICAgIFxuICAgICAgICB2aWV3LnNldFN0YXRlKHsgbW9kZTogXCJwcmV2aWV3XCIgfSwgeyBoaXN0b3J5OiBmYWxzZSB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBhc3luYyBsb2FkU2V0dGluZ3MoKSB7XG4gICAgdGhpcy5zZXR0aW5ncyA9IE9iamVjdC5hc3NpZ24oe30sIERFRkFVTFRfU0VUVElOR1MsIGF3YWl0IHRoaXMubG9hZERhdGEoKSk7XG4gICAgXG4gICAgLy8gbWlncmF0aW9uOiBjbGVhbiB1cCBsYW5ndWFnZSBmaWVsZHMgdGhhdCB3ZXJlIHNldCB0byAndGV4dCcgd2hlbiB0aGV5IHNob3VsZCBiZSBlbXB0eVxuICAgIC8vIHRoaXMgZml4ZXMgdGhlIGJ1ZyB3aGVyZSBjbGVhcmluZyBsYW5ndWFnZSBmaWVsZCByZXN1bHRlZCBpbiAndGV4dCcgaW5zdGVhZCBvZiBmYWxsYmFjayB0byBleHRlbnNpb25cbiAgICBsZXQgbmVlZHNNaWdyYXRpb24gPSBmYWxzZTtcbiAgICBcbiAgICAvLyByZW1vdmUgYW55ICdtZCcgZXh0ZW5zaW9uIG1hcHBpbmdzIGFzIHRoZXkgc2hvdWxkIGJlIGhhbmRsZWQgYnkgb2JzaWRpYW5cbiAgICBjb25zdCBvcmlnaW5hbExlbmd0aCA9IHRoaXMuc2V0dGluZ3MuZXh0ZW5zaW9uTWFwcGluZ3MubGVuZ3RoO1xuICAgIHRoaXMuc2V0dGluZ3MuZXh0ZW5zaW9uTWFwcGluZ3MgPSB0aGlzLnNldHRpbmdzLmV4dGVuc2lvbk1hcHBpbmdzLmZpbHRlcihtYXBwaW5nID0+IFxuICAgICAgbWFwcGluZy5leHRlbnNpb24udG9Mb3dlckNhc2UoKSAhPT0gJ21kJ1xuICAgICk7XG4gICAgaWYgKHRoaXMuc2V0dGluZ3MuZXh0ZW5zaW9uTWFwcGluZ3MubGVuZ3RoICE9PSBvcmlnaW5hbExlbmd0aCkge1xuICAgICAgbmVlZHNNaWdyYXRpb24gPSB0cnVlO1xuICAgIH1cbiAgICBcbiAgICBmb3IgKGNvbnN0IG1hcHBpbmcgb2YgdGhpcy5zZXR0aW5ncy5leHRlbnNpb25NYXBwaW5ncykge1xuICAgICAgaWYgKG1hcHBpbmcubGFuZ3VhZ2UgPT09ICd0ZXh0JyAmJiBtYXBwaW5nLmV4dGVuc2lvbiAhPT0gJ3RleHQnKSB7XG4gICAgICAgIG1hcHBpbmcubGFuZ3VhZ2UgPSAnJztcbiAgICAgICAgbmVlZHNNaWdyYXRpb24gPSB0cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBpZiAobmVlZHNNaWdyYXRpb24pIHtcbiAgICAgIGF3YWl0IHRoaXMuc2F2ZVNldHRpbmdzKCk7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgc2F2ZVNldHRpbmdzKCkge1xuICAgIGF3YWl0IHRoaXMuc2F2ZURhdGEodGhpcy5zZXR0aW5ncyk7XG4gIH1cbn1cbiIsICJleHBvcnQgaW50ZXJmYWNlIEV4dGVuc2lvbk1hcHBpbmcge1xyXG4gIGV4dGVuc2lvbjogc3RyaW5nO1xyXG4gIGxhbmd1YWdlOiBzdHJpbmc7IC8vIGxlYXZlIGVtcHR5IHRvIHVzZSBleHRlbnNpb24gbmFtZSBhcyBsYW5ndWFnZVxyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIGNzaFNldHRpbmdzIHtcclxuICBleHRlbnNpb25NYXBwaW5nczogRXh0ZW5zaW9uTWFwcGluZ1tdO1xyXG4gIGF1dG9Td2l0Y2hUb1JlYWRpbmc6IGJvb2xlYW47XHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBERUZBVUxUX1NFVFRJTkdTOiBjc2hTZXR0aW5ncyA9IHtcclxuICBleHRlbnNpb25NYXBwaW5nczogW1xyXG4gICAgeyBleHRlbnNpb246IFwidGV4XCIsIGxhbmd1YWdlOiBcIlwiIH0sXHJcbiAgICB7IGV4dGVuc2lvbjogXCJqc29uXCIsIGxhbmd1YWdlOiBcIlwiIH0sXHJcbiAgICB7IGV4dGVuc2lvbjogXCJ5YW1sXCIsIGxhbmd1YWdlOiBcIlwiIH0sXHJcbiAgICB7IGV4dGVuc2lvbjogXCJiaWJcIiwgbGFuZ3VhZ2U6IFwiaW5pXCIgfSxcclxuICAgIHsgZXh0ZW5zaW9uOiBcInR4dFwiLCBsYW5ndWFnZTogXCJtZFwiIH0sXHJcbiAgXSxcclxuICBhdXRvU3dpdGNoVG9SZWFkaW5nOiB0cnVlXHJcbn07XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVFeHRlbnNpb24oZXh0OiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gIGNvbnN0IGNsZWFuZWQgPSBleHQudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC9bXmEtejAtOV0vZywgJycpO1xyXG4gIC8vIGRvbid0IGFsbG93ICdtZCcgZXh0ZW5zaW9uIGFzIGl0J3MgaGFuZGxlZCBuYXRpdmVseSBieSBvYnNpZGlhblxyXG4gIGlmIChjbGVhbmVkID09PSAnbWQnKSByZXR1cm4gJyc7XHJcbiAgcmV0dXJuIGNsZWFuZWQ7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiB2YWxpZGF0ZUxhbmd1YWdlKGxhbmc6IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgLy8gcmV0dXJuIHRoZSB0cmltbWVkIGxhbmd1YWdlLCBlbXB0eSBzdHJpbmcgaXMgdmFsaWQgKG1lYW5zIHVzZSBleHRlbnNpb24gYXMgbGFuZ3VhZ2UpXHJcbiAgcmV0dXJuIGxhbmcudHJpbSgpO1xyXG59XHJcbiIsICJpbXBvcnQgeyBBcHAsIFBsdWdpblNldHRpbmdUYWIsIFNldHRpbmcgfSBmcm9tIFwib2JzaWRpYW5cIjtcclxuaW1wb3J0IGNzaFBsdWdpbiBmcm9tIFwiLi4vbWFpblwiO1xyXG5pbXBvcnQgeyBFeHRlbnNpb25NYXBwaW5nLCB2YWxpZGF0ZUV4dGVuc2lvbiwgdmFsaWRhdGVMYW5ndWFnZSB9IGZyb20gXCIuL3NldHRpbmdzXCI7XHJcblxyXG5leHBvcnQgY2xhc3MgY3NoU2V0dGluZ1RhYiBleHRlbmRzIFBsdWdpblNldHRpbmdUYWIge1xyXG4gIHBsdWdpbjogY3NoUGx1Z2luO1xyXG5cclxuICBjb25zdHJ1Y3RvcihhcHA6IEFwcCwgcGx1Z2luOiBjc2hQbHVnaW4pIHtcclxuICAgIHN1cGVyKGFwcCwgcGx1Z2luKTtcclxuICAgIHRoaXMucGx1Z2luID0gcGx1Z2luO1xyXG4gIH1cclxuXHJcbiAgZGlzcGxheSgpOiB2b2lkIHtcclxuICAgIGNvbnN0IHsgY29udGFpbmVyRWwgfSA9IHRoaXM7XHJcbiAgICBjb250YWluZXJFbC5lbXB0eSgpO1xyXG5cclxuICAgIGNvbnRhaW5lckVsLmNyZWF0ZUVsKFwiaDJcIiwgeyB0ZXh0OiBcIkN1c3RvbSBGaWxlIEV4dGVuc2lvbnMgU2V0dGluZ3NcIiB9KTtcclxuXHJcbiAgICBjb250YWluZXJFbC5jcmVhdGVFbChcInBcIiwgeyBcclxuICAgICAgdGV4dDogXCJDb25maWd1cmUgZmlsZSBleHRlbnNpb25zIHRvIGRpc3BsYXkgYXMgc3ludGF4LWhpZ2hsaWdodGVkIGNvZGUgYmxvY2tzIGluIHJlYWRpbmcgdmlldy5cIiBcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIGF1dG8tc3dpdGNoIHRvIHJlYWRpbmcgdmlldyBzZXR0aW5nXHJcbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcclxuICAgICAgLnNldE5hbWUoXCJBdXRvLXN3aXRjaCB0byByZWFkaW5nIHZpZXdcIilcclxuICAgICAgLnNldERlc2MoXCJBdXRvbWF0aWNhbGx5IHN3aXRjaCBmaWxlcyB3aXRoIGNvbmZpZ3VyZWQgZXh0ZW5zaW9ucyB0byByZWFkaW5nIHZpZXcgd2hlbiBvcGVuZWRcIilcclxuICAgICAgLmFkZFRvZ2dsZSh0b2dnbGUgPT4gdG9nZ2xlXHJcbiAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmF1dG9Td2l0Y2hUb1JlYWRpbmcpXHJcbiAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuYXV0b1N3aXRjaFRvUmVhZGluZyA9IHZhbHVlO1xyXG4gICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgfSkpO1xyXG5cclxuICAgIC8vIGV4dGVuc2lvbiBtYXBwaW5ncyBoZWFkZXJcclxuICAgIGNvbnRhaW5lckVsLmNyZWF0ZUVsKFwiaDNcIiwgeyB0ZXh0OiBcIkV4dGVuc2lvbiBNYXBwaW5nc1wiIH0pO1xyXG4gICAgXHJcbiAgICBjb250YWluZXJFbC5jcmVhdGVFbChcInBcIiwgeyBcclxuICAgICAgdGV4dDogXCJEZWZpbmUgd2hpY2ggZmlsZSBleHRlbnNpb25zIHNob3VsZCBiZSBkaXNwbGF5ZWQgd2l0aCB3aGljaCBzeW50YXggaGlnaGxpZ2h0aW5nIGxhbmd1YWdlLiBMZWF2ZSBsYW5ndWFnZSBlbXB0eSB0byB1c2UgdGhlIGV4dGVuc2lvbiBuYW1lLlwiIFxyXG4gICAgfSk7XHJcblxyXG4gICAgY29uc3Qgbm90ZUVsID0gY29udGFpbmVyRWwuY3JlYXRlRWwoXCJkaXZcIiwgeyBjbHM6IFwic2V0dGluZy1pdGVtLWRlc2NyaXB0aW9uXCIgfSk7XHJcbiAgICBub3RlRWwuY3JlYXRlRWwoXCJzdHJvbmdcIiwgeyB0ZXh0OiBcIk5vdGU6IFwiIH0pO1xyXG4gICAgbm90ZUVsLmFwcGVuZFRleHQoXCJUaGUgJy5tZCcgZXh0ZW5zaW9uIGlzIG5vdCBzdXBwb3J0ZWQgYXMgaXQncyBoYW5kbGVkIG5hdGl2ZWx5IGJ5IE9ic2lkaWFuLiBTZXQgbGFuZ3VhZ2UgdG8gJ21kJyBvciAnbWFya2Rvd24nIGZvciBhbnkgbm9uLW5hdGl2ZSBleHRlbnNpb24gdG8gYWxsb3cgbm9ybWFsIGVkaXRpbmcgYW5kIGRpc2FibGUgYm90aCBzeW50YXggaGlnaGxpZ2h0aW5nIGFuZCBhdXRvLXN3aXRjaCB0byByZWFkaW5nIHZpZXcuXCIpO1xyXG4gICAgbm90ZUVsLnN0eWxlLm1hcmdpbkJvdHRvbSA9IFwiMjBweFwiO1xyXG5cclxuICAgIC8vIGRpc3BsYXkgZXhpc3RpbmcgbWFwcGluZ3NcclxuICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmV4dGVuc2lvbk1hcHBpbmdzLmZvckVhY2goKG1hcHBpbmcsIGluZGV4KSA9PiB7XHJcbiAgICAgIHRoaXMuY3JlYXRlTWFwcGluZ1NldHRpbmcoY29udGFpbmVyRWwsIG1hcHBpbmcsIGluZGV4KTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIGFkZCBuZXcgbWFwcGluZyBidXR0b25cclxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxyXG4gICAgICAuc2V0TmFtZShcIkFkZCBuZXcgZXh0ZW5zaW9uIG1hcHBpbmdcIilcclxuICAgICAgLnNldERlc2MoXCJBZGQgYSBuZXcgZmlsZSBleHRlbnNpb24gdG8gbGFuZ3VhZ2UgbWFwcGluZ1wiKVxyXG4gICAgICAuYWRkQnV0dG9uKGJ1dHRvbiA9PiBidXR0b25cclxuICAgICAgICAuc2V0QnV0dG9uVGV4dChcIkFkZCBtYXBwaW5nXCIpXHJcbiAgICAgICAgLnNldEN0YSgpXHJcbiAgICAgICAgLm9uQ2xpY2soYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZXh0ZW5zaW9uTWFwcGluZ3MucHVzaCh7IGV4dGVuc2lvbjogXCJcIiwgbGFuZ3VhZ2U6IFwiXCIgfSk7XHJcbiAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcclxuICAgICAgICAgIHRoaXMuZGlzcGxheSgpOyAvLyByZWZyZXNoIHRoZSBzZXR0aW5ncyBkaXNwbGF5XHJcbiAgICAgICAgfSkpO1xyXG5cclxuICAgIC8vIGV4YW1wbGVzIHNlY3Rpb25cclxuICAgIGNvbnRhaW5lckVsLmNyZWF0ZUVsKFwiaDRcIiwgeyB0ZXh0OiBcIkV4YW1wbGVzXCIgfSk7XHJcbiAgICBjb25zdCBleGFtcGxlRWwgPSBjb250YWluZXJFbC5jcmVhdGVFbChcImRpdlwiLCB7IGNsczogXCJjc2gtZXhhbXBsZXNcIiB9KTtcclxuICAgIGV4YW1wbGVFbC5jcmVhdGVFbChcInBcIiwgeyB0ZXh0OiBcIkNvbW1vbiBtYXBwaW5nczpcIiB9KTtcclxuICAgIGNvbnN0IGV4YW1wbGVzID0gW1xyXG4gICAgICBcImpzb24gXHUyMTkyIGpzb24gKG9yIGxlYXZlIGVtcHR5KVwiLFxyXG4gICAgICBcImJpYiBcdTIxOTIgaW5pXCIsXHJcbiAgICAgIFwicHkgXHUyMTkyIHB5dGhvblwiLCBcclxuICAgICAgXCJqcyBcdTIxOTIgamF2YXNjcmlwdFwiLFxyXG4gICAgICBcInR4dCBcdTIxOTIgbWQgKGVuYWJsZSBub3JtYWwgZWRpdGluZywgZGlzYWJsZSBzeW50YXggaGlnaGxpZ2h0aW5nICYgYXV0by1yZWFkaW5nIHZpZXcpXCJcclxuICAgIF07XHJcbiAgICBcclxuICAgIGNvbnN0IGV4YW1wbGVMaXN0ID0gZXhhbXBsZUVsLmNyZWF0ZUVsKFwidWxcIik7XHJcbiAgICBleGFtcGxlcy5mb3JFYWNoKGV4YW1wbGUgPT4ge1xyXG4gICAgICBleGFtcGxlTGlzdC5jcmVhdGVFbChcImxpXCIsIHsgdGV4dDogZXhhbXBsZSB9KTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgcHJpdmF0ZSBjcmVhdGVNYXBwaW5nU2V0dGluZyhjb250YWluZXJFbDogSFRNTEVsZW1lbnQsIG1hcHBpbmc6IEV4dGVuc2lvbk1hcHBpbmcsIGluZGV4OiBudW1iZXIpOiB2b2lkIHtcclxuICAgIGNvbnN0IHNldHRpbmcgPSBuZXcgU2V0dGluZyhjb250YWluZXJFbClcclxuICAgICAgLnNldE5hbWUoYEV4dGVuc2lvbiBtYXBwaW5nICR7aW5kZXggKyAxfWApXHJcbiAgICAgIC5zZXREZXNjKFwiRmlsZSBleHRlbnNpb24gYW5kIGNvcnJlc3BvbmRpbmcgc3ludGF4IGhpZ2hsaWdodGluZyBsYW5ndWFnZVwiKTtcclxuXHJcbiAgICBzZXR0aW5nLmFkZFRleHQodGV4dCA9PiB0ZXh0XHJcbiAgICAgIC5zZXRQbGFjZWhvbGRlcihcIkV4dGVuc2lvbiAoZS5nLiwgdGV4LCBqc29uLCBiaWIpXCIpXHJcbiAgICAgIC5zZXRWYWx1ZShtYXBwaW5nLmV4dGVuc2lvbilcclxuICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xyXG4gICAgICAgIGNvbnN0IHZhbGlkYXRlZCA9IHZhbGlkYXRlRXh0ZW5zaW9uKHZhbHVlKTtcclxuICAgICAgICBtYXBwaW5nLmV4dGVuc2lvbiA9IHZhbGlkYXRlZDtcclxuICAgICAgICB0ZXh0LnNldFZhbHVlKHZhbGlkYXRlZCk7IC8vIHVwZGF0ZSBkaXNwbGF5IHdpdGggdmFsaWRhdGVkIHZhbHVlXHJcbiAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4ucmVmcmVzaEV4dGVuc2lvblJlZ2lzdHJhdGlvbnMoKTtcclxuICAgICAgfSkpO1xyXG5cclxuICAgIHNldHRpbmcuYWRkVGV4dCh0ZXh0ID0+IHRleHRcclxuICAgICAgLnNldFBsYWNlaG9sZGVyKFwiTGFuZ3VhZ2UgKGUuZy4sIHRleCwganNvbiwgaW5pKSAtIGxlYXZlIGVtcHR5IHRvIHVzZSBleHRlbnNpb25cIilcclxuICAgICAgLnNldFZhbHVlKG1hcHBpbmcubGFuZ3VhZ2UpXHJcbiAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcclxuICAgICAgICBtYXBwaW5nLmxhbmd1YWdlID0gdmFsaWRhdGVMYW5ndWFnZSh2YWx1ZSk7XHJcbiAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgIH0pKTtcclxuXHJcbiAgICBzZXR0aW5nLmFkZEJ1dHRvbihidXR0b24gPT4gYnV0dG9uXHJcbiAgICAgIC5zZXRCdXR0b25UZXh0KFwiUmVtb3ZlXCIpXHJcbiAgICAgIC5zZXRXYXJuaW5nKClcclxuICAgICAgLm9uQ2xpY2soYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmV4dGVuc2lvbk1hcHBpbmdzLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XHJcbiAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4ucmVmcmVzaEV4dGVuc2lvblJlZ2lzdHJhdGlvbnMoKTtcclxuICAgICAgICB0aGlzLmRpc3BsYXkoKTsgLy8gcmVmcmVzaCB0aGUgc2V0dGluZ3MgZGlzcGxheVxyXG4gICAgICB9KSk7XHJcbiAgfVxyXG59XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQUFBQSxtQkFBbUY7OztBQ1U1RSxJQUFNLG1CQUFnQztBQUFBLEVBQzNDLG1CQUFtQjtBQUFBLElBQ2pCLEVBQUUsV0FBVyxPQUFPLFVBQVUsR0FBRztBQUFBLElBQ2pDLEVBQUUsV0FBVyxRQUFRLFVBQVUsR0FBRztBQUFBLElBQ2xDLEVBQUUsV0FBVyxRQUFRLFVBQVUsR0FBRztBQUFBLElBQ2xDLEVBQUUsV0FBVyxPQUFPLFVBQVUsTUFBTTtBQUFBLElBQ3BDLEVBQUUsV0FBVyxPQUFPLFVBQVUsS0FBSztBQUFBLEVBQ3JDO0FBQUEsRUFDQSxxQkFBcUI7QUFDdkI7QUFFTyxTQUFTLGtCQUFrQixLQUFxQjtBQUNyRCxRQUFNLFVBQVUsSUFBSSxZQUFZLEVBQUUsUUFBUSxjQUFjLEVBQUU7QUFFMUQsTUFBSSxZQUFZO0FB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LEtBQUssU0FBUyxHQUFHO0FBRWpGLGNBQU0sV0FBVyxLQUFLLG1CQUFtQixLQUFLLEtBQUssSUFBSTtBQUN2RCxZQUFJLGFBQWEsUUFBUSxhQUFhO0FBQVk7QUFFbEQsYUFBSyxTQUFTLEVBQUUsTUFBTSxVQUFVLEdBQUcsRUFBRSxTQUFTLE1BQU0sQ0FBQztBQUFBLE1BQ3ZEO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUVNLGVBQWU7QUFBQTtBQUNuQixXQUFLLFdBQVcsT0FBTyxPQUFPLENBQUMsR0FBRyxrQkFBa0IsTUFBTSxLQUFLLFNBQVMsQ0FBQztBQUl6RSxVQUFJLGlCQUFpQjtBQUdyQixZQUFNLGlCQUFpQixLQUFLLFNBQVMsa0JBQWtCO0FBQ3ZELFdBQUssU0FBUyxvQkFBb0IsS0FBSyxTQUFTLGtCQUFrQjtBQUFBLFFBQU8sYUFDdkUsUUFBUSxVQUFVLFlBQVksTUFBTTtBQUFBLE1BQ3RDO0FBQ0EsVUFBSSxLQUFLLFNBQVMsa0JBQWtCLFdBQVcsZ0JBQWdCO0FBQzdELHlCQUFpQjtBQUFBLE1BQ25CO0FBRUEsaUJBQVcsV0FBVyxLQUFLLFNBQVMsbUJBQW1CO0FBQ3JELFlBQUksUUFBUSxhQUFhLFVBQVUsUUFBUSxjQUFjLFFBQVE7QUFDL0Qsa0JBQVEsV0FBVztBQUNuQiwyQkFBaUI7QUFBQSxRQUNuQjtBQUFBLE1BQ0Y7QUFFQSxVQUFJLGdCQUFnQjtBQUNsQixjQUFNLEtBQUssYUFBYTtBQUFBLE1BQzFCO0FBQUEsSUFDRjtBQUFBO0FBQUEsRUFFTSxlQUFlO0FBQUE7QUFDbkIsWUFBTSxLQUFLLFNBQVMsS0FBSyxRQUFRO0FBQUEsSUFDbkM7QUFBQTtBQUNGOyIsCiAgIm5hbWVzIjogWyJpbXBvcnRfb2JzaWRpYW4iLCAiY3R4IiwgImxhbmd1YWdlIiwgIl9hIiwgInNlY3Rpb24iLCAicHJldmlldyIsICJzaXplciJdCn0K
