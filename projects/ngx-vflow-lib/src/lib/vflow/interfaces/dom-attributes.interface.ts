/** Metadata accepted on entity wrappers. Roles, state, focus and handlers are library-owned. */
export interface DomAttributes {
  title?: string | null;
  lang?: string | null;
  dir?: 'ltr' | 'rtl' | 'auto' | null;
  [name: `data-${string}`]: string | number | boolean | null | undefined;
}
