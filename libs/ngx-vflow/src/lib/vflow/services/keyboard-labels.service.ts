import { Injectable, computed, inject } from '@angular/core';
import { KeyboardService } from './keyboard.service';
import { FlowSettingsService } from './flow-settings.service';
import { KeyboardInstruction, KeyboardInstructionKeys } from '../interfaces/aria-label-config.interface';
import { KeyboardCommandName } from '../types/keyboard-shortcuts.type';
import { isMacPlatform } from '../utils/keyboard-binding';
import { formatAriaShortcut, formatBindings } from '../utils/keyboard-format';
import { ARROW_COMMANDS, ArrowCommand } from '../utils/keyboard-commands';

/** Turns the keys that are bound right now into the text read out with an entity and into the graph's key list. */
@Injectable()
export class KeyboardLabelsService {
  private keyboard = inject(KeyboardService);
  private settings = inject(FlowSettingsService);
  private mac = isMacPlatform();

  /** The key lists an instruction is written from. Follows every remap. */
  public keys = computed<KeyboardInstructionKeys>(() => {
    const names = this.settings.ariaLabels().keyNames;
    const command = (name: KeyboardCommandName) => formatBindings(this.keyboard.commandBindings(name), names, this.mac);
    const group = (pick: (arrow: ArrowCommand) => KeyboardCommandName) => {
      // The four arrows are worth one phrase; anything else is listed key by key.
      const plain = ARROW_COMMANDS.every((arrow) => {
        const bindings = this.keyboard.commandBindings(pick(arrow));
        return bindings.length === 1 && bindings[0].key === `arrow${arrow.name}`;
      });
      if (plain) return names['arrowkeys'] ?? 'arrow keys';
      return formatBindings(
        ARROW_COMMANDS.flatMap((arrow) => this.keyboard.commandBindings(pick(arrow))),
        names,
        this.mac,
      );
    };

    return {
      select: command('select'),
      clearSelection: command('clearSelection'),
      delete: command('delete'),
      move: group((arrow) => arrow.move),
      pan: group((arrow) => arrow.pan),
      zoomIn: command('zoomIn'),
      zoomOut: command('zoomOut'),
      fitView: command('fitView'),
      multiSelection: formatBindings(this.keyboard.modifierBindings('multiSelection'), names, this.mac),
    };
  });

  /**
   * The `aria-keyshortcuts` value of the graph, or `null` when nothing is bound. It sits on the graph container
   * rather than on every entity: the keys belong to the graph, and repeating a list of them on each Tab stop would
   * make focusing a node needlessly loud.
   */
  public shortcuts = computed(() => {
    const values = new Set(this.keyboard.allCommandBindings().map((binding) => formatAriaShortcut(binding, this.mac)));
    return values.size > 0 ? [...values].join(' ') : null;
  });

  /** Reads one instruction entry, which is either a sentence or a function of the current keys. */
  public text(instruction: KeyboardInstruction) {
    return typeof instruction === 'function' ? instruction(this.keys()) : instruction;
  }
}
