import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DemoIconComponent, DocsNodeIcon, DocsSelect } from '@docs/shared';
import { Vui } from '@vflow/ui';
import { BuiltInCurve, Vflow } from 'ngx-vflow';
import { BackgroundPattern, FlowStoreService } from '../services/flow-store.service';

/**
 * A node is a component, so its content is anything a component can render: here, the controls of the canvas it is
 * on. They write to the store of the demo, and the flow reads the store through its inputs.
 *
 * Only the header drags the node, so a press on a control never starts a drag. The node has no ports: a node
 * needs none.
 */
@Component({
  template: `
    <article vuiNode class="w-55 text-[13px]">
      <header vuiNodeHeader vDragHandle class="cursor-grab active:cursor-grabbing">
        <span docsNodeIcon tile class="[--icon-color:var(--color-violet-500)]"><app-demo-icon name="sliders" /></span>
        <span vuiTitle>Controls in a node</span>
      </header>
      <label vuiRow class="cursor-pointer">
        Snap to grid
        <input
          type="checkbox"
          class="m-0 ms-auto cursor-pointer"
          [checked]="store.snapToGrid()"
          (change)="store.snapToGrid.set(checked($event))" />
      </label>
      <label vuiRow class="cursor-pointer">
        Alignment guides
        <input
          type="checkbox"
          class="m-0 ms-auto cursor-pointer"
          [checked]="store.alignmentGuides()"
          (change)="store.alignmentGuides.set(checked($event))" />
      </label>
      <label vuiRow>
        Background
        <select docsSelect class="ms-auto" (change)="store.background.set(value($event))">
          @for (pattern of backgrounds; track pattern) {
            <option [value]="pattern" [selected]="pattern === store.background()">{{ pattern }}</option>
          }
        </select>
      </label>
      <label vuiRow>
        Edge curve
        <select docsSelect class="ms-auto" (change)="store.setCurve(value($event))">
          @for (curve of curves; track curve) {
            <option [value]="curve" [selected]="curve === store.curve()">{{ curve }}</option>
          }
        </select>
      </label>
    </article>
  `,
  imports: [Vflow, Vui, DocsSelect, DocsNodeIcon, DemoIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsNodeComponent {
  protected readonly store = inject(FlowStoreService);

  protected readonly backgrounds: BackgroundPattern[] = ['dots', 'grid', 'none'];
  protected readonly curves: BuiltInCurve[] = ['bezier', 'smooth-step', 'step', 'straight'];

  protected checked(event: Event): boolean {
    return (event.target as HTMLInputElement).checked;
  }

  /** The options of a select are the values of its setting, so the value read back is one of them. */
  protected value<T extends string>(event: Event): T {
    return (event.target as HTMLSelectElement).value as T;
  }
}
