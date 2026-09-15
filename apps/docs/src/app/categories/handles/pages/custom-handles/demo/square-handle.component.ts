import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { VflowHandleDirective } from 'ngx-vflow';

/**
 * A component that is a handle itself: `vflowHandle` is applied through `hostDirectives`, the role is bound
 * where the component is used and the look follows the signals of the injected directive.
 */
@Component({
  selector: 'square-handle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [{ directive: VflowHandleDirective, inputs: ['type', 'position', 'id', 'canAccept'] }],
  host: {
    '[class.valid]': "handle.state() === 'valid'",
    '[class.invalid]': "handle.state() === 'invalid'",
    '[class.disabled]': '!handle.canAccept()',
  },
  template: '',
  styles: `
    :host {
      display: block;
      width: 12px;
      height: 12px;
      box-sizing: border-box;
      border-radius: 2px;
      border: 1px solid black;
      background-color: #fff;
    }

    :host(.valid) {
      background-color: green;
    }

    :host(.invalid) {
      background-color: red;
    }

    :host(.disabled) {
      background-color: #9e9e9e;
      opacity: 0.55;
    }
  `,
})
export class SquareHandleComponent {
  protected readonly handle = inject(VflowHandleDirective);
}
