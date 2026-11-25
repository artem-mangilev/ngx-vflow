import { ConnectionInternal } from '../interfaces/connection.internal.interface';

/**
 * Keeps typed handles in their roles: a connection dragged from a `target` handle, or onto a `source` handle, is
 * reversed so that the `source` handle is the source of the edge. Between handles of type `any`, or between
 * handles of the same type, the direction of the gesture is kept.
 */
export function adjustDirection(connection: ConnectionInternal): ConnectionInternal {
  const sourceType = connection.sourceHandle.type();
  const targetType = connection.targetHandle.type();
  const reversed =
    (sourceType === 'target' && targetType !== 'target') || (targetType === 'source' && sourceType !== 'source');

  return reversed
    ? {
        source: connection.target,
        sourceHandle: connection.targetHandle,
        target: connection.source,
        targetHandle: connection.sourceHandle,
      }
    : {
        source: connection.source,
        sourceHandle: connection.sourceHandle,
        target: connection.target,
        targetHandle: connection.targetHandle,
      };
}
