import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Vui } from '@vflow/ui';

const SECTION_TITLE = 'm-0 mb-2 text-xs font-semibold text-vui-muted';
const SAMPLE = 'grid h-11 w-18 place-items-center border border-solid border-vui-border bg-vui-surface text-xs';

/**
 * The token scales of both shipped themes, drawn with the `vui` utilities and the parts that use them. Each column
 * is a `data-vui-theme` scope, so the same utilities resolve to the light and to the dark values.
 */
@Component({
  imports: [Vui],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: `grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] overflow-hidden rounded-[14px]
      border border-solid border-vui-border`,
    role: 'group',
    'aria-label': 'Design tokens',
  },
  template: `
    @for (theme of themes; track theme) {
      <div
        class="grid gap-5 bg-canvas p-5 text-sm text-vui-foreground"
        [attr.data-vui-theme]="theme"
        [attr.data-testid]="'tokens-' + theme">
        <section>
          <h3 class="${SECTION_TITLE}">{{ theme === 'light' ? 'Light' : 'Dark' }} theme colors</h3>
          <div class="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2">
            @for (color of colors; track color) {
              <div class="grid gap-1 text-xs">
                <span
                  class="h-7 rounded-vui-control border border-solid border-vui-border"
                  [style.background]="'var(' + color + ')'"></span>
                <code>{{ color }}</code>
              </div>
            }
          </div>
        </section>

        <section>
          <h3 class="${SECTION_TITLE}">Type: yours</h3>
          <div>Inherited: node, row and group content</div>
          <div class="font-semibold">font-semibold: node and group titles</div>
          <div class="text-xs">text-xs: meta and edge labels</div>
        </section>

        <section>
          <h3 class="${SECTION_TITLE}">Spacing on a 4px grid</h3>
          <div class="flex flex-wrap items-end gap-2">
            @for (step of spacing; track step.units) {
              <div class="grid justify-items-center gap-1 text-xs text-vui-muted">
                <span class="rounded-xs bg-vui-accent" [class]="step.size"></span>
                {{ step.units }}
              </div>
            }
          </div>
        </section>

        <section>
          <h3 class="${SECTION_TITLE}">Concentric radius</h3>
          <div class="flex flex-wrap gap-2">
            <div class="${SAMPLE} rounded-vui-control">control</div>
            <div class="${SAMPLE} rounded-vui-surface">surface</div>
            <div class="${SAMPLE} rounded-full">full</div>
          </div>
        </section>

        <section>
          <h3 class="${SECTION_TITLE}">Elevation and parts</h3>
          <div class="flex flex-wrap items-start gap-2">
            <article vuiNode class="w-45 text-[13px]">
              <header vuiNodeHeader><span vuiTitle>Flat node</span></header>
              <div class="p-vui-3"><span vuiMeta>No blurred shadow on nodes</span></div>
            </article>
            <div vuiToolbar class="px-vui-3! py-vui-2! text-[13px]">Floating toolbar</div>
          </div>
        </section>
      </div>
    }
  `,
})
export class TokensDemoComponent {
  protected readonly themes = ['light', 'dark'] as const;
  protected readonly colors = [
    '--vui-background',
    '--vui-surface',
    '--vui-surface-muted',
    '--vui-foreground',
    '--vui-muted',
    '--vui-border',
    '--vui-accent',
    '--vui-success',
    '--vui-danger',
  ];
  /** The steps of the spacing scale as the utilities that size a square with them. */
  protected readonly spacing = [
    { units: 1, size: 'size-vui-1' },
    { units: 2, size: 'size-vui-2' },
    { units: 3, size: 'size-vui-3' },
    { units: 4, size: 'size-vui-4' },
    { units: 5, size: 'size-vui-5' },
    { units: 6, size: 'size-vui-6' },
    { units: 7, size: 'size-vui-7' },
    { units: 8, size: 'size-vui-8' },
  ];
}
