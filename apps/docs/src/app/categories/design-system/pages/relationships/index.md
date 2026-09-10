A container frame has its own connection while its children use explicit parent relationships.
A note has no ports. Metrics and the tiny bar chart are application HTML, not library components.
All nodes are non-draggable and connections cannot be edited; viewport navigation and selection
remain available. Refresh metrics changes application state only.

{{ NgDocActions.demo("RelationshipsDemoComponent", { container: false }) }}

```typescript file="./relationships-demo.component.ts"

```

The canvas minimap resolves editor CSS colors. Changes to ancestor attributes (theme, class or
inline styles) refresh it automatically; after external stylesheet or media-query changes,
call the public `MiniMapComponent.refreshTheme()` method. The minimap uses the editor palette,
not local per-node theme overrides. Changing colors redraws the bitmap, not graph geometry.
