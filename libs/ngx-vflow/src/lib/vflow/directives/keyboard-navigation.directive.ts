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
import { AnnouncerService } from '../services/announcer.service';
import { FlowEntitiesService } from '../services/flow-entities.service';
import { KeyboardCommandName } from '../types/keyboard-shortcuts.type';

type ArrowDirection = 'left' | 'right' | 'up' | 'down';

const ZOOM_COMMANDS: KeyboardCommandName[] = ['zoomIn', 'zoomOut', 'fitView'];
/** Screen pixels per arrow press when panning the viewport; Shift multiplies by 4 like node movement. */
const PAN_STEP = 15;
/** Multiplicative zoom step per press, the same as the `vflow-controls` buttons. */
const ZOOM_STEP = 1.2;

/** The four directions with the command that moves a node and the command that pans the view in each. */
const DIRECTIONS: { name: ArrowDirection; vector: Point; move: KeyboardCommandName; pan: KeyboardCommandName }[] = [
  { name: 'left', vector: { x: -1, y: 0 }, move: 'moveLeft', pan: 'panLeft' },
  { name: 'right', vector: { x: 1, y: 0 }, move: 'moveRight', pan: 'panRight' },
  { name: 'up', vector: { x: 0, y: -1 }, move: 'moveUp', pan: 'panUp' },
  { name: 'down', vector: { x: 0, y: 1 }, move: 'moveDown', pan: 'panDown' },
];

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
  private announcer = inject(AnnouncerService);
  private entities = inject(FlowEntitiesService);

  public description = computed(() => {
    const model = this.vflowKeyboardEntity();
    if (!model.focusable()) return '';
    const labels = this.settings.ariaLabels();
    if (this.element.closest('[data-vflow-no-keyboard]')) return labels.keyboardNavigation;
    const selection = this.settings.selectionMode() !== 'manual';
    return [
      labels.keyboardNavigation,
      selection && model.selectable() && this.keyboard.hasCommand('select') ? labels.keyboardSelect : '',
      selection && this.keyboard.hasCommand('clearSelection') ? labels.keyboardDeselect : '',
      model instanceof NodeModel &&
      model.draggable() &&
      DIRECTIONS.some((entry) => this.keyboard.hasCommand(entry.move))
        ? labels.keyboardMove
        : '',
      this.keyboard.hasCommand('delete') ? labels.keyboardDelete : '',
      DIRECTIONS.some((entry) => this.keyboard.hasCommand(entry.pan)) ? labels.keyboardPan : '',
      ZOOM_COMMANDS.some((command) => this.keyboard.hasCommand(command)) ? labels.keyboardZoom : '',
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
      this.element.closest('[data-vflow-no-keyboard]') ||
      // A key held as a gesture modifier (for example Space for panning) belongs to the gesture layer.
      this.keyboard.isModifierKey(event)
    )
      return;

    const labels = this.settings.ariaLabels();
    const select = this.keyboard.isCommand('select', event);
    if (select || this.keyboard.isCommand('clearSelection', event)) {
      event.preventDefault();
      event.stopPropagation();
      if (event.repeat) return;
      const changed = this.selection.selectFromKeyboard(
        select ? model : null,
        this.keyboard.isActiveModifier('multiSelection'),
      );
      if (!changed) return;
      this.announcer.announce(
        !select
          ? labels.selectionClearedAnnouncement
          : labels.selectionAnnouncement({
              label: model.accessibility().label,
              selected: model.selected(),
              count: this.entities.entities().filter((entity) => entity.selected()).length,
            }),
      );
    } else if (this.keyboard.isCommand('delete', event)) {
      event.preventDefault();
      event.stopPropagation();
      if (event.repeat) return;
      // The command acts at the point of focus: the whole selection when the focused entity belongs to it,
      // otherwise only the focused entity, so a stale selection elsewhere is never deleted by surprise.
      const target = (entity: NodeModel | EdgeModel) => (model.selected() ? entity.selected() : entity === model);
      this.keyboard.deleteRequest$.next({
        nodeIds: this.entities
          .nodes()
          .filter(target)
          .map((node) => node.rawNode.id),
        edgeIds: this.entities
          .edges()
          .filter(target)
          .map((edge) => edge.edge.id),
      });
    } else if (model instanceof NodeModel && model.selected() && model.draggable()) {
      // An arrow that moves nothing is left unhandled, so the container pans the view with it instead.
      const direction = DIRECTIONS.find((entry) => this.keyboard.isCommand(entry.move, event));
      if (!direction) return;
      event.preventDefault();
      event.stopPropagation();
      const moved = this.draggable.moveSelected(model, direction.vector, event.shiftKey);
      if (moved.length === 0) return;
      const { x, y } = model.point();
      this.announcer.announce(labels.movedAnnouncement({ count: moved.length, direction: direction.name, x, y }));
    }
  }
}

/**
 * Native Tab traversal; only repair focus when its owning entity disappears or opts out. Viewport commands that
 * a focused wrapper does not consume, and the same commands on the container itself, pan and zoom the view.
 */
@Directive({
  selector: '[vflowKeyboard]',
  host: {
    tabindex: '-1',
    '(focusin)': 'onFocusIn($event)',
    '(focusout)': 'onFocusOut($event)',
    '(keydown)': 'onKeydown($event)',
    '(scroll)': 'resetScroll()',
  },
})
export class KeyboardNavigationDirective {
  private element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private entities = contentChildren(KeyboardEntityDirective, { descendants: true });
  private keyboard = inject(KeyboardService);
  private viewport = inject(ViewportService);
  private settings = inject(FlowSettingsService);
  private announcer = inject(AnnouncerService);
  private previous: readonly KeyboardEntityDirective[] = [];
  private focused?: { entity: KeyboardEntityDirective; target: Element };

  constructor() {
    afterRenderEffect(() => {
      const entities = this.entities();
      const eligible = entities.filter(
        (entity) => entity.vflowKeyboardEntity().focusable() && !entity.vflowKeyboardEntity().culled(),
      );
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

  protected onKeydown(event: KeyboardEvent) {
    const target = event.composedPath()[0];
    // Only the container and library wrappers issue viewport commands; embedded content keeps its own keys.
    // Browser shortcuts such as Ctrl+Plus survive because a binding that names no modifier requires none.
    if (
      event.defaultPrevented ||
      !(target instanceof Element) ||
      (target !== this.element && !this.entities().some((entity) => entity.element === target)) ||
      target.closest('[data-vflow-no-keyboard]')
    )
      return;

    const direction = DIRECTIONS.find((entry) => this.keyboard.isCommand(entry.pan, event));
    if (direction) {
      event.preventDefault();
      const { vector } = direction;
      const { x, y } = this.viewport.readableViewport();
      const step = PAN_STEP * (event.shiftKey ? 4 : 1);
      // Arrows scroll the view: pressing right reveals what lies to the right, so the content moves left.
      this.viewport.writableViewport.set({
        changeType: 'absolute',
        state: { x: x - vector.x * step, y: y - vector.y * step },
        duration: 0,
      });
      return;
    }

    const labels = this.settings.ariaLabels();
    if (this.keyboard.isCommand('zoomIn', event) || this.keyboard.isCommand('zoomOut', event)) {
      event.preventDefault();
      const direction = this.keyboard.isCommand('zoomIn', event) ? 1 : -1;
      const zoom = Math.min(
        this.settings.maxZoom(),
        Math.max(this.settings.minZoom(), this.viewport.readableViewport().zoom * ZOOM_STEP ** direction),
      );
      this.viewport.writableViewport.set({ changeType: 'absolute', state: { zoom }, duration: 0 });
      this.announcer.announce(labels.zoomAnnouncement(zoom));
    } else if (this.keyboard.isCommand('fitView', event)) {
      event.preventDefault();
      if (event.repeat) return;
      const state = this.viewport.fitView({ padding: 0.1, duration: 0 });
      if (state) this.announcer.announce(labels.zoomAnnouncement(state.zoom));
    }
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
