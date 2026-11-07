import { Connection } from '../interfaces/connection.interface';

/** Whether both connect the same handles; an empty handle id from the application counts as none. */
export function sameConnection(a: Connection, b: Connection): boolean {
  return (
    a.source === b.source &&
    a.target === b.target &&
    (a.sourceHandle || undefined) === (b.sourceHandle || undefined) &&
    (a.targetHandle || undefined) === (b.targetHandle || undefined)
  );
}
