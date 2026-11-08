/**
 * The curves registered with `withCurves()`, by key. Empty here; an application that wants the keys in `Edge.curve`
 * checked augments it:
 *
 * ```ts
 * declare module 'ngx-vflow' {
 *   interface VflowCurves {
 *     avoid: typeof avoidNodesCurve;
 *   }
 * }
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface VflowCurves {}

/** The curves the library ships, by name. */
export type BuiltInCurve = 'straight' | 'bezier' | 'smooth-step' | 'step';

export const BUILT_IN_CURVES: readonly BuiltInCurve[] = ['straight', 'bezier', 'smooth-step', 'step'];

/** A key of {@link VflowCurves}: any string until the interface is augmented, with the built-in names still offered. */
export type CurveKey = keyof VflowCurves extends never ? string & {} : keyof VflowCurves & string;
