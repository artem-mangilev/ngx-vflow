import { ConnectionForValidation } from '../interfaces/connection-settings.interface';
import { Edge } from '../interfaces/edge.interface';
import { FeatureEntry } from './feature-entry.interface';
import { VflowContext } from './vflow-context';

/** A connection the user is about to make, with the edge it replaces when the gesture is a reconnection. */
export type ConnectionCandidate = ConnectionForValidation & {
  readonly reconnection: Edge | null;
  readonly gestureId: string;
};

/**
 * Decides whether a connection may be made: `true` allows, `false` denies, `null` passes to the next policy. The
 * chain stops at the first decision and allows when every policy passes.
 */
export interface ConnectionPolicy extends FeatureEntry {
  decide(candidate: ConnectionCandidate, context: VflowContext): boolean | null;
}
