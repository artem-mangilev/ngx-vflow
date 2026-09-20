Keyboard shortcuts come in two kinds. **Modifiers** change what a pointer gesture does while they are held. **Commands** run once per key press on a focused node or edge, or on the graph container.

# Defaults

## Modifiers

| Entry            | Default key                                                      | While held                                                          |
| ---------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------- |
| `selection`      | `ShiftLeft`, `ShiftRight`                                        | Dragging the canvas draws a selection box instead of panning        |
| `multiSelection` | `MetaLeft`, `MetaRight` (macOS) or `ControlLeft`, `ControlRight` | Selecting an entity toggles it instead of replacing the selection   |
| `panActivation`  | Disabled                                                         | Drag and scroll pan the viewport                                    |
| `zoomActivation` | Disabled                                                         | The wheel zooms the viewport and takes priority over scroll panning |

## Commands

| Entry                                         | Default key                     | Runs on                                     |
| --------------------------------------------- | ------------------------------- | ------------------------------------------- |
| `select`                                      | `Enter`, `NumpadEnter`, `Space` | a focused node or edge                      |
| `clearSelection`                              | `Escape`                        | a focused node or edge                      |
| `delete`                                      | `Delete`, `Backspace`           | a focused node or edge                      |
| `moveUp`, `moveDown`, `moveLeft`, `moveRight` | the arrow keys                  | a focused node that is selected and movable |
| `panUp`, `panDown`, `panLeft`, `panRight`     | the arrow keys                  | a focused entity or the graph container     |
| `zoomIn`                                      | `Equal`, `NumpadAdd`            | a focused entity or the graph container     |
| `zoomOut`                                     | `Minus`, `NumpadSubtract`       | a focused entity or the graph container     |
| `fitView`                                     | `Digit0`, `Numpad0`             | a focused entity or the graph container     |

An arrow key moves a node when the focused node is selected and movable, and pans the view otherwise. `Shift` makes movement and panning four times faster; that multiplier is fixed.

# Customization

Pass a `[keyboardShortcuts]` input with either section, or both:

```typescript
import { KeyboardShortcuts } from 'ngx-vflow';

shortcuts: KeyboardShortcuts = {
  modifiers: { selection: ['AltLeft', 'AltRight'], panActivation: ['Space'] },
  commands: { delete: ['KeyX'], fitView: [] },
};
```

Key details:

- Each section merges entry by entry with the current configuration. Setting `commands.delete` leaves every other command and every modifier untouched.
- An entry holds alternative keys, not a chord. `['ShiftLeft', 'ControlLeft']` fires on either key, never on both together.
- Setting an entry replaces its whole list. To add a key, repeat the defaults you want to keep.
- An empty list disables an entry. A disabled command stops running and disappears from the instructions that assistive technology reads.
- A key bound as a modifier is reserved for the gesture layer: a focused node or edge no longer treats it as a command. With `panActivation: ['Space']`, Space pans while `Enter` still selects.
- Keys are [`KeyboardEvent.code` values](https://www.w3.org/TR/uievents-code/#key-alphanumeric-section), which name physical keys rather than the characters a layout produces.
- Commands run only while focus is inside the graph, so single-character keys never interfere with typing elsewhere on the page.

In the following example `selection` is remapped from `Shift` to `Alt` and `multiSelection` from `CMD`/`CTRL` to `Shift`:

{{ NgDocActions.demoPane("KeyboardShortcutsDemoComponent") }}

`panActivation` and `zoomActivation` are opt-in. Ordinary pan and zoom gestures keep their defaults while these entries are empty. See [Viewport gestures](../viewport-gestures) for priorities, embedded controls, and complete gesture disabling, and [Accessibility](../accessibility) for what each command does and announces.
