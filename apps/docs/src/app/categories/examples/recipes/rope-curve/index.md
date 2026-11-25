A custom curve that hangs every edge between its handles as a rope, here the patch cables of a synthesizer. Drag a module to swing its cables.

The rope is a chain of points between two pinned ends. Every step, each point keeps its speed and falls (Verlet integration), then the segments are pulled back to their length. The curve factory keeps a rope per edge, takes the ends from the `sourcePoint` and `targetPoint` it receives, and returns a smooth path through the points. It steps the ropes on animation frames only while they move: a rope at rest costs nothing until one of its nodes is dragged again.

{{ NgDocActions.demoPane("RopeCurveDemoComponent") }}
