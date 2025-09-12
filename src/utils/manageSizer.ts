/**
 * manager for tracking processed sizers to avoid duplicate processing
 */
export class SizerManager {
  private processedSizers = new WeakSet<HTMLElement>();

  has(sizer: HTMLElement): boolean {
    return this.processedSizers.has(sizer);
  }

  add(sizer: HTMLElement): void {
    this.processedSizers.add(sizer);
  }

  delete(sizer: HTMLElement): void {
    this.processedSizers.delete(sizer);
  }

  clear(): void {
    // weakset doesn't have a clear method, but we can create a new instance
    this.processedSizers = new WeakSet<HTMLElement>();
  }
}
