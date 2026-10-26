import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type DemoIconName =
  | 'arrow-down'
  | 'arrow-right'
  | 'check'
  | 'alert'
  | 'play'
  | 'sliders'
  | 'upload'
  | 'waveform'
  | 'close'
  | 'chevron-right'
  | 'chevron-down'
  | 'plus'
  | 'minus'
  | 'image'
  | 'layers'
  | 'download'
  | 'pause';

/**
 * One 16px outline icon set for the design-system demos, so icons share size, stroke and optical weight.
 * Decorative: name the control that contains it, not the icon.
 */
@Component({
  selector: 'app-demo-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round">
      @switch (name()) {
        @case ('arrow-down') {
          <path d="M8 3v10M4 9l4 4 4-4" />
        }
        @case ('arrow-right') {
          <path d="M3 8h10M9 4l4 4-4 4" />
        }
        @case ('check') {
          <path d="M3 8.5l3 3 7-7" />
        }
        @case ('alert') {
          <circle cx="8" cy="8" r="6" />
          <path d="M8 5v3.5M8 11h.01" />
        }
        @case ('play') {
          <path d="M5 3.5v9l7-4.5z" />
        }
        @case ('sliders') {
          <path d="M3 5h6M12 5h1M3 11h1M7 11h6" />
          <circle cx="10.5" cy="5" r="1.5" />
          <circle cx="5.5" cy="11" r="1.5" />
        }
        @case ('upload') {
          <path d="M8 10V3M5 6l3-3 3 3M3 10v2.5h10V10" />
        }
        @case ('waveform') {
          <path d="M3 7v2M5.5 5v6M8 3v10M10.5 5v6M13 7v2" />
        }
        @case ('close') {
          <path d="M4.5 4.5l7 7M11.5 4.5l-7 7" />
        }
        @case ('chevron-right') {
          <path d="M6 4l4 4-4 4" />
        }
        @case ('chevron-down') {
          <path d="M4 6l4 4 4-4" />
        }
        @case ('plus') {
          <path d="M8 3v10M3 8h10" />
        }
        @case ('minus') {
          <path d="M3 8h10" />
        }
        @case ('image') {
          <rect x="2.5" y="3" width="11" height="10" rx="1.5" />
          <circle cx="6" cy="6.5" r="1" />
          <path d="M3 12l3.5-3.5 2.5 2.5 1.5-1.5 2.5 2.5" />
        }
        @case ('layers') {
          <path d="M8 2.5l5.5 3-5.5 3-5.5-3z" />
          <path d="M2.5 9l5.5 3 5.5-3" />
        }
        @case ('download') {
          <path d="M8 3v7M5 7l3 3 3-3M3 10v2.5h10V10" />
        }
        @case ('pause') {
          <path d="M5.5 3.5v9M10.5 3.5v9" />
        }
      }
    </svg>
  `,
})
export class DemoIconComponent {
  readonly name = input.required<DemoIconName>();
}
