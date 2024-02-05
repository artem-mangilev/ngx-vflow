export function isDefined<T>(data: T | undefined): data is T {
  return data !== undefined
}
