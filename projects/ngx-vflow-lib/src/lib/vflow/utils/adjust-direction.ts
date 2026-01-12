import { ConnectionInternal } from '../interfaces/connection.internal.interface';

/**
 * Adjust connection direction based on handle types.
 *
 *
 */
export function adjustDirection(connection: ConnectionInternal): ConnectionInternal {
  const sourceType = connection.sourceHandle.rawHandle.type;
  const targetType = connection.targetHandle.rawHandle.type;

  // If both handles are of the same type, preserve the original
  // source/target mapping
  if (sourceType === targetType) {
    return {
      source: connection.source,
      sourceHandle: connection.sourceHandle,
      target: connection.target,
      targetHandle: connection.targetHandle,
    };
  }

  const result = {} as ConnectionInternal;

  if (sourceType === 'source') {
    result.source = connection.source;
    result.sourceHandle = connection.sourceHandle;
  } else {
    result.source = connection.target;
    result.sourceHandle = connection.targetHandle;
  }

  if (targetType === 'target') {
    result.target = connection.target;
    result.targetHandle = connection.targetHandle;
  } else {
    result.target = connection.source;
    result.targetHandle = connection.sourceHandle;
  }

  return result;
}
