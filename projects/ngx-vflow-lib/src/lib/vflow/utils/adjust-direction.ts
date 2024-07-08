import { ConnectionInternal } from "../interfaces/connection.internal.interface";

export function adjustDirection(connection: ConnectionInternal): ConnectionInternal {
  const result = {} as ConnectionInternal

  if (connection.sourceHandle.rawHandle.type === 'source') {
    result.source = connection.source
    result.sourceHandle = connection.sourceHandle
  } else {
    result.source = connection.target
    result.sourceHandle = connection.targetHandle
  }

  if (connection.targetHandle.rawHandle.type === 'target') {
    result.target = connection.target
    result.targetHandle = connection.targetHandle
  } else {
    result.target = connection.source
    result.targetHandle = connection.sourceHandle
  }

  return result
}
