import { Directive, ElementRef, effect, inject, input, Signal } from '@angular/core';
import { AriaDescriber } from '@angular/cdk/a11y';
import { DomAttributes } from '../interfaces/dom-attributes.interface';
import { KeyboardEntityDirective } from './keyboard-entity.directive';

/** Shared semantics for the library-owned HTML and SVG entity wrappers. */
export type EntityAccessibility = {
  label: string;
  description?: string;
  domAttributes?: DomAttributes;
  role?: 'group' | 'region' | 'img';
};

/** `data-*`, `title`, `lang` and `dir` with primitive values; everything else is library-owned and ignored. */
function safeDomAttributes(domAttributes: DomAttributes | undefined): [string, string][] {
  return Object.entries(domAttributes ?? {})
    .filter(
      ([name, value]) =>
        (['title', 'lang', 'dir'].includes(name) || /^data-[a-z0-9_.:-]+$/.test(name)) &&
        ['string', 'number', 'boolean'].includes(typeof value),
    )
    .map(([name, value]) => [name, String(value)]);
}

/** Applies the allowed DOM attributes to the element of the current injection context, without semantics. */
export function bindDomAttributes(source: () => DomAttributes | undefined): void {
  const element = inject<ElementRef<Element>>(ElementRef).nativeElement;

  effect((onCleanup) => {
    const attributes = safeDomAttributes(source());
    for (const [name, value] of attributes) element.setAttribute(name, value);
    onCleanup(() => {
      for (const [name] of attributes) element.removeAttribute(name);
    });
  });
}

/** Applies role, name, description and allowed DOM attributes to the element of the current injection context. */
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
    const attributes = safeDomAttributes(domAttributes);
    for (const [name, value] of attributes) element.setAttribute(name, value);
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
