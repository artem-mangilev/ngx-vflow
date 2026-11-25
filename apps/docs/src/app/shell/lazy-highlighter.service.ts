import { Injectable } from '@angular/core';
import { NgDocHighlighterService } from '@ng-doc/app';

type HighlighterConfig = Parameters<NgDocHighlighterService['initialize']>[0];

/**
 * The code highlighter of NgDoc, loaded when code is first highlighted in the browser.
 *
 * NgDoc starts its highlighter with the application, and that downloads Shiki (about 300 KB gzipped) on every page.
 * The code blocks of the pages are highlighted at build time; only code rendered in the browser needs Shiki: the
 * `ngDocHighlighter` directive, which the landing page and NgDoc's playgrounds use. So the start is kept for the first
 * `highlight()`. The directive reads `ready()`, and highlights again when Shiki has loaded.
 */
@Injectable()
export class LazyHighlighterService extends NgDocHighlighterService {
  private shikiConfig: HighlighterConfig;

  /** NgDoc calls this when the application starts: the configuration is kept, and nothing is loaded. */
  override initialize(config?: HighlighterConfig): Promise<void> {
    this.shikiConfig = config;

    return Promise.resolve();
  }

  override highlight(code: string): string {
    // Repeated calls share one load; a failed one is retried by the next code that is highlighted.
    if (!this.ready()) super.initialize(this.shikiConfig).catch(() => undefined);

    return super.highlight(code);
  }
}
