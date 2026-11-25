import { TestBed } from '@angular/core/testing';
import { Node, createNodes } from 'ngx-vflow';
import { NodeTargets, VX_LAYOUT_POSITION_WRITER, placeNodes } from './position-writer';

describe('position writer', () => {
  let nodes: Node[];
  let targets: NodeTargets;

  beforeEach(() => {
    nodes = createNodes([
      { id: 'plain', point: { x: 0, y: 0 } },
      { id: 'sized', point: { x: 0, y: 0 }, width: 100, height: 50 },
    ]);
    targets = new Map([
      [nodes[0], { point: { x: 10, y: 20 }, size: { width: 300, height: 150 } }],
      [nodes[1], { point: { x: 30, y: 40 }, size: { width: 300, height: 150 } }],
    ]);
  });

  describe('placeNodes', () => {
    it('sets the point of every node', () => {
      placeNodes(targets);

      expect(nodes.map((node) => node.point())).toEqual([
        { x: 10, y: 20 },
        { x: 30, y: 40 },
      ]);
    });

    it('sets the size of a node that has an explicit size', () => {
      placeNodes(targets);

      expect([nodes[1].width!(), nodes[1].height!()]).toEqual([300, 150]);
    });

    it('gives no size to a node without an explicit size', () => {
      placeNodes(targets);

      expect([nodes[0].width, nodes[0].height]).toEqual([undefined, undefined]);
    });

    it('keeps the size of a node when the target has none', () => {
      placeNodes(new Map([[nodes[1], { point: { x: 1, y: 1 } }]]));

      expect([nodes[1].width!(), nodes[1].height!()]).toEqual([100, 50]);
    });
  });

  describe('the default writer', () => {
    const writer = () => TestBed.inject(VX_LAYOUT_POSITION_WRITER);

    it('places the nodes at once', async () => {
      await writer().write(targets, { first: false });

      expect(nodes[1].point()).toEqual({ x: 30, y: 40 });
    });

    it('resolves once the nodes are placed', async () => {
      const written = writer().write(targets, { first: true });

      await expect(written).resolves.toBeUndefined();
    });

    it('does nothing on cancel', async () => {
      await writer().write(targets, { first: true });

      writer().cancel();

      expect(nodes[1].point()).toEqual({ x: 30, y: 40 });
    });
  });
});
