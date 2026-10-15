import { Connection } from '../interfaces/connection.interface';

/** Whether both connect the same handles; a missing handle id equals an empty one. */
export function sameConnection(a: Connection, b: Connection): boolean {
  return (
    a.source === b.source &&
    a.target === b.target &&
    (a.sourceHandle ?? '') === (b.sourceHandle ?? '') &&
    (a.targetHandle ?? '') === (b.targetHandle ?? '')
  );
}
