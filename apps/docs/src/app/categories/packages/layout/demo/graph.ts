import { createEdges, createNodes } from 'ngx-vflow';

/*
 * The graphs of the layout demos. In a layout with one result every node starts at the origin and cannot be dragged:
 * the layout owns the positions.
 */

/** A small data pipeline with a nested stage, for the layered layouts. */
export function pipelineNodes() {
  const steps = [
    { id: 'source', text: 'Source' },
    { id: 'parse', text: 'Parse' },
    // A parent needs a size of its own; the layout then sizes it around its children.
    { id: 'stage', text: 'Transform', type: 'group', width: 300, height: 200 },
    { id: 'map', text: 'Map', parentId: 'stage' },
    { id: 'reduce', text: 'Reduce', parentId: 'stage' },
    { id: 'store', text: 'Store' },
    { id: 'report', text: 'Report' },
  ];

  return createNodes(
    steps.map(({ id, text, type, parentId, width, height }) => ({
      id,
      point: { x: 0, y: 0 },
      draggable: false,
      parentId,
      width,
      height,
      data: { text, type },
    })),
  );
}

export function pipelineEdges() {
  return createEdges(
    [
      ['source', 'parse'],
      ['parse', 'map'],
      ['map', 'reduce'],
      ['reduce', 'store'],
      ['reduce', 'report'],
    ].map(([source, target]) => ({ id: `${source}-${target}`, source, target })),
  );
}

/** An org chart, for the tree layouts. */
export function orgChartNodes() {
  const teams = [
    ['ceo', 'CEO'],
    ['cto', 'Technology'],
    ['cfo', 'Finance'],
    ['coo', 'Operations'],
    ['eng', 'Engineering'],
    ['design', 'Design'],
    ['acct', 'Accounting'],
    ['support', 'Support'],
  ];

  return createNodes(teams.map(([id, text]) => ({ id, point: { x: 0, y: 0 }, draggable: false, data: { text } })));
}

export function orgChartEdges() {
  return createEdges(
    [
      ['ceo', 'cto'],
      ['ceo', 'cfo'],
      ['ceo', 'coo'],
      ['cto', 'eng'],
      ['cto', 'design'],
      ['cfo', 'acct'],
      ['coo', 'support'],
    ].map(([source, target]) => ({ id: `${source}-${target}`, source, target })),
  );
}

/** The routes of a small airline, for the force layout: every airport is linked to the hub, and a few to each other. */
const HUB = 'AMS';
const AIRPORTS = ['LHR', 'CDG', 'FRA', 'VIE', 'CPH', 'MAD', 'LIS'];

/**
 * A force layout starts from where the nodes are, and they can be dragged: the airports start on a ring of `radius`
 * around the hub at the origin, about where they settle. A point is the top left corner of a node; the demo draws
 * the hub 64 wide and the others 48.
 */
export function routeNodes(radius: number) {
  return createNodes([
    { id: HUB, point: { x: -32, y: -32 }, data: { text: HUB, hub: true } },
    ...AIRPORTS.map((code, index) => {
      const angle = (2 * Math.PI * index) / AIRPORTS.length;

      return {
        id: code,
        point: { x: radius * Math.cos(angle) - 24, y: radius * Math.sin(angle) - 24 },
        data: { text: code, hub: false },
      };
    }),
  ]);
}

export function routeEdges() {
  return createEdges(
    [...AIRPORTS.map((code) => [HUB, code]), ['LHR', 'CDG'], ['FRA', 'VIE'], ['MAD', 'LIS']].map(
      ([source, target]) => ({ id: `${source}-${target}`, source, target, curve: 'straight' as const }),
    ),
  );
}
