import {
  AfterViewChecked,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  Directive,
  ElementRef,
  inject,
  input,
} from '@angular/core';

/**
 * The controls the documentation demos share: a button, a select, an input, a slider, a badge and the frame of a
 * demo. They stand in for the components of your own design system: `@vflow/ui` ships none of them. Each is a
 * directive that puts Tailwind utilities on a native element and reads the vflow UI theme, so a control inside a node
 * is as round as the node and follows light and dark with it.
 */

const FOCUS_RING = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vui-accent';

const BUTTON = `inline-flex box-border items-center justify-center gap-1 border border-solid border-transparent
  rounded-vui-control font-[inherit] font-medium no-underline cursor-pointer transition-colors
  disabled:opacity-40 disabled:cursor-not-allowed ${FOCUS_RING}`;

const BUTTON_VARIANTS = {
  secondary: `bg-vui-surface-muted text-vui-foreground
    enabled:hover:bg-[color-mix(in_oklab,var(--vui-surface-muted),var(--vui-foreground)_6%)]`,
  primary: 'bg-demo-primary text-white enabled:hover:bg-[color-mix(in_oklab,var(--demo-primary),black_8%)]',
  plain: 'bg-transparent text-vui-muted enabled:hover:bg-vui-surface-muted enabled:hover:text-vui-foreground',
};

export type DocsButtonVariant = keyof typeof BUTTON_VARIANTS;

/**
 * `<button docsButton>` is the neutral button, `docsButton="primary"` the one main action of a demo and
 * `docsButton="plain"` a button without a fill, for toolbars. `small` fits it into a node; `icon` makes it square
 * for a single icon, which then needs an `aria-label`.
 */
@Directive({
  selector: 'button[docsButton]',
  host: { '[class]': 'classes()' },
})
export class DocsButton {
  readonly variant = input('secondary', {
    alias: 'docsButton',
    transform: (value: DocsButtonVariant | '') => value || 'secondary',
  });
  readonly small = input(false, { transform: booleanAttribute });
  readonly icon = input(false, { transform: booleanAttribute });

  protected readonly classes = computed(() => {
    const size = this.small() ? 'h-6 text-xs' : 'h-7 text-[13px]';
    const width = this.icon() ? (this.small() ? 'w-6 p-0' : 'w-7 p-0') : this.small() ? 'px-2 py-0' : 'px-3 py-0';

    return `${BUTTON} ${BUTTON_VARIANTS[this.variant()]} ${size} ${width}`;
  });
}

const FIELD = `box-border h-6 border border-solid border-vui-border rounded-vui-control bg-vui-surface
  text-vui-foreground font-[inherit] text-xs ${FOCUS_RING}`;

/** A native select sized like a small button. `plain` drops the border, for a toolbar. */
@Directive({
  selector: 'select[docsSelect]',
  host: {
    class: `${FIELD} demo-chevron appearance-none cursor-pointer py-0 pr-6 pl-2
      hover:border-[color-mix(in_oklab,var(--vui-border),var(--vui-foreground)_20%)]`,
    '[class]': "plain() ? 'h-7! border-transparent! bg-transparent! text-[13px]!' : ''",
  },
})
export class DocsSelect {
  readonly plain = input(false, { transform: booleanAttribute });
}

/** A native text input drawn like the select. `aria-invalid="true"` colors its border. */
@Directive({
  selector: 'input[docsInput]',
  host: { class: `${FIELD} px-2 py-0 placeholder:text-vui-muted aria-invalid:border-vui-danger` },
})
export class DocsInput {}

/** A native range input with a track filled up to its value. */
@Directive({
  selector: 'input[type=range][docsRange]',
  host: { class: 'demo-range', '(input)': 'fill()' },
})
export class DocsRange implements AfterViewChecked {
  private readonly element = inject<ElementRef<HTMLInputElement>>(ElementRef).nativeElement;

  /** The value may come from a binding as well as from the user, so the fill is read back from the element. */
  ngAfterViewChecked(): void {
    this.fill();
  }

  protected fill(): void {
    const min = Number(this.element.min || 0);
    const max = Number(this.element.max || 100);
    const share = max > min ? (Number(this.element.value) - min) / (max - min) : 0;

    this.element.style.setProperty('--fill', `${share * 100}%`);
  }
}

const BADGE_TONES = {
  neutral: '[--tone:var(--vui-muted)]',
  info: '[--tone:var(--vui-accent)]',
  success: '[--tone:var(--vui-success)]',
  warning: '[--tone:var(--demo-warning)]',
  danger: '[--tone:var(--vui-danger)]',
};

export type DocsBadgeTone = keyof typeof BADGE_TONES;

/**
 * A status label: a tint of the tone under text of the same hue mixed with the foreground, at least 4.5:1 in both
 * themes. `<span docsBadge="success">`.
 */
@Directive({
  selector: '[docsBadge]',
  host: {
    class: `inline-flex box-border items-center gap-1 min-h-5 px-2 rounded-vui-control text-xs font-medium
      bg-[color-mix(in_oklab,var(--tone)_16%,transparent)]
      text-[color-mix(in_oklab,var(--tone)_70%,var(--vui-foreground))]`,
    '[class]': 'tone()',
  },
})
export class DocsBadge {
  readonly tone = input(BADGE_TONES.neutral, {
    alias: 'docsBadge',
    transform: (value: DocsBadgeTone | '') => BADGE_TONES[value || 'neutral'],
  });
}

/**
 * A slot for a leading icon or avatar in a node header, centered on the first line of the title. With `tile` and a
 * color of the application in `--icon-color` it is a tinted square that says what kind of thing the node is.
 */
@Directive({
  selector: '[docsNodeIcon]',
  host: {
    class: 'demo-strut inline-flex flex-none items-center justify-center min-w-vui-4 min-h-[1lh]',
    '[class]': `tile()
      ? 'min-w-vui-6! min-h-vui-6! rounded-vui-control bg-[color-mix(in_oklab,var(--icon-color)_16%,transparent)] text-[color-mix(in_oklab,var(--icon-color)_75%,currentColor)]'
      : ''`,
  },
})
export class DocsNodeIcon {
  readonly tile = input(false, { transform: booleanAttribute });
}

/**
 * The bar of controls above the flow of a demo: `<div docsDemoBar>` as the first child of `docs-demo`. A `p` in it is
 * status text and an `output` a live readout, both muted; a `label` lays out a native control with its text.
 */
@Directive({
  selector: '[docsDemoBar]',
  host: {
    class: `flex flex-wrap items-center gap-2.5 p-3.5 border-0 border-b border-solid border-vui-border
      text-[13px] leading-5 [&_label]:inline-flex [&_label]:items-center [&_label]:gap-1.5 [&_p]:m-0 [&_p]:text-vui-muted
      [&_output]:text-vui-muted [&_output]:tabular-nums`,
  },
})
export class DocsDemoBar {}

/**
 * The frame of a demo with controls: an optional `docsDemoBar` and, under it, the stage with the flow. The stage is
 * positioned, so an overlay outside the flow, such as a palette, can sit in a corner of it with `absolute`.
 *
 * In a demo pane of the docs the frame fills the pane. `framed` draws the card itself, for a demo that is shown
 * without a pane; its stage then takes the height of its content, so give the flow a sized parent.
 */
@Component({
  selector: 'docs-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex flex-col w-full min-h-0 bg-canvas text-vui-foreground',
    // In a pane the button that opens the demo full screen sits in the top right corner, over the bar.
    '[class]':
      "framed() ? 'rounded-[14px] border border-solid border-vui-border overflow-hidden' : 'h-full [&>[docsDemoBar]]:pe-12'",
  },
  template: `
    <ng-content select="[docsDemoBar]" />
    <div class="relative flex-1 min-h-0">
      <ng-content />
    </div>
  `,
})
export class DocsDemo {
  readonly framed = input(false, { transform: booleanAttribute });
}

/** Import into a demo that has controls. */
export const DocsKit = [
  DocsDemo,
  DocsDemoBar,
  DocsButton,
  DocsSelect,
  DocsInput,
  DocsRange,
  DocsBadge,
  DocsNodeIcon,
] as const;
