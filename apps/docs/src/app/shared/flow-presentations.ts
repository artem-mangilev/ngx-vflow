import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { VflowUi } from '@vflow/ui';
import { Vflow } from 'ngx-vflow';

/**
 * Presentations shared by the documentation demos. Core is headless: every demo supplies
 * node, group, edge and label templates. These components use `@vflow/ui` so feature demos
 * can focus on the feature instead of drawing; copy them or replace them with your own.
 */

interface NodeCtx {
  node: { id: string };
  data: () => { text?: string; title?: string } | undefined;
  selected: () => boolean;
  preselected: () => boolean;
}

interface GroupCtx extends NodeCtx {
  width: () => number;
  height: () => number;
}

interface EdgeCtx {
  edge: { id: string };
  path: () => string;
  markerStart: () => string;
  markerEnd: () => string;
  selected: () => boolean;
  preselected: () => boolean;
}

interface LabelCtx {
  label: { data?: unknown };
}

/** A card with the node's text and one target/source handle pair. */
@Component({
  selector: 'docs-node',
  imports: [Vflow, VflowUi],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: block' },
  styles: `
    .card {
      width: var(--docs-node-width, 100px);
      min-height: var(--docs-node-height, 50px);
      display: grid;
      place-items: center;
      padding: 4px 8px;
      text-align: center;
      font-size: 13px;
    }
  `,
  template: `
    <div vflowNode class="card" selectable [vflowSelected]="ctx().selected() || ctx().preselected()">
      <span [innerHTML]="text()"></span>
      <handle type="target" position="left" [template]="port" />
      <handle type="source" position="right" [template]="port" />
    </div>
    <ng-template #port let-handle handle><span vflowPort [vflowPortState]="handle.state()"></span></ng-template>
  `,
})
export class DocsNodeComponent {
  readonly ctx = input.required<NodeCtx>();
  protected readonly text = computed(() => this.ctx().data()?.text ?? this.ctx().data()?.title ?? this.ctx().node.id);
}

/** A container frame with the group's title, sized by the model. */
@Component({
  selector: 'docs-group',
  imports: [Vflow, VflowUi],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: block' },
  template: `
    <div
      vflowContainer
      selectable
      [vflowSelected]="ctx().selected() || ctx().preselected()"
      [style.width.px]="ctx().width()"
      [style.height.px]="ctx().height()">
      @if (title(); as title) {
        <span vflowTitle>{{ title }}</span>
      }
    </div>
  `,
})
export class DocsGroupComponent {
  readonly ctx = input.required<GroupCtx>();
  protected readonly title = computed(() => this.ctx().data()?.text ?? this.ctx().data()?.title ?? '');
}

/** A selectable edge path with the core markers of the edge. */
@Component({
  selector: 'g[docsEdge]',
  imports: [Vflow, VflowUi],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg:g customTemplateEdge selectable>
      <svg:path
        vflowEdge
        [attr.d]="ctx().path()"
        [attr.marker-start]="ctx().markerStart()"
        [attr.marker-end]="ctx().markerEnd()"
        [vflowSelected]="ctx().selected() || ctx().preselected()" />
    </svg:g>
  `,
})
export class DocsEdgeComponent {
  readonly ctx = input.required<EdgeCtx>();
}

/** An HTML label surface showing the label's data as text. */
@Component({
  selector: 'docs-edge-label',
  imports: [VflowUi],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: block' },
  template: `<span vflowEdgeLabel>{{ text() }}</span>`,
})
export class DocsEdgeLabelComponent {
  readonly ctx = input.required<LabelCtx>();
  protected readonly text = computed(() => {
    const data = this.ctx().label.data;
    return typeof data === 'string' ? data : ((data as { text?: string } | undefined)?.text ?? '');
  });
}

/** Import into a demo and place the four templates inside `<vflow>`. */
export const DocsPresentations = [
  DocsNodeComponent,
  DocsGroupComponent,
  DocsEdgeComponent,
  DocsEdgeLabelComponent,
] as const;
