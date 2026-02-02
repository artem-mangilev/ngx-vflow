/**
 * Validate at a typescript compiled level that all new /remove discriminated union type are implemented.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function assertIsUnreachable(x: never): never {
  throw new Error("Didn't expect to get here");
}
