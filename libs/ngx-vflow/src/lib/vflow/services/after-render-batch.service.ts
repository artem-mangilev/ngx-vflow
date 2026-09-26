import { Injectable, Injector, afterNextRender, inject, untracked } from '@angular/core';

/**
 * Runs DOM reads once after the next render, for every entity that asked in the meantime. One registration serves
 * all of them: a per-entity `afterRenderEffect` stays registered for the life of the entity, and Angular walks
 * every registered hook on every change detection pass, which on a large graph costs milliseconds per frame.
 */
@Injectable()
export class AfterRenderBatchService {
  private readonly injector = inject(Injector);
  private readonly reads = new Set<() => void>();
  private scheduled = false;

  /** Queues a read for after the next render. A callback queued again before it ran still runs once. */
  public read(callback: () => void): void {
    this.reads.add(callback);
    if (this.scheduled) return;
    this.scheduled = true;
    // Callers are effects; registering a hook is not a reactive read.
    untracked(() => afterNextRender({ read: () => this.flush() }, { injector: this.injector }));
  }

  private flush() {
    this.scheduled = false;
    const reads = [...this.reads];
    this.reads.clear();
    for (const read of reads) read();
  }
}
