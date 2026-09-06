export interface Contextable<T extends { $implicit: unknown }> {
  context: T;
}
