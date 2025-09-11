import { StreamLanguage, defaultHighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { stex } from "@codemirror/legacy-modes/mode/stex";
import { Compartment, StateEffect } from "@codemirror/state";
import type { EditorView } from "@codemirror/view";
import { MarkdownRenderChild, MarkdownRenderer, MarkdownView, Plugin, TFile } from "obsidian";

export default class TexInlineHighlight extends Plugin {
  private lang = new Compartment();
  private processedSizers = new WeakSet<HTMLElement>();

  async onload() {
    // If another plugin already registered .tex, ignore the error gracefully
    try {
      // Open .tex files in the markdown editor (so we get a CM6 editor)
      this.registerExtensions(["tex"], "markdown");
    } catch (e) {
      // noop: another plugin likely registered this mapping
      // @ts-ignore
      console.debug("latex-syntax-highlight: extension mapping already registered");
    }
    // create a compartment we can reconfigure per editor
    this.registerEditorExtension(this.lang.of([]));

    // whenever the active leaf changes, (re)apply latex if it's a .tex
    this.registerEvent(this.app.workspace.on("active-leaf-change", () => this.applyToActive()));
    // and when a file is opened in any leaf
    this.registerEvent(this.app.workspace.on("file-open", () => this.applyToActive()));

    // Reading mode: Show only a single fenced `tex` block of the file
    // Implementation: Replace content of all sections with the rendered code block, but keep sections visible for proper virtualization
    this.registerMarkdownPostProcessor((el, ctx) => {
      const path = ctx.sourcePath?.toLowerCase();
      if (!path || !path.endsWith(".tex")) return;

      const info = ctx.getSectionInfo?.(el as HTMLElement);
      if (!info) return;

      const section = el as HTMLElement;

      // For non-first sections, just hide their content but keep the section structure
      if (info.lineStart !== 0) {
        if (!section.classList.contains('tex-inline-hidden')) {
          section.classList.add('tex-inline-hidden');
          while (section.firstChild) section.removeChild(section.firstChild);
          // Keep minimal height to maintain scroll calculations
          section.style.height = "1px";
          section.style.minHeight = "1px";
          section.style.margin = "0";
          section.style.padding = "0";
          section.style.visibility = "hidden";
        }
        return;
      }

      // First section: replace its contents once and render fenced tex
      if (section.classList.contains('tex-inline-rendered')) return;
      section.classList.add('tex-inline-rendered');
      
      // Improve container styling for better layout
      const sizer = section.parentElement as HTMLElement | null;
      const preview = section.closest('.markdown-preview-view') as HTMLElement | null;
      preview?.classList.add('tex-inline-mode');
      
      // Better sizer handling - don't remove pushers completely, just adjust their height
      if (sizer && !this.processedSizers.has(sizer)) {
        this.processedSizers.add(sizer);
        const pushers = sizer.querySelectorAll('.markdown-preview-pusher');
        pushers.forEach((pusher) => {
          const pusherEl = pusher as HTMLElement;
          pusherEl.style.height = '0px';
          pusherEl.style.minHeight = '0px';
        });
        sizer.style.paddingBottom = '8px'; // Small padding instead of 0
      }
      
      // Clean section styling
      section.style.margin = "0";
      section.style.padding = "8px 0"; // Small padding for readability
      while (section.firstChild) section.removeChild(section.firstChild);

      const child = new (class extends MarkdownRenderChild {
        constructor(private plugin: TexInlineHighlight, containerEl: HTMLElement, private ctx: any) {
          // @ts-ignore
          super(containerEl);
        }
        async onload() {
          try {
            const file = this.plugin.app.vault.getAbstractFileByPath(this.ctx.sourcePath);
            if (!(file instanceof TFile)) return;
            const content = await this.plugin.app.vault.cachedRead(file);
            const md = '```tex\n' + content + '\n```';
            await MarkdownRenderer.render(this.plugin.app, md, this.containerEl, this.ctx.sourcePath, this.plugin);
          } catch (e) {
            console.error('latex-syntax-highlight: reading render failed', e);
          }
        }
        onunload() {
          // Cleanup mode class and sizer styles
          const section = this.containerEl as HTMLElement;
          const preview = section.closest('.markdown-preview-view') as HTMLElement | null;
          const sizer = section.parentElement as HTMLElement | null;
          preview?.classList?.remove('tex-inline-mode');
          if (sizer && this.plugin.processedSizers.has(sizer)) {
            this.plugin.processedSizers.delete(sizer);
            // Restore pusher heights
            const pushers = sizer.querySelectorAll('.markdown-preview-pusher');
            pushers.forEach((pusher) => {
              const pusherEl = pusher as HTMLElement;
              pusherEl.style.height = '';
              pusherEl.style.minHeight = '';
            });
            sizer.style.paddingBottom = '';
          }
          // Clean up hidden sections
          const allSections = preview?.querySelectorAll('.tex-inline-hidden');
          allSections?.forEach((hiddenSection) => {
            const hiddenEl = hiddenSection as HTMLElement;
            hiddenEl.classList.remove('tex-inline-hidden');
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

    // apply to all currently open markdown editors
    this.applyToAllOpen();
  }

  private applyToActive() {
    const leaf = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (leaf) this.applyToView(leaf);
  }

  private applyToAllOpen() {
    const leaves = this.app.workspace.getLeavesOfType("markdown");
    for (const leaf of leaves) {
      const view = leaf.view as MarkdownView;
      this.applyToView(view);
    }
  }

  private applyToView(leaf: MarkdownView) {
    const file = leaf.file;
    const isTex = file instanceof TFile && file.extension.toLowerCase() === "tex";
    // @ts-ignore private api but stable in practice
    const view: EditorView | undefined = leaf?.editor?.cm;
    if (!view) return;
    if (!this.lang.get(view.state)) {
      view.dispatch({ effects: StateEffect.appendConfig.of(this.lang.of([])) });
    }
    const ext = isTex
      ? [StreamLanguage.define(stex), syntaxHighlighting(defaultHighlightStyle, { fallback: true })]
      : [];
    view.dispatch({ effects: this.lang.reconfigure(ext) });
  }
}
