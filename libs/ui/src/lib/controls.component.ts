import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { VflowComponent } from 'ngx-vflow';

export interface VuiControlsLabels {
  group: string;
  zoomIn: string;
  zoomOut: string;
  fitView: string;
}

/**
 * Viewport controls: zoom in, zoom out and fit view for the given flow instance, plus a slot for your own buttons.
 * Every button child, built-in or projected, is a square icon button without a fill at rest; give a projected one an
 * accessible name. Zoom respects the flow's `minZoom`/`maxZoom`; positioning is yours.
 */
@Component({
  selector: 'vui-controls',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: `vui-controls
      inline-flex box-border items-center gap-vui-1 p-vui-1 rounded-vui-surface
      bg-vui-surface/85 backdrop-blur-vui-material backdrop-saturate-180 shadow-vui-floating antialiased
      forced-colors:border forced-colors:border-[CanvasText]
      [&>button]:inline-flex [&>button]:box-border [&>button]:items-center [&>button]:justify-center [&>button]:size-vui-7
      [&>button]:rounded-vui-control [&>button]:border [&>button]:border-transparent [&>button]:bg-transparent [&>button]:text-vui-muted
      [&>button]:cursor-pointer [&>button]:select-none [&>button]:transition-colors
      [&>button:enabled:hover]:bg-vui-surface-muted [&>button:enabled:hover]:text-vui-foreground
      [&>button:enabled:active]:bg-[color-mix(in_oklab,var(--vui-surface-muted),var(--vui-foreground)_12%)]
      [&>button:disabled]:opacity-40 [&>button:disabled]:cursor-not-allowed
      [&>button:focus-visible]:outline-2 [&>button:focus-visible]:outline-offset-2 [&>button:focus-visible]:outline-vui-accent
      forced-colors:[&>button]:border-[ButtonText]`,
    role: 'group',
    '[attr.aria-label]': 'labels().group',
  },
  template: `
    <button type="button" [attr.aria-label]="labels().zoomIn" [disabled]="!canZoomIn()" (click)="flow().zoomIn()">
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
    <button type="button" [attr.aria-label]="labels().zoomOut" [disabled]="!canZoomOut()" (click)="flow().zoomOut()">
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
    <button type="button" [attr.aria-label]="labels().fitView" (click)="flow().fitView()">
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
export class VuiControls {
  /** The flow these controls operate on. */
  readonly flow = input.required<VflowComponent>();
  readonly labels = input<VuiControlsLabels>({
    group: 'Viewport controls',
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    fitView: 'Fit view',
  });

  protected readonly zoom = computed(() => this.flow().viewport().zoom);
  protected readonly canZoomIn = computed(() => this.zoom() < this.flow().maxZoom() - 1e-6);
  protected readonly canZoomOut = computed(() => this.zoom() > this.flow().minZoom() + 1e-6);
}
