This guide shows how to change the keys of a flow. Shortcuts come in two kinds: **modifiers** change what a pointer
gesture does while they are held, and **commands** run once per key press on a focused node or edge. The defaults
and the grammar of a binding are at the end of this page.

## Remap a shortcut

Provide a `KeyboardShortcuts` object with `withShortcuts()` inside `provideVflow()`, and name only the entries you
change:

```typescript
import { provideVflow, withShortcuts } from 'ngx-vflow';

@Component({
  providers: [
    provideVflow(
      withShortcuts({
        modifiers: { selection: ['Alt'], panActivation: ['Space'] },
        commands: { delete: ['x'], fitView: ['Shift+f'] },
      }),
    ),
  ],
  ...
})
```

- If every flow of the application should use the keys, put the provider into `bootstrapApplication`.
- If only some should, put it into the providers of a route or of the component that hosts the flow. A closer
  `withShortcuts()` adds its entries to one further up; see [Configuration](/docs/getting-started/configuration).

In this example `selection` is remapped from `Shift` to `Alt` and `multiSelection` from `Mod` to `Shift`: hold `Alt` and
drag over the canvas to draw the selection box, and hold `Shift` and click to add a node to the selection.

{{ NgDocActions.demoPane("KeyboardShortcutsDemoComponent") }}

## Add a key to an entry

Setting an entry replaces its whole list, so repeat the defaults you want to keep:

```typescript
withShortcuts({ commands: { delete: ['Delete', 'Backspace', 'x'] } });
```

## Bind a combination of keys

Write the modifiers and the key as one binding, joined by `+`. Use `Mod` for Meta on macOS and Control elsewhere:

```typescript
withShortcuts({ commands: { fitView: ['Mod+0'] } });
```

A list holds alternatives: `['Delete', 'Backspace']` fires on either key, never on both together.

## Turn a shortcut off

Give the entry an empty list. A disabled command also disappears from the instructions that assistive technology
reads:

```typescript
withShortcuts({ commands: { zoomIn: [], zoomOut: [] }, modifiers: { selection: [] } });
```

## Take the keys from user preferences

Pass a factory instead of an object. It runs in the injector and returns the shortcuts or a signal of them, so the
keys can change at runtime:

```typescript
provideVflow(withShortcuts(() => inject(Preferences).shortcuts));
```

This example rebinds selection and deletion and turns the zoom commands off and on again. Focus a node or an edge
and press the keys; the object the example provides is printed beside the flow as you change it:

{{ NgDocActions.demoPane("ShortcutsConfigurationDemoComponent") }}

## Default modifiers

| Entry             | Default key                                         | While held                                                          |
| ----------------- | --------------------------------------------------- | ------------------------------------------------------------------- |
| `selection`       | `Shift`                                             | Dragging the canvas draws a selection box instead of panning        |
| `multiSelection`  | `Mod`, which is Meta on macOS and Control elsewhere | Selecting an entity toggles it instead of replacing the selection   |
| `panActivation`   | Disabled                                            | Drag and scroll pan the viewport                                    |
| `zoomActivation`  | Disabled                                            | The wheel zooms the viewport and takes priority over scroll panning |
| `alignmentBypass` | `Alt`                                               | A dragged node moves freely instead of snapping to alignment guides |

## Default commands

| Entry                                         | Default key           | Runs on                                     |
| --------------------------------------------- | --------------------- | ------------------------------------------- |
| `select`                                      | `Enter`, `Space`      | a focused node or edge                      |
| `clearSelection`                              | `Escape`              | a focused node or edge                      |
| `delete`                                      | `Delete`, `Backspace` | a focused node or edge                      |
| `moveUp`, `moveDown`, `moveLeft`, `moveRight` | the arrow keys        | a focused node that is selected and movable |
| `panUp`, `panDown`, `panLeft`, `panRight`     | the arrow keys        | a focused entity                            |
| `zoomIn`                                      | `+`, `=`, `NumpadAdd` | a focused entity                            |
| `zoomOut`                                     | `-`, `NumpadSubtract` | a focused entity                            |
| `fitView`                                     | `0`, `Numpad0`        | a focused entity                            |

When two commands share a key, the one listed first takes it, and a command that cannot act on the press leaves the key to the next one. That is why an arrow moves a node while the focused node is selected and movable, and pans the view otherwise. `Shift` makes movement and panning four times faster; that multiplier is fixed. Holding a key repeats movement, panning and zooming, while selection, deletion and fit view run once per press.

## Binding grammar

A binding is optional modifiers and one key, joined by `+`: `Enter`, `Mod+Shift+a`, `NumpadAdd`.

- Modifiers are `Mod`, `Control`, `Meta`, `Alt` and `Shift`, in any order. `Mod` is Meta on macOS and Control everywhere else, so one binding covers both platforms.
- The key is either a [`KeyboardEvent.key`](https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_key_values) value, which names the character a layout produces (`a`, `+`, `0`) or a key that produces none (`Enter`, `ArrowUp`, `Escape`), or a [`KeyboardEvent.code`](https://www.w3.org/TR/uievents-code/#key-alphanumeric-section) value, which names a position on the keyboard (`KeyW`, `NumpadAdd`, `Digit0`). A binding runs when either value of the event equals it, so write whichever one you mean. `Space` and `' '` both reach the spacebar.
- Keys and modifiers are compared without regard to case. The plus key is written `+`, and `Shift++` when it carries a modifier.
- Control, Meta and Alt must match exactly. A binding that names none of them never runs while one of them is held, so browser and system shortcuts such as `Ctrl+0` keep working.
- Shift is checked only when a binding names it, because Shift both accelerates movement and produces characters such as `+`.
- The key bound as `multiSelection` never blocks `select`; that is how holding it turns selection into a toggle.
- A key bound as a modifier is reserved for the gesture layer: a focused node or edge no longer treats it as a command.
  With `panActivation: ['Space']`, Space pans while `Enter` still selects.
- A binding that the grammar cannot read is dropped, and the entry keeps its other keys.

Naming the character makes `zoomIn: ['+', '=']` work on a layout that puts those characters anywhere. Naming the position makes `fitView: ['0', 'Numpad0']` reach the keypad key even while Num Lock is off and it produces no character.

## See also

- [Gestures](/docs/viewport/viewport-gestures) for panning and zooming with an activation key.
- [Accessibility](/docs/interactions/accessibility) for keyboard operation of the graph.
