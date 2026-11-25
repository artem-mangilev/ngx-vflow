import { getSvgPathBounds } from './svg-path-bounds';

describe('getSvgPathBounds', () => {
  it('measures the box of a path', () => {
    expect(getSvgPathBounds(document, 'M10 20L110 70')).toEqual({ x: 10, y: 20, width: 100, height: 50 });
  });

  it('measures relative commands from the current point', () => {
    expect(getSvgPathBounds(document, 'M10 20l100 50')).toEqual({ x: 10, y: 20, width: 100, height: 50 });
  });

  it('measures the curve, not its control points', () => {
    const bounds = getSvgPathBounds(document, 'M0 0 C0 100 100 100 100 0')!;

    expect(bounds.width).toBeCloseTo(100);
    // The curve bulges to y = 75, while its control points reach 100.
    expect(bounds.height).toBeCloseTo(75);
  });

  it('measures an arc', () => {
    const bounds = getSvgPathBounds(document, 'M0 50 A50 50 0 0 1 100 50')!;

    expect(bounds.width).toBeCloseTo(100);
    expect(bounds.height).toBeCloseTo(50);
  });

  it('leaves nothing in the document', () => {
    const before = document.body.innerHTML;

    getSvgPathBounds(document, 'M0 0L10 10');

    expect(document.body.innerHTML).toBe(before);
  });

  it('is null when the DOM does not measure paths', () => {
    const withoutLayout = { createElementNS: () => ({}) } as unknown as Document;

    expect(getSvgPathBounds(withoutLayout, 'M0 0L10 10')).toBeNull();
  });
});
