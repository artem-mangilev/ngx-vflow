import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DocsKit, DocsPresentations } from '@docs/shared';
import { Vflow, createEdges, createNodes, provideVflow, withSettings } from 'ngx-vflow';

/** A flow that shows the settings in effect for it; it binds no setting itself. */
@Component({
  selector: 'docs-configured-flow',
  imports: [DecimalPipe, DocsPresentations, Vflow],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex h-full flex-col' },
  template: `
    <div class="min-h-40 flex-1">
      <vflow #flow [nodes]="nodes" [edges]="edges" (initialized)="flow.fitView({ maxZoom: 1 })">
        <docs-node *vNode="let ctx" [ctx]="ctx" />
        <svg:g *vEdge="let ctx" docsEdge [ctx]="ctx" />
      </vflow>
    </div>
    <dl
      class="m-0 grid grid-cols-[max-content_1fr] gap-x-3.5 gap-y-1 border-0 border-t border-solid border-vui-border px-3.5 py-3 text-[13px] tabular-nums">
      <dt class="text-vui-muted">Zoom range</dt>
      <dd class="m-0" data-testid="zoom-range">{{ flow.settings.minZoom() }} – {{ flow.settings.maxZoom() }}</dd>
      <dt class="text-vui-muted">Zoom now</dt>
      <dd class="m-0" data-testid="zoom">{{ flow.viewport().zoom | number: '1.2-2' }}</dd>
      <dt class="text-vui-muted">Double-click zoom</dt>
      <dd class="m-0" data-testid="double-click">{{ flow.settings.zoomOnDoubleClick() ? 'on' : 'off' }}</dd>
    </dl>
  `,
})
export class ConfiguredFlowComponent {
  protected readonly nodes = createNodes([
    { id: 'request', point: { x: 0, y: 0 }, data: { text: 'Request' } },
    { id: 'approval', point: { x: 160, y: 70 }, data: { text: 'Approval' } },
  ]);

  protected readonly edges = createEdges([{ id: 'request-approval', source: 'request', target: 'approval' }]);
}

/** The same flow under a closer `provideVflow`: its keys lay over those of the demo, the rest fall through. */
@Component({
  selector: 'docs-overriding-flow',
  imports: [ConfiguredFlowComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block h-full' },
  providers: [provideVflow(withSettings({ maxZoom: 4, zoomOnDoubleClick: false }))],
  template: `<docs-configured-flow />`,
})
export class OverridingFlowComponent {}

/**
 * Two flows under one `provideVflow`. The left one reads every setting from it; the right one sits under a second
 * `provideVflow` that changes two keys and keeps the rest.
 */
@Component({
  imports: [ConfiguredFlowComponent, DocsKit, OverridingFlowComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: '@container block size-full' },
  providers: [provideVflow(withSettings({ minZoom: 0.5, maxZoom: 2, zoomOnDoubleClick: true }))],
  template: `
    <div class="grid h-full grid-cols-2 @max-[560px]:grid-cols-1" data-testid="configuration-demo">
      <docs-demo data-testid="shared">
        <div docsDemoBar>
          <p class="font-doc-mono text-xs">{{ sharedCaption }}</p>
        </div>
        <docs-configured-flow />
      </docs-demo>
      <docs-demo
        class="border-0 border-l border-solid border-vui-border @max-[560px]:border-t @max-[560px]:border-l-0"
        data-testid="overriding">
        <div docsDemoBar>
          <p class="font-doc-mono text-xs">{{ overridingCaption }}</p>
        </div>
        <docs-overriding-flow />
      </docs-demo>
    </div>
  `,
})
export class ConfigurationDemoComponent {
  // Braces in a template read as an ICU expression, so the captions live here.
  protected readonly sharedCaption =
    'provideVflow(withSettings({ minZoom: 0.5, maxZoom: 2, zoomOnDoubleClick: true }))';
  protected readonly overridingCaption =
    '… and, closer to the flow, withSettings({ maxZoom: 4, zoomOnDoubleClick: false })';
}
