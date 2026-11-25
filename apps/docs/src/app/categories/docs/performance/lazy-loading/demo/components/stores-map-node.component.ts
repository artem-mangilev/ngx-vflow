import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Vui } from '@vflow/ui';

/** Stands in for a node that brings a map SDK with it. */
@Component({
  template: `
    <article vuiNode class="flex h-38 w-56 flex-col text-[13px]">
      <header vuiNodeHeader>
        <span vuiTitle>Stores</span>
        <span vuiMeta>Map</span>
      </header>
      <div class="p-vui-3 min-h-0 flex-1">
        <svg
          class="rounded-vui-control bg-vui-surface-muted block size-full"
          viewBox="0 0 200 64"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true">
          <path
            class="stroke-vui-border fill-none stroke-2"
            d="M0 44 C50 28 90 60 200 20 M70 0 L96 64 M150 0 L132 64" />
          @for (store of stores; track $index) {
            <circle class="fill-vui-accent" r="4" [attr.cx]="store.x" [attr.cy]="store.y" />
          }
        </svg>
      </div>
      <span vuiPort handleType="target" position="left"></span>
    </article>
  `,
  imports: [Vui],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoresMapNodeComponent {
  protected readonly stores = [
    { x: 38, y: 22 },
    { x: 86, y: 40 },
    { x: 124, y: 14 },
    { x: 168, y: 44 },
  ];
}
