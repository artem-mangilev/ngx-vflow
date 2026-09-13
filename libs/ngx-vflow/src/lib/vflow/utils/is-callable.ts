export function isCallable(value: unknown): boolean {
  if (typeof value !== 'function') return false;
  return value.apply !== undefined;
}
