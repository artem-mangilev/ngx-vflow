import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocsPresentations } from '@docs/shared';
import { Vflow, createNodes, provideVflow, withAccessibility, withSettings } from 'ngx-vflow';

/** A flow that shows the settings in effect for it; it binds no setting itself. */
@Component({
  selector: 'docs-configured-flow',
  imports: [DocsPresentations, Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: block' },
  template: `
    <vflow #flow view="auto" [nodes]="nodes">
      <docs-node *vNode="let ctx" [ctx]="ctx" />
    </vflow>
    <dl class="effective">
      <dt>Zoom range</dt>
      <dd data-testid="zoom-range">{{ flow.settings.minZoom() }} – {{ flow.settings.maxZoom() }}</dd>
      <dt>Double-click zoom</dt>
      <dd data-testid="double-click">{{ flow.settings.zoomOnDoubleClick() ? 'on' : 'off' }}</dd>
    </dl>
  `,
})
export class ConfiguredFlowComponent {
  readonly nodes = createNodes([
    { id: 'a', point: { x: 30, y: 30 }, data: { text: 'A' } },
    { id: 'b', point: { x: 180, y: 110 }, data: { text: 'B' } },
  ]);
}

/** The same flow under a closer `provideVflow`: its keys lay over those of the demo, the rest fall through. */
@Component({
  selector: 'docs-overriding-flow',
  imports: [ConfiguredFlowComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: block' },
  providers: [provideVflow(withSettings({ maxZoom: 4, zoomOnDoubleClick: false }))],
  template: `<docs-configured-flow />`,
})
export class OverridingFlowComponent {}

/**
 * Two flows under one `provideVflow`. The left one reads every setting from it; the right one sits under a second
 * `provideVflow` that changes two keys and keeps the rest.
 */
@Component({
  imports: [ConfiguredFlowComponent, OverridingFlowComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    provideVflow(
      withSettings({ minZoom: 0.5, maxZoom: 2, zoomOnDoubleClick: true }),
      withAccessibility({ flowLabel: 'Configured graph' }),
    ),
  ],
  styles: `
    .pair {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0;
    }
    .pair > * + * {
      border-left: 1px solid var(--vui-border);
    }
    figure {
      margin: 0;
    }
    figcaption {
      padding: 10px 14px;
      border-bottom: 1px solid var(--vui-border);
      font-size: 13px;
      color: var(--vui-muted);
    }
    vflow {
      height: 220px;
    }
    .effective {
      display: grid;
      grid-template-columns: max-content 1fr;
      gap: 4px 14px;
      margin: 0;
      padding: 12px 14px;
      border-top: 1px solid var(--vui-border);
      font-size: 13px;
    }
    .effective dt {
      color: var(--vui-muted);
    }
    .effective dd {
      margin: 0;
    }
  `,
  template: `
    <section class="demo" data-testid="configuration-demo">
      <div class="pair">
        <figure data-testid="shared">
          <figcaption>{{ sharedCaption }}</figcaption>
          <docs-configured-flow />
        </figure>
        <figure data-testid="overriding">
          <figcaption>{{ overridingCaption }}</figcaption>
          <docs-overriding-flow />
        </figure>
      </div>
    </section>
  `,
})
export class ConfigurationDemoComponent {
  // Braces in a template read as an ICU expression, so the captions live here.
  protected readonly sharedCaption =
    'provideVflow(withSettings({ minZoom: 0.5, maxZoom: 2, zoomOnDoubleClick: true }))';
  protected readonly overridingCaption =
    '… and, closer to the flow, withSettings({ maxZoom: 4, zoomOnDoubleClick: false })';
}
