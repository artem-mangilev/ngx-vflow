import {
  ComponentRef,
  DestroyRef,
  Directive,
  EnvironmentInjector,
  Injector,
  Type,
  ViewContainerRef,
  createComponent,
  effect,
  inject,
  input,
  output,
  reflectComponentType,
  untracked,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { EntityComponentType } from '../interfaces/node.interface';
import { isComponentClass } from '../utils/is-component-class';

export interface EntityComponentOutputEvent {
  /** Property name of the output on the component class. */
  eventName: string;
  eventPayload: unknown;
}

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

interface OutputSubscribable {
  subscribe(listener: (value: unknown) => void): { unsubscribe(): void };
}

/**
 * Renders the component of an entity presentation. Unlike `ngComponentOutlet`, it resolves lazy component
 * factories once the entity should load and forwards every output the component declares, so component
 * events reach the flow without a base class.
 *
 * With `entityComponentOutletSvgHost`, the component is created on an SVG group made by the flow instead of
 * an element from its selector, so an edge component can draw SVG inside the edge SVG.
 */
@Directive({
  selector: 'ng-container[entityComponentOutlet]',
  standalone: true,
})
export class EntityComponentOutletDirective {
  private viewContainer = inject(ViewContainerRef);
  private document = inject(DOCUMENT);

  public readonly entityComponentOutlet = input.required<EntityComponentType>();
  public readonly entityComponentOutletLoad = input(true);
  public readonly entityComponentOutletInjector = input.required<Injector>();
  public readonly entityComponentOutletSvgHost = input(false);

  public readonly entityComponentEvent = output<EntityComponentOutputEvent>();

  private requested: EntityComponentType | null = null;
  private request = 0;
  private ref: ComponentRef<unknown> | null = null;
  private subscriptions: { unsubscribe(): void }[] = [];

  constructor() {
    effect(() => {
      const component = this.entityComponentOutlet();
      const load = this.entityComponentOutletLoad();
      const injector = this.entityComponentOutletInjector();
      const svgHost = this.entityComponentOutletSvgHost();
      untracked(() => this.render(component, load, injector, svgHost));
    });

    inject(DestroyRef).onDestroy(() => {
      // A factory that resolves after destruction must not create a component.
      this.request++;
      this.clear();
    });
  }

  private render(component: EntityComponentType, load: boolean, injector: Injector, svgHost: boolean): void {
    if (!load || component === this.requested) return;

    this.requested = component;
    const request = ++this.request;

    if (isComponentClass(component)) {
      this.create(component, injector, svgHost);
      return;
    }

    void (component as () => Promise<Type<unknown>>)().then((type) => {
      if (request === this.request) this.create(type, injector, svgHost);
    });
  }

  private create(type: Type<unknown>, injector: Injector, svgHost: boolean): void {
    this.clear();

    let ref: ComponentRef<unknown>;
    if (svgHost) {
      // An element from the selector would be created in the HTML namespace and not render inside SVG.
      ref = createComponent(type, {
        environmentInjector: injector.get(EnvironmentInjector),
        elementInjector: injector,
        hostElement: this.document.createElementNS(SVG_NAMESPACE, 'g'),
      });
      this.viewContainer.insert(ref.hostView);
    } else {
      ref = this.viewContainer.createComponent(type, { injector });
    }
    this.ref = ref;

    for (const { propName } of reflectComponentType(type)?.outputs ?? []) {
      const emitter = (ref.instance as Record<string, OutputSubscribable | undefined>)[propName];
      const subscription = emitter?.subscribe((eventPayload) =>
        this.entityComponentEvent.emit({ eventName: propName, eventPayload }),
      );
      if (subscription) this.subscriptions.push(subscription);
    }

    ref.changeDetectorRef.markForCheck();
  }

  private clear(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
    this.subscriptions = [];
    this.ref?.destroy();
    this.ref = null;
  }
}
