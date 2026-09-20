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

/** Where a press must come from: a focused entity wrapper, the graph container, or either of them. */
type KeyboardCommandScope = 'entity' | 'container' | 'both';

interface KeyboardCommand {
  name: KeyboardCommandName;
  scope: KeyboardCommandScope;
  /** Whether holding the key runs the command again. */
  repeat: boolean;
  /** Whether the command took the press. Declining leaves the key to the commands behind it. */
  run: (model: NodeModel | EdgeModel | null, event: KeyboardEvent) => boolean;
}

/** Focus, its visible order and the description read out for one entity. Commands live on the container. */
@Directive({
  selector: '[vflowKeyboardEntity]',
  host: {
    '[attr.tabindex]': 'vflowKeyboardEntity().focusable() ? 0 : -1',
    '(focus)': 'onFocus()',
  },
})
export class KeyboardEntityDirective {
  public vflowKeyboardEntity = input.required<NodeModel | EdgeModel>();
  public element = inject<ElementRef<HTMLElement | SVGElement>>(ElementRef).nativeElement;
  private keyboard = inject(KeyboardService);
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
}

/**
 * Native Tab traversal, focus repair when an entity disappears, and the one listener that turns a key press into a
 * command. A press is answered by the first command whose key it carries, that its origin allows, and that accepts
 * it; a command that declines leaves the key to the ones behind it.
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
  private selection = inject(SelectionService);
  private draggable = inject(DraggableService);
  private flowEntities = inject(FlowEntitiesService);
  private previous: readonly KeyboardEntityDirective[] = [];
  private focused?: { entity: KeyboardEntityDirective; target: Element };

  /** Every command in the order a press consults them. */
  private readonly commands: KeyboardCommand[] = [
    { name: 'select', scope: 'entity', repeat: false, run: (model) => this.runSelect(model, true) },
    { name: 'clearSelection', scope: 'entity', repeat: false, run: (model) => this.runSelect(model, false) },
    { name: 'delete', scope: 'entity', repeat: false, run: (model) => this.runDelete(model) },
    ...DIRECTIONS.map((direction): KeyboardCommand => ({
      name: direction.move,
      scope: 'entity',
      repeat: true,
      run: (model, event) => this.runMove(model, direction, event),
    })),
    ...DIRECTIONS.map((direction): KeyboardCommand => ({
      name: direction.pan,
      scope: 'both',
      repeat: true,
      run: (_model, event) => this.runPan(direction, event),
    })),
    { name: 'zoomIn', scope: 'both', repeat: true, run: () => this.runZoom(1) },
    { name: 'zoomOut', scope: 'both', repeat: true, run: () => this.runZoom(-1) },
    { name: 'fitView', scope: 'both', repeat: false, run: () => this.runFitView() },
  ];

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
    if (
      event.defaultPrevented ||
      !(target instanceof Element) ||
      target !== this.element.ownerDocument.activeElement ||
      target.closest('[data-vflow-no-keyboard]') ||
      target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])') ||
      // A key held as a gesture modifier (for example Space for panning) belongs to the gesture layer.
      this.keyboard.isModifierKey(event)
    )
      return;

    // Embedded application content keeps its own keys: only a library wrapper and the container issue commands.
    const entity = this.entities().find((candidate) => candidate.element === target);
    const origin: KeyboardCommandScope | null = entity ? 'entity' : target === this.element ? 'container' : null;
    if (!origin || (entity && !entity.vflowKeyboardEntity().focusable())) return;
    const model = entity?.vflowKeyboardEntity() ?? null;

    for (const command of this.commands) {
      if (command.scope !== 'both' && command.scope !== origin) continue;
      if (!this.keyboard.isCommand(command.name, event)) continue;
      // Auto-repeat holds the key for its command while only the repeating ones run again.
      if (!(event.repeat && !command.repeat) && !command.run(model, event)) continue;
      event.preventDefault();
      event.stopPropagation();
      return;
    }
  }

  private runSelect(model: NodeModel | EdgeModel | null, select: boolean) {
    if (!model) return false;
    const labels = this.settings.ariaLabels();
    const changed = this.selection.selectFromKeyboard(
      select ? model : null,
      this.keyboard.isActiveModifier('multiSelection'),
    );
    if (changed) {
      this.announcer.announce(
        select
          ? labels.selectionAnnouncement({
              label: model.accessibility().label,
              selected: model.selected(),
              count: this.flowEntities.entities().filter((entity) => entity.selected()).length,
            })
          : labels.selectionClearedAnnouncement,
      );
    }
    return true;
  }

  private runDelete(model: NodeModel | EdgeModel | null) {
    if (!model) return false;
    // The command acts at the point of focus: the whole selection when the focused entity belongs to it,
    // otherwise only the focused entity, so a stale selection elsewhere is never deleted by surprise.
    const target = (entity: NodeModel | EdgeModel) => (model.selected() ? entity.selected() : entity === model);
    this.keyboard.deleteRequest$.next({
      nodeIds: this.flowEntities
        .nodes()
        .filter(target)
        .map((node) => node.rawNode.id),
      edgeIds: this.flowEntities
        .edges()
        .filter(target)
        .map((edge) => edge.edge.id),
    });
    return true;
  }

  private runMove(model: NodeModel | EdgeModel | null, direction: (typeof DIRECTIONS)[number], event: KeyboardEvent) {
    // An arrow that moves nothing is declined, so the same key pans the view instead.
    if (!(model instanceof NodeModel) || !model.selected() || !model.draggable()) return false;
    const moved = this.draggable.moveSelected(model, direction.vector, event.shiftKey);
    if (moved.length > 0) {
      const { x, y } = model.point();
      const labels = this.settings.ariaLabels();
      this.announcer.announce(labels.movedAnnouncement({ count: moved.length, direction: direction.name, x, y }));
    }
    return true;
  }

  private runPan(direction: (typeof DIRECTIONS)[number], event: KeyboardEvent) {
    const { x, y } = this.viewport.readableViewport();
    const step = PAN_STEP * (event.shiftKey ? 4 : 1);
    // Arrows scroll the view: pressing right reveals what lies to the right, so the content moves left.
    this.viewport.writableViewport.set({
      changeType: 'absolute',
      state: { x: x - direction.vector.x * step, y: y - direction.vector.y * step },
      duration: 0,
    });
    return true;
  }

  private runZoom(step: 1 | -1) {
    const zoom = Math.min(
      this.settings.maxZoom(),
      Math.max(this.settings.minZoom(), this.viewport.readableViewport().zoom * ZOOM_STEP ** step),
    );
    this.viewport.writableViewport.set({ changeType: 'absolute', state: { zoom }, duration: 0 });
    this.announcer.announce(this.settings.ariaLabels().zoomAnnouncement(zoom));
    return true;
  }

  private runFitView() {
    const state = this.viewport.fitView({ padding: 0.1, duration: 0 });
    if (state) this.announcer.announce(this.settings.ariaLabels().zoomAnnouncement(state.zoom));
    return true;
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
