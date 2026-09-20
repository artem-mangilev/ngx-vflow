Keyboard shortcuts come in two kinds. **Modifiers** change what a pointer gesture does while they are held. **Commands** run once per key press on a focused node or edge, or on the graph container.

# Defaults

## Modifiers

| Entry            | Default key                                         | While held                                                          |
| ---------------- | --------------------------------------------------- | ------------------------------------------------------------------- |
| `selection`      | `Shift`                                             | Dragging the canvas draws a selection box instead of panning        |
| `multiSelection` | `Mod`, which is Meta on macOS and Control elsewhere | Selecting an entity toggles it instead of replacing the selection   |
| `panActivation`  | Disabled                                            | Drag and scroll pan the viewport                                    |
| `zoomActivation` | Disabled                                            | The wheel zooms the viewport and takes priority over scroll panning |

## Commands

| Entry                                         | Default key           | Runs on                                     |
| --------------------------------------------- | --------------------- | ------------------------------------------- |
| `select`                                      | `Enter`, `Space`      | a focused node or edge                      |
| `clearSelection`                              | `Escape`              | a focused node or edge                      |
| `delete`                                      | `Delete`, `Backspace` | a focused node or edge                      |
| `moveUp`, `moveDown`, `moveLeft`, `moveRight` | the arrow keys        | a focused node that is selected and movable |
| `panUp`, `panDown`, `panLeft`, `panRight`     | the arrow keys        | a focused entity or the graph container     |
| `zoomIn`                                      | `+`, `=`, `NumpadAdd` | a focused entity or the graph container     |
| `zoomOut`                                     | `-`, `NumpadSubtract` | a focused entity or the graph container     |
| `fitView`                                     | `0`, `Numpad0`        | a focused entity or the graph container     |

When two commands share a key, the one listed first takes it, and a command that cannot act on the press leaves the key to the next one. That is why an arrow moves a node while the focused node is selected and movable, and pans the view otherwise. `Shift` makes movement and panning four times faster; that multiplier is fixed. Holding a key repeats movement, panning and zooming, while selection, deletion and fit view run once per press.

# Binding grammar

A binding is optional modifiers and one key, joined by `+`: `Enter`, `Mod+Shift+a`, `NumpadAdd`.

- Modifiers are `Mod`, `Control`, `Meta`, `Alt` and `Shift`, in any order. `Mod` is Meta on macOS and Control everywhere else, so one binding covers both platforms.
- The key is either a [`KeyboardEvent.key`](https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_key_values) value, which names the character a layout produces (`a`, `+`, `0`) or a key that produces none (`Enter`, `ArrowUp`, `Escape`), or a [`KeyboardEvent.code`](https://www.w3.org/TR/uievents-code/#key-alphanumeric-section) value, which names a position on the keyboard (`KeyW`, `NumpadAdd`, `Digit0`). A binding runs when either value of the event equals it, so write whichever one you mean. `Space` and `' '` both reach the spacebar.
- Keys and modifiers are compared without regard to case. The plus key is written `+`, and `Shift++` when it carries a modifier.
- Control, Meta and Alt must match exactly. A binding that names none of them never runs while one of them is held, so browser and system shortcuts such as `Ctrl+0` keep working.
- Shift is checked only when a binding names it, because Shift both accelerates movement and produces characters such as `+`.
- The key bound as `multiSelection` never blocks `select`; that is how holding it turns selection into a toggle.

Naming the character makes `zoomIn: ['+', '=']` work on a layout that puts those characters anywhere. Naming the position makes `fitView: ['0', 'Numpad0']` reach the keypad key even while Num Lock is off and it produces no character.

# Customization

Pass a `[keyboardShortcuts]` input with either section, or both:

```typescript
import { KeyboardShortcuts } from 'ngx-vflow';

shortcuts: KeyboardShortcuts = {
  modifiers: { selection: ['Alt'], panActivation: ['Space'] },
  commands: { delete: ['x'], fitView: ['Shift+f'] },
};
```

Key details:

- Each section merges entry by entry with the current configuration. Setting `commands.delete` leaves every other command and every modifier untouched.
- An entry holds alternative keys, not a chord. `['Delete', 'Backspace']` fires on either key, never on both together; a chord is one binding, as in `Mod+0`.
- Setting an entry replaces its whole list. To add a key, repeat the defaults you want to keep.
- An empty list disables an entry. A disabled command stops running and disappears from the instructions that assistive technology reads.
- A key bound as a modifier is reserved for the gesture layer: a focused node or edge no longer treats it as a command. With `panActivation: ['Space']`, Space pans while `Enter` still selects.
- A binding that the grammar cannot read is dropped with a message in development mode, and the entry keeps its other keys.
- Commands run only while focus is inside the graph, so single-character keys never interfere with typing elsewhere on the page.

In the following example `selection` is remapped from `Shift` to `Alt` and `multiSelection` from `CMD`/`CTRL` to `Shift`:

{{ NgDocActions.demoPane("KeyboardShortcutsDemoComponent") }}

The following example rebinds selection and deletion and turns the zoom commands off and on again. The object it passes is printed as you change it:

{{ NgDocActions.demoPane("ShortcutsConfigurationDemoComponent") }}

# Single-character keys

Several commands are bound to a printable character: `+`, `-`, `0`, and any letter you bind yourself. [WCAG 2.1.4](https://www.w3.org/WAI/WCAG21/Understanding/character-key-shortcuts.html) asks that such a shortcut can be turned off, be remapped to include a non-printable key, or be active only while its component has focus, because speech input otherwise triggers it by accident. All three hold here: an entry takes an empty list, a binding may name `Mod`, `Control`, `Meta`, `Alt` or `Shift`, and a command runs only while focus is on a graph entity or on the graph container, never while the page is focused elsewhere or a field is being typed into.

`panActivation` and `zoomActivation` are opt-in. Ordinary pan and zoom gestures keep their defaults while these entries are empty. See [Viewport gestures](../viewport-gestures) for priorities, embedded controls, and complete gesture disabling, and [Accessibility](../accessibility) for what each command does and announces.
