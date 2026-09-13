import {
  ComponentRef,
  DestroyRef,
  Directive,
  Injector,
  Type,
  ViewContainerRef,
  effect,
  inject,
  input,
  output,
  reflectComponentType,
  untracked,
} from '@angular/core';
import { NodeComponentType } from '../interfaces/node.interface';
import { isComponentClass } from '../utils/is-component-class';

export interface EntityComponentOutputEvent {
  /** Property name of the output on the component class. */
  eventName: string;
  eventPayload: unknown;
}

interface OutputSubscribable {
  subscribe(listener: (value: unknown) => void): { unsubscribe(): void };
}

/**
 * Renders the component of an entity presentation. Unlike `ngComponentOutlet`, it resolves lazy component
 * factories once the entity should load and forwards every output the component declares, so component
 * events reach the flow without a base class.
 */
@Directive({
  selector: 'ng-container[entityComponentOutlet]',
  standalone: true,
})
export class EntityComponentOutletDirective {
  private viewContainer = inject(ViewContainerRef);

  public readonly entityComponentOutlet = input.required<NodeComponentType>();
  public readonly entityComponentOutletLoad = input(true);
  public readonly entityComponentOutletInjector = input.required<Injector>();

  public readonly entityComponentEvent = output<EntityComponentOutputEvent>();

  private requested: NodeComponentType | null = null;
  private request = 0;
  private ref: ComponentRef<unknown> | null = null;
  private subscriptions: { unsubscribe(): void }[] = [];

  constructor() {
    effect(() => {
      const component = this.entityComponentOutlet();
      const load = this.entityComponentOutletLoad();
      const injector = this.entityComponentOutletInjector();
      untracked(() => this.render(component, load, injector));
    });

    inject(DestroyRef).onDestroy(() => {
      // A factory that resolves after destruction must not create a component.
      this.request++;
      this.clear();
    });
  }

  private render(component: NodeComponentType, load: boolean, injector: Injector): void {
    if (!load || component === this.requested) return;

    this.requested = component;
    const request = ++this.request;

    if (isComponentClass(component)) {
      this.create(component, injector);
      return;
    }

    void (component as () => Promise<Type<unknown>>)().then((type) => {
      if (request === this.request) this.create(type, injector);
    });
  }

  private create(type: Type<unknown>, injector: Injector): void {
    this.clear();

    const ref = this.viewContainer.createComponent(type, { injector });
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
