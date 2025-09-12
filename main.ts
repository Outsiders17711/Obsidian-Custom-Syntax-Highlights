import { MarkdownRenderChild, MarkdownRenderer, MarkdownView, Plugin, TFile } from "obsidian";
import { cshSettings, DEFAULT_SETTINGS } from "./src/settings";
import { cshSettingTab } from "./src/settings-tab";

export default class cshPlugin extends Plugin {
  private processedSizers = new WeakSet<HTMLElement>();
  settings: cshSettings;
  private registeredExtensions = new Set<string>();

  async onload() {
    await this.loadSettings();
    
    // Add settings tab
    this.addSettingTab(new cshSettingTab(this.app, this));

    // Register extensions and set up event handlers
    await this.refreshExtensionRegistrations();

    // Set up file-open event handler for auto-switching to reading view
    this.registerEvent(this.app.workspace.on("file-open", (file) => {
      if (!this.settings.autoSwitchToReading) return;
      
      if (file instanceof TFile && this.isConfiguredExtension(file.extension)) {
        // find the leaf with this file and switch to reading view
        const leaves = this.app.workspace.getLeavesOfType("markdown");
        for (const leaf of leaves) {
          const view = leaf.view as MarkdownView;
          if (view.file === file) {
            // switch to reading view
            view.setState({ mode: "preview" }, { history: false });
            break;
          }
        }
      }
    }));

    // reading mode: show only a single fenced code block of the file
    // replace content of all sections with the rendered code block, but keep sections visible for proper virtualization
    this.registerMarkdownPostProcessor((el, ctx) => {
      const path = ctx.sourcePath?.toLowerCase();
      if (!path) return;

      const fileExtension = this.getFileExtension(path);
      if (!fileExtension || !this.isConfiguredExtension(fileExtension)) return;

      const info = ctx.getSectionInfo?.(el as HTMLElement);
      if (!info) return;

      const section = el as HTMLElement;

      // for non-first sections, just hide their content but keep the section structure
      if (info.lineStart !== 0) {
        if (!section.classList.contains('csh-hidden')) {
          section.classList.add('csh-hidden');
          while (section.firstChild) section.removeChild(section.firstChild);
          // keep minimal height to maintain scroll calculations
          section.style.height = "1px";
          section.style.minHeight = "1px";
          section.style.margin = "0";
          section.style.padding = "0";
          section.style.visibility = "hidden";
        }
        return;
      }

      // first section: replace its contents once and render fenced code block
      if (section.classList.contains('csh-rendered')) return;
      section.classList.add('csh-rendered');
      
      // improve container styling for better layout
      const sizer = section.parentElement as HTMLElement | null;
      const preview = section.closest('.markdown-preview-view') as HTMLElement | null;
      preview?.classList.add('csh-mode');
      
      // better sizer handling - don't remove pushers completely, just adjust their height
      if (sizer && !this.processedSizers.has(sizer)) {
        this.processedSizers.add(sizer);
        const pushers = sizer.querySelectorAll('.markdown-preview-pusher');
        pushers.forEach((pusher) => {
          const pusherEl = pusher as HTMLElement;
          pusherEl.style.height = '0px';
          pusherEl.style.minHeight = '0px';
        });
        sizer.style.paddingBottom = '8px';
      }
      
      section.style.margin = "0";
      section.style.padding = "8px 0";
      while (section.firstChild) section.removeChild(section.firstChild);

      const child = new (class extends MarkdownRenderChild {
        constructor(private plugin: cshPlugin, containerEl: HTMLElement, private ctx: any) {
          super(containerEl);
        }
        async onload() {
          try {
            const file = this.plugin.app.vault.getAbstractFileByPath(this.ctx.sourcePath);
            if (!(file instanceof TFile)) return;
            const content = await this.plugin.app.vault.cachedRead(file);
            const language = this.plugin.getLanguageForFile(this.ctx.sourcePath);
            const md = '```' + language + '\n' + content + '\n```';
            await MarkdownRenderer.render(this.plugin.app, md, this.containerEl, this.ctx.sourcePath, this.plugin);
          } catch (e) {
            console.error('custom-syntax-highlights: reading render failed', e);
          }
        }
        onunload() {
          // cleanup mode class and sizer styles
          const section = this.containerEl as HTMLElement;
          const preview = section.closest('.markdown-preview-view') as HTMLElement | null;
          const sizer = section.parentElement as HTMLElement | null;
          preview?.classList?.remove('csh-mode');
          if (sizer && this.plugin.processedSizers.has(sizer)) {
            this.plugin.processedSizers.delete(sizer);
            // restore pusher heights
            const pushers = sizer.querySelectorAll('.markdown-preview-pusher');
            pushers.forEach((pusher) => {
              const pusherEl = pusher as HTMLElement;
              pusherEl.style.height = '';
              pusherEl.style.minHeight = '';
            });
            sizer.style.paddingBottom = '';
          }
          // clean up hidden sections
          const allSections = preview?.querySelectorAll('.csh-hidden');
          allSections?.forEach((hiddenSection) => {
            const hiddenEl = hiddenSection as HTMLElement;
            hiddenEl.classList.remove('csh-hidden');
            hiddenEl.style.height = '';
            hiddenEl.style.minHeight = '';
            hiddenEl.style.margin = '';
            hiddenEl.style.padding = '';
            hiddenEl.style.visibility = '';
          });
        }
      })(this, section, ctx);

      ctx.addChild(child);
    });

    // apply to all currently open files with configured extensions
    this.applyToAllOpen();
  }

  private getFileExtension(path: string): string | null {
    const lastDot = path.lastIndexOf('.');
    if (lastDot === -1) return null;
    return path.substring(lastDot + 1).toLowerCase();
  }

  private isConfiguredExtension(extension: string): boolean {
    return this.settings.extensionMappings.some(mapping => 
      mapping.extension.toLowerCase() === extension.toLowerCase()
    );
  }

  private getLanguageForFile(path: string): string {
    const extension = this.getFileExtension(path);
    if (!extension) return 'text';
    
    const mapping = this.settings.extensionMappings.find(m => 
      m.extension.toLowerCase() === extension.toLowerCase()
    );
    
    if (!mapping) return 'text';
    // use the language if it's specified and not empty, otherwise fall back to extension
    return (mapping.language && mapping.language.trim()) ? mapping.language : extension;
  }

  async refreshExtensionRegistrations() {
    // Get all configured extensions
    const extensions = this.settings.extensionMappings
      .map(m => m.extension)
      .filter(ext => ext.length > 0);

    // Register new extensions
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

    // Apply to currently open files
    this.applyToAllOpen();
  }

  private applyToAllOpen() {
    if (!this.settings.autoSwitchToReading) return;
    
    // switch any currently open files with configured extensions to reading view
    const leaves = this.app.workspace.getLeavesOfType("markdown");
    for (const leaf of leaves) {
      const view = leaf.view as MarkdownView;
      if (view.file instanceof TFile && this.isConfiguredExtension(view.file.extension)) {
        view.setState({ mode: "preview" }, { history: false });
      }
    }
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    
    // migration: clean up language fields that were set to 'text' when they should be empty
    // this fixes the bug where clearing language field resulted in 'text' instead of fallback to extension
    let needsMigration = false;
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
