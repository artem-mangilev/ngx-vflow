import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DemoIconComponent, DocsNodeIcon } from '@docs/shared';
import { Vui } from '@vflow/ui';

@Component({
  template: `
    <article vuiNode class="w-55 text-[13px]">
      <header vuiNodeHeader>
        <span docsNodeIcon tile class="[--icon-color:var(--color-emerald-500)]"><app-demo-icon name="layers" /></span>
        <span vuiTitle>For example, a table</span>
      </header>
      @for (field of fields; track field.name) {
        <div vuiRow>
          <span vuiTitle>{{ field.name }}</span>
          <span vuiMeta>{{ field.type }}</span>
        </div>
      }
      <span vuiPort handleType="target" position="left"></span>
      <span vuiPort handleType="source" position="right"></span>
    </article>
  `,
  imports: [Vui, DocsNodeIcon, DemoIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataNodeComponent {
  protected readonly fields = [
    { name: 'id', type: 'number' },
    { name: 'name', type: 'string' },
    { name: 'count', type: 'number' },
  ];
}
