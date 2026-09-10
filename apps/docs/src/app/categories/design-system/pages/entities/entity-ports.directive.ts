import { afterEveryRender, DestroyRef, Directive, ElementRef, inject, output } from '@angular/core';

/** Application-owned docking recipe for this demo's small fixed field sets.
 * Ports live outside overflow/display:none content and retain their identity.
 */
@Directive({ selector: '[entityPorts]' })
export class EntityPortsDirective {
  /** Emitted after position-only CSS writes; the caller invalidates its node. */
  readonly portsPlaced = output<void>();
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly destroyRef = inject(DestroyRef);
  private readonly observer = new ResizeObserver(() => this.place());
  private fields: HTMLElement | null = null;
  private readonly onScroll = () => this.place();

  constructor() {
    afterEveryRender(() => {
      if (!this.fields) {
        this.fields = this.host.querySelector('.fields');
        this.fields?.addEventListener('scroll', this.onScroll, { passive: true });
        this.observer.observe(this.host);
      }
      this.place();
    });
    this.destroyRef.onDestroy(() => {
      this.fields?.removeEventListener('scroll', this.onScroll);
      this.observer.disconnect();
    });
  }

  private place(): void {
    const fields = this.fields;
    if (!fields) return;
    const hostRect = this.host.getBoundingClientRect();
    const scale = hostRect.width / this.host.offsetWidth;
    if (!scale) return; // Culled nodes retain their last placement.
    const header = this.host.querySelector('header')!;
    const collapsed = fields.getClientRects().length === 0;
    const bounds = (collapsed ? header : fields).getBoundingClientRect();
    const origin = hostRect.top + this.host.clientTop * scale;
    const anchors = Array.from(this.host.querySelectorAll<HTMLElement>('[data-port-field]'));
    const rows = Array.from(fields.querySelectorAll<HTMLElement>('[data-field]'));
    const min = (bounds.top - origin) / scale + 6;
    const max = (bounds.bottom - origin) / scale - 6;
    const gap = Math.min(12, Math.max(0, (max - min) / Math.max(1, anchors.length - 1)));
    // Read every row before writing. Preserve field order when multiple ports
    // dock to the same boundary, rather than making them unclickable overlaps.
    const positions = anchors.map((anchor, i) => {
      if (collapsed) return min + ((max - min) * (i + 1)) / (anchors.length + 1);
      const row = rows.find((row) => row.dataset['field'] === anchor.dataset['portField'])!;
      const rect = row.getBoundingClientRect();
      return Math.max(min, Math.min(max, (rect.top + rect.height / 2 - origin) / scale));
    });
    for (let i = 1; i < positions.length; i++) positions[i] = Math.max(positions[i], positions[i - 1] + gap);
    if (positions.length) positions[positions.length - 1] = Math.min(max, positions[positions.length - 1]);
    for (let i = positions.length - 2; i >= 0; i--) positions[i] = Math.min(positions[i], positions[i + 1] - gap);
    let changed = false;
    anchors.forEach((anchor, i) => {
      const top = positions[i];
      // CSSOM rounds serialized decimals. Comparing strings would emit on every
      // afterRender and the Angular output would trigger an endless render loop.
      const current = parseFloat(anchor.style.top);
      if (!Number.isFinite(current) || Math.abs(current - top) > 0.001) {
        anchor.style.top = `${top}px`;
        changed = true;
      }
    });
    // CSS position-only changes do not fire ResizeObserver.
    if (changed) this.portsPlaced.emit();
  }
}
