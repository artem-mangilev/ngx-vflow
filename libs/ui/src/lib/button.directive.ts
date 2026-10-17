import { booleanAttribute, Directive, input } from '@angular/core';

export type VuiButtonVariant = 'primary' | 'secondary' | 'plain';
export type VuiButtonSize = 'sm' | 'md';

/**
 * Design-system styling for a native button; native semantics and attributes are preserved.
 *
 * - `primary` (default, also for a bare `vuiButton`): the accent fill for the one main action of an area.
 * - `secondary`: a neutral fill for other actions.
 * - `plain`: no fill and secondary text at rest, for actions in rows, labels, toolbars and viewport controls.
 *
 * `vuiButtonSize` is `md` (28px) or `sm` (24px, the smallest target size WCAG 2.2 accepts without spacing);
 * `vuiButtonIcon` makes the button square for an icon. Give an icon-only button an accessible name.
 */
@Directive({
  selector: 'button[vuiButton]',
  host: {
    class: `vui-button
      inline-flex box-border items-center justify-center gap-vui-1 rounded-vui-control border border-transparent
      font-vui-sans font-vui-medium cursor-pointer select-none transition-colors duration-(--vui-duration) ease-vui
      h-vui-7 px-vui-3 text-vui-body data-[vui-size=sm]:h-vui-6 data-[vui-size=sm]:px-vui-2 data-[vui-size=sm]:text-vui-caption
      data-[vui-icon=true]:px-vui-0 data-[vui-icon=true]:w-vui-7 data-[vui-icon=true]:data-[vui-size=sm]:px-vui-0 data-[vui-icon=true]:data-[vui-size=sm]:w-vui-6
      data-[vui-variant=primary]:bg-vui-accent data-[vui-variant=primary]:text-vui-on-accent
      data-[vui-variant=primary]:enabled:hover:bg-vui-accent-hover data-[vui-variant=primary]:enabled:active:bg-vui-accent-pressed
      data-[vui-variant=secondary]:bg-vui-surface-muted data-[vui-variant=secondary]:text-vui-foreground
      data-[vui-variant=secondary]:enabled:hover:bg-vui-fill-hover data-[vui-variant=secondary]:enabled:active:bg-vui-fill-pressed
      data-[vui-variant=plain]:bg-transparent data-[vui-variant=plain]:text-vui-muted data-[vui-variant=plain]:enabled:hover:text-vui-foreground
      data-[vui-variant=plain]:enabled:hover:bg-vui-surface-muted data-[vui-variant=plain]:enabled:active:bg-vui-fill-pressed
      disabled:opacity-40 disabled:cursor-not-allowed
      focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vui-selection
      forced-colors:border-[ButtonText]`,
    '[attr.data-vui-variant]': 'vuiButton() || "primary"',
    '[attr.data-vui-size]': 'vuiButtonSize()',
    '[attr.data-vui-icon]': 'vuiButtonIcon()',
  },
})
export class VuiButton {
  readonly vuiButton = input<VuiButtonVariant | ''>('primary');
  readonly vuiButtonSize = input<VuiButtonSize>('md');
  readonly vuiButtonIcon = input(false, { transform: booleanAttribute });
}
