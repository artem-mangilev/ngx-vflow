import { createEdges, createNodes } from 'ngx-vflow';

/** A small pipeline with a nested stage, shared by the layout demos. */
export function demoNodes() {
  return createNodes([
    { id: 'source', point: { x: 0, y: 0 }, data: { text: 'Source' } },
    { id: 'parse', point: { x: 0, y: 0 }, data: { text: 'Parse' } },
    { id: 'validate', point: { x: 0, y: 0 }, data: { text: 'Validate' } },
    { id: 'stage', point: { x: 0, y: 0 }, width: 300, height: 200, data: { text: 'Transform', type: 'group' } },
    { id: 'map', point: { x: 0, y: 0 }, parentId: 'stage', extent: null, data: { text: 'Map' } },
    { id: 'reduce', point: { x: 0, y: 0 }, parentId: 'stage', extent: null, data: { text: 'Reduce' } },
    { id: 'store', point: { x: 0, y: 0 }, data: { text: 'Store' } },
    { id: 'report', point: { x: 0, y: 0 }, data: { text: 'Report' } },
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
