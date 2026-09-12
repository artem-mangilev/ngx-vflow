import { ChangeDetectionStrategy, Component, Directive, computed, input } from '@angular/core';
import { VflowComponent } from 'ngx-vflow';

const BUTTON =
  'vui-control-button vui:inline-grid vui:box-border vui:place-items-center vui:size-8 vui:rounded-md vui:border vui:border-border vui:bg-surface vui:text-foreground vui:cursor-pointer vui:enabled:hover:bg-surface-muted vui:disabled:opacity-45 vui:disabled:cursor-not-allowed vui:focus-visible:outline-2 vui:focus-visible:outline-offset-2 vui:focus-visible:outline-accent vui:forced-colors:border-[ButtonText]';

/** Presentation for a consumer button placed inside `vflow-controls`; give it an accessible name. */
@Directive({ selector: 'button[vflowControlButton]', host: { class: BUTTON } })
export class VflowControlButton {}

export interface VflowControlsLabels {
  group: string;
  zoomIn: string;
  zoomOut: string;
  fitView: string;
}

/**
 * Viewport controls: zoom in, zoom out and fit view for the given flow instance, plus a slot for your
 * own `vflowControlButton` buttons. Zoom respects the flow's `minZoom`/`maxZoom`; positioning is yours.
 */
@Component({
  selector: 'vflow-controls',
  imports: [VflowControlButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'vui-controls vui:inline-flex vui:box-border vui:items-center vui:gap-1 vui:p-1 vui:rounded-lg vui:border vui:border-border vui:bg-surface vui:font-sans vui:shadow-[0_3px_10px_#0000001a]',
    role: 'group',
    '[attr.aria-label]': 'labels().group',
  },
  template: `
    <button
      vflowControlButton
      type="button"
      [attr.aria-label]="labels().zoomIn"
      [disabled]="!canZoomIn()"
      (click)="zoomBy(1)">
      <svg
        aria-hidden="true"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round">
        <path d="M8 3v10M3 8h10" />
      </svg>
    </button>
    <button
      vflowControlButton
      type="button"
      [attr.aria-label]="labels().zoomOut"
      [disabled]="!canZoomOut()"
      (click)="zoomBy(-1)">
      <svg
        aria-hidden="true"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round">
        <path d="M3 8h10" />
      </svg>
    </button>
    <button vflowControlButton type="button" [attr.aria-label]="labels().fitView" (click)="flow().fitView()">
      <svg
        aria-hidden="true"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round">
        <path d="M6 2H2v4M10 2h4v4M6 14H2v-4M10 14h4v-4" />
      </svg>
    </button>
    <ng-content />
  `,
})
export class VflowControls {
  /** The flow these controls operate on. */
  readonly flow = input.required<VflowComponent>();
  /** Multiplicative zoom step per click. */
  readonly step = input(1.2);
  readonly labels = input<VflowControlsLabels>({
    group: 'Viewport controls',
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    fitView: 'Fit view',
  });

  protected readonly zoom = computed(() => this.flow().viewport().zoom);
  protected readonly canZoomIn = computed(() => this.zoom() < this.flow().maxZoom - 1e-6);
  protected readonly canZoomOut = computed(() => this.zoom() > this.flow().minZoom + 1e-6);

  protected zoomBy(direction: 1 | -1) {
    const flow = this.flow();
    const step = Number.isFinite(this.step()) && this.step() > 1 ? this.step() : 1.2;
    const next = this.zoom() * step ** direction;
    flow.zoomTo(Math.min(flow.maxZoom, Math.max(flow.minZoom, next)));
  }
}
