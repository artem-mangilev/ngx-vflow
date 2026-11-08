import { createEdges, createNodes } from 'ngx-vflow';

/** A small pipeline with a nested stage, shared by the one-shot layout demos; the layout owns the positions. */
export function demoNodes() {
  return createNodes([
    { id: 'source', point: { x: 0, y: 0 }, draggable: false, data: { text: 'Source' } },
    { id: 'parse', point: { x: 0, y: 0 }, draggable: false, data: { text: 'Parse' } },
    { id: 'validate', point: { x: 0, y: 0 }, draggable: false, data: { text: 'Validate' } },
    {
      id: 'stage',
      point: { x: 0, y: 0 },
      draggable: false,
      width: 300,
      height: 200,
      data: { text: 'Transform', type: 'group' },
    },
    { id: 'map', point: { x: 0, y: 0 }, draggable: false, parentId: 'stage', extent: null, data: { text: 'Map' } },
    {
      id: 'reduce',
      point: { x: 0, y: 0 },
      draggable: false,
      parentId: 'stage',
      extent: null,
      data: { text: 'Reduce' },
    },
    { id: 'store', point: { x: 0, y: 0 }, draggable: false, data: { text: 'Store' } },
    { id: 'report', point: { x: 0, y: 0 }, draggable: false, data: { text: 'Report' } },
  ]);
}

export function demoEdges() {
  return createEdges([
    { id: 'source -> parse', source: 'source', target: 'parse' },
    { id: 'parse -> validate', source: 'parse', target: 'validate' },
    { id: 'validate -> map', source: 'validate', target: 'map' },
    { id: 'map -> reduce', source: 'map', target: 'reduce' },
    { id: 'reduce -> store', source: 'reduce', target: 'store' },
    { id: 'reduce -> report', source: 'reduce', target: 'report' },
  ]);
}

/** An org chart for the tree demo, with content-sized cards of different widths. */
export function treeNodes() {
  const people = [
    ['ceo', 'Chief executive'],
    ['cto', 'CTO'],
    ['cfo', 'Chief financial officer'],
    ['coo', 'COO'],
    ['eng', 'Engineering'],
    ['design', 'Design'],
    ['acct', 'Accounting'],
    ['ops', 'Operations'],
    ['fe', 'Frontend'],
    ['be', 'Backend'],
    ['sre', 'Site reliability'],
  ] as const;
  return createNodes(people.map(([id, text]) => ({ id, point: { x: 0, y: 0 }, draggable: false, data: { text } })));
}

export function treeEdges() {
  const reports = [
    ['ceo', 'cto'],
    ['ceo', 'cfo'],
    ['ceo', 'coo'],
    ['cto', 'eng'],
    ['cto', 'design'],
    ['cfo', 'acct'],
    ['coo', 'ops'],
    ['eng', 'fe'],
    ['eng', 'be'],
    ['eng', 'sre'],
  ] as const;
  return createEdges(reports.map(([source, target]) => ({ id: `${source} -> ${target}`, source, target })));
}
