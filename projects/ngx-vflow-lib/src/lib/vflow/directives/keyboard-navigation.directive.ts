import { Directive, ElementRef, afterRenderEffect, computed, contentChildren, inject, input } from '@angular/core';
import { NodeModel } from '../models/node.model';
import { EdgeModel } from '../models/edge.model';
import { SelectionService } from '../services/selection.service';
import { KeyboardService } from '../services/keyboard.service';
import { DraggableService } from '../services/draggable.service';
import { Point } from '../interfaces/point.interface';
import { FlowSettingsService } from '../services/flow-settings.service';
import { ViewportService } from '../services/viewport.service';
import { getViewportBounds, getViewportForBounds } from '../utils/viewport';
import { getNodesFlowBounds } from '../utils/nodes';
import { getOverlappingArea } from '../utils/rect';

const ARROW_DIRECTIONS: Record<string, Point> = {
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
};

@Directive({
  selector: '[vflowKeyboardEntity]',
  host: {
    '[attr.tabindex]': 'vflowKeyboardEntity().focusable() ? 0 : -1',
    '(keydown)': 'onKeydown($event)',
    '(focus)': 'onFocus()',
  },
})
export class KeyboardEntityDirective {
  public vflowKeyboardEntity = input.required<NodeModel | EdgeModel>();
  public element = inject<ElementRef<HTMLElement | SVGElement>>(ElementRef).nativeElement;
  private selection = inject(SelectionService);
  private keyboard = inject(KeyboardService);
  private draggable = inject(DraggableService);
  private settings = inject(FlowSettingsService);
  private viewport = inject(ViewportService);

  public description = computed(() => {
    const model = this.vflowKeyboardEntity();
    if (!model.focusable()) return '';
    const labels = this.settings.ariaLabels();
    if (this.element.closest('[data-vflow-no-keyboard]')) return labels.keyboardNavigation;
    const selection = this.settings.selectionMode() !== 'manual';
    return [
      labels.keyboardNavigation,
      selection && model.selectable() ? labels.keyboardSelect : '',
      selection ? labels.keyboardDeselect : '',
      model instanceof NodeModel && model.draggable() ? labels.keyboardMove : '',
    ]
      .filter(Boolean)
      .join(' ');
  });

  protected onFocus() {
    const model = this.vflowKeyboardEntity();
    if (
      !(model instanceof NodeModel) ||
      !model.focusable() ||
      !this.settings.autoPanOnNodeFocus() ||
      !this.element.matches(':focus-visible') ||
      this.element.closest('[data-vflow-no-keyboard]')
    )
      return;
    const bounds = getNodesFlowBounds([model]);
    const width = this.settings.computedFlowWidth();
    const height = this.settings.computedFlowHeight();
    const viewport = this.viewport.readableViewport();
    if (
      width <= 0 ||
      height <= 0 ||
      bounds.width <= 0 ||
      bounds.height <= 0 ||
      getOverlappingArea(bounds, getViewportBounds(viewport, width, height)) > 0
    )
      return;
    this.viewport.writableViewport.set({
      changeType: 'absolute',
      state: getViewportForBounds(bounds, width, height, viewport.zoom, viewport.zoom, 0),
      duration: 0,
    });
  }

  protected onKeydown(event: KeyboardEvent) {
    const model = this.vflowKeyboardEntity();
    if (
      event.defaultPrevented ||
      event.composedPath()[0] !== this.element ||
      this.element.ownerDocument.activeElement !== this.element ||
      !model.focusable() ||
      this.element.closest('[data-vflow-no-keyboard]')
    )
      return;

    if (['Enter', ' ', 'Escape'].includes(event.key)) {
      event.preventDefault();
      event.stopPropagation();
      if (!event.repeat)
        this.selection.selectFromKeyboard(
          event.key === 'Escape' ? null : model,
          this.keyboard.isActiveAction('multiSelection'),
        );
    } else if (
      Object.hasOwn(ARROW_DIRECTIONS, event.key) &&
      model instanceof NodeModel &&
      model.selected() &&
      model.draggable()
    ) {
      event.preventDefault();
      event.stopPropagation();
      this.draggable.moveSelected(model, ARROW_DIRECTIONS[event.key], event.shiftKey);
    }
  }
}

/** Native Tab traversal; only repair focus when its owning entity disappears or opts out. */
@Directive({
  selector: '[vflowKeyboard]',
  host: {
    tabindex: '-1',
    '(focusin)': 'onFocusIn($event)',
    '(focusout)': 'onFocusOut($event)',
    '(scroll)': 'resetScroll()',
  },
})
export class KeyboardNavigationDirective {
  private element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private entities = contentChildren(KeyboardEntityDirective, { descendants: true });
  private previous: readonly KeyboardEntityDirective[] = [];
  private focused?: { entity: KeyboardEntityDirective; target: Element };

  constructor() {
    afterRenderEffect(() => {
      const entities = this.entities();
      const eligible = entities.filter((entity) => entity.vflowKeyboardEntity().focusable());
      const previous = this.previous;
      this.previous = entities;
      if (!this.focused) return;
      const { entity, target } = this.focused;
      if (entities.includes(entity) && (eligible.includes(entity) || target !== entity.element)) return;
      const active = this.element.ownerDocument.activeElement;
      this.focused = undefined;
      if (active && active !== target && active !== this.element.ownerDocument.body) return;
      const index = previous.indexOf(entity);
      const next =
        [...previous.slice(index + 1), ...previous.slice(0, index).reverse()].find((candidate) =>
          eligible.includes(candidate),
        ) ?? eligible[0];
      (next?.element ?? this.element).focus({ preventScroll: true });
    });
  }

  protected onFocusIn(event: FocusEvent) {
    const target = event.composedPath()[0];
    const entity = this.entities().find((entry) => target instanceof Element && entry.element.contains(target));
    this.focused = entity && target instanceof Element ? { entity, target } : undefined;
  }

  protected resetScroll() {
    // Focusing offscreen transformed content must not scroll the graph's clipping container.
    this.element.scrollTop = 0;
    this.element.scrollLeft = 0;
  }

  protected onFocusOut(event: FocusEvent) {
    if (event.relatedTarget instanceof Element && !this.element.contains(event.relatedTarget)) {
      this.focused = undefined;
    }
  }
}
