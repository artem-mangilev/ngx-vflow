This guide shows how to change the keys of a flow. Shortcuts come in two kinds: **modifiers** change what a pointer
gesture does while they are held, and **commands** run once per key press on a focused node or edge. The defaults
and the grammar of a binding are in the [Keyboard shortcuts reference](/docs/reference/keyboard-shortcuts).

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

In this example `selection` is remapped from `Shift` to `Alt` and `multiSelection` from `Mod` to `Shift`:

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

This example rebinds selection and deletion and turns the zoom commands off and on again. The object it provides
is printed as you change it:

{{ NgDocActions.demoPane("ShortcutsConfigurationDemoComponent") }}

## See also

- [Gestures](/docs/viewport/viewport-gestures) for panning and zooming with an activation key.
- [Accessibility](/docs/interactions/accessibility) for keyboard operation of the graph.
