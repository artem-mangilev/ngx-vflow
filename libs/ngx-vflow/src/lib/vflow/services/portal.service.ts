import { Injectable, Signal, TemplateRef, computed, signal } from '@angular/core';
import { Point } from '../interfaces/point.interface';

/** The layer of the viewport where a portal renders its content: above the nodes and edges, or below them. */
export type PortalLayer = 'above' | 'below';

/** A template of the application that the flow renders in one of its portal layers. */
export interface PortalEntry {
  readonly templateRef: TemplateRef<void>;
  /** Flow-space point of the content's top-left corner; nothing renders without one. */
  readonly point: Signal<Point | null | undefined>;
  readonly layer: Signal<PortalLayer>;
}

/** The portals of one flow, in the order they were declared. */
@Injectable()
export class PortalService {
  private readonly entries = signal<readonly PortalEntry[]>([]);

  public readonly above = computed(() => this.entries().filter((entry) => entry.layer() === 'above'));

  public readonly below = computed(() => this.entries().filter((entry) => entry.layer() === 'below'));

  /** Adds the entry; returns the function that removes it. */
  public add(entry: PortalEntry): () => void {
    this.entries.update((entries) => [...entries, entry]);
    return () => this.entries.update((entries) => entries.filter((other) => other !== entry));
  }
}
