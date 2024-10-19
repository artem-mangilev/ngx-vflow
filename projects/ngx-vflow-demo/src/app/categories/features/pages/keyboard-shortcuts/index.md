# {{ NgDocPage.title }}

You can use keyboard shortcuts to perform additional actions.

# Defaults

| Action               | Default key                           |
| -------------------- | ------------------------------------- |
| Node multi selection | `CMD` (Mac) or `CTRL` (Other systems) |

# Customization

To customize the keyboard shortcuts for specific actions, pass a `[keyboardShortcuts]` input object to the `VflowComponent` with the following `KeyboardShortcuts` interface. Here are some key details:

- The passed object will be merged with the default key combinations.
- To disable a specific action, pass `null` for that action.
- If you want to trigger an action with multiple keys, pass an array of keys. Note: this is not a key combination. For example, if you pass `['ShiftLeft', 'ControlLeft']`, the action will be triggered by either `ShiftLeft` or `ControlLeft`, but not by pressing both together (`ShiftLeft+ControlLeft`).
- You can find the list of available key codes [here](https://www.w3.org/TR/uievents-code/#key-alphanumeric-section).

In the following example, the default combination for `multiSelection` is replaced with `['ShiftLeft', 'ShiftRight']`.

{{ NgDocActions.demoPane("KeyboardShortcutsDemoComponent") }}
