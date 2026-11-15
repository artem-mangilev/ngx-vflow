import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DemoIconComponent, DocsNodeIcon } from '@docs/shared';
import { Vui } from '@vflow/ui';

/** A node is a component, so its content is anything a component can render: here, an embedded video. */
@Component({
  template: `
    <article vuiNode class="w-55 text-[13px]">
      <header vuiNodeHeader>
        <span docsNodeIcon tile class="[--icon-color:var(--color-violet-500)]"><app-demo-icon name="play" /></span>
        <span vuiTitle>A node can be anything</span>
      </header>
      <div class="p-vui-3">
        <iframe
          class="block aspect-video w-full rounded-vui-control border-0"
          title="A video inside a node"
          src="https://www.youtube.com/embed/dQw4w9WgXcQ"></iframe>
      </div>
      <span vuiPort handleType="source" position="right"></span>
    </article>
  `,
  imports: [Vui, DocsNodeIcon, DemoIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TriggerNodeComponent {}
