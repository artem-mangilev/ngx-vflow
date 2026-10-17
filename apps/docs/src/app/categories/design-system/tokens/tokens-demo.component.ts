import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Vui } from '@vflow/ui';
import { DemoIconComponent } from '../../../shared/demo-icon.component';

/** The token scales of both shipped themes, drawn with the theme variables and the parts that use them. */
@Component({
  selector: 'app-ui-tokens-demo',
  imports: [Vui, DemoIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .themes {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    }
    .theme {
      display: grid;
      gap: 20px;
      padding: 20px;
      background: var(--vui-canvas);
      color: var(--vui-foreground);
      font-family: var(--vui-font-sans);
      font-size: var(--vui-font-size);
    }
    h3 {
      margin: 0 0 8px;
      font-size: calc(var(--vui-font-size) - 2px);
      font-weight: 600;
      color: var(--vui-muted);
    }
    .swatches {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(84px, 1fr));
      gap: 8px;
    }
    .swatch {
      display: grid;
      gap: 4px;
      font-size: calc(var(--vui-font-size) - 2px);
    }
    .chip {
      height: 28px;
      border-radius: var(--vui-radius);
      border: 1px solid var(--vui-border);
    }
    .caption {
      font-size: calc(var(--vui-font-size) - 2px);
      line-height: calc(var(--vui-font-size) + 1px);
    }
    .body {
      line-height: calc(var(--vui-font-size) + 5px);
    }
    .row {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-end;
      gap: 8px;
    }
    .space {
      display: grid;
      justify-items: center;
      gap: 4px;
      font-size: calc(var(--vui-font-size) - 2px);
      color: var(--vui-muted);
    }
    .space span {
      width: calc(var(--vui-space) * var(--units));
      height: calc(var(--vui-space) * var(--units));
      background: var(--vui-selection);
      border-radius: 2px;
    }
    .radius {
      display: grid;
      place-items: center;
      width: 72px;
      height: 44px;
      border: 1px solid var(--vui-border);
      background: var(--vui-surface);
      font-size: calc(var(--vui-font-size) - 2px);
    }
    article {
      width: 180px;
    }
  `,
  template: `
    <section class="demo themes" aria-label="Design tokens">
      @for (theme of themes; track theme) {
        <div class="theme" [vuiTheme]="theme" [attr.data-testid]="'tokens-' + theme">
          <div>
            <h3>{{ theme === 'light' ? 'Light' : 'Dark' }} theme colors</h3>
            <div class="swatches">
              @for (color of colors; track color) {
                <div class="swatch">
                  <span class="chip" [style.background]="'var(--vui-' + color + ')'"></span>
                  <code>{{ color }}</code>
                </div>
              }
            </div>
          </div>
          <div>
            <h3>Type</h3>
            <div class="caption">Caption 11/14: meta, statuses, labels</div>
            <div class="body">Body 13/18: content, fields, buttons</div>
            <div class="body"><strong>Headline 13/18 semibold: node and container titles</strong></div>
          </div>
          <div>
            <h3>Spacing on a 4pt grid</h3>
            <div class="row">
              @for (units of spacing; track units) {
                <div class="space" [style.--units]="units">
                  <span></span>
                  {{ units }}
                </div>
              }
            </div>
          </div>
          <div>
            <h3>Concentric radius</h3>
            <div class="row">
              <div class="radius" style="border-radius: var(--vui-radius)">control</div>
              <div class="radius" style="border-radius: calc(var(--vui-radius) + var(--vui-space))">surface</div>
              <div class="radius" style="border-radius: 9999px">full</div>
            </div>
          </div>
          <div>
            <h3>Buttons</h3>
            <div class="row">
              <button vuiButton="primary" type="button">Primary</button>
              <button vuiButton="secondary" type="button">Secondary</button>
              <button vuiButton="plain" type="button">Plain</button>
              <button vuiButton="secondary" vuiButtonSize="sm" type="button">Small</button>
              <button vuiButton="plain" vuiButtonSize="sm" vuiButtonIcon type="button" aria-label="Close">
                <app-demo-icon name="close" />
              </button>
              <button vuiButton="primary" type="button" disabled>Disabled</button>
            </div>
          </div>
          <div>
            <h3>Elevation and parts</h3>
            <div class="row" style="align-items: flex-start">
              <article vuiNode>
                <header vuiNodeHeader><span vuiTitle>Flat node</span></header>
                <div vuiNodeBody><span vuiMeta>No blurred shadow on nodes</span></div>
              </article>
              <div vuiToolbar>
                <button vuiButton="plain" vuiButtonIcon type="button" aria-label="Zoom in">
                  <app-demo-icon name="plus" />
                </button>
                <button vuiButton="plain" vuiButtonIcon type="button" aria-label="Zoom out">
                  <app-demo-icon name="minus" />
                </button>
                <button vuiButton="plain" type="button">Floating</button>
              </div>
            </div>
          </div>
          <div class="row">
            <span vuiStatus="neutral">Neutral</span>
            <span vuiStatus="info">Info</span>
            <span vuiStatus="success">Valid</span>
            <span vuiStatus="warning" vuiStatusBusy>Running</span>
            <span vuiStatus="danger">Failed</span>
          </div>
        </div>
      }
    </section>
  `,
})
export class TokensDemoComponent {
  readonly themes = ['light', 'dark'] as const;
  readonly colors = [
    'canvas',
    'surface',
    'surface-muted',
    'foreground',
    'muted',
    'border',
    'separator',
    'accent',
    'on-accent',
    'selection',
    'success',
    'warning',
    'danger',
    'info',
  ];
  readonly spacing = [1, 2, 3, 4, 5, 6, 7, 8];
}
