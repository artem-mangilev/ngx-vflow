You can use keyboard shortcuts to control selection and temporarily activate viewport gestures.

# Defaults

| Action                   | Default key                           |
| ------------------------ | ------------------------------------- |
| Viewport pan activation  | Disabled (`null`)                     |
| Viewport zoom activation | Disabled (`null`)                     |
| Selection box            | `ShiftLeft` or `ShiftRight`           |
| Node multi selection     | `CMD` (Mac) or `CTRL` (Other systems) |

When `selection` is active (default: `Shift`), dragging on the canvas starts selection box mode instead of map pan.

# Customization

To customize shortcuts, pass a `[keyboardShortcuts]` input object to `VflowComponent`.
Supported actions are `selection`, `multiSelection`, `pan`, and `zoom` (`KeyboardShortcuts` is a partial object, so you can override only one action if needed).

Key details:

- The passed object is merged with defaults.
- To disable a specific action, pass `null` for that action.
- If you want to trigger one action with multiple keys, pass an array. This is not a chord combination. For example, if you pass `['ShiftLeft', 'ControlLeft']`, the action is triggered by either `ShiftLeft` or `ControlLeft`, not by pressing both together (`ShiftLeft+ControlLeft`).
- You can find the list of available key codes [here](https://www.w3.org/TR/uievents-code/#key-alphanumeric-section).

In the following example:

- `selection` is remapped from `Shift` to `Alt`
- `multiSelection` is remapped from `CMD/CTRL` to `Shift`

{{ NgDocActions.demoPane("KeyboardShortcutsDemoComponent") }}

The `pan` and `zoom` actions are opt-in. Ordinary pan/zoom gestures retain their defaults when these shortcuts are `null`. See [Viewport gestures](../viewport-gestures) for priorities, embedded controls, and complete gesture disabling.
