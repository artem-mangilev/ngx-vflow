import { afterEveryRender, ElementRef, inject, signal } from '@angular/core';

interface Visibility {
  /** Field IDs whose rows are at least partly visible in the scroll box. */
  visible: Set<string>;
  above: string[];
  below: string[];
  /** Changes on every scroll so visible rows are re-created and their handles re-measured. */
  key: number;
}

const ALL_VISIBLE: Visibility = { visible: new Set(), above: [], below: [], key: 0 };

/**
 * An application policy for rows hidden by a scroll box, not a library contract: rows in view keep their handles,
 * hidden rows hand their endpoints to proxy handles with the same IDs at the nearest border (header or footer).
 * Core measures handles after render, resize and structure changes, not on scroll, so the rows in view are
 * re-created on scroll to be measured again.
 *
 * The scroll box carries `data-rows="<node id>"` and its rows `data-field="<field id>"`; call `onScroll` from the box.
 */
export class ScrollRows<Field extends { id: string }> {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly views = signal<Record<string, Visibility>>({});
  private readonly lastTop: Record<string, number> = {};

  constructor() {
    // Classify each scroll box once it exists, so hidden rows start on the borders as well.
    afterEveryRender(() => {
      for (const box of Array.from(this.host.querySelectorAll<HTMLElement>('[data-rows]'))) {
        const id = box.dataset['rows']!;
        if (!(id in this.lastTop)) this.classify(id, box);
      }
    });
  }

  visibility(nodeId: string): Visibility {
    return this.views()[nodeId] ?? ALL_VISIBLE;
  }

  /** Rows with a key that changes on scroll for visible rows, so they are re-created and measured again. */
  rows(nodeId: string, fields: Field[]) {
    const view = this.visibility(nodeId);
    return fields.map((field) => {
      const handles = view.key === 0 || view.visible.has(field.id);
      return { field, handles, key: `${field.id}:${handles ? view.key : 0}` };
    });
  }

  /** The fields of the given IDs, for the proxy handles of a border. */
  hidden(fields: Field[], ids: string[]) {
    return fields.filter((field) => ids.includes(field.id));
  }

  /** Forgets a node's classification after its rows change, so it is classified again after the next render. */
  reset(nodeId: string) {
    delete this.lastTop[nodeId];
    this.views.update((views) => ({ ...views, [nodeId]: ALL_VISIBLE }));
  }

  onScroll(nodeId: string, event: Event) {
    this.classify(nodeId, event.target as HTMLElement);
  }

  /** Classify rows by their position in the scroll box; the application decides where hidden endpoints go. */
  private classify(nodeId: string, box: HTMLElement) {
    const top = box.scrollTop;
    // Re-creating rows can emit scroll events; only a real scroll offset change re-classifies.
    if (this.lastTop[nodeId] === top) return;
    this.lastTop[nodeId] = top;
    const frame = box.getBoundingClientRect();
    const visible = new Set<string>();
    const above: string[] = [];
    const below: string[] = [];
    for (const row of Array.from(box.querySelectorAll<HTMLElement>('[data-field]'))) {
      const id = row.dataset['field']!;
      const rect = row.getBoundingClientRect();
      if (rect.bottom <= frame.top) above.push(id);
      else if (rect.top >= frame.bottom) below.push(id);
      else visible.add(id);
    }
    this.views.update((views) => ({
      ...views,
      [nodeId]: { visible, above, below, key: (views[nodeId]?.key ?? 0) + 1 },
    }));
  }
}
