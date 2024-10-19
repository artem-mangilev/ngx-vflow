# {{ NgDocPage.title }}

> **Warning**
> This API may depricate in future releases

You can apply global setting for all handles with `[handlePositions]` input where you set on which side source and target handles should be placed, you can select.

## Right to left direction

To archive this direction, you pass `{ source: 'left', target: 'right' }` to `[handlePositions]`.

{{ NgDocActions.demoPane("HandlePositionsRtlDemoComponent") }}

## Top to bottom direction

To archive this direction, you pass `{ source: 'bottom', target: 'top' }` to `[handlePositions]`.

{{ NgDocActions.demoPane("HandlePositionsTtbDemoComponent") }}
