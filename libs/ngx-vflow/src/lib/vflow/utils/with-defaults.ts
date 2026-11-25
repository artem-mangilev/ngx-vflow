/**
 * `defaults` overridden by the entries of `value` that are set. Every settings object of the flow is read this way,
 * so an omitted key, or one set to `undefined`, means its default and not the value of the previous binding.
 */
export function withDefaults<T extends object>(defaults: T, value: Partial<T> | null | undefined): T {
  return { ...defaults, ...suppliedEntries(value) };
}

/** The entries of `value` that are set, tolerating a missing object from JavaScript. */
export function suppliedEntries<T extends object>(value: Partial<T> | null | undefined): Partial<T> {
  return Object.fromEntries(Object.entries(value ?? {}).filter(([, entry]) => entry !== undefined)) as Partial<T>;
}
