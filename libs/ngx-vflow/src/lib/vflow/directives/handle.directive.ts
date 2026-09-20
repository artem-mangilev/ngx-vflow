import { DestroyRef, Directive, ElementRef, computed, inject, input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter, tap } from 'rxjs/operators';
import { HandleService } from '../services/handle.service';
import { HandleModel } from '../models/handle.model';
import { FlowSettingsService } from '../services/flow-settings.service';
import { FlowStatusService } from '../services/flow-status.service';
import { ConnectionControllerDirective } from './connection-controller.directive';
import { RootPointerDirective } from './root-pointer.directive';
import { EntityAccessibility, bindEntityAccessibility } from './entity-accessibility.directive';
import { DomAttributes } from '../interfaces/dom-attributes.interface';
import { HandleLayout, HandlePosition, HandleType } from '../types/handle-type.type';
import { isTouchEvent } from '../utils/event';

/**
 * Makes an element of a node presentation a connection point: a port on a node side, or, with `position="auto"`
 * or `"center"`, a surface such as the whole node whose edges meet the node wherever the other end is. The
 * library registers, measures and, in the `auto` layout, positions a port; its size and look belong to the
 * application. State is exposed as
 * `data-vflow-handle-*` attributes for CSS and as signals of this directive for code: `#h="vflowHandle"` in a
 * template, `inject(VflowHandleDirective)` in a component that applies it through `hostDirectives` or in content of
 * a handle element.
 */
@Directive({
  selector: '[vflowHandle]',
  exportAs: 'vflowHandle',
  standalone: true,
  host: {
    class: 'vflow-handle',
    '[attr.data-vflow-handle-type]': 'handleType()',
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
    '(mouseenter)': 'pointerEnter()',
    '(mouseleave)': 'pointerLeave()',
  },
})
export class VflowHandleDirective {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly handleService = inject(HandleService);
  private readonly settings = inject(FlowSettingsService);
  private readonly flowStatus = inject(FlowStatusService);
  private readonly connectionController = inject(ConnectionControllerDirective, { optional: true });
  // Optional, so the directive also runs in unit tests of application components with `provideCustomNodeMocks()`.
  private readonly rootPointer = inject(RootPointerDirective, { optional: true });

  /** `source`, `target`, or `any` for both directions. */
  public readonly handleType = input<HandleType>('source');

  /**
   * Where the connection point is: a side of the node, `auto` (the side facing the other end of each edge) or
   * `center`. With `auto` and `center` the element is not positioned and only starts and accepts connections.
   */
  public readonly position = input<HandlePosition>('top');

  /** Identifies the handle when a node has more than one handle of a role; `Edge.sourceHandle` and `targetHandle` refer to it. */
  public readonly handleId = input<string>();

  /** `auto` positions the element on the node side; `manual` leaves positioning to the application. Sides only. */
  public readonly layout = input<HandleLayout>('auto');

  /** Shift of the element and its connection point in the `auto` layout, in flow units: positive is right and down. */
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
      type: this.handleType,
      position: this.position,
      id: this.handleId,
      layout: this.layout,
      offsetX: this.offsetX,
      offsetY: this.offsetY,
      canStart: this.canStart,
      canAccept: this.canAccept,
    },
    this.requireNode(),
  );

  public readonly state = this.model.state.asReadonly();

  protected readonly placement = computed(() => {
    if (this.layout() !== 'auto' || this.model.dynamic()) return null;

    const styles = this.model.layoutStyles();
    // Styles anchored to the right or bottom edge put the element's far half outside of that edge.
    const x = styles.right === 'auto' ? '-50%' : '50%';
    const y = styles.bottom === 'auto' ? '-50%' : '50%';

    return {
      ...styles,
      transform: `translate(${x}, ${y}) translate(${this.offsetX()}px, ${this.offsetY()}px)`,
    };
  });

  private readonly accessibility = computed<EntityAccessibility>(() => {
    const labels = this.settings.ariaLabels();
    const state = this.state();
    const candidate = state === 'valid' ? labels.connectionValid : state === 'invalid' ? labels.connectionInvalid : '';

    return {
      label:
        this.ariaLabel()?.trim() ||
        labels.handleLabel({ type: this.handleType(), id: this.handleId(), node: this.model.parentNode.ariaLabel() }),
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

    // Touch has no enter and leave: the element under the finger decides.
    let touchInside = false;
    this.rootPointer?.touchMovement$
      ?.pipe(
        tap(({ target }) => {
          const inside = !!target && this.element.contains(target);
          if (inside && !touchInside) this.pointerEnter();
          if (!inside && touchInside) this.pointerLeave();
          touchInside = inside;
        }),
        takeUntilDestroyed(),
      )
      .subscribe();
  }

  /**
   * The event also reaches the node, whose drag and the pane's pan reject targets inside a handle. A drag handle
   * inside the handle element keeps dragging the node instead of starting a connection.
   */
  protected startConnection(event: Event) {
    const dragHandle = event.target instanceof Element ? event.target.closest('.vflow-drag-handle') : null;
    if (dragHandle && this.element.contains(dragHandle)) return;

    this.connectionController?.startConnection(this.model, event);

    if (isTouchEvent(event)) {
      this.rootPointer?.setInitialTouch(event);
    }
  }

  protected endConnection() {
    this.connectionController?.endConnection();
  }

  /** The element is a drop zone of the connection in progress, in addition to the magnet around its point. */
  protected pointerEnter() {
    if (this.flowStatus.connectionActive()) this.connectionController?.validateConnection(this.model);
  }

  protected pointerLeave() {
    if (this.flowStatus.connectionActive()) this.connectionController?.resetValidateConnection(this.model);
  }

  private requireNode() {
    const node = this.handleService.node();

    if (!node) {
      throw new Error('[ngx-vflow] vflowHandle must be placed inside a node presentation.');
    }

    return node;
  }
}
