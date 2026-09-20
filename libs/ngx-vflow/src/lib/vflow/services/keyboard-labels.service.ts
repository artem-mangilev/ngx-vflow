import { Injectable, computed, inject } from '@angular/core';
import { KeyboardService } from './keyboard.service';
import { KeyboardInstruction, KeyboardInstructionKeys } from '../interfaces/aria-label-config.interface';
import { KeyboardCommandName } from '../types/keyboard-shortcuts.type';
import { isMacPlatform } from '../utils/keyboard-binding';
import { formatBindings } from '../utils/keyboard-format';
import { ARROW_COMMANDS, ArrowCommand } from '../utils/keyboard-commands';

/** Turns the keys that are bound right now into the text read out with an entity. */
@Injectable()
export class KeyboardLabelsService {
  private keyboard = inject(KeyboardService);
  private mac = isMacPlatform();

  /** The key lists an instruction is written from. Follows every remap. */
  public keys = computed<KeyboardInstructionKeys>(() => {
    const command = (name: KeyboardCommandName) => formatBindings(this.keyboard.commandBindings(name), this.mac);
    const group = (pick: (arrow: ArrowCommand) => KeyboardCommandName) => {
      // The four arrows are worth one phrase; anything else is listed key by key.
      const plain = ARROW_COMMANDS.every((arrow) => {
        const bindings = this.keyboard.commandBindings(pick(arrow));
        return bindings.length === 1 && bindings[0].key === `arrow${arrow.name}`;
      });
      if (plain) return 'arrow keys';
      return formatBindings(
        ARROW_COMMANDS.flatMap((arrow) => this.keyboard.commandBindings(pick(arrow))),
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
      multiSelection: formatBindings(this.keyboard.modifierBindings('multiSelection'), this.mac),
    };
  });

  /** Reads one instruction entry, which is either a sentence or a function of the current keys. */
  public text(instruction: KeyboardInstruction) {
    return typeof instruction === 'function' ? instruction(this.keys()) : instruction;
  }
}
