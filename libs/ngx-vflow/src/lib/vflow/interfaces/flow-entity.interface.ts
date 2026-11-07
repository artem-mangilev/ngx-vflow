import { Signal, WritableSignal } from '@angular/core';
import { DomAttributes } from './dom-attributes.interface';

/** What a node and an edge have in common for selection, focus, culling and accessibility. */
export interface FlowEntity {
  selected: WritableSignal<boolean>;
  preselected: WritableSignal<boolean>;
  selectable: Signal<boolean>;
  focusable: Signal<boolean>;
  focused: WritableSignal<boolean>;
  inViewport: WritableSignal<boolean>;
  culled: Signal<boolean>;
  shouldLoad: Signal<boolean>;
  renderOrder: WritableSignal<number>;
  accessibility: Signal<EntityAccessibility>;
}

/** What the accessibility directive renders on an entity wrapper. */
export interface EntityAccessibility {
  label: string;
  description: string;
  roleDescription: string;
  domAttributes?: DomAttributes;
}
