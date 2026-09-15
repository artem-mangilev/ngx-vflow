import { DestroyRef, Directive, ElementRef, computed, inject, input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs/operators';
import { HandleService } from '../services/handle.service';
import { HandleModel } from '../models/handle.model';
import { FlowSettingsService } from '../services/flow-settings.service';
import { ConnectionControllerDirective } from './connection-controller.directive';
import { RootPointerDirective } from './root-pointer.directive';
import { EntityAccessibility, bindEntityAccessibility } from './entity-accessibility.directive';
import { DomAttributes } from '../interfaces/dom-attributes.interface';
import { Position } from '../types/position.type';
import { HandleLayout, HandleType } from '../types/handle-type.type';
import { HANDLE_REF, HandleRef } from '../utils/inject-handle';
import { isTouchEvent } from '../utils/event';

/**
 * Makes an element of a node presentation a connection point. The library registers, measures and, in the `auto`
 * layout, positions the element; its size and look belong to the application. State is exposed as
 * `data-vflow-handle-*` attributes for CSS and through `injectHandle()` for code, so a component can become a
 * handle with `hostDirectives: [VflowHandleDirective]`.
 */
@Directive({
  selector: '[vflowHandle]',
  exportAs: 'vflowHandle',
  standalone: true,
  providers: [{ provide: HANDLE_REF, useFactory: () => inject(VflowHandleDirective).ref }],
  host: {
    class: 'vflow-handle',
    '[attr.data-vflow-handle-type]': 'type()',
    '[attr.data-vflow-handle-position]': 'position()',
    '[attr.data-vflow-handle-state]': 'state()',
    '[attr.data-vflow-handle-can-start]': 'canStart()',
    '[attr.data-vflow-handle-can-accept]': 'canAccept()',
    '[style.position]': "placement() ? 'absolute' : null",
    '[style.top]': 'placement()?.top ?? null',
    '[style.left]': 'placement()?.left ?? null',
    '[style.right]': 'placement()?.right ?? null',
    '[style.bottom]': 'placement()?.bottom ?? null',
    '[style.transform]': 'placement()?.transform ?? null',
    '(mousedown)': 'startConnection($event)',
    '(touchstart)': 'startConnection($event)',
    '(mouseup)': 'endConnection()',
  },
})
export class VflowHandleDirective {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly handleService = inject(HandleService);
  private readonly settings = inject(FlowSettingsService);
  private readonly connectionController = inject(ConnectionControllerDirective, { optional: true });
  // Optional, so the directive also runs in unit tests of application components with `provideCustomNodeMocks()`.
  private readonly rootPointer = inject(RootPointerDirective, { optional: true });

  // TODO: pick a prefix for handle inputs (for example `vflowType` or `vwType`) so they never clash with native
  // attributes such as `button[type]` or with inputs of components that apply this directive as a host directive.
  /** `source` or `target`. Avoid on `button` and `input` elements: the attribute also reaches the native `type`. */
  public readonly type = input<HandleType>('source');

  /** Side of the node. */
  public readonly position = input<Position>('top');

  /** Identifies the handle when a node has more than one handle of a type. */
  public readonly id = input<string>();

  /** `auto` positions the element on the node side; `manual` leaves positioning to the application. */
  public readonly layout = input<HandleLayout>('auto');

  /** Shift of the element and its connection point in the `auto` layout, in flow units. */
  public readonly offsetX = input(0);
  public readonly offsetY = input(0);

  public readonly canStart = input(true);
  public readonly canAccept = input(true);
  public readonly ariaLabel = input<string>();
  public readonly ariaDescription = input<string>();
  public readonly domAttributes = input<DomAttributes>();

  private readonly model = new HandleModel(
    {
      element: this.element,
      type: this.type,
      position: this.position,
      id: this.id,
      layout: this.layout,
      offsetX: this.offsetX,
      offsetY: this.offsetY,
      canStart: this.canStart,
      canAccept: this.canAccept,
    },
    this.requireNode(),
  );

  public readonly state = this.model.state.asReadonly();

  public readonly ref: HandleRef = {
    state: this.state,
    type: this.type,
    position: this.position,
    id: this.id,
    canStart: this.canStart,
    canAccept: this.canAccept,
  };

  protected readonly placement = computed(() => {
    if (this.layout() !== 'auto') return null;

    const styles = this.model.layoutStyles();
    // Styles anchored to the right or bottom edge put the element's far half outside of that edge.
    const x = styles.right === 'auto' ? '-50%' : '50%';
    const y = styles.bottom === 'auto' ? '-50%' : '50%';

    return {
      ...styles,
      transform: `translate(${x}, ${y}) translate(${-this.offsetX()}px, ${-this.offsetY()}px)`,
    };
  });

  private readonly accessibility = computed<EntityAccessibility>(() => {
    const labels = this.settings.ariaLabels();
    const state = this.state();
    const candidate = state === 'valid' ? labels.connectionValid : state === 'invalid' ? labels.connectionInvalid : '';

    return {
      label:
        this.ariaLabel()?.trim() ||
        labels.handleLabel({ type: this.type(), id: this.id(), node: this.model.parentNode.ariaLabel() }),
      description: [
        this.ariaDescription(),
        !this.canStart() ? labels.connectionStartUnavailable : '',
        !this.canAccept() ? labels.connectionAcceptUnavailable : '',
        candidate,
      ]
        .filter(Boolean)
        .join(' '),
      domAttributes: this.domAttributes(),
    };
  });

  constructor() {
    this.handleService.createHandle(this.model);
    inject(DestroyRef).onDestroy(() => this.handleService.destroyHandle(this.model));

    bindEntityAccessibility(this.accessibility);

    this.rootPointer?.touchEnd$
      ?.pipe(
        filter(({ target }) => target === this.element),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.endConnection());
  }

  protected startConnection(event: Event) {
    // A connection gesture must not drag the node.
    event.stopPropagation();

    this.connectionController?.startConnection(this.model, event);

    if (isTouchEvent(event)) {
      this.rootPointer?.setInitialTouch(event);
    }
  }

  protected endConnection() {
    this.connectionController?.endConnection();
  }

  private requireNode() {
    const node = this.handleService.node();

    if (!node) {
      throw new Error('[ngx-vflow] vflowHandle must be placed inside a node presentation.');
    }

    return node;
  }
}
