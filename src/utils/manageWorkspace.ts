import { MarkdownView, TFile, Workspace } from "obsidian";
import { cshSettings } from "../settings";
import { getLanguageForFile, isConfiguredExtension } from "./extension";

/**
 * workspace management utilities for handling file switching and views
 */

export function setupFileOpenHandler(workspace: Workspace, settings: cshSettings) {
  return workspace.on("file-open", (file) => {
    if (!settings.autoSwitchToReading) return;
    
    if (file instanceof TFile && isConfiguredExtension(file.extension, settings)) {
      // if language is set to 'md' or 'markdown', don't auto-switch to reading view
      // this allows normal editing of the file as if it were a regular markdown file
      const language = getLanguageForFile(file.path, settings);
      if (language === 'md' || language === 'markdown') return;
      
      // find the leaf with this file and switch to reading view
      const leaves = workspace.getLeavesOfType("markdown");
      for (const leaf of leaves) {
        const view = leaf.view as MarkdownView;
        if (view.file === file) {
          // switch to reading view
          view.setState({ mode: "preview" }, { history: false });
          break;
        }
      }
    }
  });
}

export function applyToAllOpenFiles(workspace: Workspace, settings: cshSettings) {
  if (!settings.autoSwitchToReading) return;
  
  // switch any currently open files with configured extensions to reading view
  const leaves = workspace.getLeavesOfType("markdown");
  for (const leaf of leaves) {
    const view = leaf.view as MarkdownView;
    if (view.file instanceof TFile && isConfiguredExtension(view.file.extension, settings)) {
      // don't auto-switch files with 'md' language - let them be edited normally
      const language = getLanguageForFile(view.file.path, settings);
      if (language === 'md' || language === 'markdown') continue;
      
      view.setState({ mode: "preview" }, { history: false });
    }
  }
}
