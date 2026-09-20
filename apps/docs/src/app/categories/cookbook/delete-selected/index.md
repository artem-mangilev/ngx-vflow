Press `Delete` or `Backspace` on a focused node or edge. The flow emits `(deleteRequest)` with the focused entity, or with the whole selection when the focused entity is part of it; this workshop applies it with `removeNodes` and `removeEdges` to the application-owned collections. Node removal also removes descendants and incident edges. Focus moves to the next entity after the removal.

{{ NgDocActions.demoPane("DeleteSelectedDemoComponent") }}
