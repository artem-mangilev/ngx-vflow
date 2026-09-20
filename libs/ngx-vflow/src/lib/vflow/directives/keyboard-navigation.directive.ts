import { Directive, ElementRef, afterRenderEffect, contentChildren, inject } from '@angular/core';
import { NodeModel } from '../models/node.model';
import { EdgeModel } from '../models/edge.model';
import { KeyboardService } from '../services/keyboard.service';
import { KeyboardEntityCommandsService } from '../services/keyboard-entity-commands.service';
import { KeyboardViewportCommandsService } from '../services/keyboard-viewport-commands.service';
import { KeyboardCommandName } from '../types/keyboard-shortcuts.type';
import { ARROW_COMMANDS, KeyboardCommandScope } from '../utils/keyboard-commands';
import { KeyboardEntityDirective } from './keyboard-entity.directive';

interface KeyboardCommand {
  name: KeyboardCommandName;
  scope: KeyboardCommandScope;
  /** Whether holding the key runs the command again. */
  repeat: boolean;
  /** Whether the command took the press. Declining leaves the key to the commands behind it. */
  run: (model: NodeModel | EdgeModel | null, event: KeyboardEvent) => boolean;
}

/**
 * Native Tab traversal, focus repair when an entity disappears, and the one listener that turns a key press into a
 * command. A press is answered by the first command whose key it carries, that its origin allows, and that accepts
 * it.
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
  private entityCommands = inject(KeyboardEntityCommandsService);
  private viewportCommands = inject(KeyboardViewportCommandsService);
  private previous: readonly KeyboardEntityDirective[] = [];
  private focused?: { entity: KeyboardEntityDirective; target: Element };

  /** Every command in the order a press consults them. */
  private readonly commands: KeyboardCommand[] = [
    { name: 'select', scope: 'entity', repeat: false, run: (model) => !!model && this.entityCommands.select(model) },
    { name: 'clearSelection', scope: 'entity', repeat: false, run: () => this.entityCommands.clearSelection() },
    {
      name: 'delete',
      scope: 'entity',
      repeat: false,
      run: (model) => !!model && this.entityCommands.requestDeletion(model),
    },
    ...ARROW_COMMANDS.map((arrow): KeyboardCommand => ({
      name: arrow.move,
      scope: 'entity',
      repeat: true,
      run: (model, event) => !!model && this.entityCommands.move(model, arrow, event.shiftKey),
    })),
    ...ARROW_COMMANDS.map((arrow): KeyboardCommand => ({
      name: arrow.pan,
      scope: 'both',
      repeat: true,
      run: (_model, event) => this.viewportCommands.pan(arrow, event.shiftKey),
    })),
    { name: 'zoomIn', scope: 'both', repeat: true, run: () => this.viewportCommands.zoom(1) },
    { name: 'zoomOut', scope: 'both', repeat: true, run: () => this.viewportCommands.zoom(-1) },
    { name: 'fitView', scope: 'both', repeat: false, run: () => this.viewportCommands.fitView() },
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
