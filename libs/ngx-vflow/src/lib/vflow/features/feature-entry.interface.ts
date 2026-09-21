/**
 * Where an entry runs relative to the others on the same seam. Entries of a higher category run first; within a
 * category the position in the flattened provider array decides. Resolved once per flow.
 */
export type FeaturePrecedence = 'highest' | 'high' | 'default' | 'low' | 'lowest';

/** What every registration on a feature seam carries: a unique id and an optional precedence, `default` when omitted. */
export interface FeatureEntry {
  readonly id: string;
  readonly precedence?: FeaturePrecedence;
}
