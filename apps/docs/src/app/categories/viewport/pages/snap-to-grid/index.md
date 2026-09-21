Snap nodes to a grid with the `withSnapGrid()` feature, provided through `provideVflow()` in the `providers` of the component that hosts the flow. Pass one number or an `[x, y]` pair; `1` leaves an axis free. Inject `SnapGridSettings` to change the grid while the flow runs. Pointer drags, keyboard moves and resize gestures snap; a keyboard press moves one grid cell, four with Shift.

{{ NgDocActions.demoPane("SubflowsDemoComponent") }}
