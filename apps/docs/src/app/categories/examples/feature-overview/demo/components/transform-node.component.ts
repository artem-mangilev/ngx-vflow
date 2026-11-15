import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { DemoIconComponent, DocsButton, DocsNodeIcon } from '@docs/shared';
import { Vui } from '@vflow/ui';
import { Vflow, injectNode } from 'ngx-vflow';

/** A node that is resized while it is selected and carries a toolbar; its handles sit on content inside it. */
@Component({
  template: `
    <article
      vuiNode
      class="flex w-60 min-w-60 flex-col text-[13px]"
      data-testid="transform"
      [vResizable]="ctx.selected()">
      <header vuiNodeHeader>
        <span docsNodeIcon tile class="[--icon-color:var(--color-amber-500)]"><app-demo-icon name="sliders" /></span>
        <span vuiTitle>Click to resize</span>
      </header>
      <div class="flex flex-1 flex-col justify-evenly gap-vui-2 p-vui-3">
        <div class="rounded-vui-control bg-vui-surface-muted px-vui-3 py-vui-2">
          <div vuiMeta>Input</div>
          A handle can sit on content inside a node
          <span vuiPort handleType="target" position="left" handleId="input"></span>
        </div>
        <span class="flex justify-center text-vui-muted"><app-demo-icon name="arrow-down" /></span>
        <div class="rounded-vui-control bg-vui-surface-muted px-vui-3 py-vui-2">
          <div vuiMeta>Output</div>
          A handle can sit on content inside a node
          <span vuiPort handleType="source" position="right" handleId="output"></span>
        </div>
      </div>
    </article>

    <v-node-toolbar position="top">
      <div vuiToolbar>
        <button docsButton="plain" small type="button" (click)="deleted.emit()">Delete</button>
      </div>
    </v-node-toolbar>
  `,
  // The card is the element the flow measures and resizes, so the host adds no box of its own.
  host: { class: 'contents' },
  imports: [Vflow, Vui, DocsButton, DocsNodeIcon, DemoIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransformNodeComponent {
  protected readonly ctx = injectNode();

  /** Reaches the flow as a `componentNodeEvent`, which carries the id of this node. */
  readonly deleted = output<void>();
}
