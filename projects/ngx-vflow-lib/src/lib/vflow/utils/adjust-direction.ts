import { ConnectionInternal } from '../interfaces/connection.internal.interface';

/**
 * This function contains a hack-y behavior.
 * If the handles are of the same type (source-source or target-target),
 * it returns nodes where source === target and
 * handles where sourceHandle === targetHandle
 *
 * This leads to that notSelfValidator returns false for these cases,
 * exactly what we need for strict connection type
 */
export function adjustDirection(connection: ConnectionInternal): ConnectionInternal {
  const result = {} as ConnectionInternal;

  if (connection.sourceHandle.rawHandle.type === 'source') {
    result.source = connection.source;
    result.sourceHandle = connection.sourceHandle;
  } else {
    result.source = connection.target;
    result.sourceHandle = connection.targetHandle;
  }

  if (connection.targetHandle.rawHandle.type === 'target') {
    result.target = connection.target;
    result.targetHandle = connection.targetHandle;
  } else {
    result.target = connection.source;
    result.targetHandle = connection.sourceHandle;
  }

  return result;
}
