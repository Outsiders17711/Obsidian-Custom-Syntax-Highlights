import { MarkdownRenderChild, MarkdownRenderer, TFile } from "obsidian";
import type cshPlugin from "../../main";
import { getFileExtension, getLanguageForFile, isConfiguredExtension } from "../utils/extension";
import type { SizerManager } from "../utils/manageSizer";

/**
 * custom markdownrenderchild for syntax highlighting
 */
class SyntaxHighlightRenderChild extends MarkdownRenderChild {
  constructor(
    private plugin: cshPlugin,
    containerEl: HTMLElement,
    private ctx: any,
    private sizerManager: SizerManager
  ) {
    super(containerEl);
  }

  async onload() {
    try {
      const file = this.plugin.app.vault.getAbstractFileByPath(this.ctx.sourcePath);
      if (!(file instanceof TFile)) return;
      
      const content = await this.plugin.app.vault.cachedRead(file);
      const language = getLanguageForFile(this.ctx.sourcePath, this.plugin.settings);
      const md = '```' + language + '\n' + content + '\n```';
      
      await MarkdownRenderer.render(
        this.plugin.app,
        md,
        this.containerEl,
        this.ctx.sourcePath,
        this.plugin
      );
    } catch (e) {
      console.error('custom-syntax-highlights: reading render failed', e);
    }
  }

  onunload() {
    this.cleanupStyles();
  }

  private cleanupStyles() {
    const section = this.containerEl as HTMLElement;
    const preview = section.closest('.markdown-preview-view') as HTMLElement | null;
    const sizer = section.parentElement as HTMLElement | null;
    
    preview?.classList?.remove('csh-mode');
    
    if (sizer && this.sizerManager.has(sizer)) {
      this.sizerManager.delete(sizer);
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
}

/**
 * markdown post processor for syntax highlighting
 */
export function createMarkdownPostProcessor(plugin: cshPlugin, sizerManager: SizerManager) {
  return (el: HTMLElement, ctx: any) => {
    const path = ctx.sourcePath?.toLowerCase();
    if (!path) return;

    const fileExtension = getFileExtension(path);
    if (!fileExtension || !isConfiguredExtension(fileExtension, plugin.settings)) return;

    // if language is set to 'md' or 'markdown', let obsidian handle it normally
    const language = getLanguageForFile(path, plugin.settings);
    if (language === 'md' || language === 'markdown') return;

    const info = ctx.getSectionInfo?.(el as HTMLElement);
    if (!info) return;

    const section = el as HTMLElement;

    // for non-first sections, just hide their content but keep the section structure
    if (info.lineStart !== 0) {
      hideSection(section);
      return;
    }

    // first section: replace its contents once and render fenced code block
    if (section.classList.contains('csh-rendered')) return;
    section.classList.add('csh-rendered');
    
    setupFirstSection(sizerManager, section);
    
    const child = new SyntaxHighlightRenderChild(plugin, section, ctx, sizerManager);
    ctx.addChild(child);
  };
}

function hideSection(section: HTMLElement) {
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
}

function setupFirstSection(sizerManager: SizerManager, section: HTMLElement) {
  // improve container styling for better layout
  const sizer = section.parentElement as HTMLElement | null;
  const preview = section.closest('.markdown-preview-view') as HTMLElement | null;
  preview?.classList.add('csh-mode');
  
  // better sizer handling - don't remove pushers completely, just adjust their height
  if (sizer && !sizerManager.has(sizer)) {
    sizerManager.add(sizer);
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
}
