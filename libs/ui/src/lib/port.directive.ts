import { booleanAttribute, computed, Directive, inject, input } from '@angular/core';
import { HandleState, VflowHandleDirective } from 'ngx-vflow';

/**
 * A handle with the standard connection point look: an 8px ring (filled once connected; its 1.5px line is thinner than
 * the 2px edge stroke, so the ring keeps an open center) with a larger pointer target
 * drawn by a pseudo-element: on a side position, about 30px along the node side and 15px deep into the node, never
 * outward, where the end of a connected edge takes reconnection presses. With `auto` and `center` the side is unknown,
 * so the target is the ring itself; place such a port where you want it to be pressed. The endpoint stays at the ring.
 * Pressable, connecting and candidate ports are emphasized by a halo in the state tone (selection, success, danger):
 * box shadows, one solid pixel and a wider tint, so the ring grows without changing its box and the measured handle and
 * the edge endpoint never move. An invalid candidate
 * stays hollow while a valid one is filled, so the feedback does not depend on color alone. It applies the core
 * `vHandle` directive to its host, so the element is registered, positioned and gets the handle state. The handle
 * inputs `handleType`, `position`, `handleId`, `layout`, offsets, connectability and `domAttributes` are forwarded.
 * `vuiPortState` overrides the handle feedback; `vuiPortConnected` is application knowledge about existing edges.
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
      relative block box-border size-vui-2 rounded-full border-[1.5px] [--vui-tone:var(--vui-accent)]
      [--vui-port-halo:0_0_0_1px_var(--vui-tone),0_0_0_4px_color-mix(in_oklab,var(--vui-tone)_28%,transparent)]
      transition
      before:absolute before:inset-vui-0 before:rounded-full before:content-['']
      data-[v-handle-position=left]:before:-inset-y-vui-3 data-[v-handle-position=left]:before:-right-vui-2 data-[v-handle-position=left]:before:left-vui-0
      data-[v-handle-position=right]:before:-inset-y-vui-3 data-[v-handle-position=right]:before:-left-vui-2 data-[v-handle-position=right]:before:right-vui-0
      data-[v-handle-position=top]:before:-inset-x-vui-3 data-[v-handle-position=top]:before:-bottom-vui-2 data-[v-handle-position=top]:before:top-vui-0
      data-[v-handle-position=bottom]:before:-inset-x-vui-3 data-[v-handle-position=bottom]:before:-top-vui-2 data-[v-handle-position=bottom]:before:bottom-vui-0
      border-vui-muted bg-vui-surface data-[vui-connected=true]:bg-vui-muted
      data-[vui-state=idle]:data-[v-handle-can-start=true]:hover:border-vui-accent
      data-[vui-state=idle]:data-[v-handle-can-start=true]:hover:shadow-(--vui-port-halo)
      data-[vui-state=connecting]:border-vui-accent data-[vui-state=connecting]:bg-vui-accent data-[vui-state=connecting]:shadow-(--vui-port-halo)
      data-[vui-state=valid]:[--vui-tone:var(--vui-success)] data-[vui-state=valid]:border-vui-success data-[vui-state=valid]:bg-vui-success data-[vui-state=valid]:shadow-(--vui-port-halo)
      data-[vui-state=invalid]:[--vui-tone:var(--vui-danger)] data-[vui-state=invalid]:border-vui-danger data-[vui-state=invalid]:bg-vui-surface data-[vui-state=invalid]:shadow-(--vui-port-halo)
      [&[data-vui-reveal=interaction][data-vui-state=idle]:not([data-vui-connected=true],.v-node:hover_*,.v-node:focus-within_*,[data-vui-selected=true]_*)]:opacity-0
      forced-colors:bg-[ButtonText] forced-colors:border-[Canvas] forced-colors:opacity-100 forced-colors:shadow-none forced-colors:[forced-color-adjust:none]`,
    '[attr.data-vui-state]': 'state()',
    '[attr.data-vui-connected]': 'vuiPortConnected()',
    '[attr.data-vui-reveal]': 'vuiPortReveal()',
  },
})
export class VuiPort {
  private readonly handle = inject(VflowHandleDirective, { self: true });

  readonly vuiPortState = input<HandleState>();
  readonly vuiPortConnected = input(false, { transform: booleanAttribute });
  /**
   * `always` shows every port. `interaction` keeps an idle port without edges invisible (still a target) until its node
   * is hovered, focused or selected, which includes the node under the pointer while a connection is drawn; for
   * diagrams that draw no connection points. Hover does not follow a finger, so prefer `always` where users connect by touch.
   */
  readonly vuiPortReveal = input<'always' | 'interaction'>('always');

  protected readonly state = computed(() => this.vuiPortState() ?? this.handle.state());
}
