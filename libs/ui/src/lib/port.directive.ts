import { booleanAttribute, Directive, input } from '@angular/core';
import { VflowHandleDirective } from 'ngx-vflow';

/**
 * A handle with the standard connection point look: an 8px ring, filled once connected (the idle look only, so the
 * fill never overrides the connection feedback of a connected port), with a larger pointer target
 * drawn by a pseudo-element along the node side and into the node, never outward. It applies the core `vHandle`
 * directive to its host and forwards its inputs; the connection feedback (`connecting`, `valid`, `invalid`) is read
 * from the core `data-v-handle-state` attribute, `vuiPortConnected` is application knowledge about existing edges.
 * See the Design system overview for the states and the sizes.
 */
@Directive({
  selector: '[vuiPort]',
  hostDirectives: [
    {
      directive: VflowHandleDirective,
      inputs: [
        'handleType',
        'position',
        'handleId',
        'layout',
        'offsetX',
        'offsetY',
        'canStart',
        'canAccept',
        'domAttributes',
      ],
    },
  ],
  host: {
    class: `vui-port
      relative block size-vui-2 rounded-full border-[1.5px] [--vui-tone:var(--vui-accent)]
      [--vui-port-halo:0_0_0_1px_var(--vui-tone),0_0_0_4px_color-mix(in_oklab,var(--vui-tone)_28%,transparent)]
      transition-[border-color,background-color,box-shadow]
      before:absolute before:inset-0 before:rounded-full before:content-['']
      data-[v-handle-position=left]:before:-inset-y-vui-3 data-[v-handle-position=left]:before:-right-vui-2 data-[v-handle-position=left]:before:left-0
      data-[v-handle-position=right]:before:-inset-y-vui-3 data-[v-handle-position=right]:before:-left-vui-2 data-[v-handle-position=right]:before:right-0
      data-[v-handle-position=top]:before:-inset-x-vui-3 data-[v-handle-position=top]:before:-bottom-vui-2 data-[v-handle-position=top]:before:top-0
      data-[v-handle-position=bottom]:before:-inset-x-vui-3 data-[v-handle-position=bottom]:before:-top-vui-2 data-[v-handle-position=bottom]:before:bottom-0
      border-vui-muted bg-vui-surface data-[v-handle-state=idle]:data-[vui-connected=true]:bg-vui-muted
      data-[v-handle-state=idle]:data-[v-handle-can-start=true]:hover:border-vui-accent
      data-[v-handle-state=idle]:data-[v-handle-can-start=true]:hover:shadow-(--vui-port-halo)
      data-[v-handle-state=connecting]:border-vui-accent data-[v-handle-state=connecting]:bg-vui-accent data-[v-handle-state=connecting]:shadow-(--vui-port-halo)
      data-[v-handle-state=valid]:[--vui-tone:var(--vui-success)] data-[v-handle-state=valid]:border-vui-success data-[v-handle-state=valid]:bg-vui-success data-[v-handle-state=valid]:shadow-(--vui-port-halo)
      data-[v-handle-state=invalid]:[--vui-tone:var(--vui-danger)] data-[v-handle-state=invalid]:border-vui-danger data-[v-handle-state=invalid]:bg-vui-surface data-[v-handle-state=invalid]:shadow-(--vui-port-halo)
      forced-colors:bg-[ButtonText] forced-colors:border-[Canvas] forced-colors:shadow-none forced-colors:[forced-color-adjust:none]`,
    '[attr.data-vui-connected]': 'vuiPortConnected()',
  },
})
export class VuiPort {
  readonly vuiPortConnected = input(false, { transform: booleanAttribute });
}
