import { Rect } from '../interfaces/rect';
import { AlignmentScene, alignmentGuides, alignmentOffset, findAlignmentGaps } from './alignment';

const rect = (x: number, y: number, width = 100, height = 50): Rect => ({ x, y, width, height });

function scene(rects: Rect[], extra: Partial<AlignmentScene> = {}): AlignmentScene {
  return {
    targets: rects.map((r) => ({ rect: r, centerOnly: false })),
    gaps: findAlignmentGaps(rects),
    handles: [],
    ...extra,
  };
}

describe('alignment', () => {
  describe('alignmentOffset', () => {
    it('takes the nearest anchor on each axis within the tolerance', () => {
      // x: the left edge 203 is 3 from the second target's left edge; y: the top 7 is 7 from the first target's top
      const offset = alignmentOffset(scene([rect(0, 0), rect(200, 300)]), rect(203, 7), 10);

      expect(offset).toEqual({ x: -3, y: -7 });
    });

    it('does not snap beyond the tolerance', () => {
      expect(alignmentOffset(scene([rect(0, 0)]), rect(300, 200), 10)).toEqual({ x: null, y: null });
    });

    it('matches edges with edges and centers with centers only', () => {
      // The center of a 40 wide rect at 0 is 20, the left edge of the target is 20: no cross match
      const offset = alignmentOffset(scene([rect(20, 400, 100, 50)]), rect(0, 0, 40, 40), 5);

      expect(offset.x).toBeNull();
    });

    it('offers only the center of a center-only target', () => {
      const parent: AlignmentScene = {
        targets: [{ rect: rect(0, 0, 400, 400), centerOnly: true }],
        gaps: [],
        handles: [],
      };

      // Left edge 3 is next to the parent's left edge 0, but only centers count
      expect(alignmentOffset(parent, rect(3, 100), 10).x).toBeNull();
      // Center 203 is next to the parent's center 200
      expect(alignmentOffset(parent, rect(153, 100), 10).x).toBe(-3);
    });

    it('centers a node between two neighbours in a row', () => {
      const s = scene([rect(0, 0), rect(400, 0)]);
      // Gap 100..400, its middle is 250; the moving center is 254
      expect(alignmentOffset(s, rect(204, 0), 10).x).toBe(-4);
    });

    it('repeats a gap after and before a pair', () => {
      const s = scene([rect(0, 0), rect(150, 0)]);
      // Gap 50: after the pair the next node starts at 300, before it ends at -50
      expect(alignmentOffset(s, rect(305, 0), 10).x).toBe(-5);
      expect(alignmentOffset(s, rect(-146, 0), 10).x).toBe(-4);
    });

    it('ignores gaps the moving node does not overlap across', () => {
      const s = scene([rect(0, 0), rect(400, 0)]);
      expect(alignmentOffset(s, rect(204, 200), 10).x).toBeNull();
    });

    it('aligns a moving handle with its connected handle', () => {
      const s: AlignmentScene = {
        targets: [],
        gaps: [],
        handles: [{ axis: 'y', offset: { x: 0, y: 30 }, fixed: { x: 500, y: 120 } }],
      };

      // Handle at 94 + 30 = 124, the fixed one at 120
      expect(alignmentOffset(s, rect(0, 94), 10)).toEqual({ x: null, y: -4 });
    });

    it('prefers a straight edge to a slightly nearer alignment', () => {
      const s: AlignmentScene = {
        ...scene([rect(0, 0)]),
        // The moving handle sits 0.3 below the node center
        handles: [{ axis: 'y', offset: { x: 0, y: 25.3 }, fixed: { x: -100, y: 25 } }],
      };

      // The center 32 is 7 from the target center 25, the handle 32.3 is 7.3 from its handle: the edge wins
      expect(alignmentOffset(s, rect(300, 7), 10).y).toBeCloseTo(-7.3);
    });
  });

  describe('findAlignmentGaps', () => {
    it('keeps gaps between neighbours that overlap across', () => {
      const gaps = findAlignmentGaps([rect(0, 0), rect(200, 20), rect(0, 300)]);

      expect(gaps.map((g) => [g.axis, g.length])).toEqual([
        ['x', 100],
        ['y', 250],
      ]);
    });

    it('drops a gap that another node stands in', () => {
      const a = rect(0, 0);
      const b = rect(200, 0);
      const c = rect(400, 0);

      const gaps = findAlignmentGaps([a, b, c]).filter((g) => g.axis === 'x');

      expect(gaps.map((g) => [g.start, g.end])).toEqual([
        [a, b],
        [b, c],
      ]);
    });
  });

  describe('alignmentGuides', () => {
    it('draws one line through every target aligned with the same anchor', () => {
      const guides = alignmentGuides(scene([rect(0, 0), rect(0, 200)]), rect(0, 100));
      const left = guides.lines.find((line) => !line.center && line.from.x === 0 && line.to.x === 0);

      expect(left?.from).toEqual({ x: 0, y: 0 });
      expect(left?.to).toEqual({ x: 0, y: 250 });
      expect(left?.points.length).toBe(6);
    });

    it('draws the center line of a parent across the parent', () => {
      const s: AlignmentScene = { targets: [{ rect: rect(0, 0, 400, 300), centerOnly: true }], gaps: [], handles: [] };

      // Centered exactly: the lines still cross the parent instead of shrinking to a point
      const guides = alignmentGuides(s, rect(150, 125));

      expect(guides.lines.map((line) => [line.from, line.to])).toEqual(
        jasmine.arrayWithExactContents([
          [
            { x: 200, y: 0 },
            { x: 200, y: 300 },
          ],
          [
            { x: 0, y: 150 },
            { x: 400, y: 150 },
          ],
        ]),
      );
    });

    it('draws only exact alignments', () => {
      expect(alignmentGuides(scene([rect(0, 0)]), rect(1, 300))).toEqual({ lines: [], gaps: [] });
    });

    it('marks both gaps of a centered node and chains equal gaps', () => {
      const guides = alignmentGuides(scene([rect(-150, 0), rect(0, 0), rect(300, 0)]), rect(150, 0));

      expect(guides.gaps.map((g) => [g.from, g.to])).toEqual(
        jasmine.arrayWithExactContents([
          [100, 150],
          [250, 300],
          [-50, 0],
        ]),
      );
    });

    it('draws a straight edge between the handles', () => {
      const s: AlignmentScene = {
        targets: [],
        gaps: [],
        handles: [{ axis: 'y', offset: { x: 100, y: 30 }, fixed: { x: 500, y: 120 } }],
      };

      expect(alignmentGuides(s, rect(0, 90)).lines).toEqual([
        {
          from: { x: 100, y: 120 },
          to: { x: 500, y: 120 },
          points: [
            { x: 100, y: 120 },
            { x: 500, y: 120 },
          ],
          center: false,
        },
      ]);
    });
  });
});
