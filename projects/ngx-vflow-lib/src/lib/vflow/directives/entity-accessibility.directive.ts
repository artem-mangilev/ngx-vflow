import { Directive, ElementRef, effect, inject, input } from '@angular/core';
import { AriaDescriber } from '@angular/cdk/a11y';
import { DomAttributes } from '../interfaces/dom-attributes.interface';

/** Shared semantics for the library-owned HTML and SVG entity wrappers. */
@Directive({ selector: '[vflowA11y]', host: { '[attr.role]': 'vflowA11y().role ?? "group"' } })
export class EntityAccessibilityDirective {
  public vflowA11y = input.required<{
    label: string;
    description?: string;
    domAttributes?: DomAttributes;
    role?: 'group' | 'region' | 'img';
  }>();
  private element = inject<ElementRef<Element>>(ElementRef).nativeElement;
  private describer = inject(AriaDescriber);

  constructor() {
    effect((onCleanup) => {
      const { label, description = '', domAttributes } = this.vflowA11y();
      this.element.setAttribute('aria-label', label);
      this.describer.describe(this.element, description);
      const attributes = Object.entries(domAttributes ?? {}).filter(
        ([name, value]) =>
          (['title', 'lang', 'dir'].includes(name) || /^data-[a-z0-9_.:-]+$/.test(name)) &&
          ['string', 'number', 'boolean'].includes(typeof value),
      );
      for (const [name, value] of attributes) this.element.setAttribute(name, String(value));
      onCleanup(() => {
        this.describer.removeDescription(this.element, description);
        for (const [name] of attributes) this.element.removeAttribute(name);
      });
    });
  }
}
