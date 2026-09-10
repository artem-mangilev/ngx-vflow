# Appearance migration inventory

Implementation checkpoint, 2026-09-10. **Removal is not performed**: stage 7 is gated on full
acceptance. Existing appearance inputs are compatibility APIs, not additions to the CSS token
contract. The table identifies public API declarations and the target presentation owner.

| Existing API                                        | Declaration                                                    | Target replacement / retained behavior                                                                                                     |
| --------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `DefaultNode.text`, default node visuals            | `interfaces/node.interface.ts`, default-node component         | Application data + own HTML or `vflowNode`/header/body; preserve IDs, point, dimensions, constraints                                       |
| `DefaultGroupNode.color`, default group visuals     | `interfaces/node.interface.ts`, NodeModel                      | `vflowGroup` CSS (`border`, background); parent relationship remains graph data                                                            |
| Default edge presentation                           | edge component and edge interface                              | Consumer SVG path or `vflowEdge`; core routing, hit target, selectable and geometry remain                                                 |
| `DefaultEdgeLabel.style` / default label            | `interfaces/edge-label.interface.ts`                           | Own HTML or `.vui-edge-label`; label placement remains start/center/end graph data                                                         |
| `resizerColor`                                      | `public-components/resizable/resizable.component.ts`           | `--vflow-selection` now provides fallback; final resize part selector still needs explicit public-contract promotion                       |
| `NodeResizeControlComponent.color`                  | `public-components/resizable/node-resize-control.component.ts` | Resize part CSS; keep variant, position, directions, constraints, scale and callbacks                                                      |
| `MiniMapComponent.maskColor`, `strokeColor`         | minimap component                                              | `--vflow-muted`, `--vflow-border`; node preview uses surface/foreground/selection, viewport uses background                                |
| `AlignmentHelperSettings.lineColor`                 | `interfaces/alignment-helper-settings.interface.ts`            | `--vflow-foreground` fallback now; final guide selector for line details; tolerance retained                                               |
| `SelectionBoxSettings.color`                        | `interfaces/selection-box-settings.interface.ts`               | `--vflow-selection` fallback now; CSS for fill opacity/stroke; behavior retained                                                           |
| `Background` string shorthand, solid `.color`       | `types/background.type.ts`, `utils/transform-background.ts`    | `--vflow-background`; final string shorthand migration must reject obsolete accepted-but-invisible values                                  |
| Dots `.color`, `.backgroundColor`, `.size`          | background type/component                                      | `--vflow-muted`, `--vflow-background`, pattern CSS for visible dot size; gap remains pattern geometry                                      |
| Grid `.color`, `.backgroundColor`, `.strokeWidth`   | background type/component                                      | Palette + pattern CSS; cell `.size` remains pattern geometry                                                                               |
| Image background                                    | background type/component                                      | Source/repeat/scale/fixed behavior retained; no image-processing API introduced                                                            |
| `Marker.color`, `.strokeWidth`, `.width`, `.height` | `interfaces/marker.interface.ts`, defs component               | Palette and SVG marker CSS on consumer/UI presentation; final marker signatures and public selectors require coordinated stage-7 migration |
| `Marker.type`, `.orient`, `.markerUnits`            | marker interface                                               | Marker presentation belongs to consumer/UI; endpoint geometry and URL wiring stay core-facing. Do not silently drop accepted marker types  |

## Already implemented theme path

- UI scope maps exactly the agreed shared palette to core tokens; no `:root` installation and
  no component-token catalogue. Application overrides use the theme element/descendants.
- Core fallback expressions are at the usage sites, so inherited UI/user values are not
  shadowed by core host-level default declarations.
- Minimap probes resolve CSS via actual `color` properties. Ancestor attribute mutations and
  explicit `refreshTheme()` refresh colors; arbitrary stylesheet/media changes are not observed.
- Legacy explicit backgrounds are also resolved through a CSS probe during compatibility.
  Legacy minimap mask/stroke inputs still accept concrete canvas color strings; use tokens for
  new theme integrations, not `var(...)` in those compatibility inputs.
- Marker IDs are scoped per flow. Equal marker specifications in different editors no longer
  resolve to the first editor's SVG definition/theme.

## Before removal

Finalize/promote the core feedback selectors rather than documenting arbitrary internal DOM as
public API. Replace all default-model/create-helper/optimized-handle/minimap branches together;
update tests, every docs consumer, testing mocks and migration guide. Keep native HTML contracts
and library-owned accessibility wrappers. This inventory is not a claim that stage 7 is done.
