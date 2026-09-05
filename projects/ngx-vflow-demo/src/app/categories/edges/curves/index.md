It's possible to set `Curve` for both the edges and connection.

{{ NgDocActions.demoPane("CurvesDemoComponent") }}

## Curve factory

> **Warning**
> This is an experimental API

If the existing curves do not meet your needs, you can provide your own function that implements the `CurveFactory` signature.

With virtualization enabled, the library uses the complete path bounds to decide whether an edge can appear in the viewport. A custom factory may return an optional `bounds: { x, y, width, height }` in flow coordinates to avoid SVG measurement. These bounds must contain the whole curve, including any detours or control points. Without `bounds`, the library measures the SVG path when it changes and caches the result for viewport changes.

{{ NgDocActions.demoPane("CurveFactoryDemoComponent") }}
