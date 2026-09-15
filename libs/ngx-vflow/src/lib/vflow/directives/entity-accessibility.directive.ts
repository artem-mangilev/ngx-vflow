import { Directive, ElementRef, effect, inject, input, Signal } from '@angular/core';
import { AriaDescriber } from '@angular/cdk/a11y';
import { DomAttributes } from '../interfaces/dom-attributes.interface';
import { KeyboardEntityDirective } from './keyboard-navigation.directive';

/** Shared semantics for the library-owned HTML and SVG entity wrappers and for handle elements. */
export type EntityAccessibility = {
  label: string;
  description?: string;
  domAttributes?: DomAttributes;
  role?: 'group' | 'region' | 'img';
};

/**
 * Applies role, name, description and allowed DOM attributes to the element of the current injection context.
 * Directives that cannot bind `[vflowA11y]` on their host, such as the handle directive, call it directly.
 */
export function bindEntityAccessibility(source: () => EntityAccessibility): void {
  const element = inject<ElementRef<Element>>(ElementRef).nativeElement;
  const describer = inject(AriaDescriber);
  const keyboard = inject(KeyboardEntityDirective, { self: true, optional: true });

  effect((onCleanup) => {
    const { label, description: entityDescription = '', domAttributes, role = 'group' } = source();
    element.setAttribute('role', role);
    const description = [entityDescription, keyboard?.description()].filter(Boolean).join(' ');
    element.setAttribute('aria-label', label);
    describer.describe(element, description);
    const attributes = Object.entries(domAttributes ?? {}).filter(
      ([name, value]) =>
        (['title', 'lang', 'dir'].includes(name) || /^data-[a-z0-9_.:-]+$/.test(name)) &&
        ['string', 'number', 'boolean'].includes(typeof value),
    );
    for (const [name, value] of attributes) element.setAttribute(name, String(value));
    onCleanup(() => {
      describer.removeDescription(element, description);
      for (const [name] of attributes) element.removeAttribute(name);
    });
  });
}

@Directive({ selector: '[vflowA11y]' })
export class EntityAccessibilityDirective {
  // Pass the model: Angular dev reflection stringifies bare signals and reads them in the parent view.
  public vflowA11y = input.required<EntityAccessibility | { accessibility: Signal<EntityAccessibility> }>();

  constructor() {
    bindEntityAccessibility(() => {
      const value = this.vflowA11y();
      return 'accessibility' in value ? value.accessibility() : value;
    });
  }
}
