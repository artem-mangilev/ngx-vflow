import { signal } from '@angular/core';
import { ConnectionInternal } from '../interfaces/connection.internal.interface';
import { HandleModel } from '../models/handle.model';
import { NodeModel } from '../models/node.model';
import { HandleType } from '../types/handle-type.type';
import { adjustDirection } from './adjust-direction';

describe('adjustDirection', () => {
  const from = {} as NodeModel;
  const to = {} as NodeModel;
  const handle = (type: HandleType) => ({ type: signal(type) }) as unknown as HandleModel;

  // [type of the handle the gesture starts from, type of the handle it ends on, whether the edge is reversed]
  it.each<[HandleType, HandleType, boolean]>([
    ['source', 'target', false],
    ['target', 'source', true],
    ['target', 'any', true],
    ['any', 'source', true],
    ['any', 'target', false],
    ['source', 'any', false],
    ['any', 'any', false],
    ['source', 'source', false],
    ['target', 'target', false],
  ])('a gesture from %s to %s is reversed: %s', (startType, endType, reversed) => {
    const connection: ConnectionInternal = {
      source: from,
      target: to,
      sourceHandle: handle(startType),
      targetHandle: handle(endType),
    };

    const adjusted = adjustDirection(connection);

    expect(adjusted).toEqual(
      reversed
        ? { source: to, target: from, sourceHandle: connection.targetHandle, targetHandle: connection.sourceHandle }
        : connection,
    );
  });
});
